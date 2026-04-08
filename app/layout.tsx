import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Analytics } from '@vercel/analytics/react';


// Fonts
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

// Metadata (SEO + Favicon + Social)
export const metadata: Metadata = {
  title: 'PCIU Room Management System',
  description:
    'Smart room availability and scheduling system for Port City International University. Check real-time room status, manage class schedules, and optimize classroom utilization.',
  
  keywords: [
    'PCIU',
    'Port City University',
    'Room Management',
    'Class Schedule',
    'Room Booking',
    'University System',
  ],

  authors: [{ name: 'Emamul Islam Nadid' }],

  openGraph: {
    title: 'PCIU Room Management System',
    description:
      'Smart room management for Port City International University',
    type: 'website',
  },

  icons: {
    icon: '/pciu.png',
    shortcut: '/pciu.png',
    apple: '/pciu.png',
  },

  manifest: '/manifest.json',
};

// Root Layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${poppins.variable} font-sans bg-light min-h-screen flex flex-col antialiased`}
        suppressHydrationWarning
      >
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}