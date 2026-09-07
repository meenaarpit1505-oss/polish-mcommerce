"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAffiliateLink, type QuizSelection } from "@/lib/affiliateRouter";
import { Check, ArrowRight, Loader2, Sparkles, BookOpen, ShieldCheck, RotateCcw, Home } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useParams } from "next/navigation";

const translations = {
  pl: {
    title: "Skórny Audyt Diagnostyczny",
    subtitle: "Odkryj rzeczywiste potrzeby swojej skóry w 60 sekund",
    step1: "Krok 1: Wybierz swój dominujący typ skóry",
    step2: "Krok 2: Określ swój najważniejszy cel pielęgnacyjny",
    step3: "Krok 3: Odbierz Spersonalizowany Raport (24 str. PDF)",
    step3Sub: "Twój spersonalizowany plan pielęgnacji został wygenerowany! Podaj swój e-mail, aby natychmiast otrzymać darmowy, 24-stronicowy raport PDF z analizą składników i rutyną.",
    step4: "Twój profil skóry jest gotowy!",
    skinTypes: {
      sucha: {
        title: "Skóra Sucha",
        desc: "Odczucie ściągnięcia, szorstkość, łuszczenie i pilna potrzeba odbudowy bariery hydrolipidowej.",
      },
      tlusta: {
        title: "Skóra Tłusta",
        desc: "Nadmierna produkcja sebum, błyszczenie strefy T, rozszerzone pory i skłonność do niedoskonałości.",
      },
      mieszana: {
        title: "Skóra Mieszana",
        desc: "Błyszcząca strefa T (czoło, nos, broda) przy jednoczesnym przesuszeniu na policzkach.",
      },
    },
    goals: {
      "anti-age": {
        title: "Działanie Przeciwstarzeniowe",
        desc: "Spłycenie zmarszczek mimicznych, stymulacja kolagenu i poprawa jędrności owalu twarzy.",
      },
      acne: {
        title: "Walka z Trądzikiem",
        desc: "Wyciszenie stanów zapalnych, odblokowanie ujść gruczołów łojowych i redukcja przebarwień.",
      },
      hydration: {
        title: "Głębokie Nawilżenie",
        desc: "Wiązanie wody w naskórku, intensywne nawodnienie komórkowe i aksamitna gładkość.",
      },
    },
    emailPlaceholder: "Wpisz swój najlepszy adres e-mail...",
    gdprLabel: "Wyrażam zgodę na przetwarzanie mojego adresu e-mail przez Administratora w celu bezpłatnego przesłania 24-stronicowego raportu PDF oraz otrzymywania spersonalizowanych newsletterów edukacyjno-promocyjnych. Zgoda jest dobrowolna i może być cofnięta w każdej chwili.",
    gdprRequired: "Zaakceptowanie polityki prywatności i RODO jest wymagane do pobrania raportu.",
    btnNext: "Dalej",
    btnSubmit: "Wygeneruj Mój Plan",
    loadingText: [
      "Trwa analiza dermatologiczna...",
      "Dobieranie optymalnych stężeń składników aktywnych...",
      "Kompilowanie spersonalizowanego raportu PDF...",
      "Generowanie rekomendacji produktowych...",
    ],
    resultsTitle: "Twój Spersonalizowany Plan Pielęgnacyjny",
    resultsText: "Kompletny, 24-stronicowy podręcznik pielęgnacji został wysłany na Twój e-mail! Poniżej znajduje się dedykowany zestaw kuracji dobrany przez naszych kosmetologów.",
    resultsSkin: "Twój typ skóry:",
    resultsGoal: "Twój cel:",
    resultsCta: "Odbierz Rekomendowany Zestaw",
    resultsDisclaimer: "*Uwaga: Zestaw objęty jest 15% rabatem powitalnym. Liczba promocyjnych opakowań jest ograniczona ze względu na stany magazynowe.",
    restartBtn: "Wykonaj quiz ponownie",
    backToStore: "Wróć do sklepu",
  },
  en: {
    title: "Skin Diagnostic Audit",
    subtitle: "Discover your skin's true needs in 60 seconds",
    step1: "Step 1: Choose your dominant skin type",
    step2: "Step 2: Determine your primary skincare goal",
    step3: "Step 3: Access your Custom Blueprint (24-page PDF)",
    step3Sub: "Your personalized routine is ready! Enter your email to instantly receive your comprehensive 24-page PDF analysis and active ingredient map.",
    step4: "Your skin profile is ready!",
    skinTypes: {
      sucha: {
        title: "Dry Skin",
        desc: "Feeling of tightness, scaling, rough patch tendency, requiring immediate lipid barrier support.",
      },
      tlusta: {
        title: "Oily Skin",
        desc: "Excess sebum production, shine in the T-zone, enlarged pores, and blemish tendencies.",
      },
      mieszana: {
        title: "Combination Skin",
        desc: "Shiny T-zone (forehead, nose, chin) with dry or dehydrated skin on the cheeks.",
      },
    },
    goals: {
      "anti-age": {
        title: "Anti-Aging & Firming",
        desc: "Smoothing fine lines, boosting natural collagen, and improving facial contour elasticity.",
      },
      acne: {
        title: "Acne & Sebum Control",
        desc: "Calming inflammation, clearing pore congestion, and reducing post-acne pigmentation.",
      },
      hydration: {
        title: "Deep Hydration & Plumping",
        desc: "Locking moisture in cellular layers, deep hydration, and restoring skin suppleness.",
      },
    },
    emailPlaceholder: "Enter your best email address...",
    gdprLabel: "I consent to the processing of my email address by the Administrator for the purpose of receiving the custom 24-page PDF skincare guide and promotional newsletters. Consent is voluntary and can be revoked at any time.",
    gdprRequired: "Accepting the GDPR consent is required to download your report.",
    btnNext: "Next",
    btnSubmit: "Generate My Plan",
    loadingText: [
      "Analyzing skin parameters...",
      "Matching optimal ingredient concentrations...",
      "Compiling custom 24-page PDF blueprint...",
      "Generating product recommendations...",
    ],
    resultsTitle: "Your Personalized Skincare Blueprint",
    resultsText: "Your complete 24-page skincare guide has been sent to your inbox! Below is the exact active treatment selected for your skin profile.",
    resultsSkin: "Skin profile:",
    resultsGoal: "Main goal:",
    resultsCta: "Claim Recommended Routine",
    resultsDisclaimer: "*Note: This recommendation includes a 15% discount. Stock is highly limited due to active seasonal demand.",
    restartBtn: "Restart diagnostic quiz",
    backToStore: "Back to store",
  }
};

