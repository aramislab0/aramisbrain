'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FocusCard } from '@/components/FocusCard';

export default function FocusPage() {
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ['daily-focus'],
        queryFn: async () => {
            const res = await fetch('/api/focus/today');
            if (!res.ok) throw new Error('Failed to fetch focus');
            return res.json();
        }
    });

    const saveMutation = useMutation({
        mutationFn: async (focusData: any) => {
            const res = await fetch('/api/focus/today', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(focusData)
            });
            if (!res.ok) throw new Error('Failed to save');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['daily-focus'] });
        }
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-bg-primary p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-text-primary mb-2">🎯 Focus du Jour</h1>
                    <p className="text-text-secondary mb-8">Chargement...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-bg-primary p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-text-primary mb-8">🎯 Focus du Jour</h1>
                    <div className="bg-warning/10 border border-warning/30 rounded-lg p-6">
                        <h2 className="text-lg font-bold text-warning mb-2">⚙️ Configuration Supabase Requise</h2>
                        <p className="text-text-secondary mb-4">
                            Configurez vos credentials Supabase dans  <code className="text-gold-primary bg-bg-secondary px-2 py-1 rounded">.env.local</code>
                        </p>
                        <p className="text-sm text-text-muted">
                            📖 Guide détaillé dans <code className="text-gold-primary">walkthrough.md</code> → section "Configuration Requise"
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-primary p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-text-primary mb-2">🎯 Focus du Jour</h1>
                    <p className="text-text-secondary">
                        Définissez vos 3 priorités. Sauvegarde automatique.
                    </p>
                </div>

                <FocusCard
                    initialPriorities={data?.focus?.priorities || ['', '', '']}
                    initialCriticalRisk={data?.focus?.critical_risk || ''}
                    initialDecisionNeeded={data?.focus?.decision_needed || ''}
                    initialIgnoreToday={data?.focus?.ignore_today || ''}
                    onSave={(focusData) => saveMutation.mutateAsync(focusData)}
                />
            </div>
        </div>
    );
}
