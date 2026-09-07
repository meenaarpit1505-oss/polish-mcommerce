import { defineField, defineType } from "sanity";

export const heroBanner = defineType({
  name: "heroBanner",
  title: "Hero Banner",
  type: "object",
  fields: [
    defineField({ name: "headline", title: "Headline", type: "string" }),
    defineField({ name: "subheadline", title: "Subheadline", type: "string" }),
    defineField({ name: "ctaLabel", title: "CTA Label", type: "string" }),
    defineField({ name: "ctaHref", title: "CTA Link", type: "string" }),
    defineField({
      name: "secondaryMessage",
      title: "Secondary Message",
      type: "text",
    }),
    defineField({
      name: "backgroundImage",
      title: "Background Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "campaignType",
      title: "Campaign Type",
      type: "string",
      options: {
        list: [
          { title: "Sale", value: "sale" },
          { title: "Launch", value: "launch" },
          { title: "Seasonal", value: "seasonal" },
        ],
      },
    }),
  ],
});

export const category = defineType({
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name" } }),
    defineField({ name: "icon", title: "Icon (emoji or lucide name)", type: "string" }),
    defineField({ name: "sortOrder", title: "Sort Order", type: "number" }),
    defineField({
      name: "marketShareNote",
      title: "Market Share Note",
      type: "string",
    }),
    defineField({
      name: "locale",
      title: "Locale",
      type: "string",
      options: { list: ["pl", "en"] },
    }),
  ],
  orderings: [{ title: "Sort Order", name: "sortOrderAsc", by: [{ field: "sortOrder", direction: "asc" }] }],
});

export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" } }),
    defineField({ name: "pricePLN", title: "Price (PLN)", type: "number" }),
    defineField({ name: "priceEUR", title: "Price (EUR)", type: "number" }),
    defineField({ name: "originalPricePLN", title: "Original Price (PLN)", type: "number" }),
    defineField({ name: "originalPriceEUR", title: "Original Price (EUR)", type: "number" }),
    defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true } }),
    defineField({ name: "category", title: "Category", type: "string" }),
    defineField({ name: "stockCount", title: "Stock Count", type: "number" }),
    defineField({ name: "isFeatured", title: "Featured", type: "boolean" }),
    defineField({
      name: "locale",
      title: "Locale",
      type: "string",
      options: { list: ["pl", "en"] },
    }),
  ],
});

export const promoSection = defineType({
  name: "promoSection",
  title: "Promo Section",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "endsAt", title: "Ends At", type: "datetime" }),
    defineField({ name: "showStockIndicator", title: "Show Stock Indicator", type: "boolean" }),
    defineField({ name: "showRecentPurchases", title: "Show Recent Purchases", type: "boolean" }),
  ],
});

export const recentPurchase = defineType({
  name: "recentPurchase",
  title: "Recent Purchase",
  type: "object",
  fields: [
    defineField({ name: "city", title: "City", type: "string" }),
    defineField({ name: "product", title: "Product", type: "string" }),
  ],
});

export const home = defineType({
  name: "home",
  title: "Home Page",
  type: "document",
  fields: [
    defineField({
      name: "locale",
      title: "Locale",
      type: "string",
      options: { list: ["pl", "en"] },
    }),
    defineField({ name: "hero", title: "Hero", type: "heroBanner" }),
    defineField({
      name: "promo",
      title: "Promo Section",
      type: "promoSection",
    }),
    defineField({
      name: "recentPurchases",
      title: "Recent Purchases",
      type: "array",
      of: [{ type: "recentPurchase" }],
    }),
  ],
});

