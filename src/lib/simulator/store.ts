import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from "reactflow";
import { nanoid } from "nanoid";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "WS" | "EVENT";

export type NodeFailures = {
  // gateway
  rateLimitEnabled?: boolean;
  rateLimitRps?: number;
  // cache
  hitRate?: number; // 0..1
  coldStart?: boolean; // hitRate=0 until warmed
  // database
  dbBaseLatency?: number; // ms
  dbSlowUnderLoad?: boolean;
  dbFailRate?: number; // 0..1
  dbCapacity?: number;
  // server / microservice
  memoryLeak?: boolean;
  circuitBreaker?: boolean;
};

export type NodeData = {
  type: string;
  label: string;
  icon: string;
  color: string;
  rotation: number;
  failures?: NodeFailures;
};

export type EdgeData = {
  method: HttpMethod;
};

export type LogEntry = {
  id: string;
  ts: number;
  from: string;
  to: string;
  method: HttpMethod | "LOAD";
  status: number | "…";
  latency: number;
  note?: string;
  level: "info" | "warn" | "error" | "summary";
  category?: FailureCategory;
};

export type FailureCategory =
  | "ok"
  | "gateway_ratelimit"
  | "server_overload"
  | "server_queue"
  | "db_slow"
  | "db_fail"
  | "db_overload"
  | "cache_miss"
  | "cache_cold"
  | "breaker_open"
  | "memory_leak";

export type SimSpeed = "slow" | "normal" | "fast";
export type SimStatus = "idle" | "running" | "paused" | "done";

export type BreakerState = "closed" | "open" | "half";

export type NodeStat = {
  active: number;
  queue: number;
  succeeded: number;
  queued: number;
  failed: number;
  peakActive: number;
  peakQueue: number;
  capacity: number;
  baseCapacity: number;
  shaking: boolean;
  breaker: BreakerState;
  breakerTrips: number;
};

export type LBDistribution = {
  serverIds: string[];
  counts: Record<string, number>;
};

export type LatencySample = { t: number; latency: number; ok: boolean };

export type PostmortemBucket = {
  category: FailureCategory;
  count: number;
  label: string;
  hint: string;
};

export type Postmortem = {
  total: number;
  ok: number;
  failed: number;
  p50: number;
  p95: number;
  p99: number;
  buckets: PostmortemBucket[];
  bottleneck: string;
  suggestions: string[];
};

export const NODE_CAPACITY: Record<string, number> = {
  server: 10,
  microservice: 10,
};
const DB_DEFAULT_CAPACITY = 20;
const CAPACITY_UNLIMITED = 9999;

function capacityFor(type: string, failures?: NodeFailures) {
  if (type === "database") return failures?.dbCapacity ?? DB_DEFAULT_CAPACITY;
  return NODE_CAPACITY[type] ?? CAPACITY_UNLIMITED;
}

export const DEFAULT_FAILURES: Record<string, NodeFailures> = {
  gateway: { rateLimitEnabled: false, rateLimitRps: 30 },
  cache: { hitRate: 0.8, coldStart: false },
  database: {
    dbBaseLatency: 40,
    dbSlowUnderLoad: false,
    dbFailRate: 0,
    dbCapacity: DB_DEFAULT_CAPACITY,
  },
  server: { memoryLeak: false, circuitBreaker: false },
  microservice: { memoryLeak: false, circuitBreaker: false },
};

export const PRESETS: Record<
  string,
  { label: string; description: string; load: number; speed: SimSpeed; apply: (n: Node<NodeData>) => NodeFailures | undefined }
