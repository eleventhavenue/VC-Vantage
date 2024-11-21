// app/reports/page.tsx

'use client'

import UserDropdown from "@/components/UserDropdown"
import { useSession, signIn } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from 'next/navigation'
import Link from "next/link"
import { MountainIcon, FileText, Search, Settings } from 'lucide-react'


export default function ReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return
    if (!session) signIn()
  }, [session, status, router])

  if (status === "loading") {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <Link href="/" className="flex items-center space-x-2">
            <MountainIcon className="h-6 w-6 text-blue-500" />
            <span className="text-xl font-bold text-gray-900">VC Vantage</span>
          </Link>
        </div>
        <nav className="mt-6">
          
          <Link href="/search" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100">
            <Search className="h-5 w-5 mr-3" />
            Search
          </Link>
          <Link href="/reports" className="flex items-center px-4 py-2 text-blue-600 bg-blue-50">
            <FileText className="h-5 w-5 mr-3" />
            Reports
          </Link>
          <Link href="/settings" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100">
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
            <div className="flex items-center space-x-4">
              <UserDropdown /> {/* Include UserDropdown */}
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Reports Content */}
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">Reports functionality coming soon!</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
