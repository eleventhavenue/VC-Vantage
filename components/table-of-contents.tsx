"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

const sections = [
  { id: "overview", label: "Overview" },
  { id: "market-analysis", label: "Market Analysis" },
  { id: "financial-analysis", label: "Financial Analysis" },
  { id: "strategic-analysis", label: "Strategic Analysis" },
  { id: "summary", label: "Summary and Key Questions" },
]

export function TableOfContents() {
  const [activeSection, setActiveSection] = useState("")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.5 },
    )

    sections.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <nav className="space-y-1">
      {sections.map(({ id, label }) => (
        <a
          key={id}
          href={`#${id}`}
          className={cn(
            "block px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors",
            activeSection === id ? "bg-muted font-medium text-primary" : "text-muted-foreground",
          )}
        >
          {label}
        </a>
      ))}
    </nav>
  )
}

