import { Handle, Position, type NodeProps } from "reactflow";
import { COLOR_MAP } from "@/lib/simulator/catalog";
import { useSim, type NodeData } from "@/lib/simulator/store";
import { AnimatePresence, motion } from "framer-motion";
export function NodeCard({ id, data, selected }: NodeProps<NodeData>) {
  const c = COLOR_MAP[data.color] ?? COLOR_MAP.sky;
  const bubble = useSim((s) => (s.bubble?.nodeId === id ? s.bubble : null));
  const stat = useSim((s) => s.nodeStats[id]);
  const simStatus = useSim((s) => s.simStatus);
  const rough = "url(#rough)";

  const hasCapacity =
    (data.type === "server" || data.type === "microservice") && stat;
  const load = hasCapacity ? stat.active / stat.capacity : 0;
  const pct = Math.min(1, load);
  const barColor =
    load >= 1 ? "#EF4444" : load >= 0.7 ? "#F59E0B" : "#22C55E";
  const overload = hasCapacity && stat.queue > stat.capacity;
  const shaking = simStatus === "running" && overload;

  return (
    <motion.div
      className="relative"
      animate={
        shaking
          ? { x: [0, -2, 2, -2, 2, 0], rotate: [data.rotation, data.rotation - 1, data.rotation + 1, data.rotation] }
          : { rotate: data.rotation, x: 0 }
      }
      transition={shaking ? { repeat: Infinity, duration: 0.35 } : { duration: 0.2 }}
    >
      <AnimatePresence>
        {bubble && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.9 }}
            className="absolute -top-16 left-1/2 z-20 w-48 -translate-x-1/2 rounded-2xl border-2 border-black bg-white px-3 py-2 text-[12px] shadow-[3px_3px_0_#000] md:w-56 md:text-[13px]"
            style={{ filter: rough, fontFamily: "'Kalam', cursive" }}
          >
            {bubble.text}
            <div className="absolute -bottom-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-black bg-white" />
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="relative flex h-[84px] w-[150px] flex-col items-center justify-center gap-1 rounded-2xl border-[2.5px] border-black px-2 text-center md:h-[100px] md:w-[180px] md:px-3"
        style={{
          background: overload ? "#FCA5A5" : c.bg,
          filter: rough,
          boxShadow: selected ? "5px 5px 0 #000" : "3px 3px 0 #000",
          fontFamily: "'Kalam', cursive",
        }}
      >
        <div className="text-2xl leading-none md:text-3xl">{data.icon}</div>
        <div className="text-[13px] font-bold leading-tight text-black md:text-[15px]">{data.label}</div>

        {hasCapacity && (
          <div className="mt-1 w-[110px] md:w-[140px]">
            <div className="h-2 w-full overflow-hidden rounded-full border border-black bg-white/70">
              <div
                className="h-full transition-all"
                style={{ width: `${pct * 100}%`, background: barColor }}
              />
            </div>
            <div className="mt-0.5 flex items-center justify-between text-[10px] font-bold text-black/70">
              <span>{stat.active}/{stat.capacity}</span>
              {stat.failed > 0 && <span className="text-red-700">✗{stat.failed}</span>}
            </div>
          </div>
        )}
      </div>

      {hasCapacity && stat.queue > 0 && (
        <div className="absolute -right-3 top-0 flex translate-x-full flex-col items-start gap-0.5">
          <div className="text-[10px] font-bold text-black/70">fila</div>
          <div className="flex flex-wrap gap-0.5" style={{ maxWidth: 40 }}>
            {Array.from({ length: Math.min(stat.queue, 12) }).map((_, i) => (
              <span
                key={i}
                className="inline-block h-2 w-2 rounded-full border border-black"
                style={{ background: stat.queue > stat.capacity ? "#EF4444" : "#F59E0B" }}
              />
            ))}
            {stat.queue > 12 && (
              <span className="text-[10px] font-bold text-black/70">+{stat.queue - 12}</span>
            )}
          </div>
        </div>
      )}

      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "#000", width: 10, height: 10, border: "2px solid #fff" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: "#000", width: 10, height: 10, border: "2px solid #fff" }}
      />
    </motion.div>
  );
}
