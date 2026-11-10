import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "quiet" | "danger" | "inverse";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  /** Red — reserved for the single most important action in a view */
  primary: "bg-brand text-white hover:bg-brand-dark",
  /** Outlined charcoal — the default secondary action */
  secondary: "bg-white text-ink ring-1 ring-inset ring-line-strong hover:ring-ink/40",
  ghost: "text-ink hover:bg-mist",
  /** Text-style link button */
  quiet: "text-ink-2 hover:text-ink",
  danger: "bg-negative text-white hover:brightness-95",
  /** For use on the charcoal footer band */
  inverse: "bg-white text-ink hover:bg-mist",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-[15px] gap-2.5",
};

const base =
  "inline-flex items-center justify-center whitespace-nowrap rounded-sm font-medium transition-colors duration-200 disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function Button({ variant = "secondary", size = "md", className, children, type = "button", ...rest }: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "secondary",
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

/** Arrow text link used for "learn more" style navigation. */
export function TextLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-1.5 text-[14px] font-medium text-ink underline-offset-4 hover:text-brand", className)}>
      {children}
      <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
    </Link>
  );
}
