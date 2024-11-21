// context/AuthContext.tsx

'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { decodeJwt, JWTPayload } from 'jose'

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  login: (token: string) => void
  logout: () => void
}

interface User {
  userId: number
  email: string
  exp: number // JWT expiration
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const decoded: JWTPayload = decodeJwt(token)
        
        // Validate 'exp' and 'sub' claims
        if (typeof decoded.exp === 'number' && typeof decoded.sub === 'string') {
          if (decoded.exp * 1000 > Date.now()) {
            const userId = parseInt(decoded.sub, 10)
            if (!isNaN(userId)) {
              setIsAuthenticated(true)
              setUser({
                userId,
                email: decoded.email as string,
                exp: decoded.exp,
              })
            } else {
              // Invalid userId
              console.error('Invalid user ID in token')
              handleInvalidToken()
            }
          } else {
            // Token expired
            handleInvalidToken()
          }
        } else {
          // Missing required claims
          console.error('Token is missing required claims')
          handleInvalidToken()
        }
      } catch (error) {
        console.error('Token decode error:', error)
        handleInvalidToken()
      }
    }
  }, [])

  const login = (token: string) => {
    localStorage.setItem('token', token)
    try {
      const decoded: JWTPayload = decodeJwt(token)
      
      // Validate 'exp' and 'sub' claims
      if (typeof decoded.exp === 'number' && typeof decoded.sub === 'string') {
        if (decoded.exp * 1000 > Date.now()) {
          const userId = parseInt(decoded.sub, 10)
          if (!isNaN(userId)) {
            setIsAuthenticated(true)
            setUser({
              userId,
              email: decoded.email as string,
              exp: decoded.exp,
            })
          } else {
            // Invalid userId
            console.error('Invalid user ID in token')
            handleInvalidToken()
          }
        } else {
          // Token expired
          handleInvalidToken()
        }
      } else {
        // Missing required claims
        console.error('Token is missing required claims')
        handleInvalidToken()
      }
    } catch (error) {
      console.error('Token decode error:', error)
      handleInvalidToken()
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
    setUser(null)
    router.push('/auth') // Redirect to login page
  }

  const handleInvalidToken = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
    setUser(null)
    router.push('/auth') // Redirect to login page or show an error message
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
