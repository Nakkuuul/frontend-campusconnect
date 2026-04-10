import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CampusConnect — Lost & Found',
  description: 'Smart Lost & Found Management System for Bennett University',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
