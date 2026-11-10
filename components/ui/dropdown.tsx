"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/** Accessible dropdown menu (button + menu, arrow-key navigation, Escape/outside-click to close). */
export function Dropdown({
  trigger,
  children,
  align = "right",
  width = "w-64",
  label,
}: {
  trigger: (props: { open: boolean }) => ReactNode;
  children: (close: () => void) => ReactNode;
  align?: "left" | "right";
  width?: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        const items = ref.current?.querySelectorAll<HTMLElement>("[role='menuitem']:not([aria-disabled='true'])");
        if (!items?.length) return;
        e.preventDefault();
        const arr = Array.from(items);
        const i = arr.indexOf(document.activeElement as HTMLElement);
        const next = e.key === "ArrowDown" ? (i + 1) % arr.length : (i - 1 + arr.length) % arr.length;
        arr[next].focus();
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    const t = setTimeout(() => ref.current?.querySelector<HTMLElement>("[role='menuitem']")?.focus(), 20);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button type="button" aria-haspopup="menu" aria-expanded={open} aria-controls={menuId} aria-label={label} onClick={() => setOpen((v) => !v)} className="rounded-xs outline-none focus-visible:ring-2 focus-visible:ring-signal-400">
        {trigger({ open })}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="menu"
            aria-label={label}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className={cn("absolute z-50 mt-2 overflow-hidden rounded-sm bg-ink-800 py-1.5 shadow-2xl ring-1 ring-ink-600", align === "right" ? "right-0" : "left-0", width)}
          >
            {children(() => setOpen(false))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MenuItem({
  children,
  onSelect,
  disabled,
  hint,
  icon,
}: {
  children: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      aria-disabled={disabled || undefined}
      tabIndex={-1}
      onClick={() => !disabled && onSelect?.()}
      className={cn(
        "flex w-full items-start gap-3 px-3.5 py-2 text-left text-[13px] outline-none",
        disabled ? "cursor-not-allowed text-white/35" : "text-white/85 hover:bg-white/[0.05] focus:bg-white/[0.07]",
      )}
    >
      {icon && <span className="mt-0.5 text-muted">{icon}</span>}
      <span className="flex-1">
        {children}
        {hint && <span className="mt-0.5 block text-[11.5px] text-muted">{hint}</span>}
      </span>
    </button>
  );
}

export function MenuSeparator() {
  return <div className="my-1.5 h-px bg-ink-600/70" role="separator" />;
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return <div className="px-3.5 pb-1 pt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{children}</div>;
}
