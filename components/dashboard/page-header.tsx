import type { ReactNode } from "react";
import { DemoDataBadge } from "@/components/ui/badge";

export function WorkspacePageHeader({ code, title, description, actions }: { code: string; title: string; description: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <span className="eyebrow text-signal-400">{code}</span>
          <DemoDataBadge />
        </div>
        <h1 className="mt-2 text-[26px] font-semibold tracking-tight text-white sm:text-[30px]">{title}</h1>
        <p className="mt-1 max-w-3xl text-[14px] text-white/55">{description}</p>
      </div>
      {actions}
    </div>
  );
}
