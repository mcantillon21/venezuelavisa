"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { BrandMark } from "@/components/icons";
import { Code2 } from "lucide-react";

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="mt-auto border-t border-line/70 bg-paper-deep/40">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6">
        <div className="tricolor-rule mb-8 w-24" />
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <BrandMark className="h-8 w-8" />
              <span className="text-sm font-semibold">{t.brand.name}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">{t.brand.sub}</p>
            <p className="mt-2 text-xs text-muted">{t.footer.rights}</p>
          </div>

          <div className="flex flex-wrap gap-x-12 gap-y-6 text-sm">
            <nav className="flex flex-col gap-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                {t.nav.visas}
              </span>
              <Link href="/visas" className="text-muted hover:text-azul">{t.nav.visas}</Link>
              <Link href="/apply" className="text-muted hover:text-azul">{t.nav.apply}</Link>
              <Link href="/track" className="text-muted hover:text-azul">{t.nav.track}</Link>
            </nav>
            <nav className="flex flex-col gap-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                {t.footer.builtBy}
              </span>
              <a
                href="https://github.com/mcantillon21/venezuelavisa"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1.5 text-muted hover:text-azul"
              >
                <Code2 className="h-4 w-4" strokeWidth={1.6} />
                {t.footer.sourceCode}
              </a>
              <Link href="#" className="text-muted hover:text-azul">{t.footer.accessibility}</Link>
              <Link href="#" className="text-muted hover:text-azul">{t.footer.privacy}</Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
