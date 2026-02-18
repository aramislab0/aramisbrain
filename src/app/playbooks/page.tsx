'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function PlaybooksPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    // Wait for client-side hydration
    useEffect(() => {
        setMounted(true);
    }, []);

    const { data, isLoading, error } = useQuery({
        queryKey: ['playbooks'],
        queryFn: async () => {
            const res = await fetch('/api/playbooks');
            if (!res.ok) throw new Error('Failed to fetch playbooks');
            return res.json();
        },
        enabled: mounted, // Only fetch after mount
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/playbooks/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete playbook');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['playbooks'] });
            toast.success('✅ Playbook supprimé');
            setDeleteId(null);
        },
        onError: (error: Error) => {
            toast.error(`❌ Erreur : ${error.message}`);
        },
    });

    if (!mounted || isLoading) {
        return (
            <div className="min-h-screen bg-bg-primary p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-text-primary">📚 Playbooks</h1>
                        <div className="h-12 w-48 bg-bg-secondary animate-pulse rounded"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-bg-secondary border border-border rounded-lg p-6 animate-pulse">
                                <div className="h-6 bg-bg-primary rounded w-3/4 mb-4"></div>
                                <div className="h-4 bg-bg-primary rounded w-full mb-2"></div>
                                <div className="h-4 bg-bg-primary rounded w-5/6"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-bg-primary p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-text-primary mb-8">📚 Playbooks</h1>
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

    const playbooks = data?.playbooks || [];

    return (
        <div className="min-h-screen bg-bg-primary p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary mb-2">📚 Playbooks</h1>
                        <p className="text-text-secondary">
                            Règles décisionnelles et processus standardisés — {playbooks.length} playbooks actifs
                        </p>
                    </div>
                    <Link href="/playbooks/new" className="btn-primary px-6 py-3">
                        + Nouveau Playbook
                    </Link>
                </div>

                {/* Playbooks Grid */}
                {playbooks.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">📚</div>
                        <h3 className="text-xl font-semibold text-text-primary mb-2">
                            Aucun playbook configuré
                        </h3>
                        <p className="text-text-secondary mb-6">
                            Créez votre premier playbook pour standardiser vos processus
                        </p>
                        <Link href="/playbooks/new" className="btn-primary px-6 py-3 inline-block">
                            + Créer un Playbook
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {playbooks.map((playbook: any) => (
                            <div
                                key={playbook.id}
                                className="bg-obsidian border border-border rounded-card p-6 hover:border-gold-executive/40 transition-all"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-text-primary flex-1">
                                        {playbook.name}
                                    </h3>
                                    {playbook.is_active && (
                                        <span className="badge badge-success text-xs">Actif</span>
                                    )}
                                </div>

                                {/* Description */}
                                {playbook.description && (
                                    <p className="text-sm text-text-secondary mb-4 line-clamp-2">
                                        {playbook.description}
                                    </p>
                                )}

                                {/* Rules */}
                                {playbook.decision_rules && playbook.decision_rules.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-sm font-semibold text-text-primary mb-2">
                                            Règles ({playbook.decision_rules.length}):
                                        </p>
                                        <ul className="space-y-1">
                                            {playbook.decision_rules.slice(0, 3).map((rule: string, index: number) => (
                                                <li key={index} className="flex items-start gap-2 text-xs text-text-secondary">
                                                    <span className="text-gold-executive mt-0.5">•</span>
                                                    <span className="line-clamp-2">{rule}</span>
                                                </li>
                                            ))}
                                            {playbook.decision_rules.length > 3 && (
                                                <li className="text-xs text-text-muted italic">
                                                    ... et {playbook.decision_rules.length - 3} autres
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 pt-4 border-t border-border">
                                    <Link
                                        href={`/playbooks/${playbook.id}/edit`}
                                        className="btn-secondary text-sm px-4 py-2 flex-1 text-center"
                                    >
                                        ✏️ Modifier
                                    </Link>
                                    <button
                                        onClick={() => setDeleteId(playbook.id)}
                                        className="btn-danger text-sm px-4 py-2"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteId && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-obsidian border border-danger rounded-card p-6 max-w-md">
                            <h3 className="text-xl font-semibold text-danger mb-4">
                                Confirmer la suppression
                            </h3>
                            <p className="text-text-secondary mb-6">
                                Êtes-vous sûr de vouloir supprimer ce playbook ? Cette action est irréversible.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => deleteMutation.mutate(deleteId)}
                                    disabled={deleteMutation.isPending}
                                    className="btn-danger px-6 py-3 flex-1"
                                >
                                    {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
                                </button>
                                <button
                                    onClick={() => setDeleteId(null)}
                                    disabled={deleteMutation.isPending}
                                    className="btn-secondary px-6 py-3"
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
