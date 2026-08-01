import type { Metadata } from 'next';
import { JetBrains_Mono, Orbitron } from 'next/font/google';
import { ErrorBoundary } from '@/components/ui';
import { WebVitalsMonitor } from '@/components/monitoring/WebVitalsMonitor';
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
  title: 'QuantumOS - MOSS AI Operating System',
  description: 'MOSS人工智能操作系统 - 让人类永远保持理智',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${jetbrainsMono.variable} ${orbitron.variable}`}>
      <body className="crt-effect">
        <ErrorBoundary>
          <WebVitalsMonitor />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
