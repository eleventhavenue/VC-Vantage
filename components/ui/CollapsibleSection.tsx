// components/ui/CollapsibleSection.tsx

import { useState } from 'react'

interface CollapsibleSectionProps {
  title: string;
  content: string;
}

export default function CollapsibleSection({ title, content }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="bg-white shadow rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-6 py-4 flex justify-between items-center focus:outline-none"
      >
        <h2 className="text-xl font-semibold">{title}</h2>
        <span>{isOpen ? '-' : '+'}</span>
      </button>
      {isOpen && (
        <div className="px-6 pb-6">
          <ReactMarkdown className="prose">{content}</ReactMarkdown>
        </div>
      )}
    </div>
  )
}
