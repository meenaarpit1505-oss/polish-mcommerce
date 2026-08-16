import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { fetchProductBySlug, fetchSuggestedProducts } from "@/lib/sanity/fetch-product";
import { getProductReviewsSummary } from "@/app/actions/reviews";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ProductDetailsAccordion } from "@/components/product/ProductDetailsAccordion";
import { TrustBar } from "@/components/home/TrustBar";
import { MobileStickyCart } from "@/components/product/MobileStickyCart";
import { ProductJsonLd } from "@/components/product/ProductJsonLd";
import { GoBackButton } from "@/components/product/GoBackButton";
import { ProductCard } from "@/components/product/ProductCard";
import type { Locale } from "@/i18n/routing";

interface ProductPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

// 1. Generate Metadata dynamically for maximum search engine performance (SEO)
export async function generateMetadata({ params }: ProductPageProps) {
  const { locale, slug } = await params;
  const product = await fetchProductBySlug(slug, locale);

  if (!product) {
    return {
      title: locale === "pl" ? "Produkt Nie Znaleziony" : "Product Not Found",
    };
  }

  const desc = product.description?.substring(0, 155) || product.title;

  return {
    title: `${product.title} | VistulaVogue`,
    description: desc,
    openGraph: {
      title: `${product.title} | VistulaVogue`,
      description: desc,
      images: [{ url: product.image, width: 1200, height: 630, alt: product.title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: desc,
      images: [product.image],
    },
  };
}

// 2. Main Page Render
export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  // Fetch product first to obtain category details
  const product = await fetchProductBySlug(slug, locale);

  if (!product) {
    notFound();
  }

  // Fetch reviews and category-based suggestions in parallel
  const reviewsPromise = getProductReviewsSummary(slug);
  const suggestedPromise = fetchSuggestedProducts(slug, product.category, locale);

  const [reviewsSummary, suggestedProducts] = await Promise.all([
    reviewsPromise,
    suggestedPromise,
  ]);

  const galleryImages = product.images && product.images.length > 0
    ? product.images
    : [product.image];

  return (
    <>
      {/* Structured Google Search Product Schema */}
      <ProductJsonLd
        product={product}
        averageRating={reviewsSummary.averageRating}
        reviewCount={reviewsSummary.totalCount}
        currency={locale === "pl" ? "PLN" : "EUR"}
      />

      <div className="bg-background min-h-screen">
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          
          {/* Go Back button placed cleanly at the top of the detail page */}
          <GoBackButton />

          <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12">
            
            {/* Left Column: Framer Motion Gallery Carousel (Col 1-7) */}
            <div className="lg:col-span-7">
              <ProductGallery images={galleryImages} title={product.title} />
            </div>

            {/* Right Column: Title, Review Star links, Swatches & Action button (Col 1-5) */}
            <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0 lg:col-span-5">
              <ProductInfo
                product={product}
                reviewsSummary={{
                  averageRating: reviewsSummary.averageRating,
                  totalCount: reviewsSummary.totalCount,
                }}
              />
              
              <ProductDetailsAccordion product={product} />
            </div>
          </div>

          {/* Suggested / Related Products (You May Also Like) Grid */}
          {suggestedProducts && suggestedProducts.length > 0 && (
            <section className="mt-16 border-t border-accent/10 pt-10">
              <h2 className="text-2xl font-black text-foreground tracking-tight mb-8">
                {locale === "pl" ? "Może Ci się spodobać" : "You May Also Like"}
              </h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
                {suggestedProducts.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            </section>
          )}

          {/* Social Trust Signal Bar */}
          <div className="mt-16 border-t border-accent/10 pt-8">
            <TrustBar />
          </div>

          {/* Dedicated Social Proof Reviews Area */}
          <section id="reviews" className="mt-16 border-t border-accent/10 pt-10 scroll-mt-20">
            <ProductReviews
              productId={product._id}
              initialReviews={reviewsSummary.reviews}
              ratingDistribution={reviewsSummary.distribution}
              averageRating={reviewsSummary.averageRating}
              totalReviews={reviewsSummary.totalCount}
            />
          </section>
        </main>
      </div>

      {/* Floating Mobile Sticky buy banner */}
      <MobileStickyCart product={product} />
    </>
  );
}
