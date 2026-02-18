'use client';

import { useQuery } from '@tanstack/react-query';
import { ProjectCard } from '@/components/ProjectCard';
import { ProjectCardSkeleton } from '@/components/skeletons/ProjectCardSkeleton';
import { LayoutDashboard, AlertCircle, RefreshCw, Activity } from 'lucide-react';

export default function DashboardPage() {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['projects-cockpit'],
        queryFn: async () => {
            const res = await fetch('/api/projects/cockpit');
            if (!res.ok) throw new Error('Failed to fetch projects');
            return res.json();
        },
        refetchInterval: 30000,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-bg-primary p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-3 mb-1">
                        <LayoutDashboard size={24} className="text-gold-primary" strokeWidth={1.75} />
                        <h1 className="text-2xl font-bold text-text-primary">Cockpit Global</h1>
                    </div>
                    <p className="text-xs text-text-muted mb-8">Chargement...</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger">
                        {[1, 2, 3, 4, 5, 6].map(i => <ProjectCardSkeleton key={i} />)}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-bg-primary p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="glass-subtle rounded-2xl p-5 flex items-center gap-3">
                        <AlertCircle size={18} className="text-risk-critical shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm text-risk-critical font-medium">Erreur de chargement</p>
                            <p className="text-xs text-text-muted mt-0.5">{(error as Error).message}</p>
                        </div>
                        <button
                            onClick={() => refetch()}
                            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.04]"
                        >
                            <RefreshCw size={12} />
                            Réessayer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const projects = data?.projects || [];
    const projectCount = projects.length;

    return (
        <div className="min-h-screen bg-bg-primary px-8 py-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <LayoutDashboard size={24} className="text-gold-primary" strokeWidth={1.75} />
                                <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                                    Cockpit Global
                                </h1>
                            </div>
                            <p className="text-xs text-text-muted ml-9">
                                Vue d'ensemble temps réel —{' '}
                                <span className="text-gold-primary font-semibold">{projectCount}</span>{' '}
                                {projectCount === 1 ? 'projet actif' : 'projets actifs'}
                            </p>
                        </div>

                        {/* Live indicator */}
                        <div className="flex items-center gap-2 px-3 py-1.5 glass-subtle rounded-full">
                            <Activity size={11} className="text-success" />
                            <span className="text-[10px] text-success font-medium uppercase tracking-wider">Live</span>
                        </div>
                    </div>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger">
                    {projects.map((project: any) => (
                        <ProjectCard
                            key={project.id}
                            name={project.name}
                            code={project.slug}
                            completion={project.completion_percentage}
                            cashImpact={project.cash_impact_score}
                            riskLevel={project.risk_level}
                            currentBlocker={project.main_blocker}
                            nextAction={project.next_action}
                            daysToLaunch={project.daysToLaunch}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
