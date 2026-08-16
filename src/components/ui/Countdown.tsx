"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface CountdownProps {
  endsAt: string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const EMPTY_TIME: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

function calculateTimeLeft(endsAt: string): TimeLeft {
  const diff = Math.max(0, new Date(endsAt).getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[3.5rem]">
      <span className="text-2xl font-bold tabular-nums text-foreground">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-xs text-muted uppercase tracking-wide">{label}</span>
    </div>
  );
}

export function Countdown({ endsAt, className = "" }: CountdownProps) {
  const t = useTranslations("promo");
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const update = () => setTimeLeft(calculateTimeLeft(endsAt));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [endsAt]);

  const display = timeLeft ?? EMPTY_TIME;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <TimeBlock value={display.days} label={t("days")} />
      <span className="text-xl font-light text-muted">:</span>
      <TimeBlock value={display.hours} label={t("hours")} />
      <span className="text-xl font-light text-muted">:</span>
      <TimeBlock value={display.minutes} label={t("minutes")} />
      <span className="text-xl font-light text-muted">:</span>
      <TimeBlock value={display.seconds} label={t("seconds")} />
    </div>
  );
}
