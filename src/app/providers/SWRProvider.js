"use client";

import { SWRConfig } from 'swr';
import { fetcher } from '@/lib/fetcher';

export default function SWRProvider({ children }) {
    return (
        <SWRConfig
            value={{
                fetcher,
                revalidateOnFocus: false,
                revalidateIfStale: true,
                shouldRetryOnError: true,
                errorRetryCount: 2,
            }}
        >
            {children}
        </SWRConfig>
    );
}
