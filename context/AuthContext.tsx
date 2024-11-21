// context/AuthContext.tsx

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import jwtDecode from 'jwt-decode'

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
        const decoded: User = jwtDecode(token)
        if (decoded.exp * 1000 > Date.now()) {
          setIsAuthenticated(true)
          setUser(decoded)
        } else {
          // Token expired
          localStorage.removeItem('token')
          setIsAuthenticated(false)
          setUser(null)
        }
      } catch (error) {
        console.error('Token decode error:', error)
        localStorage.removeItem('token')
        setIsAuthenticated(false)
        setUser(null)
      }
    }
  }, [])

  const login = (token: string) => {
    localStorage.setItem('token', token)
    const decoded: User = jwtDecode(token)
    setIsAuthenticated(true)
    setUser(decoded)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
    setUser(null)
    router.push('/auth') // Redirect to login page
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
