import { Handle, Position, type NodeProps } from "reactflow";
import { COLOR_MAP } from "@/lib/simulator/catalog";
import { useSim, type NodeData } from "@/lib/simulator/store";
import { AnimatePresence, motion } from "framer-motion";

export function NodeCard({ id, data, selected }: NodeProps<NodeData>) {
  const c = COLOR_MAP[data.color] ?? COLOR_MAP.sky;
  const bubble = useSim((s) => (s.bubble?.nodeId === id ? s.bubble : null));

  return (
    <div className="relative" style={{ transform: `rotate(${data.rotation}deg)` }}>
      <AnimatePresence>
        {bubble && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.9 }}
            className="absolute -top-16 left-1/2 z-20 w-56 -translate-x-1/2 rounded-2xl border-2 border-black bg-white px-3 py-2 text-[13px] shadow-[3px_3px_0_#000]"
            style={{ filter: "url(#rough)", fontFamily: "'Kalam', cursive" }}
          >
            {bubble.text}
            <div
              className="absolute -bottom-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-black bg-white"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="relative flex h-[92px] w-[180px] flex-col items-center justify-center gap-1 rounded-2xl border-[2.5px] border-black px-3 text-center transition-transform"
        style={{
          background: c.bg,
          filter: "url(#rough)",
          boxShadow: selected ? "5px 5px 0 #000" : "3px 3px 0 #000",
          fontFamily: "'Kalam', cursive",
        }}
      >
        <div className="text-3xl leading-none">{data.icon}</div>
        <div className="text-[15px] font-bold leading-tight text-black">{data.label}</div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: "#000",
          width: 10,
          height: 10,
          border: "2px solid #fff",
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: "#000",
          width: 10,
          height: 10,
          border: "2px solid #fff",
        }}
      />
    </div>
  );
}
