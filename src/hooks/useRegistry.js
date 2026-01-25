"use client";

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

/**
 * Custom hook to fetch and cache the application registry
 * This data is shared across all pages that need registry info
 */
export function useRegistry() {
    const { data, error, isLoading, mutate } = useSWR(
        '/api/manifest/next-id',
        fetcher,
        {
            revalidateOnFocus: false,      // Don't refetch when tab regains focus
            revalidateOnReconnect: true,   // Refetch when network reconnects
            dedupingInterval: 5000,        // Dedupe requests within 5 seconds
            keepPreviousData: true,        // Keep showing old data while fetching new
        }
    );

    // Sort apps by ID descending (newest first)
    const apps = data?.registry
        ? [...data.registry].sort((a, b) => parseInt(b.id) - parseInt(a.id))
        : [];

    return {
        apps,
        nextId: data?.nextId,
        isLoading,
        isError: error,
        mutate, // Expose mutate for manual revalidation after create/delete
    };
}

/**
 * Get a single app from the registry by name
 */
export function useApp(appName) {
    const { apps, isLoading, isError, mutate } = useRegistry();

    const decodedName = decodeURIComponent(appName || '');
    const app = apps.find(a => a.name.toLowerCase() === decodedName.toLowerCase());

    return {
        app,
        isLoading,
        isError,
        mutate,
    };
}
