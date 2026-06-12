"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";
import { COUNTRIES, PORTS, VISA_TYPES, getVisa, type VisaCategory } from "@/lib/mock/data";
import { submitApplication, type DraftApplication } from "@/lib/mock/api";
import { VisaIcon, BrandMark } from "@/components/icons";
import { VerifyControl } from "@/components/verify-control";
import { AddressField } from "@/components/address-field";
import { Button, Field, Input, Select, buttonClasses } from "@/components/ui";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  UploadCloud,
  FileCheck2,
  FileText,
  X,
  Pencil,
  Loader2,
  PartyPopper,
  Copy,
} from "lucide-react";

type StepId = "eligibility" | "personal" | "travel" | "documents" | "review";
const STEPS: StepId[] = ["eligibility", "personal", "travel", "documents", "review"];

type Draft = Omit<DraftApplication, "visaType"> & { visaType: VisaCategory };

const emptyDraft = (visaType: VisaCategory): Draft => ({
  visaType,
  firstName: "",
  lastName: "",
  nationality: "",
  sex: "M",
  dob: "",
  passportNo: "",
  passportExp: "",
  email: "",
  phone: "",
  purpose: "",
  arrival: "",
  departure: "",
  port: "",
  addressVe: "",
  documents: { passport: false, photo: false, support: false },
});

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-6 py-24 text-muted">…</div>}>
      <Wizard />
    </Suspense>
  );
}

