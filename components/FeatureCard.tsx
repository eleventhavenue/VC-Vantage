// components/FeatureCard.tsx

import { IconType } from 'react-icons'

interface FeatureCardProps {
  Icon: IconType
  title: string
  description: string
}

export default function FeatureCard({ Icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-center space-y-2 border border-gray-200 p-6 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow duration-300">
      <Icon className="h-8 w-8 text-blue-500" aria-hidden="true" />
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-600 text-center">{description}</p>
    </div>
  )
}
