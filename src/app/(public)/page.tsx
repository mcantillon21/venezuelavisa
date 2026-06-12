"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";
import { VISA_TYPES } from "@/lib/mock/data";
import { VisaIcon } from "@/components/icons";
import { Accordion } from "@/components/accordion";
import { buttonClasses } from "@/components/ui";
import { ArrowRight, Lock, Accessibility, GitBranch } from "lucide-react";

const STAGGER = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } } };
const ITEM = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function HomePage() {
  const { t, locale } = useI18n();

  return (
    <div>
      {/* ---- hero ---------------------------------------------- */}
      <section className="relative px-5 pt-20 pb-16 text-center sm:px-6 lg:pt-28">
        <motion.div
          variants={STAGGER}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-4xl"
        >
          <motion.span variants={ITEM} className="eyebrow block">
            {t.home.eyebrow}
          </motion.span>
          <motion.h1 variants={ITEM} className="display-hero mt-5">
            {t.home.heroTitle.replace("\n", " ")}
          </motion.h1>
          <motion.p
            variants={ITEM}
            className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-ink-soft"
          >
            {t.home.heroLead}
          </motion.p>
          <motion.div variants={ITEM} className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/apply" className={buttonClasses("primary", "lg")}>
              {t.home.ctaPrimary}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1" strokeWidth={2} />
            </Link>
            <Link href="/visas" className={buttonClasses("secondary", "lg")}>
              {t.home.ctaSecondary}
            </Link>
          </motion.div>
          <motion.div
            variants={ITEM}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm text-muted"
          >
            <Trust icon={<Lock className="h-4 w-4" strokeWidth={1.6} />} label={t.home.trust1} />
            <Trust icon={<Accessibility className="h-4 w-4" strokeWidth={1.6} />} label={t.home.trust2} />
            <a
              href="https://github.com/mcantillon21/venezuelavisa"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 text-ink-soft transition-colors hover:text-azul"
            >
              <span className="text-oro">
                <GitBranch className="h-4 w-4" strokeWidth={1.6} />
              </span>
              {t.home.trust3}
            </a>
          </motion.div>
        </motion.div>

        <GoldCard locale={locale} />
      </section>

      {/* ---- visa types ---------------------------------------- */}
      <section className="mx-auto max-w-6xl px-5 pt-24 pb-20 sm:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <h2 className="display-xl max-w-xl text-3xl sm:text-[2.6rem]">{t.home.benefitsTitle}</h2>
          <Link href="/visas" className="inline-flex items-center gap-1.5 text-sm font-medium text-azul transition-[gap] hover:gap-2.5">
            {t.nav.visas}
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VISA_TYPES.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={`/apply?type=${v.id}`}
                className="card group flex h-full flex-col p-6 transition-colors duration-300 hover:bg-paper-deep"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-azul/8 text-azul transition-colors group-hover:bg-azul group-hover:text-white">
                    <VisaIcon visa={v} />
                  </span>
                  <div>
                    <h3 className="font-semibold tracking-tight">{v.name[locale]}</h3>
                    <p className="text-xs text-muted">{v.tagline[locale]}</p>
                  </div>
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">{v.description[locale]}</p>
                <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-sm">
                  <span className="font-display text-lg tabular-nums text-ink">${v.feeUsd}</span>
                  <span className="inline-flex items-center gap-1 text-azul opacity-0 transition-opacity group-hover:opacity-100">
                    {t.visa.selectThis}
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---- statement band ------------------------------------ */}
      <section className="section-dark">
        <div className="mx-auto max-w-5xl px-5 py-24 text-center sm:px-6 sm:py-32">
          <span className="eyebrow">{t.home.statementEyebrow}</span>
          <motion.blockquote
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="display-xl mx-auto mt-6 max-w-4xl text-[2rem] leading-[1.08] sm:text-[3rem]"
          >
            {t.home.statement}
          </motion.blockquote>
          <div className="tricolor-rule mx-auto mt-10 w-24" />
          <p className="mt-5 font-mono text-xs uppercase tracking-[0.04em] text-white/55">
            {t.home.statementAuthor}
          </p>
        </div>
      </section>

      {/* ---- FAQ ----------------------------------------------- */}
      <section className="mx-auto max-w-3xl px-5 py-24 sm:px-6">
        <div className="mb-4 text-center">
          <h2 className="display-xl text-3xl sm:text-5xl">{t.home.faqTitle}</h2>
          <p className="mt-3 text-ink-soft">{t.home.faqLead}</p>
        </div>
        <div className="mt-8">
          <Accordion items={t.faq} />
        </div>
      </section>

      {/* ---- final CTA ----------------------------------------- */}
      <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-6">
        <div className="section-dark relative overflow-hidden rounded-[2rem] px-8 py-16 text-center sm:px-14">
          <div className="absolute -inset-x-20 -top-24 -z-0 h-64 bg-[radial-gradient(40rem_16rem_at_50%_0%,rgba(199,154,58,0.22),transparent_70%)]" />
          <div className="relative">
            <h2 className="display-xl mx-auto max-w-2xl text-3xl sm:text-5xl">{t.home.heroTitle.replace("\n", " ")}</h2>
            <Link href="/apply" className={buttonClasses("gold", "lg", "mt-8")}>
              {t.common.getStarted}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---- pieces -------------------------------------------------- */

function Trust({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-ink-soft">
      <span className="text-oro">{icon}</span>
      {label}
    </span>
  );
}

function GoldCard({ locale }: { locale: "es" | "en" }) {
  const L =
    locale === "es"
      ? { kind: "VISA ELECTRÓNICA", holder: "Titular", ref: "Referencia", valid: "Vigencia" }
      : { kind: "ELECTRONIC VISA", holder: "Holder", ref: "Reference", valid: "Validity" };

  const ref = useRef<HTMLDivElement>(null);

  // NOX-style: write CSS vars; a registered-property transition eases them.
  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    const r = el?.getBoundingClientRect();
    if (!el || !r) return;
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", String((0.5 - y) * 16));
    el.style.setProperty("--ry", String((x - 0.5) * 20));
    // slide the oversized gradient: the diagonal sheen tracks the cursor
    el.style.setProperty("--bx", String(Math.round(x * 100)));
    el.style.setProperty("--by", String(Math.round(y * 100)));
  }
  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0");
    el.style.setProperty("--ry", "0");
    el.style.setProperty("--bx", "50");
    el.style.setProperty("--by", "50");
  }

  return (
    <motion.div
      className="card-stage relative z-20 mx-auto mt-16 w-full max-w-lg"
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
    >
      <div>
        <div
          ref={ref}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          className="goldcard mcard-tilt aspect-[1.6/1] p-7 text-left"
        >
          <div className="flex items-start justify-between">
            <div className="gold-emboss font-mono text-[0.6rem] uppercase tracking-[0.14em]">
              {L.kind}
            </div>
            <StarArc />
          </div>

          <div className="mt-5 gold-emboss font-display text-2xl font-bold leading-none tracking-tight sm:text-[1.9rem]">
            República Bolivariana
            <br />
            de Venezuela
          </div>

          {/* chip */}
          <div className="mt-6 h-7 w-10 rounded-md bg-[linear-gradient(135deg,#f3e3a8,#b8893055)] ring-1 ring-[#8a6a1e]/40" />

          <div className="mt-5 grid grid-cols-3 gap-3">
            <Cell label={L.holder} value="A. LAURENT" />
            <Cell label={L.valid} value="12 · 2026" />
            <Cell label={L.ref} value="VE-2026-004871" mono />
          </div>

          <div className="tricolor-rule mt-5 opacity-90" />
        </div>
      </div>
    </motion.div>
  );
}

function Cell({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="font-mono text-[0.5rem] uppercase tracking-[0.1em] text-[#8a6a1e]">{label}</div>
      <div className={`gold-emboss mt-0.5 text-[0.72rem] font-semibold ${mono ? "font-mono" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function StarArc() {
  return (
    <svg viewBox="0 0 60 26" className="h-5 w-12" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => {
        const a = Math.PI * (0.08 + (i / 7) * 0.84);
        const cx = 30 - Math.cos(a) * 24;
        const cy = 24 - Math.sin(a) * 16;
        const pts = Array.from({ length: 10 })
          .map((_, k) => {
            const ang = (Math.PI / 5) * k - Math.PI / 2;
            const r = k % 2 === 0 ? 2 : 0.9;
            return `${cx + Math.cos(ang) * r},${cy + Math.sin(ang) * r}`;
          })
          .join(" ");
        return <polygon key={i} points={pts} fill="#6b521e" />;
      })}
    </svg>
  );
}
