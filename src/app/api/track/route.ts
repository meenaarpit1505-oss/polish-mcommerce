import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import {
  isValidCampaignId,
  SPONSOR_EVENT_TYPES,
  SPONSOR_LOCALES,
  SPONSOR_PLACEMENTS,
  type SponsorEventType,
  type SponsorPlacement,
} from "@/lib/sponsorship";

export interface TrackPayload {
  eventType: SponsorEventType;
  campaignId: string;
  placement: SponsorPlacement;
  locale: string;
}

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
      url.startsWith("http") &&
      url !== "your-supabase-url" &&
      key &&
      key !== "your-supabase-anon-key",
  );
}

function parseTrackPayload(body: unknown): TrackPayload | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Invalid payload." };
  }

  const { eventType, campaignId, placement, locale } = body as Record<string, unknown>;

  if (
    typeof eventType !== "string" ||
    !SPONSOR_EVENT_TYPES.includes(eventType as SponsorEventType)
  ) {
    return { error: "Invalid event type." };
  }

  if (typeof campaignId !== "string" || !isValidCampaignId(campaignId)) {
    return { error: "Invalid campaign ID." };
  }

  if (
    typeof placement !== "string" ||
    !SPONSOR_PLACEMENTS.includes(placement as SponsorPlacement)
  ) {
    return { error: "Invalid placement." };
  }

  if (typeof locale !== "string" || !SPONSOR_LOCALES.includes(locale as "pl" | "en")) {
    return { error: "Invalid locale." };
  }

  return {
    eventType: eventType as SponsorEventType,
    campaignId,
    placement: placement as SponsorPlacement,
    locale,
  };
}

export async function POST(request: Request) {
  try {
    const parsed = parseTrackPayload(await request.json());
    if ("error" in parsed) {
      return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });
    }

    const { eventType, campaignId, placement, locale } = parsed;

    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const { error } = await supabase.from("sponsor_analytics").insert([
        {
          campaign_id: campaignId,
          event_type: eventType,
          placement,
          locale,
        },
      ]);

      if (error) {
        console.warn("Error saving sponsor analytics in Supabase:", error.message);
      }
    } else {
      console.log("Supabase is not configured. Sponsor event (fallback log):", {
        campaignId,
        eventType,
        placement,
        locale,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Event tracked successfully.",
    });
  } catch (error) {
    console.error("Error in api/track endpoint:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 },
    );
  }
}

async function countEvents(
  supabase: Awaited<ReturnType<typeof createClient>>,
  campaignId: string,
  eventType: SponsorEventType,
  placement?: SponsorPlacement,
) {
  let query = supabase
    .from("sponsor_analytics")
    .select("id", { count: "exact", head: true })
    .eq("campaign_id", campaignId)
    .eq("event_type", eventType);

  if (placement) {
    query = query.eq("placement", placement);
  }

  const { count, error } = await query;
  if (error) {
    console.warn("Sponsor analytics count failed:", error.message);
    return 0;
  }

  return count ?? 0;
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 },
      );
    }

    const campaignId = new URL(request.url).searchParams.get("campaignId") ?? "";
    if (!isValidCampaignId(campaignId)) {
      return NextResponse.json(
        { success: false, error: "Invalid campaign ID." },
        { status: 400 },
      );
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { success: false, error: "Analytics storage is not configured." },
        { status: 503 },
      );
    }

    const supabase = await createClient();

    const [
      impressionsTop,
      impressionsCard,
      clicksTop,
      clicksCard,
      copiesTop,
      copiesCard,
    ] = await Promise.all([
      countEvents(supabase, campaignId, "impression", "top_banner"),
      countEvents(supabase, campaignId, "impression", "in_feed_card"),
      countEvents(supabase, campaignId, "click", "top_banner"),
      countEvents(supabase, campaignId, "click", "in_feed_card"),
      countEvents(supabase, campaignId, "copy", "top_banner"),
      countEvents(supabase, campaignId, "copy", "in_feed_card"),
    ]);

    const impressions = impressionsTop + impressionsCard;
    const clicks = clicksTop + clicksCard;
    const copies = copiesTop + copiesCard;

    return NextResponse.json({
      success: true,
      campaignId,
      totals: { impressions, clicks, copies },
      byPlacement: {
        top_banner: {
          impressions: impressionsTop,
          clicks: clicksTop,
          copies: copiesTop,
        },
        in_feed_card: {
          impressions: impressionsCard,
          clicks: clicksCard,
          copies: copiesCard,
        },
      },
    });
  } catch (error) {
    console.error("Error in api/track GET endpoint:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 },
    );
  }
}
