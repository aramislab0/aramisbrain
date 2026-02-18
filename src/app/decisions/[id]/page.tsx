'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

const statusConfig = {
    active: { label: 'Active', color: 'text-info' },
    executed: { label: 'Exécutée', color: 'text-success' },
    reversed: { label: 'Annulée', color: 'text-warning' }
};

export default function DecisionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const { data, isLoading, error } = useQuery({
        queryKey: ['decision', params.id],
        queryFn: async () => {
            const res = await fetch(`/api/decisions/${params.id}`);
            if (!res.ok) throw new Error('Failed to fetch decision');
            return res.json();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/decisions/${params.id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed to delete');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['decisions'] });
            router.push('/decisions');
        }
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-bg-primary p-8">
                <div className="max-w-4xl mx-auto">
                    <p className="text-text-secondary">Chargement...</p>
                </div>
            </div>
        );
    }

    if (error || !data?.decision) {
        return (
            <div className="min-h-screen bg-bg-primary p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-risk-critical/10 border border-risk-critical/30 rounded-lg p-4">
                        <p className="text-risk-critical">❌ Décision non trouvée</p>
                    </div>
                </div>
            </div>
        );
    }

    const decision = data.decision;
    const config = statusConfig[decision.status as keyof typeof statusConfig];

    return (
        <div className="min-h-screen bg-bg-primary p-8">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <Link
                    href="/decisions"
                    className="inline-flex items-center text-gold-primary hover:text-gold-hover transition-colors mb-6"
                >
                    ← Retour aux décisions
                </Link>

                {/* Header */}
                <div className="bg-bg-secondary border border-gold-primary/20 rounded-lg p-8 mb-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-text-primary mb-2">
                                {decision.title}
                            </h1>
                            <p className="text-text-secondary">
                                {new Date(decision.date).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </p>
                        </div>

                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${config.color} bg-bg-primary border border-current/30`}>
                            {config.label}
                        </span>
                    </div>

                    {/* Project */}
                    {decision.projects && (
                        <div className="mb-4">
                            <span className="inline-block px-3 py-1 bg-bg-primary border border-gold-primary/20 rounded-full text-sm text-gold-primary">
                                {decision.projects.name}
                            </span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Link
                            href={`/decisions/${params.id}/edit`}
                            className="px-4 py-2 bg-gold-primary text-bg-primary rounded font-medium hover:bg-gold-hover transition-colors"
                        >
                            ✏️ Modifier
                        </Link>

                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-4 py-2 bg-risk-critical/20 text-risk-critical rounded font-medium hover:bg-risk-critical/30 transition-colors"
                        >
                            🗑️ Supprimer
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {/* Context */}
                    {decision.context && (
                        <Section title="Contexte">
                            <p className="text-text-primary whitespace-pre-wrap">{decision.context}</p>
                        </Section>
                    )}

                    {/* Options Considered */}
                    {decision.options_considered && decision.options_considered.length > 0 && (
                        <Section title="Options Considérées">
                            <ul className="space-y-2">
                                {decision.options_considered.map((option: string, index: number) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="text-gold-primary mt-1">•</span>
                                        <span className="text-text-primary">{option}</span>
                                    </li>
                                ))}
                            </ul>
                        </Section>
                    )}

                    {/* Decision Made */}
                    <Section title="Décision Prise">
                        <p className="text-text-primary whitespace-pre-wrap font-semibold">{decision.decision_made}</p>
                    </Section>

                    {/* Rationale */}
                    {decision.rationale && (
                        <Section title="Justification">
                            <p className="text-text-primary whitespace-pre-wrap">{decision.rationale}</p>
                        </Section>
                    )}

                    {/* Consequences */}
                    {decision.consequences && (
                        <Section title="Conséquences Anticipées">
                            <p className="text-text-primary whitespace-pre-wrap">{decision.consequences}</p>
                        </Section>
                    )}

                    {/* Revisit Date */}
                    {decision.revisit_date && (
                        <Section title="Date de Révision">
                            <p className="text-text-primary">
                                {new Date(decision.revisit_date).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </p>
                        </Section>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-bg-secondary border border-risk-critical/30 rounded-lg p-6 max-w-md w-full">
                            <h3 className="text-xl font-bold text-text-primary mb-4">
                                Confirmer la suppression
                            </h3>
                            <p className="text-text-secondary mb-6">
                                Êtes-vous sûr de vouloir supprimer cette décision ? Cette action est irréversible.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => deleteMutation.mutate()}
                                    disabled={deleteMutation.isPending}
                                    className="flex-1 bg-risk-critical text-white px-4 py-2 rounded font-medium hover:bg-risk-critical/80 transition-colors disabled:opacity-50"
                                >
                                    {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 bg-bg-primary text-text-primary px-4 py-2 rounded font-medium hover:bg-bg-tertiary transition-colors"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-bg-secondary border border-gold-primary/20 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gold-primary mb-3">{title}</h2>
            {children}
        </div>
    );
}
