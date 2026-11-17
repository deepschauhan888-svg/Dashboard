/**
 * Session marker cookie read by middleware.ts to block direct URL access to
 * protected routes before any page renders.
 *
 * DEMO: the cookie is set in the browser and only says "a demo session exists".
 * It is not a credential and is trivially forgeable — fine for keeping casual
 * visitors out of the showcase, never acceptable for real data.
 * PRODUCTION: replace with the auth provider's signed, HttpOnly session cookie
 * (e.g. Supabase Auth via @supabase/ssr) and verify it in middleware.
 */
export const SESSION_COOKIE = "mbri_session";

/** Routes that require a session. Keep in sync with `config.matcher` in middleware.ts. */
export const PROTECTED_PREFIXES = ["/dashboard", "/admin"] as const;

export function setSessionCookie(remember: boolean) {
  const maxAge = remember ? `; Max-Age=${60 * 60 * 24 * 30}` : "";
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${SESSION_COOKIE}=demo; Path=/; SameSite=Lax${maxAge}${secure}`;
}

export function clearSessionCookie() {
  document.cookie = `${SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

/** Only allow redirects back into the app's own protected routes. */
export function safeNextPath(next: string | null): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return null;
  return PROTECTED_PREFIXES.some((p) => next === p || next.startsWith(`${p}/`)) ? next : null;
}
