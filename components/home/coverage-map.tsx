"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import { coverageConfig, type CoverageCity, type CoverageStatus } from "@/lib/config/coverage";
import { getMarketingSnapshot } from "@/lib/data/demo/marketing-snapshot";
import { formatNumber, formatPct, formatPsf, formatRatio } from "@/lib/utils/format";
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
    <section className="relative bg-white py-24 sm:py-32" aria-label="Market coverage">
      <Container>
        <SectionHeading
          index="03"
          eyebrow="Coverage"
          title="Market Coverage,"
          accent="City by City."
          lede="Explore the markets represented in the platform preview. Select a city to see its demonstration indicators."
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-12">
          <div className="relative flex flex-col overflow-hidden rounded-xs bg-ink-900 lg:col-span-7">
            <div className="grid-lines absolute inset-0" aria-hidden />
            <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-3">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by coverage status">
                {statuses.map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={visible[s]}
                    onClick={() => setVisible((v) => ({ ...v, [s]: !v[s] }))}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-xs px-2.5 py-1 text-[12px] ring-1 ring-inset transition-colors",
                      visible[s] ? "bg-white/[0.06] text-white ring-white/20" : "text-white/40 ring-white/10",
                    )}
                  >
                    <StatusDot status={s} /> {STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-white/40">{coverageConfig.outlineNote}</span>
            </div>
            <svg viewBox={`-20 -10 ${MAP_WIDTH + 40} ${MAP_HEIGHT + 20}`} className="relative m-auto block h-auto w-full max-w-[560px] px-4 py-6" role="group" aria-label="Schematic map of India with market markers">
              <defs>
                <pattern id="dots" width="8" height="8" patternUnits="userSpaceOnUse">
                  <circle cx="1.2" cy="1.2" r="1.2" fill="rgba(169,209,255,0.16)" />
                </pattern>
              </defs>
              <path d={path} fill="url(#dots)" stroke="rgba(169,209,255,0.35)" strokeWidth="1.2" strokeLinejoin="round" />
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
                    className="cursor-pointer outline-none [&:focus-visible_circle.ring]:stroke-white"
                  >
                    <circle cx={m.x} cy={m.y} r="22" fill="transparent" />
                    {m.status !== "planned" && (
                      <circle cx={m.x} cy={m.y} r="6" fill="none" stroke="#318BFF" strokeOpacity="0.6" className="origin-center animate-pulse-ring" style={{ transformBox: "fill-box" }} />
                    )}
                    <circle
                      className="ring"
                      cx={m.x}
                      cy={m.y}
                      r={isActive ? 7 : 5}
                      fill={m.status === "planned" ? "transparent" : isActive ? "#318BFF" : "#A9D1FF"}
                      stroke={m.status === "planned" ? "#A9D1FF" : "#071426"}
                      strokeWidth={m.status === "planned" ? 1.5 : 2}
                      strokeDasharray={m.status === "planned" ? "2 2" : undefined}
                    />
                    <text
                      x={side === "right" ? m.x + 12 : m.x - 12}
                      y={m.y + 4}
                      textAnchor={side === "right" ? "start" : "end"}
                      className={cn("select-none font-sans text-[13px]", isActive ? "fill-white font-semibold" : "fill-white/60")}
                    >
                      {m.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex flex-col lg:col-span-5">
            <AnimatePresence mode="wait">
              <motion.div key={active.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.3 }} className="rounded-xs border border-rule p-6" aria-live="polite">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="eyebrow text-subtle">{active.region}</p>
                    <h3 className="mt-2 text-[28px] font-semibold tracking-tight text-ink-900">{active.label}</h3>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-xs bg-mist px-2 py-1 text-[12px] text-subtle">
                    <StatusDot status={active.status} /> {STATUS_LABEL[active.status]}
                  </span>
                </div>
                <div className="mt-6 space-y-5">
                  {active.cities.map((c) => {
                    const m = metricsFor(c.demoCityId);
                    return (
                      <div key={c.id} className="border-t border-rule pt-5">
                        {active.cities.length > 1 && <p className="mb-3 flex items-center gap-2 text-[14px] font-medium text-ink-900"><MapPin className="h-3.5 w-3.5 text-signal-500" aria-hidden /> {c.name}</p>}
                        {m ? (
                          <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                            <Metric label="Demand units" value={formatNumber(m.demand)} />
                            <Metric label="Avg price" value={`${formatPsf(m.avgPrice)}/sq ft`} />
                            <Metric label="Price YoY" value={formatPct(m.priceYoY)} />
                            <Metric label="Demand / supply" value={formatRatio(m.dsRatio)} />
                          </dl>
                        ) : (
                          <p className="text-[14px] text-subtle">Planned market — not included in the demonstration dataset.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-rule pt-4">
                  <span className="text-[12px] text-muted">{snap.yearPeriodLabel}</span>
                  <DemoDataBadge compact />
                </div>
              </motion.div>
            </AnimatePresence>

            <ul className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xs bg-rule ring-1 ring-rule sm:grid-cols-3" aria-label="Markets">
              {markers.map((m) => (
                <li key={m.id} className="bg-white">
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(m.id);
                      setVisible((v) => ({ ...v, [m.status]: true }));
                    }}
                    aria-pressed={m.id === active.id}
                    className={cn("flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] transition-colors", m.id === active.id ? "bg-ink-900 text-white" : "text-text hover:bg-mist")}
                  >
                    <StatusDot status={m.status} /> {m.label}
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[12.5px] leading-relaxed text-muted">{coverageConfig.disclaimer}</p>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[12px] text-muted">{label}</dt>
      <dd className="mt-1 font-mono text-[17px] text-ink-900">{value}</dd>
    </div>
  );
}

function StatusDot({ status }: { status: CoverageStatus }) {
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 shrink-0 rounded-full",
        status === "live" && "bg-positive",
        status === "illustrative" && "bg-signal-500",
        status === "planned" && "border border-dashed border-signal-400 bg-transparent",
      )}
      aria-hidden
    />
  );
}
