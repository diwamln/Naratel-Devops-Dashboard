// src/app/layout.js

import { Poppins, Montserrat } from 'next/font/google';
import './globals.css';
import AuthProvider from './components/AuthProvider';
import ThemeProvider from './providers/ThemeProvider';
import { SidebarProvider } from './providers/SidebarProvider';

export const metadata = {
  title: 'Naratel Dashboard',
  description: 'Jenkins & Kubernetes Management Portal',
  icons: {
    icon: '/logo-icon.png',
  },
};

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-montserrat',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${poppins.variable} ${montserrat.variable}`}>
      <body className={montserrat.className}>
        <AuthProvider>
          <SidebarProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}