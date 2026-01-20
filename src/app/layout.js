// src/app/layout.js

import { Inter } from 'next/font/google';
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

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
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