> = {
  none: {
    label: "Nenhum",
    description: "Sem cenário — usa as configurações atuais.",
    load: 20,
    speed: "normal",
    apply: () => undefined,
  },
  blackfriday: {
    label: "🛒 Black Friday",
    description: "Pico brutal de tráfego. Tudo saudável, mas volume alto.",
    load: 100,
    speed: "fast",
    apply: () => undefined,
  },
  dbdown: {
    label: "🗄️ Banco lento",
    description: "DB com queries pesadas — latência alta e falhas parciais.",
    load: 60,
    speed: "normal",
    apply: (n) => {
      if (n.data.type === "database")
        return { dbBaseLatency: 180, dbSlowUnderLoad: true, dbFailRate: 0.15 };
      return undefined;
    },
  },
  coldcache: {
    label: "❄️ Cache frio",
    description: "Cache vazio: todas as req batem no DB até esquentar.",
    load: 50,
    speed: "normal",
    apply: (n) => {
      if (n.data.type === "cache") return { hitRate: 0.9, coldStart: true };
      return undefined;
    },
  },
  baddeploy: {
    label: "💣 Deploy ruim",
    description: "Servidor com vazamento de memória + circuit breaker ativo.",
    load: 70,
    speed: "normal",
    apply: (n) => {
      if (n.data.type === "server" || n.data.type === "microservice")
        return { memoryLeak: true, circuitBreaker: true };
      return undefined;
    },
  },
  ddos: {
    label: "🚨 Ataque de tráfego",
    description: "Gateway com rate limit apertado — 429 em massa.",
    load: 100,
    speed: "fast",
    apply: (n) => {
      if (n.data.type === "gateway") return { rateLimitEnabled: true, rateLimitRps: 15 };
      return undefined;
    },
  },
};

type State = {
  nodes: Node<NodeData>[];
  edges: Edge<EdgeData>[];
  selectedId: string | null;
  simStatus: SimStatus;
  simSpeed: SimSpeed;
  simLoad: number;
  stepMode: boolean;
  errorMode: "none" | "500" | "timeout";
  chaosPreset: string;
  log: LogEntry[];
  bubble: { nodeId: string; text: string } | null;
  nodeStats: Record<string, NodeStat>;
  lbDistribution: Record<string, LBDistribution>;
  latencySamples: LatencySample[];
  postmortem: Postmortem | null;

  setNodes: (n: Node<NodeData>[]) => void;
  setEdges: (e: Edge<EdgeData>[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (c: Connection) => void;
  addNode: (data: Omit<NodeData, "rotation">, position: { x: number; y: number }) => void;
  deleteNode: (id: string) => void;
  select: (id: string | null) => void;
  setEdgeMethod: (id: string, method: HttpMethod) => void;
  deleteEdge: (id: string) => void;
  setNodeFailures: (id: string, patch: NodeFailures) => void;

  setSpeed: (s: SimSpeed) => void;
  setLoad: (n: number) => void;
  setStepMode: (b: boolean) => void;
  setErrorMode: (e: "none" | "500" | "timeout") => void;
  applyPreset: (name: string) => void;
  startSim: () => void;
  stopSim: () => void;
  advanceStep: () => void;
  dismissPostmortem: () => void;
  _timers: number[];
  clearLog: () => void;
  pushLog: (l: Omit<LogEntry, "id" | "ts">) => void;
  setBubble: (b: { nodeId: string; text: string } | null) => void;
  exportJSON: () => string;
};

const SPEED_MS: Record<SimSpeed, number> = { slow: 120, normal: 60, fast: 25 };

export const useSim = create<State>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      selectedId: null,
      simStatus: "idle",
      simSpeed: "normal",
      simLoad: 20,
      stepMode: false,
      errorMode: "none",
      chaosPreset: "none",
      log: [],
      bubble: null,
      nodeStats: {},
      lbDistribution: {},
      latencySamples: [],
      postmortem: null,
      _timers: [],

      setNodes: (n) => set({ nodes: n }),
      setEdges: (e) => set({ edges: e }),
      onNodesChange: (changes) =>
        set({ nodes: applyNodeChanges(changes, get().nodes) as Node<NodeData>[] }),
      onEdgesChange: (changes) =>
        set({ edges: applyEdgeChanges(changes, get().edges) as Edge<EdgeData>[] }),
      onConnect: (c) =>
        set({
          edges: addEdge(
            {
              ...c,
              id: nanoid(6),
              type: "sketch",
              data: { method: "GET" } satisfies EdgeData,
            },
            get().edges,
          ) as Edge<EdgeData>[],
        }),
      addNode: (data, position) => {
        const id = nanoid(6);
        const rotation = (Math.random() - 0.5) * 3;
        const failures = DEFAULT_FAILURES[data.type];
        set({
          nodes: [
            ...get().nodes,
            {
              id,
              type: "sketch",
              position,
              data: { ...data, rotation, failures: failures ? { ...failures } : undefined },
            } as Node<NodeData>,
          ],
        });
      },
      deleteNode: (id) =>
        set({
          nodes: get().nodes.filter((n) => n.id !== id),
          edges: get().edges.filter((e) => e.source !== id && e.target !== id),
          selectedId: get().selectedId === id ? null : get().selectedId,
        }),
      select: (id) => set({ selectedId: id }),
      setEdgeMethod: (id, method) =>
        set({
          edges: get().edges.map((e) =>
            e.id === id ? { ...e, data: { ...(e.data ?? { method: "GET" }), method } } : e,
          ),
        }),
      deleteEdge: (id) =>
        set({
          edges: get().edges.filter((e) => e.id !== id),
          selectedId: get().selectedId === id ? null : get().selectedId,
        }),
      setNodeFailures: (id, patch) =>
        set({
          nodes: get().nodes.map((n) =>
            n.id === id
              ? { ...n, data: { ...n.data, failures: { ...(n.data.failures ?? {}), ...patch } } }
              : n,
          ),
        }),

      setSpeed: (s) => set({ simSpeed: s }),
      setLoad: (n) => set({ simLoad: Math.max(1, Math.min(100, Math.round(n))) }),
      setStepMode: (b) => set({ stepMode: b }),
      setErrorMode: (e) => set({ errorMode: e }),
      applyPreset: (name) => {
        const preset = PRESETS[name];
        if (!preset) return;
        const nodes = get().nodes.map((n) => {
          // reset to defaults first
          const base = DEFAULT_FAILURES[n.data.type];
          const patch = preset.apply(n);
          const failures = base ? { ...base, ...(patch ?? {}) } : patch;
          return { ...n, data: { ...n.data, failures } };
        });
        set({
          nodes,
          chaosPreset: name,
          simLoad: preset.load,
          simSpeed: preset.speed,
        });
      },

      startSim: () => runLoadSim(get, set),
      stopSim: () => {
        get()._timers.forEach((t) => window.clearTimeout(t));
        set({
          simStatus: "idle",
          bubble: null,
          _timers: [],
        });
      },
      advanceStep: () => {},
      dismissPostmortem: () => set({ postmortem: null }),
      clearLog: () => set({ log: [], latencySamples: [], postmortem: null }),
      pushLog: (l) =>
        set({
          log: [...get().log, { ...l, id: nanoid(6), ts: Date.now() }].slice(-400),
        }),
      setBubble: (b) => set({ bubble: b }),
      exportJSON: () => {
        const { nodes, edges } = get();
        return JSON.stringify({ nodes, edges }, null, 2);
      },
    }),
    {
      name: "arch-sim-v2",
      partialize: (s) => ({ nodes: s.nodes, edges: s.edges }),
    },
  ),
);

