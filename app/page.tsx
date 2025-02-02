//app/page.tsx

"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import FloatingElements from "@/components/floating-elements"
import { Mountains } from "@/components/mountains"
import { ChevronDown } from "lucide-react"
import type React from "react" // Ensure React types are available

export default function Page() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const controls = useAnimation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        setEmail("")
        setErrorMessage("")
        // Hide the success message after 3 seconds
        setTimeout(() => setIsSubmitted(false), 3000)
      } else {
        // If there's an error from the API, display it
        setErrorMessage(data.message || "Something went wrong.")
      }
    } catch (error) {
      console.error("Error submitting email:", error)
      setErrorMessage("Something went wrong. Please try again.")
    }
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
      {/* Hero Section */}
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <Mountains />

        {/* Ambient Light Effects */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-emerald-100/30 mix-blend-soft-light" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-teal-100/20 mix-blend-overlay" />

        {/* Navigation */}
        <nav className="relative z-10 container mx-auto px-6 py-4">
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src="/vcvantage.png"
              alt="VC Vantage Logo"
              width={140}
              height={45}
              className="object-contain"
            />
            <Button variant="ghost" className="text-emerald-800 hover:text-emerald-900 hover:bg-emerald-100/50">
              Contact Us
            </Button>
          </motion.div>
        </nav>

        {/* Hero Content */}
        <main className="relative z-10 container mx-auto px-6 pt-20 pb-32 flex flex-col items-center justify-center min-h-[calc(100vh-96px)]">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              className="mb-12 space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold text-emerald-950 leading-tight">
  Giving Angel Investors the <br />
  <span className="relative">
    <span className="relative z-10 bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
      VC Vantage
    </span>
    <motion.span
      className="absolute inset-0 bg-gradient-to-r from-emerald-200 to-teal-200 blur-2xl opacity-30"
      animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
    />
  </span>
</h1>

              <p className="text-lg md:text-2xl text-emerald-800/90 max-w-3xl mx-auto">
                Stay ahead of the curve with AI-powered investment insights and exclusive updates on our beta
                launch.
              </p>
            </motion.div>

            <motion.div
              className="w-full max-w-2xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow relative group">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    className="h-14 bg-white/80 backdrop-blur-sm text-lg border-emerald-200 focus:border-emerald-400 rounded-xl pl-6"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-200 to-teal-200 opacity-0 group-hover:opacity-20 transition-opacity -z-10" />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="h-14 px-8 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300"
                >
                  Join the Waitlist
                </Button>
              </form>
              <AnimatePresence>
                {isSubmitted && (
                  <motion.p
                    className="text-emerald-600 mt-4 text-lg"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    Thank you for joining our waitlist! 🎉
                  </motion.p>
                )}
                {errorMessage && (
                  <motion.p
                    className="text-red-600 mt-4 text-lg"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {errorMessage}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.button
            onClick={scrollToContent}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-emerald-600 hover:text-emerald-500 transition-colors"
            animate={controls}
          >
            <ChevronDown size={32} />
          </motion.button>
        </main>

        <FloatingElements />
      </div>

      {/* Content Section */}
      <section className="bg-gradient-to-b from-emerald-50 to-white py-24">
        <div className="container mx-auto px-6">
          <motion.div
            className="max-w-4xl mx-auto space-y-16"
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
            {/* Feature Cards */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity transform group-hover:scale-105 duration-500" />
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl h-full border border-emerald-100">
                  <h3 className="text-2xl font-bold text-emerald-950 mb-4">AI-Powered Due Diligence</h3>
                  <p className="text-emerald-800">
                    Our advanced AI algorithms analyze vast amounts of data to provide comprehensive insights into
                    potential investments, helping you make informed decisions with confidence.
                  </p>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-200 to-cyan-200 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity transform group-hover:scale-105 duration-500" />
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl h-full border border-teal-100">
                  <h3 className="text-2xl font-bold text-emerald-950 mb-4">Risk Minimization</h3>
                  <p className="text-emerald-800">
                    Diversify your portfolio intelligently with our AI-driven risk assessment tools, ensuring optimal
                    balance between growth potential and risk management.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Section 
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl opacity-50" />
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {[
                    { value: "500+", label: "Active Investors" },
                    { value: "$50M+", label: "Total Investments" },
                    { value: "95%", label: "Success Rate" },
                    { value: "24/7", label: "AI Analysis" },
                  ].map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-3xl font-bold text-emerald-600 mb-2">{stat.value}</div>
                      <div className="text-emerald-800">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>*/}
          </motion.div>
        </div>
      </section>
    </div>
  )
}
