import type { Product, ProductDetail } from "@/lib/types";
import type { Locale } from "@/i18n/routing";
import { isSanityConfigured, sanityClient } from "./client";
import { getMockHomeData } from "./mock-data";
import groq from "groq";

export const productBySlugQuery = groq`
  *[_type == "product" && locale == $locale && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    pricePLN,
    priceEUR,
    originalPricePLN,
    originalPriceEUR,
    "image": image.asset->url,
    "images": images[].asset->url,
    description,
    lowestPrice30DaysPLN,
    lowestPrice30DaysEUR,
    variants[] {
      name,
      options[] {
        value,
        visualValue,
        isAvailable
      }
    },
    specifications[] {
      key,
      value
    },
    category,
    stockCount,
    isFeatured
  }
`;

// This function dynamically enriches any simple product with rich detail fields for a premium demo look
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function enrichProductWithDetails(product: any, locale: string): ProductDetail {
  const isEn = locale === "en";

  // Specific detailed mocks for top products to make the PDP look stunning
  const detailedFields: Record<string, Partial<ProductDetail>> = {
    "kurtka-wiosenna": {
      images: [
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1000&q=80",
        "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=1000&q=80",
        "https://images.unsplash.com/photo-1544441893-675973e31985?w=1000&q=80"
      ],
      description: isEn 
        ? "Premium transition jacket, perfect for spring and autumn. Crafted from windproof and highly water-resistant fabric with a lightweight membrane. Features a modern tailored fit, storm-flap zipper enclosure, adjustable hood, and fleece-lined zippered hand pockets. Responsibly made in Europe with recycled shell materials."
        : "Wysokiej jakości kurtka przejściowa, idealna na wiosnę i jesień. Wykonana z wiatroszczelnego i wysoce wodoodpornego materiału z lekką membraną techniczną. Posiada nowoczesny, taliowany krój, zapięcie na zamek z listwą przeciwwiatrową, regulowany kaptur oraz kieszenie boczne wyściełane ciepłym polarem. Wyprodukowana odpowiedzialnie w Europie z materiałów z recyklingu.",
      lowestPrice30DaysPLN: 199,
      lowestPrice30DaysEUR: 46,
      specifications: isEn 
        ? [
            { key: "Material", value: "100% Recycled Polyester" },
            { key: "Water Resistance", value: "5000 mm H2O" },
            { key: "Origin", value: "Made in Poland" },
            { key: "Care", value: "Machine wash at 30°C" }
          ]
        : [
            { key: "Materiał", value: "100% Poliester z recyklingu" },
            { key: "Wodoodporność", value: "5000 mm słupa wody" },
            { key: "Pochodzenie", value: "Wyprodukowano w Polsce" },
            { key: "Pielęgnacja", value: "Prać w pralce w 30°C" }
          ]
    },
    "krem-do-twarzy": {
      images: [
        "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=1000&q=80",
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1000&q=80",
        "https://images.unsplash.com/photo-1617897903246-719242758050?w=1000&q=80"
      ],
      description: isEn
        ? "This 100% organic face cream delivers deep hydration and instant brightness to dry, tired skin. Rich in hyaluronic acid, cold-pressed jojoba oil, and chamomile flower extracts, it helps regenerate skin cells and prevent premature aging. Paraben-free, cruelty-free, and vegan-friendly."
        : "W 100% organiczny krem do twarzy zapewnia głębokie nawilżenie i natychmiastowe rozświetlenie suchej i zmęczonej skóry. Bogaty w kwas hialuronowy, tłoczony na zimno olejek jojoba oraz ekstrakty z kwiatów rumianku, wspomaga regenerację komórek skóry i zapobiega przedwczesnemu starzeniu. Wolny od parabenów, wegański i nietestowany na zwierzętach.",
      lowestPrice30DaysPLN: 99,
      lowestPrice30DaysEUR: 23,
      specifications: isEn
        ? [
            { key: "Volume", value: "50 ml" },
            { key: "Skin Type", value: "All, especially sensitive" },
            { key: "Key Ingredients", value: "Jojoba oil, chamomile, hyaluronic acid" },
            { key: "Certification", value: "Ecocert Organic" }
          ]
        : [
            { key: "Pojemność", value: "50 ml" },
            { key: "Typ skóry", value: "Każdy rodzaj, szczególnie wrażliwa" },
            { key: "Kluczowe składniki", value: "Olejek jojoba, rumianek, kwas hialuronowy" },
            { key: "Certyfikat", value: "Ecocert Organic" }
          ]
    },
    "sluchawki-pro": {
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&q=80",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1000&q=80"
      ],
      description: isEn
        ? "Wireless over-ear headphones with state-of-the-art hybrid Active Noise Cancellation (ANC). Engineered with 40mm custom dynamic drivers for crystal-clear highs and profound, thumping bass. Built-in dual-microphone system for clean hands-free calls. Up to 45 hours of non-stop playback on a single charge."
        : "Bezprzewodowe słuchawki nauszne z najnowocześniejszą, hybrydową Aktywną Redukcją Szumów (ANC). Wyposażone w specjalne przetworniki dynamiczne 40 mm zapewniające krystalicznie czyste wysokie tony i głęboki, pulsujący bas. Wbudowany podwójny system mikrofonów do czystych rozmów głośnomówiących. Do 45 godzin odtwarzania na jednym ładowaniu.",
      lowestPrice30DaysPLN: 159,
      lowestPrice30DaysEUR: 37,
      specifications: isEn
        ? [
            { key: "Battery Life", value: "Up to 45 hours (ANC off)" },
            { key: "Bluetooth Version", value: "v5.3 Low Energy" },
            { key: "Charging Port", value: "USB-C Fast Charging" },
            { key: "Driver Size", value: "40mm Dynamic" }
          ]
        : [
            { key: "Czas pracy baterii", value: "Do 45 godzin (bez ANC)" },
            { key: "Wersja Bluetooth", value: "v5.3 Low Energy" },
            { key: "Port ładowania", value: "Szybkie ładowanie USB-C" },
            { key: "Rozmiar przetwornika", value: "40 mm dynamiczny" }
          ]
    },
    "kawa-arabica": {
      images: [
        "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=1000&q=80",
        "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1000&q=80"
      ],
      description: isEn
        ? "Premium quality 100% Arabica whole coffee beans harvested at high altitudes in South America. Medium roast profile offering rich aroma and sweet, smooth flavor profile with distinct notes of dark chocolate and roasted almonds. Exceptionally low acidity makes it perfect for daily espresso or filter brewing."
        : "Najwyższej jakości kawa ziarnista 100% Arabica, zbierana na dużych wysokościach w Ameryce Południowej. Średni stopień palenia uwalnia bogaty aromat i słodki, gładki profil smakowy z wyraźnymi nutami ciemnej czekolady i prażonych migdałów. Wyjątkowo niska kwasowość czyni ją idealną do codziennego espresso lub parzenia alternatywnego.",
      lowestPrice30DaysPLN: 79,
      lowestPrice30DaysEUR: 18,
      specifications: isEn
        ? [
            { key: "Bean Type", value: "100% Arabica Single Origin" },
            { key: "Roast Level", value: "Medium (City Roast)" },
            { key: "Net Weight", value: "1000 g" },
            { key: "Flavour Notes", value: "Cocoa, honey, roasted hazelnuts" }
          ]
        : [
            { key: "Gatunek ziaren", value: "100% Arabica Single Origin" },
            { key: "Stopień palenia", value: "Średni (City Roast)" },
            { key: "Waga netto", value: "1000 g" },
            { key: "Nuty smakowe", value: "Kakao, miód, prażone orzechy laskowe" }
          ]
    }
  };

  const productDetails = detailedFields[product.slug] || {
    images: [product.image],
    description: isEn 
      ? `High quality ${product.title}. Made from durable premium materials. Perfect addition to your daily lifestyle with top-tier aesthetics.`
      : `Wysokiej jakości ${product.title}. Wykonany z trwałych materiałów najwyższej klasy. Doskonały dodatek do codziennego życia o wyjątkowej estetyce.`,
    lowestPrice30DaysPLN: Math.round(product.pricePLN * 0.9),
    lowestPrice30DaysEUR: Math.round(product.priceEUR * 0.9),
    specifications: isEn
      ? [
          { key: "Material", value: "Premium Ecological Blend" },
          { key: "Availability", value: "In Stock" },
          { key: "Warranty", value: "24 Months" }
        ]
      : [
          { key: "Materiał", value: "Ekologiczna mieszanka premium" },
          { key: "Dostępność", value: "W magazynie" },
          { key: "Gwarancja", value: "24 miesiące" }
        ]
  };

  return {
    ...product,
    images: productDetails.images || [product.image],
    description: productDetails.description,
    lowestPrice30DaysPLN: productDetails.lowestPrice30DaysPLN!,
    lowestPrice30DaysEUR: productDetails.lowestPrice30DaysEUR!,
    specifications: productDetails.specifications,
    variants: [
      {
        name: isEn ? "Color" : "Kolor",
        options: [
          { value: isEn ? "Olive Green" : "Oliwkowy", visualValue: "#556B2F", isAvailable: true },
          { value: isEn ? "Charcoal" : "Węgielny", visualValue: "#36454F", isAvailable: true },
          { value: isEn ? "Desert Sand" : "Piaskowy", visualValue: "#C2B280", isAvailable: product.stockCount > 5 }
        ]
      },
      {
        name: isEn ? "Size" : "Rozmiar",
        options: [
          { value: "S", isAvailable: true },
          { value: "M", isAvailable: true },
          { value: "L", isAvailable: true },
          { value: "XL", isAvailable: product.stockCount > 8 }
        ]
      }
    ]
  };
}

