import type { Metadata } from "next";
import { ExecutiveOverview } from "@/components/dashboard/executive-overview";

export const metadata: Metadata = { title: "Executive Market Overview" };

export default function DashboardPage() {
  return <ExecutiveOverview />;
}
