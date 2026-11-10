"use client";

import { ArrowLeft, Eye, EyeOff, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { demoCredentials } from "@/lib/auth/demo-auth";
import type { UserRole } from "@/lib/auth/types";
import { siteConfig } from "@/lib/config/site";
import { Field, Input } from "@/components/ui/form-controls";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ImageSlot } from "@/components/media/image-slot";

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
    <main className="grid min-h-screen bg-white lg:grid-cols-[1fr_1.05fr]">
      <section className="flex flex-col px-6 py-8 sm:px-12 lg:px-16 xl:px-24">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="MB Research Intelligence — home">
            <Logo />
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-[13.5px] text-ink-2 hover:text-ink">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Website
          </Link>
        </div>

        <div className="mx-auto my-auto w-full max-w-[400px] py-12">
          {mode === "login" ? (
            <>
              <h1 className="display text-[36px] leading-tight">Sign in</h1>
              <p className="mt-2 text-[15px] text-ink-2">Access your organisation&apos;s market intelligence workspace.</p>

              <form onSubmit={onLogin} noValidate className="mt-10 space-y-5">
                <Field label="Email" htmlFor="login-email">
                  <Input id="login-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
                </Field>
                <Field label="Password" htmlFor="login-password">
                  <div className="relative">
                    <Input id="login-password" type={showPw ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-11" />
                    <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xs p-1.5 text-ink-2 hover:text-ink" aria-label={showPw ? "Hide password" : "Show password"}>
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>
                <div className="flex items-center justify-between">
                  <label className="inline-flex cursor-pointer items-center gap-2 text-[13.5px] text-ink">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-brand" />
                    Remember me
                  </label>
                  <button type="button" onClick={() => { setMode("forgot"); setError(null); }} className="text-[13.5px] font-medium text-brand hover:text-brand-dark">
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
                  Sign in
                </Button>
              </form>

              <div className="mt-10 border-t border-line pt-8">
                <p className="text-[13px] font-semibold">Management preview</p>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-2">Demonstration access to the synthetic dataset. This is not production authentication and protects no real information.</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <Button onClick={() => onDemo("client_analyst")} disabled={busy !== null}>
                    {busy === "client_analyst" && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />}
                    Enter demo workspace
                  </Button>
                  <Button onClick={() => onDemo("mb_admin")} disabled={busy !== null}>
                    {busy === "mb_admin" && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />}
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
                  className="mt-3 text-[12.5px] text-ink-2 underline-offset-2 hover:text-ink hover:underline"
                >
                  Or fill in the demonstration account ({demoCredentials.email})
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="display text-[36px] leading-tight">Reset your password</h1>
              {mode === "sent" ? (
                <div className="mt-6 space-y-6">
                  <p className="rounded-sm bg-paper p-4 text-[14px] leading-relaxed text-ink" role="status">
                    No email is sent in this preview. Once live authentication is connected, a reset link will be sent to <span className="font-medium">{email}</span>.
                  </p>
                  <Button onClick={() => setMode("login")}>
                    <ArrowLeft className="h-4 w-4" aria-hidden /> Back to sign in
                  </Button>
                </div>
              ) : (
                <form onSubmit={onForgot} noValidate className="mt-6 space-y-5">
                  <p className="text-[15px] text-ink-2">Enter the email address associated with your account.</p>
                  <Field label="Email" htmlFor="reset-email">
                    <Input id="reset-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </Field>
                  {error && <p className="text-[13px] text-negative" role="alert">{error}</p>}
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
        <p className="text-[12px] text-ink-2">© MB Research · {siteConfig.parentBrand}</p>
      </section>

      <section className="hidden flex-col border-l border-line bg-paper lg:flex" aria-hidden>
        <div className="relative flex-1">
          <ImageSlot src={siteConfig.imagery.platform} alt="" variant="skyline" className="absolute inset-0 h-full w-full rounded-none" sizes="50vw" />
        </div>
        <div className="border-t border-line bg-white px-16 py-12">
          <div className="h-[2px] w-10 bg-brand" />
          <p className="display mt-6 max-w-md text-[28px] leading-snug">{siteConfig.tagline}</p>
        </div>
      </section>
    </main>
  );
}
