"use client";

import { useState, useEffect } from "react";
import { Search, ShoppingBag, LogOut, User, LogIn, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { brand } from "@/config/theme";
import { Link } from "@/i18n/navigation";
import { LocaleCurrencySwitcher } from "./LocaleCurrencySwitcher";
import { ThemeToggle } from "../ui/ThemeToggle";
import { getCurrentUserAction, logOutAction } from "@/app/actions/auth";
import type { AuthenticatedUser } from "@/lib/auth";
import { AnimatePresence, motion } from "framer-motion";

export function Header() {
  const t = useTranslations("header");
  const tLogin = useTranslations("login");
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  useEffect(() => {
    async function loadSession() {
      try {
        const result = await getCurrentUserAction();
        if (result.success && result.user) {
          setUser(result.user);
        }
      } catch (err) {
        console.error("Failed to load session user:", err);
      }
    }
    loadSession();
  }, []);

  // Close mobile menus on screen size increase
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setIsMobileMenuOpen(false);
        setIsMobileSearchOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      const result = await logOutAction();
      if (result.success) {
        setUser(null);
        window.location.reload();
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <header className="sticky top-0 z-50 overflow-x-clip border-b border-slate-200/80 dark:border-slate-800/80 bg-surface/95 backdrop-blur-md transition-colors duration-300">
      <div className="relative mx-auto flex max-w-6xl min-w-0 items-center justify-between gap-1.5 px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3">
        
        {/* Animated Mobile Search Overlay */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-x-0 top-0 bottom-0 z-50 flex items-center bg-[#0B132B] px-3"
            >
              <div className="flex w-full items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none cursor-pointer"
                  aria-label="Close search"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    autoFocus
                    placeholder={t("search")}
                    className="w-full rounded-full border-none bg-[#1C2541] py-2 pl-10 pr-4 text-sm text-white placeholder-slate-400 outline-none transition-colors ring-1 ring-slate-700 focus:ring-2 focus:ring-primary"
                    aria-label={t("search")}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Brand / Logo - High-contrast Mint Green text (#10B981) */}
        <Link href="/" className="shrink-0 z-10">
          <span className="text-xl font-extrabold tracking-tight text-primary hover:brightness-110 transition-all sm:text-2xl">
            VistulaVogue
          </span>
        </Link>

        {/* Desktop Search Bar (Deep navy pill-shaped bar with subtle magnifier) */}
        <div className="relative hidden flex-1 max-w-md mx-4 sm:block">
          <div className="relative">
            <input
              type="search"
              placeholder={t("search")}
              className="w-full rounded-full border-none bg-[#0B132B] py-2 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-400 outline-none ring-1 ring-slate-800 transition-all focus:ring-2 focus:ring-primary"
              aria-label={t("search")}
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 sm:gap-3">
          
          {/* Desktop-Only Controls */}
          <div className="hidden sm:flex items-center gap-3">
            <ThemeToggle />
            <LocaleCurrencySwitcher />

            {user ? (
              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <span className="text-xs font-semibold text-foreground/80 hidden md:inline-flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-primary" />
                  {t("welcome", { name: user.fullName.split(" ")[0] })}
                </span>
                <button
                  onClick={handleLogout}
                  aria-label={t("logout")}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center gap-1.5 rounded-full border border-primary/20 bg-transparent text-xs font-semibold text-primary hover:text-white transition-all hover:bg-primary hover:shadow-[0_0_12px_rgba(16,185,129,0.3)] focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer sm:h-auto sm:w-28 sm:py-1.5"
                >
                  <LogOut className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
                  <span className="hidden sm:inline">{t("logout")}</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                aria-label={tLogin("submit")}
                className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1 rounded-full bg-primary px-5 py-2 text-xs font-bold text-white shadow-[0_4px_12px_rgba(16,185,129,0.2)] hover:bg-primary-dark hover:shadow-[0_4px_20px_rgba(16,185,129,0.4)] transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <span>{tLogin("submit")}</span>
              </Link>
            )}
          </div>

          {/* Mobile-Only Search Button */}
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(true)}
            className="rounded-full p-1.5 text-foreground transition-colors hover:bg-accent-light/30 sm:hidden cursor-pointer"
            aria-label="Open search"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Cart Icon (Always Visible with Modern Badge) */}
          <button
            type="button"
            aria-label={t("cart")}
            className="relative shrink-0 rounded-full p-1.5 text-foreground transition-colors hover:bg-accent-light/30 sm:p-2 cursor-pointer"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white ring-2 ring-surface">
              2
            </span>
          </button>

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-full p-1.5 text-foreground transition-colors hover:bg-accent-light/30 focus:outline-none sm:hidden cursor-pointer"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Smooth Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="border-t border-accent/10 bg-surface/98 backdrop-blur-lg px-4 py-5 sm:hidden space-y-5"
          >
            {/* Quick Actions (Theme & Language Switcher Cards) */}
            <div className="grid grid-cols-2 gap-3 pb-2">
              <div className="flex flex-col gap-2 rounded-xl border border-accent/5 bg-background/50 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Theme</span>
                <div className="flex items-center justify-start h-8">
                  <ThemeToggle />
                </div>
              </div>
              <div className="flex flex-col gap-2 rounded-xl border border-accent/5 bg-background/50 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Language</span>
                <div className="flex items-center justify-start h-8">
                  <LocaleCurrencySwitcher />
                </div>
              </div>
            </div>

            {/* Authentication Action Container */}
            <div className="pt-2 border-t border-accent/10">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1 text-xs font-semibold text-foreground/80">
                    <User className="h-4 w-4 text-primary" />
                    {t("welcome", { name: user.fullName.split(" ")[0] })}
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-primary/20 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-white cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t("logout")}</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-dark"
                >
                  <LogIn className="h-4 w-4" />
                  <span>{tLogin("submit")}</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
