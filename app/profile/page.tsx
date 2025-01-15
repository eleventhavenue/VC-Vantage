// app/profile/page.tsx
'use client'

import { useSession, signOut } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return
    if (!session) signOut({ callbackUrl: '/auth' })
  }, [session, status, router])

  if (status === "loading") {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 p-4">
      {/* Exit Button navigates to home page */}
      <div className="absolute top-4 left-4">
        <Button variant="outline" onClick={() => router.push('/search')}>
          Back
        </Button>
      </div>

      <Avatar className="h-24 w-24 mb-4">
        <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || "User"} />
        <AvatarFallback>{session.user?.name?.[0] || "U"}</AvatarFallback>
      </Avatar>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        {session.user?.name || "User"}
      </h1>
      <p className="text-gray-600 dark:text-gray-400">{session.user?.email}</p>

      <div className="mt-6 flex space-x-4">
        <Link href="/profile/edit">
          <Button>Edit Profile</Button>
        </Link>
        <Button onClick={() => signOut({ callbackUrl: '/auth' })}>
          Sign Out
        </Button>
      </div>

      {/* Additional Links for Convenience */}
      <div className="mt-8 space-y-2 text-center">
        <Link href="/settings" className="text-blue-600 hover:underline">
          Go to Settings
        </Link>
        <Link href="/reports" className="text-blue-600 hover:underline">
          View My Reports
        </Link>
        <Link href="/search" className="text-blue-600 hover:underline">
          Start a New Search
        </Link>
      </div>
    </div>
  )
}
