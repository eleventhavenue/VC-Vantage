//app/dashboard/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react'; // Removed 'signIn'
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'; // Removed 'BarChart' and 'Bar'
import { 
  MountainIcon, 
  Search, 
  BarChart2, 
  FileText, 
  Settings, 
  TrendingUp, 
  PlayCircle, 
  Moon, 
  Sun, 
  Clock, 
  AlertCircle, 
  Crown,
  Shield,
} from 'lucide-react'; // Removed 'Users', 'DollarSign', 'Activity', 'Bell'
import UserDropdown from '@/components/UserDropdown';

// Removed 'monthlyData' as it's not used

interface SearchHistory {
  id: string;
  query: string;
  type: 'people' | 'company';
  createdAt: string;
}

interface UsageStats {
  usageCount: number;
  maxCount: number;
  monthlyUsageCount: number;
  isSubscribed: boolean;
  role: 'USER' | 'TEST_USER' | 'ADMIN';
  subscriptionEnds?: string;
  lastReset: string;
}

interface UsageByDate {
  date: string;
  searches: number;
}

// Removed 'monthlyData' since it's not used

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [usageByDate, setUsageByDate] = useState<UsageByDate[]>([]);
  const [error, setError] = useState<string | null>(null); // Will be used later
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchDashboardData();
    }
  }, [status, session?.user?.id]);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    setIsDarkMode(storedTheme === 'dark');
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const fetchDashboardData = async () => {
    try {
      const [historyResponse, statsResponse] = await Promise.all([
        fetch('/api/user/search-history'),
        fetch('/api/user/usage-status') // Corrected fetch URL
      ]);

      if (!historyResponse.ok || !statsResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const history = await historyResponse.json();
      const stats = await statsResponse.json();

      setSearchHistory(history.searches);
      setUsageStats(stats);
      
      // Process usage by date
      const usageData = history.searches.reduce((acc: Record<string, number>, search: SearchHistory) => {
        const date = new Date(search.createdAt).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

            // Cast the entries to have a number type for 'searches'
            const entries = Object.entries(usageData) as [string, number][];
            const chartData: UsageByDate[] = entries.map(([date, searches]) => ({
              date,
              searches
            }));
      

      setUsageByDate(chartData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
    }
  };



  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };


  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-4">Please sign in to view your dashboard.</p>
        <Link href="/auth">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  const limit = usageStats?.maxCount || 0;
  const usageCount = usageStats?.usageCount || 0;
  const usagePercentage = (limit > 0) ? (usageCount / limit) * 100 : 0;

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md">
        <div className="p-4">
          <Link href="/" className="flex items-center space-x-2">
            <MountainIcon className="h-6 w-6 text-blue-500" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">VC Vantage</span>
          </Link>
        </div>
        <nav className="mt-6">
          <Link href="/dashboard" className="flex items-center px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900 dark:hover:bg-blue-800">
            <BarChart2 className="h-5 w-5 mr-3" />
            Dashboard
          </Link>
          <Link href="/search" className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            <Search className="h-5 w-5 mr-3" />
            Search
          </Link>
          <Link href="/reports" className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            <FileText className="h-5 w-5 mr-3" />
            Reports
          </Link>
          <Link href="/settings" className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
                aria-label="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
              </button>
              <UserDropdown />
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Error Display */}
          {error && (
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
              <span className="text-red-500">{error}</span>
            </div>
          )}

          {/* Welcome Message and Platform Overview */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Welcome to VC Vantage</CardTitle>
              <CardDescription>
                Your AI-powered research platform for venture capital due diligence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                VC Vantage helps you make informed investment decisions by providing comprehensive
                insights on companies and individuals. Use our advanced AI to analyze market trends,
                financial metrics, and competitive landscapes.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="w-full" onClick={() => router.push('/search')}>
                  <Search className="mr-2 h-4 w-4" /> Start a New Search
                </Button>
                <Button className="w-full" onClick={() => router.push('/reports')}>
                  <FileText className="mr-2 h-4 w-4" /> View Reports
                </Button>
                <Button className="w-full" onClick={() => router.push('/settings')}>
                  <Settings className="mr-2 h-4 w-4" /> Adjust Settings
                </Button>
                {/* Conditionally render Admin Dashboard button */}
                {session?.user?.role === 'ADMIN' && (
                  <Button className="w-full" onClick={() => router.push('/admin')}>
                    <Shield className="mr-2 h-4 w-4" /> Admin Dashboard
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Usage Overview and Account Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="h-5 w-5 text-blue-500 mr-2" />
                  Search Usage
                </CardTitle>
                <CardDescription>
                  {usageStats?.isSubscribed ? 'Monthly' : 'Trial'} usage overview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>{usageCount} searches used</span>
                    <span>{limit} total</span>
                  </div>
                  <Progress value={usagePercentage} className="h-2" />
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {usageStats?.isSubscribed ? (
                      <>
                        <Crown className="inline-block h-4 w-4 text-yellow-500 mr-1" />
                        Premium account
                      </>
                    ) : (
                      <>
                        <Clock className="inline-block h-4 w-4 text-gray-400 mr-1" />
                        Trial account
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
                <CardDescription>Your current plan details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Plan Type</span>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      usageStats?.isSubscribed 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                    }`}>
                      {usageStats?.isSubscribed ? 'Premium' : 'Trial'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Role</span>
                    <span className="text-sm">{usageStats?.role}</span>
                  </div>
                  {usageStats?.subscriptionEnds && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Renews</span>
                      <span className="text-sm">
                        {new Date(usageStats.subscriptionEnds).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {!usageStats?.isSubscribed && (
                    <Button className="w-full mt-4">
                      Upgrade to Premium
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          
          {/* Usage Trend and Recent Searches */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Trend</CardTitle>
                <CardDescription>Search activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={usageByDate}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="searches" 
                        stroke="#3b82f6" 
                        strokeWidth={2} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Searches</CardTitle>
                <CardDescription>Your latest research queries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {searchHistory.slice(0, 5).map((search) => (
                    <div
                      key={search.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center">
                        <Search className="h-4 w-4 text-gray-500 mr-2" />
                        <div>
                          <p className="font-medium">{search.query}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(search.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                        {search.type}
                      </span>
                    </div>
                  ))}
                </div>
                {searchHistory.length > 5 && (
                  <Button variant="outline" className="w-full mt-4">
                    View All Searches
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Platform Guidance */}
          <Card>
            <CardHeader>
              <CardTitle>Getting Started with VC Vantage</CardTitle>
              <CardDescription>Tips to help you use the platform effectively</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <PlayCircle className="h-5 w-5 text-blue-500 mr-2" />
                  <Link href="/tutorial" className="text-blue-500 hover:underline">
                    Watch our quick start tutorial
                  </Link>
                </li>
                <li className="flex items-center">
                  <Search className="h-5 w-5 text-blue-500 mr-2" />
                  Use specific company names or founder details for more accurate results
                </li>
                <li className="flex items-center">
                  <FileText className="h-5 w-5 text-blue-500 mr-2" />
                  Customize your reports in the settings to focus on metrics that matter to you
                </li>
                <li className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
                  Regularly check market trends for up-to-date insights
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
