import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginExperience } from "@/components/auth/login-experience";
import { siteConfig } from "@/lib/config/site";

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name} — Sign in` },
  description: siteConfig.description,
};

/** The root URL is the sign-in page. */
export default function EntryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <LoginExperience />
    </Suspense>
  );
}
