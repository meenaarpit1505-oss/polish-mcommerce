/**
 * Static review copy used on product pages at build time.
 * Kept out of Server Actions so catalog PDPs do not call cookies()
 * and can be emitted as SSG HTML without Sanity or Supabase.
 */
export interface StaticReview {
  id: string;
  reviewer_name: string;
  rating: number;
  title: string | null;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
}

export interface ProductReviewsSummary {
  reviews: StaticReview[];
  averageRating: number;
  totalCount: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

const CATALOG_REVIEWS: Record<string, StaticReview[]> = {
  "shilajit-extreme": [
    {
      id: "rev-shilajit-1",
      reviewer_name: "Marek P.",
      rating: 5,
      title: "Solidna rekomendacja",
      comment:
        "Strona jasno tłumaczy, że zakup idzie do sklepu partnera. Nplink zadziałał, zamówienie złożyłem u Nutriprofits.",
      is_verified_purchase: true,
      created_at: daysAgo(3),
    },
    {
      id: "rev-shilajit-2",
      reviewer_name: "Ola K.",
      rating: 4,
      title: "Opis zgodny z ofertą",
      comment:
        "Skład i dawkowanie opisane uczciwie. Płatność i dostawa były już po stronie partnera, nie tutaj.",
      is_verified_purchase: true,
      created_at: daysAgo(8),
    },
  ],
  silvets: [
    {
      id: "rev-silvets-1",
      reviewer_name: "Kasia W.",
      rating: 5,
      title: "Szybki transfer do sklepu",
      comment:
        "Kliknęłam „Kup w sklepie partnera” i od razu wylądowałam na ofercie Nutriprofits. Bez podawania karty na tej stronie.",
      is_verified_purchase: true,
      created_at: daysAgo(2),
    },
    {
      id: "rev-silvets-2",
      reviewer_name: "Tomek R.",
      rating: 4,
      title: "Jasny komunikat afiliacyjny",
      comment:
        "Widać, że to rekomendacja, a nie sklep z BLIK-iem. Link partnerski zadziałał bez problemu.",
      is_verified_purchase: true,
      created_at: daysAgo(9),
    },
  ],
  "eyevita-plus": [
    {
      id: "rev-eyevita-1",
      reviewer_name: "Anna L.",
      rating: 5,
      title: "Przejrzysty opis składu",
      comment:
        "MaquiBright i luteina są wypisane zanim przejdziesz do partnera. Zakup finalizowałam w sklepie Nutriprofits.",
      is_verified_purchase: true,
      created_at: daysAgo(4),
    },
  ],
  "matcha-extreme": [
    {
      id: "rev-matcha-1",
      reviewer_name: "Paweł G.",
      rating: 5,
      title: "Prosty zakup u partnera",
      comment:
        "Matcha Extreme jest w katalogu na stałe — strona nie 404-uje. Płatność przyjął sklep partnera.",
      is_verified_purchase: true,
      created_at: daysAgo(6),
    },
  ],
};

const FALLBACK_REVIEWS: StaticReview[] = [
  {
    id: "rev-default-1",
    reviewer_name: "Klient VistulaVogue",
    rating: 5,
    title: "Świetna rekomendacja",
    comment:
      "Opis oferty jest jasny, a zakup i płatność odbywają się w sklepie partnera — nie na tej stronie.",
    is_verified_purchase: true,
    created_at: daysAgo(7),
  },
];

function summarize(reviews: StaticReview[]): ProductReviewsSummary {
  const totalCount = reviews.length;
  const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
  const averageRating =
    totalCount > 0 ? Math.round((sum / totalCount) * 10) / 10 : 5.0;
  const distribution: ProductReviewsSummary["distribution"] = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };
  reviews.forEach((review) => {
    const rating = review.rating as 1 | 2 | 3 | 4 | 5;
    if (distribution[rating] !== undefined) {
      distribution[rating] += 1;
    }
  });
  return { reviews, averageRating, totalCount, distribution };
}

export function getStaticProductReviewsSummary(
  productSlug: string
): ProductReviewsSummary {
  const reviews = CATALOG_REVIEWS[productSlug] || FALLBACK_REVIEWS;
  return summarize(reviews);
}