// ============ Load simulation with realistic bottlenecks ============

type Setter = (partial: Partial<State> | ((s: State) => Partial<State>)) => void;
type Getter = () => State;

const CAT_LABEL: Record<FailureCategory, string> = {
  ok: "Sucesso",
  gateway_ratelimit: "Rate limit (429)",
  server_overload: "Servidor sobrecarregado (503)",
  server_queue: "Enfileirada",
  db_slow: "DB lento (504)",
  db_fail: "Falha do banco (500)",
  db_overload: "Banco saturado (503)",
  cache_miss: "Cache miss",
  cache_cold: "Cache frio",
  breaker_open: "Circuit breaker aberto",
  memory_leak: "Servidor degradado",
};

const CAT_HINT: Record<FailureCategory, string> = {
  ok: "",
  gateway_ratelimit: "Aumente o limite do gateway, adicione retry com backoff no cliente.",
  server_overload: "Adicione mais servidores atrás do Load Balancer ou aumente a capacidade.",
  server_queue: "Filas curtas são ok, mas longas viram timeouts. Escale horizontal.",
  db_slow: "Adicione índices, cache na frente do DB, ou réplicas de leitura.",
  db_fail: "Investigue queries, aumente pool de conexões, adicione failover.",
  db_overload: "DB não escala como servidor web. Use cache, sharding ou read replicas.",
  cache_miss: "Aumente TTL, pré-aqueça o cache, revise a chave de cache.",
  cache_cold: "Deploy quebra o cache. Faça warm-up antes do tráfego real.",
  breaker_open: "O breaker protegeu o sistema. Investigue o serviço a jusante.",
  memory_leak: "Reinicie/rotacione as instâncias periodicamente enquanto investiga o leak.",
};

