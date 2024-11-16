// components/ui/Header.tsx

import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/">
          <a className="text-2xl font-bold text-primary">VC Vantage</a>
        </Link>
        <nav className="space-x-4">
          <Link href="/about">
            <a className="text-gray-700 hover:text-primary">About</a>
          </Link>
          <Link href="/contact">
            <a className="text-gray-700 hover:text-primary">Contact</a>
          </Link>
        </nav>
      </div>
    </header>
  )
}
