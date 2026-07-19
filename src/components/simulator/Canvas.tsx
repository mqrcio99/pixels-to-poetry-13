import { useCallback, useMemo, useRef } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlowProvider,
  useReactFlow,
  type ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";
import { useSim } from "@/lib/simulator/store";
import { getComponent } from "@/lib/simulator/catalog";
import { NodeCard } from "./NodeCard";
import { SketchEdge } from "./SketchEdge";

const nodeTypes = { sketch: NodeCard };
const edgeTypes = { sketch: SketchEdge };

function Inner() {
  const nodes = useSim((s) => s.nodes);
  const edges = useSim((s) => s.edges);
  const onNodesChange = useSim((s) => s.onNodesChange);
  const onEdgesChange = useSim((s) => s.onEdgesChange);
  const onConnect = useSim((s) => s.onConnect);
  const addNode = useSim((s) => s.addNode);
  const select = useSim((s) => s.select);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const rf = useReactFlow();

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("application/x-arch-node");
      if (!type) return;
      const def = getComponent(type);
      if (!def) return;
      const position = rf.screenToFlowPosition({ x: e.clientX, y: e.clientY });
      addNode(
        {
          type: def.type,
          label: def.label,
          icon: def.icon,
          color: def.color,
        },
        position,
      );
    },
    [rf, addNode],
  );

  const defaultEdgeOptions = useMemo(
    () => ({ type: "sketch", data: { method: "GET" as const } }),
    [],
  );

  return (
    <div
      ref={wrapperRef}
      onDrop={onDrop}
      onDragOver={onDragOver}
      className="relative h-full w-full"
      style={{ background: "#F7F3E8" }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, n) => select(n.id)}
        onEdgeClick={(_, e) => select(e.id)}
        onPaneClick={() => select(null)}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        proOptions={{ hideAttribution: true }}
        fitView={nodes.length > 0}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1.6}
          color="rgba(0,0,0,0.18)"
        />
        <Controls
          showInteractive={false}
          className="!rounded-xl !border-2 !border-black !bg-white !shadow-[3px_3px_0_#000]"
        />
      </ReactFlow>
    </div>
  );
}

export function Canvas() {
  return (
    <ReactFlowProvider>
      <Inner />
    </ReactFlowProvider>
  );
}

// re-export for typing
export type { ReactFlowInstance };
