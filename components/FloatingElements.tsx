// components/FloatingElements.tsx

"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

const FloatingElements = () => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    // Set initial window size
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    })

    // Update window size on resize
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute hidden md:block w-4 h-4 bg-blue-500 rounded-full"
          initial={{
            x: windowSize.width ? Math.random() * windowSize.width : 0,
            y: windowSize.height ? Math.random() * windowSize.height : 0,
            scale: 0,
          }}
          animate={{
            x: windowSize.width ? Math.random() * windowSize.width : 0,
            y: windowSize.height ? Math.random() * windowSize.height : 0,
            scale: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 5 + 5,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  )
}

export default FloatingElements
