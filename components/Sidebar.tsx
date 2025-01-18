// components/Sidebar.tsx
import Link from 'next/link';
import { MountainIcon, Search, FileText, Settings, BarChart2 } from 'lucide-react';

const Sidebar = () => {
  return (
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
        <Link
          href="/dashboard"
          className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <BarChart2 className="h-5 w-5 mr-3" />
          Dashboard
        </Link>
        <Link
          href="/search"
          className="flex items-center px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900 dark:hover:bg-blue-800"
        >
          <Search className="h-5 w-5 mr-3" />
          Search
        </Link>
        <Link
          href="/reports"
          className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <FileText className="h-5 w-5 mr-3" />
          Reports
        </Link>
        <Link
          href="/settings"
          className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <Settings className="h-5 w-5 mr-3" />
          Settings
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
