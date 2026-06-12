"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";
import { BrandMark } from "@/components/icons";
import { LangToggle } from "@/components/lang-toggle";
import { Button, Field, Input } from "@/components/ui";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function AdminLogin() {
  const { t } = useI18n();
  const router = useRouter();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(false);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, password: pass }),
    });
    setBusy(false);
    if (res.ok) router.push("/admin/dashboard");
    else setError(true);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
          {t.confirm.homeCta}
        </Link>
        <LangToggle />
      </header>

      <div className="flex flex-1 items-center justify-center px-5 pb-20">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="card p-8">
            <div className="flex flex-col items-center text-center">
              <BrandMark className="h-12 w-12" />
              <h1 className="mt-4 font-display text-2xl">{t.admin.login.title}</h1>
              <p className="mt-1.5 text-sm text-muted">{t.admin.login.lead}</p>
            </div>

            <form onSubmit={onSubmit} className="mt-7 grid gap-4">
              <Field label={t.admin.login.user} required>
                <Input value={user} onChange={(e) => setUser(e.target.value)} autoComplete="username" />
              </Field>
              <Field label={t.admin.login.password} required>
                <Input type="password" value={pass} onChange={(e) => setPass(e.target.value)} autoComplete="current-password" />
              </Field>
              {error && <p className="text-sm text-danger">{t.admin.login.error}</p>}
              <Button type="submit" size="lg" className="mt-1 w-full" disabled={busy}>
                <ShieldCheck className="h-4 w-4" strokeWidth={1.8} />
                {t.admin.login.cta}
              </Button>
            </form>
          </div>

          <p className="mt-4 text-center text-xs text-muted">{t.admin.login.demo}</p>
          <div className="tricolor-rule mx-auto mt-6 w-16" />
        </motion.div>
      </div>
    </div>
  );
}
