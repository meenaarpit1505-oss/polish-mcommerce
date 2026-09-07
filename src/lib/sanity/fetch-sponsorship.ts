import { cache } from "react";
import type { SponsorCampaign } from "@/lib/types";
import { isSanityConfigured, sanityClient } from "./client";
import { activeSponsorshipQuery } from "./queries";
import { getMockSponsorshipData } from "./mock-data";

function isUsableCampaign(campaign: SponsorCampaign | null): campaign is SponsorCampaign {
  return Boolean(campaign?.campaignId && campaign.brandName);
}

export const fetchActiveSponsorship = cache(
  async (locale: string): Promise<SponsorCampaign | null> => {
    if (!isSanityConfigured || !sanityClient) {
      return getMockSponsorshipData(locale);
    }

    try {
      const sponsorship = await sanityClient.fetch<SponsorCampaign | null>(
        activeSponsorshipQuery,
        { locale },
      );

      return isUsableCampaign(sponsorship) ? sponsorship : null;
    } catch (error) {
      console.error("Sanity sponsorship fetch error, falling back to mock data", error);
      return getMockSponsorshipData(locale);
    }
  },
);
