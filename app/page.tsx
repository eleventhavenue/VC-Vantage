// app/page.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import MountainIcon from "@/components/ui/MountainIcon" // Ensure this component exists

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return
    if (searchQuery.trim() === '') {
      alert('Please enter a valid search query.')
      return
    }
    setIsLoading(true)
    try {
      await router.push(`/results?query=${encodeURIComponent(searchQuery)}`)
    } catch (error) {
      console.error('Error performing search:', error)
      alert('An error occurred while performing the search. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center bg-white shadow-md">
        <Link href="/" className="flex items-center justify-center">
          <MountainIcon className="h-8 w-8 text-blue-500 mr-2" />
          <span className="text-lg font-semibold text-blue-500">VC Vantage</span>
        </Link>
        <nav className="ml-auto flex space-x-4 sm:space-x-6">
          <Link href="#features" className="text-sm font-medium text-gray-700 hover:text-blue-500 transition-colors duration-200">
            Features
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-gray-700 hover:text-blue-500 transition-colors duration-200">
            Pricing
          </Link>
          <Link href="#about" className="text-sm font-medium text-gray-700 hover:text-blue-500 transition-colors duration-200">
            About
          </Link>
          <Link href="#contact" className="text-sm font-medium text-gray-700 hover:text-blue-500 transition-colors duration-200">
            Contact
          </Link>
        </nav>
      </header>

       {/* Main Content */}
       <main className="flex-1 flex flex-col justify-center">
        <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 bg-gray-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-10 text-center">
              <div className="space-y-6 max-w-3xl mx-auto">
                <h1 className="text-3xl sm:text-5xl xl:text-6xl font-bold tracking-tighter">
                  AI-Powered Research for Venture Capitalists
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
                  Unlock the power of AI to perform in-depth due diligence on individuals and companies. Get accurate,
                  comprehensive research to inform your investment decisions.
                </p>
              </div>
              <div className="w-full max-w-md space-y-4">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                  <Input
                    type="text"
                    placeholder="Search for a person or company"
                    className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    required
                  />
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="mt-2 sm:mt-0 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded transition duration-200"
                    aria-label="Search"
                  >
                    {isLoading ? 'Searching...' : 'Search'}
                  </Button>
                </form>
                <p className="text-xs text-gray-500">
                  Our AI-powered research provides deep insights to support your due diligence process.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white">
        <p className="text-xs text-gray-500">&copy; 2024 VC Vantage. All rights reserved.</p>
        <nav className="sm:ml-auto flex space-x-4 sm:space-x-6">
          <Link href="#" className="text-xs text-gray-500 hover:text-blue-500 transition-colors duration-200">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs text-gray-500 hover:text-blue-500 transition-colors duration-200">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
