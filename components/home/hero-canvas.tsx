"use client";

import { useEffect, useRef } from "react";

/**
 * Generative "aerial city" — a rotated street grid subdivided into parcels,
 * with data nodes pulsing and signal pulses travelling along connections.
 * Pure canvas, no assets. Static single frame when reduced motion is preferred.
 */
export function HeroCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;

    // deterministic PRNG so the city looks identical on every visit
    let seed = 20261110;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };

    type Parcel = { x: number; y: number; w: number; h: number; tone: number };
    type Node = { x: number; y: number; r: number; phase: number; hot: boolean };
    type Link = { a: number; b: number; t: number; speed: number };

    const parcels: Parcel[] = [];
    const arterials: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const nodes: Node[] = [];
    const links: Link[] = [];
    const WORLD = 2400;

    function build() {
      parcels.length = 0;
      arterials.length = 0;
      nodes.length = 0;
      links.length = 0;
      seed = 20261110;
      const block = 120;
      for (let gx = -WORLD / 2; gx < WORLD / 2; gx += block) {
        for (let gy = -WORLD / 2; gy < WORLD / 2; gy += block) {
          const street = 14;
          const bx = gx + street / 2;
          const by = gy + street / 2;
          const bw = block - street;
          // subdivide each block into 2–6 parcels
          const cols = 1 + Math.floor(rnd() * 3);
          const rows = 1 + Math.floor(rnd() * 2);
          for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows; r++) {
              const pw = bw / cols;
              const ph = bw / rows;
              const inset = 3 + rnd() * 6;
              parcels.push({ x: bx + c * pw + inset, y: by + r * ph + inset, w: pw - inset * 2, h: ph - inset * 2, tone: rnd() });
            }
          }
        }
      }
      for (let i = -WORLD / 2; i < WORLD / 2; i += 480) {
        arterials.push({ x1: i, y1: -WORLD / 2, x2: i, y2: WORLD / 2 });
        arterials.push({ x1: -WORLD / 2, y1: i, x2: WORLD / 2, y2: i });
      }
      // nodes cluster loosely toward the centre-right where the headline isn't
      for (let i = 0; i < 46; i++) {
        const p = parcels[Math.floor(rnd() * parcels.length)];
        nodes.push({ x: p.x + p.w / 2, y: p.y + p.h / 2, r: 1.5 + rnd() * 2, phase: rnd() * Math.PI * 2, hot: rnd() > 0.8 });
      }
      nodes.forEach((n, i) => {
        const near = nodes
          .map((m, j) => ({ j, d: Math.hypot(m.x - n.x, m.y - n.y) }))
          .filter((o) => o.j !== i && o.d < 520)
          .sort((a, b) => a.d - b.d)
          .slice(0, 2);
        near.forEach((o) => {
          if (!links.some((l) => (l.a === o.j && l.b === i) || (l.a === i && l.b === o.j))) {
            links.push({ a: i, b: o.j, t: rnd(), speed: 0.0012 + rnd() * 0.0022 });
          }
        });
      });
    }

    function resize() {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
    }

    function frame(time: number) {
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const drift = reduce ? 0 : time * 0.006;
      ctx.save();
      ctx.translate(w * 0.62, h * 0.52);
      ctx.rotate(-0.42);
      ctx.scale(1, 0.62); // oblique aerial perspective
      ctx.translate(-drift, drift * 0.4);

      // parcels
      for (const p of parcels) {
        ctx.fillStyle = p.tone > 0.82 ? "rgba(49,139,255,0.075)" : p.tone > 0.5 ? "rgba(169,209,255,0.028)" : "rgba(169,209,255,0.014)";
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.strokeStyle = "rgba(169,209,255,0.07)";
        ctx.lineWidth = 0.6;
        ctx.strokeRect(p.x, p.y, p.w, p.h);
      }
      // arterial roads
      ctx.strokeStyle = "rgba(90,162,255,0.16)";
      ctx.lineWidth = 1.2;
      for (const a of arterials) {
        ctx.beginPath();
        ctx.moveTo(a.x1, a.y1);
        ctx.lineTo(a.x2, a.y2);
        ctx.stroke();
      }
      // links + travelling pulses
      for (const l of links) {
        const A = nodes[l.a];
        const B = nodes[l.b];
        ctx.strokeStyle = "rgba(90,162,255,0.22)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.stroke();
        if (!reduce) l.t = (l.t + l.speed) % 1;
        const px = A.x + (B.x - A.x) * l.t;
        const py = A.y + (B.y - A.y) * l.t;
        const g = ctx.createRadialGradient(px, py, 0, px, py, 10);
        g.addColorStop(0, "rgba(169,209,255,0.9)");
        g.addColorStop(1, "rgba(49,139,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, 10, 0, Math.PI * 2);
        ctx.fill();
      }
      // nodes
      for (const n of nodes) {
        const pulse = reduce ? 0.5 : (Math.sin(time * 0.0016 + n.phase) + 1) / 2;
        if (n.hot) {
          ctx.strokeStyle = `rgba(49,139,255,${0.5 - pulse * 0.4})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 6 + pulse * 18, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = n.hot ? "#A9D1FF" : "rgba(169,209,255,0.75)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + (n.hot ? 1 : 0), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      if (!reduce) raf = requestAnimationFrame(frame);
    }

    build();
    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) frame(0);
    });
    ro.observe(canvas);
    raf = requestAnimationFrame(frame);

    // pause when hidden
    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!reduce) raf = requestAnimationFrame(frame);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden />;
}
