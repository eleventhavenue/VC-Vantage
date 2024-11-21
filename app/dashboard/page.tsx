// app/dashboard/page.tsx 

'use client'

import { useSession, signIn } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/input"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { MountainIcon, Search, BarChart2, FileText, Settings, TrendingUp, Users, DollarSign, Activity, Bell } from 'lucide-react'

import UserDropdown from "@/components/UserDropdown" // Imported UserDropdown

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 200 },
  { name: 'Apr', value: 278 },
  { name: 'May', value: 189 },
  { name: 'Jun', value: 239 },
]

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (status === "loading") return // Do nothing while loading
    if (!session) signIn() // Redirect to sign-in if not authenticated
  }, [session, status, router])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality here
    console.log('Searching for:', searchQuery)
  }

  if (status === "loading") {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!session) {
    return null // This will prevent any flash of unauthenticated content
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
          <Link href="/dashboard" className="flex items-center px-4 py-2 text-blue-600 bg-blue-50">
            <BarChart2 className="h-5 w-5 mr-3" />
            Dashboard
          </Link>
          <Link href="/search" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50">
            <Search className="h-5 w-5 mr-3" />
            Search
          </Link>
          <Link href="/reports" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50">
            <FileText className="h-5 w-5 mr-3" />
            Reports
          </Link>
          <Link href="/settings" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50">
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Welcome, {session.user?.name || session.user?.email}</h1>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5 text-gray-500" />
              </Button>
              <UserDropdown /> {/* Replaced existing dropdown with UserDropdown */}
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-6 mb-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              
                <Search className="h-4 w-4 text-blue-500" />
              
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-gray-500">+20.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              
                <Users className="h-4 w-4 text-blue-500" />
              
              <CardContent>
                <div className="text-2xl font-bold">567</div>
                <p className="text-xs text-gray-500">+15.3% from last month</p>
              </CardContent>
            </Card>
            <Card>
                <DollarSign className="h-4 w-4 text-blue-500" />
              
              <CardContent>
                <div className="text-2xl font-bold">89</div>
                <p className="text-xs text-gray-500">+7.5% from last month</p>
              </CardContent>
            </Card>
            <Card>
              
                <Activity className="h-4 w-4 text-blue-500" />
                            <CardContent>
                <div className="text-2xl font-bold">98.2%</div>
                <p className="text-xs text-gray-500">+2.1% from last month</p>
              </CardContent>
            </Card>
          </div>

          {/* Chart and Recent Activity */}
          <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trend</CardTitle>
                <CardDescription>Number of searches per month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest searches and analyses</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <div className="bg-blue-100 rounded-full p-2 mr-4">
                      <Search className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Searched for TechCorp Inc.</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </li>
                  <li className="flex items-center">
                    <div className="bg-green-100 rounded-full p-2 mr-4">
                      <FileText className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Generated report for AI Innovations Ltd.</p>
                      <p className="text-xs text-gray-500">Yesterday</p>
                    </div>
                  </li>
                  <li className="flex items-center">
                    <div className="bg-yellow-100 rounded-full p-2 mr-4">
                      <TrendingUp className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Analyzed market trends for Biotech Sector</p>
                      <p className="text-xs text-gray-500">3 days ago</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
