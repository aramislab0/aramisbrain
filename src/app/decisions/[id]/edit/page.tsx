'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { DecisionForm } from '@/components/DecisionForm';

export default function EditDecisionPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['decision', params.id],
        queryFn: async () => {
            const res = await fetch(`/api/decisions/${params.id}`);
            if (!res.ok) throw new Error('Failed to fetch decision');
            return res.json();
        }
    });

    const { data: projectsData } = useQuery({
        queryKey: ['projects-filter'],
        queryFn: async () => {
            const res = await fetch('/api/projects/cockpit');
            if (!res.ok) throw new Error('Failed to fetch projects');
            return res.json();
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (formData: any) => {
            const res = await fetch(`/api/decisions/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to update decision');
            }

            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['decisions'] });
            queryClient.invalidateQueries({ queryKey: ['decision', params.id] });
            router.push(`/decisions/${params.id}`);
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

    return (
        <div className="min-h-screen bg-bg-primary p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-text-primary mb-2">✏️ Modifier la Décision</h1>
                    <p className="text-text-secondary">
                        Mettez à jour les informations de cette décision
                    </p>
                </div>

                {/* Form */}
                <div className="bg-bg-secondary border border-gold-primary/20 rounded-lg p-8">
                    <DecisionForm
                        initialData={data?.decision}
                        projects={projectsData?.projects || []}
                        onSubmit={(formData) => updateMutation.mutateAsync(formData)}
                        onCancel={() => router.push(`/decisions/${params.id}`)}
                    />
                </div>

                {updateMutation.isError && (
                    <div className="mt-4 bg-risk-critical/10 border border-risk-critical/30 rounded-lg p-4">
                        <p className="text-risk-critical">
                            ❌ Erreur: {(updateMutation.error as Error).message}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
