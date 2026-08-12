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
      className="flex h-full w-full shrink-0 flex-col gap-3 overflow-y-auto border-black p-3 md:w-[240px] md:gap-4 md:border-r-[2.5px] md:p-4"
      style={{
        background: "#FAF6EA",
        fontFamily: "'Kalam', cursive",
      }}
    >
      <div>
        <h2 className="text-lg font-bold leading-tight text-black md:text-2xl">Componentes</h2>
        <p className="mt-0.5 text-[12px] leading-snug text-black/70 md:mt-1 md:text-[13px]">
          Arraste para o quadro. Ligue os pontos pretos das laterais.
        </p>
      </div>

      {(Object.keys(grouped) as ComponentCategory[]).map((cat) => (
        <div key={cat}>
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-black/60 md:mb-2 md:text-[11px]">
            {CATEGORY_LABELS[cat]}
          </div>
          <div className="grid grid-cols-3 gap-1.5 md:grid-cols-2 md:gap-2">
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
                  className="flex flex-col items-center justify-center gap-0.5 rounded-xl border-2 border-black p-1.5 text-center transition-transform hover:-translate-y-0.5 active:cursor-grabbing md:gap-1 md:p-2"
                  style={{
                    background: col.bg,
                    boxShadow: "2px 2px 0 #000",
                    cursor: "grab",
                  }}
                  title={c.label}
                >
                  <span className="text-xl leading-none md:text-2xl">{c.icon}</span>
                  <span className="text-[10px] font-bold leading-tight md:text-[12px]">{c.label}</span>
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
