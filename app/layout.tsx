import type { Metadata } from 'next'
import { Inter, PT_Mono } from 'next/font/google'
import Image from 'next/image'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const ptMono = PT_Mono({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pt-mono'
})

export const metadata: Metadata = {
  title: 'Rara Avis - Essential Tools for Creators and Collectors',
  description: 'Open-source NFT rarity made simple',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${ptMono.variable}`}>
      <header className="fixed top-0 left-0 right-0 h-20 bg-card border-b border-default px-6 z-50 shadow-md">
          <div className="header-container">
            <div className="header-left">
              <a href="/">
              <Image
                src="/rara_avis-logo-2025-transparent.png"
                alt="Rara Avis Logo"
                width={40}
                height={40}
                className="h-12 w-auto"
                priority
              />
              </a>
              <div className="ml-4 header-logo-text">
                <span className="text-xl font-bold text-foreground leading-tight">RARA AVIS</span>
              </div>
            </div>
              
            <div className="header-right">
              <a 
                href="https://x.com/raraavisapp" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-8 h-8 text-muted hover:text-foreground transition-colors"
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>
        </header>
        <main className="pt-20 pb-16 h-screen flex flex-col">
          {children}
        </main>
        <footer className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-default p-4 z-50 footer-shadow">
          <div className="footer-container">
            <div className="footer-tagline">
              <span className="text-sm text-muted leading-tight">Rara Avis is a product of Kai Roses, Inc. Essential tools for creators and collectors.</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
} 