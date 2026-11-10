"use client";

import {
  ArrowLeft,
  Building2,
  ClipboardCheck,
  CreditCard,
  Gauge,
  History,
  KeyRound,
  LoaderCircle,
  LogOut,
  MapPinned,
  Menu,
  ShieldAlert,
  Upload,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { AdminStoreProvider } from "@/lib/admin/admin-store";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export const ADMIN_NAV = [
  { href: "/admin", label: "Overview", icon: Gauge },
  { href: "/admin/upload", label: "Dataset Upload", icon: Upload },
  { href: "/admin/validation", label: "Data Validation", icon: ClipboardCheck },
  { href: "/admin/history", label: "Upload History", icon: History },
  { href: "/admin/cities", label: "City Management", icon: Building2 },
  { href: "/admin/micromarkets", label: "Micromarkets", icon: MapPinned },
  { href: "/admin/clients", label: "Client Management", icon: Users },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/permissions", label: "Access Permissions", icon: KeyRound },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const { session, ready, startDemo, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname() ?? "/admin";
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (ready && !session) router.replace("/login");
  }, [ready, session, router]);

  if (!ready || !session) {
    return <div className="flex min-h-screen items-center justify-center bg-white text-[13px] text-ink-2">Opening admin console…</div>;
  }

  if (session.user.role !== "mb_admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6 text-ink">
        <div className="max-w-md text-center">
          <ShieldAlert className="mx-auto h-8 w-8 text-caution" aria-hidden />
          <h1 className="mt-4 text-[24px] font-semibold">Administrator access required</h1>
          <p className="mt-2 text-[14px] text-ink-2">Your demo session is a client workspace. Switch to the demo administrator persona to explore the admin console.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button
              onClick={async () => {
                setSwitching(true);
                await startDemo("mb_admin");
                setSwitching(false);
              }}
              disabled={switching}
            >
              {switching && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />} Switch to demo admin
            </Button>
            <Link href="/dashboard" className="inline-flex h-10 items-center rounded-sm px-4 text-sm ring-1 ring-inset ring-line hover:ring-ink-2/50">
              Back to workspace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminStoreProvider>
      <div className="min-h-screen bg-white text-ink">
        <aside className={cn("fixed inset-y-0 left-0 z-40 flex w-[240px] flex-col border-r border-line bg-paper transition-transform lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")} aria-label="Admin navigation">
          <div className="flex h-16 items-center justify-between border-b border-line px-5">
            <Logo />
            <button type="button" className="p-1 text-ink-2 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation">
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="kicker mt-5 px-6 !text-[10px] text-caution">Admin console</p>
          <nav className="mt-3 flex-1 space-y-0.5 overflow-y-auto px-3 scrollbar-thin">
            {ADMIN_NAV.map((n) => {
              const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
              return (
                <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined} className={cn("flex items-center gap-3 rounded-xs px-3 py-2 text-[13.5px]", active ? "bg-brand-tint text-ink" : "text-ink-2 hover:bg-paper hover:text-ink")}>
                  <n.icon className={cn("h-4 w-4", active ? "text-brand" : "text-ink-2")} strokeWidth={1.75} aria-hidden />
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="space-y-2 border-t border-line p-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-[13px] text-ink-2 hover:text-ink">
              <ArrowLeft className="h-4 w-4" aria-hidden /> Client workspace
            </Link>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                router.push("/login");
              }}
              className="flex items-center gap-2 text-[13px] text-ink-2 hover:text-ink"
            >
              <LogOut className="h-4 w-4" aria-hidden /> Sign out
            </button>
          </div>
        </aside>
        {open && <div className="fixed inset-0 z-30 bg-paper/70 lg:hidden" onClick={() => setOpen(false)} aria-hidden />}
        <div className="lg:pl-[240px]">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-line bg-white/95 px-5 backdrop-blur sm:px-8">
            <div className="flex items-center gap-3">
              <button type="button" className="p-1.5 lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-[14px] font-medium">{session.user.name}</p>
                <p className="text-[12px] text-ink-2">{session.user.designation}</p>
              </div>
            </div>
            <p className="hidden max-w-md rounded-xs bg-caution/10 px-3 py-1.5 text-[12px] text-caution ring-1 ring-inset ring-caution/30 md:block">
              Demo console — changes are saved in this browser only. Ingestion, validation engine and persistence arrive with the backend phase.
            </p>
          </header>
          <main className="px-5 pb-16 pt-6 sm:px-8">{children}</main>
        </div>
      </div>
    </AdminStoreProvider>
  );
}

export function AdminPageHeader({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="kicker text-caution">Admin</p>
        <h1 className="mt-1.5 text-[26px] font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 max-w-3xl text-[14px] text-ink-2">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, children, actions, className }: { title?: string; children: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xs bg-white ring-1 ring-inset ring-line", className)} aria-label={title}>
      {title && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <h2 className="text-[14.5px] font-semibold">{title}</h2>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

export const th = "px-4 py-2.5 text-left text-[12px] font-medium text-ink-2";
export const td = "px-4 py-2.5 text-[13px]";
