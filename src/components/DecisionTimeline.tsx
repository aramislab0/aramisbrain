'use client';

import { DecisionCard } from './DecisionCard';

interface Decision {
    id: string;
    title: string;
    date: string;
    status: 'active' | 'executed' | 'reversed';
    project?: {
        name: string;
        slug: string;
    } | null;
    decision_made: string;
}

interface DecisionTimelineProps {
    decisions: Decision[];
}

export function DecisionTimeline({ decisions }: DecisionTimelineProps) {
    // Group decisions by month
    const groupedDecisions = decisions.reduce((acc, decision) => {
        const monthKey = new Date(decision.date).toLocaleDateString('fr-FR', {
            month: 'long',
            year: 'numeric'
        });

        if (!acc[monthKey]) {
            acc[monthKey] = [];
        }
        acc[monthKey].push(decision);
        return acc;
    }, {} as Record<string, Decision[]>);

    if (decisions.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                    Aucune décision enregistrée
                </h3>
                <p className="text-text-secondary">
                    Commencez à documenter vos décisions stratégiques
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {Object.entries(groupedDecisions).map(([month, monthDecisions]) => (
                <div key={month}>
                    {/* Month Header */}
                    <div className="flex items-center gap-4 mb-4">
                        <h2 className="text-xl font-bold text-gold-primary capitalize">
                            {month}
                        </h2>
                        <div className="flex-1 h-px bg-gold-primary/20"></div>
                        <span className="text-sm text-text-secondary">
                            {monthDecisions.length} {monthDecisions.length > 1 ? 'décisions' : 'décision'}
                        </span>
                    </div>

                    {/* Decisions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {monthDecisions.map(decision => (
                            <DecisionCard
                                key={decision.id}
                                {...decision}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
