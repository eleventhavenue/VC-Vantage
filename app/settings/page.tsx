// app/settings/page.tsx

'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/input"
import Label from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"
import { Search, FileText, Settings, MountainIcon } from 'lucide-react'
import UserDropdown from "@/components/UserDropdown" // Import the UserDropdown component
import { useSession, signIn } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
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
      return null // Prevent flash of unauthenticated content
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
              <Link href="/reports" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100">
                <FileText className="h-5 w-5 mr-3" />
                Reports
              </Link>
              <Link href="/settings" className="flex items-center px-4 py-2 text-blue-600 bg-blue-50">
                <Settings className="h-5 w-5 mr-3" />
                Settings
              </Link>
            </nav>
          </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
            <div className="flex items-center">
              <UserDropdown /> {/* Replace static avatar with UserDropdown */}
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>Manage your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="John Doe" defaultValue={session.user?.name || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" defaultValue={session.user?.email || ''} disabled />
                  </div>
                  <Button>Update Profile</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Manage your security preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">Two-factor Authentication</p>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <Switch />
                  </div>
                  <Button variant="outline">Change Password</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Manage your notification preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive updates via email</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-gray-500">Receive updates on your device</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>AI Preferences</CardTitle>
                  <CardDescription>Customize your AI research settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">Advanced AI Analysis</p>
                      <p className="text-sm text-gray-500">Enable deeper, more comprehensive research</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ai-model">Preferred AI Model</Label>
                    <select id="ai-model" className="w-full p-2 border rounded">
                      <option>Standard</option>
                      <option>Advanced</option>
                      <option>Expert</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
    )
}
