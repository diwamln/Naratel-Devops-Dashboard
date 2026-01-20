import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  CheckCircle, XCircle, Loader2, Clock, Activity, 
  AlertTriangle, WifiOff, Package, GitBranch, RefreshCw, Box, Server, Check
} from 'lucide-react';

// Helper di luar komponen agar tidak dibuat ulang setiap render
const extractVersion = (buildName) => {
  if (!buildName) return null;
  const versionMatch = buildName.match(/(\d+)\.(\d+)\.(\d+)/);
  if (!versionMatch) return null;
  return {
    full: versionMatch[0],
    major: parseInt(versionMatch[1], 10),
    minor: parseInt(versionMatch[2], 10),
    patch: parseInt(versionMatch[3], 10)
  };
};

export default function JenkinsDashboard() {
  const [builds, setBuilds] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading pertama kali
  const [isRefreshing, setIsRefreshing] = useState(false); // Loading saat background refresh
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [apiError, setApiError] = useState(false);
  
  // Ref untuk menghindari race condition pada fetch yang lambat
  const fetchCounter = useRef(0);

  // 1. Optimized Fetch Logic
  const fetchBuilds = useCallback(async (showSilentLoading = false) => {
    const currentFetchId = ++fetchCounter.current;
    if (showSilentLoading) setIsRefreshing(true);
    
    try {
      const res = await fetch('/api/jenkins/pending', {
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(8000) // Timeout 8s
      });

      if (currentFetchId !== fetchCounter.current) return; // Abaikan jika ada fetch yang lebih baru

      if (!res.ok) throw new Error('API_ERROR');

      const result = await res.json();
      const data = Array.isArray(result) ? result : (result.data || []);
      
      setBuilds(data);
      setApiError(false);
    } catch (error) {
      console.error('Fetch Error:', error);
      if (currentFetchId === fetchCounter.current) {
          setApiError(true);
      }
    } finally {
      if (currentFetchId === fetchCounter.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  // 2. Polling Effect
  useEffect(() => {
    fetchBuilds();
    const interval = setInterval(() => fetchBuilds(true), 10000);
    return () => clearInterval(interval);
  }, [fetchBuilds]);

  // 3. Heavy Computation Memoization
  // Logic grouping & sorting hanya berjalan jika 'builds' berubah
  const memoizedGroups = useMemo(() => {
    if (!builds.length) return { groups: {}, names: [] };

    // Grouping
    const groups = builds.reduce((acc, build) => {
      const job = build.jobName;
      if (!acc[job]) acc[job] = [];
      acc[job].push(build);
      return acc;
    }, {});

    // Sorting tiap group (Semantic Versioning)
    Object.keys(groups).forEach(jobName => {
      groups[jobName].sort((a, b) => {
        const vA = extractVersion(a.name);
        const vB = extractVersion(b.name);
        
        if (!vA && !vB) return b.timestamp - a.timestamp;
        if (!vA) return 1;
        if (!vB) return -1;
        
        if (vA.major !== vB.major) return vB.major - vA.major;
        if (vA.minor !== vB.minor) return vB.minor - vA.minor;
        return vB.patch - vA.patch;
      });
    });

    const sortedNames = Object.keys(groups).sort();
    return { groups, sortedNames };
  }, [builds]);

  // 4. Action Handler
  const handleAction = async (buildId, jobName, action) => {
    const actionKey = `${buildId}-${action}`;
    setActionLoading(actionKey);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/jenkins/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buildId, jobName, action })
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ text: data.message || 'Action processed successfully', type: 'success' });
        // Segera refresh data setelah aksi
        setTimeout(() => fetchBuilds(true), 1000);
      } else {
        throw new Error(data.message || 'Failed to execute action');
      }
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
      <div className="w-full">

        {/* Global Feedback Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2 ${ 
              message.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' 
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
            }`}>
            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            <span className="font-medium">{message.text}</span>
            <button onClick={() => setMessage({ text: '', type: '' })} className="ml-auto hover:opacity-70"><XCircle size={16}/></button>
          </div>
        )}

        {/* State Management Views */}
        {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
              <Loader2 size={48} className="animate-spin text-[#FFA500] mb-4" />
              <p>Syncing with Jenkins...</p>
            </div>
        ) : apiError ? (
          <div className="col-span-full py-20 text-center flex flex-col items-center justify-center text-neutral-500 border-2 border-dashed border-red-200 dark:border-red-800/50 rounded-2xl bg-red-50/50 dark:bg-red-900/10">
            <WifiOff size={48} className="text-red-300 mb-4" />
            <h3 className="font-semibold text-lg text-red-600 dark:text-red-400">Connection Failure</h3>
            <p className="text-sm max-w-sm mt-2">Failed to fetch data from Jenkins API endpoint. Ensure VPN or tunnel is active.</p>
            <button 
                onClick={() => fetchBuilds()}
                className="mt-6 flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 font-bold py-2 px-6 rounded-lg transition-all"
            >
                <RefreshCw size={18} /> Retry Connection
            </button>
          </div>
        ) : builds.length === 0 ? (
          <div className="col-span-full py-20 text-center flex flex-col items-center justify-center text-neutral-500 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white/50 dark:bg-neutral-900/50">
            <CheckCircle size={48} className="text-neutral-300 mb-4" />
            <p className="font-semibold text-lg">All caught up!</p>
            <p className="text-sm max-w-sm mt-2">No pipelines are currently waiting for approval.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {memoizedGroups.sortedNames.map((jobName) => (
              <div key={jobName} className="flex flex-col gap-4">
                {/* Group Header */}
                <div className="flex items-center gap-3 px-1">
                    <div className="p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-md">
                        <Package size={16} className="text-[#FFA500]" />
                    </div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">{jobName}</h2>
                    <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-xs font-mono font-bold px-2 py-0.5 rounded-full border border-neutral-200 dark:border-neutral-700">
                        {memoizedGroups.groups[jobName].length} PENDING
                    </span>
                    <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800 ml-2" />
                </div>

                {/* Cards Grid */}
                <div className="grid gap-4">
                  {memoizedGroups.groups[jobName].map((build) => {
                    const version = extractVersion(build.name);
                    const isProcessing = actionLoading && actionLoading.startsWith(build.id);
                    
                    return (
                      <div key={build.id} className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                          {/* Left: Build Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-700 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> WAITING INPUT
                                </span>
                                <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-neutral-200 dark:border-neutral-700">
                                    ID: {build.id}
                                </span>
                            </div>
                            
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                <GitBranch className="text-neutral-400" size={20} />
                                {version ? `v${version.full}` : build.name}
                            </h3>
                            
                            <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500 font-mono">
                                <div className="flex items-center gap-1.5">
                                    <Clock size={12} />
                                    <span>{new Date(build.timestamp).toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleAction(build.id, build.jobName, 'approve')}
                              disabled={!!actionLoading}
                              className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-green-600 dark:hover:bg-green-500 hover:text-white dark:hover:text-white transition-all shadow-sm disabled:opacity-50 flex items-center gap-2 min-w-[100px] justify-center"
                            >
                              {actionLoading === `${build.id}-approve` ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <><Check size={14} /> Deploy</>
                              )}
                            </button>

                            <button
                              onClick={() => handleAction(build.id, build.jobName, 'abort')}
                              disabled={!!actionLoading}
                              className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider bg-white text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-red-600 hover:border-red-600 dark:hover:bg-red-500 dark:hover:border-red-500 hover:text-white dark:hover:text-white transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
                            >
                              {actionLoading === `${build.id}-abort` ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <><XCircle size={14} /> Abort</>
                              )}
                            </button>
                          </div>
                        </div>
                        
                        {/* Status Footer Line (Optional decorative) */}
                        <div className="h-1 w-full bg-neutral-50 dark:bg-neutral-800/50 mt-0">
                             <div className="h-full bg-amber-500/20 w-full animate-pulse" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  );
}
