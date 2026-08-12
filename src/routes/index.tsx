import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Canvas } from "@/components/simulator/Canvas";
import { Sidebar } from "@/components/simulator/Sidebar";
import { InspectorPanel } from "@/components/simulator/InspectorPanel";
import { SimulationControls } from "@/components/simulator/SimulationControls";
import { SimulationConsole } from "@/components/simulator/SimulationConsole";
import { RoughDefs } from "@/components/simulator/RoughDefs";
import { Postmortem } from "@/components/simulator/Postmortem";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/")({
  component: SimulatorPage,
  head: () => ({
    meta: [
      { title: "Simulador de Arquitetura — visualize sistemas em produção" },
      {
        name: "description",
        content:
          "Monte arquiteturas de software num quadro branco, simule carga e veja gargalos, filas e erros 503 acontecerem em tempo real.",
      },
      { property: "og:title", content: "Simulador de Arquitetura" },
      {
        property: "og:description",
        content:
          "Monte arquiteturas, simule carga e veja gargalos reais de produção acontecerem.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

type Panel = "canvas" | "components" | "details" | "console";

function SimulatorPage() {
  const isMobile = useIsMobile();
  const [panel, setPanel] = useState<Panel>("canvas");

  if (isMobile) {
    const tabs: { id: Panel; label: string; icon: string }[] = [
      { id: "canvas", label: "Quadro", icon: "🧩" },
      { id: "components", label: "Peças", icon: "📦" },
      { id: "details", label: "Detalhes", icon: "🔍" },
      { id: "console", label: "Console", icon: "🖥️" },
    ];
    return (
      <div
        className="flex h-[100dvh] w-screen flex-col overflow-hidden"
        style={{ background: "#F7F3E8" }}
      >
        <RoughDefs />
        <SimulationControls />

        <div className="relative min-h-0 flex-1">
          <div className={panel === "canvas" ? "h-full" : "hidden h-full"}>
            <Canvas />
          </div>
          {panel === "components" && (
            <div className="h-full overflow-y-auto">
              <Sidebar />
            </div>
          )}
          {panel === "details" && (
            <div className="h-full overflow-y-auto">
              <InspectorPanel />
            </div>
          )}
          {panel === "console" && (
            <div className="h-full">
              <SimulationConsole />
            </div>
          )}
        </div>

        <nav className="grid shrink-0 grid-cols-4 border-t-[2.5px] border-black bg-[#FAF6EA]">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setPanel(t.id)}
              className="flex flex-col items-center gap-0.5 py-1.5 text-[11px] font-bold"
              style={{
                fontFamily: "'Kalam', cursive",
                background: panel === t.id ? "#BBF7D0" : "transparent",
              }}
            >
              <span className="text-base leading-none">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <Postmortem />
      </div>
    );
  }

  return (
    <div
      className="flex h-screen w-screen flex-col overflow-hidden"
      style={{ background: "#F7F3E8" }}
    >
      <RoughDefs />
      <SimulationControls />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1">
            <Canvas />
          </div>
          <SimulationConsole />
        </div>
        <InspectorPanel />
      </div>
      <Postmortem />
    </div>
  );
}
