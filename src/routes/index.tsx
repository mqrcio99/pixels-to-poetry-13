import { createFileRoute } from "@tanstack/react-router";
import plants from "@/assets/plants.jpg";
import bubbles from "@/assets/bubbles.jpg";
import tilePlane from "@/assets/tile-plane.jpg";
import tileCube from "@/assets/tile-cube.jpg";
import tileBeetle from "@/assets/tile-beetle.jpg";
import tileB from "@/assets/tile-b.jpg";
import tileC from "@/assets/tile-c.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Studio Bloom — A Field Guide to Small, Quiet Things" },
      {
        name: "description",
        content:
          "An editorial index of gradients, plants and small objects — collected, arranged, and considered.",
      },
      { property: "og:title", content: "Studio Bloom — A Field Guide" },
      {
        property: "og:description",
        content: "An editorial index of gradients, plants and small objects.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Work+Sans:wght@300;400;500&display=swap",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: "var(--paper)",
        color: "var(--ink)",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* Nav */}
      <header className="mx-auto flex max-w-[1240px] items-center justify-between px-8 pt-8 text-[13px] tracking-wide uppercase">
        <div style={{ fontFamily: "var(--font-serif)" }} className="text-2xl italic normal-case tracking-tight">
          Bloom<span style={{ color: "var(--accent-coral)" }}>.</span>
        </div>
        <nav className="hidden gap-10 md:flex">
          <a href="#index" className="hover:opacity-60">Index</a>
          <a href="#field" className="hover:opacity-60">Field notes</a>
          <a href="#objects" className="hover:opacity-60">Objects</a>
          <a href="#colophon" className="hover:opacity-60">Colophon</a>
        </nav>
        <span className="hidden md:block opacity-60">Vol. 04 · 2026</span>
      </header>

      {/* Hero — editorial three-column */}
      <section className="mx-auto max-w-[1240px] px-8 pt-20 pb-16">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-3">
            <p className="text-[11px] uppercase tracking-[0.2em] opacity-70">Issue 04</p>
            <p className="mt-4 text-[13px] leading-relaxed opacity-80 max-w-[26ch]">
              A quiet catalogue of the things we collect on the desk — small
              plants in smaller cups, gradients that behave like weather, and
              objects that fit in the palm of a hand.
            </p>
            <div
              className="mt-6 h-px w-16"
              style={{ background: "var(--ink)" }}
            />
            <p className="mt-6 text-[11px] uppercase tracking-[0.2em] opacity-60">
              Edited by S. Marín
            </p>
          </div>

          <h1
            className="col-span-12 md:col-span-9 text-[clamp(3.5rem,9vw,8.5rem)] leading-[0.92] tracking-tight"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            A field guide to
            <br />
            <em className="italic" style={{ color: "var(--accent-coral)" }}>
              small, quiet
            </em>{" "}
            things.
          </h1>
        </div>
      </section>

      {/* Plants strip */}
      <section className="mx-auto max-w-[1240px] px-8">
        <figure className="relative overflow-hidden" style={{ borderTop: "1px solid var(--rule)", borderBottom: "1px solid var(--rule)" }}>
          <img
            src={plants}
            alt="Espresso cups holding tiny plants, arranged in a rhythmic grid"
            width={1200}
            height={900}
            className="h-[52vh] w-full object-cover"
          />
          <figcaption
            className="absolute bottom-4 left-4 rounded-sm px-3 py-1.5 text-[11px] uppercase tracking-[0.18em]"
            style={{ background: "var(--paper)", color: "var(--ink)" }}
          >
            Fig. 01 — Twelve cups, twelve mornings
          </figcaption>
        </figure>
      </section>

      {/* Editorial text block + 40% moment */}
      <section id="field" className="mx-auto max-w-[1240px] px-8 pt-24 pb-24">
        <div className="grid grid-cols-12 gap-8 items-start">
          <div className="col-span-12 md:col-span-5">
            <p className="text-[11px] uppercase tracking-[0.2em] opacity-70">Field notes</p>
            <h2
              className="mt-4 text-[clamp(2rem,3.5vw,3rem)] leading-[1.05] tracking-tight"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              On the color of a Tuesday afternoon.
            </h2>
            <div className="mt-8 space-y-5 text-[15px] leading-[1.7] max-w-[52ch] opacity-90">
              <p>
                Gradients are the honest weather of the screen. They arrive
                without edges and leave without notice — a soft coral at
                three, a lilac by four, and by dusk the whole page has become
                the sky.
              </p>
              <p>
                This issue collects the objects that behave the same way:
                things that sit still and slowly change. A cube of green
                glass. A paper plane mid-thought. A beetle, perfectly
                composed.
              </p>
            </div>
            <a
              href="#objects"
              className="mt-10 inline-flex items-center gap-3 text-[12px] uppercase tracking-[0.22em] transition-opacity hover:opacity-60"
            >
              <span>Read the index</span>
              <span
                aria-hidden
                className="inline-block h-px w-10"
                style={{ background: "var(--ink)" }}
              />
            </a>
          </div>

          <div className="col-span-12 md:col-span-7">
            <div
              className="relative aspect-[16/11] w-full overflow-hidden"
              style={{ borderRadius: "2px" }}
            >
              <img
                src={bubbles}
                alt="Soft overlapping translucent circles in coral, magenta and lilac"
                width={1600}
                height={900}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="text-[clamp(6rem,16vw,14rem)] leading-none tracking-tighter"
                  style={{
                    fontFamily: "var(--font-serif)",
                    color: "var(--paper)",
                    textShadow: "0 2px 40px rgba(0,0,0,0.12)",
                  }}
                >
                  40<span style={{ color: "var(--accent-coral)" }}>%</span>
                </span>
              </div>
              <span
                className="absolute bottom-4 right-4 text-[11px] uppercase tracking-[0.18em]"
                style={{ color: "var(--ink)" }}
              >
                Fig. 02 — Opacity, felt
              </span>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed opacity-70 max-w-[42ch]">
              Forty percent is the exact softness at which a color stops
              being loud and starts being a mood.
            </p>
          </div>
        </div>
      </section>

      {/* Objects grid */}
      <section id="objects" className="mx-auto max-w-[1240px] px-8 pb-24">
        <div className="mb-10 flex items-end justify-between border-b pb-4" style={{ borderColor: "var(--rule)" }}>
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] opacity-70">The index</p>
            <h2
              className="mt-2 text-[clamp(1.75rem,2.5vw,2.25rem)] tracking-tight"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Nine objects, arranged by feeling.
            </h2>
          </div>
          <span className="hidden md:block text-[11px] uppercase tracking-[0.2em] opacity-60">
            001 — 009
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          {tiles.map((t, i) => (
            <figure key={i} className="group">
              <div
                className="relative aspect-square overflow-hidden"
                style={{
                  background: t.bg,
                  borderRadius: "2px",
                }}
              >
                {t.src && (
                  <img
                    src={t.src}
                    alt={t.alt}
                    width={800}
                    height={800}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
                  />
                )}
                <span
                  className="absolute left-3 top-3 text-[10px] uppercase tracking-[0.2em]"
                  style={{ color: t.chip ?? "var(--ink)", opacity: 0.7 }}
                >
                  {String(i + 1).padStart(3, "0")}
                </span>
              </div>
              <figcaption className="mt-3 flex items-baseline justify-between text-[12px]">
                <span style={{ fontFamily: "var(--font-serif)" }} className="text-[17px] italic">
                  {t.title}
                </span>
                <span className="uppercase tracking-[0.18em] opacity-60">{t.tag}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Closing / colophon */}
      <section id="colophon" className="border-t" style={{ borderColor: "var(--rule)" }}>
        <div className="mx-auto max-w-[1240px] px-8 py-20 grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-6">
            <p
              className="text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] tracking-tight max-w-[18ch]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Sent quietly, once a season — <em className="italic" style={{ color: "var(--accent-coral)" }}>no noise</em>.
            </p>
            <form className="mt-8 flex max-w-md items-center gap-2 border-b pb-2" style={{ borderColor: "var(--ink)" }}>
              <input
                type="email"
                placeholder="your@address.com"
                className="w-full bg-transparent text-[15px] outline-none placeholder:opacity-40"
              />
              <button
                type="submit"
                className="text-[11px] uppercase tracking-[0.22em] hover:opacity-60"
              >
                Subscribe →
              </button>
            </form>
          </div>
          <div className="col-span-12 md:col-span-3 md:col-start-9 text-[12px] leading-relaxed opacity-70">
            <p className="uppercase tracking-[0.2em] opacity-100">Colophon</p>
            <p className="mt-4">
              Set in Instrument Serif and Work Sans. Photographed on a small
              desk in Lisbon. Printed on the internet.
            </p>
            <p className="mt-4">© 2026 Studio Bloom</p>
          </div>
        </div>
      </section>
    </div>
  );
}