export async function fetchProductBySlug(slug: string, locale: string): Promise<ProductDetail | null> {
  // If Sanity is configured and client exists, try to query Sanity
  if (isSanityConfigured && sanityClient) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const product = await sanityClient.fetch<any | null>(productBySlugQuery, {
        slug,
        locale
      });
      if (product) {
        // Enforce fallback fields if any Sanity record is missing specific rich values
        const enriched = enrichProductWithDetails(product, locale);
        return enriched;
      }
    } catch (error) {
      console.error("Sanity product fetch error, falling back to mock data", error);
    }
  }

  // Fallback to local rich mock data matching the slug
  const mockHomeData = getMockHomeData(locale as Locale);
  const matchedProduct = mockHomeData.products.find((p) => p.slug === slug);

  if (!matchedProduct) {
    return null;
  }

  return enrichProductWithDetails(matchedProduct, locale);
}

export const suggestedProductsQuery = groq`
  *[_type == "product" && locale == $locale && slug.current != $slug && category == $category][0...4] {
    _id,
    title,
    "slug": slug.current,
    pricePLN,
    priceEUR,
    originalPricePLN,
    originalPriceEUR,
    "image": image.asset->url,
    category,
    stockCount,
    isFeatured
  }
`;

export async function fetchSuggestedProducts(
  currentSlug: string,
  category: string,
  locale: string
): Promise<Product[]> {
  if (isSanityConfigured && sanityClient) {
    try {
      const related = await sanityClient.fetch<Product[]>(suggestedProductsQuery, {
        slug: currentSlug,
        category,
        locale,
      });

      if (related && related.length >= 4) {
        return related;
      }

      // If we don't have enough matches in the same category, backfill with other featured products
      const backfillQuery = groq`
        *[_type == "product" && locale == $locale && slug.current != $slug && category != $category][0...4] {
          _id,
          title,
          "slug": slug.current,
          pricePLN,
          priceEUR,
          originalPricePLN,
          originalPriceEUR,
          "image": image.asset->url,
          category,
          stockCount,
          isFeatured
        }
      `;
      const backfill = await sanityClient.fetch<Product[]>(backfillQuery, {
        slug: currentSlug,
        category,
        locale,
      });

      const combined = [...(related || []), ...(backfill || [])];
      return combined.slice(0, 4);
    } catch (error) {
      console.error("Sanity suggestions fetch error, falling back to mock data", error);
    }
  }

  // Fallback to local rich mock data matching the category, and then general featured products
  const mockHomeData = getMockHomeData(locale as Locale);
  const related = mockHomeData.products.filter(
    (p) => p.slug !== currentSlug && p.category === category
  );

  if (related.length < 4) {
    const otherProducts = mockHomeData.products.filter(
      (p) => p.slug !== currentSlug && p.category !== category
    );
    related.push(...otherProducts.slice(0, 4 - related.length));
  }

  return related.slice(0, 4);
}
