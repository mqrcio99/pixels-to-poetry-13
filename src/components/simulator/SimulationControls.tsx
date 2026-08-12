import { useSim, PRESETS } from "@/lib/simulator/store";
import { Play, Square, Download, Trash } from "lucide-react";
import { Tutorial } from "./Tutorial";

export function SimulationControls() {
  const status = useSim((s) => s.simStatus);
  const speed = useSim((s) => s.simSpeed);
  const load = useSim((s) => s.simLoad);
  const preset = useSim((s) => s.chaosPreset);
  const startSim = useSim((s) => s.startSim);
  const stopSim = useSim((s) => s.stopSim);
  const setSpeed = useSim((s) => s.setSpeed);
  const setLoad = useSim((s) => s.setLoad);
  const applyPreset = useSim((s) => s.applyPreset);
  const exportJSON = useSim((s) => s.exportJSON);
  const clearLog = useSim((s) => s.clearLog);

  const btn =
    "flex items-center gap-1 rounded-full border-2 border-black bg-white px-2.5 py-1 text-[12px] font-bold shadow-[2px_2px_0_#000] transition-transform hover:-translate-y-0.5 disabled:opacity-40 md:gap-1.5 md:px-3 md:py-1.5 md:text-[13px]";

  const download = () => {
    const blob = new Blob([exportJSON()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "arquitetura.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div
      className="flex flex-wrap items-center gap-1.5 border-b-[2.5px] border-black px-2 py-2 md:gap-2 md:px-4 md:py-3"
      style={{ background: "#F7F3E8", fontFamily: "'Kalam', cursive" }}
    >
      <div className="mr-1 text-[15px] font-bold md:mr-2 md:text-xl">Simulador de Arquitetura</div>
      {status === "idle" || status === "done" ? (
        <button className={btn} onClick={startSim} style={{ background: "#BBF7D0" }}>
          <Play size={14} /> Simular
        </button>
      ) : (
        <button className={btn} onClick={stopSim} style={{ background: "#FCA5A5" }}>
          <Square size={14} /> Parar
        </button>
      )}

      <div className="mx-1 hidden h-6 w-px bg-black/30 md:block" />

      <label className="flex items-center gap-1.5 rounded-full border-2 border-black bg-white px-2 py-0.5 text-[12px] shadow-[2px_2px_0_#000] md:gap-2 md:px-3 md:py-1 md:text-[13px]">
        <span className="font-bold">🎭</span>
        <select
          value={preset}
          onChange={(e) => applyPreset(e.target.value)}
          className="max-w-[120px] rounded-md border border-black/30 bg-white px-1 py-0.5 text-[12px] font-bold md:max-w-none"
          title={PRESETS[preset]?.description}
          disabled={status === "running"}
        >
          {Object.entries(PRESETS).map(([k, p]) => (
            <option key={k} value={k}>
              {p.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-1.5 rounded-full border-2 border-black bg-white px-2 py-0.5 text-[12px] shadow-[2px_2px_0_#000] md:gap-2 md:px-3 md:py-1 md:text-[13px]">
        <span className="font-bold">Carga:</span>
        <input
          type="range"
          min={1}
          max={100}
          value={load}
          onChange={(e) => setLoad(Number(e.target.value))}
          className="w-16 accent-black md:w-28"
          disabled={status === "running"}
        />
        <span className="w-6 text-right font-bold tabular-nums md:w-8">{load}</span>
      </label>

      <label className="flex items-center gap-1 text-[12px] md:text-[13px]">
        <span className="hidden md:inline">Velocidade:</span>
        <span className="md:hidden">⏱</span>
        <select
          className="rounded-full border-2 border-black bg-white px-2 py-0.5 text-[12px] font-bold shadow-[2px_2px_0_#000]"
          value={speed}
          onChange={(e) => setSpeed(e.target.value as never)}
        >
          <option value="slow">Lenta</option>
          <option value="normal">Normal</option>
          <option value="fast">Rápida</option>
        </select>
      </label>

      <div className="flex items-center gap-1.5 md:ml-auto md:gap-2">
        <Tutorial />
        <button className={btn} onClick={clearLog} title="Limpar log">
          <Trash size={14} /> <span className="hidden md:inline">Limpar log</span>
        </button>
        <button className={btn} onClick={download} title="Exportar JSON">
          <Download size={14} /> <span className="hidden md:inline">Exportar JSON</span>
        </button>
      </div>
    </div>
  );
}
