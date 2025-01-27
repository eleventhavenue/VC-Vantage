// components/header.tsx

"use client"

import Link from "next/link"
import Image from "next/image"
import { Download, Share2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import Label from "@/components/ui/label"
import { useCallback, useState } from "react"

export function Header() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Function to handle sharing the current page URL
  const handleShare = useCallback(() => {
    // Clipboard handling as previously implemented...
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          alert("Page link copied to clipboard!")
        })
        .catch((err) => {
          console.error("Failed to copy: ", err)
          alert("Failed to copy the page link. Please try manually.")
        })
    } else {
      // Fallback method...
      const textArea = document.createElement("textarea")
      textArea.value = window.location.href
      // Styling to hide the textarea
      textArea.style.position = "fixed"
      textArea.style.top = "0"
      textArea.style.left = "0"
      textArea.style.width = "2em"
      textArea.style.height = "2em"
      textArea.style.padding = "0"
      textArea.style.border = "none"
      textArea.style.outline = "none"
      textArea.style.boxShadow = "none"
      textArea.style.background = "transparent"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        const successful = document.execCommand('copy')
        if (successful) {
          alert("Page link copied to clipboard!")
        } else {
          alert("Failed to copy the page link. Please try manually.")
        }
      } catch (err) {
        console.error("Fallback: Oops, unable to copy", err)
        alert("Failed to copy the page link. Please try manually.")
      }
      document.body.removeChild(textArea)
    }
  }, [])

  // Function to handle sign-up form submission
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)
    setError(null)

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message)
        setEmail('')
      } else {
        setError(data.message || 'Something went wrong.')
      }
    } catch (err) {
      console.error('Error submitting sign-up:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Logo linking back to home */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/vcvantage.png"
              alt="VC Vantage Logo"
              width={240}
              height={80}
            />
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Mail className="mr-2 h-4 w-4" />
                Sign Up
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Like What You See?</DialogTitle>
                <DialogDescription>Sign Up for Updates on Our Launch!</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <form onSubmit={handleSignUp} className="grid gap-2">
                  <Label htmlFor="header-email">Email</Label>
                  <Input
                    id="header-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  {message && <p className="text-green-600">{message}</p>}
                  {error && <p className="text-red-600">{error}</p>}
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Subscribe'}
                  </Button>
                </form>
              </div>
            </DialogContent>
          </Dialog>
          {/* Share Button with onClick handler */}
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>
    </header>
  )
}
