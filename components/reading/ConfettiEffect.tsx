"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const COLORS = ["#ff5700", "#ffab40", "#ff8a65", "#4fc3f7", "#81c784", "#ffd54f", "#e57373"];
const COUNT = 60;

export default function ConfettiEffect() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 4500);
    return () => clearTimeout(t);
  }, []);

  const [particles] = useState(() =>
    Array.from({ length: COUNT }, (_, i) => ({
      id: i,
      x: 0,
      y: 0,
      color: COLORS[i % COLORS.length],
      angle: (360 / COUNT) * i + Math.random() * 20,
      size: 6 + Math.random() * 8,
      duration: 2 + Math.random() * 1.5,
      delay: Math.random() * 0.3,
    }))
  );

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: "0 0 4px rgba(0,0,0,0.2)",
          }}
          initial={{
            x: "-50%",
            y: "-50%",
            opacity: 1,
            scale: 1,
          }}
          animate={{
            x: `calc(-50% + ${Math.cos((p.angle * Math.PI) / 180) * 600}px)`,
            y: `calc(-50% + ${Math.sin((p.angle * Math.PI) / 180) * 600 + 200}px)`,
            opacity: 0,
            scale: 0.2,
            rotate: 360 * 2,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}
