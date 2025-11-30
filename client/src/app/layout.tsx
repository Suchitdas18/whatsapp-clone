import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'WhatsApp Clone - Real-time Chat Application',
    description: 'A feature-rich WhatsApp-style chat application built with Next.js, Socket.io, and MongoDB',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>{children}</body>
        </html>
    )
}
