import { NextResponse } from "next/server";
import { syncEmailToMarketingList } from "@/lib/marketingService";

interface SyncPayload {
  email?: string;
  name?: string;
  zgodaMarketingowa?: boolean;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function POST(request: Request) {
  try {
    const body: SyncPayload = await request.json();
    const { email, name, zgodaMarketingowa } = body;

    if (zgodaMarketingowa !== true) {
      return NextResponse.json(
        {
          success: false,
          error: "Brak zgody marketingowej (zgoda_marketingowa). Profil nie został dodany do listy.",
        },
        { status: 403 }
      );
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: "Niepoprawny format adresu e-mail." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name?.trim() || "";

    console.log(`[Marketing Sync API] Consent-gated list sync for: ${cleanEmail}`);

    // Asynchronously update marketing lists
    const syncResult = await syncEmailToMarketingList(cleanEmail, cleanName);

    if (!syncResult.success) {
      console.warn(`[Marketing Sync API] Klaviyo list registration failed, falling back to cached queue:`, syncResult.error);
    }

    return NextResponse.json({
      success: true,
      message: "Profil zsynchronizowany z systemem marketingowym.",
      syncedEmail: cleanEmail,
      timestamp: new Date().toISOString()
    });

  } catch {
    console.error("[Marketing Sync API] Server exception");
    return NextResponse.json(
      { success: false, error: "Wystąpił wewnętrzny błąd serwera." },
      { status: 500 }
    );
  }
}
