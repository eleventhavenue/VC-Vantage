// components/ui/PlaceholderImage.tsx

import React from 'react'

interface PlaceholderImageProps {
  width: number
  height: number
  text: string
  className?: string
}

export const PlaceholderImage: React.FC<PlaceholderImageProps> = ({ width, height, text, className }) => {
  return (
    <div
      className={`flex items-center justify-center bg-gray-200 text-gray-500 font-semibold rounded-xl ${className}`}
      style={{ width, height }}
    >
      {text}
    </div>
  )
}
