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
  method: HttpMethod;
  status: number | "…";
  latency: number;
  note?: string;
  level: "info" | "error";
};

export type SimSpeed = "slow" | "normal" | "fast";
export type SimStatus = "idle" | "running" | "paused" | "done";

type State = {
  nodes: Node<NodeData>[];
  edges: Edge<EdgeData>[];
  selectedId: string | null;
  simStatus: SimStatus;
  simSpeed: SimSpeed;
  stepMode: boolean;
  errorMode: "none" | "500" | "timeout";
  currentEdgeIdx: number;
  path: string[]; // node ids in order
  log: LogEntry[];
  bubble: { nodeId: string; text: string } | null;

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
  setStepMode: (b: boolean) => void;
  setErrorMode: (e: "none" | "500" | "timeout") => void;
  startSim: () => void;
  stopSim: () => void;
  advanceStep: () => void;
  _tickInternals: {
    timer: number | null;
  };
  clearLog: () => void;
  pushLog: (l: Omit<LogEntry, "id" | "ts">) => void;
  setBubble: (b: { nodeId: string; text: string } | null) => void;
  exportJSON: () => string;
};

const SPEED_MS: Record<SimSpeed, number> = { slow: 1600, normal: 900, fast: 400 };

export const useSim = create<State>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      selectedId: null,
      simStatus: "idle",
      simSpeed: "normal",
      stepMode: false,
      errorMode: "none",
      currentEdgeIdx: -1,
      path: [],
      log: [],
      bubble: null,
      _tickInternals: { timer: null },

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
      setStepMode: (b) => set({ stepMode: b }),
      setErrorMode: (e) => set({ errorMode: e }),

      startSim: () => {
        const { nodes, edges } = get();
        if (nodes.length === 0 || edges.length === 0) return;
        // build path: start from first "client" node, traverse first outgoing edge each time
        const clientNode =
          nodes.find((n) => ["browser", "mobile"].includes(n.data.type)) ?? nodes[0];
        const visited = new Set<string>();
        const path: string[] = [clientNode.id];
        visited.add(clientNode.id);
        let current = clientNode.id;
        while (true) {
          const next = edges.find((e) => e.source === current && !visited.has(e.target));
          if (!next) break;
          path.push(next.target);
          visited.add(next.target);
          current = next.target;
        }
        if (path.length < 2) return;
        set({
          simStatus: "running",
          path,
          currentEdgeIdx: 0,
          log: [],
          bubble: null,
        });
        get().pushLog({
          from: "—",
          to: clientNode.data.label,
          method: "GET",
          status: "…",
          latency: 0,
          note: "Iniciando simulação",
          level: "info",
        });
        scheduleNext(get, set);
      },
      stopSim: () => {
        const t = get()._tickInternals.timer;
        if (t) window.clearTimeout(t);
        set({
          simStatus: "idle",
          currentEdgeIdx: -1,
          path: [],
          bubble: null,
          _tickInternals: { timer: null },
        });
      },
      advanceStep: () => {
        if (get().simStatus !== "paused") return;
        set({ simStatus: "running" });
        scheduleNext(get, set);
      },
      clearLog: () => set({ log: [] }),
      pushLog: (l) =>
        set({
          log: [...get().log, { ...l, id: nanoid(6), ts: Date.now() }].slice(-100),
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

function scheduleNext(get: () => State, set: (partial: Partial<State>) => void) {
  const state = get();
  const { path, currentEdgeIdx, simSpeed, stepMode, errorMode, nodes } = state;
  const delay = SPEED_MS[simSpeed];
  const total = path.length - 1;

  if (currentEdgeIdx >= total) {
    // done
    set({ simStatus: "done", bubble: null, currentEdgeIdx: -1 });
    return;
  }

  const timer = window.setTimeout(() => {
    const s = get();
    const fromNode = nodes.find((n) => n.id === s.path[s.currentEdgeIdx]);
    const toNode = nodes.find((n) => n.id === s.path[s.currentEdgeIdx + 1]);
    const edge = s.edges.find(
      (e) => e.source === fromNode?.id && e.target === toNode?.id,
    );
    if (!fromNode || !toNode) {
      set({ simStatus: "done" });
      return;
    }
    const method = edge?.data?.method ?? "GET";
    const isLast = s.currentEdgeIdx === total - 1;
    const shouldError =
      isLast && errorMode !== "none" ? true : false;
    const status: number | "…" =
      shouldError && errorMode === "500"
        ? 500
        : shouldError && errorMode === "timeout"
        ? 408
        : 200;
    const latency = Math.floor(20 + Math.random() * (simSpeed === "slow" ? 120 : 60));

    s.pushLog({
      from: fromNode.data.label,
      to: toNode.data.label,
      method,
      status,
      latency,
      note: shouldError
        ? errorMode === "timeout"
          ? "Timeout — o serviço não respondeu a tempo"
          : "Erro 500 — falha interna no serviço"
        : undefined,
      level: shouldError ? "error" : "info",
    });

    // bubble on target node
    import("./catalog").then(({ getComponent }) => {
      const def = getComponent(toNode.data.type);
      set({
        bubble: { nodeId: toNode.id, text: def?.simMessage ?? toNode.data.label },
      });
    });

    const nextIdx = s.currentEdgeIdx + 1;
    set({ currentEdgeIdx: nextIdx });

    if (shouldError) {
      window.setTimeout(() => set({ simStatus: "done", bubble: null }), delay);
      return;
    }

    if (nextIdx >= total) {
      window.setTimeout(() => set({ simStatus: "done", bubble: null }), delay);
      return;
    }

    if (stepMode) {
      set({ simStatus: "paused" });
      return;
    }
    scheduleNext(get, set);
  }, delay);

  set({ _tickInternals: { timer } });
}
