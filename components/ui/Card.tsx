// components/ui/Card.tsx

import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
}

interface CardSubProps {
  children: React.ReactNode
  className?: string
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 shadow rounded-lg p-6 ${className || ''}`}>
      {children}
    </div>
  )
}

export const CardHeader: React.FC<CardSubProps> = ({ children, className }) => (
  <div className={`mb-4 ${className || ''}`}>
    {children}
  </div>
)

export const CardTitle: React.FC<CardSubProps> = ({ children, className }) => (
  <h3 className={`text-xl font-semibold ${className || ''}`}>{children}</h3>
)

export const CardDescription: React.FC<CardSubProps> = ({ children, className }) => (
  <p className={`text-gray-500 ${className || ''}`}>{children}</p>
)

export const CardContent: React.FC<CardSubProps> = ({ children, className }) => (
  <div className={`mb-4 ${className || ''}`}>
    {children}
  </div>
)

export const CardFooter: React.FC<CardSubProps> = ({ children, className }) => (
  <div className={`${className || ''}`}>
    {children}
  </div>
)
