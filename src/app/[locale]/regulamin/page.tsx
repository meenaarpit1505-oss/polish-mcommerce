import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function TermsPage({
  params,
}: PageProps<"/[locale]/regulamin">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold text-foreground">{t("termsTitle")}</h1>
      <p className="mt-4 text-muted leading-relaxed">{t("stubMessage")}</p>
      <Link
        href="/"
        className="mt-8 inline-block text-sm font-medium text-primary hover:underline"
      >
        ← {locale === "pl" ? "Powrót do sklepu" : "Back to store"}
      </Link>
    </div>
  );
}
