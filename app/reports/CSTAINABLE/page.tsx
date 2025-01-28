// app/reports/CSTAINABLE/page.tsx

"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Share2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import Label from "@/components/ui/label"
import { TableOfContents } from "@/components/table-of-contents"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { ExecutiveProfile } from "@/components/executive-profile"
import { RiskMatrix } from "@/components/risk-matrix"
import Banner from "@/components/Banner" // Import the Banner component

//
// Updated Header Component
//

const Header: React.FC<{ onSignUpClick: () => void }> = ({ onSignUpClick }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Logo linking back to home */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/vcvantage.png"
              alt="VC Vantage Logo"
              width={240}
              height={80}
            />
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {/* Sign Up Button */}
          <Button variant="outline" size="sm" onClick={onSignUpClick}>
            <Mail className="mr-2 h-4 w-4" />
            Sign Up
          </Button>
          {/* Share Button with onClick handler */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(window.location.href)
                  .then(() => {
                    alert("Page link copied to clipboard!")
                  })
                  .catch((err) => {
                    console.error("Failed to copy: ", err)
                    alert("Failed to copy the page link. Please try manually.")
                  })
              } else {
                // Fallback method...
                const textArea = document.createElement("textarea")
                textArea.value = window.location.href
                // Styling to hide the textarea
                textArea.style.position = "fixed"
                textArea.style.top = "0"
                textArea.style.left = "0"
                textArea.style.width = "2em"
                textArea.style.height = "2em"
                textArea.style.padding = "0"
                textArea.style.border = "none"
                textArea.style.outline = "none"
                textArea.style.boxShadow = "none"
                textArea.style.background = "transparent"
                document.body.appendChild(textArea)
                textArea.focus()
                textArea.select()
                try {
                  const successful = document.execCommand('copy')
                  if (successful) {
                    alert("Page link copied to clipboard!")
                  } else {
                    alert("Failed to copy the page link. Please try manually.")
                  }
                } catch (err) {
                  console.error("Fallback: Oops, unable to copy", err)
                  alert("Failed to copy the page link. Please try manually.")
                }
                document.body.removeChild(textArea)
              }
            }}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Copy Link
          </Button>
        </div>
      </div>
    </header>
  )
}

//
// Main Page Component
//

