// app/settings/page.tsx

'use client';

import { useSession, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Input } from '@/components/ui/input';
import Label from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Search,
  FileText,
  Settings,
  MountainIcon,
  Moon,
  Sun,
  BarChart2,
} from 'lucide-react';
import UserDropdown from '@/components/UserDropdown';
import DeleteAccountDialog from '@/components/DeleteAccountDialog';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Dark mode and dialog states
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    setIsDarkMode(storedTheme === 'dark');
  }, []);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) signIn();
  }, [session, status, router]);

 

  if (!session) return null;

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
<aside className="w-64 bg-white dark:bg-gray-800 shadow-md">
  <div className="p-4">
    <Link href="/" className="flex items-center space-x-2">
      <MountainIcon className="h-6 w-6 text-blue-500" />
      <span className="text-xl font-bold text-gray-900 dark:text-white">
        VC Vantage
      </span>
    </Link>
  </div>
  <nav className="mt-6">
    {/* Dashboard Link */}
    <Link
      href="/dashboard"
      className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
    >
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
          <Link href="/settings" className="flex items-center px-4 py-2 text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900">
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Settings</h1>
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
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Profile Settings Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>Manage your account details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      defaultValue={session.user?.name || ''}
                      className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      defaultValue={session.user?.email || ''}
                      className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div className="flex space-x-4 mt-4">
                    <Button>Update Profile</Button>
                    <Link href="/profile/edit">
                      <Button variant="outline">Edit Profile</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Security Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Manage your security preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        Two-factor Authentication
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <Button variant="outline" className="mt-4">Change Password</Button>
                </CardContent>
              </Card>

              {/* Notifications Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Manage your notification preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        Email Notifications
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive updates via email
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        Push Notifications
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive updates on your device
                      </p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              {/* AI Preferences Card */}
              <Card>
                <CardHeader>
                  <CardTitle>AI Preferences</CardTitle>
                  <CardDescription>Customize your AI research settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        Advanced AI Analysis
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Enable deeper, more comprehensive research
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="ai-model">Preferred AI Model</Label>
                    <select
                      id="ai-model"
                      className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                    >
                      <option>Standard</option>
                      <option>Advanced</option>
                      <option>Expert</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Danger Zone Card */}
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Danger Zone</CardTitle>
                  <CardDescription>
                    Permanently delete your account and all associated data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button 
                      variant="destructive" 
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Delete Account Dialog */}
        <DeleteAccountDialog 
          isOpen={showDeleteDialog} 
          onClose={() => setShowDeleteDialog(false)} 
        />
      </main>
    </div>
  );
}
