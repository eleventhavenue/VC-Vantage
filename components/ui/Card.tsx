// components/ui/Card.tsx

import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`bg-white shadow rounded-lg p-6 ${className}`}>
      {children}
    </div>
  )
}

export const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mb-4">
    {children}
  </div>
)

export const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-xl font-semibold">{children}</h3>
)

export const CardDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-gray-500">{children}</p>
)

export const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mb-4">
    {children}
  </div>
)

export const CardFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>
    {children}
  </div>
)