export default function Page() {
  const [isSignUpOpen, setIsSignUpOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Function to open the Sign-Up Dialog
  const openSignUp = () => setIsSignUpOpen(true)
  // Function to close the Sign-Up Dialog
  

  // Function to handle sign-up form submission
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)
    setError(null)

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message || 'Successfully subscribed!')
        setEmail('')
      } else {
        setError(data.message || 'Something went wrong.')
      }
    } catch (err) {
      console.error('Error submitting sign-up:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with onSignUpClick prop */}
      <Header onSignUpClick={openSignUp} />

      {/* Top Banner */}
      <Banner
        title="VC Vantage elevates your investment game with AI-powered due diligence and insights"
        description="Join our community to receive the latest reports and AI-powered investment strategies."
        buttonText="Learn More"
        buttonLink="/"
        variant="primary"
      />

      <main className="flex-1">
        <div className="container grid lg:grid-cols-[240px_1fr] gap-8 py-8">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <TableOfContents />
            </div>
          </aside>
          <div className="space-y-12">
            <div>
              <h1 className="text-4xl font-bold mb-2">Who Is... Cstainable Inc.</h1>
            </div>

            <section id="overview" className="scroll-mt-16 space-y-6">
              <h2 className="text-2xl font-semibold">1. Overview</h2>

              <Card>
                <CardHeader>
                  <CardTitle>Company Background</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Name & Transition:</h4>
                    <p>
                      Cstainable Inc. is a Canadian precision ag-tech and AI company formerly known as CO2 GRO Inc. The
                      exact date of the name transition is unclear.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Focus:</h4>
                    <p>
                      Specializes in increasing crop yields, reducing emissions, and improving profitability for growers
                      in the protected agriculture sector.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Core Technology:</h4>
                    <p>
                      The company offers the Cstainable™ Crop Enhancement service, utilizing technology to optimize crop
                      growth and yield for greenhouse and other controlled environment agriculture settings.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Leadership</CardTitle>
                </CardHeader>
                <div className="grid gap-6 md:grid-cols-2">
                  <ExecutiveProfile
                    name="Aaron Archibald"
                    role="President"
                    description="Leads company strategy and operations with extensive experience in agricultural technology."
                  />
                  <ExecutiveProfile
                    name="Dil Vashi"
                    role="Vice President (Operations)"
                    description="Oversees global operations and international business development."
                  />
                </div>
                <div>
                  <p>
                    Management has experience in global business strategies and collaborations, working alongside
                    entities such as the Canadian Trade Commission Services, Export Development Canada, and Elevate
                    financing.
                  </p>
                </div>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Operational Footprint</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium bold">Global Presence:</h4>
                    <p>
                      Cstainable Inc. maintains an international operational structure, including control system
                      suppliers in Colombia, project managers in Latin America, and sales teams in Canada, the United
                      States, and elsewhere.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium bold">Private Entity:</h4>
                    <p>
                      Following its transition from CO2 GRO Inc., Cstainable Inc. is now privately held, limiting
                      publicly available financial disclosures.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Historical & Potential Concerns</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      <strong>Regulatory Action:</strong> CO2 GRO Inc. faced a cease trade order in May 2024, as per an
                      official notice referencing the TSX-Venture symbol GROW. Specific details of the regulatory issues
                      were not provided.
                    </li>
                    <li>
                      <strong>Financial Distress:</strong> The predecessor, CO2 GRO Inc., reportedly struggled to secure
                      additional debt or equity capital, leading to suspended operations.
                    </li>
                    <li>
                      <strong>Asset Transfer Allegations:</strong> There are questions regarding the possible
                      unauthorized transfer of intellectual property and assets from CO2 GRO Inc. to Cstainable Inc.
                    </li>
                    <li>
                      <strong>Lack of Transparency:</strong> Limited clarity surrounds the transition from CO2 GRO Inc.
                      to Cstainable Inc., raising investor and regulatory concerns.
                    </li>
                  </ul>
                </AlertDescription>
              </Alert>

              <p>
                Despite these historical challenges tied to its predecessor, Cstainable Inc. positions itself as a
                provider of sustainable crop enhancement solutions in the protected agriculture market.
              </p>
            </section>

            <section id="market-analysis" className="scroll-mt-16 space-y-6">
              <h2 className="text-2xl font-semibold">2. Market Analysis</h2>

              <Card>
                <CardContent className="pt-6 space-y-4">
                  <p>
                    The global protected agriculture market represents a significant opportunity for Cstainable Inc. The
                    company estimates the market size at over 800 billion square feet, translating to a $1 trillion
                    opportunity². Cstainable Inc. positions itself as a technology provider that can potentially
                    increase growers&apos; yields by 30%, which could result in $300 billion of extra revenue for their
                    growing partners².
                  </p>
                  <p>
                    The company claims that utilizing their technology could lead to 100 million metric tons more food
                    produced annually, enough to feed half a billion people a year, while simultaneously reducing CO₂
                    emissions from greenhouse facilities².
                  </p>
                </CardContent>
              </Card>
            </section>

            <section id="financial-analysis" className="scroll-mt-16 space-y-6">
              <h2 className="text-2xl font-semibold">3. Financial Analysis</h2>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Financial Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Commercial sales contracts were over $1.5 million last year</li>
                    <li>Total sales to date exceed $2.5 million</li>
                    <li>The company maintains a gross profit margin greater than 75%²</li>
                    <li>
                      Cstainable Inc. reports a current sales pipeline of $600 million, consisting of 50 customers in 15
                      different countries².
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Financial Challenges (from Predecessor)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    CO2 GRO Inc. (the predecessor company) faced significant financial difficulties, including an
                    inability to secure additional debt or equity capital. The company suspended its operations due to
                    these financial challenges.
                  </p>
                  <p>
                    There were delays in filing annual financial statements, leading to an expected cease trade order.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transition Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    The transition from CO2 GRO Inc. to CSTAINABLE appears to have been controversial, with allegations
                    of misleading shareholders and improper transfer of assets. Shareholders reportedly lost substantial
                    amounts of money, and there are discussions about potential legal actions.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Current Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    CSTAINABLE is now apparently a private company, which limits the availability of public financial
                    information. The company&apos;s ability to continue operations or generate revenue is unclear based on
                    the provided information.
                  </p>
                </CardContent>
              </Card>
            </section>

            <section id="strategic-analysis" className="scroll-mt-16 space-y-6">
              <h2 className="text-2xl font-semibold">4. Strategic Analysis</h2>

              <Card>
                <CardHeader>
                  <CardTitle>Technology and Intellectual Property</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Cstainable Inc.&apos;s technology has been integrated into 25 projects with 10 different crop varieties².
                    The company&apos;s Crop Enhancement service aims to increase yields and reduce emissions, though specific
                    details on how the technology works are not provided in the search results.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Base and Traction</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    The company has a diverse customer base spanning 15 countries, with 50 customers in their sales
                    pipeline². Their technology has been implemented in 25 projects across 10 different crop varieties,
                    demonstrating adaptability to various agricultural settings².
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Operational Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Cstainable Inc. has a global operational structure, with control system suppliers in Colombia,
                    project managers in Latin America, and sales teams in Canada, the United States, and other parts of
                    the world².
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Factors</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    While specific risks are not detailed in the search results, potential risks for ag-tech companies
                    typically include market volatility, technological obsolescence, and regulatory challenges related
                    to agricultural practices and emissions.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Additional Potential Areas of Concern</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium">Regulatory Action</h4>
                    <p>
                      According to search result 2, CO2 GRO Inc. (the predecessor company to Cstainable Inc.) had its
                      stock halted by regulators:
                    </p>
                    <blockquote className="border-l-4 border-gray-300 pl-4 my-2 italic">
                      &quot;VANCOUVER, BC, May 8, 2024 /CNW/ - The following issues have been halted by CIRO
                      <br />
                      Company: CO2 GRO Inc.
                      <br />
                      TSX-Venture Symbol: GROW
                      <br />
                      All Issues: Yes
                      <br />
                      Reason: Cease Trade Order&quot;
                    </blockquote>
                    <p>
                      This indicates some form of regulatory action was taken against the company, though specific
                      details are not provided.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Potential Asset Transfer Concerns</h4>
                    <p>
                      The same search result 2 mentions potential issues with the transfer of intellectual property from
                      CO2 GRO to a private company (presumably Cstainable Inc.):
                    </p>
                    <blockquote className="border-l-4 border-gray-300 pl-4 my-2 italic">
                      &quot;Unauthorized use of its assets might lead to legal action by creditors, shareholders, or
                      regulatory bodies.&quot;
                    </blockquote>
                    <p>
                      It raises questions about whether proper procedures were followed in transferring assets between
                      the entities.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Financial Distress</h4>
                    <p>
                      The post suggests CO2 GRO was in financial difficulty, with suspended operations and a cease trade
                      order. This could potentially impact Cstainable Inc. if it is a successor company.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Lack of Transparency</h4>
                    <p>
                      There seems to be a lack of clear information about the transition from CO2 GRO Inc. to Cstainable
                      Inc., which could be a red flag for investors or regulators.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Growth Strategy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Cstainable Inc.&apos;s growth strategy appears to focus on international expansion, leveraging support
                    from organizations like the Canadian Trade Commission Services and Export Development Canada². The
                    company aims to execute its international development strategy to capitalize on the 99% of market
                    opportunities outside of Canada².
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Environmental, Social, and Governance (ESG) Factors</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Cstainable Inc.&apos;s technology aligns with environmental sustainability goals by potentially reducing
                    CO₂ emissions from greenhouse facilities while increasing food production². This approach addresses
                    both food security and environmental concerns, key aspects of ESG considerations in the agricultural
                    sector.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Leadership Impact Assessment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium">a. Leadership Stability and Expertise</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>
                        <strong>Current State:</strong> Leadership transitions, especially post-rebranding from CO2 GRO
                        Inc. to CSTAINABLE, can significantly influence company direction. If the leadership team
                        comprises individuals with strong backgrounds in sustainability, agriculture, and technology, it
                        can drive credibility and innovation.
                      </li>
                      <li>
                        <strong>Impact of Past Allegations:</strong> Allegations of misconduct and misleading
                        shareholders can erode confidence in the leadership. Trust is paramount, and any perception of
                        continued unethical behavior can hinder stakeholder support.
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actionable Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium">Enhance Leadership Transparency and Communication</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>
                        <strong>Action:</strong> Establish regular, transparent communication channels with
                        stakeholders, including detailed updates on legal proceedings, financial health, and strategic
                        initiatives.
                      </li>
                      <li>
                        <strong>Rationale:</strong> Building trust through transparency can mitigate reputational damage
                        and reassure investors and partners of the leadership&apos;s commitment to ethical practices.
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium">Strengthen Leadership Team with Diverse Expertise</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>
                        <strong>Action:</strong> Incorporate leaders with proven track records in sustainability, legal
                        affairs, and crisis management.
                      </li>
                      <li>
                        <strong>Rationale:</strong> Diverse expertise can enhance strategic decision-making, navigate
                        complexities arising from past allegations, and drive innovation in niche markets.
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium">Implement Robust Governance Practices</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>
                        <strong>Action:</strong> Establish or reinforce internal governance structures, including
                        independent oversight committees and regular audits.
                      </li>
                      <li>
                        <strong>Rationale:</strong> Strong governance can prevent future misconduct, ensure compliance
                        with regulations, and foster a culture of accountability.
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <RiskMatrix />
            </section>

            <section id="summary" className="scroll-mt-16 space-y-6">
              <h2 className="text-2xl font-semibold">5. Key Questions</h2>

              <Card>
                <CardHeader>
                  <CardTitle>Questions for Investors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium">1. Reputation Management</h4>
                    <p>
                      What specific steps is CSTAINABLE taking to address and mitigate the reputational damage from past
                      allegations related to its transition from CO2 GRO Inc.?
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">2. Financial Stability</h4>
                    <p>
                      What strategies are in place to secure diverse funding sources and ensure financial stability
                      amidst the current financial uncertainties and challenges?
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">3. Growth Strategy</h4>
                    <p>
                      Can you provide details on CSTAINABLE&apos;s strategic growth roadmap, including key milestones and
                      objectives for the next 3–5 years?
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">4. Leadership Strengthening</h4>
                    <p>
                      How is CSTAINABLE enhancing its leadership team to include expertise in sustainability, legal
                      affairs, and crisis management to drive the company forward?
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">5. Legal and Compliance Measures</h4>
                    <p>
                      What measures are being implemented to strengthen legal and regulatory compliance, and how does
                      the company plan to prevent future disputes and ensure smooth operational continuity?
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
           {/* Bottom Banner */}
           <div className="mt-12 col-span-full">
            <Banner
              title="Stay Ahead with VC Vantage"
              description="Subscribe to our newsletter for the latest insights and updates in AI-driven investments."
              buttonText="Subscribe Now"
              //buttonLink="/" // This will be ignored since onButtonClick is provided
              variant="primary"
              onButtonClick={openSignUp} // Pass the openSignUp function
            />
          </div>
        </div>
      </main>

      {/* Shared Sign-Up Dialog */}
      <Dialog open={isSignUpOpen} onOpenChange={setIsSignUpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Like What You See?</DialogTitle>
            <DialogDescription>Sign Up for Updates on Our Launch!</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <form onSubmit={handleSignUp} className="grid gap-2">
              <Label htmlFor="sign-up-email">Email</Label>
              <Input
                id="sign-up-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {message && <p className="text-green-600">{message}</p>}
              {error && <p className="text-red-600">{error}</p>}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Subscribe'}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}