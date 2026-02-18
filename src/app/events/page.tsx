'use client';

import { useQuery } from '@tanstack/react-query';
import { EventTimeline } from '@/components/EventTimeline';
import { EventFilters } from '@/components/EventFilters';
import { EventCardSkeleton } from '@/components/skeletons/EventCardSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { useState } from 'react';

export default function EventsPage() {
    const [filters, setFilters] = useState<{ event_type?: string; entity_type?: string }>({});

    const { data, isLoading, error } = useQuery({
        queryKey: ['events', filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.event_type) params.append('event_type', filters.event_type);
            if (filters.entity_type) params.append('entity_type', filters.entity_type);

            const res = await fetch(`/api/events?${params}`);
            if (!res.ok) throw new Error('Failed to fetch events');
            return res.json();
        },
        refetchInterval: 30000 // Auto-refresh every 30s
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-bg-primary p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-text-primary mb-8">📅 Événements</h1>
                    <div className="space-y-3">
                        <EventCardSkeleton />
                        <EventCardSkeleton />
                        <EventCardSkeleton />
                        <EventCardSkeleton />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-bg-primary p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-text-primary mb-8">📅 Événements</h1>
                    <div className="bg-warning/10 border border-warning/30 rounded-lg p-6">
                        <h2 className="text-lg font-bold text-warning mb-2">⚙️ Configuration Supabase Requise</h2>
                        <p className="text-text-secondary mb-4">
                            Configurez vos credentials Supabase dans <code className="text-gold-primary bg-bg-secondary px-2 py-1 rounded">.env.local</code>
                        </p>
                        <p className="text-sm text-text-muted">
                            📖 Guide détaillé dans <code className="text-gold-primary">walkthrough.md</code>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-primary p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-text-primary mb-2">📅 Timeline Événements</h1>
                    <p className="text-text-secondary">
                        Historique complet des activités — {data?.total || 0} événements enregistrés • Auto-refresh 30s
                    </p>
                </div>

                {/* Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filters Sidebar */}
                    <div className="lg:col-span-1">
                        <EventFilters onFilterChange={setFilters} />
                    </div>

                    {/* Timeline */}
                    <div className="lg:col-span-3">
                        {data?.events?.length === 0 ? (
                            <EmptyState
                                icon="📅"
                                title="Aucun événement enregistré"
                                description="Les événements sont créés automatiquement lorsque vous effectuez des actions dans Aramis Brain."
                                action={{
                                    label: "Retour au Cockpit",
                                    href: "/dashboard"
                                }}
                            />
                        ) : (
                            <EventTimeline events={data?.events || []} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
