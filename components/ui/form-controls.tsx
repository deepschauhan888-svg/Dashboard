"use client";

import { ChevronDown } from "lucide-react";
import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

const fieldBase = "bg-white text-ink ring-1 ring-inset ring-line-strong outline-none transition-shadow hover:ring-ink-2/50 focus:ring-2 focus:ring-brand placeholder:text-ink-2/70 disabled:bg-paper disabled:text-ink-2";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string | null;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-ink">
        {label}
        {required && <span className="ml-0.5 text-brand" aria-hidden>*</span>}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-[12px] text-negative" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-[12px] text-ink-2">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ className, invalid, ...rest }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return <input className={cn("h-11 w-full rounded-sm px-3.5 text-sm", fieldBase, invalid && "ring-negative hover:ring-negative", className)} aria-invalid={invalid || undefined} {...rest} />;
}

export function Textarea({ className, invalid, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return <textarea className={cn("min-h-32 w-full rounded-sm px-3.5 py-3 text-sm", fieldBase, invalid && "ring-negative", className)} aria-invalid={invalid || undefined} {...rest} />;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/** Native select: accessible, keyboard- and mobile-friendly. */
export function Select({
  options,
  className,
  label,
  size = "md",
  invalid,
  active,
  ...rest
}: Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  options: SelectOption[];
  label?: string;
  size?: "sm" | "md" | "lg";
  invalid?: boolean;
  /** highlights a filter that differs from its default */
  active?: boolean;
}) {
  const id = useId();
  const selectId = rest.id ?? id;
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      {label && (
        <label htmlFor={selectId} className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          {...rest}
          id={selectId}
          className={cn(
            "w-full appearance-none truncate rounded-sm pl-3 pr-9",
            size === "sm" ? "h-8 text-[13px]" : size === "lg" ? "h-11 text-sm" : "h-10 text-sm",
            fieldBase,
            active && "ring-brand/60 text-brand-dark",
            invalid && "ring-negative",
          )}
          aria-invalid={invalid || undefined}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-2" aria-hidden />
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange, label, description, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string; disabled?: boolean }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        {description && <p className="mt-0.5 text-[13px] text-ink-2">{description}</p>}
      </div>
      <button id={id} type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)} className={cn("relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-50", checked ? "bg-brand" : "bg-line-strong")}>
        <span className={cn("inline-block h-4 w-4 rounded-full bg-white shadow transition-transform", checked ? "translate-x-[18px]" : "translate-x-0.5")} />
      </button>
    </div>
  );
}
