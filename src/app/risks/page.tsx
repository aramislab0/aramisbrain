'use client';

import { useQuery } from '@tanstack/react-query';
import { RiskRadarChart } from '@/components/RiskRadarChart';

export default function RisksPage() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['risks-radar'],
        queryFn: async () => {
            const res = await fetch('/api/risks/radar');
            if (!res.ok) throw new Error('Failed to fetch risks');
            return res.json();
        },
        refetchInterval: 60000, // Refresh 1min
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-bg-primary p-8">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-3xl font-bold text-text-primary mb-2">⚠️ Radar de Risques</h1>
                    <p className="text-text-secondary mb-8">Chargement...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-bg-primary p-8">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-3xl font-bold text-text-primary mb-8">⚠️ Radar de Risques</h1>
                    <div className="bg-warning/10 border border-warning/30 rounded-lg p-6">
                        <h2 className="text-lg font-bold text-warning mb-2">⚙️ Configuration Supabase Requise</h2>
                        <p className="text-text-secondary mb-4">
                            Configurez vos credentials Supabase dans <code className="text-gold-primary bg-bg-secondary px-2 py-1 rounded">.env.local</code>
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
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-text-primary mb-2">⚠️ Radar de Risques</h1>
                    <p className="text-text-secondary">
                        Surveillance multi-dimensionnelle. Refresh automatique 1 min.
                    </p>
                </div>

                <RiskRadarChart
                    technical={data?.radar?.technical || 0}
                    administrative={data?.radar?.administrative || 0}
                    financial={data?.radar?.financial || 0}
                    dispersion={data?.radar?.dispersion || 0}
                />

                {/* Stats */}
                <div className="mt-8 bg-bg-secondary border border-gold-primary/20 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">📊 Statistiques</h3>
                    <p className="text-text-secondary">
                        {data?.risksCount || 0} risques actifs identifiés
                    </p>
                </div>
            </div>
        </div>
    );
}
