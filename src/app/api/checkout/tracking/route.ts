import { NextResponse } from "next/server";
import { trackMarketingEvent } from "@/lib/marketingService";

interface TrackingPayload {
  email?: string;
  eventName?: string;
  zgodaMarketingowa?: boolean;
  cartItems?: Array<{
    id: string;
    title: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  totalValue?: number;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function POST(request: Request) {
  try {
    const body: TrackingPayload = await request.json();
    const { email, eventName, cartItems, totalValue, zgodaMarketingowa } = body;

    // Validate email format
    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: "Nieprawidłowy adres e-mail." },
        { status: 400 }
      );
    }

    // Validate event name is present
    if (!eventName) {
      return NextResponse.json(
        { success: false, error: "Nazwa zdarzenia jest wymagana." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const isPurchase = eventName === "Completed Purchase";
    if (!isPurchase && zgodaMarketingowa !== true) {
      return NextResponse.json({
        success: true,
        skipped: true,
        message: "Zdarzenie marketingowe pominięte — brak zgody zgoda_marketingowa.",
      });
    }

    console.log(`[Checkout Tracking API] Event dispatched: "${eventName}" for ${cleanEmail}`);

    const trackingResult = await trackMarketingEvent({
      email: cleanEmail,
      eventName,
      cartItems: cartItems || [],
      totalValue: totalValue || 0
    });

    if (!trackingResult.success) {
      console.warn("[Checkout Tracking API] Event telemetry ingestion degraded:", trackingResult.error);
    }

    return NextResponse.json({
      success: true,
      message: `Zdarzenie telemetrii "${eventName}" zarejestrowane.`,
      eventId: `track_${Date.now()}`
    });

  } catch {
    console.error("[Checkout Tracking API] Failure inside handler");
    return NextResponse.json(
      { success: false, error: "Wystąpił błąd telemetryczny." },
      { status: 500 }
    );
  }
}
