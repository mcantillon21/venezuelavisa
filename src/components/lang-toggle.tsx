"use client";

import { useI18n } from "@/lib/i18n/context";
import { LOCALES, type Locale } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/cn";

export function LangToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-line bg-white/70 p-0.5 text-xs font-semibold",
        className,
      )}
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((l: Locale) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={cn(
            "rounded-full px-2.5 py-1 uppercase tracking-wide transition-colors cursor-pointer",
            locale === l ? "bg-azul text-white" : "text-muted hover:text-ink",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
