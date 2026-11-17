"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { demoCredentials } from "@/lib/auth/demo-auth";
import { safeNextPath } from "@/lib/auth/session-cookie";
import type { UserRole } from "@/lib/auth/types";
import { siteConfig } from "@/lib/config/site";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form-controls";
import { Logo } from "@/components/ui/logo";
import { DemoRequestDialog } from "@/components/forms/demo-request-dialog";
import { PartnerLogos } from "./partner-logos";

/**
 * The platform's entry point (root URL). Three actions only:
 * sign in · request a demo · explore the platform preview.
 */
export function LoginExperience() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNextPath(params.get("next"));
  const reduce = useReducedMotion();
  const { signIn, startDemo, session, ready, service } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<null | "login" | UserRole>(null);
  const [mode, setMode] = useState<"login" | "forgot" | "sent">("login");
  const [demoOpen, setDemoOpen] = useState(false);

  const destination = (role: UserRole) => next ?? (role === "mb_admin" ? "/admin" : "/dashboard");

  /** true once this page has started a navigation, so the redirect below never races it */
  const navigating = useRef(false);

  // Visitors who arrive already signed in go straight to their dashboard.
  useEffect(() => {
    if (ready && session && !navigating.current) {
      navigating.current = true;
      router.replace(destination(session.user.role));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, session]);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Please enter your email or username and your password.");
      return;
    }
    setBusy("login");
    navigating.current = true;
    try {
      const s = await signIn(email, password, remember);
      router.push(destination(s.user.role));
    } catch (err) {
      navigating.current = false;
      setError(err instanceof Error ? err.message : "Sign-in failed.");
      setBusy(null);
    }
  }

  async function onDemo(role: UserRole) {
    setBusy(role);
    navigating.current = true;
    await startDemo(role);
    router.push(role === "mb_admin" ? "/admin" : next ?? "/dashboard");
  }

  async function onForgot(e: FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setBusy("login");
    await service.requestPasswordReset(email);
    setBusy(null);
    setMode("sent");
  }

  const fade = (d: number) => (reduce ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay: d, ease: [0.16, 1, 0.3, 1] as const } });

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 px-5 py-4 sm:px-8 sm:py-5">
        <Logo size="lg" />
        <PartnerLogos />
      </header>

      <main id="main" className="mx-auto grid w-full max-w-[1280px] flex-1 items-center gap-12 px-5 pb-12 pt-6 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:pt-0">
        <motion.section {...fade(0.05)} className="lg:col-span-6 xl:col-span-7" aria-label="Introduction">
          <div className="h-[2px] w-12 bg-brand" aria-hidden />
          <h1 className="display mt-7 text-[40px] leading-[1.05] sm:text-[54px] xl:text-[64px]">
            Real Estate Intelligence.
            <span className="block text-brand">Beyond the Obvious.</span>
          </h1>
          <p className="mt-7 max-w-[34rem] text-[17px] leading-relaxed text-ink-2 sm:text-[18px]">{siteConfig.supportingText}</p>
        </motion.section>

        <motion.section {...fade(0.15)} className="lg:col-span-6 xl:col-span-5" aria-label="Sign in">
          <div className="rounded-md border border-line bg-white p-7 shadow-[var(--shadow-lift)] sm:p-9">
            {mode === "login" ? (
              <>
                <h2 className="display text-[30px] leading-tight">Welcome Back</h2>
                <p className="mt-1.5 text-[14.5px] text-ink-2">Sign in to your organisation&apos;s market intelligence dashboard.</p>

                <form onSubmit={onLogin} noValidate className="mt-7 space-y-4">
                  <Field label="Email / Username" htmlFor="login-email">
                    <Input id="login-email" type="text" inputMode="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </Field>
                  <Field label="Password" htmlFor="login-password">
                    <div className="relative">
                      <Input id="login-password" type={showPw ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-11" />
                      <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xs p-1.5 text-ink-2 hover:text-ink" aria-label={showPw ? "Hide password" : "Show password"} aria-pressed={showPw}>
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>
                  <div className="flex items-center justify-between">
                    <label className="inline-flex cursor-pointer items-center gap-2 text-[13.5px] text-ink">
                      <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-brand" />
                      Remember me
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot");
                        setError(null);
                      }}
                      className="text-[13.5px] font-medium text-brand hover:text-brand-dark"
                    >
                      Forgot password?
                    </button>
                  </div>
                  {error && (
                    <p className="rounded-sm bg-negative/[0.07] px-3 py-2.5 text-[13px] text-negative" role="alert">
                      {error}
                    </p>
                  )}
                  <Button type="submit" size="lg" variant="primary" className="w-full" disabled={busy !== null}>
                    {busy === "login" && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />}
                    Login
                  </Button>
                </form>

                <div className="mt-7 border-t border-line pt-5">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-caution">Demonstration access</p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-2">For the management showcase. Frontend-only access to synthetic data — not production authentication.</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <Button size="sm" onClick={() => onDemo("client_analyst")} disabled={busy !== null}>
                      {busy === "client_analyst" && <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden />}
                      Enter demo dashboard
                    </Button>
                    <button type="button" onClick={() => onDemo("mb_admin")} disabled={busy !== null} className="text-[12.5px] text-ink-2 underline-offset-2 hover:text-ink hover:underline disabled:opacity-50">
                      {busy === "mb_admin" ? "Opening…" : "Admin demo"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail(demoCredentials.email);
                        setPassword(demoCredentials.password);
                        setError(null);
                      }}
                      className="text-[12.5px] text-ink-2 underline-offset-2 hover:text-ink hover:underline"
                    >
                      Fill demo account
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="display text-[30px] leading-tight">Reset password</h2>
                {mode === "sent" ? (
                  <div className="mt-5 space-y-5">
                    <p className="rounded-sm bg-paper p-4 text-[14px] leading-relaxed" role="status">
                      No email is sent in this showcase. Once production authentication is connected, a reset link will be sent to <span className="font-medium">{email}</span>.
                    </p>
                    <Button onClick={() => setMode("login")}>
                      <ArrowLeft className="h-4 w-4" aria-hidden /> Back to sign in
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={onForgot} noValidate className="mt-5 space-y-4">
                    <p className="text-[14.5px] text-ink-2">Enter the email address associated with your account.</p>
                    <Field label="Email" htmlFor="reset-email">
                      <Input id="reset-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </Field>
                    {error && (
                      <p className="text-[13px] text-negative" role="alert">
                        {error}
                      </p>
                    )}
                    <div className="flex gap-3">
                      <Button type="submit" variant="primary" disabled={busy !== null}>
                        Send reset link
                      </Button>
                      <Button variant="ghost" onClick={() => setMode("login")}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Button variant="primary" size="lg" onClick={() => setDemoOpen(true)}>
              Request a Demo
            </Button>
            <Link href="/preview" className="inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-white px-6 text-[15px] font-medium text-ink ring-1 ring-inset ring-line-strong transition-colors hover:ring-ink/40">
              Explore Platform <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </motion.section>
      </main>

      <footer className="mx-auto w-full max-w-[1280px] border-t border-line px-5 py-5 text-[12px] text-ink-2 sm:px-8">
        <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.parentBrand}. {siteConfig.name} is a product of MB Research.
          </p>
          <p>Showcase build · all figures are synthetic demonstration data.</p>
        </div>
      </footer>

      <DemoRequestDialog open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
