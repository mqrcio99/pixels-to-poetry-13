export type ComponentCategory = "client" | "network" | "backend" | "data";

export type ComponentDef = {
  type: string;
  label: string;
  icon: string;
  category: ComponentCategory;
  color: string;
  explanation: string;
  simMessage: string;
};

export const CATALOG: ComponentDef[] = [
  {
    type: "browser",
    label: "Navegador",
    icon: "🌐",
    category: "client",
    color: "sky",
    explanation:
      "O navegador é o ponto de partida da maioria das requisições. Ele monta uma requisição HTTP e a envia pela rede.",
    simMessage: "O usuário clicou — o navegador dispara a requisição.",
  },
  {
    type: "mobile",
    label: "App Mobile",
    icon: "📱",
    category: "client",
    color: "sky",
    explanation:
      "Um app mobile também é um cliente. Ele fala com o backend geralmente via APIs REST ou gRPC.",
    simMessage: "O app mobile envia a requisição pela internet.",
  },
  {
    type: "gateway",
    label: "API Gateway",
    icon: "🚪",
    category: "network",
    color: "yellow",
    explanation:
      "O API Gateway é a porta de entrada do sistema. Ele autentica, faz rate limiting e roteia para o serviço certo.",
    simMessage: "Gateway valida o token e escolhe o serviço destino.",
  },
  {
    type: "loadbalancer",
    label: "Load Balancer",
    icon: "⚖️",
    category: "network",
    color: "yellow",
    explanation:
      "O Load Balancer distribui as requisições entre várias instâncias de servidor para evitar sobrecarga.",
    simMessage: "Load Balancer escolhe o servidor menos ocupado.",
  },
  {
    type: "server",
    label: "Servidor Web",
    icon: "🖥️",
    category: "backend",
    color: "mint",
    explanation:
      "O servidor web processa a lógica do negócio: recebe a requisição, chama os dados que precisa e devolve a resposta.",
    simMessage: "Servidor processa a lógica e monta a resposta.",
  },
  {
    type: "microservice",
    label: "Microsserviço",
    icon: "🧩",
    category: "backend",
    color: "mint",
    explanation:
      "Um microsserviço é uma parte pequena e independente do backend, responsável por uma única capacidade (ex: pagamentos, usuários). Também tem capacidade limitada de requisições simultâneas.",
    simMessage: "Microsserviço executa sua responsabilidade específica.",
  },
  {
    type: "queue",
    label: "Fila",
    icon: "📬",
    category: "backend",
    color: "mint",
    explanation:
      "Uma fila de mensagens permite processamento assíncrono: o servidor coloca um evento na fila e outro serviço consome depois.",
    simMessage: "A tarefa foi enfileirada para processamento em segundo plano.",
  },
  {
    type: "cache",
    label: "Cache (Redis)",
    icon: "⚡",
    category: "data",
    color: "pink",
    explanation:
      "O cache guarda respostas frequentes em memória. Ler do cache é muito mais rápido do que consultar o banco de dados.",
    simMessage: "Cache verifica se já tem essa resposta guardada.",
  },
  {
    type: "database",
    label: "Banco SQL",
    icon: "🗄️",
    category: "data",
    color: "pink",
    explanation:
      "O banco de dados guarda os dados de forma permanente. Consultas SQL retornam exatamente o que o servidor pediu.",
    simMessage: "Banco executa a query e devolve as linhas.",
  },
];

export const COLOR_MAP: Record<string, { bg: string; border: string }> = {
  sky: { bg: "#DBEAFE", border: "#1E3A8A" },
  yellow: { bg: "#FEF3C7", border: "#78350F" },
  mint: { bg: "#BBF7D0", border: "#14532D" },
  pink: { bg: "#FBCFE8", border: "#831843" },
};

export function getComponent(type: string): ComponentDef | undefined {
  return CATALOG.find((c) => c.type === type);
}
