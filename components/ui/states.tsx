import { CircleAlert, Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xs bg-mist", className)} aria-hidden />;
}

export function EmptyState({ title, children, className }: { title: string; children?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 px-6 py-10 text-center", className)} role="status">
      <Inbox className="h-6 w-6 text-ink-3" aria-hidden />
      <p className="text-sm font-medium text-ink">{title}</p>
      {children && <div className="max-w-sm text-[13px] text-ink-2">{children}</div>}
    </div>
  );
}

export function ErrorState({ message, className }: { message: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 px-6 py-10 text-center", className)} role="alert">
      <CircleAlert className="h-6 w-6 text-negative" aria-hidden />
      <p className="text-sm font-medium text-ink">Unable to load this view</p>
      <p className="max-w-sm text-[13px] text-ink-2">{message}</p>
    </div>
  );
}
