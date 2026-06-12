"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";
import { trackApplication } from "@/lib/mock/api";
import { getVisa, countryName, type Application } from "@/lib/mock/data";
import { Button, Field, Input, Card } from "@/components/ui";
import { StatusBadge } from "@/components/status-badge";
import { VisaIcon } from "@/components/icons";
import { Search, Loader2, AlertCircle } from "lucide-react";

export default function TrackPage() {
  return (
    <Suspense fallback={null}>
      <Track />
    </Suspense>
  );
}

function Track() {
  const { t, locale } = useI18n();
  const params = useSearchParams();
  const [reference, setReference] = useState(params.get("ref") ?? "");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Application | null>(null);
  const [notFound, setNotFound] = useState(false);

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setNotFound(false);
    const app = await trackApplication(reference, lastName);
    setResult(app);
    setNotFound(!app);
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-16 sm:px-6">
      <header className="rise">
        <span className="eyebrow">{t.nav.track}</span>
        <h1 className="display-xl mt-4 text-4xl">{t.track.title}</h1>
        <p className="mt-3 text-ink-soft">{t.track.lead}</p>
      </header>

      <Card className="mt-8 p-6 sm:p-8">
        <form onSubmit={onSearch} className="grid gap-5 sm:grid-cols-[1.4fr_1fr] sm:items-end">
          <Field label={t.track.reference} required className="sm:col-span-1">
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value.toUpperCase())}
              placeholder={t.track.referencePh}
              className="font-mono"
            />
          </Field>
          <Field label={t.track.lastName} required>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </Field>
          <Button type="submit" disabled={loading || !reference || !lastName} className="sm:col-span-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" strokeWidth={2} />}
            {t.track.cta}
          </Button>
        </form>
      </Card>

      {notFound && (
        <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-danger/25 bg-danger/8 px-4 py-3 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.8} />
          {t.track.notFound}
        </div>
      )}

      {result && <Result app={result} key={result.reference} locale={locale} />}
    </div>
  );
}

function Result({ app, locale }: { app: Application; locale: "es" | "en" }) {
  const { t } = useI18n();
  const visa = getVisa(app.visaType)!;
  const estimated = new Date(Date.parse(app.submittedAt) + visa.processingDays * 86400000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="mt-6 overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-line p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-azul/8 text-azul">
              <VisaIcon visa={visa} />
            </span>
            <div>
              <div className="font-mono text-sm font-semibold text-azul">{app.reference}</div>
              <div className="text-sm text-ink-soft">
                {app.firstName} {app.lastName} · {visa.name[locale]} · {countryName(app.nationality, locale)}
              </div>
            </div>
          </div>
          <StatusBadge status={app.status} />
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto]">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">{t.track.timeline}</h3>
            <ol className="mt-4 space-y-0">
              {app.timeline.map((ev, i) => (
                <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < app.timeline.length - 1 && (
                    <span className="absolute left-[7px] top-4 h-full w-px bg-line-strong" />
                  )}
                  <span className="relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-white bg-azul shadow-[0_0_0_1px_var(--color-line-strong)]" />
                  <div className="-mt-0.5">
                    <div className="text-sm font-medium text-ink">{t.status[ev.status]}</div>
                    <time className="text-xs text-muted">{fmt(ev.at, locale)}</time>
                    {ev.note && <p className="mt-1 text-sm text-ink-soft">{ev.note}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <dl className="grid h-fit gap-4 rounded-2xl border border-line bg-paper-deep/30 p-5 text-sm sm:w-56">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">{t.track.submittedOn}</dt>
              <dd className="mt-0.5 font-medium">{fmt(app.submittedAt, locale)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">{t.track.estimated}</dt>
              <dd className="mt-0.5 font-medium">{fmt(estimated.toISOString(), locale)}</dd>
            </div>
          </dl>
        </div>
      </Card>
    </motion.div>
  );
}

function fmt(iso: string, locale: "es" | "en") {
  return new Date(iso).toLocaleDateString(locale === "es" ? "es-VE" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
