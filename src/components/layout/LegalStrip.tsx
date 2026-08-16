import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function LegalStrip() {
  const t = await getTranslations("legal");

  return (
    <footer className="border-t border-accent/10 bg-surface py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-center sm:flex-row sm:justify-center sm:gap-6">
        <Link
          href="/regulamin"
          className="text-sm text-muted transition-colors hover:text-primary"
        >
          {t("terms")}
        </Link>
        <span className="hidden text-muted/40 sm:inline" aria-hidden="true">
          |
        </span>
        <Link
          href="/polityka-prywatnosci"
          className="text-sm text-muted transition-colors hover:text-primary"
        >
          {t("privacy")}
        </Link>
      </div>
    </footer>
  );
}
