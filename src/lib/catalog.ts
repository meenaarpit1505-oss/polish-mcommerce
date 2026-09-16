import type { Category, Product, ProductDetail } from "@/lib/types";
import type { Locale } from "@/i18n/routing";
import {
  resolveAffiliateUrl,
  type AffiliateKey,
} from "@/lib/affiliateRouter";

/**
 * The four Nutriprofits offers this storefront recommends.
 * These records ship in code so Vercel can serve money pages without
 * Sanity content. Env vars still override the outbound nplink.
 */
interface CatalogDefinition {
  slug: string;
  affiliateKey: AffiliateKey;
  categoryPl: string;
  categoryEn: string;
  titlePl: string;
  titleEn: string;
  image: string;
  images: string[];
  pricePLN: number;
  priceEUR: number;
  originalPricePLN: number;
  originalPriceEUR: number;
  stockCount: number;
  descriptionPl: string;
  descriptionEn: string;
  specificationsPl: Array<{ key: string; value: string }>;
  specificationsEn: Array<{ key: string; value: string }>;
}

export const CATALOG_DEFINITIONS: CatalogDefinition[] = [
  {
    slug: "shilajit-extreme",
    affiliateKey: "nutriprofits",
    categoryPl: "witalnosc",
    categoryEn: "vitality",
    titlePl: "Shilajit Extreme",
    titleEn: "Shilajit Extreme",
    image:
      "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=1000&q=80",
    images: [
      "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=1000&q=80",
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1000&q=80",
    ],
    pricePLN: 199,
    priceEUR: 49,
    originalPricePLN: 249,
    originalPriceEUR: 59,
    stockCount: 8,
    descriptionPl:
      "Shilajit Extreme to suplement diety dla mężczyzn z opatentowanym ekstraktem PrimaVie® (himalajskie mumio), różeniec górski, cynk, selen i witaminę B6. Składniki wspierają utrzymanie prawidłowego poziomu testosteronu, wydolność i odporność na stres. Zakup i płatność odbywają się w sklepie partnera Nutriprofits.",
    descriptionEn:
      "Shilajit Extreme is a men’s supplement with patented PrimaVie® Himalayan shilajit, rhodiola, zinc, selenium, and vitamin B6. Ingredients support healthy testosterone, stamina, and stress resilience. Purchase and payment are completed on the Nutriprofits partner store.",
    specificationsPl: [
      { key: "Porcja", value: "2 kapsułki dziennie" },
      { key: "PrimaVie®", value: "200 mg mumio (shilajit)" },
      { key: "Pochodzenie", value: "Wyprodukowano w UE" },
      { key: "Zakup", value: "Sklep partnera Nutriprofits" },
    ],
    specificationsEn: [
      { key: "Serving", value: "2 capsules daily" },
      { key: "PrimaVie®", value: "200 mg shilajit extract" },
      { key: "Origin", value: "Made in the EU" },
      { key: "Purchase", value: "Nutriprofits partner store" },
    ],
  },
  {
    slug: "silvets",
    affiliateKey: "mylead",
    categoryPl: "odchudzanie",
    categoryEn: "weight-loss",
    titlePl: "Silvets",
    titleEn: "Silvets",
    image:
      "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=1000&q=80",
    images: [
      "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=1000&q=80",
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1000&q=80",
    ],
    pricePLN: 179,
    priceEUR: 42,
    originalPricePLN: 229,
    originalPriceEUR: 54,
    stockCount: 11,
    descriptionPl:
      "Silvets to tabletki wspomagające odchudzanie z jagodą acai, guaraną, zieloną herbatą, pieprzem cayenne, L-karnityną i BioPerine. Formuła ma wspierać metabolizm, energię i mniejsze łaknienie. Cena i płatność są ustalane w sklepie partnera — ta strona tylko rekomenduje ofertę.",
    descriptionEn:
      "Silvets is a weight-support tablet with acai berry, guarana, green tea, cayenne, L-carnitine, and BioPerine. The formula is positioned to support metabolism, energy, and appetite control. Price and payment are set on the partner store — this site only recommends the offer.",
    specificationsPl: [
      { key: "Forma", value: "Tabletki" },
      { key: "Kluczowe składniki", value: "Acai, guarana, zielona herbata, cayenne, L-karnityna" },
      { key: "Cel", value: "Wsparcie odchudzania" },
      { key: "Zakup", value: "Sklep partnera Nutriprofits" },
    ],
    specificationsEn: [
      { key: "Form", value: "Tablets" },
      { key: "Key ingredients", value: "Acai, guarana, green tea, cayenne, L-carnitine" },
      { key: "Goal", value: "Weight-management support" },
      { key: "Purchase", value: "Nutriprofits partner store" },
    ],
  },
  {
    slug: "eyevita-plus",
    affiliateKey: "offerAntiAge",
    categoryPl: "wzrok",
    categoryEn: "vision",
    titlePl: "Eyevita Plus",
    titleEn: "Eyevita Plus",
    image:
      "https://images.unsplash.com/photo-1498557850523-fd3d11555c41?w=1000&q=80",
    images: [
      "https://images.unsplash.com/photo-1498557850523-fd3d11555c41?w=1000&q=80",
      "https://images.unsplash.com/photo-1577803645773-f96470509666?w=1000&q=80",
    ],
    pricePLN: 169,
    priceEUR: 39,
    originalPricePLN: 219,
    originalPriceEUR: 51,
    stockCount: 9,
    descriptionPl:
      "Eyevita Plus to kompleks na zdrowie oczu z MaquiBright®, Lutelex® (luteina i zeaksantyna), borówką, miłorzębem oraz witaminami A, E, B2 i cynkiem. Składniki pomagają utrzymać prawidłowy wzrok i chronić oczy przy pracy przy ekranie. Zakup finalizujesz u partnera Nutriprofits.",
    descriptionEn:
      "Eyevita Plus is an eye-health complex with MaquiBright®, Lutelex® (lutein and zeaxanthin), bilberry, ginkgo, vitamins A, E, B2, and zinc. Ingredients help maintain normal vision and support eyes during screen time. You complete the purchase on the Nutriprofits partner store.",
    specificationsPl: [
      { key: "Porcja", value: "2 kapsułki dziennie" },
      { key: "Składniki", value: "9 składników, m.in. MaquiBright® i Lutelex®" },
      { key: "Cel", value: "Wsparcie wzroku" },
      { key: "Zakup", value: "Sklep partnera Nutriprofits" },
    ],
    specificationsEn: [
      { key: "Serving", value: "2 capsules daily" },
      { key: "Ingredients", value: "9 ingredients including MaquiBright® and Lutelex®" },
      { key: "Goal", value: "Vision support" },
      { key: "Purchase", value: "Nutriprofits partner store" },
    ],
  },
  {
    slug: "matcha-extreme",
    affiliateKey: "offerAcneOily",
    categoryPl: "herbata",
    categoryEn: "tea",
    titlePl: "Matcha Extreme",
    titleEn: "Matcha Extreme",
    image:
      "https://images.unsplash.com/photo-1515823662972-da6a2e4d3000?w=1000&q=80",
    images: [
      "https://images.unsplash.com/photo-1515823662972-da6a2e4d3000?w=1000&q=80",
      "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=1000&q=80",
    ],
    pricePLN: 149,
    priceEUR: 35,
    originalPricePLN: 199,
    originalPriceEUR: 46,
    stockCount: 14,
    descriptionPl:
      "Matcha Extreme to herbata matcha z dodatkiem spiruliny, Cacti-Nea™ (opuncja) i aceroli. Składniki pomagają utrzymać prawidłową masę ciała, wspierać metabolizm i zmniejszać uczucie zmęczenia. To rekomendacja afiliacyjna — płatność przyjmuje sklep partnera.",
    descriptionEn:
      "Matcha Extreme is matcha tea powder with spirulina, Cacti-Nea™ (prickly pear), and acerola. Ingredients help maintain a healthy body weight, support metabolism, and reduce tiredness. This is an affiliate recommendation — the partner store collects payment.",
    specificationsPl: [
      { key: "Forma", value: "Proszek do napoju (120 g)" },
      { key: "Porcja", value: "1 miarka (ok. 4 g) w 150–200 ml wody" },
      { key: "Certyfikat", value: "Składniki z rolnictwa ekologicznego (UE)" },
      { key: "Zakup", value: "Sklep partnera Nutriprofits" },
    ],
    specificationsEn: [
      { key: "Form", value: "Drink powder (120 g)" },
      { key: "Serving", value: "1 scoop (approx. 4 g) in 150–200 ml water" },
      { key: "Certification", value: "Organic-origin ingredients (EU)" },
      { key: "Purchase", value: "Nutriprofits partner store" },
    ],
  },
];

