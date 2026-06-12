import * as React from "react";
import { cn } from "@/lib/cn";

/* ---------- Button ------------------------------------------- */
type Variant = "primary" | "secondary" | "ghost" | "gold" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "text-white bg-[linear-gradient(160deg,var(--color-azul),var(--color-azul-deep))] shadow-[0_8px_20px_-8px_rgba(13,36,86,0.6)] hover:brightness-110 active:brightness-95",
  secondary:
    "bg-white text-ink border border-line-strong hover:border-azul/40 hover:bg-paper-deep/60",
  ghost: "text-ink-soft hover:bg-ink/5",
  gold: "text-azul-deep bg-[linear-gradient(160deg,var(--color-oro-soft),var(--color-oro))] hover:brightness-105",
  danger: "text-white bg-danger hover:brightness-110",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-sm gap-1.5 rounded-full",
  md: "h-11 px-6 text-[0.95rem] gap-2 rounded-full",
  lg: "h-13 px-8 text-base gap-2.5 rounded-full",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "group/btn inline-flex items-center justify-center font-medium whitespace-nowrap transition-[filter,background-color,border-color,scale] duration-150 active:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, className, ...props },
  ref,
) {
  return <button ref={ref} className={buttonClasses(variant, size, className)} {...props} />;
});

/* ---------- Card --------------------------------------------- */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("card", className)} {...props} />;
}

/* ---------- Form fields -------------------------------------- */
export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-sm font-medium text-ink-soft">
        {label}
        {required && <span className="text-rojo"> *</span>}
      </span>
      {children}
      {hint && !error && <span className="text-xs text-muted">{hint}</span>}
      {error && <span className="text-xs text-danger">{error}</span>}
    </label>
  );
}

const fieldBase =
  "w-full h-11 rounded-xl border border-line-strong bg-white px-3.5 text-[0.95rem] text-ink placeholder:text-muted/70 transition-colors focus:border-azul-bright focus:outline-none focus:ring-4 focus:ring-azul-bright/12";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(fieldBase, className)} {...props} />;
  },
);

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...props }, ref) {
  return (
    <select ref={ref} className={cn(fieldBase, "appearance-none pr-9 bg-no-repeat", className)} {...props}>
      {children}
    </select>
  );
});

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(fieldBase, "h-auto min-h-24 py-2.5 leading-relaxed resize-y", className)}
      {...props}
    />
  );
});

/* ---------- Misc --------------------------------------------- */
export function Pill({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-line bg-white/70 px-3 py-1 text-xs font-medium text-ink-soft",
        className,
      )}
      {...props}
    />
  );
}
