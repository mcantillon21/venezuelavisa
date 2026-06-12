"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";
import { getApplication, decideApplication } from "@/lib/mock/api";
import { getVisa, countryName, type Application, type AppStatus } from "@/lib/mock/data";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button, Card, Textarea } from "@/components/ui";
import { VisaIcon } from "@/components/icons";
import {
  ArrowLeft,
  Check,
  X,
  HelpCircle,
  FileText,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function DetailPage() {
  return (
    <AdminShell>
      <Detail />
    </AdminShell>
  );
}

function Detail() {
  const { t, locale } = useI18n();
  const { reference } = useParams<{ reference: string }>();
  const [app, setApp] = useState<Application | null | undefined>(undefined);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState<AppStatus | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getApplication(reference).then(setApp);
  }, [reference]);

  async function decide(status: AppStatus) {
    setSaving(status);
    const updated = await decideApplication(reference, status, note);
    setApp(updated);
    setNote("");
    setSaving(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2600);
  }

  if (app === undefined)
    return (
      <div className="mx-auto max-w-4xl">
        <div className="h-40 animate-pulse rounded-2xl bg-paper-deep/40" />
      </div>
    );

  if (app === null)
    return (
      <div className="mx-auto max-w-4xl">
        <Link href="/admin/queue" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> {t.admin.nav.queue}
        </Link>
        <p className="mt-8 text-muted">404 · {reference}</p>
      </div>
    );

  const visa = getVisa(app.visaType)!;
  const decided = app.status === "approved" || app.status === "rejected";

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/queue" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" strokeWidth={1.8} /> {t.admin.nav.queue}
      </Link>

      {/* header */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-azul/8 text-azul">
            <VisaIcon visa={visa} className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-xl font-semibold">
              {app.firstName} {app.lastName}
            </h1>
            <div className="font-mono text-sm text-muted">{app.reference}</div>
          </div>
        </div>
        <StatusBadge status={app.status} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* details */}
        <div className="grid gap-4">
          <Section title={t.admin.detail.applicant}>
            <Row k={t.wizard.personal.firstName} v={`${app.firstName} ${app.lastName}`} />
            <Row k={t.admin.queue.nationality} v={countryName(app.nationality, locale)} />
            <Row k={t.wizard.personal.dob} v={app.dob} />
            <Row k={t.wizard.personal.sex} v={app.sex} />
          </Section>

          <Section title={t.admin.detail.passport}>
            <Row k={t.wizard.personal.passportNo} v={app.passportNo} mono />
            <Row k={t.wizard.personal.passportExp} v={app.passportExp} />
          </Section>

          <Section title={t.admin.detail.contact}>
            <Row
              k={t.wizard.personal.email}
              v={app.email + (app.verification?.email ? ` · ✓ ${t.admin.detail.verifiedTag}` : "")}
            />
            <Row
              k={t.wizard.personal.phone}
              v={app.phone + (app.verification?.phone ? ` · ✓ ${t.admin.detail.verifiedTag}` : "")}
            />
            {app.paymentRef && <Row k={t.admin.detail.payment} v={app.paymentRef} mono />}
          </Section>

          <Section title={t.admin.detail.travel}>
            <Row k={t.wizard.travel.arrival} v={app.arrival} />
            <Row k={t.wizard.travel.departure} v={app.departure} />
            <Row k={t.wizard.travel.port} v={app.port} />
            <Row k={t.wizard.travel.address} v={app.addressVe} />
          </Section>

          <Section title={t.admin.detail.documents}>
            <div className="flex flex-wrap gap-2">
              <DocChip ok={app.documents.passport} label={t.wizard.documents.passportScan} />
              <DocChip ok={app.documents.photo} label={t.wizard.documents.photo} />
              <DocChip ok={app.documents.support} label={visa.supportDoc[locale]} />
            </div>
          </Section>
        </div>

        {/* decision + history */}
        <div className="grid h-fit gap-4">
          <Card className="p-6">
            <h2 className="text-sm font-semibold">{t.admin.detail.decision}</h2>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t.admin.detail.notePh}
              className="mt-3"
            />
            <div className="mt-3 grid gap-2">
              <Button variant="primary" onClick={() => decide("approved")} disabled={saving !== null}>
                {saving === "approved" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" strokeWidth={2} />}
                {t.admin.detail.approve}
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={() => decide("info")} disabled={saving !== null}>
                  {saving === "info" ? <Loader2 className="h-4 w-4 animate-spin" /> : <HelpCircle className="h-4 w-4" strokeWidth={1.8} />}
                  {t.admin.detail.requestInfo}
                </Button>
                <Button variant="danger" onClick={() => decide("rejected")} disabled={saving !== null}>
                  {saving === "rejected" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" strokeWidth={2} />}
                  {t.admin.detail.reject}
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {saved && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm font-medium text-success"
                >
                  <CheckCircle2 className="h-4 w-4" strokeWidth={1.8} />
                  {t.admin.detail.decided}
                </motion.div>
              )}
            </AnimatePresence>

            {decided && !saved && (
              <p className="mt-3 text-xs text-muted">{t.status[app.status]}</p>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold">{t.admin.detail.history}</h2>
            <ol className="mt-4 space-y-0">
              {app.timeline.map((ev, i) => (
                <li key={i} className="relative flex gap-3 pb-5 last:pb-0">
                  {i < app.timeline.length - 1 && (
                    <span className="absolute left-[6px] top-3.5 h-full w-px bg-line-strong" />
                  )}
                  <span className="relative z-10 mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-white bg-azul shadow-[0_0_0_1px_var(--color-line-strong)]" />
                  <div className="-mt-0.5">
                    <div className="text-sm font-medium">{t.status[ev.status]}</div>
                    <time className="text-xs text-muted">{fmt(ev.at, locale)}</time>
                    {ev.note && <p className="mt-0.5 text-sm text-ink-soft">{ev.note}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-6">
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      <dl className="grid gap-1.5">{children}</dl>
    </Card>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <dt className="text-muted">{k}</dt>
      <dd className={`text-right font-medium text-ink ${mono ? "font-mono" : ""}`}>{v}</dd>
    </div>
  );
}

function DocChip({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${
        ok ? "border-success/25 bg-success/8 text-success" : "border-line-strong bg-paper-deep/40 text-muted"
      }`}
    >
      <FileText className="h-3.5 w-3.5" strokeWidth={1.7} />
      {label}
      {ok && <Check className="h-3.5 w-3.5" strokeWidth={2.2} />}
    </span>
  );
}

function fmt(iso: string, locale: "es" | "en") {
  return new Date(iso).toLocaleString(locale === "es" ? "es-VE" : "en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