export const CATALOG_SLUGS = CATALOG_DEFINITIONS.map((item) => item.slug);

export function isCatalogSlug(slug: string): boolean {
  return CATALOG_SLUGS.includes(slug);
}

export function getCatalogCategories(locale: Locale): Category[] {
  const isEn = locale === "en";
  return [
    { _id: "cat-vitality", name: isEn ? "Vitality" : "Witalność", slug: isEn ? "vitality" : "witalnosc", icon: "sparkles", sortOrder: 1 },
    { _id: "cat-weight", name: isEn ? "Weight loss" : "Odchudzanie", slug: isEn ? "weight-loss" : "odchudzanie", icon: "sparkles", sortOrder: 2 },
    { _id: "cat-vision", name: isEn ? "Vision" : "Wzrok", slug: isEn ? "vision" : "wzrok", icon: "sparkles", sortOrder: 3 },
    { _id: "cat-tea", name: isEn ? "Tea" : "Herbata", slug: isEn ? "tea" : "herbata", icon: "utensils", sortOrder: 4 },
  ];
}

function toProduct(def: CatalogDefinition, locale: Locale): Product {
  const isEn = locale === "en";
  return {
    _id: `catalog-${def.slug}`,
    title: isEn ? def.titleEn : def.titlePl,
    slug: def.slug,
    pricePLN: def.pricePLN,
    priceEUR: def.priceEUR,
    originalPricePLN: def.originalPricePLN,
    originalPriceEUR: def.originalPriceEUR,
    image: def.image,
    category: isEn ? def.categoryEn : def.categoryPl,
    stockCount: def.stockCount,
    isFeatured: true,
    affiliateUrl: resolveAffiliateUrl(def.affiliateKey),
  };
}

