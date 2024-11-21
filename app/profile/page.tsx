// app/profile/page.tsx

'use client'

import { useSession, signOut } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { Button } from "@/components/ui/button"


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
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <Avatar className="h-24 w-24 mb-4">
        <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || "User"} />
        <AvatarFallback>{session.user?.name?.[0] || "U"}</AvatarFallback>
      </Avatar>
      <h1 className="text-2xl font-semibold">{session.user?.name || "User"}</h1>
      <p className="text-gray-600">{session.user?.email}</p>
      {/* Add more profile details and edit options here */}
      <Button onClick={() => signOut({ callbackUrl: '/auth' })} className="mt-4">
        Sign Out
      </Button>
    </div>
  )
}
