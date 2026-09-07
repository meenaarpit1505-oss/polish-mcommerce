"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";

interface CheckoutTimerProps {
  durationMinutes?: number; // Defaults to 10 minutes
  onExpire?: () => void;
}

export function CheckoutTimer({ durationMinutes = 10, onExpire }: CheckoutTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (onExpire) onExpire();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onExpire]);

  // Formats timer into standard MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const totalDuration = durationMinutes * 60;
  const percentageRemaining = (secondsLeft / totalDuration) * 100;

  // Compute colors to escalate psychological response
  const isCritical = secondsLeft < 120; // Last 2 minutes (crimson alert)
  const isWarning = secondsLeft >= 120 && secondsLeft < 300; // Under 5 minutes (amber alert)

  const alertBgColor = isCritical
    ? "bg-rose-500/5 dark:bg-rose-950/20 border-rose-500/20 text-rose-800 dark:text-rose-400"
    : isWarning
    ? "bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/20 text-amber-800 dark:text-amber-400"
    : "bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/20 text-emerald-800 dark:text-emerald-400";

  const progressColor = isCritical
    ? "bg-rose-600 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
    : isWarning
    ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
    : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]";

  return (
    <div className="w-full space-y-3.5">
      {/* Visual Header Grid */}
      <div className={`rounded-2xl border p-4.5 transition-all duration-500 flex flex-col sm:flex-row items-center sm:justify-between gap-3 ${alertBgColor}`}>
        <div className="flex items-center gap-2.5">
          <Clock className={`h-5 w-5 shrink-0 ${isCritical ? "animate-pulse text-rose-500" : ""}`} />
          <div className="text-center sm:text-left space-y-0.5">
            <h4 className="text-sm font-black tracking-tight uppercase">Gwarantowana Rezerwacja Koszyka</h4>
            <p className="text-[11.5px] font-bold opacity-80 leading-relaxed max-w-sm">
              {isCritical 
                ? "Dokończ płatność teraz! Z powodu ogromnego popytu zwolnimy Twoje rezerwacje za moment."
                : "Ze względu na ograniczoną ilość produktów w magazynie, Twoje zakupy są bezpiecznie zarezerwowane dla Ciebie."}
            </p>
          </div>
        </div>

        {/* Countdown Slot Grid */}
        <div className="shrink-0 flex items-center gap-1 text-2xl font-black tabular-nums tracking-tight">
          <span className={`px-2.5 py-1.5 rounded-xl border border-black/5 dark:border-white/5 bg-black/3 dark:bg-white/3 ${isCritical ? "text-rose-600 dark:text-rose-400 animate-pulse" : ""}`}>
            {formatTime(secondsLeft)}
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none ml-1.5">pln</span>
        </div>
      </div>

      {/* High-Fidelity Micro Progress Indicator */}
      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden relative">
        <motion.div
          className={`h-full rounded-full ${progressColor}`}
          initial={{ width: "100%" }}
          animate={{ width: `${percentageRemaining}%` }}
          transition={{ duration: 1, ease: "linear" }}
        />
      </div>
    </div>
  );
}
