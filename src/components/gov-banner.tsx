"use client";

import { useI18n } from "@/lib/i18n/context";

export function GovBanner() {
  const { t } = useI18n();
  return (
    <div className="gov-banner">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-5 py-1.5 sm:px-6">
        {/* mini tricolor flag */}
        <span className="flex h-3 w-[18px] overflow-hidden rounded-[2px] ring-1 ring-white/20">
          <span className="flex-1 bg-[#ffcc00]" />
          <span className="flex-1 bg-[#00247d]" />
          <span className="flex-1 bg-[#cf142b]" />
        </span>
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.04em] text-white/75">
          {t.brand.official}
        </span>
      </div>
    </div>
  );
}
