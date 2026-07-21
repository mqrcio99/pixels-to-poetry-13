import { useSim } from "@/lib/simulator/store";
import { X } from "lucide-react";

export function Postmortem() {
  const pm = useSim((s) => s.postmortem);
  const dismiss = useSim((s) => s.dismissPostmortem);
  if (!pm) return null;

  const okPct = pm.total > 0 ? Math.round((pm.ok / pm.total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={dismiss}>
      <div
        className="max-h-[85vh] w-[560px] max-w-full overflow-y-auto rounded-2xl border-[2.5px] border-black bg-white p-6 shadow-[6px_6px_0_#000]"
        style={{ fontFamily: "'Kalam', cursive" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-black/60">
              Relatório pós-morte
            </div>
            <h2 className="text-3xl font-bold leading-tight">
              {pm.failed === 0 ? "🎉 Sistema aguentou!" : "🔥 Gargalo detectado"}
            </h2>
          </div>
          <button onClick={dismiss} className="rounded-full border-2 border-black bg-white p-1 shadow-[2px_2px_0_#000]">
            <X size={16} />
          </button>
        </div>

        <div className="mb-4 grid grid-cols-4 gap-2 text-center">
          <Stat label="Sucesso" value={`${okPct}%`} color="#166534" />
          <Stat label="p50" value={`${pm.p50}ms`} />
          <Stat label="p95" value={`${pm.p95}ms`} />
          <Stat label="p99" value={`${pm.p99}ms`} />
        </div>

        <div className="mb-4 rounded-xl border-2 border-black bg-[#FEF3C7] p-3 text-[14px] leading-relaxed" style={{ filter: "url(#rough)" }}>
          <b>Diagnóstico:</b> {pm.bottleneck}
        </div>

        {pm.buckets.length > 0 && (
          <div className="mb-4">
            <div className="mb-1 text-[11px] font-bold uppercase tracking-widest text-black/60">
              Distribuição das falhas
            </div>
            <div className="space-y-1.5">
              {pm.buckets.map((b) => {
                const pct = Math.round((b.count / pm.total) * 100);
                return (
                  <div key={b.category}>
                    <div className="mb-0.5 flex justify-between text-[13px]">
                      <span className="font-bold">{b.label}</span>
                      <span className="tabular-nums">{b.count} req · {pct}%</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full border border-black bg-white">
                      <div className="h-full bg-[#F97316]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {pm.suggestions.length > 0 && (
          <div>
            <div className="mb-1 text-[11px] font-bold uppercase tracking-widest text-black/60">
              O que fazer 💡
            </div>
            <ul className="list-disc space-y-1 pl-5 text-[13.5px]">
              {pm.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, color = "#111" }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl border-2 border-black bg-white p-2" style={{ filter: "url(#rough)" }}>
      <div className="text-[10px] font-bold uppercase tracking-widest text-black/60">{label}</div>
      <div className="text-xl font-bold" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
