import type { ProductDetail } from "@/lib/types";

interface ProductJsonLdProps {
  product: ProductDetail;
  averageRating: number;
  reviewCount: number;
  currency: "PLN" | "EUR";
}

export function ProductJsonLd({ product, averageRating, reviewCount, currency }: ProductJsonLdProps) {
  const price = currency === "PLN" ? product.pricePLN : product.priceEUR;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "image": product.image,
    "description": product.description || product.title,
    "sku": product._id,
    "offers": {
      "@type": "Offer",
      "url": `https://vistulavogue.pl/products/${product.slug}`,
      "priceCurrency": currency,
      "price": price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stockCount > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    ...(reviewCount > 0 && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": averageRating,
        "reviewCount": reviewCount,
        "bestRating": "5",
        "worstRating": "1"
      }
    })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
