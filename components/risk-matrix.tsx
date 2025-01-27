import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { RiskBadge } from "./risk-badge"

const riskData = [
  {
    risk: "Reputational Damage and Trust Deficit",
    likelihood: "High",
    impact: "High",
    opportunity: "Building transparent leadership",
    mitigation: "Implement transparent communication and robust governance practices.",
  },
  {
    risk: "Legal and Regulatory Challenges",
    likelihood: "Medium",
    impact: "High",
    opportunity: "Strengthening legal compliance",
    mitigation: "Engage experienced legal counsel and ensure strict adherence to regulations.",
  },
  {
    risk: "Financial Instability",
    likelihood: "High",
    impact: "High",
    opportunity: "Securing diverse funding sources",
    mitigation: "Diversify funding sources and improve financial management.",
  },
  {
    risk: "Limited Market Awareness",
    likelihood: "Medium",
    impact: "Medium",
    opportunity: "Leveraging sustainability trends",
    mitigation: "Invest in marketing and participate in industry events/conferences.",
  },
  {
    risk: "Competitive Market Entry",
    likelihood: "High",
    impact: "Medium",
    opportunity: "Differentiation through innovation",
    mitigation: "Focus on unique CO₂ solutions and continuous R&D investment.",
  },
  {
    risk: "Technological Obsolescence",
    likelihood: "Low",
    impact: "Medium",
    opportunity: "Investing in R&D",
    mitigation: "Regularly update technologies and adopt emerging sustainable practices.",
  },
  {
    risk: "Dependency on Niche Market",
    likelihood: "Medium",
    impact: "Medium",
    opportunity: "Expanding product offerings",
    mitigation: "Diversify offerings within sustainable solutions to reduce dependency risk.",
  },
  {
    risk: "Operational Challenges Amid Financial Uncertainty",
    likelihood: "High",
    impact: "High",
    opportunity: "Enhancing operational efficiency",
    mitigation: "Streamline operations, adopt cost-effective practices, and prioritize projects.",
  },
]

export function RiskMatrix() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Assessment Matrix</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Risk Factor</TableHead>
              <TableHead>Likelihood</TableHead>
              <TableHead>Impact</TableHead>
              <TableHead>Opportunity Addressed</TableHead>
              <TableHead className="min-w-[300px]">Mitigation Strategy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {riskData.map((item, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{item.risk}</TableCell>
                <TableCell>
                  <RiskBadge level={item.likelihood as "High" | "Medium" | "Low"} />
                </TableCell>
                <TableCell>
                  <RiskBadge level={item.impact as "High" | "Medium" | "Low"} />
                </TableCell>
                <TableCell>{item.opportunity}</TableCell>
                <TableCell>{item.mitigation}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

