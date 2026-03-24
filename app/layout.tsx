import type { Metadata, Viewport } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import './globals.css'
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' })
export const metadata: Metadata = { title: 'Roundnet Chile', description: 'La comunidad nacional de Roundnet', manifest: '/manifest.json', appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Roundnet Chile' } }
export const viewport: Viewport = { width: 'device-width', initialScale: 1, maximumScale: 1, themeColor: '#1A3A8F' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="es" className={`${inter.variable} ${montserrat.variable}`}><body><div className="app-shell">{children}</div></body></html>)
}