// app/auth/signin.tsx

'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function SignIn() {
  const [email, setEmail] = useState('')

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          signIn('github') // Change to your preferred provider
        }}
        className="p-6 bg-white rounded shadow-md"
      >
        <h2 className="mb-4 text-xl font-bold">Sign In</h2>
        {/* Add form fields as needed */}
        <button
          type="submit"
          className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Sign in with GitHub
        </button>
      </form>
    </div>
  )
}
