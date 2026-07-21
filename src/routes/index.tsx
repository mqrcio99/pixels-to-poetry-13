import { createFileRoute } from "@tanstack/react-router";
import { Canvas } from "@/components/simulator/Canvas";
import { Sidebar } from "@/components/simulator/Sidebar";
import { InspectorPanel } from "@/components/simulator/InspectorPanel";
import { SimulationControls } from "@/components/simulator/SimulationControls";
import { SimulationConsole } from "@/components/simulator/SimulationConsole";
import { RoughDefs } from "@/components/simulator/RoughDefs";
import { Postmortem } from "@/components/simulator/Postmortem";

export const Route = createFileRoute("/")({
  component: SimulatorPage,
});

function SimulatorPage() {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden" style={{ background: "#F7F3E8" }}>
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
