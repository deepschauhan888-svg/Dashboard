import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <Link href="/" aria-label="Home">
        <Logo />
      </Link>
      <p className="kicker mt-16 text-brand">Page not found</p>
      <h1 className="display mt-4 text-[40px] sm:text-[52px]">This page does not exist.</h1>
      <p className="mx-auto mt-4 max-w-md text-ink-2">The address may have changed, or the page may have moved.</p>
      <div className="mt-10 flex justify-center gap-3">
        <Link href="/" className="inline-flex h-10 items-center rounded-sm bg-brand px-4 text-sm font-medium text-white hover:bg-brand-dark">
          Back to home
        </Link>
        <Link href="/contact" className="inline-flex h-10 items-center rounded-sm px-4 text-sm font-medium ring-1 ring-inset ring-line-strong hover:ring-ink/40">
          Contact us
        </Link>
      </div>
    </main>
  );
}
