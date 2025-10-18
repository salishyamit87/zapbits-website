import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ZapBits - Secure Networking',
  description: 'Zero-config secure networking built on Headscale',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <a href="/" className="flex-shrink-0">
                  <h1 className="text-2xl font-bold text-blue-600">ZapBits</h1>
                </a>
                <div className="hidden md:ml-6 md:flex md:space-x-8">
                  <a href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Home</a>
                  <a href="/features" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Features</a>
                  <a href="/contact" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Contact</a>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <a href="/login" className="text-gray-700 hover:text-blue-600">Login</a>
                <a href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">Sign Up</a>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  )
}