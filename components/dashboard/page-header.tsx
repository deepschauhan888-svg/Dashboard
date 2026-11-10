import type { ReactNode } from "react";

export function WorkspacePageHeader({ kicker, title, description, actions }: { kicker: string; title: string; description: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="kicker text-brand">{kicker}</p>
        <h1 className="display mt-2 text-[30px] leading-tight sm:text-[34px]">{title}</h1>
        <p className="mt-2 max-w-3xl text-[14.5px] text-ink-2">{description}</p>
      </div>
      {actions}
    </div>
  );
}

/** Light section divider with a title, used to give long views a clear hierarchy. */
export function SectionTitle({ n, title, description }: { n?: string; title: string; description?: string }) {
  return (
    <div className="mb-4 mt-12 flex items-baseline gap-3 border-t border-line pt-6 first:mt-0">
      {n && <span className="text-[12px] font-medium tabular text-brand">{n}</span>}
      <div>
        <h2 className="text-[18px] font-semibold">{title}</h2>
        {description && <p className="mt-0.5 text-[13px] text-ink-2">{description}</p>}
      </div>
    </div>
  );
}
