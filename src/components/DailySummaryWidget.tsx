'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface DailySummary {
    date: string;
    stats: {
        decisions: number;
        events: number;
        activeProjects: number;
    };
    summary: string;
    highlights: string[];
}

export default function DailySummaryWidget() {
    const [isExpanded, setIsExpanded] = useState(false);

    const { data, isLoading, error } = useQuery<DailySummary>({
        queryKey: ['daily-summary'],
        queryFn: async () => {
            const res = await fetch('/api/summaries/daily');
            if (!res.ok) throw new Error('Failed to fetch summary');
            return res.json();
        },
    });

    if (error) {
        return (
            <div className="bg-obsidian border border-border rounded-card p-6 mb-6">
                <p className="text-text-tertiary">
                    Résumé quotidien temporairement indisponible
                </p>
            </div>
        );
    }

    return (
        <div className="bg-obsidian border border-gold-executive/30 rounded-card p-6 mb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">🧠</span>
                    <div>
                        <h2 className="text-xl font-semibold text-gold-executive">
                            Résumé Intelligence
                        </h2>
                        <p className="text-sm text-text-tertiary">
                            {new Date().toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="btn-secondary text-sm px-4 py-2"
                >
                    {isExpanded ? '▲ Réduire' : '▼ Développer'}
                </button>
            </div>

            {/* Stats Grid */}
            {isLoading ? (
                <div className="grid grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-pixel-dark rounded-lg p-4 animate-pulse"
                        >
                            <div className="h-4 bg-border rounded mb-2"></div>
                            <div className="h-6 bg-border rounded"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-4">
                    {/* Decisions */}
                    <div className="bg-pixel-dark border border-border rounded-lg p-4">
                        <p className="text-text-tertiary text-sm mb-1">Décisions</p>
                        <p className="text-2xl font-semibold text-gold-executive">
                            {data?.stats.decisions || 0}
                        </p>
                    </div>

                    {/* Events */}
                    <div className="bg-pixel-dark border border-border rounded-lg p-4">
                        <p className="text-text-tertiary text-sm mb-1">Événements</p>
                        <p className="text-2xl font-semibold text-gold-executive">
                            {data?.stats.events || 0}
                        </p>
                    </div>

                    {/* Projects */}
                    <div className="bg-pixel-dark border border-border rounded-lg p-4">
                        <p className="text-text-tertiary text-sm mb-1">Projets actifs</p>
                        <p className="text-2xl font-semibold text-gold-executive">
                            {data?.stats.activeProjects || 0}
                        </p>
                    </div>
                </div>
            )}

            {/* Expanded Summary */}
            {isExpanded && (
                <div className="mt-6 pt-6 border-t border-border animate-fadeIn">
                    {isLoading ? (
                        <div className="space-y-2">
                            <div className="h-4 bg-border rounded animate-pulse"></div>
                            <div className="h-4 bg-border rounded animate-pulse w-5/6"></div>
                            <div className="h-4 bg-border rounded animate-pulse w-4/6"></div>
                        </div>
                    ) : data?.summary ? (
                        <>
                            <h3 className="text-lg font-semibold mb-3">
                                Résumé Exécutif
                            </h3>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                {data.summary}
                            </p>

                            {data.highlights && data.highlights.length > 0 && (
                                <>
                                    <h4 className="text-md font-semibold mb-2 text-gold-executive">
                                        Points Clés
                                    </h4>
                                    <ul className="space-y-2">
                                        {data.highlights.map((highlight, index) => (
                                            <li
                                                key={index}
                                                className="flex items-start gap-2 text-text-secondary"
                                            >
                                                <span className="text-gold-executive mt-1">→</span>
                                                <span>{highlight}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-text-tertiary mb-2">
                                Aucun résumé disponible pour aujourd'hui
                            </p>
                            <p className="text-sm text-text-muted">
                                Les résumés IA seront générés automatiquement avec des données
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
