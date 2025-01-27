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
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center bg-white shadow-md">
        <Link className="flex items-center justify-center" href="/">
          <MountainIcon className="h-6 w-6 text-blue-500" />
          <span className="ml-2 text-xl font-bold text-blue-600">VC Vantage</span> {/* Made visible */}
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/features" className="text-sm font-medium text-gray-700 hover:underline underline-offset-4">
            Features
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-gray-700 hover:underline underline-offset-4">
            Pricing
          </Link>
          <Link href="/about" className="text-sm font-medium text-gray-700 hover:underline underline-offset-4">
            About
          </Link>
          <Link href="/contact" className="text-sm font-medium text-gray-700 hover:underline underline-offset-4">
            Contact
          </Link>
        </nav>
      </header>
      
      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter text-gray-900">
                  Your Competitive Edge in Venture Capital
                </h1>
                <p className="mx-auto max-w-3xl text-lg text-gray-600 md:text-xl">
                  VC Vantage is the AI-powered research tool that transforms due diligence with fast, accurate, and
                  comprehensive insights.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Wrap the "Get Started" button with Link */}
                <Link href="/auth">
                  <Button className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200">
                    Sign Up
                  </Button>
                </Link>
                <Button variant="outline" className="flex items-center justify-center px-6 py-3 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition duration-200">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Key Features</h2>
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                <Zap className="h-8 w-8 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800">AI-Driven Insights</h3>
                <p className="mt-2 text-center text-gray-600">
                  Harness the power of AI to uncover hidden opportunities and risks.
                </p>
              </div>
              <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                <LineChart className="h-8 w-8 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800">Comprehensive Analytics</h3>
                <p className="mt-2 text-center text-gray-600">
                  Deep dive into market trends, financial metrics, and competitive landscapes.
                </p>
              </div>
              <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                <Search className="h-8 w-8 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800">Smart Search</h3>
                <p className="mt-2 text-center text-gray-600">
                  Find relevant information quickly with our intelligent search capabilities.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Redefining Due Diligence Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Redefining Due Diligence for Venture Capital
                </h2>
                <p className="text-lg text-gray-600">
                  VC Vantage combines cutting-edge AI technology with comprehensive data analysis to provide you with
                  unparalleled insights. Make informed decisions faster and stay ahead of the competition.
                </p>
              </div>
              <div className="flex justify-center">
                <BarChart3 className="h-64 w-full text-blue-500" />
              </div>
            </div>
          </div>
        </section>

        {/* Trusted by Leading VC Firms Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
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
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900">
                  Ready to Transform Your VC Research?
                </h2>
                <p className="max-w-3xl text-lg text-gray-600">
                  Join the future of venture capital research. Sign up now for a free trial and experience the power of
                  VC Vantage.
                </p>
              </div>
              <div className="w-full max-w-sm">
                {/* Single Form Element */}
                <form onSubmit={handleEmailSubmit} className="flex space-x-2">
                  <Input
                    className="flex-1"
                    placeholder="Enter your email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Button type="submit" className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 VC Vantage. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs text-gray-700 hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs text-gray-700 hover:underline underline-offset-4" href="#">
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
