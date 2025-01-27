//components/risk-badge.tsx

interface RiskBadgeProps {
    level: "High" | "Medium" | "Low"
  }
  
  export function RiskBadge({ level }: RiskBadgeProps) {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium risk-${level.toLowerCase()}`}
      >
        {level}
      </span>
    )
  }
  
  