function runLoadSim(get: Getter, set: Setter) {
  const state = get();
  state._timers.forEach((t) => window.clearTimeout(t));

  const { nodes, edges, simLoad, simSpeed } = state;
  if (nodes.length === 0) return;

  const out = (id: string) =>
    edges.filter((e) => e.source === id).map((e) => nodes.find((n) => n.id === e.target)!).filter(Boolean);

  const findByType = (start: Node<NodeData>, type: string, maxDepth = 6): Node<NodeData> | null => {
    const visited = new Set<string>([start.id]);
    let frontier: Node<NodeData>[] = [start];
    for (let d = 0; d < maxDepth && frontier.length; d++) {
      const next: Node<NodeData>[] = [];
      for (const f of frontier) {
        for (const n of out(f.id)) {
          if (visited.has(n.id)) continue;
          visited.add(n.id);
          if (n.data.type === type) return n;
          next.push(n);
        }
      }
      frontier = next;
    }
    return null;
  };

  const entry =
    nodes.find((n) => ["browser", "mobile"].includes(n.data.type)) ?? nodes[0];
  if (!entry) return;

  const gateway = findByType(entry, "gateway");
  const lb = findByType(gateway ?? entry, "loadbalancer");
  const isServer = (n: Node<NodeData>) => n.data.type === "server" || n.data.type === "microservice";

  let servers: Node<NodeData>[] = [];
  if (lb) servers = out(lb.id).filter(isServer);
  else {
    // servers reachable from gateway or entry
    const src = gateway ?? entry;
    const visited = new Set<string>([src.id]);
    const stack = [src];
    while (stack.length) {
      const cur = stack.pop()!;
      for (const n of out(cur.id)) {
        if (visited.has(n.id)) continue;
        visited.add(n.id);
        if (isServer(n)) servers.push(n);
        else stack.push(n);
      }
    }
  }

  if (servers.length === 0) {
    set({
      simStatus: "done",
      log: [
        ...state.log,
        {
          id: nanoid(6),
          ts: Date.now(),
          from: entry.data.label,
          to: "—",
          method: "LOAD",
          status: 0,
          latency: 0,
          note: "Sem Servidor Web / Microsserviço na topologia — nada a processar.",
          level: "warn",
        },
      ],
    });
    return;
  }

  // Per-server downstream: cache and database
  const serverDeps = new Map<string, { cache: Node<NodeData> | null; db: Node<NodeData> | null }>();
  for (const s of servers) {
    let cache: Node<NodeData> | null = null;
    let db: Node<NodeData> | null = null;
    for (const n of out(s.id)) {
      if (n.data.type === "cache") cache = n;
      if (n.data.type === "database") db = n;
    }
    // if server doesn't reach db directly, walk one more hop through cache
    if (!db && cache) {
      for (const n of out(cache.id)) if (n.data.type === "database") db = n;
    }
    serverDeps.set(s.id, { cache, db });
  }

  // Initialize stats
  const initialStats: Record<string, NodeStat> = {};
  nodes.forEach((n) => {
    const cap = capacityFor(n.data.type, n.data.failures);
    initialStats[n.id] = {
      active: 0,
      queue: 0,
      succeeded: 0,
      queued: 0,
      failed: 0,
      peakActive: 0,
      peakQueue: 0,
      capacity: cap,
      baseCapacity: cap,
      shaking: false,
      breaker: "closed",
      breakerTrips: 0,
    };
  });

  const distribution: LBDistribution = {
    serverIds: servers.map((s) => s.id),
    counts: Object.fromEntries(servers.map((s) => [s.id, 0])),
  };
  const lbDistribution: Record<string, LBDistribution> = {};
  if (lb) lbDistribution[lb.id] = distribution;

  set({
    simStatus: "running",
    log: [],
    latencySamples: [],
    postmortem: null,
    bubble: null,
    nodeStats: initialStats,
    lbDistribution,
    _timers: [],
  });

  get().pushLog({
    from: entry.data.label,
    to: (gateway ?? lb ?? servers[0]).data.label,
    method: "LOAD",
    status: "…",
    latency: 0,
    note: `Disparando ${simLoad} requisições · pipeline: ${entry.data.label}${gateway ? " → " + gateway.data.label : ""}${lb ? " → " + lb.data.label : ""} → ${servers.length} servidor(es)`,
    level: "info",
  });

  const dispatchSpacing = SPEED_MS[simSpeed];
  const t0 = Date.now();
  const results: { latency: number; ok: boolean; category: FailureCategory }[] = [];
  const timers: number[] = [];
  let completed = 0;

  // Gateway rate-limit: sliding window (1s)
  const gwHits: number[] = [];

  // Cache cold-start counter
  let cacheServed = 0;

  // Circuit breaker windows per server
  const breakerFailures: Record<string, number[]> = {};
  const openBreaker = (serverId: string) => {
    const st = get().nodeStats[serverId];
    if (!st || st.breaker === "open") return;
    set({
      nodeStats: {
        ...get().nodeStats,
        [serverId]: { ...st, breaker: "open", breakerTrips: st.breakerTrips + 1 },
      },
    });
    const t = window.setTimeout(() => {
      const s = get().nodeStats[serverId];
      if (!s) return;
      set({
        nodeStats: { ...get().nodeStats, [serverId]: { ...s, breaker: "closed" } },
      });
    }, 3000);
    timers.push(t);
  };

  const recordDbFailure = (serverId: string) => {
    const arr = (breakerFailures[serverId] ??= []);
    const now = Date.now();
    arr.push(now);
    // keep last 2s
    while (arr.length && now - arr[0] > 2000) arr.shift();
    const server = nodes.find((n) => n.id === serverId);
    if (server?.data.failures?.circuitBreaker && arr.length >= 5) {
      openBreaker(serverId);
    }
  };

  const finalize = (latency: number, ok: boolean, category: FailureCategory) => {
    results.push({ latency, ok, category });
    const sample: LatencySample = { t: Date.now() - t0, latency, ok };
    set({ latencySamples: [...get().latencySamples, sample].slice(-200) });
    completed++;
    if (completed >= simLoad) buildPostmortem();
  };

  const buildPostmortem = () => {
    const total = results.length;
    const ok = results.filter((r) => r.ok).length;
    const failed = total - ok;
    const sorted = [...results].map((r) => r.latency).sort((a, b) => a - b);
    const q = (p: number) => (sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))] : 0);
    const bucketMap = new Map<FailureCategory, number>();
    for (const r of results) {
      if (r.category === "ok") continue;
      bucketMap.set(r.category, (bucketMap.get(r.category) ?? 0) + 1);
    }
    const buckets: PostmortemBucket[] = [...bucketMap.entries()]
      .map(([category, count]) => ({
        category,
        count,
        label: CAT_LABEL[category],
        hint: CAT_HINT[category],
      }))
      .sort((a, b) => b.count - a.count);

    let bottleneck = "Nenhum gargalo evidente — o sistema aguentou a carga.";
    const suggestions: string[] = [];
    if (buckets.length > 0) {
      const top = buckets[0];
      const pct = Math.round((top.count / total) * 100);
      bottleneck = `${top.label} respondeu por ${pct}% das ocorrências ruins.`;
      suggestions.push(top.hint);
      for (const b of buckets.slice(1, 3)) if (b.hint) suggestions.push(b.hint);
    }
    if (failed / total > 0.3) suggestions.push("Taxa de falha > 30% — considere escalar horizontalmente.");
    if (q(0.95) > 500) suggestions.push("p95 acima de 500ms — investigue caminho crítico e cache.");

    set({
      simStatus: "done",
      bubble: null,
      postmortem: {
        total,
        ok,
        failed,
        p50: Math.round(q(0.5)),
        p95: Math.round(q(0.95)),
        p99: Math.round(q(0.99)),
        buckets,
        bottleneck,
        suggestions,
      },
    });

    get().pushLog({
      from: "—",
      to: "—",
      method: "LOAD",
      status: failed === 0 ? 200 : 503,
      latency: 0,
      note: `Resumo: ${ok}/${total} sucesso · p50 ${Math.round(q(0.5))}ms · p95 ${Math.round(q(0.95))}ms · ${bottleneck}`,
      level: "summary",
    });
  };

  // ==== per-request pipeline ====
  const dispatch = (i: number) => {
    if (get().simStatus !== "running") return;

    // Round-robin server pick (LB or single path)
    const server = servers[i % servers.length];
    distribution.counts[server.id] = (distribution.counts[server.id] ?? 0) + 1;

    // Gateway rate limit
    if (gateway) {
      const gwFail = gateway.data.failures;
      if (gwFail?.rateLimitEnabled) {
        const now = Date.now();
        while (gwHits.length && now - gwHits[0] > 1000) gwHits.shift();
        if (gwHits.length >= (gwFail.rateLimitRps ?? 30)) {
          get().pushLog({
            from: entry.data.label,
            to: gateway.data.label,
            method: "GET",
            status: 429,
            latency: 5,
            note: `rate limit (${gwFail.rateLimitRps} req/s)`,
            level: "error",
            category: "gateway_ratelimit",
          });
          finalize(5, false, "gateway_ratelimit");
          return;
        }
        gwHits.push(now);
      }
    }

    // Update server capacity for memory leak
    const srvFail = server.data.failures;
    const st0 = get().nodeStats[server.id];
    if (st0 && srvFail?.memoryLeak) {
      const decay = Math.min(0.8, (Date.now() - t0) / 10000);
      const newCap = Math.max(2, Math.round(st0.baseCapacity * (1 - decay)));
      if (newCap !== st0.capacity) {
        set({
          nodeStats: {
            ...get().nodeStats,
            [server.id]: { ...st0, capacity: newCap },
          },
        });
      }
    }

    const st = get().nodeStats[server.id];
    if (!st) return;

    // Circuit breaker open → fast-fail
    if (st.breaker === "open") {
      get().pushLog({
        from: (lb ?? gateway ?? entry).data.label,
        to: server.data.label,
        method: "GET",
        status: 503,
        latency: 8,
        note: "circuit breaker aberto — falha rápida",
        level: "error",
        category: "breaker_open",
      });
      finalize(8, false, "breaker_open");
      return;
    }

    // Occasional bubble
    if (i % Math.max(1, Math.floor(simLoad / 6)) === 0) {
      set({ bubble: { nodeId: server.id, text: `req #${i + 1}` } });
    }

    if (st.active < st.capacity) {
      set({
        nodeStats: {
          ...get().nodeStats,
          [server.id]: { ...st, active: st.active + 1, peakActive: Math.max(st.peakActive, st.active + 1) },
        },
      });
      processOnServer(server, false);
    } else if (st.queue < st.capacity) {
      set({
        nodeStats: {
          ...get().nodeStats,
          [server.id]: {
            ...st,
            queue: st.queue + 1,
            queued: st.queued + 1,
            peakQueue: Math.max(st.peakQueue, st.queue + 1),
          },
        },
      });
      get().pushLog({
        from: (lb ?? gateway ?? entry).data.label,
        to: server.data.label,
        method: "GET",
        status: 202,
        latency: 0,
        note: `enfileirada (${st.queue + 1}/${st.capacity})`,
        level: "warn",
        category: "server_queue",
      });
      // Queued req will be drained (which itself records success/failure)
    } else {
      // overflow → 503
      set({
        nodeStats: {
          ...get().nodeStats,
          [server.id]: { ...st, failed: st.failed + 1, shaking: true },
        },
      });
      get().pushLog({
        from: (lb ?? gateway ?? entry).data.label,
        to: server.data.label,
        method: "GET",
        status: 503,
        latency: 5,
        note: "503 — capacidade excedida",
        level: "error",
        category: "server_overload",
      });
      finalize(5, false, "server_overload");
    }
  };

  const processOnServer = (server: Node<NodeData>, wasQueued: boolean) => {
    const deps = serverDeps.get(server.id)!;
    const cache = deps.cache;
    const db = deps.db;
    const cacheFail = cache?.data.failures;
    const dbFail = db?.data.failures;

    // Overload factor from queue pressure
    const st = get().nodeStats[server.id];
    const overloadFactor = st ? 1 + (st.queue / Math.max(1, st.capacity)) * 1.5 : 1;

    let cacheHit = false;
    let cacheLatency = 0;
    if (cache) {
      cacheServed++;
      let hitRate = cacheFail?.hitRate ?? 0.8;
      if (cacheFail?.coldStart && cacheServed < 30) hitRate = 0;
      cacheHit = Math.random() < hitRate;
      cacheLatency = 3 + Math.random() * 5;
    }

    // If cache hit → shortcut, no DB
    const finish = (extraLatency: number, ok: boolean, category: FailureCategory, note?: string) => {
      const total = (cacheLatency + extraLatency + (30 + Math.random() * 40)) * overloadFactor;
      const t = window.setTimeout(() => {
        const cur = get().nodeStats[server.id];
        if (cur) {
          set({
            nodeStats: {
              ...get().nodeStats,
              [server.id]: {
                ...cur,
                active: Math.max(0, cur.active - 1),
                succeeded: ok ? cur.succeeded + 1 : cur.succeeded,
                failed: ok ? cur.failed : cur.failed + 1,
                shaking: cur.queue > cur.capacity,
              },
            },
          });
        }
        get().pushLog({
          from: (lb ?? gateway ?? entry).data.label,
          to: server.data.label,
          method: "GET",
          status: ok ? 200 : category === "db_slow" ? 504 : category === "db_fail" ? 500 : 503,
          latency: Math.round(total),
          note: note ?? (wasQueued ? "após espera na fila" : undefined),
          level: ok ? "info" : "error",
          category: ok ? "ok" : category,
        });
        finalize(total, ok, ok ? "ok" : category);
        drain(server);
      }, total);
      timers.push(t);
    };

    if (cacheHit) {
      finish(0, true, "ok", "cache hit ⚡");
      return;
    }

    if (cache && !cacheHit) {
      // log cache miss silently at bubble level, main outcome comes from DB
    }

    if (!db) {
      // No DB → server-only work
      finish(20 + Math.random() * 40, true, "ok");
      return;
    }

    // DB step: capacity + latency + fail rate
    const dbSt = get().nodeStats[db.id];
    if (!dbSt) {
      finish(40, true, "ok");
      return;
    }
    if (dbSt.active >= dbSt.capacity) {
      // DB saturated
      set({
        nodeStats: {
          ...get().nodeStats,
          [db.id]: { ...dbSt, failed: dbSt.failed + 1, shaking: true },
        },
      });
      recordDbFailure(server.id);
      finish(0, false, "db_overload", "DB saturado (503)");
      return;
    }

    // Occupy DB slot
    set({
      nodeStats: {
        ...get().nodeStats,
        [db.id]: {
          ...dbSt,
          active: dbSt.active + 1,
          peakActive: Math.max(dbSt.peakActive, dbSt.active + 1),
        },
      },
    });

    const base = dbFail?.dbBaseLatency ?? 40;
    const loadPenalty = dbFail?.dbSlowUnderLoad
      ? (dbSt.active / dbSt.capacity) * 300
      : 0;
    const dbLatency = base + Math.random() * 30 + loadPenalty;
    const dbFails = Math.random() < (dbFail?.dbFailRate ?? 0);
    const slowCutoff = 800;

    const dbT = window.setTimeout(() => {
      const cur = get().nodeStats[db.id];
      if (cur) {
        set({
          nodeStats: {
            ...get().nodeStats,
            [db.id]: {
              ...cur,
              active: Math.max(0, cur.active - 1),
              succeeded: !dbFails ? cur.succeeded + 1 : cur.succeeded,
              failed: dbFails ? cur.failed + 1 : cur.failed,
            },
          },
        });
      }
      if (dbFails) {
        recordDbFailure(server.id);
        finish(dbLatency, false, "db_fail", "DB retornou erro");
      } else if (dbLatency > slowCutoff) {
        recordDbFailure(server.id);
        finish(dbLatency, false, "db_slow", `DB muito lento (${Math.round(dbLatency)}ms)`);
      } else {
        finish(dbLatency, true, "ok", cache ? "cache miss → DB" : undefined);
      }
    }, dbLatency);
    timers.push(dbT);
  };

  const drain = (server: Node<NodeData>) => {
    const st = get().nodeStats[server.id];
    if (!st || st.queue <= 0 || st.active >= st.capacity) return;
    set({
      nodeStats: {
        ...get().nodeStats,
        [server.id]: {
          ...st,
          active: st.active + 1,
          queue: st.queue - 1,
          peakActive: Math.max(st.peakActive, st.active + 1),
        },
      },
    });
    processOnServer(server, true);
  };

  for (let i = 0; i < simLoad; i++) {
    const t = window.setTimeout(() => dispatch(i), i * dispatchSpacing);
    timers.push(t);
  }

  set({ _timers: [...get()._timers, ...timers] });
}
