// app/page.tsx

"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronRight, LineChart, Shield, Zap } from "lucide-react"

export default function Page() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)
    setError(null)

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message)
        setEmail('')
      } else {
        setError(data.message || 'Something went wrong.')
      }
    } catch (err) {
      console.error('Error submitting sign-up:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-slate-50 to-stone-50">
      {/* Background Patterns */}
      <div className="absolute inset-0 bg-grid-slate-200 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/vcvantage.png"
            alt="VC Vantage Logo"
            width={120}
            height={40}
            className="h-8 w-auto"
          />
        </div>
        
      </nav>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            className="text-5xl md:text-6xl font-bold text-slate-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Giving Angel Investors the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
              VC Vantage
            </span>
          </motion.h1>

          <motion.p
            className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            VC Vantage is the AI-powered research tool that transforms due diligence with fast, accurate, and
            comprehensive insights.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="flex-1 sm:max-w-md flex flex-col gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="h-12 bg-white/80 backdrop-blur-sm border-slate-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {message && <p className="text-green-600">{message}</p>}
              {error && <p className="text-red-600">{error}</p>}
              <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Get Started'} <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </motion.div>

          {/* Feature Icons */}
          <motion.div
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm text-slate-600">AI-Powered Analysis</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                <LineChart className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm text-slate-600">Comprehensive Insights</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm text-slate-600">Risk Assessment</p>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Abstract Background Elements */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-1/2 -translate-y-1/2 right-0 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
    </div>
  )
}
