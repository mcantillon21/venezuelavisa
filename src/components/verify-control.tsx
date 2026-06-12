"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";
import { Button, Input } from "@/components/ui";
import { BadgeCheck, Loader2 } from "lucide-react";

/* OTP verification for an email or phone value. Calls /api/verify/start,
   then /api/verify/check; reports the signed proof upward. In demo mode
   (no provider keys on the server) the code is shown inline, tap to fill. */

type Phase = "idle" | "sending" | "sent" | "checking";

export function VerifyControl({
  channel,
  value,
  proof,
  onProof,
}: {
  channel: "email" | "phone";
  value: string;
  proof: string | null;
  onProof: (proof: string | null, verifiedValue: string) => void;
}) {
  const { t } = useI18n();
  const [phase, setPhase] = useState<Phase>("idle");
  const [token, setToken] = useState("");
  const [code, setCode] = useState("");
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (proof) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
        <BadgeCheck className="h-4 w-4" strokeWidth={1.8} />
        {t.wizard.verify.verified}
      </span>
    );
  }

  async function start() {
    setPhase("sending");
    setError(null);
    const res = await fetch("/api/verify/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, to: value }),
    });
    if (!res.ok) {
      setPhase("idle");
      setError(t.wizard.verify.invalid);
      return;
    }
    const data = await res.json();
    setToken(data.token);
    setSentTo(data.to);
    setDemoCode(data.demoCode ?? null);
    setPhase("sent");
  }

  async function check() {
    setPhase("checking");
    setError(null);
    const res = await fetch("/api/verify/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, code }),
    });
    if (!res.ok) {
      setPhase("sent");
      setError(t.wizard.verify.bad);
      return;
    }
    const data = await res.json();
    onProof(data.proof, data.to);
  }

  return (
    <div className="flex flex-col gap-2">
      {phase === "idle" || phase === "sending" ? (
        <div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={start}
            disabled={!value || phase === "sending"}
          >
            {phase === "sending" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            {t.wizard.verify.cta}
          </Button>
        </div>
      ) : (
        <AnimatePresence initial={false}>
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2"
          >
            <span className="text-xs text-muted">
              {t.wizard.verify.sentTo} <span className="font-medium text-ink-soft">{sentTo}</span>
            </span>
            {demoCode && (
              <button
                type="button"
                onClick={() => setCode(demoCode)}
                className="self-start rounded-lg border border-oro/40 bg-oro/10 px-2.5 py-1 font-mono text-xs text-[#8a6310]"
              >
                {t.wizard.verify.demoHint} <span className="font-semibold">{demoCode}</span>
              </button>
            )}
            <div className="flex gap-2">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder={t.wizard.verify.codePh}
                inputMode="numeric"
                className="h-9 max-w-44 font-mono"
              />
              <Button
                type="button"
                size="sm"
                onClick={check}
                disabled={code.length !== 6 || phase === "checking"}
              >
                {phase === "checking" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                {t.wizard.verify.confirm}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
