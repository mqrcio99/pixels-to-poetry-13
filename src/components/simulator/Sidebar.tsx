import { CATALOG, COLOR_MAP, type ComponentCategory } from "@/lib/simulator/catalog";

const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  client: "Cliente",
  network: "Rede / Infra",
  backend: "Backend",
  data: "Dados",
};

export function Sidebar() {
  const grouped = CATALOG.reduce<Record<string, typeof CATALOG>>((acc, c) => {
    (acc[c.category] ||= []).push(c);
    return acc;
  }, {});

  return (
    <aside
      className="flex h-full w-[240px] shrink-0 flex-col gap-4 overflow-y-auto border-r-[2.5px] border-black p-4"
      style={{
        background: "#FAF6EA",
        fontFamily: "'Kalam', cursive",
      }}
    >
      <div>
        <h2 className="text-2xl font-bold leading-tight text-black">Componentes</h2>
        <p className="mt-1 text-[13px] leading-snug text-black/70">
          Arraste para o quadro. Ligue os pontos pretos das laterais.
        </p>
      </div>

      {(Object.keys(grouped) as ComponentCategory[]).map((cat) => (
        <div key={cat}>
          <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-black/60">
            {CATEGORY_LABELS[cat]}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {grouped[cat].map((c) => {
              const col = COLOR_MAP[c.color];
              return (
                <button
                  key={c.type}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("application/x-arch-node", c.type);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-black p-2 text-center transition-transform hover:-translate-y-0.5 active:cursor-grabbing"
                  style={{
                    background: col.bg,
                    filter: "url(#rough)",
                    boxShadow: "2px 2px 0 #000",
                    cursor: "grab",
                  }}
                  title={c.label}
                >
                  <span className="text-2xl leading-none">{c.icon}</span>
                  <span className="text-[12px] font-bold leading-tight">{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="mt-2 rounded-xl border-2 border-dashed border-black/50 p-3 text-[12px] leading-snug text-black/70">
        <b>Dica:</b> comece com um <b>Navegador</b> ou <b>App Mobile</b>. A simulação segue as
        setas a partir do cliente.
      </div>
    </aside>
  );
}
