'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DecisionTimeline } from '@/components/DecisionTimeline';
import DecisionFilters from '@/components/DecisionFilters';
import { DecisionCardSkeleton } from '@/components/skeletons/DecisionCardSkeleton';
import { EmptyState } from '@/components/EmptyState';
import Link from 'next/link';

export default function DecisionsPage() {
    const [filters, setFilters] = useState({
        search: '',
        projectId: '',
        status: '',
        dateFrom: '',
        dateTo: '',
    });

    const { data, isLoading, error } = useQuery({
        queryKey: ['decisions', filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.projectId) params.append('project_id', filters.projectId);
            if (filters.status) params.append('status', filters.status);
            if (filters.dateFrom) params.append('date_from', filters.dateFrom);

            const res = await fetch(`/api/decisions?${params}`);
            if (!res.ok) throw new Error('Failed to fetch decisions');
            return res.json();
        },
    });

    // Fetch projects for filter dropdown
    const { data: projectsData } = useQuery({
        queryKey: ['projects-filter'],
        queryFn: async () => {
            const res = await fetch('/api/projects/cockpit');
            if (!res.ok) throw new Error('Failed to fetch projects');
            return res.json();
        },
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-bg-primary p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-text-primary mb-8">📝 Journal Décisions</h1>
                    <div className="space-y-4">
                        <DecisionCardSkeleton />
                        <DecisionCardSkeleton />
                        <DecisionCardSkeleton />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-bg-primary p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-text-primary mb-8">📝 Journal Décisions</h1>
                    <div className="bg-warning/10 border border-warning/30 rounded-lg p-6">
                        <h2 className="text-lg font-bold text-warning mb-2">⚙️ Configuration Supabase Requise</h2>
                        <p className="text-text-secondary mb-4">
                            Configurez vos credentials Supabase dans <code className="text-gold-primary bg-bg-secondary px-2 py-1 rounded">.env.local</code>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const projects = projectsData?.activeProjects || projectsData?.projects || [];

    return (
        <div className="min-h-screen bg-bg-primary p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary mb-2">📝 Journal Décisions</h1>
                        <p className="text-text-secondary">
                            Documentez toutes les décisions stratégiques — {data?.total || 0} décisions
                        </p>
                    </div>

                    <Link
                        href="/decisions/new"
                        className="btn-primary px-6 py-3"
                    >
                        + Nouvelle Décision
                    </Link>
                </div>

                {/* Filters Component */}
                <DecisionFilters
                    projects={projects}
                    onFilterChange={setFilters}
                />

                {/* Timeline */}
                {data?.decisions?.length === 0 ? (
                    <EmptyState
                        icon="📝"
                        title="Aucune décision enregistrée"
                        description="Commencez à documenter vos décisions stratégiques pour mieux piloter vos projets."
                        action={{
                            label: "Créer la première décision",
                            href: "/decisions/new"
                        }}
                    />
                ) : (
                    <DecisionTimeline decisions={data?.decisions || []} />
                )}
            </div>
        </div>
    );
}
