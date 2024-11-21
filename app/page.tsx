// app/page.tsx

'use client'

import Link from 'next/link' // Import Next.js's Link component
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, BarChart3, Briefcase, LineChart, Search, Zap } from "lucide-react"

export default function Component() {
  // Define state variables
  const [email, setEmail] = useState('')
  const router = useRouter()

  // Handle form submission
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle the email submission (e.g., save to state or send to an API)
    // Then navigate to the signup page
    router.push('/auth')
  }
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="/">
          <MountainIcon className="h-6 w-6" />
          <span className="sr-only">VC Vantage</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/features" className="text-sm font-medium hover:underline underline-offset-4" >
            Features
          </Link>
          <Link href="/pricing" className="text-sm font-medium hover:underline underline-offset-4" >
            Pricing
          </Link>
          <Link href="/about" className="text-sm font-medium hover:underline underline-offset-4" >
            About
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:underline underline-offset-4" >
            Contact
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Your Competitive Edge in Venture Capital
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  VC Vantage is the AI-powered research tool that transforms due diligence with fast, accurate, and
                  comprehensive insights.
                </p>
              </div>
              <div className="space-x-4">
                {/* Wrap the "Get Started" button with Link */}
                <Link href="/auth">
                  <Button>Get Started</Button>
                </Link>
                <Button variant="outline">Learn More</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Key Features</h2>
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
                <Zap className="h-8 w-8 text-blue-500" />
                <h3 className="text-xl font-bold">AI-Driven Insights</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Harness the power of AI to uncover hidden opportunities and risks.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
                <LineChart className="h-8 w-8 text-blue-500" />
                <h3 className="text-xl font-bold">Comprehensive Analytics</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Deep dive into market trends, financial metrics, and competitive landscapes.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
                <Search className="h-8 w-8 text-blue-500" />
                <h3 className="text-xl font-bold">Smart Search</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Find relevant information quickly with our intelligent search capabilities.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Redefining Due Diligence Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Redefining Due Diligence for Venture Capital
                </h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  VC Vantage combines cutting-edge AI technology with comprehensive data analysis to provide you with
                  unparalleled insights. Make informed decisions faster and stay ahead of the competition.
                </p>
              </div>
              <div className="flex items-center justify-center">
                <BarChart3 className="h-full w-full text-blue-500" />
              </div>
            </div>
          </div>
        </section>

        {/* Trusted by Leading VC Firms Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">
              Trusted by Leading VC Firms
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 items-center">
              <Briefcase className="h-12 w-12 mx-auto text-gray-500" />
              <Briefcase className="h-12 w-12 mx-auto text-gray-500" />
              <Briefcase className="h-12 w-12 mx-auto text-gray-500" />
              <Briefcase className="h-12 w-12 mx-auto text-gray-500" />
            </div>
          </div>
        </section>

        {/* Final Section with Form */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Ready to Transform Your VC Research?
                </h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Join the future of venture capital research. Sign up now for a free trial and experience the power of
                  VC Vantage.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                {/* Single Form Element */}
                <form onSubmit={handleEmailSubmit} className="flex space-x-2">
                  <Input
                    className="max-w-lg flex-1"
                    placeholder="Enter your email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Button type="submit">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 VC Vantage. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}

function MountainIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  )
}

