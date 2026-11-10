"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Hook for future error reporting (e.g. Sentry)
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <p className="kicker text-negative">UNEXPECTED ERROR</p>
      <h1 className="mt-4 display text-[34px]">Something went wrong.</h1>
      <p className="mt-3 max-w-md text-ink-2">The view failed to render. You can retry, or return to the home page.</p>
      <div className="mt-8 flex gap-3">
        <button onClick={reset} className="h-10 rounded-sm bg-brand px-4 text-sm font-medium text-white hover:bg-brand-dark">
          Try again
        </button>
        <a href="/" className="inline-flex h-10 items-center rounded-sm px-4 text-sm font-medium ring-1 ring-inset ring-line-strong hover:ring-ink/40">
          Home
        </a>
      </div>
    </main>
  );
}
