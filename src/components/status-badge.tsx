"use client";

import { useI18n } from "@/lib/i18n/context";
import type { AppStatus } from "@/lib/mock/data";
import { cn } from "@/lib/cn";

const STYLE: Record<AppStatus, string> = {
  submitted: "bg-azul-bright/10 text-azul border-azul-bright/20",
  review: "bg-oro/15 text-[#8a6310] border-oro/30",
  approved: "bg-success/10 text-success border-success/25",
  rejected: "bg-danger/10 text-danger border-danger/25",
  info: "bg-ink/8 text-ink-soft border-line-strong",
};

const DOT: Record<AppStatus, string> = {
  submitted: "bg-azul-bright",
  review: "bg-oro",
  approved: "bg-success",
  rejected: "bg-danger",
  info: "bg-muted",
};

export function StatusBadge({ status, className }: { status: AppStatus; className?: string }) {
  const { t } = useI18n();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        STYLE[status],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", DOT[status])} />
      {t.status[status]}
    </span>
  );
}
