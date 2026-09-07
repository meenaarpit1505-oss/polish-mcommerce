"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Clock,
  Download,
  Gift,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";

type Locale = "pl" | "en";
type Step = 1 | 2 | "success";

interface VipOnboardingProps {
  className?: string;
  waveCapacity?: number;
}

interface VipFormState {
  email: string;
  firstName: string;
  consentNewsletter: boolean;
  consentCustomAudience: boolean;
}

interface WaveMetrics {
  endsAtMs: number;
  remainingSlots: number;
  hours: string;
  minutes: string;
  seconds: string;
}

interface LeadApiResponse {
  success: boolean;
  error?: string;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const WAVE_MS = 7 * 24 * 60 * 60 * 1000;
const WAVE_EPOCH_MS = Date.UTC(2026, 0, 5, 22, 0, 0);
const LOCAL_CLAIMS_KEY = "vip_wave_local_claims";
const PDF_HREF = "/guides/diet-blueprint.pdf";
const PDF_FILENAME = "VIP-Early-Access-Blueprint.pdf";

const copy = {
  pl: {
    badge: "Klub VIP · Fala early access",
    headline: "Wejście do klubu VIP i early access",
    subhead:
      "Odbierz od razu przewodnik zakupowy VIP (PDF) i zarezerwuj miejsce w bieżącej fali wcześniejszego dostępu. Zgody marketingowe są dobrowolne i rozdzielone.",
    perkTitle: "Natychmiastowa wartość",
    perkBody:
      "PDF „Blueprint zakupów VIP”: lista dropów, zasady early access i kody na pierwszą falę. Pobierasz go od razu po zapisie e-maila — bez wymuszania zgód reklamowych.",
    scarcityTitle: "Ta fala się zamyka",
    slotsLabel: "wolnych miejsc",
    step1Cta: "Chcę zarezerwować miejsce",
    stepHint: "Krok 1 z 2 · najpierw korzyść, potem dane i zgody",
    back: "Wróć do korzyści",
    emailLabel: "Adres e-mail",
    emailPlaceholder: "np. anna@email.pl",
    nameLabel: "Imię (opcjonalnie)",
    namePlaceholder: "np. Anna",
    consentsLegend: "Zgody (niezaznaczone z góry, każda osobno)",
    newsletterLabel:
      "Wyrażam zgodę na otrzymywanie newslettera i informacji handlowych e-mailem (art. 6 ust. 1 lit. a RODO oraz art. 398 Prawa komunikacji elektronicznej). Zgodę mogę wycofać w każdej chwili.",
    adsLabel:
      "Wyrażam odrębną zgodę na dopasowywanie moich danych (w tym zahashowanego adresu e-mail) do niestandardowych grup odbiorców w reklamach Meta i Google Ads w celu wyświetlania spersonalizowanych komunikatów. Ta zgoda nie obejmuje newslettera. Mogę ją wycofać w każdej chwili.",
    legalNote:
      "Administrator przetworzy e-mail w celu dostarczenia PDF i obsługi zapisu do fali VIP (art. 6 ust. 1 lit. b RODO). Zgody marketingowe nie są wymagane do pobrania pliku. Szczegóły:",
    privacy: "Polityka prywatności",
    terms: "Regulamin",
    submit: "Dołącz do fali i pobierz PDF",
    submitting: "Zapisuję…",
    successTitle: "Miejsce zarezerwowane",
    successBody:
      "Pobieranie PDF powinno się rozpocząć automatycznie. Jeśli nie, użyj przycisku poniżej. Status zgód zapisaliśmy zgodnie z Twoim wyborem.",
    downloadAgain: "Pobierz PDF ponownie",
    errorEmail: "Podaj prawidłowy adres e-mail.",
    errorNetwork: "Nie udało się zapisać. Spróbuj ponownie.",
    consentStatusOn: "wyrażona",
    consentStatusOff: "niewyrażona",
    newsletterShort: "Newsletter",
    adsShort: "Grupy reklamowe Meta/Google",
    trustRodo: "RODO / UOKiK: brak wstępnie zaznaczonych zgód, dwa niezależne cele.",
    trustGift: "PDF i miejsce w fali nie zależą od zgody na reklamy.",
  },
  en: {
    badge: "VIP Club · Early-access wave",
    headline: "VIP loyalty and early-access hub",
    subhead:
      "Download the VIP shopping blueprint immediately and reserve a seat in this early-access wave. Marketing consents are optional and separate.",
    perkTitle: "Immediate value",
    perkBody:
      "The VIP Shopping Blueprint PDF: drop calendar, early-access rules, and first-wave codes. You get it after submitting your email — ads consent is never required for the file.",
    scarcityTitle: "This wave is closing",
    slotsLabel: "seats left",
    step1Cta: "Reserve my seat",
    stepHint: "Step 1 of 2 · benefit first, then details and consents",
    back: "Back to benefits",
    emailLabel: "Email address",
    emailPlaceholder: "e.g. anna@email.com",
    nameLabel: "First name (optional)",
    namePlaceholder: "e.g. Anna",
    consentsLegend: "Consents (unticked by default, each purpose separate)",
    newsletterLabel:
      "I consent to receiving the newsletter and commercial emails (GDPR Art. 6(1)(a)). I may withdraw this consent at any time.",
    adsLabel:
      "I give a separate consent to matching my data (including a hashed email) to custom audiences on Meta and Google Ads for tailored advertising. This is not newsletter consent. I may withdraw it at any time.",
    legalNote:
      "We process your email to deliver the PDF and register this VIP wave (GDPR Art. 6(1)(b)). Marketing consents are not required to download the file. Details:",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    submit: "Join the wave and download PDF",
    submitting: "Saving…",
    successTitle: "Seat reserved",
    successBody:
      "Your PDF download should start automatically. If it does not, use the button below. We stored your consent choices exactly as selected.",
    downloadAgain: "Download PDF again",
    errorEmail: "Enter a valid email address.",
    errorNetwork: "Could not save. Please try again.",
    consentStatusOn: "granted",
    consentStatusOff: "not granted",
    newsletterShort: "Newsletter",
    adsShort: "Meta/Google custom audiences",
    trustRodo: "GDPR: no pre-ticked boxes, two independent purposes.",
    trustGift: "The PDF and wave seat do not depend on advertising consent.",
  },
} as const;

function getLocale(raw: unknown): Locale {
  return raw === "en" ? "en" : "pl";
}

function getWaveEndMs(nowMs: number): number {
  const elapsed = Math.max(0, nowMs - WAVE_EPOCH_MS);
  const index = Math.floor(elapsed / WAVE_MS);
  return WAVE_EPOCH_MS + (index + 1) * WAVE_MS;
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function readLocalClaims(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(LOCAL_CLAIMS_KEY);
  const parsed = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function writeLocalClaims(count: number): void {
  window.localStorage.setItem(LOCAL_CLAIMS_KEY, String(count));
}

function computeWaveMetrics(nowMs: number, capacity: number): WaveMetrics {
  const endsAtMs = getWaveEndMs(nowMs);
  const waveStartMs = endsAtMs - WAVE_MS;
  const elapsedHours = Math.max(0, (nowMs - waveStartMs) / (1000 * 60 * 60));
  const organicFill = Math.min(capacity - 4, Math.floor(elapsedHours * 0.35));
  const remainingSlots = Math.max(3, capacity - organicFill - readLocalClaims());
  const diff = Math.max(0, endsAtMs - nowMs);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return {
    endsAtMs,
    remainingSlots,
    hours: pad2(hours),
    minutes: pad2(minutes),
    seconds: pad2(seconds),
  };
}

function triggerPdfDownload(): void {
  const anchor = document.createElement("a");
  anchor.href = PDF_HREF;
  anchor.download = PDF_FILENAME;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

export function VipOnboarding({ className = "", waveCapacity = 48 }: VipOnboardingProps) {
  const params = useParams();
  const locale = getLocale(params?.locale);
  const t = copy[locale];
  const reduceMotion = useReducedMotion();
  const formId = useId();

  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<VipFormState>({
    email: "",
    firstName: "",
    consentNewsletter: false,
    consentCustomAudience: false,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [magnet, setMagnet] = useState({ x: 0, y: 0 });
  const ctaRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const tick = () => setNowMs(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const metrics = useMemo(
    () => computeWaveMetrics(nowMs ?? WAVE_EPOCH_MS, waveCapacity),
    [nowMs, waveCapacity],
  );

  const slide = reduceMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } }
    : {
        initial: { opacity: 0, x: 28 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -28 },
      };

  const onMagnetMove = useCallback((event: PointerEvent<HTMLButtonElement>) => {
    const node = ctaRef.current;
    if (!node || window.matchMedia("(pointer: coarse)").matches) return;
    const rect = node.getBoundingClientRect();
    setMagnet({
      x: (event.clientX - rect.left - rect.width / 2) * 0.22,
      y: (event.clientY - rect.top - rect.height / 2) * 0.22,
    });
  }, []);

  const resetMagnet = useCallback(() => setMagnet({ x: 0, y: 0 }), []);

  const onKeyMagnet = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Enter" || event.key === " ") resetMagnet();
    },
    [resetMagnet],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const email = form.email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(email)) {
      setError(t.errorEmail);
      return;
    }

    setSubmitting(true);

    const payload = {
      email,
      consentGdpr: true,
      actionType: "freebie" as const,
      metaData: {
        source: "vip-onboarding",
        locale,
        firstName: form.firstName.trim(),
        consentNewsletter: form.consentNewsletter,
        consentCustomAudience: form.consentCustomAudience,
        waveEndsAt: new Date(metrics.endsAtMs).toISOString(),
        remainingSlotsAtSubmit: metrics.remainingSlots,
      },
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as LeadApiResponse;
      if (!response.ok || !data.success) {
        setError(data.error || t.errorNetwork);
        setSubmitting(false);
        return;
      }

      if (form.consentNewsletter) {
        await fetch("/api/marketing/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            name: form.firstName.trim(),
            zgodaMarketingowa: true,
          }),
        });
      }

      writeLocalClaims(readLocalClaims() + 1);
      triggerPdfDownload();
      setStep("success");
    } catch {
      setError(t.errorNetwork);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      aria-labelledby={`${formId}-title`}
      className={`relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl ${className}`}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col gap-5 p-5 sm:p-8">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {t.badge}
          </p>
          <h2 id={`${formId}-title`} className="text-2xl font-semibold leading-tight sm:text-3xl">
            {t.headline}
          </h2>
          <p className="text-sm leading-relaxed text-slate-300 sm:text-base">{t.subhead}</p>

          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-amber-300">
                <Clock className="h-4 w-4" aria-hidden />
                {t.scarcityTitle}
              </p>
              <p className="flex items-center gap-1.5 text-xs font-medium text-slate-200">
                <Users className="h-3.5 w-3.5" aria-hidden />
                <span className="tabular-nums text-amber-300">{metrics.remainingSlots}</span>
                {t.slotsLabel}
              </p>
            </div>
            <div
              role="timer"
              aria-live="polite"
              aria-label={`${metrics.hours}:${metrics.minutes}:${metrics.seconds}`}
              className="mt-3 grid grid-cols-3 gap-2"
            >
              {[
                [metrics.hours, locale === "pl" ? "godz." : "hrs"],
                [metrics.minutes, locale === "pl" ? "min" : "min"],
                [metrics.seconds, locale === "pl" ? "sek." : "sec"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-xl bg-slate-950/60 px-2 py-3 text-center ring-1 ring-inset ring-slate-700"
                >
                  <span className="block font-mono text-2xl font-bold tabular-nums text-white">{value}</span>
                  <span className="text-[10px] uppercase tracking-wide text-slate-400">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 bg-slate-950/40 p-5 sm:p-8 lg:border-l lg:border-t-0">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                {...slide}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="flex h-full flex-col gap-5"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t.stepHint}</p>
                <div className="rounded-2xl border border-emerald-500/20 bg-slate-900 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
                    <Gift className="h-4 w-4" aria-hidden />
                    {t.perkTitle}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{t.perkBody}</p>
                </div>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
                    {t.trustRodo}
                  </li>
                  <li className="flex gap-2">
                    <Lock className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
                    {t.trustGift}
                  </li>
                </ul>
                <motion.button
                  type="button"
                  onClick={() => setStep(2)}
                  whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-auto inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 text-sm font-semibold text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  {t.step1Cta}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </motion.button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.form
                key="step-2"
                {...slide}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
                noValidate
              >
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="self-start text-xs font-medium text-slate-400 underline-offset-2 hover:text-emerald-400 hover:underline"
                >
                  {t.back}
                </button>

                <div>
                  <label htmlFor={`${formId}-email`} className="mb-1.5 block text-xs font-semibold text-slate-300">
                    {t.emailLabel}
                  </label>
                  <input
                    id={`${formId}-email`}
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    inputMode="email"
                    placeholder={t.emailPlaceholder}
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? `${formId}-error` : undefined}
                    className="min-h-12 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 text-sm text-white outline-none transition hover:border-emerald-500/50 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
                  />
                </div>

                <div>
                  <label htmlFor={`${formId}-name`} className="mb-1.5 block text-xs font-semibold text-slate-300">
                    {t.nameLabel}
                  </label>
                  <input
                    id={`${formId}-name`}
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    placeholder={t.namePlaceholder}
                    value={form.firstName}
                    onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                    className="min-h-12 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 text-sm text-white outline-none transition hover:border-emerald-500/50 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
                  />
                </div>

                <fieldset className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                  <legend className="px-1 text-xs font-semibold text-slate-400">{t.consentsLegend}</legend>

                  <label className="flex cursor-pointer items-start gap-3 rounded-xl p-2 hover:bg-slate-800/60">
                    <input
                      type="checkbox"
                      name="consent_newsletter"
                      checked={form.consentNewsletter}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, consentNewsletter: e.target.checked }))
                      }
                      className="mt-1 h-4 w-4 shrink-0 rounded border-slate-500 bg-slate-950 text-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-400"
                    />
                    <span className="text-[11px] leading-relaxed text-slate-300">{t.newsletterLabel}</span>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3 rounded-xl p-2 hover:bg-slate-800/60">
                    <input
                      type="checkbox"
                      name="consent_custom_audience"
                      checked={form.consentCustomAudience}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, consentCustomAudience: e.target.checked }))
                      }
                      className="mt-1 h-4 w-4 shrink-0 rounded border-slate-500 bg-slate-950 text-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-400"
                    />
                    <span className="text-[11px] leading-relaxed text-slate-300">{t.adsLabel}</span>
                  </label>
                </fieldset>

                <p className="text-[11px] leading-relaxed text-slate-400">
                  {t.legalNote}{" "}
                  <Link href="/polityka-prywatnosci" className="font-semibold text-emerald-400 underline">
                    {t.privacy}
                  </Link>
                  {" · "}
                  <Link href="/regulamin" className="font-semibold text-emerald-400 underline">
                    {t.terms}
                  </Link>
                </p>

                {error ? (
                  <p id={`${formId}-error`} role="alert" className="text-xs font-semibold text-rose-400">
                    {error}
                  </p>
                ) : null}

                <motion.button
                  ref={ctaRef}
                  type="submit"
                  disabled={submitting}
                  onPointerMove={onMagnetMove}
                  onPointerLeave={resetMagnet}
                  onKeyDown={onKeyMagnet}
                  animate={{ x: magnet.x, y: magnet.y }}
                  transition={{ type: "spring", stiffness: 350, damping: 22, mass: 0.4 }}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Download className="h-4 w-4" aria-hidden />
                  )}
                  {submitting ? t.submitting : t.submit}
                </motion.button>
              </motion.form>
            )}

            {step === "success" && (
              <motion.div
                key="success"
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 py-6 text-center"
              >
                <motion.span
                  initial={reduceMotion ? undefined : { scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 14 }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-slate-950"
                  aria-hidden
                >
                  <Check className="h-8 w-8" strokeWidth={2.5} />
                </motion.span>
                <h3 className="text-xl font-semibold">{t.successTitle}</h3>
                <p className="text-sm leading-relaxed text-slate-300">{t.successBody}</p>
                <p className="text-xs text-slate-400">
                  {t.newsletterShort}: {form.consentNewsletter ? t.consentStatusOn : t.consentStatusOff}
                  {" · "}
                  {t.adsShort}: {form.consentCustomAudience ? t.consentStatusOn : t.consentStatusOff}
                </p>
                <button
                  type="button"
                  onClick={triggerPdfDownload}
                  className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-emerald-500/40 px-4 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/10"
                >
                  <Download className="h-4 w-4" aria-hidden />
                  {t.downloadAgain}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default VipOnboarding;
