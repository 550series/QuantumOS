import { JetBrains_Mono, Orbitron } from 'next/font/google';

import { PWAProvider } from '@/components/system/PWAProvider';
import { SoundEffects } from '@/components/system/SoundEffects';
import { ThemeProvider } from '@/components/system/ThemeProvider';
import { ErrorBoundary } from '@/components/ui';
import { WebVitals } from '@/components/WebVitals';

import type { Metadata } from 'next';
import './globals.css';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'QuantumOS - MOSS AI Operating System',
    template: '%s | QuantumOS',
  },
  description: 'MOSS人工智能操作系统 - 让人类永远保持理智',
  keywords: ['QuantumOS', 'MOSS', 'AI', '操作系统', '量子计算机', '550'],
  applicationName: 'QuantumOS',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icon.svg' }],
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://github.com/550series/QuantumOS',
    title: 'QuantumOS - MOSS AI Operating System',
    description: 'MOSS人工智能操作系统 - 让人类永远保持理智',
    siteName: 'QuantumOS',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'QuantumOS - MOSS AI Operating System',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuantumOS - MOSS AI Operating System',
    description: 'MOSS人工智能操作系统 - 让人类永远保持理智',
    images: ['/og-image.svg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={`${jetbrainsMono.variable} ${orbitron.variable}`}>
      <body className="crt-effect">
        <ThemeProvider />
        <PWAProvider />
        <SoundEffects />
        <ErrorBoundary>
          <WebVitals />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}