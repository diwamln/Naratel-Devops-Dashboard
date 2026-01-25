"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  X,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import AppList from "../manifest/components/AppList";
import { useRegistry } from "@/hooks/useRegistry";

export default function AppListDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';
  const action = searchParams.get('action');
  const messageParam = searchParams.get('message');

  // 🚀 SWR: Data fetched once, cached globally, instant on navigation back
  const { apps: existingApps, isLoading: isLoadingRegistry, mutate } = useRegistry();

  // Feedback Message
  const [message, setMessage] = useState(null);

  // View State
  const isCreating = action === 'create';

  const handleCloseCreate = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('action');
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    if (messageParam) {
      // eslint-disable-next-line
      setMessage({ text: messageParam, type: 'success' });
      // Clean URL
      const params = new URLSearchParams(searchParams);
      params.delete('message');
      window.history.replaceState(null, '', `${pathname}?${params.toString()}`);
    }
  }, [messageParam, pathname, searchParams]);

  const filteredApps = existingApps.filter(app =>
    app.name.toLowerCase().includes(searchQuery) ||
    app.id.toString().includes(searchQuery) ||
    (app.image && app.image.toLowerCase().includes(searchQuery)) ||
    (app.liveIngressProd && app.liveIngressProd.toLowerCase().includes(searchQuery))
  );

  const handleFormSuccess = (msg) => {
    handleCloseCreate();
    setMessage({ text: msg, type: 'success' });
    mutate(); // 🚀 Revalidate cache after create
  };

  return (
    <div className="w-full h-full flex flex-col">

      {/* Feedback Message (Page Level) */}
      {message && !isCreating && (
        <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2 ${message.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
          }`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto hover:opacity-70"><X size={16} /></button>
        </div>
      )}

      {isCreating ? (
        /* Create App View (Replaces AppList) */
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-white dark:bg-neutral-900 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col relative overflow-hidden">
            <div className="bg-white dark:bg-neutral-900 px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center z-10 sticky top-0">
              <div className="flex items-center gap-4">
                <button onClick={handleCloseCreate} className="flex items-center gap-2 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors" title="Back to App List">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                </button>
                <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800"></div>
                <h2 className="text-lg font-bold flex items-center gap-2 text-neutral-800 dark:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  New App Wizard
                </h2>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 relative">
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-2 mb-4 text-[#FFA500]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="14" x="2" y="3" rx="2"/>
                    <path d="M8 21h12"/>
                  </svg>
                  <h2 className="font-bold uppercase text-sm tracking-wider text-neutral-500 dark:text-neutral-400">Deployment Configuration</h2>
                </div>

                <div className="border-t border-neutral-200 dark:border-neutral-800 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm text-neutral-600 dark:text-neutral-300">Database Configuration</h3>
                  </div>

                  <div className="bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <ellipse cx="12" cy="5" rx="9" ry="3"/>
                            <path d="M3 12a9 3 0 0 0 18 0"/>
                            <path d="M3 5v14a9 3 0 0 0 18 0V5"/>
                          </svg>
                          Internal Database DNS
                        </h4>
                        <p className="text-xs text-neutral-500 mt-1">Connection string for your application to reach the database.</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 font-mono text-xs">
                      <span className="text-[#FFA500]">$</span>
                      <code className="flex-1 break-all">
                        svc-db-{'{app-name}'}-{'{id}'}.
                        {'{id}'}-db-{'{app-name}'}-prod.svc.cluster.local
                      </code>
                      <button type="button" className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-neutral-400 hover:text-white shrink-0" title="Copy DNS">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                        </svg>
                      </button>
                    </div>
                    <p className="text-[10px] text-neutral-500">Use this hostname to connect to your database from your application.</p>
                  </div>

                  <div className="bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-neutral-800 dark:text-neutral-200">Auto-Migration</h4>
                        <p className="text-xs text-neutral-500 mt-1">Run database migration before every deployment.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-[#FFA500]"></div>
                      </label>
                    </div>

                    <div className="animate-in fade-in slide-in-from-top-2">
                      <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Migration Command</label>
                      <div className="flex items-center gap-2 bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 font-mono text-xs">
                        <span className="text-[#FFA500]">$</span>
                        <input type="text" className="bg-transparent border-none outline-none w-full text-neutral-200 placeholder-neutral-600" placeholder="e.g. php artisan migrate --force" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center z-10 flex-wrap gap-4">
              <button type="button" onClick={handleCloseCreate} className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
                Back
              </button>

              <div className="text-xs text-neutral-500 max-w-xs text-right hidden md:block leading-tight">
                Generating <strong>Production</strong> manifests. Testing environments are ephemeral and created on-demand via Jenkins.
              </div>

              <button type="button" className="flex items-center gap-2 bg-[#FFA500] hover:bg-[#FFA500]/90 text-white font-bold py-2.5 px-8 rounded-lg shadow-lg shadow-orange-500/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="14" x="2" y="3" rx="2"/>
                  <path d="M8 21h12"/>
                </svg>
                Deploy App
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Apps Grid */}
          {isLoadingRegistry ? (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
              <Loader2 size={48} className="animate-spin text-[#FFA500] mb-4" />
              <p>Loading application registry...</p>
            </div>
          ) : (
            <AppList
              apps={filteredApps}
            />
          )}
        </>
      )}
    </div>
  );
}