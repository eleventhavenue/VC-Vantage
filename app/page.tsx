//app/page.tsx

"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import FloatingElements from "@/components/FloatingElements" // Import the component

export default function Page() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const controls = useAnimation()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Email submitted:", email)
    setIsSubmitted(true)
    setTimeout(() => setIsSubmitted(false), 3000)
  }

  useEffect(() => {
    controls.start({
      y: [0, -10, 0],
      transition: { duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
    })
  }, [controls])

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-slate-50 to-stone-50">
      {/* Mountain Background */}
      <div className="absolute inset-0 overflow-hidden">
        <svg
          className="absolute w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 800"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="mountain-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)" />
              <stop offset="100%" stopColor="rgba(16, 185, 129, 0.1)" />
            </linearGradient>
          </defs>
          <g className="mountains">
            <path d="M0 800L360 500L720 650L1080 400L1440 800" fill="url(#mountain-gradient)">
              <animate
                attributeName="d"
                values="
                  M0 800L360 500L720 650L1080 400L1440 800;
                  M0 800L360 600L720 500L1080 600L1440 800;
                  M0 800L360 500L720 650L1080 400L1440 800"
                dur="20s"
                repeatCount="indefinite"
              />
            </path>
            <path d="M0 800L360 600L720 700L1080 550L1440 800" fill="url(#mountain-gradient)" opacity="0.7">
              <animate
                attributeName="d"
                values="
                  M0 800L360 600L720 700L1080 550L1440 800;
                  M0 800L360 650L720 600L1080 700L1440 800;
                  M0 800L360 600L720 700L1080 550L1440 800"
                dur="25s"
                repeatCount="indefinite"
              />
            </path>
            <path d="M0 800L360 700L720 800L1080 700L1440 800" fill="url(#mountain-gradient)" opacity="0.5">
              <animate
                attributeName="d"
                values="
                  M0 800L360 700L720 800L1080 700L1440 800;
                  M0 800L360 750L720 700L1080 750L1440 800;
                  M0 800L360 700L720 800L1080 700L1440 800"
                dur="30s"
                repeatCount="indefinite"
              />
            </path>
          </g>
        </svg>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-4 py-6">
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src="/vcvantage.png"
            alt="VC Vantage Logo"
            width={120}
            height={40}
          />
        </motion.div>
      </nav>

      {/* Main Content - Updated to match the new structure */}
      <main className="relative z-10 container mx-auto px-4 pt-20 pb-20 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-center max-w-3xl mx-auto">
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
  Giving Angel Investors the<br />
  <span className="text-blue-600">VC Vantage</span>
</h1>
            <p className="text-xl text-gray-600">
              Stay ahead of the curve. Sign up for exclusive updates on our beta launch
              and the latest in AI-powered investment insights.
            </p>
          </motion.div>

          <motion.div
            className="w-full max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
              <Input
                type="email"
                placeholder="Email address"
                className="h-12 bg-white/90 backdrop-blur-sm text-lg flex-grow"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button 
                type="submit" 
                size="lg" 
                className="h-12 px-8 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full"
              >
                Join the Waitlist
              </Button>
            </form>
            <AnimatePresence>
              {isSubmitted && (
                <motion.p
                  className="text-green-600 mt-2 text-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  Thank you for joining our waitlist!
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold text-blue-600 mb-4 text-center">Intelligent Investing</h2>
          <p className="text-slate-700 text-center">
            Diversifying your investment portfolio or wealth is already an intelligent action. But why stop there? VC
            Vantage elevates your diversification strategy with AI-powered due diligence and comprehensive insights,
            ensuring each investment not only broadens your portfolio but also maximizes growth and minimizes risk.
          </p>
        </motion.div>
      </main>

      {/* Floating Elements Animation */}
      <FloatingElements /> {/* Use the FloatingElements component here */}
    </div>
  )
}
