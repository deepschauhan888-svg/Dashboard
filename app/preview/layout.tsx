import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/dashboard/workspace-shell";

export const metadata: Metadata = {
  title: { default: "Platform Preview", template: "%s · Platform Preview · MB Research Intelligence" },
  description: "Explore the MB Research Intelligence analytics modules on synthetic demonstration data.",
};

/** Public "Explore Platform" preview: the real dashboard modules, no sign-in, demonstration data only. */
export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell mode="preview">{children}</WorkspaceShell>;
}
