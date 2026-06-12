"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { VISA_TYPES } from "@/lib/mock/data";
import { VisaIcon } from "@/components/icons";
import { buttonClasses } from "@/components/ui";
import { Check, ArrowRight, Clock, CalendarRange, MapPin } from "lucide-react";

export default function VisasPage() {
  const { t, locale } = useI18n();

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6">
      <header className="max-w-2xl rise">
        <span className="eyebrow">{t.nav.visas}</span>
        <h1 className="display-xl mt-4 text-4xl sm:text-5xl">{t.home.typesTitle}</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">{t.home.typesLead}</p>
        <div className="tricolor-rule mt-7 w-20" />
      </header>

      <div className="mt-12 flex flex-col gap-5">
        {VISA_TYPES.map((v) => (
          <article key={v.id} className="card overflow-hidden">
            <div className="grid gap-0 lg:grid-cols-[1.3fr_1fr]">
              {/* left: identity + requirements */}
              <div className="p-7 sm:p-9">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-azul/8 text-azul">
                    <VisaIcon visa={v} className="h-6 w-6" />
                  </span>
                  <div>
                    <h2 className="text-xl font-semibold">{v.name[locale]}</h2>
                    <p className="text-sm text-muted">{v.tagline[locale]}</p>
                  </div>
                </div>
                <p className="mt-5 leading-relaxed text-ink-soft">{v.description[locale]}</p>

                <h3 className="mt-7 text-xs font-semibold uppercase tracking-wider text-muted">
                  {t.visa.requirements}
                </h3>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {v.requirements[locale].map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-ink-soft">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" strokeWidth={2} />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* right: facts + cta */}
              <div className="flex flex-col justify-between gap-6 border-t border-line bg-paper-deep/40 p-7 sm:p-9 lg:border-l lg:border-t-0">
                <dl className="grid grid-cols-2 gap-5">
                  <Fact icon={<span className="font-display text-lg">$</span>} label={t.visa.fee} value={`$${v.feeUsd} USD`} />
                  <Fact icon={<CalendarRange className="h-4 w-4" strokeWidth={1.6} />} label={t.visa.validity} value={`${v.validityMonths} ${t.visa.months}`} />
                  <Fact icon={<Clock className="h-4 w-4" strokeWidth={1.6} />} label={t.visa.processing} value={`${v.processingDays} ${t.visa.businessDays}`} />
                  <Fact icon={<MapPin className="h-4 w-4" strokeWidth={1.6} />} label={t.visa.stay} value={`${v.maxStayDays} ${t.visa.days}`} />
                </dl>
                <Link href={`/apply?type=${v.id}`} className={buttonClasses("primary", "md", "w-full")}>
                  {t.visa.selectThis}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1" strokeWidth={2} />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
        <span className="text-azul">{icon}</span>
        {label}
      </dt>
      <dd className="mt-1 font-medium text-ink">{value}</dd>
    </div>
  );
}
