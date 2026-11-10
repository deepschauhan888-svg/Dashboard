/**
 * DEMO ACCESS ONLY — this is not authentication.
 *
 * The session is a flag in browser storage so management can explore the
 * showcase without a backend. It protects nothing and must never guard real
 * data. Replace with SupabaseAuthService (see README → Future integration).
 */
import type { AuthService, Session, SessionUser, UserRole } from "./types";

const KEY = "mbri.demo-session";

const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL ?? "demo@mbresearch.demo";
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "demo-access";

export const demoCredentials = { email: DEMO_EMAIL, password: DEMO_PASSWORD };

const PERSONAS: Record<UserRole, SessionUser> = {
  client_analyst: {
    id: "demo-analyst",
    name: "Demo Analyst",
    email: DEMO_EMAIL,
    organisation: "Demo Developer Pvt. Ltd. (fictional)",
    designation: "Head of Strategy",
    role: "client_analyst",
  },
  client_admin: {
    id: "demo-client-admin",
    name: "Demo Client Admin",
    email: DEMO_EMAIL,
    organisation: "Demo Developer Pvt. Ltd. (fictional)",
    designation: "Business Head",
    role: "client_admin",
  },
  mb_admin: {
    id: "demo-mb-admin",
    name: "Demo MB Administrator",
    email: DEMO_EMAIL,
    organisation: "MB Research (demo)",
    designation: "Platform Administrator",
    role: "mb_admin",
  },
};

function read(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY) ?? window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function write(session: Session, remember: boolean) {
  try {
    const store = remember ? window.localStorage : window.sessionStorage;
    store.setItem(KEY, JSON.stringify(session));
  } catch {
    /* storage unavailable — session lives for this page only */
  }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class DemoAuthService implements AuthService {
  readonly kind = "demo" as const;

  getSession() {
    return read();
  }

  async signIn(email: string, password: string, remember: boolean): Promise<Session> {
    await delay(500);
    if (email.trim().toLowerCase() !== DEMO_EMAIL.toLowerCase() || password !== DEMO_PASSWORD) {
      throw new Error(
        "Live accounts are not yet enabled. Use the demonstration account shown on this page, or choose “Enter demo workspace”.",
      );
    }
    const session: Session = { user: PERSONAS.client_analyst, kind: "demo", issuedAt: new Date().toISOString() };
    write(session, remember);
    return session;
  }

  async startDemo(role: UserRole): Promise<Session> {
    await delay(350);
    const session: Session = { user: PERSONAS[role], kind: "demo", issuedAt: new Date().toISOString() };
    write(session, false);
    return session;
  }

  async signOut() {
    try {
      window.localStorage.removeItem(KEY);
      window.sessionStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }

  async requestPasswordReset(_email: string) {
    await delay(400);
    // No email is sent in the showcase build.
  }
}
