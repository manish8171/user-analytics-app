import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Analytics Dashboard',
  description: 'CausalFunnel Analytics Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0a0a0a] text-gray-100 antialiased selection:bg-blue-500/30`}>
        {/* Ambient background glow */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen"></div>
        </div>

        <div className="min-h-screen flex flex-col">
          <nav className="bg-white/5 border-b border-white/10 backdrop-blur-xl sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <div className="flex items-center gap-8">
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 tracking-tight">CausalFunnel</span>
                  </div>
                  <div className="hidden sm:flex space-x-1 bg-white/5 p-1 rounded-lg border border-white/5">
                    <Link href="/" className="px-4 py-1.5 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all">
                      Sessions
                    </Link>
                    <Link href="/heatmap" className="px-4 py-1.5 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all">
                      Analytics
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </nav>
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 mt-4">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
