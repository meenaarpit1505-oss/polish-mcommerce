"use client";

import { useTheme } from "@/providers/ThemeProvider";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/20 bg-surface text-foreground shadow-xs transition-colors hover:bg-accent-light/20 focus:outline-none cursor-pointer sm:h-9 sm:w-9"
      aria-label="Toggle Theme"
    >
      {/* Render both icons every time. Visibility follows the html.dark class
          (set before paint), so SSR HTML matches hydration even if Header
          streams in after ThemeProvider has already resolved localStorage. */}
      <Sun className="h-5 w-5 text-amber-500 hidden dark:block" aria-hidden />
      <Moon className="h-5 w-5 text-indigo-900 dark:hidden" aria-hidden />
    </button>
  );
}
