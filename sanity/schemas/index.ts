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

export const schemaTypes = [heroBanner, category, product, promoSection, recentPurchase, home];
