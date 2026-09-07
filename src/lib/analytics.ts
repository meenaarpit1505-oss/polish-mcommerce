import type { SponsorEventType, SponsorPlacement } from "@/lib/sponsorship";

/**
 * Lightweight client-side analytics for paying sponsor banners.
 * Events are posted to /api/track and stored in Supabase when configured.
 */
export function trackSponsorEvent(params: {
  eventType: SponsorEventType;
  campaignId: string;
  placement: SponsorPlacement;
  locale: string;
}) {
  try {
    fetch("/api/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
      keepalive: true,
    }).catch((err) => {
      console.warn("Sponsorship tracking request failed:", err);
    });
  } catch (err) {
    console.warn("Sponsorship tracking failed:", err);
  }
}
