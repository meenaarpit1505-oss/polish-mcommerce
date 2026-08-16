"use client";

import { useState } from "react";
import { logInAction } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  ShieldCheck, 
  Users, 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles,
  ChevronRight,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";

interface LoginFormProps {
  locale: string;
}

export function LoginForm({ locale }: LoginFormProps) {
  const t = useTranslations("login");

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form overall validity
  const isFormValid = email.trim() !== "" && password.trim() !== "";

  const handleGoogleLogin = async () => {
    const isSupabaseConfigured =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("http") &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "your-supabase-anon-key";

    if (!isSupabaseConfigured) {
      setError(locale === "pl" ? "Logowanie przez Google jest wyłączone w wersji demonstracyjnej bez bazy danych Supabase." : "Google Login is disabled in the demo version without a Supabase database.");
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError("internal_error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const result = await logInAction(formData);

      if (!result.success) {
        setIsSubmitting(false);
        setError(result.error || "internal_error");
        return;
      }

      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (err) {
      console.error("Log in submit error:", err);
      setIsSubmitting(false);
      setError("internal_error");
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-64px)] w-full grid-cols-1 md:grid-cols-12 bg-[#F8FAFC] dark:bg-[#0F172A]">
      
      {/* LEFT COLUMN: Trust Anchoring & Social Proof (Hidden on mobile) */}
      <div className="hidden md:flex md:col-span-5 lg:col-span-4 bg-[#0F172A] text-white p-8 lg:p-12 flex-col justify-between relative overflow-hidden border-r border-slate-800">
        {/* Subtle decorative background glow */}
        <div className="absolute -left-20 -top-20 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl" />

        <div className="relative z-10 space-y-8">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              <Users className="h-3.5 w-3.5" />
              {locale === "pl" ? "Dołącz do 10 000+ Polaków" : "Join 10,000+ Poles"}
            </span>
            <h2 className="mt-4 text-2xl lg:text-3xl font-bold tracking-tight text-slate-100">
              {t("socialProofTitle")}
            </h2>
          </div>

          <div className="space-y-6">
            {/* Benefit 1: InPost Paczkomaty */}
            <div className="flex items-start gap-4 group">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 transition-colors group-hover:border-emerald-500/30 group-hover:bg-slate-800/80">
                <img src="/trust/inpost.svg" alt="InPost" className="h-5 w-auto" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-200">InPost Paczkomaty</h4>
                <p className="text-xs text-slate-400 mt-0.5">{t("socialProof1")}</p>
              </div>
            </div>

            {/* Benefit 2: BLIK */}
            <div className="flex items-start gap-4 group">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 transition-colors group-hover:border-emerald-500/30 group-hover:bg-slate-800/80">
                <img src="/trust/blik.svg" alt="BLIK" className="h-4 w-auto" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-200">Płatności BLIK</h4>
                <p className="text-xs text-slate-400 mt-0.5">{t("socialProof2")}</p>
              </div>
            </div>

            {/* Benefit 3: Secure Returns */}
            <div className="flex items-start gap-4 group">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 transition-colors group-hover:border-emerald-500/30 group-hover:bg-slate-800/80">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-200">
                  {locale === "pl" ? "Bezpieczne zakupy" : "Safe Shopping"}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">{t("socialProof3")}</p>
              </div>
            </div>

            {/* Benefit 4: Premium Perks */}
            <div className="flex items-start gap-4 group">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 transition-colors group-hover:border-emerald-500/30 group-hover:bg-slate-800/80">
                <Sparkles className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-200">
                  {locale === "pl" ? "Klub VistulaVogue" : "VistulaVogue Club"}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">{t("socialProof4")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Security Badge */}
        <div className="relative z-10 border-t border-slate-800 pt-6 mt-8 flex items-center gap-3 text-xs text-slate-400">
          <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{t("trustBadge")}</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Log In Form & Success Screen */}
      <div className="col-span-1 md:col-span-7 lg:col-span-8 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md bg-white dark:bg-[#1E293B] rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300">
          
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header */}
                <div className="text-center md:text-left mb-8">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    {t("title")}
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                    {t("subtitle")}
                  </p>
                </div>

                {/* Google Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 font-semibold text-sm text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2.5 transition-all duration-300 active:scale-[0.98] cursor-pointer"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-3.3 3.28-8.17 3.28-13.62z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{t("googleLogin")}</span>
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-[#1E293B] px-2 text-slate-500 dark:text-slate-400">
                      {t("or")}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Error Notification */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-4 text-red-800 dark:text-red-300">
                          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                          <div className="space-y-1 text-left text-xs sm:text-sm">
                            <p className="font-semibold">
                              {error === "email_not_found" 
                                ? t("emailNotFoundTitle") 
                                : error === "wrong_password"
                                ? t("wrongPasswordTitle")
                                : error === "internal_error"
                                ? t("genericErrorTitle")
                                : locale === "pl" ? "Informacja" : "Notice"}
                            </p>
                            <p className="text-red-700/90 dark:text-red-400/90 leading-relaxed">
                              {error === "email_not_found" 
                                ? t("emailNotFound") 
                                : error === "wrong_password"
                                ? t("wrongPassword")
                                : error === "internal_error"
                                ? t("genericError")
                                : error}
                            </p>
                            {error === "email_not_found" && (
                              <div className="pt-1.5">
                                <Link
                                  href="/rejestracja"
                                  className="inline-flex items-center gap-1 font-bold text-red-900 dark:text-red-200 hover:underline"
                                >
                                  <span>{locale === "pl" ? "Zarejestruj się teraz" : "Sign up now"}</span>
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email Input (Floating Label) */}
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder=" "
                      required
                      className="peer h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent pl-11 pr-4 pt-4 pb-1 text-sm text-slate-900 dark:text-slate-100 outline-none transition-all duration-300 focus:border-emerald-500 focus:shadow-[inset_0_0_4px_rgba(16,185,129,0.1),0_4px_12px_rgba(16,185,129,0.05)]"
                    />
                    <label
                      htmlFor="email"
                      className="absolute left-11 top-3.5 text-sm text-slate-400 transition-all duration-300 pointer-events-none origin-left
                        peer-focus:top-1 peer-focus:scale-75 peer-focus:text-emerald-500
                        peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:scale-75 peer-not-placeholder-shown:text-emerald-500"
                    >
                      {t("email")}
                    </label>
                  </div>

                  {/* Password Input (Floating Label) */}
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder=" "
                      required
                      className="peer h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent pl-11 pr-11 pt-4 pb-1 text-sm text-slate-900 dark:text-slate-100 outline-none transition-all duration-300 focus:border-emerald-500 focus:shadow-[inset_0_0_4px_rgba(16,185,129,0.1),0_4px_12px_rgba(16,185,129,0.05)]"
                    />
                    <label
                      htmlFor="password"
                      className="absolute left-11 top-3.5 text-sm text-slate-400 transition-all duration-300 pointer-events-none origin-left
                        peer-focus:top-1 peer-focus:scale-75 peer-focus:text-emerald-500
                        peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:scale-75 peer-not-placeholder-shown:text-emerald-500"
                    >
                      {t("password")}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-emerald-500 transition-colors focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className={`relative w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                      isFormValid
                        ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.5)] cursor-pointer active:scale-[0.98]"
                        : "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed"
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <>
                        <span>{t("submit")}</span>
                        <ArrowRight className={`h-4 w-4 transition-transform duration-300 ${isFormValid ? "translate-x-0 group-hover:translate-x-1" : ""}`} />
                      </>
                    )}
                  </button>
                </form>

                {/* Footer Link */}
                <div className="text-center mt-6 text-xs text-slate-500 dark:text-slate-400">
                  {t("dontHaveAccount")}{" "}
                  <Link href="/rejestracja" className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">
                    {t("signup")}
                  </Link>
                </div>
              </motion.div>
            ) : (
              /* SUCCESS SCREEN */
              <motion.div
                key="success-screen"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 15 }}
                className="text-center py-8 space-y-6"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <Check className="h-8 w-8 stroke-3" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {t("successTitle")}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                    {t("successSubtitle")}
                  </p>
                </div>

                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.5)] transition-all duration-300"
                >
                  <span>{t("successCta")}</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
