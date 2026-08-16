"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export function TrustBar() {
  const t = useTranslations("trust");

  // Framer Motion variants for stagger-fade-in on scroll
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const trustItems = [
    {
      id: "inpost",
      label: t("inpost"),
      icon: (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFCC00] shadow-sm ring-1 ring-amber-400/20">
          {/* Custom InPost brand icon design */}
          <span className="font-extrabold text-black text-sm tracking-tight select-none">in</span>
        </div>
      ),
    },
    {
      id: "blik",
      label: t("blik"),
      icon: (
        <div className="flex h-10 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E30613] px-1.5 shadow-sm ring-1 ring-rose-500/20">
          {/* Custom BLIK pill logo design */}
          <span className="font-extrabold text-white text-xs tracking-tighter lowercase select-none">blik</span>
        </div>
      ),
    },
    {
      id: "delivery",
      label: t("freeDelivery"),
      icon: (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/25 text-primary shadow-sm">
          {/* Custom SVG local delivery truck icon */}
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2zm0 0h4l1 3H7l1-3h4zm7 5v4m0 0H3m18 0l-2-2m2 2l-2 2"
            />
          </svg>
        </div>
      ),
    },
  ];

  return (
    <section className="bg-[#070B16] border-y border-slate-800/80 py-4.5 w-full overflow-hidden transition-colors duration-300">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-around sm:gap-6"
        >
          {trustItems.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              className="flex items-center gap-4.5 rounded-2xl bg-[#111625] px-5 py-3 shadow-md sm:bg-transparent sm:p-0 sm:shadow-none transition-all duration-300 hover:scale-[1.02] sm:hover:scale-100"
            >
              {item.icon}
              <span className="text-sm font-bold text-slate-200 tracking-wide">
                {item.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
