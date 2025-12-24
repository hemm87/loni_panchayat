import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: 'Loni Panchayat Tax Manager | Modern Tax Management System',
  description: 'Professional tax management system for Loni Gram Panchayat, District Burhanpur. Manage properties, generate bills, track payments, and view comprehensive reports with an intuitive, modern interface.',
  keywords: 'tax management, panchayat, property tax, billing system, Loni, Burhanpur, Madhya Pradesh',
  authors: [{ name: 'Loni Gram Panchayat' }],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    title: 'Loni Gram Panchayat Tax Manager',
    description: 'Modern tax management system for Loni Gram Panchayat, District Burhanpur',
    siteName: 'Loni Tax Manager',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        
        {/* Premium Fonts - Including Noto Sans for proper Rupee symbol support */}
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Noto+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        
        {/* Theme Color */}
        <meta name="theme-color" content="hsl(221, 83%, 53%)" />
      </head>
      <body 
        className={cn(
          'font-body antialiased',
          'bg-background text-foreground',
          'min-h-screen',
          'transition-colors duration-300'
        )}
      >
        <ErrorBoundary>
          <FirebaseClientProvider>
            <div className="relative flex min-h-screen flex-col">
              <main className="flex-1">
                {children}
              </main>
            </div>
          </FirebaseClientProvider>
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  );
}
