import { useSim } from "@/lib/simulator/store";
import { useEffect, useRef } from "react";

export function SimulationConsole() {
  const log = useSim((s) => s.log);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight });
  }, [log]);

  return (
    <div
      className="h-[180px] shrink-0 border-t-[2.5px] border-black"
      style={{ background: "#111", color: "#F7F3E8", fontFamily: "'Kalam', cursive" }}
    >
      <div className="flex items-center justify-between border-b border-white/20 px-4 py-1.5">
        <span className="text-[13px] font-bold tracking-wide">Console de requisições</span>
        <span className="text-[11px] opacity-60">{log.length} eventos</span>
      </div>
      <div ref={ref} className="h-[calc(180px-32px)] overflow-y-auto px-4 py-2 text-[13px]">
        {log.length === 0 && (
          <div className="opacity-60">Clique em ▶ Simular para ver o pacote viajar.</div>
        )}
        {log.map((l) => (
          <div key={l.id} className="flex gap-2 leading-relaxed">
            <span className="opacity-50">{new Date(l.ts).toLocaleTimeString()}</span>
            <span
              className="font-bold"
              style={{ color: l.level === "error" ? "#FCA5A5" : "#BBF7D0" }}
            >
              [{l.method}]
            </span>
            <span>
              {l.from} → {l.to}
            </span>
            <span
              className="ml-auto pl-3"
              style={{ color: l.level === "error" ? "#FCA5A5" : "#FDE68A" }}
            >
              {l.status} · {l.latency}ms {l.note ? `· ${l.note}` : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
