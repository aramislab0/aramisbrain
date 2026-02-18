'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                // Cache pendant 5 minutes
                staleTime: 5 * 60 * 1000,

                // Garbage collection après 10 minutes
                gcTime: 10 * 60 * 1000,

                // Retry 2x en cas d'erreur
                retry: 2,

                // Refetch quand window regagne focus
                refetchOnWindowFocus: true,

                // Ne pas refetch au mount si data fraîche
                refetchOnMount: false,
            },
            mutations: {
                // Retry 1x pour mutations
                retry: 1,
            }
        }
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
