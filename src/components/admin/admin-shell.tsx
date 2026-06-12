"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { BrandMark } from "@/components/icons";
import { LangToggle } from "@/components/lang-toggle";
import { cn } from "@/lib/cn";
import { LayoutDashboard, Inbox, LogOut } from "lucide-react";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // middleware already guards these routes; this handles session expiry
    fetch("/api/auth/me").then((r) => {
      if (r.ok) setReady(true);
      else router.replace("/admin");
    });
  }, [router]);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin");
  }

  if (!ready) return null;

  const nav = [
    { href: "/admin/dashboard", label: t.admin.nav.dashboard, icon: LayoutDashboard },
    { href: "/admin/queue", label: t.admin.nav.queue, icon: Inbox },
  ];

  return (
    <div className="flex min-h-screen">
      {/* sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line/70 bg-white/60 px-4 py-6 backdrop-blur-sm md:flex">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5 px-2">
          <BrandMark className="h-8 w-8" />
          <div className="leading-tight">
            <div className="text-sm font-semibold">{t.brand.name}</div>
            <div className="text-[0.6rem] uppercase tracking-[0.12em] text-muted">{t.admin.login.title}</div>
          </div>
        </Link>

        <nav className="mt-8 flex flex-col gap-1">
          {nav.map((n) => {
            const active = pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-azul text-white" : "text-ink-soft hover:bg-ink/5",
                )}
              >
                <n.icon className="h-4 w-4" strokeWidth={1.7} />
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-3 px-1">
          <LangToggle />
          <button
            onClick={signOut}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-danger/8 hover:text-danger"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.7} />
            {t.admin.nav.signOut}
          </button>
        </div>
      </aside>

      {/* mobile topbar */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-line/70 bg-white/60 px-4 py-3 backdrop-blur-sm md:hidden">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <BrandMark className="h-7 w-7" />
            <span className="text-sm font-semibold">{t.brand.name}</span>
          </Link>
          <div className="flex items-center gap-2">
            <LangToggle />
            <button
              onClick={signOut}
              className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:text-danger"
              aria-label={t.admin.nav.signOut}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* mobile nav row */}
        <div className="flex gap-1 border-b border-line/70 px-3 py-2 md:hidden">
          {nav.map((n) => {
            const active = pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                  active ? "bg-azul text-white" : "text-ink-soft",
                )}
              >
                <n.icon className="h-4 w-4" strokeWidth={1.7} />
                {n.label}
              </Link>
            );
          })}
        </div>

        <main className="flex-1 px-5 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
