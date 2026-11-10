/**
 * Fine-line architectural illustration used wherever approved photography has
 * not yet been supplied. Deterministic, lightweight and on-palette: charcoal
 * linework on white with a single red accent.
 */
export function ArchitectureIllustration({ variant = "skyline", className }: { variant?: "skyline" | "facade" | "plan"; className?: string }) {
  if (variant === "facade") {
    return (
      <svg viewBox="0 0 600 450" className={className} preserveAspectRatio="xMidYMid slice" aria-hidden>
        <rect width="600" height="450" fill="#F7F7F7" />
        {Array.from({ length: 9 }).map((_, c) =>
          Array.from({ length: 12 }).map((__, r) => (
            <rect key={`${c}-${r}`} x={48 + c * 58} y={30 + r * 34} width="44" height="24" fill={c === 6 && r === 4 ? "#B5122B" : "#FFFFFF"} stroke="#CFCFCF" strokeWidth="1" />
          )),
        )}
        <line x1="0" y1="440" x2="600" y2="440" stroke="#252525" strokeWidth="1.2" />
      </svg>
    );
  }
  if (variant === "plan") {
    return (
      <svg viewBox="0 0 600 450" className={className} preserveAspectRatio="xMidYMid slice" aria-hidden>
        <rect width="600" height="450" fill="#F7F7F7" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <path key={i} d={`M-20 ${70 + i * 52} C 140 ${30 + i * 58}, 300 ${140 + i * 40}, 620 ${60 + i * 54}`} fill="none" stroke={i === 3 ? "#B5122B" : "#CFCFCF"} strokeWidth={i === 3 ? 1.6 : 1} />
        ))}
        {[
          [130, 120],
          [250, 210],
          [380, 160],
          [470, 290],
          [190, 320],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={i === 2 ? 7 : 4} fill={i === 2 ? "#B5122B" : "#252525"} />
            {i === 2 && <circle cx={x} cy={y} r="16" fill="none" stroke="#B5122B" strokeOpacity="0.35" />}
          </g>
        ))}
      </svg>
    );
  }
  // skyline
  const towers = [
    { x: 30, w: 70, h: 210 },
    { x: 108, w: 54, h: 290 },
    { x: 170, w: 86, h: 250 },
    { x: 264, w: 62, h: 360, accent: true },
    { x: 334, w: 92, h: 300 },
    { x: 434, w: 58, h: 230 },
    { x: 500, w: 74, h: 330 },
  ];
  return (
    <svg viewBox="0 0 600 450" className={className} preserveAspectRatio="xMidYMax slice" aria-hidden>
      <rect width="600" height="450" fill="#F7F7F7" />
      <circle cx="470" cy="96" r="38" fill="#FFFFFF" stroke="#E2E2E2" />
      {towers.map((t, i) => {
        const top = 430 - t.h;
        const cols = Math.max(2, Math.floor(t.w / 16));
        const rows = Math.floor(t.h / 22);
        return (
          <g key={i}>
            <rect x={t.x} y={top} width={t.w} height={t.h} fill="#FFFFFF" stroke="#252525" strokeWidth="1.1" />
            {Array.from({ length: rows - 1 }).map((_, r) =>
              Array.from({ length: cols }).map((__, c) => (
                <rect
                  key={`${r}-${c}`}
                  x={t.x + 6 + c * ((t.w - 12) / cols)}
                  y={top + 12 + r * 22}
                  width={(t.w - 12) / cols - 4}
                  height="10"
                  fill={t.accent && r === 3 ? "#B5122B" : "#EDEDED"}
                />
              )),
            )}
            {t.accent && <line x1={t.x + t.w / 2} y1={top - 34} x2={t.x + t.w / 2} y2={top} stroke="#252525" strokeWidth="1.1" />}
          </g>
        );
      })}
      <line x1="0" y1="430.5" x2="600" y2="430.5" stroke="#252525" strokeWidth="1.2" />
    </svg>
  );
}
