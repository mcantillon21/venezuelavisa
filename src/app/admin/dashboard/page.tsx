"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { dashboardStats, type DashboardStats } from "@/lib/mock/api";
import { getVisa, countryName } from "@/lib/mock/data";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui";
import { Clock3, CheckCircle2, FileStack, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  return (
    <AdminShell>
      <Dashboard />
    </AdminShell>
  );
}

function Dashboard() {
  const { t, locale } = useI18n();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    dashboardStats().then(setStats);
  }, []);

  const maxByType = stats ? Math.max(1, ...stats.byType.map((b) => b.count)) : 1;

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <span className="eyebrow">{t.admin.nav.dashboard}</span>
        <h1 className="display-xl mt-2 text-3xl">{t.admin.dash.title}</h1>
        <p className="mt-1.5 text-ink-soft">{t.admin.dash.lead}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Clock3 className="h-5 w-5" strokeWidth={1.7} />}
          tone="oro"
          value={stats?.pending}
          label={t.admin.dash.pending}
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" strokeWidth={1.7} />}
          tone="success"
          value={stats?.approvedToday}
          label={t.admin.dash.approvedToday}
        />
        <StatCard
          icon={<FileStack className="h-5 w-5" strokeWidth={1.7} />}
          tone="azul"
          value={stats?.total}
          label={t.admin.queue.title}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        {/* by type */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold">{t.admin.dash.byType}</h2>
          <ul className="mt-5 space-y-4">
            {stats?.byType.map((b) => {
              const visa = getVisa(b.type)!;
              return (
                <li key={b.type}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-ink-soft">{visa.name[locale]}</span>
                    <span className="font-medium tabular-nums">{b.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-paper-deep">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-azul),var(--color-azul-bright))]"
                      style={{ width: `${(b.count / maxByType) * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* recent */}
        <Card className="flex flex-col p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">{t.admin.dash.recent}</h2>
            <Link href="/admin/queue" className="inline-flex items-center gap-1 text-xs font-medium text-azul transition-[gap] hover:gap-2">
              {t.admin.dash.queueCta}
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-line">
            {stats?.recent.map((a) => (
              <li key={a.reference}>
                <Link
                  href={`/admin/applications/${a.reference}`}
                  className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-ink/3 -mx-2 px-2 rounded-lg"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {a.firstName} {a.lastName}
                    </div>
                    <div className="truncate text-xs text-muted">
                      {getVisa(a.visaType)!.name[locale]} · {countryName(a.nationality, locale)}
                    </div>
                  </div>
                  <StatusBadge status={a.status} />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  tone,
  value,
  label,
}: {
  icon: React.ReactNode;
  tone: "oro" | "success" | "azul";
  value: number | undefined;
  label: string;
}) {
  const toneCls = {
    oro: "bg-oro/12 text-[#8a6310]",
    success: "bg-success/12 text-success",
    azul: "bg-azul/10 text-azul",
  }[tone];
  return (
    <Card className="p-6">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${toneCls}`}>{icon}</span>
      <div className="mt-4 font-display text-4xl tabular-nums">
        {value === undefined ? <span className="text-line-strong">—</span> : value}
      </div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </Card>
  );
}