export const sponsorCampaign = defineType({
  name: "sponsorCampaign",
  title: "Sponsor Campaign",
  type: "document",
  fieldsets: [
    { name: "identity", title: "Campaign identity" },
    { name: "topBanner", title: "Top-of-page banner" },
    { name: "inFeedCard", title: "In-feed sponsored card" },
  ],
  fields: [
    defineField({
      name: "campaignId",
      title: "Campaign ID",
      type: "string",
      fieldset: "identity",
      description:
        "Stable ID used for analytics and dismiss state, e.g. lancerto-sep-2026. Change this when a new paid month starts so returning visitors see the new banner.",
      validation: (Rule) =>
        Rule.required()
          .max(80)
          .regex(/^[a-zA-Z0-9._-]+$/, {
            name: "campaign id",
            invert: false,
          }),
    }),
    defineField({
      name: "brandName",
      title: "Brand Name",
      type: "string",
      fieldset: "identity",
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: "isActive",
      title: "Is Active",
      type: "boolean",
      fieldset: "identity",
      description:
        "The storefront shows the first active campaign for each locale. Turn this on when the sponsor's paid month starts.",
      initialValue: false,
    }),
    defineField({
      name: "locale",
      title: "Locale",
      type: "string",
      fieldset: "identity",
      options: { list: ["pl", "en"] },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "topBannerPromoCode",
      title: "Promo Code",
      type: "string",
      fieldset: "topBanner",
    }),
    defineField({
      name: "topBannerEndDate",
      title: "End Date",
      type: "datetime",
      fieldset: "topBanner",
    }),
    defineField({
      name: "topBannerPerk",
      title: "Perk",
      type: "string",
      fieldset: "topBanner",
      description: "e.g. -15% on everything + free shipping",
    }),
    defineField({
      name: "topBannerOfferDescription",
      title: "Offer Description",
      type: "string",
      fieldset: "topBanner",
    }),
    defineField({
      name: "topBannerLink",
      title: "Link",
      type: "string",
      fieldset: "topBanner",
      description: "Internal path (/?search=Brand#produkty) or full https URL.",
    }),
    defineField({
      name: "cardPromoCode",
      title: "Promo Code",
      type: "string",
      fieldset: "inFeedCard",
    }),
    defineField({
      name: "cardProductTitle",
      title: "Product Title",
      type: "string",
      fieldset: "inFeedCard",
    }),
    defineField({
      name: "cardProductImage",
      title: "Product Image",
      type: "image",
      fieldset: "inFeedCard",
      options: { hotspot: true },
    }),
    defineField({
      name: "cardOriginalPricePLN",
      title: "Original Price (PLN)",
      type: "number",
      fieldset: "inFeedCard",
    }),
    defineField({
      name: "cardPromoPricePLN",
      title: "Promo Price (PLN)",
      type: "number",
      fieldset: "inFeedCard",
    }),
    defineField({
      name: "cardOriginalPriceEUR",
      title: "Original Price (EUR)",
      type: "number",
      fieldset: "inFeedCard",
    }),
    defineField({
      name: "cardPromoPriceEUR",
      title: "Promo Price (EUR)",
      type: "number",
      fieldset: "inFeedCard",
    }),
    defineField({
      name: "cardDescription",
      title: "Description",
      type: "text",
      fieldset: "inFeedCard",
    }),
    defineField({
      name: "cardLink",
      title: "Link",
      type: "string",
      fieldset: "inFeedCard",
      description: "Internal path or full https URL.",
    }),
    defineField({
      name: "paczkomatCutoffHour",
      title: "Paczkomat Cutoff Hour",
      type: "number",
      fieldset: "inFeedCard",
      description: "Hour of day (0-23) used for the same-day shipping countdown.",
      validation: (Rule) => Rule.min(0).max(23),
      initialValue: 16,
    }),
  ],
  preview: {
    select: {
      title: "brandName",
      campaignId: "campaignId",
      locale: "locale",
      isActive: "isActive",
      media: "cardProductImage",
    },
    prepare({ title, campaignId, locale, isActive, media }) {
      return {
        title: title || "Untitled campaign",
        subtitle: `${isActive ? "Active" : "Inactive"} · ${locale || "?"} · ${campaignId || "no-id"}`,
        media,
      };
    },
  },
});

export const schemaTypes = [heroBanner, category, product, promoSection, recentPurchase, home, sponsorCampaign];