export function getCatalogProducts(locale: Locale): Product[] {
  return CATALOG_DEFINITIONS.map((def) => toProduct(def, locale));
}

export function getCatalogProductDetail(
  slug: string,
  locale: string
): ProductDetail | null {
  const def = CATALOG_DEFINITIONS.find((item) => item.slug === slug);
  if (!def) return null;
  const isEn = locale === "en";
  const product = toProduct(def, locale === "en" ? "en" : "pl");
  return {
    ...product,
    images: def.images,
    description: isEn ? def.descriptionEn : def.descriptionPl,
    lowestPrice30DaysPLN: def.originalPricePLN,
    lowestPrice30DaysEUR: def.originalPriceEUR,
    specifications: isEn ? def.specificationsEn : def.specificationsPl,
    variants: [],
  };
}

export function getCatalogAffiliateUrl(slug: string): string | undefined {
  const def = CATALOG_DEFINITIONS.find((item) => item.slug === slug);
  if (!def) return undefined;
  return resolveAffiliateUrl(def.affiliateKey);
}

/** Catalog products always win for the four money-path SKUs. */
export function mergeWithCatalog(products: Product[], locale: Locale): Product[] {
  const catalog = getCatalogProducts(locale);
  const incoming = new Map(products.map((product) => [product.slug, product]));
  const mergedCatalog = catalog.map((item) => {
    const extra = incoming.get(item.slug);
    if (!extra) return item;
    return {
      ...item,
      ...extra,
      slug: item.slug,
      affiliateUrl: item.affiliateUrl,
      isFeatured: true,
    };
  });
  const extras = products.filter(
    (product) => !CATALOG_SLUGS.includes(product.slug)
  );
  return [...mergedCatalog, ...extras];
}
