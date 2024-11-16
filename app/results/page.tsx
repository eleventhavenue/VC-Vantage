// app/results/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Spinner from '@/components/ui/Spinner' // Ensure this component exists
import Section from '@/components/ui/Section' // New Section component
//import { IconButton } from '@/components/ui/icon-button' // Optional: For theme toggling or other actions

interface SearchResults {
  overview: string
  marketAnalysis: string
  financialAnalysis: string
  strategicAnalysis: string
  summary: string
}

export default function Results() {
  const [results, setResults] = useState<SearchResults | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const query = searchParams.get('query')

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setError('No search query provided.')
        setIsLoading(false)
        return
      }
      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        })
        const data = await response.json()
        if (!response.ok) {
          setError(data.error || 'An error occurred while fetching results.')
        } else {
          setResults(data)
        }
      } catch (error) {
        console.error('Error fetching results:', error)
        setError('Failed to fetch results. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [query])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <Spinner className="w-12 h-12 text-blue-500 mb-4" />
          <p className="text-lg text-gray-700">Fetching detailed analysis, please wait...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <Link href="/">
          <Button className="mt-2">Back to Search</Button>
        </Link>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <p className="text-gray-700 text-lg mb-4">No results found.</p>
        <Link href="/">
          <Button className="mt-2">Back to Search</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Results for: <span className="text-blue-600">{query}</span></h1>
      
      <div className="space-y-8">
        <Section title="Overview" content={results.overview} />
        <Section title="Market Analysis" content={results.marketAnalysis} />
        <Section title="Financial Analysis" content={results.financialAnalysis} />
        <Section title="Strategic Analysis" content={results.strategicAnalysis} />
        <Section title="Summary and Key Questions" content={results.summary} />
      </div>

      <div className="mt-8 text-center">
        <Link href="/">
          <Button className="px-6 py-3">Back to Search</Button>
        </Link>
      </div>
    </div>
  )
}
