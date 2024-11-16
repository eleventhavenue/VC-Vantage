// app/layout.tsx

'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import MountainIcon from '@/components/ui/MountainIcon'
import { useState } from 'react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const res = await fetch('/api/logout', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        router.push('/login')
      } else {
        alert(data.error || 'Failed to logout.')
      }
    } catch (error) {
      console.error('Error logging out:', error)
      alert('An unexpected error occurred.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <html lang="en">
      <body>
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
            <Button onClick={handleLogout} disabled={isLoggingOut} className="ml-4 bg-red-500 hover:bg-red-600">
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </nav>
        </header>

        {/* Main Content */}
        {children}

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
      </body>
    </html>
  )
}
