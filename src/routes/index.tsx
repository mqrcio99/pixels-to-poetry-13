import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Search } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WebFrame — Um Playground de Wireframes" },
      {
        name: "description",
        content:
          "WebFrame é um sistema de layout ousado e de alto contraste para prototipar páginas web rapidamente.",
      },
      { property: "og:title", content: "WebFrame" },
      { property: "og:description", content: "Um playground de wireframes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;700;900&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  component: Index,
});

const ORANGE = "#F26A1F";
const INK = "#111111";
const PAPER = "#F5F2EC";

function Index() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: PAPER,
        color: INK,
        fontFamily: "'Archivo', system-ui, sans-serif",
      }}
    >
      <div className="mx-auto max-w-[1200px] px-5 py-6 md:px-10 md:py-10">
        {/* Outer frame */}
        <div
          className="p-4 md:p-8"
          style={{ border: `2px solid ${INK}`, background: PAPER }}
        >
          {/* Section 1: WebFrame heading */}
          <section className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-6 pb-6 md:grid-cols-[minmax(0,1fr)_260px]">
            <div className="min-w-0">
              <h1 className="text-4xl leading-[0.95] font-black tracking-tight md:text-6xl">
                WebFrame
              </h1>
              <p className="mt-4 max-w-[52ch] text-[13px] leading-[1.55] opacity-80 md:text-[14px]">
                <b>WebFrame</b> é um kit de layout modular para quem gosta de
                pensar em caixas. Rascunhe, organize e publique uma página
                numa tarde. Cada bloco é honesto por ser um bloco — nada
                finge ser aquilo que não é.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {["Início", "Categorias", "Blog", "Equipa"].map((label, i) => (
                  <button
                    key={label}
                    className="rounded-full px-4 py-1.5 text-[12px] font-medium transition-transform hover:-translate-y-[1px]"
                    style={{
                      background: INK,
                      color: PAPER,
                      border: `1px solid ${INK}`,
                      boxShadow: i === 0 ? `3px 3px 0 ${ORANGE}` : "none",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden text-right md:block">
              <p
                className="text-[11px] uppercase tracking-[0.25em]"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                Fonte
              </p>
              <p className="mt-2 text-[13px] opacity-70">v.04 · 2026</p>
              <div
                className="mt-4 ml-auto h-16 w-16"
                style={{
                  border: `2px solid ${INK}`,
                  background: `repeating-linear-gradient(45deg, ${INK} 0 2px, transparent 2px 6px)`,
                }}
              />
            </div>
          </section>

          {/* Divider */}
          <div style={{ borderTop: `2px solid ${INK}` }} className="mb-6" />

          {/* Section 2: Search + Logo + Pills */}
          <section
            className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 p-3"
            style={{ border: `2px solid ${INK}`, background: "#fff" }}
          >
            <label
              className="flex min-w-0 items-center gap-2 px-3 py-2"
              style={{ border: `1.5px solid ${INK}` }}
            >
              <MapPin size={16} strokeWidth={2.5} className="shrink-0" />
              <input
                type="text"
                placeholder="Localização"
                className="w-full bg-transparent text-[13px] outline-none placeholder:text-black/50"
              />
              <Search size={16} strokeWidth={2.5} className="shrink-0 opacity-70" />
            </label>

            <div
              className="grid h-11 w-24 place-items-center text-[13px] font-black tracking-widest md:w-32"
              style={{ border: `2px solid ${INK}`, background: PAPER }}
            >
              LOGO
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              {["Produtos"].map((label) => (
                <span
                  key={label}
                  className="rounded-full px-3 py-1 text-[11px] font-semibold"
                  style={{ background: ORANGE, color: "#fff" }}
                >
                  {label}
                </span>
              ))}
              <span
                className="rounded-full px-3 py-1 text-[11px] font-semibold"
                style={{ border: `1.5px solid ${INK}` }}
              >
                Promoções
              </span>
            </div>
          </section>

          {/* Sub-nav under search */}
          <nav
            className="mt-4 flex flex-wrap items-center gap-5 pb-4 text-[12px] font-medium uppercase tracking-[0.14em]"
            style={{ borderBottom: `1.5px solid ${INK}` }}
          >
            {["Início", "Categorias", "Blog", "Equipa", "Vista 360"].map(
              (label, i) => (
                <a
                  key={label}
                  href="#"
                  className="hover:opacity-60"
                  style={{
                    color: i === 4 ? ORANGE : INK,
                    borderBottom: i === 0 ? `2px solid ${ORANGE}` : "none",
                    paddingBottom: 4,
                  }}
                >
                  {label}
                </a>
              ),
            )}
          </nav>

          {/* Section 3: Orange content band */}
          <section
            className="mt-6 grid grid-cols-1 gap-6 p-6 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:p-10"
            style={{ background: ORANGE, color: "#fff" }}
          >
            <div className="min-w-0">
              <p
                className="text-[11px] uppercase tracking-[0.25em] opacity-90"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                Manifesto — 01
              </p>
              <h2 className="mt-3 text-2xl font-black leading-[1.1] md:text-4xl">
                Uma tela honesta,
                <br />
                sem adornos desnecessários.
              </h2>
              <p className="mt-5 max-w-[58ch] text-[13.5px] leading-[1.65] opacity-95 md:text-[15px]">
                Desenhamos com margens visíveis, tipografias sérias e uma
                única nota de cor. A grelha manda, o conteúdo responde. Cada
                bloco tem uma razão para existir e nenhum pede desculpa por
                ser rectangular.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  className="px-5 py-2 text-[12px] font-bold uppercase tracking-widest"
                  style={{ background: INK, color: "#fff" }}
                >
                  Começar →
                </button>
                <button
                  className="px-5 py-2 text-[12px] font-bold uppercase tracking-widest"
                  style={{ background: "transparent", color: "#fff", border: "1.5px solid #fff" }}
                >
                  Ver blocos
                </button>
              </div>
            </div>

            <aside
              className="p-5"
              style={{ border: "1.5px dashed rgba(255,255,255,0.7)" }}
            >
              <p
                className="text-[11px] uppercase tracking-[0.25em]"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                Nota lateral
              </p>
              <ul className="mt-4 space-y-3 text-[13px] leading-relaxed">
                <li className="flex gap-3">
                  <span className="font-mono opacity-80">01</span>
                  <span>Bordes visibles, jerarquía clara.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-mono opacity-80">02</span>
                  <span>Un solo acento: naranja quemado.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-mono opacity-80">03</span>
                  <span>Textos que respiran, botones que empujan.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-mono opacity-80">04</span>
                  <span>Cero decoración sin propósito.</span>
                </li>
              </ul>
            </aside>
          </section>

          {/* Footer */}
          <footer
            className="mt-6 grid grid-cols-2 gap-6 p-6 md:grid-cols-4 md:gap-8 md:p-10"
            style={{ background: ORANGE, color: "#fff" }}
          >
            {[
              {
                title: "Producto",
                links: ["Bloques", "Plantillas", "Cambios", "Precios"],
              },
              {
                title: "Estudio",
                links: ["Nosotros", "Manifiesto", "Prensa", "Contacto"],
              },
              {
                title: "Recursos",
                links: ["Docs", "Guías", "Kit Figma", "Soporte"],
              },
              {
                title: "Legal",
                links: ["Términos", "Privacidad", "Cookies", "Licencias"],
              },
            ].map((col) => (
              <div key={col.title} className="min-w-0">
                <p
                  className="text-[11px] font-bold uppercase tracking-[0.22em]"
                  style={{ borderBottom: "1.5px solid #fff", paddingBottom: 6 }}
                >
                  {col.title}
                </p>
                <ul className="mt-4 space-y-2 text-[13px]">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="hover:underline">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div
              className="col-span-2 mt-2 flex flex-wrap items-center justify-between gap-3 pt-4 text-[11px] uppercase tracking-[0.2em] md:col-span-4"
              style={{ borderTop: "1.5px solid #fff" }}
            >
              <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                © 2026 WebFrame Studio
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                Hecho con cuadrículas
              </span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
