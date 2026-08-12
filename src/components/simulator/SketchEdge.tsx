import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "reactflow";
import { useSim, type EdgeData } from "@/lib/simulator/store";
import { useIsMobile } from "@/hooks/use-mobile";

export function SketchEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<EdgeData>) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    curvature: 0.35,
  });

  const method = data?.method ?? "GET";
  const simStatus = useSim((s) => s.simStatus);
  const speed = useSim((s) => s.simSpeed);
  const isActive = simStatus === "running";
  const dur = speed === "slow" ? 1.4 : speed === "fast" ? 0.4 : 0.8;
  const isMobile = useIsMobile();

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: "#111",
          strokeWidth: selected ? 3 : 2,
          strokeLinecap: "round",
          filter: isMobile ? undefined : "url(#rough)",
          fill: "none",
        }}
        markerEnd="url(#sketch-arrow)"
      />
      {isActive && (
        <circle
          r={isMobile ? 5 : 7}
          fill="#F97316"
          stroke="#111"
          strokeWidth={2}
          style={isMobile ? undefined : { filter: "drop-shadow(2px 2px 0 rgba(0,0,0,0.35))" }}
        >
          <animateMotion
            dur={`${dur}s`}
            repeatCount="indefinite"
            path={path}
          />
        </circle>
      )}
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
            fontFamily: "'Kalam', cursive",
          }}
          className="nodrag nopan"
        >
          <MethodPill id={id} method={method} />
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

function MethodPill({ id, method }: { id: string; method: string }) {
  const setMethod = useSim((s) => s.setEdgeMethod);
  const select = useSim((s) => s.select);
  const colors: Record<string, string> = {
    GET: "#BBF7D0",
    POST: "#FEF3C7",
    PUT: "#DBEAFE",
    DELETE: "#FCA5A5",
    WS: "#E9D5FF",
    EVENT: "#FBCFE8",
  };
  return (
    <select
      value={method}
      onChange={(e) => setMethod(id, e.target.value as never)}
      onClick={() => select(id)}
      className="cursor-pointer rounded-full border-2 border-black px-2 py-0.5 text-[12px] font-bold shadow-[2px_2px_0_#000]"
      style={{ background: colors[method] ?? "#fff", filter: "url(#rough)" }}
    >
      {["GET", "POST", "PUT", "DELETE", "WS", "EVENT"].map((m) => (
        <option key={m} value={m}>
          {m}
        </option>
      ))}
    </select>
  );
}