const tiles = [
  { title: "Paper plane", tag: "Air", src: "/src-tile-plane", bg: "var(--grad-tile-a)" },
  { title: "Green cube", tag: "Glass", bg: "linear-gradient(135deg, oklch(0.9 0.06 170), oklch(0.88 0.07 310))" },
  { title: "Small beetle", tag: "Form", bg: "linear-gradient(135deg, oklch(0.82 0.14 30), oklch(0.82 0.1 250))" },
  { title: "Morning haze", tag: "Field", bg: "linear-gradient(135deg, oklch(0.92 0.05 30), oklch(0.9 0.06 340))" },
  { title: "Cool drift", tag: "Field", bg: "linear-gradient(160deg, oklch(0.92 0.05 200), oklch(0.9 0.06 300))" },
  { title: "Rose fog", tag: "Field", bg: "linear-gradient(135deg, oklch(0.93 0.05 350), oklch(0.9 0.06 250))" },
  { title: "Warm noon", tag: "Field", bg: "linear-gradient(135deg, oklch(0.9 0.09 60), oklch(0.85 0.11 20))" },
  { title: "Lilac hour", tag: "Field", bg: "linear-gradient(160deg, oklch(0.88 0.09 310), oklch(0.9 0.07 250))" },
  { title: "Late sky", tag: "Field", bg: "linear-gradient(135deg, oklch(0.86 0.08 240), oklch(0.88 0.09 200))" },
].map((t, i) => {
  const imgs = [tilePlane, tileCube, tileBeetle, tileB, tileC, tileB, undefined, tileC, undefined];
  return { ...t, src: imgs[i], alt: t.title, chip: "var(--ink)" };
});
