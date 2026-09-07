import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function PrivacyPage({
  params,
}: PageProps<"/[locale]/polityka-prywatnosci">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");

  const sections = [
    "controller",
    "purpose",
    "sharing",
    "retention",
    "rights",
    "cookies",
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Premium Header Banner */}
      <div className="relative border-b border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 py-16 px-4 text-center backdrop-blur-md">
        <div className="mx-auto max-w-4xl">
          <span className="inline-flex items-center rounded-full bg-primary/10 dark:bg-primary/20 px-3 py-1 text-xs font-semibold text-primary mb-4">
            🛡️ {locale === "pl" ? "Zaufanie i RODO" : "Privacy & GDPR Compliant"}
          </span>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl bg-linear-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            {t("privacyTitle")}
          </h1>
          <p className="mt-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {t("lastUpdated")}
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            {t("privacyIntroText")}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          
          {/* Sticky Sidebar Navigation (Table of Contents) */}
          <aside className="lg:col-span-3">
            <div className="sticky top-28 hidden lg:block space-y-6">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-6 backdrop-blur-sm shadow-sm">
                <h2 className="text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-4">
                  {locale === "pl" ? "Spis Treści" : "Table of Contents"}
                </h2>
                <nav className="flex flex-col space-y-1">
                  {sections.map((section) => (
                    <a
                      key={section}
                      href={`#${section}`}
                      className="group flex items-center border-l-2 border-slate-200 dark:border-slate-800 py-2 pl-4 text-sm font-medium text-slate-500 dark:text-slate-400 transition-all hover:border-primary hover:text-primary dark:hover:text-primary-foreground"
                    >
                      <span className="truncate group-hover:translate-x-0.5 transition-transform duration-200">
                        {t(`privacySections.${section}.title`)}
                      </span>
                    </a>
                  ))}
                </nav>
              </div>
              <div className="pl-4">
                <Link
                  href="/"
                  className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  ← {locale === "pl" ? "Powrót do sklepu" : "Back to store"}
                </Link>
              </div>
            </div>
          </aside>

          {/* Core Content: Dual-Column Legalese & Plain English */}
          <main className="lg:col-span-9 space-y-10">
            {sections.map((section) => (
              <section
                key={section}
                id={section}
                className="scroll-mt-28 rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/40 p-6 sm:p-8 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700/80 hover:bg-white/80 dark:hover:bg-slate-900/60"
              >
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white md:text-2xl border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                  {t(`privacySections.${section}.title`)}
                </h2>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  {/* Left Column: Formal Legal Text */}
                  <div className="space-y-3">
                    <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border border-slate-200/50 dark:border-slate-700/40">
                      ⚖️ {locale === "pl" ? "Język Prawny" : "Official Legalese"}
                    </span>
                    <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                      {t(`privacySections.${section}.legal`)}
                    </p>
                  </div>

                  {/* Right Column: Friendly Human Summary */}
                  <div className="relative rounded-xl border border-primary/10 bg-primary/5 p-6 dark:border-primary/20 dark:bg-primary/5 shadow-inner">
                    <div className="absolute -top-3 left-4 inline-flex items-center rounded-full bg-primary/15 dark:bg-primary/25 px-3 py-0.5 text-[10px] font-extrabold text-primary uppercase tracking-widest">
                      💡 {locale === "pl" ? "W skrócie po ludzku" : "Plain English Summary"}
                    </div>
                    <p className="text-sm font-semibold leading-relaxed text-slate-800 dark:text-slate-200">
                      {t(`privacySections.${section}.plain`)}
                    </p>
                  </div>
                </div>
              </section>
            ))}

            {/* Bottom Mobile Action Button */}
            <div className="mt-8 text-center lg:hidden">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/95 hover:shadow-lg active:scale-95"
              >
                ← {locale === "pl" ? "Powrót do sklepu" : "Back to store"}
              </Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
