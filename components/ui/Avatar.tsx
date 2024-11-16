// components/ui/Avatar.tsx

import React from 'react'

interface AvatarProps {
  children: React.ReactNode
  className?: string
}

export const Avatar: React.FC<AvatarProps> = ({ children, className }) => (
  <div className={`flex-shrink-0 ${className}`}>
    {children}
  </div>
)

export const AvatarImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => (
  <img src={src} alt={alt} className="h-10 w-10 rounded-full object-cover" />
)

export const AvatarFallback: React.FC<{ children: string }> = ({ children }) => (
  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium">
    {children}
  </div>
)
