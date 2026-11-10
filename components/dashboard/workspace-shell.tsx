"use client";

import { ChevronDown, Download, FileSpreadsheet, LogOut, Menu, Printer, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { analystNav, executiveNav, viewForPath, type WorkspaceNavItem } from "@/lib/config/workspace-nav";
import { periodLabel } from "@/lib/analytics/period";
import { downloadCsv, slugify } from "@/lib/utils/download";
import { cn } from "@/lib/utils/cn";
import { DemoDataBadge } from "@/components/ui/badge";
import { Dropdown, MenuItem, MenuLabel, MenuSeparator } from "@/components/ui/dropdown";
import { Logo } from "@/components/ui/logo";
import { FilterBar } from "./filter-bar";
import { WorkspaceProvider, describeScope, useWorkspace } from "./workspace-context";
import { effectiveFilters } from "@/lib/analytics/filters";

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const { session, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !session) router.replace("/login");
  }, [ready, session, router]);

  if (!ready || !session) {
    return <div className="flex min-h-screen items-center justify-center bg-white text-[13px] text-ink-2">Opening workspace…</div>;
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
  const { filters, catalog } = useWorkspace();
  const view = viewForPath(pathname);
  useEffect(() => setNavOpen(false), [pathname]);

  return (
    <div className="min-h-screen bg-white text-ink">
      <a href="#workspace-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[90] focus:rounded-xs focus:bg-ink focus:px-3 focus:py-2 focus:text-sm focus:text-white">
        Skip to content
      </a>
      <aside className={cn("fixed inset-y-0 left-0 z-40 flex w-[240px] flex-col border-r border-line bg-paper transition-transform duration-300 lg:translate-x-0", navOpen ? "translate-x-0" : "-translate-x-full")} aria-label="Workspace navigation">
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/dashboard" aria-label="Executive overview">
            <Logo />
          </Link>
          <button type="button" className="rounded-xs p-1 text-ink-2 lg:hidden" onClick={() => setNavOpen(false)} aria-label="Close navigation">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 pb-5 pt-2 scrollbar-thin">
          <NavGroup title="Executive" items={[executiveNav]} pathname={pathname} />
          <NavGroup title="Analyst workspace" items={analystNav} pathname={pathname} />
          <AdminLink />
        </nav>
        <div className="border-t border-line p-4">
          <DemoDataBadge />
          <p className="mt-2 text-[11.5px] leading-relaxed text-ink-2">All figures are synthetic demonstration data, not Magicbricks market statistics.</p>
        </div>
      </aside>
      {navOpen && <div className="fixed inset-0 z-30 bg-ink/20 lg:hidden" onClick={() => setNavOpen(false)} aria-hidden />}

      <div className="lg:pl-[240px]">
        <WorkspaceHeader onMenu={() => setNavOpen(true)} />
        <div className="no-print z-20 border-b border-line bg-white/95 px-5 py-3 backdrop-blur sm:px-8 lg:sticky lg:top-16">
          <FilterBar visible={view.filters} />
          <p className="mt-2 truncate text-[12px] text-ink-2" aria-live="polite">
            {describeScope(effectiveFilters(filters, view.filters), catalog, view.filters)}
          </p>
        </div>
        <main id="workspace-main" className="px-5 pb-16 pt-8 sm:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavGroup({ title, items, pathname }: { title: string; items: WorkspaceNavItem[]; pathname: string }) {
  return (
    <div className="mb-6">
      <p className="mb-2 px-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-2">{title}</p>
      <ul className="space-y-0.5">
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={cn("relative flex items-center rounded-sm px-3 py-2 text-[13.5px] transition-colors", active ? "bg-white font-medium text-ink shadow-[0_0_0_1px_#EAEAEA]" : "text-ink-2 hover:bg-white hover:text-ink")}
              >
                {active && <span className="absolute inset-y-2 left-0 w-[2px] bg-brand" aria-hidden />}
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AdminLink() {
  const { session } = useAuth();
  if (session?.user.role !== "mb_admin") return null;
  return (
    <Link href="/admin" className="mx-3 flex items-center gap-2 border-t border-line pt-4 text-[13px] text-ink-2 hover:text-ink">
      <ShieldCheck className="h-4 w-4" aria-hidden /> Admin console
    </Link>
  );
}

function WorkspaceHeader({ onMenu }: { onMenu: () => void }) {
  const { session, signOut } = useAuth();
  const { catalog, exports } = useWorkspace();
  const router = useRouter();
  const user = session?.user;
  const exportNames = Object.keys(exports);

  return (
    <header className="no-print sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line bg-white/95 px-5 backdrop-blur sm:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" className="rounded-xs p-1.5 text-ink lg:hidden" onClick={onMenu} aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-medium">Welcome, {user?.name}</p>
          <p className="truncate text-[12px] text-ink-2">{user?.organisation}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {catalog && (
          <p className="hidden text-right text-[12px] leading-tight text-ink-2 md:block">
            Data as of <span className="font-medium text-ink">{periodLabel(catalog.status.asOf)}</span>
            <br />
            <span className="text-caution">Demonstration dataset</span>
          </p>
        )}
        <Dropdown
          label="Export"
          width="w-72"
          trigger={({ open }) => (
            <span className={cn("inline-flex h-9 items-center gap-2 rounded-sm px-3 text-[13px] ring-1 ring-inset transition-colors", open ? "bg-mist ring-line-strong" : "ring-line-strong hover:bg-paper")}>
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
            </>
          )}
        </Dropdown>

        <Dropdown
          label="Profile"
          width="w-64"
          trigger={({ open }) => (
            <span className={cn("inline-flex h-9 items-center gap-2 rounded-sm pl-1 pr-2 transition-colors", open ? "bg-mist" : "hover:bg-paper")}>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[11px] font-medium text-white">{user?.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}</span>
              <ChevronDown className="h-3.5 w-3.5 text-ink-2" aria-hidden />
            </span>
          )}
        >
          {(close) => (
            <>
              <div className="px-3.5 py-2.5">
                <p className="text-[13.5px] font-medium">{user?.name}</p>
                <p className="text-[12px] text-ink-2">{user?.designation}</p>
                <p className="mt-0.5 truncate text-[12px] text-ink-2">{user?.email}</p>
                <span className="mt-2 inline-block rounded-xs bg-caution/10 px-1.5 py-0.5 text-[10.5px] font-medium text-caution">Demo session</span>
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
