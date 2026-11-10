"use client";

import { useMemo, useState } from "react";
import { coverageConfig, type CoverageCity, type CoverageStatus } from "@/lib/config/coverage";
import { getMarketingSnapshot } from "@/lib/data/demo/marketing-snapshot";
import { formatPct, formatPsf, formatRatio } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { Container, SectionHeading } from "@/components/layout/section";
import { DemoDataBadge } from "@/components/ui/badge";
import { MAP_HEIGHT, MAP_WIDTH, outlinePath, project } from "./india-outline";

interface Marker {
  id: string;
  label: string;
  region: string;
  status: CoverageStatus;
  x: number;
  y: number;
  cities: CoverageCity[];
}

const STATUS_LABEL: Record<CoverageStatus, string> = { illustrative: "Illustrative", live: "Live", planned: "Planned" };

/** Groups NCR cities into one marker so labels never collide at national scale. */
function buildMarkers(cities: CoverageCity[]): Marker[] {
  const groups = new Map<string, CoverageCity[]>();
  cities.forEach((c) => {
    const key = c.region === "Delhi NCR" ? "ncr" : c.id;
    groups.set(key, [...(groups.get(key) ?? []), c]);
  });
  return [...groups.entries()].map(([key, list]) => {
    const lon = list.reduce((a, c) => a + c.lon, 0) / list.length;
    const lat = list.reduce((a, c) => a + c.lat, 0) / list.length;
    const [x, y] = project(lon, lat);
    return {
      id: key,
      label: key === "ncr" ? "Delhi NCR" : list[0].name,
      region: list[0].region,
      status: list.some((c) => c.status === "live") ? "live" : list.some((c) => c.status === "illustrative") ? "illustrative" : "planned",
      x,
      y,
      cities: list,
    };
  });
}

const LABEL_SIDE: Record<string, "left" | "right"> = { mumbai: "left", ahmedabad: "left", pune: "right", kochi: "left", bengaluru: "left", chandigarh: "left" };

