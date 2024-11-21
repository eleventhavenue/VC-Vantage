// app/results/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Spinner from '@/components/ui/Spinner'
import { Accordion, AccordionItem } from '@/components/ui/Accordion'
import Image from 'next/image'

interface SearchResults {
  overview: string
  marketAnalysis: string
  financialAnalysis: string
  strategicAnalysis: string
  summary: string
  keyQuestions: string[]
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-purple-100">
        <div className="flex flex-col items-center">
          <Spinner className="w-16 h-16 text-blue-500 mb-4" />
          <p className="text-xl text-gray-700">Fetching detailed analysis, please wait...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-red-100 to-yellow-100 px-4">
        <p className="text-red-600 text-xl mb-4">{error}</p>
        <Link href="/">
          <Button className="mt-2 px-6 py-3">Back to Search</Button>
        </Link>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-gray-100 to-gray-200 px-4">
        <p className="text-gray-700 text-xl mb-4">No results found.</p>
        <Link href="/">
          <Button className="mt-2 px-6 py-3">Back to Search</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-white min-h-screen">
      {/* Header with Branding */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          {/* Replace '/logo.png' with your actual logo path */}
          <Image src="/logo.png" alt="Brand Logo" width={50} height={50} />
          <h1 className="text-3xl font-bold ml-4 text-blue-600">Who Is...</h1>
          <span className="text-3xl font-bold ml-2 text-gray-800">{query}</span>
        </div>
        <Link href="/">
          <Button className="px-6 py-3">Back to Search</Button>
        </Link>
      </header>

      {/* Accordion for Sections */}
      <Accordion className="space-y-4">
        {/* Overview Section */}
        <AccordionItem title="Overview">
          <div className="prose prose-lg max-w-none">
            {results.overview}
          </div>
        </AccordionItem>

        {/* Market Analysis Section */}
        <AccordionItem title="Market Analysis">
          <div className="prose prose-lg max-w-none">
            {results.marketAnalysis}
          </div>
        </AccordionItem>

        {/* Financial Analysis Section */}
        <AccordionItem title="Financial Analysis">
          <div className="prose prose-lg max-w-none">
            {results.financialAnalysis}
          </div>
        </AccordionItem>

        {/* Strategic Analysis Section */}
        <AccordionItem title="Strategic Analysis">
          <div className="prose prose-lg max-w-none">
            {results.strategicAnalysis}
          </div>
        </AccordionItem>

        {/* Summary and Key Questions Section */}
        <AccordionItem title="Summary and Key Questions">
          <div className="prose prose-lg max-w-none">
            {results.summary}
          </div>
          {results.keyQuestions.length > 0 && (
            <div className="mt-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Key Questions</h2>
              <ul className="list-disc list-inside space-y-2">
                {results.keyQuestions.map((question, index) => (
                  <li key={index} className="text-gray-700">
                    {question}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </AccordionItem>
      </Accordion>
    </div>
  )
}
