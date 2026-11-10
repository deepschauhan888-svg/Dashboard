import type { Metadata } from "next";
import { LoginExperience } from "@/components/auth/login-experience";

export const metadata: Metadata = {
  title: "Client Login",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <LoginExperience />;
}
