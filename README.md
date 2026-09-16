# VistulaVogue (polish-mcommerce)

Independent publisher site recommending Nutriprofits partner products. Purchases complete on the partner store — this app does not collect card payments.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Nutriprofits Affiliate & Supabase Lead Integration

The **Skin Diagnostic Quiz**, product pages, and lead-magnet drawer capture emails and route visitors to real Nutriprofits `nplink.net` campaigns. Code defaults in `src/lib/affiliateRouter.ts` and `src/lib/catalog.ts` match `.env.example`, so quiz/CTA clicks work even before Vercel env is set.

**Catalog money pages** (always served from code, not Sanity):

| Slug | Product | Default nplink |
| --- | --- | --- |
| `/pl/products/shilajit-extreme` | Shilajit Extreme | `https://nplink.net/zj0o7ps8` |
| `/pl/products/silvets` | Silvets | `https://nplink.net/rsmetkhe` |
| `/pl/products/eyevita-plus` | Eyevita Plus | `https://nplink.net/68rypowt` |
| `/pl/products/matcha-extreme` | Matcha Extreme | `https://nplink.net/inmfcwwk` |

SEO: `/sitemap.xml` and `/robots.txt` are App Router metadata routes (`src/app/sitemap.ts`, `src/app/robots.ts`).

**Affiliate link mapping** (quiz + product CTAs):

| Env var | Default nplink | Used for |
| --- | --- | --- |
| `NEXT_PUBLIC_NUTRIPROFITS_LINK` | `https://nplink.net/zj0o7ps8` | Shilajit Extreme; unanswered quiz / primary CTA fallback |
| `NEXT_PUBLIC_MYLEAD_LINK` | `https://nplink.net/rsmetkhe` | Silvets; quiz skin-type fallback: mixed (`mieszana`) |
| `NEXT_PUBLIC_OFFER_ANTI_AGE` | `https://nplink.net/68rypowt` | Eyevita Plus; quiz goal: anti-age |
| `NEXT_PUBLIC_OFFER_ACNE_OILY` | `https://nplink.net/inmfcwwk` | Matcha Extreme; quiz goal: acne; oily skin (`tlusta`) |
| `NEXT_PUBLIC_OFFER_HYDRATION` | `https://nplink.net/5py84cbz` | Quiz goal: hydration; dry skin (`sucha`) |

Publisher contact: `meenaarpit907@gmail.com`. Site URL: `https://polish-mcommerce.vercel.app`.

To enable lead storage in a hosted production environment, follow the steps below:

### 1. Database Setup (Supabase)

Leads are saved securely via Next.js server actions. Setting up your database is required to store them:

1. Create a free account at [Supabase](https://supabase.com/).
2. Create a new project.
3. Open the **SQL Editor** in the Supabase Dashboard, create a new query, and copy-paste the entire contents of the `supabase_schema.sql` file located in the root of this project.
4. Click **Run** to generate the necessary tables (`leads`, `profiles`, `reviews`, `sponsor_analytics`), indexes, and user triggers.

### 2. Configure Environment Variables

You must set your production environment keys in your hosting provider's dashboard (e.g., Vercel or Netlify).

1. Refer to `.env.example` in the root of this project for all required variables.
2. Under **Project Settings -> Environment Variables**, add each of the keys listed in `.env.example` with your real campaign URLs and API credentials.
3. Specifically, configure:
   - The five `NEXT_PUBLIC_*` affiliate keys listed above (optional if you accept the code defaults).
   - `NEXT_PUBLIC_SITE_URL=https://polish-mcommerce.vercel.app`
   - `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY` — to link your database.
   - Keep `NEXT_PUBLIC_PAYMENTS_ENABLED=false` until a licensed gateway is wired.

### 3. Upload Your Freebie Guide

The lead magnet slide-up drawer triggers an automatic browser download of a PDF.

- Make sure to save your final, compiled guide as a PDF file at:
  `/public/guides/diet-blueprint.pdf`

---

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
