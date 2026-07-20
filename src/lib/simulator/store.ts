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

export type NodeData = {
  type: string;
  label: string;
  icon: string;
  color: string;
  rotation: number;
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
};

export type SimSpeed = "slow" | "normal" | "fast";
export type SimStatus = "idle" | "running" | "paused" | "done";

export type NodeStat = {
  active: number;
  queue: number;
  succeeded: number;
  queued: number;
  failed: number;
  peakActive: number;
  peakQueue: number;
  capacity: number;
  shaking: boolean;
};

export type LBDistribution = {
  serverIds: string[];
  counts: Record<string, number>;
};

export const NODE_CAPACITY: Record<string, number> = {
  server: 10,
  microservice: 10,
};

const CAPACITY_UNLIMITED = 9999;

function capacityFor(type: string) {
  return NODE_CAPACITY[type] ?? CAPACITY_UNLIMITED;
}

type State = {
  nodes: Node<NodeData>[];
  edges: Edge<EdgeData>[];
  selectedId: string | null;
  simStatus: SimStatus;
  simSpeed: SimSpeed;
  simLoad: number;
  stepMode: boolean;
  errorMode: "none" | "500" | "timeout";
  log: LogEntry[];
  bubble: { nodeId: string; text: string } | null;
  nodeStats: Record<string, NodeStat>;
  lbDistribution: Record<string, LBDistribution>;

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

  setSpeed: (s: SimSpeed) => void;
  setLoad: (n: number) => void;
  setStepMode: (b: boolean) => void;
  setErrorMode: (e: "none" | "500" | "timeout") => void;
  startSim: () => void;
  stopSim: () => void;
  advanceStep: () => void;
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
      log: [],
      bubble: null,
      nodeStats: {},
      lbDistribution: {},
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
        set({
          nodes: [
            ...get().nodes,
            {
              id,
              type: "sketch",
              position,
              data: { ...data, rotation },
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

      setSpeed: (s) => set({ simSpeed: s }),
      setLoad: (n) => set({ simLoad: Math.max(1, Math.min(100, Math.round(n))) }),
      setStepMode: (b) => set({ stepMode: b }),
      setErrorMode: (e) => set({ errorMode: e }),

      startSim: () => runLoadSim(get, set),
      stopSim: () => {
        get()._timers.forEach((t) => window.clearTimeout(t));
        set({
          simStatus: "idle",
          bubble: null,
          _timers: [],
        });
      },
      advanceStep: () => {
        // step mode not used in load sim
      },
      clearLog: () => set({ log: [] }),
      pushLog: (l) =>
        set({
          log: [...get().log, { ...l, id: nanoid(6), ts: Date.now() }].slice(-300),
        }),
      setBubble: (b) => set({ bubble: b }),
      exportJSON: () => {
        const { nodes, edges } = get();
        return JSON.stringify({ nodes, edges }, null, 2);
      },
    }),
    {
      name: "arch-sim-v1",
      partialize: (s) => ({ nodes: s.nodes, edges: s.edges }),
    },
  ),
);

// ============ Load simulation ============

type Setter = (partial: Partial<State> | ((s: State) => Partial<State>)) => void;
type Getter = () => State;

function runLoadSim(get: Getter, set: Setter) {
  const state = get();
  state._timers.forEach((t) => window.clearTimeout(t));

  const { nodes, edges, simLoad, simSpeed, errorMode } = state;
  if (nodes.length === 0) return;

  // Entry node: browser/mobile if present, otherwise first node.
  const entry =
    nodes.find((n) => ["browser", "mobile"].includes(n.data.type)) ?? nodes[0];
  if (!entry) return;

  // Walk graph until we either hit a load balancer with servers, or a server directly.
  const outFrom = (id: string) =>
    edges.filter((e) => e.source === id).map((e) => nodes.find((n) => n.id === e.target)!).filter(Boolean);

  const isServer = (n: Node<NodeData>) =>
    n.data.type === "server" || n.data.type === "microservice";

  // Build initial path prefix until first LB or first server.
  const prefix: string[] = [entry.id];
  const visited = new Set<string>([entry.id]);
  let cursor: Node<NodeData> = entry;
  let targetServers: Node<NodeData>[] = [];
  let lbNode: Node<NodeData> | null = null;

  while (true) {
    const outs = outFrom(cursor.id).filter((n) => !visited.has(n.id));
    if (outs.length === 0) break;
    // Prefer load balancer path
    const lb = outs.find((n) => n.data.type === "loadbalancer");
    const next = lb ?? outs[0];
    prefix.push(next.id);
    visited.add(next.id);
    cursor = next;
    if (next.data.type === "loadbalancer") {
      lbNode = next;
      targetServers = outFrom(next.id).filter(isServer);
      break;
    }
    if (isServer(next)) {
      targetServers = [next];
      break;
    }
  }

  if (targetServers.length === 0) {
    // No server in topology — just log and stop
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

  // Initialize node stats
  const initialStats: Record<string, NodeStat> = {};
  nodes.forEach((n) => {
    initialStats[n.id] = {
      active: 0,
      queue: 0,
      succeeded: 0,
      queued: 0,
      failed: 0,
      peakActive: 0,
      peakQueue: 0,
      capacity: capacityFor(n.data.type),
      shaking: false,
    };
  });

  const distribution: LBDistribution = {
    serverIds: targetServers.map((s) => s.id),
    counts: Object.fromEntries(targetServers.map((s) => [s.id, 0])),
  };
  const lbDistribution: Record<string, LBDistribution> = {};
  if (lbNode) lbDistribution[lbNode.id] = distribution;

  set({
    simStatus: "running",
    log: [],
    bubble: null,
    nodeStats: initialStats,
    lbDistribution,
    _timers: [],
  });

  get().pushLog({
    from: entry.data.label,
    to: lbNode ? lbNode.data.label : targetServers[0].data.label,
    method: "LOAD",
    status: "…",
    latency: 0,
    note: `Disparando ${simLoad} requisições ${
      lbNode ? `via ${lbNode.data.label} → ${targetServers.length} servidor(es)` : `direto para ${targetServers[0].data.label}`
    }`,
    level: "info",
  });

  const dispatchSpacing = SPEED_MS[simSpeed];
  const timers: number[] = [];
  let completed = 0;

  const forceError = errorMode !== "none";

  const onRequestFinished = () => {
    completed += 1;
    if (completed >= simLoad) {
      // Summary
      const s = get();
      const totalSucc = Object.values(s.nodeStats).reduce((a, b) => a + b.succeeded, 0);
      const totalFail = Object.values(s.nodeStats).reduce((a, b) => a + b.failed, 0);
      const serverCount = targetServers.length;
      const summary =
        totalFail === 0
          ? `${serverCount} servidor${serverCount > 1 ? "es em paralelo" : " sozinho"} suportou ${totalSucc} requisições sem falhas.`
          : `${serverCount} servidor${serverCount > 1 ? "es" : ""} processou ${totalSucc} req com sucesso e ${totalFail} erro(s) 503 por sobrecarga.`;
      s.pushLog({
        from: "—",
        to: "—",
        method: "LOAD",
        status: totalFail === 0 ? 200 : 503,
        latency: 0,
        note: summary,
        level: "summary",
      });
      set({ simStatus: "done", bubble: null });
    }
  };

  const finishOn = (serverId: string, wasQueued: boolean, baseLatency: number) => {
    const t = window.setTimeout(() => {
      const st = get().nodeStats[serverId];
      if (!st) return;
      const nextStats = {
        ...get().nodeStats,
        [serverId]: {
          ...st,
          active: Math.max(0, st.active - 1),
          succeeded: st.succeeded + 1,
          shaking: st.queue > st.capacity,
        },
      };
      set({ nodeStats: nextStats });
      const server = nodes.find((n) => n.id === serverId)!;
      get().pushLog({
        from: lbNode?.data.label ?? entry.data.label,
        to: server.data.label,
        method: "GET",
        status: 200,
        latency: Math.round(baseLatency),
        note: wasQueued ? "processada após espera na fila" : undefined,
        level: "info",
      });
      // try to pull one from queue
      tryDrainQueue(serverId);
      onRequestFinished();
    }, baseLatency);
    timers.push(t);
    set({ _timers: [...get()._timers, t] });
  };

  const tryDrainQueue = (serverId: string) => {
    const st = get().nodeStats[serverId];
    if (!st || st.queue <= 0 || st.active >= st.capacity) return;
    // dequeue one
    const overflowFactor = 1 + (st.queue / st.capacity) * 1.5;
    const latency = (60 + Math.random() * 60) * overflowFactor;
    const next = {
      ...get().nodeStats,
      [serverId]: {
        ...st,
        active: st.active + 1,
        queue: st.queue - 1,
        peakActive: Math.max(st.peakActive, st.active + 1),
      },
    };
    set({ nodeStats: next });
    finishOn(serverId, true, latency);
  };

  for (let i = 0; i < simLoad; i++) {
    const server = targetServers[i % targetServers.length];
    distribution.counts[server.id] = (distribution.counts[server.id] ?? 0) + 1;

    const t = window.setTimeout(() => {
      const s = get();
      if (s.simStatus !== "running") return;
      const st = s.nodeStats[server.id];
      if (!st) return;

      // bubble on server occasionally
      if (i % Math.max(1, Math.floor(simLoad / 6)) === 0) {
        set({
          bubble: {
            nodeId: server.id,
            text: `req #${i + 1} → ${server.data.label}`,
          },
        });
      }

      if (st.active < st.capacity) {
        // process immediately
        const latency = 40 + Math.random() * 80;
        set({
          nodeStats: {
            ...s.nodeStats,
            [server.id]: {
              ...st,
              active: st.active + 1,
              peakActive: Math.max(st.peakActive, st.active + 1),
            },
          },
        });
        finishOn(server.id, false, latency);
      } else if (st.queue < st.capacity) {
        // enqueue
        set({
          nodeStats: {
            ...s.nodeStats,
            [server.id]: {
              ...st,
              queue: st.queue + 1,
              queued: st.queued + 1,
              peakQueue: Math.max(st.peakQueue, st.queue + 1),
            },
          },
        });
        get().pushLog({
          from: lbNode?.data.label ?? entry.data.label,
          to: server.data.label,
          method: "GET",
          status: 202,
          latency: 0,
          note: `enfileirada (fila: ${st.queue + 1}/${st.capacity})`,
          level: "warn",
        });
        // note: it will be drained when a slot frees, which calls onRequestFinished then.
      } else {
        // overload → 503, or configured error type
        const isTimeout = forceError && errorMode === "timeout";
        const errStatus = isTimeout ? 408 : 503;
        set({
          nodeStats: {
            ...s.nodeStats,
            [server.id]: {
              ...st,
              failed: st.failed + 1,
              shaking: true,
            },
          },
        });
        get().pushLog({
          from: lbNode?.data.label ?? entry.data.label,
          to: server.data.label,
          method: "GET",
          status: errStatus,
          latency: 0,
          note: isTimeout
            ? "timeout — servidor sobrecarregado"
            : "503 — capacidade excedida",
          level: "error",
        });
        onRequestFinished();
      }
    }, i * dispatchSpacing);
    timers.push(t);
  }

  set({ _timers: [...get()._timers, ...timers] });
}
