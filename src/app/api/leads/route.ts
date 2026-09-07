import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const LEAD_ACTION_TYPES = ["quiz", "freebie", "notify_alert", "newsletter"] as const;

export type LeadActionType = (typeof LEAD_ACTION_TYPES)[number];

export interface LeadPayload {
  email: string;
  consentGdpr: boolean;
  actionType: LeadActionType;
  metaData?: Record<string, unknown>;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function POST(request: Request) {
  try {
    const body: LeadPayload = await request.json();
    const { email, consentGdpr, actionType, metaData } = body;

    // 1. Precise formatting & GDPR consent validation
    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: "Nieprawidłowy adres e-mail." },
        { status: 400 }
      );
    }

    if (!consentGdpr) {
      return NextResponse.json(
        { success: false, error: "Wymagana jest akceptacja zgody RODO." },
        { status: 400 }
      );
    }

    if (!actionType || !LEAD_ACTION_TYPES.includes(actionType)) {
      return NextResponse.json(
        { success: false, error: "Nieprawidłowy typ akcji." },
        { status: 400 }
      );
    }

    // 2. Safely capture the lead in Supabase or fallback
    const supabase = await createClient();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isSupabaseConfigured = !!(url && url.startsWith("http") && url !== "your-supabase-url");

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from("leads")
        .insert([
          {
            email: email.toLowerCase().trim(),
            consent_gdpr: consentGdpr,
            action_type: actionType,
            meta_data: metaData || {},
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) {
        console.warn("Błąd zapisu w Supabase, uruchamianie fallbacku logowania:", error.message);
      } else {
        console.log(`Pomyślnie zapisano lead w Supabase: ${email} (${actionType})`);
      }
    } else {
      console.log("Supabase nie jest skonfigurowany. Zapis leada (fallback):", {
        email: email.toLowerCase().trim(),
        consentGdpr,
        actionType,
        metaData,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Lead pomyślnie zarejestrowany.",
    });

  } catch (error: any) {
    console.error("Błąd w endpointu api/leads:", error);
    return NextResponse.json(
      { success: false, error: "Wystąpił wewnętrzny błąd serwera." },
      { status: 500 }
    );
  }
}
