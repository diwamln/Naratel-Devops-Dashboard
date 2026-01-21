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
    <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
                {getTitle()}
            </h1>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {pathname === '/manifest' && (
                <button
                    onClick={handleAddApp}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#FFA500] hover:bg-[#FFA500]/90 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-orange-500/20 active:scale-95 whitespace-nowrap"
                >
                    <Plus size={18} />
                    <span>Add Application</span>
                </button>
            )}

            <div className="relative w-full md:w-80">
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
        </div>
    </header>
  );
}
