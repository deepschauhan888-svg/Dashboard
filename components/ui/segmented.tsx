"use client";

import { useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils/cn";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

/** Keyboard-accessible segmented control (radiogroup semantics). */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  skin = "dark",
  size = "sm",
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: SegmentOption<T>[];
  ariaLabel: string;
  skin?: "dark" | "light";
  size?: "sm" | "md";
  className?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const idx = options.findIndex((o) => o.value === value);

  function onKey(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (idx + (e.key === "ArrowRight" ? 1 : -1) + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex rounded-sm p-0.5",
        skin === "dark" ? "bg-ink-850 ring-1 ring-inset ring-ink-600" : "bg-mist ring-1 ring-inset ring-rule",
        className,
      )}
    >
      {options.map((o, i) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onKeyDown={onKey}
            onClick={() => onChange(o.value)}
            className={cn(
              "whitespace-nowrap rounded-xs font-medium transition-colors",
              size === "sm" ? "h-7 px-2.5 text-[12px]" : "h-9 px-3.5 text-[13px]",
              skin === "dark"
                ? active
                  ? "bg-ink-600 text-white shadow-sm"
                  : "text-muted hover:text-white"
                : active
                  ? "bg-white text-text shadow-sm ring-1 ring-rule"
                  : "text-subtle hover:text-text",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
