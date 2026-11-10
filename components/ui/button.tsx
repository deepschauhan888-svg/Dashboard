import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "outline-light" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-signal-500 text-white hover:bg-signal-400 active:bg-signal-600 shadow-[0_0_0_1px_rgba(49,139,255,0.4),0_8px_24px_-8px_rgba(49,139,255,0.6)]",
  secondary: "bg-white/[0.06] text-white ring-1 ring-inset ring-white/15 hover:bg-white/[0.1] hover:ring-white/25",
  ghost: "text-current hover:bg-white/[0.06]",
  outline: "text-text ring-1 ring-inset ring-rule hover:ring-text/40 hover:bg-mist bg-white",
  "outline-light": "text-white ring-1 ring-inset ring-white/20 hover:ring-white/40 hover:bg-white/[0.04]",
  danger: "bg-negative/90 text-white hover:bg-negative",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-[15px] gap-2.5",
};

const base =
  "inline-flex items-center justify-center whitespace-nowrap rounded-sm font-medium tracking-tight transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-400";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  type = "button",
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  external,
  ...rest
}: CommonProps & { href: string; external?: boolean; "aria-label"?: string }) {
  const cls = cn(base, variants[variant], sizes[size], className);
  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}
