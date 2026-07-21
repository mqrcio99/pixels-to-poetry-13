import { useSim } from "@/lib/simulator/store";

export function LatencyChart() {
  const samples = useSim((s) => s.latencySamples);
  const w = 220;
  const h = 60;
  if (samples.length === 0) {
    return (
      <div className="flex h-[60px] w-[220px] items-center justify-center rounded border border-white/20 text-[10px] opacity-60">
        latência em tempo real
      </div>
    );
  }
  const max = Math.max(50, ...samples.map((s) => s.latency));
  const step = w / Math.max(1, samples.length - 1);
  const pts = samples
    .map((s, i) => `${(i * step).toFixed(1)},${(h - (s.latency / max) * h).toFixed(1)}`)
    .join(" ");
  // p95
  const sorted = [...samples].map((s) => s.latency).sort((a, b) => a - b);
  const p95 = sorted[Math.min(sorted.length - 1, Math.floor(0.95 * sorted.length))];
  const p50 = sorted[Math.min(sorted.length - 1, Math.floor(0.5 * sorted.length))];
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-2 text-[10px] opacity-70">
        <span>latência</span>
        <span className="text-[#BBF7D0]">p50 {Math.round(p50)}ms</span>
        <span className="text-[#FDE68A]">p95 {Math.round(p95)}ms</span>
        <span className="text-[#93C5FD]">max {Math.round(max)}ms</span>
      </div>
      <svg width={w} height={h} className="rounded border border-white/20 bg-black/40">
        <line x1={0} x2={w} y1={h - (p95 / max) * h} y2={h - (p95 / max) * h} stroke="#FDE68A" strokeDasharray="3 3" strokeWidth={1} opacity={0.6} />
        <polyline points={pts} fill="none" stroke="#F97316" strokeWidth={1.5} />
        {samples.map((s, i) => (
          <circle
            key={i}
            cx={i * step}
            cy={h - (s.latency / max) * h}
            r={1.5}
            fill={s.ok ? "#BBF7D0" : "#FCA5A5"}
          />
        ))}
      </svg>
    </div>
  );
}
