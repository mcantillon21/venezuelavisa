import { Briefcase, Plane, GraduationCap, Wrench, Palmtree } from "lucide-react";
import type { VisaType } from "@/lib/mock/data";
import { cn } from "@/lib/cn";

/** Brand mark: deep-blue rounded tile with a gold star arc echoing the flag. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("h-9 w-9", className)} aria-hidden="true">
      <rect x="0.5" y="0.5" width="39" height="39" rx="11" fill="var(--color-azul-deep)" />
      <rect
        x="0.5"
        y="0.5"
        width="39"
        height="39"
        rx="11"
        fill="none"
        stroke="rgba(255,255,255,0.12)"
      />
      {/* arc of stars */}
      {Array.from({ length: 7 }).map((_, i) => {
        const a = Math.PI * (0.18 + (i / 6) * 0.64);
        const cx = 20 - Math.cos(a) * 12;
        const cy = 30 - Math.sin(a) * 12;
        return <Star key={i} cx={cx} cy={cy} r={1.7} fill="var(--color-oro-soft)" />;
      })}
    </svg>
  );
}

function Star({ cx, cy, r, fill }: { cx: number; cy: number; r: number; fill: string }) {
  const pts = Array.from({ length: 10 }).map((_, i) => {
    const ang = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.45;
    return `${cx + Math.cos(ang) * rad},${cy + Math.sin(ang) * rad}`;
  });
  return <polygon points={pts.join(" ")} fill={fill} />;
}

const VISA_ICON = {
  palm: Palmtree,
  briefcase: Briefcase,
  plane: Plane,
  cap: GraduationCap,
  tools: Wrench,
};

export function VisaIcon({ visa, className }: { visa: VisaType; className?: string }) {
  const Icon = VISA_ICON[visa.icon];
  return <Icon className={cn("h-5 w-5", className)} strokeWidth={1.6} aria-hidden="true" />;
}
