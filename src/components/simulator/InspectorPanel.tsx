import { useSim } from "@/lib/simulator/store";
import { getComponent } from "@/lib/simulator/catalog";
import { Trash2 } from "lucide-react";

export function InspectorPanel() {
  const selectedId = useSim((s) => s.selectedId);
  const nodes = useSim((s) => s.nodes);
  const edges = useSim((s) => s.edges);
  const deleteNode = useSim((s) => s.deleteNode);
  const deleteEdge = useSim((s) => s.deleteEdge);
  const nodeStats = useSim((s) => s.nodeStats);
  const lbDistribution = useSim((s) => s.lbDistribution);

  const node = nodes.find((n) => n.id === selectedId);
  const edge = edges.find((e) => e.id === selectedId);
  const stat = node ? nodeStats[node.id] : undefined;
  const dist = node ? lbDistribution[node.id] : undefined;

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

          {(node.data.type === "server" || node.data.type === "microservice") && stat && (
            <div
              className="rounded-xl border-2 border-black p-3 text-[13px] leading-relaxed"
              style={{ background: "#fff", filter: "url(#rough)" }}
            >
              <div className="mb-1 text-[11px] font-bold uppercase tracking-widest text-black/60">
                Carga
              </div>
              <div>Capacidade: <b>{stat.capacity}</b> req simultâneas</div>
              <div>Ativas agora: <b>{stat.active}</b></div>
              <div>Pico ativo: <b>{stat.peakActive}</b></div>
              <div>Enfileiradas (total): <b>{stat.queued}</b></div>
              <div>Sucesso: <b className="text-green-700">{stat.succeeded}</b></div>
              <div>Falhas 503: <b className="text-red-700">{stat.failed}</b></div>
            </div>
          )}

          {node.data.type === "loadbalancer" && dist && (
            <div
              className="rounded-xl border-2 border-black p-3 text-[13px] leading-relaxed"
              style={{ background: "#fff", filter: "url(#rough)" }}
            >
              <div className="mb-1 text-[11px] font-bold uppercase tracking-widest text-black/60">
                Distribuição
              </div>
              <div>
                <b>{dist.serverIds.length}</b> servidor(es) conectado(s) na saída.
              </div>
              <div className="mt-2 space-y-1">
                {dist.serverIds.map((sid) => {
                  const s = nodes.find((n) => n.id === sid);
                  return (
                    <div key={sid} className="flex items-center justify-between">
                      <span>{s?.data.icon} {s?.data.label}</span>
                      <b>{dist.counts[sid] ?? 0} req</b>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 text-[12px] text-black/60">
                Distribuído em round-robin.
              </div>
            </div>
          )}
          {node.data.type === "loadbalancer" && !dist && (
            <div className="rounded-xl border-2 border-dashed border-black/40 p-3 text-[12.5px] text-black/70">
              Rode uma simulação para ver como a carga foi dividida entre os servidores conectados.
            </div>
          )}

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
