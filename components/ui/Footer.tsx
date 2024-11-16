// components/ui/Footer.tsx

export default function Footer() {
    return (
      <footer className="bg-white mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600">
          &copy; {new Date().getFullYear()} VC Vantage. All rights reserved.
        </div>
      </footer>
    )
  }
  