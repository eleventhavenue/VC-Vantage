// components/FloatingElements.tsx

"use client"

import { motion } from "framer-motion"

export default function FloatingElements() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Glowing orbs */}
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-emerald-500/20 blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          top: "20%",
          left: "10%",
        }}
      />
      <motion.div
        className="absolute w-96 h-96 rounded-full bg-emerald-600/10 blur-3xl"
        animate={{
          x: [0, -70, 0],
          y: [0, 100, 0],
        }}
        transition={{
          duration: 25,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          top: "40%",
          right: "15%",
        }}
      />

      {/* Particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-emerald-400/30 rounded-full"
          animate={{
            y: [0, -1000],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Number.POSITIVE_INFINITY,
            delay: Math.random() * 5,
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: "100%",
          }}
        />
      ))}
    </div>
  )
}

