import { useSim } from "@/lib/simulator/store";
import { getComponent } from "@/lib/simulator/catalog";
import { Trash2 } from "lucide-react";

export function InspectorPanel() {
  const selectedId = useSim((s) => s.selectedId);
  const nodes = useSim((s) => s.nodes);
  const edges = useSim((s) => s.edges);
  const deleteNode = useSim((s) => s.deleteNode);
  const deleteEdge = useSim((s) => s.deleteEdge);

  const node = nodes.find((n) => n.id === selectedId);
  const edge = edges.find((e) => e.id === selectedId);

  return (
    <aside
      className="flex h-full w-[280px] shrink-0 flex-col gap-4 overflow-y-auto border-l-[2.5px] border-black p-4"
      style={{ background: "#FAF6EA", fontFamily: "'Kalam', cursive" }}
    >
      <h2 className="text-2xl font-bold leading-tight">Detalhes</h2>

      {!node && !edge && (
        <div className="rounded-xl border-2 border-dashed border-black/40 p-4 text-[13px] leading-snug text-black/70">
          Clique num componente ou numa seta para ver a explicação didática.
        </div>
      )}

      {node && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{node.data.icon}</div>
            <div>
              <div className="text-[11px] uppercase tracking-widest text-black/60">
                Componente
              </div>
              <div className="text-lg font-bold leading-tight">{node.data.label}</div>
            </div>
          </div>
          <div
            className="rounded-xl border-2 border-black p-3 text-[13.5px] leading-relaxed"
            style={{ background: "#fff", filter: "url(#rough)" }}
          >
            {getComponent(node.data.type)?.explanation}
          </div>
          <button
            onClick={() => deleteNode(node.id)}
            className="flex items-center gap-2 rounded-full border-2 border-black bg-white px-3 py-1.5 text-[13px] font-bold shadow-[2px_2px_0_#000] hover:bg-red-100"
          >
            <Trash2 size={14} /> Remover
          </button>
        </div>
      )}

      {edge && (
        <div className="space-y-3">
          <div className="text-[11px] uppercase tracking-widest text-black/60">Conexão</div>
          <div className="text-lg font-bold">
            {nodes.find((n) => n.id === edge.source)?.data.label} →{" "}
            {nodes.find((n) => n.id === edge.target)?.data.label}
          </div>
          <div
            className="rounded-xl border-2 border-black p-3 text-[13.5px] leading-relaxed"
            style={{ background: "#fff", filter: "url(#rough)" }}
          >
            Esta seta representa uma chamada <b>{edge.data?.method}</b>. Você pode mudar o
            método clicando na pílula sobre a seta.
          </div>
          <button
            onClick={() => deleteEdge(edge.id)}
            className="flex items-center gap-2 rounded-full border-2 border-black bg-white px-3 py-1.5 text-[13px] font-bold shadow-[2px_2px_0_#000] hover:bg-red-100"
          >
            <Trash2 size={14} /> Remover
          </button>
        </div>
      )}
    </aside>
  );
}
