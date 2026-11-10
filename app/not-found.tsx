import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink-900 px-6 text-center text-white">
      <div className="grid-lines absolute inset-0" aria-hidden />
      <div className="relative">
        <Link href="/" aria-label="Home">
          <Logo />
        </Link>
        <p className="mt-16 font-mono text-[13px] tracking-[0.3em] text-signal-400">ERROR 404</p>
        <h1 className="mt-4 text-[40px] font-semibold tracking-tight sm:text-[56px]">
          No signal <span className="font-serif font-light italic text-signal-200">at this address.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-white/60">The page you requested does not exist or has moved.</p>
        <div className="mt-10 flex justify-center gap-3">
          <Link href="/" className="inline-flex h-10 items-center rounded-sm bg-signal-500 px-4 text-sm font-medium text-white hover:bg-signal-400">
            Back to home
          </Link>
          <Link href="/dashboard" className="inline-flex h-10 items-center rounded-sm px-4 text-sm font-medium text-white ring-1 ring-inset ring-white/20 hover:ring-white/40">
            Open workspace
          </Link>
        </div>
      </div>
    </main>
  );
}
