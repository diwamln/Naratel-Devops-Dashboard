"use client";

import {
  GitBranch,
  Database,
  Globe,
  ChevronRight,
  Loader2,
  Box,
  ExternalLink,
  Activity,
  TestTube
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

  if (!data || data.status === 'NotFound' || data.health === 'MissingConfig') {
    return <div className="flex-1 bg-neutral-300 dark:bg-neutral-700" title={`${appName}: Pending/Missing`} />;
  }

  const { health, sync, operation } = data;
  const isHealthy = health === 'Healthy';
  const isSynced = sync === 'Synced';
  const isProgressing = health === 'Progressing' || operation === 'Running';
  const isDegraded = health === 'Degraded';

  let colorClass = "bg-neutral-400 dark:bg-neutral-600";

  if (isDegraded) {
    colorClass = "bg-red-500";
  } else if (isProgressing) {
    colorClass = "bg-amber-500";
  } else if (!isSynced) {
    colorClass = "bg-yellow-500";
  } else if (isHealthy && isSynced) {
    colorClass = "bg-emerald-500";
  }

  return (
    <div
      className={`flex-1 ${colorClass} transition-colors duration-500`}
      title={`${appName}: ${health} / ${sync}`}
    />
  );
}

function StatusBadge({ appName, label = "Prod" }) {
  const { data, isLoading } = useSWR(
    appName ? `/api/manifest/argo-status?appName=${appName}` : null,
    fetcher,
    { refreshInterval: 10000, dedupingInterval: 5000 }
  );

  if (isLoading) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
        <Loader2 size={10} className="animate-spin" />
      </span>
    );
  }

  if (!data || data.status === 'NotFound' || data.health === 'MissingConfig') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800">
        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600" />
        {label}: Pending
      </span>
    );
  }

  const { health, sync, operation } = data;
  const isHealthy = health === 'Healthy';
  const isSynced = sync === 'Synced';
  const isProgressing = health === 'Progressing' || operation === 'Running';
  const isDegraded = health === 'Degraded';

  if (isDegraded) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        {label}: Degraded
      </span>
    );
  }

  if (isProgressing) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        {label}: Syncing
      </span>
    );
  }

  if (!isSynced) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
        {label}: OutOfSync
      </span>
    );
  }

  if (isHealthy && isSynced) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        {label}: Healthy
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium text-neutral-400 bg-neutral-100 dark:bg-neutral-800">
      {label}: Unknown
    </span>
  );
}

function TestingIndicator({ appId, appName }) {
  const testArgoName = `${appId}-${appName}-testing`;
  const { data } = useSWR(
    `/api/manifest/argo-status?appName=${testArgoName}`,
    fetcher,
    { refreshInterval: 10000, dedupingInterval: 5000 }
  );

  const exists = data?.health && data?.health !== 'MissingConfig' && data?.status !== 'NotFound';

  if (!exists) return null;

  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/50 animate-in fade-in zoom-in duration-300">
      <TestTube size={10} />
      TESTING ACTIVE
    </div>
  );
}

function AppCard({ app }) {
  const router = useRouter();

  // Correct Naming Convention: ID-NAME-prod
  const prodName = `${app.id}-${app.name}-prod`;
  const dbProdName = `${app.id}-db-${app.name}-prod`;

  const deployments = [prodName];
  if (app.db && app.db !== 'none') {
    deployments.push(dbProdName);
  }

  return (
    <div
      onClick={() => router.push(`/manifest/${app.name}`)}
      className="group bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col h-full overflow-hidden"
    >
      <div className="p-5 flex flex-col h-full">
        {/* Top Row: ID & Indicators */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
              #{app.id}
            </span>
            {/* Dynamic Testing Indicator */}
            <TestingIndicator appId={app.id} appName={app.name} />
          </div>
          
          <div className="flex items-center gap-2">
            <StatusBadge appName={prodName} label="Prod" />
          </div>
        </div>

        {/* App Name */}
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors">
            <Box size={18} strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white leading-tight truncate flex items-center gap-2">
              {app.name}
              <ChevronRight size={14} className="text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity -ml-1 group-hover:ml-0" />
            </h3>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-mono mt-0.5 truncate">
              {app.image || 'No image'}
            </p>
          </div>
        </div>

        {/* Info Row */}
        <div className="flex items-center gap-3 mt-auto pt-3 border-t border-neutral-100 dark:border-neutral-800">
          {/* Domain */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 min-w-0 flex-1">
            <Globe size={12} className="shrink-0 text-neutral-400" />
            {app.liveIngressProd ? (
              <a
                href={`http://${app.liveIngressProd}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="truncate hover:text-neutral-700 dark:hover:text-neutral-300 hover:underline"
              >
                {app.liveIngressProd}
              </a>
            ) : (
              <span className="text-neutral-400 dark:text-neutral-500">Internal</span>
            )}
          </div>

          {/* Database */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 shrink-0">
            <Database size={12} className="text-neutral-400" />
            <span className="uppercase text-[10px] font-medium">
              {app.db === 'none' ? '—' : app.db}
            </span>
          </div>
        </div>
      </div>

      {/* Status Bar (Prod only for clean look) */}
      <div className="h-1 w-full flex mt-auto">
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
      <div className="col-span-full py-20 text-center flex flex-col items-center justify-center text-neutral-500 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900/50">
        <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-xl mb-4">
          <Box size={32} strokeWidth={1.5} className="text-neutral-400" />
        </div>
        <p className="font-medium text-neutral-600 dark:text-neutral-400">No applications found</p>
        <p className="text-sm max-w-xs mt-2 text-neutral-400">
          Create your first application using the button above.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {apps.map((app) => (
        <AppCard key={app.id} app={app} />
      ))}
    </div>
  );
}