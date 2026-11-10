"use client";

import { ChevronDown } from "lucide-react";
import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

/* Two skins: "dark" for the workspace, "light" for public forms. */
type Skin = "dark" | "light";

const fieldSkin: Record<Skin, string> = {
  dark: "bg-ink-850 text-white ring-1 ring-inset ring-ink-600 hover:ring-ink-500 focus:ring-signal-500 placeholder:text-muted",
  light: "bg-white text-text ring-1 ring-inset ring-rule hover:ring-subtle/50 focus:ring-signal-500 placeholder:text-muted",
};

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  skin = "light",
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string | null;
  hint?: string;
  required?: boolean;
  skin?: Skin;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className={cn("text-[13px] font-medium", skin === "dark" ? "text-white/80" : "text-text")}>
        {label}
        {required && <span className="ml-0.5 text-signal-500" aria-hidden>*</span>}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-[12px] text-negative" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-[12px] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ skin = "light", className, invalid, ...rest }: InputHTMLAttributes<HTMLInputElement> & { skin?: Skin; invalid?: boolean }) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-sm px-3.5 text-sm outline-none transition-shadow",
        fieldSkin[skin],
        invalid && "ring-negative hover:ring-negative",
        className,
      )}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
}

export function Textarea({ skin = "light", className, invalid, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { skin?: Skin; invalid?: boolean }) {
  return (
    <textarea
      className={cn("min-h-32 w-full rounded-sm px-3.5 py-3 text-sm outline-none transition-shadow", fieldSkin[skin], invalid && "ring-negative", className)}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/** Native select (accessible, keyboard- and mobile-friendly) with product styling. */
export function Select({
  skin = "dark",
  options,
  className,
  label,
  size = "md",
  invalid,
  ...rest
}: Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  skin?: Skin;
  options: SelectOption[];
  label?: string;
  size?: "sm" | "md";
  invalid?: boolean;
}) {
  const id = useId();
  const selectId = rest.id ?? id;
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      {label && (
        <label htmlFor={selectId} className={cn("eyebrow !text-[10px]", skin === "dark" ? "text-muted" : "text-subtle")}>
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            "w-full appearance-none truncate rounded-sm pl-3 pr-9 outline-none transition-shadow",
            size === "sm" ? "h-8 text-[13px]" : "h-10 text-sm",
            fieldSkin[skin],
            invalid && "ring-negative",
          )}
          aria-invalid={invalid || undefined}
          {...rest}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled} className={skin === "dark" ? "bg-ink-850" : ""}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className={cn("pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2", skin === "dark" ? "text-muted" : "text-subtle")} aria-hidden />
      </div>
    </div>
  );
}

export function Checkbox({ label, skin = "dark", className, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; skin?: Skin }) {
  const id = useId();
  return (
    <label htmlFor={rest.id ?? id} className={cn("inline-flex cursor-pointer select-none items-center gap-2.5 text-sm", skin === "dark" ? "text-white/80" : "text-text", className)}>
      <input id={rest.id ?? id} type="checkbox" className="h-4 w-4 cursor-pointer rounded-xs accent-signal-500" {...rest} />
      {label}
    </label>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <label htmlFor={id} className="text-sm font-medium text-white">
          {label}
        </label>
        {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-50",
          checked ? "bg-signal-500" : "bg-ink-600",
        )}
      >
        <span className={cn("inline-block h-4 w-4 rounded-full bg-white shadow transition-transform", checked ? "translate-x-[18px]" : "translate-x-0.5")} />
      </button>
    </div>
  );
}
