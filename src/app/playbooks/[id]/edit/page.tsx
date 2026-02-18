'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import PlaybookForm from '@/components/PlaybookForm';

export default function EditPlaybookPage() {
    const params = useParams();
    const id = params.id as string;

    const { data, isLoading, error } = useQuery({
        queryKey: ['playbook', id],
        queryFn: async () => {
            const res = await fetch(`/api/playbooks/${id}`);
            if (!res.ok) throw new Error('Failed to fetch playbook');
            return res.json();
        },
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-bg-primary p-8">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold text-text-primary mb-8">
                        Chargement...
                    </h1>
                    <div className="bg-obsidian border border-border rounded-card p-8 animate-pulse">
                        <div className="h-6 bg-border rounded mb-4"></div>
                        <div className="h-4 bg-border rounded w-3/4"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-bg-primary p-8">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-danger/10 border border-danger text-danger px-4 py-3 rounded-lg">
                        Erreur lors du chargement du playbook
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-primary p-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-text-primary mb-2">
                        📚 Modifier Playbook
                    </h1>
                    <p className="text-text-secondary">
                        Modifier : {data?.playbook?.name}
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-obsidian border border-border rounded-card p-8">
                    <PlaybookForm mode="edit" playbook={data?.playbook} />
                </div>
            </div>
        </div>
    );
}
