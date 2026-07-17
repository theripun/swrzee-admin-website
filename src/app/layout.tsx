import { Inter } from 'next/font/google'
import './globals.css'
import { Metadata } from 'next'
import ClientLayout from '@/components/ui/client-layout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Admin dashboard for managing the application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
