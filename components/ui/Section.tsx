// components/Section.tsx

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface SectionProps {
  title: string
  content: string
}

const Section: React.FC<SectionProps> = ({ title, content }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-blue">
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default Section
