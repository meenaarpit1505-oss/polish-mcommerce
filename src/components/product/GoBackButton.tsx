"use client";

import { useRouter } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

export function GoBackButton() {
  const router = useRouter();
  const t = useTranslations("products");

  return (
    <button
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
        } else {
          router.push("/");
        }
      }}
      className="inline-flex items-center gap-2 mb-6 text-sm font-bold text-muted hover:text-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg py-1.5 px-3 -ml-3 hover:bg-accent-light/10 cursor-pointer"
    >
      <ArrowLeft className="h-4 w-4" />
      {t("goBack")}
    </button>
  );
}
