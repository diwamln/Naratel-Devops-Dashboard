'use client';

import { Search, Plus } from 'lucide-react';
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

  const handleSearch = (term) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const handleAddApp = () => {
    const params = new URLSearchParams(searchParams);
    params.set('action', 'create');
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 md:top-0 z-30 flex items-center justify-between gap-4 h-14 px-6 border-b border-neutral-200 dark:border-neutral-800 bg-gray-50/80 dark:bg-neutral-950/80 backdrop-blur-md">
        <div className="flex-1 min-w-0">
            <h1 className="text-sm md:text-base font-bold text-neutral-900 dark:text-white tracking-tight truncate">
                {getTitle()}
            </h1>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
            {pathname === '/manifest' && (
                <button
                    onClick={handleAddApp}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#FFA500] hover:bg-[#FFA500]/90 text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-orange-500/20 active:scale-95 whitespace-nowrap"
                >
                    <Plus size={14} />
                    <span className="hidden sm:inline">Add Application</span>
                    <span className="sm:hidden">Add</span>
                </button>
            )}

            <div className="relative w-40 md:w-64">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-neutral-400">
                    <Search size={14} />
                </div>
                <input
                    type="text"
                    placeholder="Search..."
                    className="block w-full pl-8 pr-3 py-1.5 border border-neutral-200 dark:border-neutral-800 rounded-lg leading-5 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#FFA500] text-xs transition-all shadow-sm"
                    onChange={(e) => handleSearch(e.target.value)}
                    defaultValue={searchParams.get('search')?.toString()}
                />
            </div>
        </div>
    </header>
  );
}
