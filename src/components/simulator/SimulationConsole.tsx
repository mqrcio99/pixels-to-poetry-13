import { useSim } from "@/lib/simulator/store";
import { useEffect, useRef } from "react";
import { LatencyChart } from "./LatencyChart";

export function SimulationConsole() {
  const log = useSim((s) => s.log);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight });
  }, [log]);

  const colorFor = (level: string) => {
    switch (level) {
      case "error":
        return "#FCA5A5";
      case "warn":
        return "#FDE68A";
      case "summary":
        return "#93C5FD";
      default:
        return "#BBF7D0";
    }
  };

  return (
    <div
      className="flex h-full shrink-0 flex-col border-t-[2.5px] border-black md:h-[220px] md:flex-row"
      style={{ background: "#111", color: "#F7F3E8", fontFamily: "'Kalam', cursive" }}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-white/20 px-4 py-1.5">
          <span className="text-[13px] font-bold tracking-wide">Console de requisições</span>
          <span className="text-[11px] opacity-60">{log.length} eventos</span>
        </div>
        <div ref={ref} className="flex-1 overflow-y-auto px-4 py-2 text-[12.5px]">
          {log.length === 0 && (
            <div className="opacity-60">
              Escolha um cenário e clique em ▶ Simular. Cada requisição mostra código HTTP, latência e causa da falha.
            </div>
          )}
          {log.map((l) => {
            const color = colorFor(l.level);
            return (
              <div
                key={l.id}
                className="flex gap-2 leading-relaxed"
                style={l.level === "summary" ? { marginTop: 4, fontWeight: 700 } : undefined}
              >
                <span className="opacity-50">{new Date(l.ts).toLocaleTimeString()}</span>
                <span className="font-bold" style={{ color }}>
                  [{l.method}]
                </span>
                <span>
                  {l.from} → {l.to}
                </span>
                <span className="ml-auto pl-3" style={{ color }}>
                  {l.status} · {l.latency}ms {l.note ? `· ${l.note}` : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex w-[240px] shrink-0 flex-col gap-2 border-l border-white/20 p-3">
        <LatencyChart />
      </div>
    </div>
  );
}