export function CoverageMap() {
  const snap = useMemo(() => getMarketingSnapshot(), []);
  const [visible, setVisible] = useState<Record<CoverageStatus, boolean>>({ illustrative: true, live: true, planned: true });
  const markers = useMemo(() => buildMarkers(coverageConfig.cities), []);
  const [selected, setSelected] = useState<string>("ncr");
  const path = useMemo(() => outlinePath(), []);
  const active = markers.find((m) => m.id === selected) ?? markers[0];
  const shown = markers.filter((m) => visible[m.status]);

  const metricsFor = (demoCityId: string | null) => (demoCityId ? snap.cities.find((r) => r.id === demoCityId) ?? null : null);
  const statuses = [...new Set(markers.map((m) => m.status))] as CoverageStatus[];

  return (
    <section className="border-t border-line bg-paper py-24 sm:py-28" aria-label="Market coverage">
      <Container>
        <SectionHeading kicker="Coverage" title="Markets across India." lede="Select a city to see its indicators in the demonstration dataset." />

        <div className="mt-12 grid gap-6 lg:grid-cols-12">
          <div className="flex flex-col rounded-sm border border-line bg-white lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by coverage status">
                {statuses.map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={visible[s]}
                    onClick={() => setVisible((v) => ({ ...v, [s]: !v[s] }))}
                    className={cn("inline-flex items-center gap-2 rounded-xs px-2.5 py-1 text-[12.5px] ring-1 ring-inset transition-colors", visible[s] ? "text-ink ring-line-strong" : "text-ink-3 ring-line")}
                  >
                    <StatusDot status={s} /> {STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
              <span className="text-[11.5px] text-ink-2">{coverageConfig.outlineNote}</span>
            </div>
            <svg viewBox={`-20 -10 ${MAP_WIDTH + 40} ${MAP_HEIGHT + 20}`} className="m-auto block h-auto w-full max-w-[600px] px-4 py-6" role="group" aria-label="Schematic map of India with market markers">
              <path d={path} fill="#F3F3F3" stroke="#BDBDBD" strokeWidth="1.2" strokeLinejoin="round" />
              {shown.map((m) => {
                const isActive = m.id === active.id;
                const side = LABEL_SIDE[m.id] ?? "right";
                return (
                  <g
                    key={m.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${m.label} — ${STATUS_LABEL[m.status]}`}
                    aria-pressed={isActive}
                    onClick={() => setSelected(m.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelected(m.id);
                      }
                    }}
                    className="cursor-pointer outline-none [&:focus-visible_circle.dot]:stroke-ink"
                  >
                    <circle cx={m.x} cy={m.y} r="20" fill="transparent" />
                    {isActive && <circle cx={m.x} cy={m.y} r="13" fill="#B5122B" fillOpacity="0.12" />}
                    <circle
                      className="dot"
                      cx={m.x}
                      cy={m.y}
                      r={isActive ? 6.5 : 5}
                      fill={m.status === "planned" ? "#FFFFFF" : isActive ? "#B5122B" : "#252525"}
                      stroke={m.status === "planned" ? "#747474" : "#FFFFFF"}
                      strokeWidth={1.5}
                      strokeDasharray={m.status === "planned" ? "2 2" : undefined}
                    />
                    <text x={side === "right" ? m.x + 11 : m.x - 11} y={m.y + 4} textAnchor={side === "right" ? "start" : "end"} className={cn("select-none font-sans text-[13px]", isActive ? "fill-brand font-semibold" : "fill-[#5E5E5E]")}>
                      {m.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex flex-col gap-4 lg:col-span-5">
            <div className="rounded-sm border border-line bg-white p-6" aria-live="polite">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[12px] text-ink-2">{active.region}</p>
                  <h3 className="display mt-1 text-[30px]">{active.label}</h3>
                </div>
                <DemoDataBadge compact />
              </div>
              <div className="mt-4 space-y-4">
                {active.cities.map((c) => {
                  const m = metricsFor(c.demoCityId);
                  return (
                    <div key={c.id} className="border-t border-line pt-4">
                      {active.cities.length > 1 && <p className="mb-2 text-[14px] font-medium">{c.name}</p>}
                      {m ? (
                        <dl className="grid grid-cols-3 gap-4">
                          <Metric label="Avg price / sq ft" value={formatPsf(m.avgPrice)} />
                          <Metric label="Price YoY" value={formatPct(m.priceYoY)} />
                          <Metric label="Demand ÷ supply" value={formatRatio(m.dsRatio)} />
                        </dl>
                      ) : (
                        <p className="text-[14px] text-ink-2">Planned market — not part of the demonstration dataset.</p>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-[12px] text-ink-2">{snap.yearPeriodLabel} · demonstration figures</p>
            </div>

            <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-3" aria-label="Markets">
              {markers.map((m) => (
                <li key={m.id} className="bg-white">
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(m.id);
                      setVisible((v) => ({ ...v, [m.status]: true }));
                    }}
                    aria-pressed={m.id === active.id}
                    className={cn("flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] transition-colors", m.id === active.id ? "bg-brand-tint font-medium text-brand-dark" : "text-ink hover:bg-paper")}
                  >
                    <StatusDot status={m.status} /> {m.label}
                  </button>
                </li>
              ))}
            </ul>
            <p className="text-[12.5px] leading-relaxed text-ink-2">{coverageConfig.disclaimer}</p>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[12px] text-ink-2">{label}</dt>
      <dd className="mt-1 text-[18px] font-medium tabular text-ink">{value}</dd>
    </div>
  );
}

function StatusDot({ status }: { status: CoverageStatus }) {
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 shrink-0 rounded-full",
        status === "live" && "bg-positive",
        status === "illustrative" && "bg-ink",
        status === "planned" && "border border-dashed border-ink-2 bg-transparent",
      )}
      aria-hidden
    />
  );
}
