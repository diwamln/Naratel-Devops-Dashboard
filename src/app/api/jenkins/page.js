// src/app/page.js

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Navigation from './components/Navigation';
import JenkinsDashboard from './components/JenkinsDashboard';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect ke signin jika belum login
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  // Handler untuk navigation (redirect ke halaman lain)
  const handlePageChange = (page) => {
    if (page === 'jenkins') {
      router.push('/');
    } else if (page === 'k8s-secret') {
      router.push('/secrets');
    } else if (page === 'manifest') {
      router.push('/manifest');
    } else if (page === 'tools') {
      router.push('/tools');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navigation activePage="jenkins" onPageChange={handlePageChange} />
      <main>
        <JenkinsDashboard />
      </main>
    </div>
  );
}