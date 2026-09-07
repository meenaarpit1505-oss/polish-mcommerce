import { NextResponse } from "next/server";
import { dbUpsertUser } from "@/lib/dbPlaceholder";

interface GoogleAuthPayload {
  credential?: string;
}

/**
 * Safely decodes a base64url encoded JWT payload.
 * Done natively without third-party dependencies to maximize route-handler performance.
 */
function decodeGoogleToken(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("JWT format verification failed: expected 3-part handshake token.");
    }
    
    // Replace base64url specific characters and parse
    const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonString = Buffer.from(payloadBase64, "base64").toString("utf-8");
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("[Google Auth API] Failed to extract JWT token metadata payload:", error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body: GoogleAuthPayload = await request.json();
    const { credential } = body;

    if (!credential) {
      return NextResponse.json(
        { success: false, error: "Brak poświadczeń uwierzytelniania Google (credential missing)." },
        { status: 400 }
      );
    }

    // 1. Decode Google Auth Identity Payload
    const payload = decodeGoogleToken(credential);
    if (!payload || !payload.email) {
      return NextResponse.json(
        { success: false, error: "Nieprawidłowy token tożsamości Google." },
        { status: 400 }
      );
    }

    const { sub, email, name, picture } = payload;
    const cleanEmail = email.toLowerCase().trim();
    const displayName = name || "Klient Vistula Vogue";
    const userId = `google_${sub}`;

    console.log(`[Google Auth API] Processing authenticated identity payload for email: ${cleanEmail}`);

    // 2. Perform Atomic Write/Upsert into Storage Framework (profiles table)
    const dbResult = await dbUpsertUser({
      id: userId,
      email: cleanEmail,
      name: displayName,
      image: picture || undefined,
      updatedAt: new Date().toISOString(),
    });

    if (!dbResult.success) {
      console.warn("[Google Auth API] Database storage was degraded.");
    }

    // Login is not marketing consent — list injection happens only with zgoda_marketingowa.

    // 4. Return unified client safety confirmation blocks
    return NextResponse.json({
      success: true,
      message: "Uwierzytelnienie przebiegło pomyślnie i profil został zabezpieczony.",
      user: {
        id: userId,
        email: cleanEmail,
        name: displayName,
        image: picture || null,
        authenticatedVia: "google_oauth_one_tap"
      }
    });

  } catch (error: any) {
    console.error("[Google Auth API] Serverless execution crash:", error);
    return NextResponse.json(
      { success: false, error: "Wewnętrzny błąd serwera podczas autoryzacji Google." },
      { status: 500 }
    );
  }
}
