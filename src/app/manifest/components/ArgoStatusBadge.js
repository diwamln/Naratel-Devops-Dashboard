"use client";

import useSWR from 'swr';
import { 
  Activity, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  HelpCircle,
  Loader2
} from "lucide-react";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ArgoStatusBadge({ appName, label = "Status", compact = false }) {
  const { data, error, isLoading } = useSWR(
    appName ? `/api/manifest/argo-status?appName=${appName}` : null,
    fetcher,
    {
      refreshInterval: 5000, // Poll every 5 seconds
      dedupingInterval: 2000,
    }
  );

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 text-neutral-400 ${compact ? 'text-[10px]' : 'text-xs'}`}>
        <Loader2 size={compact ? 10 : 12} className="animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  // --- Error State ---
  if (error || data?.error) {
    return (
      <div className={`flex items-center gap-1.5 text-neutral-400 ${compact ? 'text-[10px]' : 'text-xs'}`} title="Failed to connect to ArgoCD">
        <HelpCircle size={compact ? 10 : 12} />
        <span>Unknown</span>
      </div>
    );
  }

  const { health, sync, operation } = data;

  // --- Not Found (Pending Deployment) ---
  if (data?.status === 'NotFound' || health === 'MissingConfig') {
    return (
      <div className={`flex items-center gap-1.5 text-amber-500 bg-amber-50 dark:bg-amber-900/10 px-2 py-0.5 rounded-full ${compact ? 'text-[9px]' : 'text-[10px]'} font-bold uppercase tracking-wider`}>
        <Clock size={compact ? 10 : 12} />
        <span>Pending</span>
      </div>
    );
  }

  // --- Status Logic ---
  const isHealthy = health === 'Healthy';
  const isSynced = sync === 'Synced';
  const isProgressing = health === 'Progressing' || operation === 'Running';
  const isDegraded = health === 'Degraded';

  // --- Visuals ---
  let badgeColor = "bg-neutral-100 text-neutral-500 border-neutral-200";
  let icon = <Activity size={compact ? 10 : 12} />;
  let statusText = health;

  if (isHealthy && isSynced) {
    badgeColor = "bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:border-green-900 dark:text-green-400";
    icon = <CheckCircle2 size={compact ? 10 : 12} />;
  } else if (isProgressing) {
    badgeColor = "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900 dark:text-blue-400";
    icon = <RefreshCw size={compact ? 10 : 12} className="animate-spin" />;
    statusText = "Syncing";
  } else if (isDegraded) {
    badgeColor = "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-900 dark:text-red-400";
    icon = <AlertCircle size={compact ? 10 : 12} />;
  } else if (!isSynced) {
    badgeColor = "bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900 dark:text-yellow-400";
    icon = <Activity size={compact ? 10 : 12} />;
    statusText = "Out of Sync";
  }

  return (
    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${badgeColor} ${compact ? 'text-[9px]' : 'text-[10px]'} font-bold uppercase tracking-wider transition-colors`}>
      {icon}
      <span>{statusText}</span>
    </div>
  );
}
