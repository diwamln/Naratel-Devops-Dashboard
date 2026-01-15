// src/app/page.js

'use client';

import { useRouter } from 'next/navigation';
import Navigation from './components/Navigation';
import JenkinsDashboard from './components/JenkinsDashboard';

export default function DashboardPage() {
  const router = useRouter();

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
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 transition-colors">
      <Navigation activePage="jenkins" onPageChange={handlePageChange} />

      {/* Main content dengan margin kiri untuk desktop */}
      <main className="md:ml-56">
        <JenkinsDashboard />
      </main>
    </div>
  );
}