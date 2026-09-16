export const brand = {
  name: "VistulaVogue",
  tagline: {
    pl: "Rekomendacje produktów partnerskich w Polsce",
    en: "Partner product recommendations in Poland",
  },
  colors: {
    primary: "#10B981",
    primaryDark: "#059669",
    accent: "#0D9488",
    accentLight: "#F0FDF4",
    background: "#F8FAFC",
    surface: "#FFFFFF",
    foreground: "#0F172A",
    muted: "#64748B",
  },
} as const;

export type BrandColors = typeof brand.colors;
