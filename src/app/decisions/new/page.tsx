'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DecisionForm } from '@/components/DecisionForm';
import { useRouter } from 'next/navigation';

export default function NewDecisionPage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    // Fetch projects for dropdown
    const { data: projectsData } = useQuery({
        queryKey: ['projects-filter'],
        queryFn: async () => {
            const res = await fetch('/api/projects/cockpit');
            if (!res.ok) throw new Error('Failed to fetch projects');
            return res.json();
        }
    });

    const createMutation = useMutation({
        mutationFn: async (formData: any) => {
            const res = await fetch('/api/decisions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to create decision');
            }

            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['decisions'] });
            router.push('/decisions');
        }
    });

    const handleSubmit = async (data: any) => {
        await createMutation.mutateAsync(data);
    };

    return (
        <div className="min-h-screen bg-bg-primary p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-text-primary mb-2">📝 Nouvelle Décision</h1>
                    <p className="text-text-secondary">
                        Documentez une décision stratégique importante
                    </p>
                </div>

                {/* Form */}
                <div className="bg-bg-secondary border border-gold-primary/20 rounded-lg p-8">
                    <DecisionForm
                        projects={projectsData?.projects || []}
                        onSubmit={handleSubmit}
                        onCancel={() => router.push('/decisions')}
                    />
                </div>

                {createMutation.isError && (
                    <div className="mt-4 bg-risk-critical/10 border border-risk-critical/30 rounded-lg p-4">
                        <p className="text-risk-critical">
                            ❌ Erreur: {(createMutation.error as Error).message}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
