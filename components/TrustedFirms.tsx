// components/TrustedFirms.tsx

import { Briefcase } from "lucide-react"

export default function TrustedFirms() {
  const firms = Array(4).fill(null) // Replace with actual firm logos if available

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 items-center">
      {firms.map((_, index) => (
        <Briefcase key={index} className="h-12 w-12 mx-auto text-gray-500" aria-hidden="true" />
      ))}
    </div>
  )
}
