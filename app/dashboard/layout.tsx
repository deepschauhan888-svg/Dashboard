import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/dashboard/workspace-shell";

export const metadata: Metadata = {
  title: { default: "Workspace", template: "%s · MB Research Intelligence" },
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
