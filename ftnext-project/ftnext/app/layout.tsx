import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';
import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';

// Proposed typefaces — confirm with client (spec Section 10, item 3).
// Space_Grotesk stands in for the "geometric/grotesque headline" direction;
// swap for General Sans or client's final choice via next/font/local if needed.
const heading = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['500', '700'],
});

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: {
    default: 'FTNEXT — Global Logistics & Shipping',
    template: '%s | FTNEXT',
  },
  description: '[PLACEHOLDER] FTNEXT delivers world-class shipping, chartering, and logistics services across global trade routes. Contact us for reliable maritime solutions.',
  metadataBase: new URL('https://ftnext.com'), // [PLACEHOLDER] confirm final domain
  openGraph: {
    title: 'FTNEXT — Global Logistics & Shipping',
    description: '[PLACEHOLDER] FTNEXT delivers world-class shipping, chartering, and logistics services across global trade routes.',
    url: 'https://ftnext.com',
    siteName: 'FTNEXT',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon.png', type: 'image/png', sizes: '64x64' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body>
        <NavBar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
