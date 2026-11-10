"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Building2,
  ChevronDown,
  Download,
  FileSpreadsheet,
  Gauge,
  History,
  IndianRupee,
  Layers,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Menu,
  MessageSquare,
  Printer,
  Ruler,
  ShieldCheck,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { analystNav, executiveNav, type WorkspaceNavItem } from "@/lib/config/workspace-nav";
import { periodLabel } from "@/lib/analytics/period";
import { downloadCsv, slugify } from "@/lib/utils/download";
import { cn } from "@/lib/utils/cn";
import { DemoDataBadge } from "@/components/ui/badge";
import { Dropdown, MenuItem, MenuLabel, MenuSeparator } from "@/components/ui/dropdown";
import { Logo } from "@/components/ui/logo";
import { FilterBar, type FilterKey } from "./filter-bar";
import { WorkspaceProvider, useWorkspace } from "./workspace-context";

const ICONS: Record<WorkspaceNavItem["icon"], typeof Gauge> = {
  overview: LayoutDashboard,
  demand: TrendingUp,
  supply: Building2,
  price: IndianRupee,
  configuration: Layers,
  ticket: Wallet,
  size: Ruler,
  micromarket: MapPinned,
  history: History,
};

/** Which global filters each route ignores (those modules have their own selectors). */
function hiddenFilters(pathname: string): FilterKey[] {
  if (pathname.endsWith("/micromarkets")) return ["cityId", "micromarketId"];
  if (pathname.endsWith("/history")) return ["year", "quarter"];
  return [];
}

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const { session, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !session) router.replace("/login");
  }, [ready, session, router]);

  if (!ready || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-900">
        <div className="flex items-center gap-3 text-[13px] text-muted">
          <span className="h-2 w-2 animate-pulse rounded-full bg-signal-500" /> Opening workspace…
        </div>
      </div>
    );
  }

  return (
    <WorkspaceProvider>
      <ShellFrame>{children}</ShellFrame>
    </WorkspaceProvider>
  );
}

function ShellFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/dashboard";
  const [navOpen, setNavOpen] = useState(false);
  const { scopeLabel } = useWorkspace();
  useEffect(() => setNavOpen(false), [pathname]);

  return (
    <div className="min-h-screen bg-ink-900 text-white">
      <a href="#workspace-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[90] focus:rounded-xs focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-ink-900">
        Skip to content
      </a>
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col border-r border-ink-600/60 bg-ink-950 transition-transform duration-300 lg:translate-x-0",
          navOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Workspace navigation"
      >
        <div className="flex h-16 items-center justify-between border-b border-ink-600/60 px-5">
          <Link href="/dashboard" aria-label="Executive overview">
            <Logo />
          </Link>
          <button type="button" className="rounded-xs p-1 text-muted lg:hidden" onClick={() => setNavOpen(false)} aria-label="Close navigation">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-5 scrollbar-thin">
          <NavGroup title="Executive" items={executiveNav} pathname={pathname} />
          <NavGroup title="Analyst workspace" items={analystNav} pathname={pathname} />
          <p className="eyebrow mb-2 mt-7 px-3 !text-[10px] text-muted">Resources</p>
          <SideLink href="/publications" icon={BookOpen} label="Publications" external />
          <SideLink href="/contact?type=custom" icon={MessageSquare} label="Request research" external />
          <AdminLink />
        </nav>
        <div className="border-t border-ink-600/60 p-4">
          <DemoDataBadge />
          <p className="mt-2 text-[11.5px] leading-relaxed text-muted">Synthetic dataset for demonstration. Not Magicbricks market statistics.</p>
        </div>
      </aside>
      {navOpen && <div className="fixed inset-0 z-30 bg-ink-950/70 lg:hidden" onClick={() => setNavOpen(false)} aria-hidden />}

      <div className="lg:pl-[248px]">
        <WorkspaceHeader onMenu={() => setNavOpen(true)} />
        <div className="z-20 border-b border-ink-600/60 bg-ink-900/95 px-5 py-3 backdrop-blur sm:px-8 lg:sticky lg:top-16">
          <FilterBar hidden={hiddenFilters(pathname)} />
          <p className="mt-2 truncate font-mono text-[11px] tracking-[0.04em] text-muted" aria-live="polite">
            {scopeLabel}
          </p>
        </div>
        <motion.main
            id="workspace-main"
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="px-5 pb-16 pt-6 sm:px-8"
          >
            {children}
          </motion.main>
      </div>
    </div>
  );
}

