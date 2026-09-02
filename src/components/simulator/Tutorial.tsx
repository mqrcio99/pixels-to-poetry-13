import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const STORAGE_KEY = "sim-tutorial-seen-v1";

const STEPS = [
  {
    title: "Bem-vindo ao Simulador!",
    body: "Aqui você monta a arquitetura de um sistema arrastando peças e vendo uma requisição viajar por elas. Em 4 passos você já está simulando.",
    emoji: "👋",
  },
  {
    title: "1. Arraste componentes",
    body: "Na barra esquerda estão Navegador, App Mobile, API Gateway, Servidor, Banco, Cache… Segure e arraste qualquer um para o quadro.",
    emoji: "🧩",
  },
  {
    title: "2. Ligue com setas",
    body: "Cada bloco tem um pontinho preto nas laterais. Clique no ponto direito de um bloco e arraste até o ponto esquerdo do próximo. Clique na pílula da seta para trocar o método (GET, POST…).",
    emoji: "➡️",
  },
  {
    title: "3. Simule",
    body: "Aperte ▶ Simular no topo. Uma bolinha vai percorrer o caminho a partir do cliente, com balões explicando o que cada peça faz. Ajuste velocidade, use passo-a-passo ou force um erro 500.",
    emoji: "▶️",
  },
  {
    title: "4. Aprenda clicando",
    body: "Clique em qualquer bloco ou seta para abrir o painel direito com uma explicação didática. Pronto — agora é experimentar!",
    emoji: "💡",
  },
];

export function Tutorial() {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
  }, []);

  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const openAgain = () => {
    setI(0);
    setOpen(true);
  };

  const step = STEPS[i];
  const last = i === STEPS.length - 1;

  return (
    <>
      <button
        onClick={openAgain}
        title="Ver tutorial"
        className="flex items-center gap-1.5 rounded-full border-2 border-black bg-white px-3 py-1.5 text-[13px] font-bold shadow-[2px_2px_0_#000] transition-transform hover:-translate-y-0.5"
        style={{ fontFamily: "'Kalam', cursive" }}
      >
        <HelpCircle size={14} /> Tutorial
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={close}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-2xl border-[2.5px] border-black p-6 shadow-[6px_6px_0_#000]"
              style={{
                background: "#FAF6EA",
                fontFamily: "'Kalam', cursive",
              }}
            >
              <button
                onClick={close}
                className="absolute right-3 top-3 rounded-full border-2 border-black bg-white p-1 shadow-[2px_2px_0_#000]"
                aria-label="Fechar"
              >
                <X size={14} />
              </button>

              <div className="mb-3 text-5xl">{step.emoji}</div>
              <h3 className="mb-2 text-2xl font-bold leading-tight">{step.title}</h3>
              <p className="text-[15px] leading-relaxed text-black/80">{step.body}</p>

              <div className="mt-5 flex items-center justify-between gap-3">
                <div className="flex gap-1.5">
                  {STEPS.map((_, idx) => (
                    <span
                      key={idx}
                      className="h-2 w-2 rounded-full border border-black"
                      style={{ background: idx === i ? "#000" : "transparent" }}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setI((v) => Math.max(0, v - 1))}
                    disabled={i === 0}
                    className="flex items-center gap-1 rounded-full border-2 border-black bg-white px-3 py-1.5 text-[13px] font-bold shadow-[2px_2px_0_#000] disabled:opacity-40"
                  >
                    <ChevronLeft size={14} /> Voltar
                  </button>
                  {last ? (
                    <button
                      onClick={close}
                      className="rounded-full border-2 border-black px-4 py-1.5 text-[13px] font-bold shadow-[2px_2px_0_#000] hover:-translate-y-0.5 transition-transform"
                      style={{ background: "#BBF7D0" }}
                    >
                      Bora começar!
                    </button>
                  ) : (
                    <button
                      onClick={() => setI((v) => Math.min(STEPS.length - 1, v + 1))}
                      className="flex items-center gap-1 rounded-full border-2 border-black px-3 py-1.5 text-[13px] font-bold shadow-[2px_2px_0_#000]"
                      style={{ background: "#FEF3C7" }}
                    >
                      Próximo <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
