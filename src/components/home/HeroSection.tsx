"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import type { HeroBanner } from "@/lib/types";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Link } from "@/i18n/navigation";

interface HeroSectionProps {
  hero: HeroBanner;
}

export function HeroSection({ hero }: HeroSectionProps) {
  const t = useTranslations("hero");
  const tCommon = useTranslations("common");
  const [expanded, setExpanded] = useState(false);

  // Animation configuration for entrance stagger
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 18,
      },
    },
  };

  return (
    <section className="relative overflow-hidden w-full bg-[#0B0F19] min-h-130 sm:min-h-145 md:min-h-160 flex items-center">
      {/* Background Image with Sophisticated Monochrome/Grayscale Contrast Filter */}
      <div className="absolute inset-0 z-0">
        <Image
          src={hero.backgroundImage}
          alt={hero.headline}
          fill
          priority
          sizes="100vw"
          className="object-cover grayscale contrast-125 brightness-[0.55] dark:brightness-[0.35] transition-all duration-700"
        />
        {/* Navy/Slate Luxury Linear Masking */}
        <div className="absolute inset-0 bg-linear-to-r from-[#0B0F19] via-[#0B0F19]/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-[#0B0F19] to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl w-full px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-2xl text-left"
        >
          {/* Pulsing Bright Mint Green "SALE" Campaign Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-3.5 py-1 text-xs font-bold tracking-widest text-primary border border-primary/35 mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="uppercase">{hero.campaignType === "sale" ? "Wyprzedaż / Sale" : hero.campaignType}</span>
          </motion.div>

          {/* Large Headline with Left-Aligned, High-Impact White Typography */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl leading-tight"
          >
            {hero.headline}
          </motion.h1>

          {/* High-Contrast Subheadline Text */}
          <motion.p
            variants={itemVariants}
            className="mt-4 max-w-lg text-base text-slate-200 sm:text-xl leading-relaxed font-medium"
          >
            {hero.subheadline}
          </motion.p>

          {/* Call to Actions (CTAs): Dominant Mint Green pill with Magnetic state and Secondary link */}
          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-wrap items-center gap-5"
          >
            <MagneticButton as="a" href={hero.ctaHref}>
              <div className="relative group overflow-hidden rounded-full bg-primary px-8 py-3.5 text-sm font-extrabold text-[#0B0F19] shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.65)] transition-all duration-300">
                {/* Elegant sparkle slide overlay on hover */}
                <span className="absolute inset-0 w-full h-full bg-white/25 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#0B0F19] animate-pulse" />
                  {hero.ctaLabel}
                </span>
              </div>
            </MagneticButton>

            <Link href="/quiz" className="inline-block">
              <MagneticButton as="button">
                <div className="relative group overflow-hidden rounded-full border border-primary/40 hover:border-primary bg-primary/10 px-8 py-3.5 text-sm font-extrabold text-primary shadow-md hover:shadow-lg transition-all duration-300">
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                    {t("quizCta")}
                  </span>
                </div>
              </MagneticButton>
            </Link>

            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 hover:border-slate-400 bg-transparent px-6 py-3.5 text-sm font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer"
              aria-expanded={expanded}
            >
              {tCommon("learnMore")}
              <ChevronDown
                className={`h-4 w-4 text-slate-300 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
              />
            </button>
          </motion.div>

          {/* Smooth drop-down detailing secondary promotional offer messages */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="max-w-xl rounded-2xl bg-white/10 p-5 text-sm leading-relaxed text-slate-200 backdrop-blur-md border border-white/10 shadow-lg">
                  {hero.secondaryMessage}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Disclosure hint info at the footer of Hero */}
          <motion.p
            variants={itemVariants}
            className="mt-6 text-[11px] font-medium tracking-wide text-slate-400/80 uppercase"
          >
            {t("disclosureHint")}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
