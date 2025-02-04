// components/Sidebar.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MountainIcon,
  Search,
  Settings,
  BarChart2,
} from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();

  // Helper function to check if a link is active.
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-md min-h-screen">
      {/* Header */}
      <div className="p-6">
        <Link href="/" className="flex items-center space-x-3">
          <MountainIcon className="h-8 w-8 text-blue-500" />
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            VC Vantage
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="px-4">
        <div className="space-y-1">
          {/* Dashboard */}
          <Link
            href="/dashboard"
            className={`flex items-center px-4 py-3 rounded-md transition-colors duration-200 ${
              isActive('/dashboard')
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <BarChart2 className="h-5 w-5 mr-3" />
            Dashboard
          </Link>

          {/* Search */}
          <Link
            href="/search"
            className={`flex items-center px-4 py-3 rounded-md transition-colors duration-200 ${
              isActive('/search')
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <Search className="h-5 w-5 mr-3" />
            Search
          </Link>
        </div>

        {/* Reports Group */}
        <div className="mt-6">
          <div className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Reports
          </div>
          <div className="space-y-1">
            <Link
              href="/reports"
              className={`flex items-center px-4 py-3 rounded-md transition-colors duration-200 ${
                isActive('/reports') && !isActive('/reports/saved')
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Ephemeral
            </Link>
            <Link
              href="/reports/saved"
              className={`flex items-center px-4 py-3 rounded-md transition-colors duration-200 ${
                isActive('/reports/saved')
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Saved
            </Link>
          </div>
        </div>

        {/* Settings */}
        <div className="mt-6">
          <Link
            href="/settings"
            className={`flex items-center px-4 py-3 rounded-md transition-colors duration-200 ${
              isActive('/settings')
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </Link>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
