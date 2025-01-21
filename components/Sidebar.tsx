// components/Sidebar.tsx

'use client'; // Ensure this component is rendered on the client side

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Import the usePathname hook
import {
  MountainIcon,
  Search,
  FileText,
  Settings,
  BarChart2,
} from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname(); // Get the current pathname

  // Function to determine if a link is active
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-md min-h-screen">
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
          className={`flex items-center px-4 py-2 rounded-md ${
            isActive('/dashboard')
              ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          <BarChart2 className="h-5 w-5 mr-3" />
          Dashboard
        </Link>

        {/* Search Link */}
        <Link
          href="/search"
          className={`flex items-center px-4 py-2 rounded-md ${
            isActive('/search')
              ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          <Search className="h-5 w-5 mr-3" />
          Search
        </Link>

        {/* Reports group */}
<div className="mt-2">
  {/* A header label for the group */}
  <div className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300">
    <FileText className="h-5 w-5 mr-3" />
    <span className="font-medium">Reports</span>
  </div>

  {/* Indented sub-links */}
  <div className="ml-6">
    {/* Ephemeral Reports */}
    <Link
      href="/reports"
      className={`flex items-center px-4 py-2 rounded-md ${
        // Mark active if route is `/reports` but not `/reports/saved`
        isActive('/reports') && !isActive('/reports/saved')
          ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900'
          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
      }`}
    >
      Ephemeral
    </Link>

    {/* Saved Reports */}
    <Link
      href="/reports/saved"
      className={`flex items-center px-4 py-2 rounded-md ${
        isActive('/reports/saved')
          ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900'
          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
      }`}
    >
      Saved
    </Link>
  </div>
</div>


        {/* Settings Link */}
        <Link
          href="/settings"
          className={`flex items-center px-4 py-2 rounded-md ${
            isActive('/settings')
              ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          <Settings className="h-5 w-5 mr-3" />
          Settings
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