function NavGroup({ title, items, pathname }: { title: string; items: WorkspaceNavItem[]; pathname: string }) {
  return (
    <div className="mb-5">
      <p className="eyebrow mb-2 px-3 !text-[10px] text-muted">{title}</p>
      <ul className="space-y-0.5">
        {items.map((it) => {
          const Icon = ICONS[it.icon];
          const active = pathname === it.href;
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xs px-3 py-2 text-[13.5px] transition-colors",
                  active ? "bg-ink-750 text-white" : "text-white/60 hover:bg-white/[0.03] hover:text-white",
                )}
              >
                {active && <motion.span layoutId="side-active" className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-signal-500" />}
                <Icon className={cn("h-4 w-4", active ? "text-signal-400" : "text-muted group-hover:text-white/80")} strokeWidth={1.75} aria-hidden />
                <span className="flex-1">{it.label}</span>
                <span className="font-mono text-[10px] text-muted">{it.code}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SideLink({ href, icon: Icon, label, external }: { href: string; icon: typeof Gauge; label: string; external?: boolean }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-xs px-3 py-2 text-[13.5px] text-white/60 hover:bg-white/[0.03] hover:text-white" target={external ? "_blank" : undefined}>
      <Icon className="h-4 w-4 text-muted" strokeWidth={1.75} aria-hidden />
      {label}
    </Link>
  );
}

function AdminLink() {
  const { session } = useAuth();
  if (session?.user.role !== "mb_admin") return null;
  return <SideLink href="/admin" icon={ShieldCheck} label="Admin console" />;
}

function WorkspaceHeader({ onMenu }: { onMenu: () => void }) {
  const { session, signOut } = useAuth();
  const { catalog, exports } = useWorkspace();
  const router = useRouter();
  const user = session?.user;
  const exportNames = Object.keys(exports);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-ink-600/60 bg-ink-900/95 px-5 backdrop-blur sm:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" className="rounded-xs p-1.5 text-white/80 lg:hidden" onClick={onMenu} aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-medium">Welcome, {user?.name}</p>
          <p className="truncate text-[12px] text-muted">{user?.organisation}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {catalog && (
          <div className="hidden text-right md:block">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Data as of</p>
            <p className="text-[12.5px] text-white/80">
              {periodLabel(catalog.status.asOf)} <span className="text-caution">· demo</span>
            </p>
          </div>
        )}
        <Dropdown
          label="Export"
          width="w-72"
          trigger={({ open }) => (
            <span className={cn("inline-flex h-9 items-center gap-2 rounded-sm px-3 text-[13px] ring-1 ring-inset transition-colors", open ? "bg-white/[0.06] ring-ink-500" : "ring-ink-600 hover:ring-ink-500")}>
              <Download className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Export</span>
            </span>
          )}
        >
          {(close) => (
            <>
              <MenuLabel>Current view · CSV</MenuLabel>
              {exportNames.length ? (
                exportNames.map((n) => (
                  <MenuItem
                    key={n}
                    icon={<FileSpreadsheet className="h-4 w-4" />}
                    onSelect={() => {
                      downloadCsv(slugify(n), exports[n].columns, exports[n].rows);
                      close();
                    }}
                  >
                    {n}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No datasets on this view yet</MenuItem>
              )}
              <MenuSeparator />
              <MenuItem
                icon={<Printer className="h-4 w-4" />}
                hint="Uses the browser print dialog"
                onSelect={() => {
                  close();
                  setTimeout(() => window.print(), 50);
                }}
              >
                Print / save as PDF
              </MenuItem>
              <MenuItem disabled hint="Available with the live platform">
                Branded PDF report & scheduled exports
              </MenuItem>
            </>
          )}
        </Dropdown>

        <Dropdown
          label="Profile"
          width="w-64"
          trigger={({ open }) => (
            <span className={cn("inline-flex h-9 items-center gap-2 rounded-sm pl-1 pr-2 transition-colors", open ? "bg-white/[0.06]" : "hover:bg-white/[0.04]")}>
              <span className="flex h-7 w-7 items-center justify-center rounded-xs bg-signal-500/20 font-mono text-[11px] text-signal-200 ring-1 ring-inset ring-signal-500/40">
                {user?.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-muted" aria-hidden />
            </span>
          )}
        >
          {(close) => (
            <>
              <div className="px-3.5 py-2.5">
                <p className="text-[13.5px] font-medium">{user?.name}</p>
                <p className="text-[12px] text-muted">{user?.designation}</p>
                <p className="mt-0.5 truncate font-mono text-[11px] text-muted">{user?.email}</p>
                <span className="mt-2 inline-block rounded-xs bg-caution/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-caution">Demo session</span>
              </div>
              <MenuSeparator />
              {user?.role === "mb_admin" && (
                <MenuItem
                  icon={<ShieldCheck className="h-4 w-4" />}
                  onSelect={() => {
                    close();
                    router.push("/admin");
                  }}
                >
                  Admin console
                </MenuItem>
              )}
              <MenuItem
                icon={<LogOut className="h-4 w-4" />}
                onSelect={async () => {
                  close();
                  await signOut();
                  router.push("/login");
                }}
              >
                Sign out
              </MenuItem>
            </>
          )}
        </Dropdown>
      </div>
    </header>
  );
}
