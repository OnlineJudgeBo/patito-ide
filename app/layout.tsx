import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vibe Judge IDE',
  description: 'Modern competitive programming IDE built with Next.js, Monaco Editor, Tailwind CSS, and WebSockets-ready judge integration.',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
