import { useSim } from "@/lib/simulator/store";
import { Play, Square, StepForward, Download, Trash } from "lucide-react";
import { Tutorial } from "./Tutorial";

export function SimulationControls() {
  const status = useSim((s) => s.simStatus);
  const speed = useSim((s) => s.simSpeed);
  const stepMode = useSim((s) => s.stepMode);
  const errorMode = useSim((s) => s.errorMode);
  const startSim = useSim((s) => s.startSim);
  const stopSim = useSim((s) => s.stopSim);
  const advance = useSim((s) => s.advanceStep);
  const setSpeed = useSim((s) => s.setSpeed);
  const setStepMode = useSim((s) => s.setStepMode);
  const setErrorMode = useSim((s) => s.setErrorMode);
  const exportJSON = useSim((s) => s.exportJSON);
  const clearLog = useSim((s) => s.clearLog);

  const btn =
    "flex items-center gap-1.5 rounded-full border-2 border-black bg-white px-3 py-1.5 text-[13px] font-bold shadow-[2px_2px_0_#000] hover:-translate-y-0.5 transition-transform disabled:opacity-40";

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
      className="flex flex-wrap items-center gap-2 border-b-[2.5px] border-black px-4 py-3"
      style={{ background: "#F7F3E8", fontFamily: "'Kalam', cursive" }}
    >
      <div className="mr-2 text-xl font-bold">
        Simulador de Arquitetura
      </div>
      {status === "idle" || status === "done" ? (
        <button className={btn} onClick={startSim} style={{ background: "#BBF7D0" }}>
          <Play size={14} /> Simular
        </button>
      ) : (
        <button className={btn} onClick={stopSim} style={{ background: "#FCA5A5" }}>
          <Square size={14} /> Parar
        </button>
      )}
      <button className={btn} onClick={advance} disabled={status !== "paused"}>
        <StepForward size={14} /> Próximo
      </button>

      <div className="mx-2 h-6 w-px bg-black/30" />

      <label className="flex items-center gap-1 text-[13px]">
        Velocidade:
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

      <label className="flex items-center gap-1 text-[13px]">
        <input
          type="checkbox"
          checked={stepMode}
          onChange={(e) => setStepMode(e.target.checked)}
        />
        Passo a passo
      </label>

      <label className="flex items-center gap-1 text-[13px]">
        Erro:
        <select
          className="rounded-full border-2 border-black bg-white px-2 py-0.5 text-[12px] font-bold shadow-[2px_2px_0_#000]"
          value={errorMode}
          onChange={(e) => setErrorMode(e.target.value as never)}
        >
          <option value="none">Nenhum</option>
          <option value="500">HTTP 500</option>
          <option value="timeout">Timeout</option>
        </select>
      </label>

      <div className="ml-auto flex items-center gap-2">
        <Tutorial />
        <button className={btn} onClick={clearLog}>
          <Trash size={14} /> Limpar log
        </button>
        <button className={btn} onClick={download}>
          <Download size={14} /> Exportar JSON
        </button>
      </div>
    </div>
  );
}
