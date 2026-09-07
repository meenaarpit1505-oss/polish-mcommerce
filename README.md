# Dream E-commerce

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

## MyLead Affiliate & Supabase Lead Integration

Your website is pre-engineered to capture leads from both the **Skin Diagnostic Quiz** and the **Free Gift / Lead Magnet Drawer**, automatically routing relevant customers to your **MyLead** and **Nutriprofits** campaigns.

To enable this integrations in a hosted production environment, follow the steps below:

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
   - `NEXT_PUBLIC_MYLEAD_LINK` - Your general MyLead partner link.
   - `NEXT_PUBLIC_OFFER_ACNE_OILY` - Your specific MyLead campaign link for acne/oily skin results.
   - `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY` - To link your database.

### 3. Upload Your Freebie Guide

The lead magnet slide-up drawer triggers an automatic browser download of a PDF.

- Make sure to save your final, compiled guide as a PDF file at:
  `/public/guides/diet-blueprint.pdf`

---

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
