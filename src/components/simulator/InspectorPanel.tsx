import { useSim, type NodeFailures } from "@/lib/simulator/store";
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
  const setNodeFailures = useSim((s) => s.setNodeFailures);

  const node = nodes.find((n) => n.id === selectedId);
  const edge = edges.find((e) => e.id === selectedId);
  const stat = node ? nodeStats[node.id] : undefined;
  const dist = node ? lbDistribution[node.id] : undefined;

  const patch = (p: NodeFailures) => node && setNodeFailures(node.id, p);
  const f = node?.data.failures ?? {};

  return (
    <aside
      className="flex h-full w-full shrink-0 flex-col gap-3 overflow-y-auto border-black p-3 md:w-[300px] md:gap-4 md:border-l-[2.5px] md:p-4"
      style={{ background: "#FAF6EA", fontFamily: "'Kalam', cursive" }}
    >
      <h2 className="text-2xl font-bold leading-tight">Detalhes</h2>

      {!node && !edge && (
        <div className="rounded-xl border-2 border-dashed border-black/40 p-4 text-[13px] leading-snug text-black/70">
          Clique num componente ou numa seta para ver a explicação didática e configurar falhas.
        </div>
      )}

      {node && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{node.data.icon}</div>
            <div>
              <div className="text-[11px] uppercase tracking-widest text-black/60">Componente</div>
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
            <div className="rounded-xl border-2 border-black p-3 text-[13px] leading-relaxed" style={{ background: "#fff", filter: "url(#rough)" }}>
              <div className="mb-1 text-[11px] font-bold uppercase tracking-widest text-black/60">Carga</div>
              <div>Capacidade atual: <b>{stat.capacity}</b> / base <b>{stat.baseCapacity}</b></div>
              <div>Ativas: <b>{stat.active}</b> · Pico: <b>{stat.peakActive}</b></div>
              <div>Enfileiradas (total): <b>{stat.queued}</b></div>
              <div>Sucesso: <b className="text-green-700">{stat.succeeded}</b> · Falhas: <b className="text-red-700">{stat.failed}</b></div>
              <div>Circuit breaker: <b>{stat.breaker}</b> · Trips: <b>{stat.breakerTrips}</b></div>
            </div>
          )}

          {node.data.type === "loadbalancer" && dist && (
            <div className="rounded-xl border-2 border-black p-3 text-[13px] leading-relaxed" style={{ background: "#fff", filter: "url(#rough)" }}>
              <div className="mb-1 text-[11px] font-bold uppercase tracking-widest text-black/60">Distribuição</div>
              <div><b>{dist.serverIds.length}</b> servidor(es) na saída.</div>
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
            </div>
          )}

          {/* ===== Configuração de falhas por tipo ===== */}
          {["gateway", "cache", "database", "server", "microservice"].includes(node.data.type) && (
            <div className="rounded-xl border-2 border-black p-3" style={{ background: "#FFF7DA", filter: "url(#rough)" }}>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-black/60">
                ⚠️ Cenários de falha
              </div>

              {node.data.type === "gateway" && (
                <>
                  <Toggle label="Rate limit ativo (429)" checked={!!f.rateLimitEnabled} onChange={(v) => patch({ rateLimitEnabled: v })} />
                  <Slider label="Limite (req/s)" min={5} max={100} value={f.rateLimitRps ?? 30} onChange={(v) => patch({ rateLimitRps: v })} disabled={!f.rateLimitEnabled} />
                </>
              )}

              {node.data.type === "cache" && (
                <>
                  <Slider label="Taxa de acerto" min={0} max={100} value={Math.round((f.hitRate ?? 0.8) * 100)} onChange={(v) => patch({ hitRate: v / 100 })} suffix="%" />
                  <Toggle label="Cache frio (cold start)" checked={!!f.coldStart} onChange={(v) => patch({ coldStart: v })} />
                  <Help>Miss força chamada ao banco. Cold start = 30 primeiras req vão direto ao DB.</Help>
                </>
              )}

              {node.data.type === "database" && (
                <>
                  <Slider label="Latência base" min={10} max={400} value={f.dbBaseLatency ?? 40} onChange={(v) => patch({ dbBaseLatency: v })} suffix="ms" />
                  <Slider label="Capacidade (conexões)" min={5} max={50} value={f.dbCapacity ?? 20} onChange={(v) => patch({ dbCapacity: v })} />
                  <Slider label="Taxa de erro" min={0} max={100} value={Math.round((f.dbFailRate ?? 0) * 100)} onChange={(v) => patch({ dbFailRate: v / 100 })} suffix="%" />
                  <Toggle label="Fica lento sob carga" checked={!!f.dbSlowUnderLoad} onChange={(v) => patch({ dbSlowUnderLoad: v })} />
                </>
              )}

              {(node.data.type === "server" || node.data.type === "microservice") && (
                <>
                  <Toggle label="Vazamento de memória" checked={!!f.memoryLeak} onChange={(v) => patch({ memoryLeak: v })} />
                  <Toggle label="Circuit breaker" checked={!!f.circuitBreaker} onChange={(v) => patch({ circuitBreaker: v })} />
                  <Help>Leak: capacidade cai com o tempo. Breaker: abre após 5 falhas do DB em 2s.</Help>
                </>
              )}
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
          <div className="rounded-xl border-2 border-black p-3 text-[13.5px] leading-relaxed" style={{ background: "#fff", filter: "url(#rough)" }}>
            Esta seta representa uma chamada <b>{edge.data?.method}</b>. Mude o método clicando na pílula sobre a seta.
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

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="mt-1 flex cursor-pointer items-center justify-between gap-2 text-[13px]">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-black" />
    </label>
  );
}

function Slider({
  label, min, max, value, onChange, suffix, disabled,
}: { label: string; min: number; max: number; value: number; onChange: (v: number) => void; suffix?: string; disabled?: boolean }) {
  return (
    <div className={`mt-2 text-[12.5px] ${disabled ? "opacity-40" : ""}`}>
      <div className="flex justify-between">
        <span>{label}</span>
        <b>{value}{suffix}</b>
      </div>
      <input type="range" min={min} max={max} value={value} disabled={disabled} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-black" />
    </div>
  );
}

function Help({ children }: { children: React.ReactNode }) {
  return <div className="mt-2 text-[11.5px] italic leading-snug text-black/60">{children}</div>;
}
