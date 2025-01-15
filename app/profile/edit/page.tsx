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
  
  // Initialize state from session (fallback to empty string if not available)
  const [name, setName] = useState(session?.user?.name || '')
  const [email, setEmail] = useState(session?.user?.email || '')
  const [image, setImage] = useState(session?.user?.image || '')

  useEffect(() => {
    if (status === "loading") return
    if (!session) signOut({ callbackUrl: '/auth' })
  }, [session, status, router])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, image }),  // Send updated fields
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Profile updated:', data);
        // Optionally, show a success message or refresh the session/page
      } else {
        const errorData = await response.json();
        console.error('Update failed:', errorData.error);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }

  if (status === "loading") {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Avatar className="h-24 w-24 mb-4">
        <AvatarImage src={image || session.user?.image || undefined} alt={name || "User"} />
        <AvatarFallback>{(name || session.user?.name)?.[0] || "U"}</AvatarFallback>
      </Avatar>
      <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Edit Profile</h1>
      <form onSubmit={handleUpdate} className="w-full max-w-md space-y-4 bg-white dark:bg-gray-800 p-6 rounded shadow">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled 
            className="mt-1 block w-full"
          />
        </div>
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Profile Picture URL
          </label>
          <Input
            id="image"
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="Enter image URL or leave blank to use current image"
            className="mt-1 block w-full"
          />
          {/* Live Preview */}
          {image && (
            <div className="mt-2 flex flex-col items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Image Preview:</p>
              <Avatar className="h-24 w-24 mt-1">
                <AvatarImage src={image} alt="Profile preview" />
                <AvatarFallback>{(name || session.user?.name)?.[0] || "U"}</AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
        <div className="flex space-x-4">
          <Button type="submit" className="w-full">
            Update Profile
          </Button>
          {/* Cancel/Exit Button */}
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push('/profile')}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