export default function QuizPage() {
  const params = useParams();
  const locale = (params?.locale as "pl" | "en") || "pl";
  const tContent = translations[locale] || translations.pl;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [answers, setAnswers] = useState<Partial<QuizSelection>>({});
  const [email, setEmail] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingPhase((prev) => {
          if (prev >= tContent.loadingText.length - 1) {
            clearInterval(interval);
            setIsLoading(false);
            setStep(4);
            return prev;
          }
          return prev + 1;
        });
      }, 950);
    }
    return () => clearInterval(interval);
  }, [isLoading, tContent.loadingText.length]);

  const handleSelectSkinType = (type: QuizSelection["skinType"]) => {
    setAnswers((prev) => ({ ...prev, skinType: type }));
    setStep(2);
  };

  const handleSelectGoal = (goal: QuizSelection["goal"]) => {
    setAnswers((prev) => ({ ...prev, goal }));
    setStep(3);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !email.includes("@")) {
      setErrorMsg(locale === "pl" ? "Proszę podać poprawny adres e-mail." : "Please enter a valid email address.");
      return;
    }

    if (!gdprConsent) {
      setErrorMsg(tContent.gdprRequired);
      return;
    }

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          consentGdpr: gdprConsent,
          actionType: "quiz",
          metaData: {
            skinType: answers.skinType,
            goal: answers.goal,
            locale
          }
        }),
      });

      if (response.ok) {
        setIsLoading(true);
        setLoadingPhase(0);
      } else {
        const errData = await response.json();
        setErrorMsg(errData.error || (locale === "pl" ? "Wystąpił błąd. Spróbuj ponownie." : "An error occurred. Please try again."));
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(locale === "pl" ? "Brak połączenia z serwerem." : "Server connection failure.");
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setEmail("");
    setGdprConsent(false);
    setErrorMsg("");
    setStep(1);
  };

  const affiliateRedirectUrl = getAffiliateLink(answers);
  const progressPercent = step === 1 ? 25 : step === 2 ? 50 : step === 3 ? 75 : 100;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-300 relative overflow-hidden">
      {/* Visual Top Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-200 dark:bg-slate-900 z-50">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      </div>

      {/* Modern Background Blur Mesh */}
      <div className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/25 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-teal-400/20 blur-[100px]" />
      </div>

      {/* QUIZ HEADER */}
      <header className="px-4 py-6 border-b border-slate-200/50 dark:border-slate-900/50 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          <span className="font-black text-lg tracking-tight bg-linear-to-r from-primary to-teal-500 bg-clip-text text-transparent">
            DermAudit
          </span>
        </div>
        <Link
          href="/"
          className="text-xs font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-1.5"
        >
          <Home className="h-3.5 w-3.5" />
          {tContent.backToStore}
        </Link>
      </header>

      {/* CORE WORKFLOW AREA */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-xl p-6 sm:p-8 relative min-h-115 flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-12"
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
                  <Loader2 className="h-16 w-16 text-primary animate-spin stroke-[2px] relative z-10" />
                </div>
                <div className="h-12 flex items-center justify-center">
                  <motion.p
                    key={loadingPhase}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    className="text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400"
                  >
                    {tContent.loadingText[loadingPhase]}
                  </motion.p>
                </div>
              </motion.div>
            ) : step === 1 ? (
              <motion.div
                key="step1"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {tContent.title}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-4">
                    {tContent.step1}
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
                    {tContent.subtitle}
                  </p>
                </div>

                <div className="space-y-3.5 my-8">
                  {(["sucha", "tlusta", "mieszana"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleSelectSkinType(type)}
                      className="w-full text-left p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100/50 dark:bg-slate-950 dark:hover:bg-slate-900/50 hover:border-primary dark:hover:border-primary active:scale-[0.99] transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                          {tContent.skinTypes[type].title}
                        </p>
                        <span className="h-5 w-5 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
                          <span className="h-2 w-2 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform" />
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed">
                        {tContent.skinTypes[type].desc}
                      </p>
                    </button>
                  ))}
                </div>

                <p className="text-[10px] text-slate-400 text-center">
                  {locale === "pl" ? "💡 Wybierz opcję najbardziej zbliżoną do Twojej codziennej obserwacji." : "💡 Choose the option closest to your daily observations."}
                </p>
              </motion.div>
            ) : step === 2 ? (
              <motion.div
                key="step2"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col justify-between"
              >
                <div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-slate-400 hover:text-primary transition-colors cursor-pointer"
                  >
                    {locale === "pl" ? "← Poprzedni krok" : "← Previous step"}
                  </button>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-4">
                    {tContent.step2}
                  </h2>
                </div>

                <div className="space-y-3.5 my-8">
                  {(["anti-age", "acne", "hydration"] as const).map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => handleSelectGoal(goal)}
                      className="w-full text-left p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100/50 dark:bg-slate-950 dark:hover:bg-slate-900/50 hover:border-primary dark:hover:border-primary active:scale-[0.99] transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                          {tContent.goals[goal].title}
                        </p>
                        <span className="h-5 w-5 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
                          <span className="h-2 w-2 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform" />
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed">
                        {tContent.goals[goal].desc}
                      </p>
                    </button>
                  ))}
                </div>

                <p className="text-[10px] text-slate-400 text-center">
                  {locale === "pl" ? "💡 Skup się na swoim największym wyzwaniu skórnym w tym momencie." : "💡 Focus on your biggest skin challenge at the moment."}
                </p>
              </motion.div>
            ) : step === 3 ? (
              <motion.div
                key="step3"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col justify-between"
              >
                <div>
                  <button
                    onClick={() => setStep(2)}
                    className="text-xs font-bold text-slate-400 hover:text-primary transition-colors cursor-pointer"
                  >
                    {locale === "pl" ? "← Poprzedni krok" : "← Previous step"}
                  </button>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-4 flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-primary shrink-0" />
                    <span>{tContent.step3}</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-2.5">
                    {tContent.step3Sub}
                  </p>
                </div>

                <form onSubmit={handleLeadSubmit} className="space-y-4 my-6">
                  <div>
                    <label htmlFor="quiz-email" className="sr-only">E-mail</label>
                    <input
                      id="quiz-email"
                      type="email"
                      required
                      placeholder={tContent.emailPlaceholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-semibold"
                    />
                  </div>

                  <div className="flex items-start gap-2.5">
                    <input
                      id="quiz-gdpr"
                      type="checkbox"
                      checked={gdprConsent}
                      onChange={(e) => setGdprConsent(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded-sm border-slate-300 text-primary focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor="quiz-gdpr" className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium select-none cursor-pointer">
                      {tContent.gdprLabel}{" "}
                      <Link href="/polityka-prywatnosci" target="_blank" className="underline hover:text-primary font-bold">
                        {locale === "pl" ? "Polityka Prywatności" : "Privacy Policy"}
                      </Link>.
                    </label>
                  </div>

                  {errorMsg && (
                    <p className="text-xs text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-lg border border-rose-100 dark:border-rose-900/30">
                      ⚠️ {errorMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-4 bg-primary hover:bg-primaryDark text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>{tContent.btnSubmit}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>{locale === "pl" ? "Szyfrowane połączenie SSL & Zgodność z RODO" : "SSL Encrypted Connection & GDPR Compliant"}</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step4"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, type: "spring" }}
                className="flex-1 flex flex-col justify-between"
              >
                <div className="text-center">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-[10px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-widest mb-3">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    {tContent.step4}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    {tContent.resultsTitle}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-3 leading-relaxed">
                    {tContent.resultsText}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-4 my-6 space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                      {tContent.resultsSkin}
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {answers.skinType ? tContent.skinTypes[answers.skinType].title : "N/A"}
                    </span>
                  </div>
                  <div className="h-px bg-slate-200/60 dark:bg-slate-800/60" />
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                      {tContent.resultsGoal}
                    </span>
                    <span className="font-extrabold text-primary">
                      {answers.goal ? tContent.goals[answers.goal].title : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <a
                    href={affiliateRedirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 bg-linear-to-r from-primary to-teal-500 hover:from-primaryDark hover:to-teal-600 text-white text-sm font-black uppercase tracking-wider rounded-xl shadow-lg active:scale-[0.98] transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{tContent.resultsCta}</span>
                    <ArrowRight className="h-4.5 w-4.5 stroke-[2.5px]" />
                  </a>

                  <p className="text-[9px] text-slate-400 text-center leading-relaxed font-semibold">
                    {tContent.resultsDisclaimer}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-200/50 dark:border-slate-800/50 mt-6">
                  <button
                    onClick={handleRestart}
                    className="text-xs font-bold text-slate-400 hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    {tContent.restartBtn}
                  </button>
                  <Link
                    href="/"
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    {locale === "pl" ? "Przejdź do strony głównej sklepu →" : "Go back to homepage →"}
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* QUIZ FOOTER */}
      <footer className="px-4 py-5 border-t border-slate-200/50 dark:border-slate-900/50 text-center text-[10px] text-slate-400 font-medium z-10 bg-white/30 dark:bg-slate-950/30 backdrop-blur-sm">
        <p>© {new Date().getFullYear()} DermAudit. Wszelkie prawa zastrzeżone.</p>
        <div className="mt-1 flex items-center justify-center gap-3">
          <Link href="/polityka-prywatnosci" target="_blank" className="hover:text-primary hover:underline">
            Polityka Prywatności (RODO)
          </Link>
          <span>•</span>
          <Link href="/regulamin" target="_blank" className="hover:text-primary hover:underline">
            Regulamin świadczenia usług cyfrowych
          </Link>
        </div>
      </footer>
    </div>
  );
}
