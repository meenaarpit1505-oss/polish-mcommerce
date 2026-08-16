export const brand = {
  name: "VistulaVogue",
  tagline: {
    pl: "Twój sklep online w Polsce",
    en: "Your online store in Poland",
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
