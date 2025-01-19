// app/features/page.tsx
'use client';

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { MountainIcon, Zap, LineChart, Search, BarChart3, Briefcase, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation';

export default function FeaturesPage() {
  const router = useRouter();
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="/">
          <MountainIcon className="h-6 w-6 text-blue-500" />
          <span className="ml-2 text-xl font-bold">VC Vantage</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/pricing">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/about">
            About
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/contact">
            Contact
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-8">
              VC Vantage Features
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed text-center mb-12">
              Discover how VC Vantage can revolutionize your venture capital research and decision-making process.
            </p>
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <Zap className="h-8 w-8 text-blue-500 mb-2" />
                  <CardTitle>AI-Driven Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Harness the power of AI to uncover hidden opportunities and risks in potential investments.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <LineChart className="h-8 w-8 text-blue-500 mb-2" />
                  <CardTitle>Comprehensive Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Deep dive into market trends, financial metrics, and competitive landscapes with our advanced analytics tools.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Search className="h-8 w-8 text-blue-500 mb-2" />
                  <CardTitle>Smart Search</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Find relevant information quickly with our intelligent search capabilities, powered by natural language processing.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <BarChart3 className="h-8 w-8 text-blue-500 mb-2" />
                  <CardTitle>Real-time Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Access up-to-the-minute market data and company information to make informed decisions.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Briefcase className="h-8 w-8 text-blue-500 mb-2" />
                  <CardTitle>Portfolio Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Efficiently manage and track your investment portfolio with our integrated tools.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <ArrowRight className="h-8 w-8 text-blue-500 mb-2" />
                  <CardTitle>Customizable Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Generate tailored reports and presentations to share insights with your team and stakeholders.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-center mb-8">
              Ready to Transform Your VC Research?
            </h2>
            <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl/relaxed text-center mb-8">
              Join the future of venture capital research. Sign up now for a free trial and experience the power of VC Vantage.
            </p>
            <div className="flex justify-center">
              <Button size="lg" onClick={() => router.push('/auth?signup=true')}>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">© 2024 VC Vantage. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}