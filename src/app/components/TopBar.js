'use client';

import { Search } from 'lucide-react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export default function TopBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const getTitle = () => {
    if (pathname === '/') return 'Approval Gateway';
    if (pathname === '/manifest') return 'Application Registry';
    if (pathname === '/tools') return 'Tools & Services';
    return 'DevOps Dashboard';
  };

  return (
    <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
                {getTitle()}
            </h1>
        </div>
        
        <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-neutral-400" />
            </div>
            <input
                type="text"
                placeholder="Search..."
                className="block w-full pl-10 pr-3 py-2.5 border border-neutral-200 dark:border-neutral-800 rounded-xl leading-5 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FFA500]/50 focus:border-[#FFA500] sm:text-sm transition-all shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700"
                onChange={(e) => handleSearch(e.target.value)}
                defaultValue={searchParams.get('search')?.toString()}
            />
        </div>
    </header>
  );
}
