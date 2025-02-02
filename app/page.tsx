//app/page.tsx

"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown } from "lucide-react"
import FloatingElements from "@/components/FloatingElements"

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

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    })
  }

  useEffect(() => {
    controls.start({
      y: [0, -10, 0],
      transition: { duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
    })
  }, [controls])

  return (
    <div className="relative">
      {/* Hero Section with Parallax Effect */}
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900">
        {/* Enhanced Mountain Background */}
        <div className="absolute inset-0 overflow-hidden">
          <svg
            className="absolute w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 800"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="mountain-gradient-1" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(16, 185, 129, 0.2)" />
                <stop offset="100%" stopColor="rgba(6, 95, 70, 0.2)" />
              </linearGradient>
              <linearGradient id="mountain-gradient-2" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(5, 150, 105, 0.3)" />
                <stop offset="100%" stopColor="rgba(4, 120, 87, 0.3)" />
              </linearGradient>
              <linearGradient id="mountain-gradient-3" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(6, 78, 59, 0.4)" />
                <stop offset="100%" stopColor="rgba(6, 95, 70, 0.4)" />
              </linearGradient>
            </defs>
            <g className="mountains">
              <path d="M0 800L360 500L720 650L1080 400L1440 800" fill="url(#mountain-gradient-1)">
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
              <path d="M0 800L360 600L720 700L1080 550L1440 800" fill="url(#mountain-gradient-2)">
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
              <path d="M0 800L360 700L720 800L1080 700L1440 800" fill="url(#mountain-gradient-3)">
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
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src="/vcvantage.png"
              alt="VC Vantage Logo"
              width={120}
              height={40}
              className="brightness-200"
            />
            <Button variant="ghost" className="text-emerald-50 hover:text-emerald-200 hover:bg-emerald-900/50">
              Contact Us
            </Button>
          </motion.div>
        </nav>

        {/* Hero Content */}
        <main className="relative z-10 container mx-auto px-4 pt-20 pb-20 min-h-[calc(100vh-80px)] flex flex-col items-center justify-center">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              className="mb-12 space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold text-emerald-50 mb-6 leading-tight">
                Giving Angel Investors the <br /> <span className="text-emerald-400 block mt-2">VC Vantage</span>
              </h1>
              <p className="text-xl md:text-2xl text-emerald-100/90 max-w-2xl mx-auto">
                Stay ahead of the curve with AI-powered investment insights
              </p>
            </motion.div>

            <motion.div
              className="w-full max-w-xl mx-auto mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="h-14 bg-emerald-50/10 backdrop-blur-sm text-lg flex-grow border-emerald-600/30 text-emerald-50 placeholder:text-emerald-200/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button
                  type="submit"
                  size="lg"
                  className="h-14 px-8 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-md font-semibold"
                >
                  Join Waitlist
                </Button>
              </form>
              <AnimatePresence>
                {isSubmitted && (
                  <motion.p
                    className="text-emerald-400 mt-4 text-center"
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

          {/* Scroll Indicator */}
          <motion.button
            onClick={scrollToContent}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-emerald-400 hover:text-emerald-300 transition-colors"
            animate={controls}
          >
            <ChevronDown size={32} />
          </motion.button>
        </main>

        {/* Floating Elements */}
        <FloatingElements />
      </div>

      {/* Content Section */}
      <section className="bg-emerald-50 py-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto space-y-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-emerald-950 mb-6">
                Intelligent Investing
              </h2>
              <div className="w-24 h-1 bg-emerald-500 mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-white rounded-2xl p-8 shadow-xl shadow-emerald-100">
                <h3 className="text-2xl font-bold text-emerald-950 mb-4">
                  AI-Powered Due Diligence
                </h3>
                <p className="text-slate-600">
                  Our advanced AI algorithms analyze vast amounts of data to provide comprehensive insights into
                  potential investments, helping you make informed decisions with confidence.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-xl shadow-emerald-100">
                <h3 className="text-2xl font-bold text-emerald-950 mb-4">Risk Minimization</h3>
                <p className="text-slate-600">
                  Diversify your portfolio intelligently with our AI-driven risk assessment tools, ensuring optimal
                  balance between growth potential and risk management.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
