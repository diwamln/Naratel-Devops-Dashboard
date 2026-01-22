"use client";

import {
  GitBranch,
  Database,
  Globe,
  ChevronRight,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

function StatusSegment({ appName }) {
  const { data, isLoading } = useSWR(
    appName ? `/api/manifest/argo-status?appName=${appName}` : null,
    fetcher,
    { refreshInterval: 10000, dedupingInterval: 5000 }
  );

  if (isLoading) {
    return <div className="flex-1 bg-neutral-200 dark:bg-neutral-800 animate-pulse" />;
  }

  // Handle Missing/Pending
  if (!data || data.status === 'NotFound' || data.health === 'MissingConfig') {
     return <div className="flex-1 bg-neutral-200 dark:bg-neutral-700" title={`${appName}: Pending/Not Found`} />;
  }

  const { health, sync, operation } = data;
  const isHealthy = health === 'Healthy';
  const isSynced = sync === 'Synced';
  const isProgressing = health === 'Progressing' || operation === 'Running';
  const isDegraded = health === 'Degraded';

  let colorClass = "bg-neutral-300 dark:bg-neutral-600"; // Default/Unknown

  if (isDegraded) {
    colorClass = "bg-red-500";
  } else if (isProgressing) {
    colorClass = "bg-blue-500";
  } else if (!isSynced) {
    colorClass = "bg-yellow-500";
  } else if (isHealthy && isSynced) {
    colorClass = "bg-green-500";
  }

  return (
    <div 
      className={`flex-1 ${colorClass} transition-colors duration-500`} 
      title={`${appName}: ${health} / ${sync}`}
    />
  );
}

function AppCard({ app }) {
  const router = useRouter();

  // Define the deployments to track
  // We assume standard naming convention: [appName]-prod and [appName]-db-prod
  const deployments = [`${app.name}-prod`];
  if (app.db && app.db !== 'none') {
    deployments.push(`${app.name}-db-prod`);
  }

  return (
    <div 
      onClick={() => router.push(`/manifest/${app.name}`)}
      className="group bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md hover:border-orange-300 dark:hover:border-orange-800 transition-all cursor-pointer flex flex-col h-full relative overflow-hidden"
    >
      <div className="p-6 flex flex-col h-full relative z-10">
        {/* Hover Decoration */}
        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity text-orange-500">
          <ChevronRight size={20} />
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-600 dark:text-neutral-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
            <GitBranch size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white leading-tight">
              {app.name}
            </h3>
            <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
              ID: {app.id}
            </span>
          </div>
        </div>

        {/* Info Rows */}
        <div className="space-y-3 flex-1">
          
          {/* Domain Info */}
          <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
            <Globe size={16} className="shrink-0 text-neutral-400" />
            <span className="truncate font-medium">
              {app.liveIngressProd || "ClusterIP Only"}
            </span>
          </div>

          {/* Database Info */}
          <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
            <Database size={16} className="shrink-0 text-neutral-400" />
            <span className="capitalize">
              {app.db === 'none' ? 'No Database' : app.db}
            </span>
          </div>
        </div>
      </div>

      {/* Status Bar (Pinned to Bottom) */}
      <div className="h-1.5 w-full flex mt-auto relative z-20">
        {deployments.map(depName => (
          <StatusSegment key={depName} appName={depName} />
        ))}
      </div>
    </div>
  );
}

export default function AppList({ apps }) {
  if (apps.length === 0) {
    return (
        <div className="col-span-full py-20 text-center flex flex-col items-center justify-center text-neutral-500 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white/50 dark:bg-neutral-900/50">
            <GitBranch size={48} className="text-neutral-300 mb-4" />
            <p className="font-semibold text-lg">No applications found</p>
            <p className="text-sm max-w-sm mt-2">Get started by creating your first application manifest.</p>
        </div>
    );
  }

  return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {apps.map((app) => (
            <AppCard key={app.id} app={app} />
        ))}
      </div>
  );
}