import { createClient } from "next-sanity";
import type { Locale } from "@/i18n/routing";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_TOKEN;

export const isSanityConfigured = Boolean(projectId) && projectId !== "your-sanity-project-id";

export const sanityClient = isSanityConfigured
  ? createClient({
      projectId: projectId!,
      dataset,
      apiVersion: "2024-01-01",
      useCdn: true,
      token,
    })
  : null;

export type { Locale };
