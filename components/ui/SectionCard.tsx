// components/ui/SectionCard.tsx

import React from 'react'
import ReactMarkdown from 'react-markdown'

interface SectionCardProps {
  title: string;
  content: string;
}

export default function SectionCard({ title, content }: SectionCardProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4 border-b pb-2">{title}</h2>
      <ReactMarkdown className="prose">{content}</ReactMarkdown>
    </div>
  )
}
