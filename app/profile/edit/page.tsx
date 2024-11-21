// app/profile/edit/page.tsx

'use client'

import { useSession, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function EditProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [name, setName] = useState(session?.user?.name || '')
  const [email, setEmail] = useState(session?.user?.email || '')
  const [image, setImage] = useState(session?.user?.image || '')

  useEffect(() => {
    if (status === "loading") return
    if (!session) signOut({ callbackUrl: '/auth' })
  }, [session, status, router])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    // Implement update logic here, such as calling an API route to update user info
    console.log('Updating profile:', { name, email, image })
    // After successful update, redirect or show a success message
  }

  if (status === "loading") {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <Avatar className="h-24 w-24 mb-4">
        <AvatarImage src={image || undefined} alt={name || "User"} />
        <AvatarFallback>{name?.[0] || "U"}</AvatarFallback>
      </Avatar>
      <h1 className="text-2xl font-semibold mb-4">Edit Profile</h1>
      <form onSubmit={handleUpdate} className="w-full max-w-md space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full"
            disabled // Typically, email changes require re-verification
          />
        </div>
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">
            Profile Picture URL
          </label>
          <Input
            id="image"
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="mt-1 block w-full"
          />
        </div>
        <Button type="submit" className="w-full">
          Update Profile
        </Button>
      </form>
    </div>
  )
}
