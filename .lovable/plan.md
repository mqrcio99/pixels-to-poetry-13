# Simulador de Arquitetura — MVP

Ferramenta educacional com canvas infinito, estética "whiteboard" (tipo Excalidraw), onde o aluno arrasta componentes de sistema, conecta com setas e simula uma requisição percorrendo o caminho.

## Escopo do MVP (o que vou entregar agora)

1. **Canvas infinito** com pan/zoom e grid pontilhado (React Flow).
2. **Biblioteca lateral esquerda** com ~8 componentes arrastáveis: Navegador, App Mobile, API Gateway, Load Balancer, Servidor Web, Banco SQL, Cache (Redis), Fila.
3. **Conexões hand-drawn** entre blocos: clicar no ponto de conexão e arrastar para outro nó. Ao clicar numa seta, popover para escolher protocolo (HTTP GET/POST/PUT/DELETE, WebSocket, Evento assíncrono).
4. **Simulação (▶ Simular)**: partícula animada (Framer Motion) percorre as setas do primeiro nó "cliente" até o último e volta. Balão de explicação em cada nó. Console inferior com log (método, status, latência simulada).
5. **Controles de simulação**: velocidade (lenta/normal/rápida), modo passo-a-passo, e opção de simular erro (500/timeout).
6. **Painel direito**: ao selecionar componente, mostra explicação didática do que ele faz na vida real.
7. **Salvar/Exportar**: persistência automática em `localStorage`, botão exportar JSON.
8. **Visual whiteboard**: fundo bege papel, fonte "Kalam" (Google Fonts), blocos pastel com bordas irregulares via SVG filter `feTurbulence`+`feDisplacementMap` (efeito rough), leve rotação aleatória (~1.5°), setas curvas, cursor customizado.

## Fora do MVP (mencionado no brief, mas fica para depois)

- Camadas de abstração / zoom conceitual (duplo-clique para expandir nó em sub-canvas com breadcrumb).
- Payload JSON editável por conexão (só o método por enquanto).
- Exportar PNG (só JSON no MVP).
- Categorias completas de componentes (DNS, CDN, microsserviços, pagamento, e-mail).

Digo isso claramente na UI para o aluno saber o que ainda vem.

## Detalhes técnicos

- **Stack**: React + TS + Tailwind v4 (já no projeto), `reactflow`, `framer-motion`, `zustand` para estado do diagrama, `nanoid` para IDs. Fonte Kalam via `<link>` no `__root.tsx`.
- **Estrutura de arquivos**:
  - `src/routes/index.tsx` — substitui a landing atual pela ferramenta.
  - `src/components/simulator/Canvas.tsx` — React Flow com nós/edges customizados.
  - `src/components/simulator/NodeCard.tsx` — bloco pastel hand-drawn.
  - `src/components/simulator/SketchEdge.tsx` — edge curva com filtro rough.
  - `src/components/simulator/Sidebar.tsx` — biblioteca de componentes (drag para o canvas).
  - `src/components/simulator/InspectorPanel.tsx` — painel direito.
  - `src/components/simulator/SimulationControls.tsx` — botões ▶ / velocidade / erro.
  - `src/components/simulator/SimulationConsole.tsx` — log inferior.
  - `src/components/simulator/RequestParticle.tsx` — partícula animada.
  - `src/lib/simulator/store.ts` — Zustand: nós, edges, seleção, estado da simulação, persistência.
  - `src/lib/simulator/catalog.ts` — catálogo dos 8 componentes + explicação didática de cada um.
  - `src/styles.css` — tokens de paleta pastel + filtro SVG rough global.

## Aparência

Fundo `#F7F3E8` com grid pontilhado suave. Blocos ~180×90 px, cantos arredondados, borda 2px preta com filtro rough, sombra offset. Cores: azul `#BFDBFE`, menta `#BBF7D0`, amarelo `#FEF3C7`, rosa `#FBCFE8`. Setas pretas curvas com pequena "farpa" na ponta. Tudo em Kalam.

Se estiver ok, aperto build.
