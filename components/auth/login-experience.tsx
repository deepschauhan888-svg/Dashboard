"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound, LoaderCircle, ShieldAlert, Sparkle, UserCog } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { demoCredentials } from "@/lib/auth/demo-auth";
import type { UserRole } from "@/lib/auth/types";
import { Field, Input } from "@/components/ui/form-controls";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { HeroCanvas } from "@/components/home/hero-canvas";

export function LoginExperience() {
  const router = useRouter();
  const { signIn, startDemo, session, ready, service } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<null | "login" | UserRole>(null);
  const [mode, setMode] = useState<"login" | "forgot" | "sent">("login");

  useEffect(() => {
    if (ready && session) router.replace(session.user.role === "mb_admin" ? "/admin" : "/dashboard");
  }, [ready, session, router]);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setBusy("login");
    try {
      await signIn(email, password, remember);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
      setBusy(null);
    }
  }

  async function onDemo(role: UserRole) {
    setBusy(role);
    await startDemo(role);
    router.push(role === "mb_admin" ? "/admin" : "/dashboard");
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

  return (
    <main className="grid min-h-screen bg-ink-900 text-white lg:grid-cols-2">
      {/* Visual side */}
      <section className="relative hidden overflow-hidden lg:block" aria-hidden>
        <HeroCanvas className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-br from-ink-900/90 via-ink-900/50 to-ink-900/90" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo />
          <div>
            <p className="eyebrow text-signal-200">Client workspace</p>
            <p className="mt-5 max-w-md text-[40px] font-semibold leading-[1.08] tracking-[-0.03em]">
              Understand markets. <span className="font-serif font-light italic text-signal-200">Anticipate demand.</span> Make better decisions.
            </p>
            <div className="mt-10 grid max-w-md grid-cols-3 gap-px overflow-hidden rounded-xs bg-white/10">
              {["Demand", "Supply", "Price"].map((t) => (
                <div key={t} className="bg-ink-900/80 px-4 py-3">
                  <p className="font-mono text-[10px] tracking-[0.2em] text-white/40">MODULE</p>
                  <p className="mt-1 text-[14px]">{t}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[12px] text-white/35">© MB Research · Magicbricks</p>
        </div>
      </section>

      {/* Form side */}
      <section className="relative flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="grid-lines absolute inset-0 opacity-40 lg:hidden" aria-hidden />
        <div className="relative mx-auto w-full max-w-[420px]">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2 text-[13px] text-white/55 hover:text-white">
              <ArrowLeft className="h-4 w-4" aria-hidden /> Website
            </Link>
            <span className="lg:hidden">
              <Logo compact />
            </span>
          </div>

          <AnimatePresence mode="wait">
            {mode === "login" ? (
              <motion.div key="login" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                <h1 className="mt-12 text-[30px] font-semibold tracking-tight">Sign in to MB Research Intelligence</h1>
                <p className="mt-2 text-[14.5px] text-white/55">Access your organisation&apos;s market intelligence workspace.</p>

                <form onSubmit={onLogin} noValidate className="mt-9 space-y-5">
                  <Field label="Email or username" htmlFor="login-email" skin="dark">
                    <Input id="login-email" skin="dark" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </Field>
                  <Field label="Password" htmlFor="login-password" skin="dark">
                    <div className="relative">
                      <Input id="login-password" skin="dark" type={showPw ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-11" />
                      <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xs p-1.5 text-muted hover:text-white" aria-label={showPw ? "Hide password" : "Show password"}>
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>
                  <div className="flex items-center justify-between">
                    <label className="inline-flex cursor-pointer items-center gap-2 text-[13.5px] text-white/70">
                      <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-signal-500" />
                      Remember me
                    </label>
                    <button type="button" onClick={() => { setMode("forgot"); setError(null); }} className="text-[13.5px] text-signal-400 hover:text-signal-200">
                      Forgot password?
                    </button>
                  </div>
                  {error && (
                    <p className="rounded-xs bg-negative/10 px-3 py-2.5 text-[13px] text-negative ring-1 ring-inset ring-negative/30" role="alert">
                      {error}
                    </p>
                  )}
                  <Button type="submit" size="lg" className="w-full" disabled={busy !== null}>
                    {busy === "login" ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : <KeyRound className="h-4 w-4" aria-hidden />}
                    Sign in
                  </Button>
                </form>

                {/* Demo access */}
                <div className="mt-10 rounded-xs border border-caution/35 bg-caution/[0.06] p-5">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-caution" aria-hidden />
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-caution">Demo access</p>
                  </div>
                  <p className="mt-3 text-[13px] leading-relaxed text-white/65">
                    This showcase uses frontend-only demo access to synthetic data. It is not production authentication and protects no real information.
                  </p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <Button variant="secondary" onClick={() => onDemo("client_analyst")} disabled={busy !== null}>
                      {busy === "client_analyst" ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : <Sparkle className="h-4 w-4" aria-hidden />}
                      Enter demo workspace
                    </Button>
                    <Button variant="secondary" onClick={() => onDemo("mb_admin")} disabled={busy !== null}>
                      {busy === "mb_admin" ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : <UserCog className="h-4 w-4" aria-hidden />}
                      Admin console
                    </Button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(demoCredentials.email);
                      setPassword(demoCredentials.password);
                      setError(null);
                    }}
                    className="mt-3 text-[12.5px] text-white/50 underline-offset-2 hover:text-white hover:underline"
                  >
                    Or fill the demonstration account: <span className="font-mono">{demoCredentials.email}</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="forgot" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                <h1 className="mt-12 text-[30px] font-semibold tracking-tight">Reset your password</h1>
                {mode === "sent" ? (
                  <div className="mt-6 space-y-5">
                    <p className="rounded-xs bg-white/[0.04] p-4 text-[14px] leading-relaxed text-white/70 ring-1 ring-inset ring-white/10" role="status">
                      In the showcase build no email is sent. Once live authentication is connected, a reset link will be emailed to <span className="font-mono text-white">{email}</span>.
                    </p>
                    <Button variant="secondary" onClick={() => setMode("login")}>
                      <ArrowLeft className="h-4 w-4" aria-hidden /> Back to sign in
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={onForgot} noValidate className="mt-8 space-y-5">
                    <p className="text-[14.5px] text-white/55">Enter the email address associated with your account.</p>
                    <Field label="Email" htmlFor="reset-email" skin="dark">
                      <Input id="reset-email" skin="dark" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </Field>
                    {error && <p className="text-[13px] text-negative" role="alert">{error}</p>}
                    <div className="flex gap-3">
                      <Button type="submit" disabled={busy !== null}>
                        Send reset link <ArrowRight className="h-4 w-4" aria-hidden />
                      </Button>
                      <Button variant="ghost" onClick={() => setMode("login")} className="text-white/70">
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
