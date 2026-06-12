"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { listApplications } from "@/lib/mock/api";
import { getVisa, countryName, type Application, type AppStatus } from "@/lib/mock/data";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/cn";
import { ChevronRight } from "lucide-react";

const FILTERS: (AppStatus | "all")[] = ["all", "submitted", "review", "info", "approved", "rejected"];

export default function QueuePage() {
  return (
    <AdminShell>
      <Queue />
    </AdminShell>
  );
}

function Queue() {
  const { t, locale } = useI18n();
  const [apps, setApps] = useState<Application[] | null>(null);
  const [filter, setFilter] = useState<AppStatus | "all">("all");

  useEffect(() => {
    listApplications().then(setApps);
  }, []);

  const filtered = useMemo(
    () => (apps ?? []).filter((a) => filter === "all" || a.status === filter),
    [apps, filter],
  );

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <span className="eyebrow">{t.admin.nav.queue}</span>
        <h1 className="display-xl mt-2 text-3xl">{t.admin.queue.title}</h1>
        <p className="mt-1.5 text-ink-soft">{t.admin.queue.lead}</p>
      </header>

      {/* filters */}
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const count = f === "all" ? apps?.length ?? 0 : (apps ?? []).filter((a) => a.status === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors cursor-pointer",
                filter === f
                  ? "border-azul bg-azul text-white"
                  : "border-line-strong bg-white text-ink-soft hover:border-azul/40",
              )}
            >
              {f === "all" ? t.admin.queue.filterAll : t.status[f]}
              <span className={cn("tabular-nums text-xs", filter === f ? "text-white/70" : "text-muted")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* table */}
      <div className="card overflow-hidden">
        <div className="hidden grid-cols-[1.4fr_1fr_1fr_0.9fr_auto] gap-4 border-b border-line bg-paper-deep/40 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted sm:grid">
          <span>{t.admin.queue.applicant}</span>
          <span>{t.admin.queue.type}</span>
          <span>{t.admin.queue.nationality}</span>
          <span>{t.admin.queue.submitted}</span>
          <span className="text-right">{t.admin.queue.statusCol}</span>
        </div>

        {apps === null ? (
          <div className="space-y-px">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse bg-paper-deep/30" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm text-muted">{t.admin.queue.empty}</div>
        ) : (
          <ul className="divide-y divide-line">
            {filtered.map((a) => (
              <li key={a.reference}>
                <Link
                  href={`/admin/applications/${a.reference}`}
                  className="grid grid-cols-[1fr_auto] items-center gap-3 px-5 py-3.5 transition-colors hover:bg-azul/4 sm:grid-cols-[1.4fr_1fr_1fr_0.9fr_auto]"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium">
                      {a.firstName} {a.lastName}
                    </div>
                    <div className="font-mono text-xs text-muted">{a.reference}</div>
                  </div>
                  <div className="hidden truncate text-sm text-ink-soft sm:block">
                    {getVisa(a.visaType)!.name[locale]}
                  </div>
                  <div className="hidden truncate text-sm text-ink-soft sm:block">
                    {countryName(a.nationality, locale)}
                  </div>
                  <div className="hidden text-sm text-muted sm:block">{fmt(a.submittedAt, locale)}</div>
                  <div className="flex items-center justify-end gap-2">
                    <StatusBadge status={a.status} />
                    <ChevronRight className="h-4 w-4 text-line-strong" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function fmt(iso: string, locale: "es" | "en") {
  return new Date(iso).toLocaleDateString(locale === "es" ? "es-VE" : "en-GB", {
    day: "2-digit",
    month: "short",
  });
}