function Wizard() {
  const { t, locale } = useI18n();
  const params = useSearchParams();
  const typeParam = params.get("type") as VisaCategory | null;
  const cameWithType = typeParam !== null && Boolean(getVisa(typeParam));

  const [draft, setDraft] = useState<Draft>(() => emptyDraft(cameWithType ? typeParam : "tourist"));
  // a bare /apply visit must pick a visa type explicitly — no silent default
  const [typeChosen, setTypeChosen] = useState(cameWithType);
  const [stepIdx, setStepIdx] = useState(0);
  const [passportOk, setPassportOk] = useState<boolean | null>(null);
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  // verification proofs (signed by /api/verify/check) + the value they cover
  const [emailProof, setEmailProof] = useState<string | null>(null);
  const [emailFor, setEmailFor] = useState("");
  const [phoneProof, setPhoneProof] = useState<string | null>(null);
  const [phoneFor, setPhoneFor] = useState("");
  // payment
  const [paySheet, setPaySheet] = useState<{ paymentId: string; amountUsd: number } | null>(null);

  const visa = getVisa(draft.visaType)!;
  const step = STEPS[stepIdx];

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  // proofs only count for the exact value they verified
  const emailVerified = Boolean(emailProof) && draft.email.trim().toLowerCase() === emailFor;

  const valid = useMemo(
    () => stepValid(step, draft, passportOk, agree, typeChosen, emailVerified),
    [step, draft, passportOk, agree, typeChosen, emailVerified],
  );

  const go = (i: number) => setStepIdx(Math.max(0, Math.min(STEPS.length - 1, i)));

  async function finalize(paymentRef: string) {
    setSubmitting(true);
    const app = await submitApplication({
      ...draft,
      purpose: draft.purpose || visa.name.en,
      verification: { email: emailVerified, phone: Boolean(phoneProof) },
      paymentRef,
    });
    localStorage.removeItem("vv-pending-draft");
    setReference(app.reference);
    setSubmitting(false);
  }

  async function onPay() {
    setSubmitting(true);
    const res = await fetch("/api/payments/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visaType: draft.visaType, origin: window.location.origin }),
    });
    const data = await res.json();
    if (data.demo) {
      setSubmitting(false);
      setPaySheet({ paymentId: data.paymentId, amountUsd: data.amountUsd });
    } else if (data.url) {
      // Stripe redirect loses React state: park the draft, restore on return
      localStorage.setItem(
        "vv-pending-draft",
        JSON.stringify({ draft, emailProof, emailFor, phoneProof, phoneFor }),
      );
      window.location.href = data.url;
    } else {
      setSubmitting(false);
    }
  }

  // returning from Stripe Checkout
  const paid = params.get("paid");
  const sessionId = params.get("session_id");
  useEffect(() => {
    if (!paid) return;
    const raw = localStorage.getItem("vv-pending-draft");
    if (!raw) return;
    const saved = JSON.parse(raw);
    setDraft(saved.draft);
    setTypeChosen(true);
    setEmailProof(saved.emailProof);
    setEmailFor(saved.emailFor);
    setPhoneProof(saved.phoneProof);
    setPhoneFor(saved.phoneFor);
    setAgree(true);
    setStepIdx(STEPS.length - 1);
    if (paid === "1" && sessionId) {
      fetch(`/api/payments/confirm?session_id=${encodeURIComponent(sessionId)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.paid) {
            setSubmitting(true);
            return submitApplication({
              ...saved.draft,
              verification: {
                email: Boolean(saved.emailProof),
                phone: Boolean(saved.phoneProof),
              },
              paymentRef: d.reference,
            }).then((app) => {
              localStorage.removeItem("vv-pending-draft");
              setReference(app.reference);
              setSubmitting(false);
            });
          }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paid, sessionId]);

  if (reference) return <Confirmation reference={reference} email={draft.email} />;

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-6">
      {/* context header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-azul/8 text-azul">
            {typeChosen ? <VisaIcon visa={visa} /> : <FileText className="h-5 w-5" strokeWidth={1.6} />}
          </span>
          <div>
            <span className="eyebrow">{t.wizard.title}</span>
            <h1 className="text-lg font-semibold">
              {typeChosen ? visa.name[locale] : t.wizard.eligibility.visaTypePh}
            </h1>
          </div>
        </div>
        {typeChosen && <span className="font-display text-2xl text-line-strong">${visa.feeUsd}</span>}
      </div>

      <Stepper stepIdx={stepIdx} onJump={go} />

      <div className="card mt-6 p-6 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === "eligibility" && (
              <StepEligibility
                draft={draft}
                set={set}
                passportOk={passportOk}
                setPassportOk={setPassportOk}
                typeChosen={typeChosen}
                onChooseType={(v) => {
                  set("visaType", v);
                  setTypeChosen(true);
                }}
              />
            )}
            {step === "personal" && (
              <StepPersonal
                draft={draft}
                set={set}
                emailProof={emailVerified ? emailProof : null}
                onEmailProof={(p, v) => {
                  setEmailProof(p);
                  setEmailFor(v.toLowerCase());
                }}
                phoneProof={phoneProof && draft.phone === phoneFor ? phoneProof : null}
                onPhoneProof={(p, v) => {
                  setPhoneProof(p);
                  setPhoneFor(v);
                  set("phone", v);
                }}
              />
            )}
            {step === "travel" && <StepTravel draft={draft} set={set} />}
            {step === "documents" && <StepDocuments draft={draft} set={set} />}
            {step === "review" && <StepReview draft={draft} onEdit={go} agree={agree} setAgree={setAgree} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* nav */}
      <div className="mt-6 flex items-center justify-between">
        {stepIdx > 0 ? (
          <Button variant="ghost" onClick={() => go(stepIdx - 1)}>
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            {t.common.back}
          </Button>
        ) : (
          <Link href="/visas" className={buttonClasses("ghost", "md")}>
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            {t.nav.visas}
          </Link>
        )}

        {step !== "review" ? (
          <Button onClick={() => go(stepIdx + 1)} disabled={!valid}>
            {t.common.continue}
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1" strokeWidth={2} />
          </Button>
        ) : (
          <Button onClick={onPay} disabled={!valid || submitting} variant="gold" size="lg">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" strokeWidth={2} />}
            {t.wizard.pay.cta}
          </Button>
        )}
      </div>

      {paySheet && (
        <PaymentSheet
          amountUsd={paySheet.amountUsd}
          busy={submitting}
          onPaid={() => finalize(paySheet.paymentId)}
          onClose={() => setPaySheet(null)}
        />
      )}
    </div>
  );
}

/* ---------- demo payment sheet -------------------------------- */
function PaymentSheet({
  amountUsd,
  busy,
  onPaid,
  onClose,
}: {
  amountUsd: number;
  busy: boolean;
  onPaid: () => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [processing, setProcessing] = useState(false);

  function pay() {
    setProcessing(true);
    // simulate card network latency, then hand control back to the wizard
    setTimeout(onPaid, 1300);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 backdrop-blur-sm sm:items-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="card w-full max-w-sm p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">{t.wizard.pay.sheetTitle}</h2>
          <button onClick={onClose} className="text-muted hover:text-ink" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1.5 text-xs text-muted">{t.wizard.pay.sheetDemo}</p>

        <div className="mt-5 rounded-xl border border-line bg-paper-deep/40 p-4">
          <div className="font-mono text-sm tracking-wider text-ink-soft">4242 4242 4242 4242</div>
          <div className="mt-1.5 flex justify-between font-mono text-xs text-muted">
            <span>12 / 28</span>
            <span>CVC 424</span>
          </div>
        </div>

        <Button
          variant="gold"
          size="lg"
          className="mt-5 w-full"
          onClick={pay}
          disabled={processing || busy}
        >
          {processing || busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t.wizard.pay.processing}
            </>
          ) : (
            <>{t.wizard.pay.payNow} ${amountUsd}.00</>
          )}
        </Button>
      </motion.div>
    </div>
  );
}

/* ---------- stepper ------------------------------------------ */
function Stepper({ stepIdx, onJump }: { stepIdx: number; onJump: (i: number) => void }) {
  const { t } = useI18n();
  return (
    <ol className="mt-8 flex items-center gap-1.5">
      {STEPS.map((s, i) => {
        const done = i < stepIdx;
        const current = i === stepIdx;
        return (
          <li key={s} className="flex flex-1 flex-col gap-2">
            <button
              onClick={() => i <= stepIdx && onJump(i)}
              disabled={i > stepIdx}
              className={`h-1.5 w-full rounded-full transition-colors ${
                done || current ? "bg-azul" : "bg-line-strong"
              } ${i <= stepIdx ? "cursor-pointer" : "cursor-default"}`}
              aria-current={current ? "step" : undefined}
            />
            <span
              className={`hidden text-xs font-medium sm:block ${
                current ? "text-azul" : done ? "text-ink-soft" : "text-muted"
              }`}
            >
              {t.wizard.steps[s]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/* ---------- steps -------------------------------------------- */
function StepHead({ title, lead }: { title: string; lead: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-display text-2xl">{title}</h2>
      <p className="mt-1.5 text-sm text-ink-soft">{lead}</p>
    </div>
  );
}

type StepProps = { draft: Draft; set: <K extends keyof Draft>(k: K, v: Draft[K]) => void };

function StepEligibility({
  draft,
  set,
  passportOk,
  setPassportOk,
  typeChosen,
  onChooseType,
}: StepProps & {
  passportOk: boolean | null;
  setPassportOk: (b: boolean) => void;
  typeChosen: boolean;
  onChooseType: (v: VisaCategory) => void;
}) {
  const { t, locale } = useI18n();
  return (
    <div>
      <StepHead title={t.wizard.eligibility.title} lead={t.wizard.eligibility.lead} />
      <div className="grid gap-5">
        <Field label={t.wizard.eligibility.visaType} required>
          <Select
            value={typeChosen ? draft.visaType : ""}
            onChange={(e) => onChooseType(e.target.value as VisaCategory)}
          >
            <option value="" disabled>
              {t.wizard.eligibility.visaTypePh}
            </option>
            {VISA_TYPES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name[locale]} · ${v.feeUsd}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={t.wizard.eligibility.nationality} required>
          <Select value={draft.nationality} onChange={(e) => set("nationality", e.target.value)}>
            <option value="" disabled>
              {t.wizard.eligibility.nationalityPh}
            </option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c[locale]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={t.wizard.eligibility.purpose}>
          <Input value={draft.purpose} onChange={(e) => set("purpose", e.target.value)} placeholder={typeChosen ? getVisa(draft.visaType)!.tagline[locale] : ""} />
        </Field>

        <div>
          <span className="text-sm font-medium text-ink-soft">{t.wizard.eligibility.passportValid} <span className="text-rojo">*</span></span>
          <div className="mt-2 flex gap-2">
            <Choice active={passportOk === true} onClick={() => setPassportOk(true)} label={t.wizard.eligibility.yes} />
            <Choice active={passportOk === false} onClick={() => setPassportOk(false)} label={t.wizard.eligibility.no} />
          </div>
          {passportOk === false && (
            <p className="mt-2 text-sm text-danger">{t.wizard.eligibility.warnPassport}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Choice({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`h-11 flex-1 rounded-xl border text-sm font-medium transition-colors cursor-pointer active:scale-[0.98] ${
        active ? "border-azul bg-azul/8 text-azul" : "border-line-strong text-ink-soft hover:border-azul/40"
      }`}
    >
      {label}
    </button>
  );
}

function StepPersonal({
  draft,
  set,
  emailProof,
  onEmailProof,
  phoneProof,
  onPhoneProof,
}: StepProps & {
  emailProof: string | null;
  onEmailProof: (proof: string | null, v: string) => void;
  phoneProof: string | null;
  onPhoneProof: (proof: string | null, v: string) => void;
}) {
  const { t } = useI18n();
  return (
    <div>
      <StepHead title={t.wizard.personal.title} lead={t.wizard.personal.lead} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.wizard.personal.firstName} required>
          <Input value={draft.firstName} onChange={(e) => set("firstName", e.target.value)} autoComplete="given-name" />
        </Field>
        <Field label={t.wizard.personal.lastName} required>
          <Input value={draft.lastName} onChange={(e) => set("lastName", e.target.value)} autoComplete="family-name" />
        </Field>
        <Field label={t.wizard.personal.dob} required>
          <Input type="date" value={draft.dob} onChange={(e) => set("dob", e.target.value)} />
        </Field>
        <Field label={t.wizard.personal.sex} required>
          <Select value={draft.sex} onChange={(e) => set("sex", e.target.value as Draft["sex"])}>
            <option value="M">{t.wizard.personal.sexM}</option>
            <option value="F">{t.wizard.personal.sexF}</option>
            <option value="X">{t.wizard.personal.sexX}</option>
          </Select>
        </Field>
        <Field label={t.wizard.personal.passportNo} required>
          <Input value={draft.passportNo} onChange={(e) => set("passportNo", e.target.value.toUpperCase())} className="font-mono" />
        </Field>
        <Field label={t.wizard.personal.passportExp} required>
          <Input type="date" value={draft.passportExp} onChange={(e) => set("passportExp", e.target.value)} />
        </Field>
        <div className="flex flex-col gap-2">
          <Field label={t.wizard.personal.email} required>
            <Input type="email" value={draft.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />
          </Field>
          <VerifyControl channel="email" value={draft.email} proof={emailProof} onProof={onEmailProof} />
        </div>
        <div className="flex flex-col gap-2">
          <Field label={t.wizard.personal.phone} required>
            <Input type="tel" value={draft.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" />
          </Field>
          <VerifyControl channel="phone" value={draft.phone} proof={phoneProof} onProof={onPhoneProof} />
        </div>
      </div>
      {!emailProof && (
        <p className="mt-4 text-xs text-muted">{t.wizard.verify.emailGate}</p>
      )}
    </div>
  );
}

function StepTravel({ draft, set }: StepProps) {
  const { t } = useI18n();
  return (
    <div>
      <StepHead title={t.wizard.travel.title} lead={t.wizard.travel.lead} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.wizard.travel.arrival} required>
          <Input type="date" value={draft.arrival} onChange={(e) => set("arrival", e.target.value)} />
        </Field>
        <Field label={t.wizard.travel.departure} required>
          <Input type="date" value={draft.departure} onChange={(e) => set("departure", e.target.value)} />
        </Field>
        <Field label={t.wizard.travel.port} required className="sm:col-span-2">
          <Select value={draft.port} onChange={(e) => set("port", e.target.value)}>
            <option value="" disabled>
              —
            </option>
            {/* ports come from data; imported lazily to keep file lean */}
            {PORTS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t.wizard.travel.address} required className="sm:col-span-2">
          <AddressField value={draft.addressVe} onChange={(v) => set("addressVe", v)} placeholder={t.wizard.travel.addressPh} />
        </Field>
      </div>
    </div>
  );
}

function StepDocuments({ draft, set }: StepProps) {
  const { t, locale } = useI18n();
  const visa = getVisa(draft.visaType)!;
  const setDoc = (k: keyof Draft["documents"], v: boolean) =>
    set("documents", { ...draft.documents, [k]: v });
  return (
    <div>
      <StepHead title={t.wizard.documents.title} lead={t.wizard.documents.lead} />
      <div className="grid gap-4">
        <Dropzone label={t.wizard.documents.passportScan} hint={t.wizard.documents.passportScanHint} done={draft.documents.passport} onDone={(v) => setDoc("passport", v)} />
        <Dropzone label={t.wizard.documents.photo} hint={t.wizard.documents.photoHint} done={draft.documents.photo} onDone={(v) => setDoc("photo", v)} />
        <Dropzone label={visa.supportDoc[locale]} hint={t.wizard.documents.supportHint} done={draft.documents.support} onDone={(v) => setDoc("support", v)} />
      </div>
    </div>
  );
}

function Dropzone({
  label,
  hint,
  done,
  onDone,
}: {
  label: string;
  hint?: string;
  done: boolean;
  onDone: (v: boolean) => void;
}) {
  const { t } = useI18n();
  const [name, setName] = useState<string>("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(f: File) {
    setName(f.name);
    setError(null);
    setChecking(true);
    const fd = new FormData();
    fd.append("file", f);
    try {
      const res = await fetch("/api/documents/validate", { method: "POST", body: fd });
      const data = await res.json();
      setChecking(false);
      if (data.ok) {
        onDone(true);
      } else {
        const code = (data.issues?.[0] ?? "upload") as string;
        const msgs = t.wizard.docs as unknown as Record<string, string>;
        setError(msgs[`err_${code}`] ?? msgs.err_upload);
      }
    } catch {
      setChecking(false);
      setError(t.wizard.docs.err_upload);
    }
  }

  return (
    <div>
      <div className="mb-1.5 flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
        <span className="text-sm font-medium text-ink-soft">{label}</span>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </div>
      {done ? (
        <div className="flex items-center justify-between rounded-xl border border-success/30 bg-success/8 px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-medium text-success">
            <FileCheck2 className="h-4 w-4" strokeWidth={1.8} />
            {name || t.wizard.documents.uploaded}
            <span className="rounded-full bg-success/15 px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide">
              {t.wizard.docs.checked}
            </span>
          </span>
          <button onClick={() => { onDone(false); setName(""); }} className="text-muted hover:text-danger" aria-label={t.wizard.documents.remove}>
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          className={`flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 py-3.5 text-sm transition-colors ${
            error
              ? "border-danger/40 bg-danger/5 text-danger"
              : "border-line-strong bg-paper-deep/30 text-muted hover:border-azul/40 hover:bg-azul/4"
          }`}
        >
          {checking ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-azul" strokeWidth={1.6} />
              {t.wizard.docs.checking}
            </>
          ) : (
            <>
              <UploadCloud className="h-5 w-5 text-azul" strokeWidth={1.6} />
              {error ?? t.wizard.documents.drop}
            </>
          )}
          <input
            type="file"
            accept="image/png,image/jpeg,application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
              e.target.value = "";
            }}
          />
        </label>
      )}
    </div>
  );
}

function StepReview({
  draft,
  onEdit,
  agree,
  setAgree,
}: {
  draft: Draft;
  onEdit: (i: number) => void;
  agree: boolean;
  setAgree: (b: boolean) => void;
}) {
  const { t, locale } = useI18n();
  const visa = getVisa(draft.visaType)!;
  return (
    <div>
      <StepHead title={t.wizard.review.title} lead={t.wizard.review.lead} />

      <div className="grid gap-3">
        <ReviewBlock title={t.wizard.steps.personal} onEdit={() => onEdit(1)}>
          <Row k={t.wizard.personal.firstName} v={`${draft.firstName} ${draft.lastName}`} />
          <Row k={t.wizard.eligibility.nationality} v={COUNTRIES.find((c) => c.code === draft.nationality)?.[locale] ?? "—"} />
          <Row k={t.wizard.personal.passportNo} v={draft.passportNo} mono />
          <Row k={t.wizard.personal.email} v={draft.email} />
        </ReviewBlock>

        <ReviewBlock title={t.wizard.steps.travel} onEdit={() => onEdit(2)}>
          <Row k={t.wizard.travel.arrival} v={draft.arrival || "—"} />
          <Row k={t.wizard.travel.departure} v={draft.departure || "—"} />
          <Row k={t.wizard.travel.port} v={draft.port || "—"} />
          <Row k={t.wizard.travel.address} v={draft.addressVe || "—"} />
        </ReviewBlock>

        <ReviewBlock title={t.wizard.steps.documents} onEdit={() => onEdit(3)}>
          <Row k={t.wizard.documents.passportScan} v={mark(draft.documents.passport)} />
          <Row k={t.wizard.documents.photo} v={mark(draft.documents.photo)} />
          <Row k={visa.supportDoc[locale]} v={mark(draft.documents.support)} />
        </ReviewBlock>
      </div>

      <div className="glass-deep mt-5 flex items-center justify-between rounded-2xl px-6 py-5">
        <div>
          <div className="text-xs uppercase tracking-wider text-white/60">{t.wizard.review.total}</div>
          <div className="font-display text-3xl text-white">${visa.feeUsd}.00</div>
        </div>
        <p className="max-w-[12rem] text-right text-xs text-white/60">{t.wizard.review.payNote}</p>
      </div>

      <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm text-ink-soft">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[var(--color-azul)]"
        />
        {t.wizard.review.declaration}
      </label>
    </div>
  );
}

function ReviewBlock({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="rounded-2xl border border-line bg-paper-deep/30 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button onClick={onEdit} className="inline-flex items-center gap-1 text-xs font-medium text-azul hover:underline">
          <Pencil className="h-3 w-3" strokeWidth={2} />
          {t.wizard.review.edit}
        </button>
      </div>
      <dl className="grid gap-1.5">{children}</dl>
    </div>
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

function mark(b: boolean) {
  return b ? "✓" : "—";
}

/* ---------- confirmation ------------------------------------- */
function Confirmation({ reference, email }: { reference: string; email: string }) {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-2xl px-5 py-20 sm:px-6">
      <motion.div
        className="card overflow-hidden p-8 text-center sm:p-12"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-success/12 text-success">
          <PartyPopper className="h-8 w-8" strokeWidth={1.6} />
        </div>
        <h1 className="display-xl mt-6 text-3xl">{t.confirm.title}</h1>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">{t.confirm.lead}</p>

        <div className="mx-auto mt-8 flex max-w-sm items-center justify-between gap-3 rounded-2xl border border-line bg-paper-deep/40 px-5 py-4">
          <div className="text-left">
            <div className="text-xs uppercase tracking-wider text-muted">{t.confirm.reference}</div>
            <div className="font-mono text-lg font-semibold text-azul">{reference}</div>
          </div>
          <button
            onClick={() => navigator.clipboard?.writeText(reference)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line-strong text-muted hover:text-azul"
            aria-label="Copy"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-3 text-xs text-muted">{t.confirm.emailed} · {email}</p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={`/track?ref=${reference}`} className={buttonClasses("primary", "md")}>
            {t.confirm.trackCta}
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1" strokeWidth={2} />
          </Link>
          <Link href="/" className={buttonClasses("secondary", "md")}>
            {t.confirm.homeCta}
          </Link>
        </div>

        <div className="tricolor-rule mx-auto mt-10 w-20" />
      </motion.div>
    </div>
  );
}

function stepValid(
  step: StepId,
  d: Draft,
  passportOk: boolean | null,
  agree: boolean,
  typeChosen: boolean,
  emailVerified: boolean,
): boolean {
  switch (step) {
    case "eligibility":
      return typeChosen && Boolean(d.nationality) && passportOk === true;
    case "personal":
      return Boolean(
        d.firstName &&
          d.lastName &&
          d.dob &&
          d.passportNo &&
          d.passportExp &&
          isEmail(d.email) &&
          emailVerified &&
          d.phone,
      );
    case "travel":
      return Boolean(d.arrival && d.departure && d.port && d.addressVe);
    case "documents":
      return d.documents.passport && d.documents.photo;
    case "review":
      return agree;
  }
}

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}
