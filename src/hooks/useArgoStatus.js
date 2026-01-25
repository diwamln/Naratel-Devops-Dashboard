"use client";

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

/**
 * Custom hook to fetch and cache ArgoCD status for an app
 * Each app status is cached independently
 */
export function useArgoStatus(argoAppName, options = {}) {
    const { data, error, isLoading } = useSWR(
        argoAppName ? `/api/manifest/argo-status?appName=${argoAppName}` : null,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 10000,       // ArgoCD status can be cached longer
            refreshInterval: options.autoRefresh ? 30000 : 0, // Optional: auto-refresh every 30s
            keepPreviousData: true,
            ...options,
        }
    );

    return {
        health: data?.health,
        status: data?.status,
        isLoading,
        isError: error,
        exists: data?.health && data?.health !== 'MissingConfig' && data?.status !== 'NotFound',
    };
}
