"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { BrandMark } from "@/components/icons";
import { LangToggle } from "@/components/lang-toggle";
import { buttonClasses } from "@/components/ui";
import { cn } from "@/lib/cn";
import { Menu, X, ShieldCheck } from "lucide-react";

export function SiteHeader() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/visas", label: t.nav.visas },
    { href: "/track", label: t.nav.track },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-line/70">
      <div className="glass">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <BrandMark className="transition-transform group-hover:-rotate-3" />
            <span className="flex flex-col leading-none">
              <span className="text-[0.95rem] font-bold tracking-[-0.03em]">
                Visa<span className="text-azul">Venezuela</span>
              </span>
              <span className="font-mono text-[0.58rem] uppercase tracking-[0.04em] text-muted">
                {t.brand.org}
              </span>
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-ink/5",
                  pathname === l.href && "text-azul",
                )}
              >
                {l.label}
              </Link>
            ))}
            <LangToggle className="ml-2" />
            <Link href="/admin" className="ml-1 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-ink">
              <ShieldCheck className="h-4 w-4" strokeWidth={1.6} />
              {t.nav.adminLogin}
            </Link>
            <Link href="/apply" className={buttonClasses("primary", "sm", "ml-1")}>
              {t.common.getStarted}
            </Link>
          </nav>

          {/* mobile: language toggle always visible, not buried in the menu */}
          <div className="ml-auto flex items-center gap-2 md:hidden">
            <LangToggle />
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink"
              onClick={() => setOpen((o) => !o)}
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-line/70 px-5 py-4 md:hidden">
            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-ink/5"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-ink/5"
              >
                {t.nav.adminLogin}
              </Link>
              <Link
                href="/apply"
                onClick={() => setOpen(false)}
                className={buttonClasses("primary", "sm", "mt-2 self-start")}
              >
                {t.common.getStarted}
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
