/**
 * Authentication contracts. The showcase uses DemoAuthService (frontend-only,
 * NOT secure). Production will implement AuthService with Supabase Auth
 * (email/password + SSO), server-validated sessions and row-level security.
 */

export type UserRole = "client_analyst" | "client_admin" | "mb_admin";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  organisation: string;
  designation: string;
  role: UserRole;
}

export interface Session {
  user: SessionUser;
  /** "demo" sessions grant access to demonstration data only */
  kind: "demo" | "live";
  issuedAt: string;
}

export interface AuthService {
  readonly kind: "demo" | "supabase";
  getSession(): Session | null;
  signIn(email: string, password: string, remember: boolean): Promise<Session>;
  startDemo(role: UserRole): Promise<Session>;
  signOut(): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
}
