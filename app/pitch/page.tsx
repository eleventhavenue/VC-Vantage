"use client"

import React, { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft, 
    ChevronRight,
    Users,
    Target,
    Search,
    DollarSign,
    TrendingUp,
    CheckCircle,
    Globe,
    Shield,
    Zap,
    BarChart2,
    Code,
    Briefcase
} from "lucide-react";
import Image from "next/image";
import FloatingElements from "@/components/floating-elements";
import { Mountains } from "@/components/mountains";

interface SlideContainerProps {
  title: string;
  children: ReactNode;
  className?: string;
}

interface GradientCardProps {
  title?: string;
  children: ReactNode;
  delay?: number;
  className?: string;
}

// Slide container component for consistent styling
const SlideContainer: React.FC<SlideContainerProps> = ({ title, children, className = "" }) => (
  <div className={`space-y-8 ${className}`}>
    <motion.h2 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-4xl font-bold text-emerald-950 text-center mb-8"
    >
      {title}
    </motion.h2>
    {children}
  </div>
);

// Card component with consistent styling
const GradientCard: React.FC<GradientCardProps> = ({ title, children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`relative group ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity transform group-hover:scale-105 duration-500" />
    <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl h-full border border-emerald-100">
      {title && <h3 className="text-xl font-semibold mb-4 text-emerald-950">{title}</h3>}
      {children}
    </div>
  </motion.div>
);

const TitleSlide: React.FC = () => (
  <div className="flex flex-col items-center justify-center text-center space-y-8">
    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-5xl md:text-6xl font-bold text-emerald-950 leading-tight"
    >
      Giving Angel Investors the{" "}
      <span className="relative">
        <span className="relative z-10 bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
          VC Vantage
        </span>
        <motion.span
          className="absolute inset-0 bg-gradient-to-r from-emerald-200 to-teal-200 blur-2xl opacity-30"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </span>
    </motion.h1>
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="text-xl text-emerald-800/90 max-w-3xl mx-auto"
    >
      AI-Powered Due Diligence for Angel Investors
    </motion.p>
  </div>
);

const ProblemSlide: React.FC = () => (
  <SlideContainer title="The Problem">
    <div className="grid grid-cols-2 gap-8">
      <GradientCard>
        <ul className="space-y-4">
          {[
            { icon: Shield, text: "Limited due diligence resources" },
            { icon: BarChart2, text: "Decisions based on incomplete data" },
            { icon: Target, text: "High stakes require better insights" }
          ].map((item, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 * (index + 1) }}
              className="flex items-center space-x-3 text-emerald-800"
            >
              <item.icon className="h-5 w-5 text-emerald-600" />
              <span>{item.text}</span>
            </motion.li>
          ))}
        </ul>
      </GradientCard>
      <GradientCard title="Real World Example">
        <p className="text-emerald-800 italic">
        &quot;While working as a business intelligence analyst, I witnessed more resources devoted to researching a tenant than vetting a $50,000 investment in a founder.&quot;
        </p>
      </GradientCard>
    </div>
  </SlideContainer>
);

const SolutionSlide: React.FC = () => (
  <SlideContainer title="Our Solution">
    <div className="grid grid-cols-2 gap-8">
      <GradientCard title="Key Features">
        <ul className="space-y-4">
          {[
            { icon: Zap, text: "AI-powered data aggregation" },
            { icon: Search, text: "Real-time risk assessment" },
            { icon: Shield, text: "Comprehensive founder profiles" }
          ].map((item, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 * (index + 1) }}
              className="flex items-center space-x-3 text-emerald-800"
            >
              <item.icon className="h-5 w-5 text-emerald-600" />
              <span>{item.text}</span>
            </motion.li>
          ))}
        </ul>
      </GradientCard>
      <GradientCard title="Benefits">
        <ul className="space-y-4">
          {[
            { icon: DollarSign, text: "Save time and resources" },
            { icon: Shield, text: "Minimize investment risks" },
            { icon: CheckCircle, text: "Make informed decisions" }
          ].map((item, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 * (index + 1) }}
              className="flex items-center space-x-3 text-emerald-800"
            >
              <item.icon className="h-5 w-5 text-emerald-600" />
              <span>{item.text}</span>
            </motion.li>
          ))}
        </ul>
      </GradientCard>
    </div>
  </SlideContainer>
);

const MarketSlide: React.FC = () => (
    <SlideContainer title="Market Opportunity">
      <div className="space-y-8">
        <div className="grid grid-cols-3 gap-6">
          {[
            { number: "335,000", label: "Active Angel Investors in the US" },
            { number: "20,000+", label: "Active Investors in Canada" },
            { number: "11,550", label: "Active Investors in the UK" }
          ].map((stat, index) => (
            <GradientCard key={index} delay={0.2 * index}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 * index, type: "spring" }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-emerald-600 mb-2">{stat.number}</div>
                <div className="text-emerald-800">{stat.label}</div>
              </motion.div>
            </GradientCard>
          ))}
        </div>
        <GradientCard delay={0.6}>
          <div className="flex items-center justify-center space-x-8">
            <Globe className="h-16 w-16 text-emerald-600" />
            <div className="text-emerald-800">
              <h3 className="text-xl font-semibold mb-2">Global Expansion Potential</h3>
              <p>Initial focus on US, Canada, and UK markets with plans for international growth</p>
            </div>
          </div>
        </GradientCard>
      </div>
    </SlideContainer>
  );
  
  const BusinessModelSlide: React.FC = () => (
    <SlideContainer title="Business Model">
      <div className="grid grid-cols-3 gap-6">
        <GradientCard title="Free Tier" delay={0.2}>
          <ul className="space-y-2 text-emerald-800">
            <li>• 3 free intelligence reports</li>
            <li>• Company analysis</li>
            <li>• Due diligence essentials</li>
            <li className="text-emerald-600 mt-4 font-medium">Try before you buy</li>
          </ul>
          <motion.div 
            className="mt-4 p-2 bg-emerald-50 rounded-lg text-emerald-600 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Experience the power of VC Vantage
          </motion.div>
        </GradientCard>
  
        <GradientCard title="Individual - $49.99/month (TBD)" delay={0.3}>
          <ul className="space-y-2 text-emerald-800">
            <li>• 20 intelligence reports per month</li>
            <li>• Due diligence reports</li>
            <li>• Company analysis</li>
            <li>• Insightful assessments</li>
          </ul>
          <motion.div 
            className="mt-4 p-2 bg-emerald-50 rounded-lg text-emerald-600 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Perfect for individual angel investors
          </motion.div>
        </GradientCard>
  
        <GradientCard title="Premium - $399/month (Phase 2)" delay={0.4}>
          <ul className="space-y-2 text-emerald-800">
            <li className="ml-4">• 30 intelligence reports per month</li>
            <li className="mt-4 font-medium">5 high-level due diligence reports including:</li>
            <li className="ml-4">• Background checks</li>
            <li className="ml-4">• Credit checks</li>
            <li className="ml-4">• International database access</li>
          </ul>
          <motion.div 
            className="mt-4 p-2 bg-emerald-50 rounded-lg text-emerald-600 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Ideal for angel groups, family offices, and investment firms
          </motion.div>
        </GradientCard>
      </div>
    </SlideContainer>
  );
  
  const CompetitiveAnalysisSlide: React.FC = () => (
    <SlideContainer title="Competitive Analysis">
      <div className="grid grid-cols-3 gap-6">
        {[
          {
            name: "PitchBook",
            offer: "Financial data and analysis",
            advantage: "AI-driven insights beyond financials"
          },
          {
            name: "Crunchbase",
            offer: "Business information database",
            advantage: "Real-time risk detection"
          },
          {
            name: "CB Insights",
            offer: "Market research platform",
            advantage: "Comprehensive founder profiles"
          }
        ].map((competitor, index) => (
          <GradientCard key={competitor.name} delay={0.2 * index}>
            <h3 className="text-xl font-semibold mb-4 text-emerald-950">{competitor.name}</h3>
            <p className="text-emerald-700 mb-4">They offer: {competitor.offer}</p>
            <motion.div 
              className="font-bold text-emerald-600 p-2 bg-emerald-50 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (0.2 * index) }}
            >
              Our edge: {competitor.advantage}
            </motion.div>
          </GradientCard>
        ))}
      </div>
    </SlideContainer>
  );
  
  const GoToMarketSlide: React.FC = () => (
    <SlideContainer title="Go-to-Market Strategy">
      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-8">
          <GradientCard title="Direct Outreach" delay={0.2}>
            <ul className="space-y-3">
              {[
                { text: "LinkedIn DM campaigns", icon: Users },
                { text: "Angel network presentations", icon: Target },
                { text: "Personalized demos", icon: Search },
                { text: "Referral program", icon: TrendingUp }
              ].map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (0.1 * index) }}
                  className="flex items-center space-x-3 text-emerald-800"
                >
                  <item.icon className="h-5 w-5 text-emerald-600" />
                  <span>{item.text}</span>
                </motion.li>
              ))}
            </ul>
          </GradientCard>
          <GradientCard title="Strategic Partnerships" delay={0.4}>
            <ul className="space-y-3">
              {[
                { text: "Angel investor networks", icon: Users },
                { text: "Investment platforms", icon: Globe },
                { text: "Family office associations", icon: Briefcase },
                { text: "Industry events", icon: Target }
              ].map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (0.1 * index) }}
                  className="flex items-center space-x-3 text-emerald-800"
                >
                  <item.icon className="h-5 w-5 text-emerald-600" />
                  <span>{item.text}</span>
                </motion.li>
              ))}
            </ul>
          </GradientCard>
        </div>
        <GradientCard delay={0.6}>
          <div className="text-center text-emerald-800">
            <h3 className="text-xl font-semibold mb-4">Path to First 100 Users</h3>
            <div className="flex justify-center space-x-4">
              <motion.div 
                className="bg-emerald-50 rounded-lg p-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8 }}
              >
                Focus on early adopters in key markets
              </motion.div>
              <motion.div 
                className="bg-emerald-50 rounded-lg p-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.9 }}
              >
                Leverage referral networks
              </motion.div>
              <motion.div 
                className="bg-emerald-50 rounded-lg p-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.0 }}
              >
                Provide exceptional support
              </motion.div>
            </div>
          </div>
        </GradientCard>
      </div>
    </SlideContainer>
  );
  
  const GrowthStrategySlide: React.FC = () => (
    <SlideContainer title="Growth Strategy">
      <div className="grid grid-cols-3 gap-6">
        {[
          {
            phase: "Phase 1",
            items: ["Focus on core markets", "Build strong user base"],
            color: "from-emerald-400 to-emerald-600"
          },
          {
            phase: "Phase 2",
            items: ["Expand to family offices", "Add advanced features"],
            color: "from-teal-400 to-teal-600"
          },
          {
            phase: "Phase 3",
            items: ["International expansion", "Enterprise solutions"],
            color: "from-cyan-400 to-cyan-600"
          }
        ].map((phase, index) => (
          <GradientCard key={phase.phase} delay={0.2 * index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (0.2 * index) }}
              className="space-y-4"
            >
              <div className={`text-white font-bold py-2 px-4 rounded-lg bg-gradient-to-r ${phase.color} text-center`}>
                {phase.phase}
              </div>
              <ul className="space-y-3 text-emerald-800">
                {phase.items.map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + (0.1 * i) }}
                    className="flex items-center space-x-2"
                  >
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </GradientCard>
        ))}
      </div>
    </SlideContainer>
  );
  
  const TeamSlide: React.FC = () => (
    <SlideContainer title="Who I Am">
      <div className="grid grid-cols-2 gap-8">
        <GradientCard title="Founder" delay={0.2}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <ul className="space-y-3 text-emerald-800">
              <li className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-emerald-600" />
                <span>Background in Creative Endeavours</span>
              </li>
              <li className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-emerald-600" />
                <span>Worked with VCs and Angel Investors</span>
              </li>
              <li className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-emerald-600" />
                <span>Diverse Skill Set & Entrpreneurial</span>
              </li>
            </ul>
          </motion.div>
        </GradientCard>
        <GradientCard title="Looking to Build Team" delay={0.4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <ul className="space-y-3 text-emerald-800">
              <li className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-emerald-600" />
                <span>Sales Reps</span>
              </li>
              <li className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-emerald-600" />
                <span>Advisors</span>
              </li>
              <li className="flex items-center space-x-2">
                <Code className="h-5 w-5 text-emerald-600" />
                <span>Developers</span>
              </li>
            </ul>
          </motion.div>
        </GradientCard>
      </div>
    </SlideContainer>
  );
  
  const CallToActionSlide: React.FC = () => (
    <SlideContainer title="Join Us in Transforming Due Diligence">
      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-8">
          <GradientCard title="Vision" delay={0.2}>
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-3 text-emerald-800"
            >
              <li className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-emerald-600" />
                <span>Become the industry standard</span>
              </li>
              <li className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-emerald-600" />
                <span>Transform investment decisions</span>
              </li>
              <li className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                <span>Build a global platform</span>
              </li>
            </motion.ul>
          </GradientCard>
          <GradientCard title="Next Steps" delay={0.4}>
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white">
                  Schedule a Demo
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Button className="w-full bg-gradient-to-r from-teal-600 to-cyan-500 hover:from-teal-500 hover:to-cyan-400 text-white">
                  Partnership Opportunities
                </Button>
              </motion.div>
            </div>
          </GradientCard>
        </div>
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-center mt-8"
      >
        <div className="text-emerald-800 mb-4">Contact: tunde@vc-vantage.com</div>
        <div className="text-emerald-600 font-semibold">www.vc-vantage.com</div>
      </motion.div>
    </div>
  </SlideContainer>
);
interface Slide {
    id: string;
    component: React.FC;
  }
// Update the slides array in the main component to include all slides
const StyledPitchDeck: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    { id: "title", component: TitleSlide },
    { id: "problem", component: ProblemSlide },
    { id: "solution", component: SolutionSlide },
    { id: "market", component: MarketSlide },
    { id: "business-model", component: BusinessModelSlide },
    { id: "competitive-analysis", component: CompetitiveAnalysisSlide },
    { id: "go-to-market", component: GoToMarketSlide },
    { id: "growth-strategy", component: GrowthStrategySlide },
    { id: "team", component: TeamSlide },
    { id: "call-to-action", component: CallToActionSlide }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  const CurrentSlideComponent = slides[currentSlide].component;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <Mountains />
      <FloatingElements />

      {/* Ambient Light Effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-emerald-100/30 mix-blend-soft-light" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-teal-100/20 mix-blend-overlay" />

      <header className="relative z-10 container mx-auto px-6 py-4 flex justify-between items-center">
        <Image
          src="/vcvantage.png"
          alt="VC Vantage Logo"
          width={140}
          height={45}
          className="object-contain"
        />
        <div className="flex items-center space-x-4">
          <Button
            onClick={prevSlide}
            variant="outline"
            className="text-emerald-800 hover:text-emerald-900 hover:bg-emerald-100/50"
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <span className="text-emerald-800">
            {currentSlide + 1} / {slides.length}
          </span>
          <Button
            onClick={nextSlide}
            variant="outline"
            className="text-emerald-800 hover:text-emerald-900 hover:bg-emerald-100/50"
            disabled={currentSlide === slides.length - 1}
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-6 pt-20 pb-32 flex flex-col items-center justify-center min-h-[calc(100vh-96px)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-5xl mx-auto"
          >
            <CurrentSlideComponent />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default StyledPitchDeck;