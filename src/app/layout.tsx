import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QuantumOS - MOSS AI Operating System',
  description: 'MOSS人工智能操作系统 - 让人类永远保持理智',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Orbitron:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="crt-effect">{children}</body>
    </html>
  );
}
