// components/ui/OverviewSection.tsx

import { BriefcaseIcon, GlobeIcon, TrendingUpIcon } from '@heroicons/react/outline'
import ReactMarkdown from 'react-markdown'

interface OverviewSectionProps {
  content: string;
}

export default function OverviewSection({ content }: OverviewSectionProps) {
  // Parse content to extract key data (assuming content is in JSON or a structured format)

  return (
    <div className="bg-white shadow rounded-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="flex items-start">
        <BriefcaseIcon className="h-6 w-6 text-blue-500 mr-2" />
        <div>
          <h3 className="text-lg font-medium">Industry</h3>
          <p className="text-gray-700">[Industry Name]</p>
        </div>
      </div>
      <div className="flex items-start">
        <GlobeIcon className="h-6 w-6 text-green-500 mr-2" />
        <div>
          <h3 className="text-lg font-medium">Market Presence</h3>
          <p className="text-gray-700">[Market Information]</p>
        </div>
      </div>
      <div className="flex items-start">
        <TrendingUpIcon className="h-6 w-6 text-red-500 mr-2" />
        <div>
          <h3 className="text-lg font-medium">Growth Rate</h3>
          <p className="text-gray-700">[Growth Rate]</p>
        </div>
      </div>
    </div>
  )
}
