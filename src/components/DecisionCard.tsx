import Link from 'next/link';

interface DecisionCardProps {
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

const statusConfig = {
    active: { label: 'Active', color: 'text-info border-info/30 bg-info/10' },
    executed: { label: 'Exécutée', color: 'text-success border-success/30 bg-success/10' },
    reversed: { label: 'Annulée', color: 'text-warning border-warning/30 bg-warning/10' }
};

export function DecisionCard({ id, title, date, status, project, decision_made }: DecisionCardProps) {
    const config = statusConfig[status];

    return (
        <Link
            href={`/decisions/${id}`}
            className="block bg-bg-secondary border border-gold-primary/20 rounded-lg p-5 hover:border-gold-primary/40 hover:shadow-lg hover:shadow-gold-primary/10 transition-all duration-200"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text-primary mb-1 line-clamp-2">
                        {title}
                    </h3>
                    <p className="text-sm text-text-secondary">
                        {new Date(date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}
                    </p>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.color} whitespace-nowrap ml-3`}>
                    {config.label}
                </span>
            </div>

            {/* Project Pill */}
            {project && (
                <div className="mb-3">
                    <span className="inline-block px-3 py-1 bg-bg-primary border border-gold-primary/20 rounded-full text-xs text-gold-primary">
                        {project.name}
                    </span>
                </div>
            )}

            {/* Decision Preview */}
            <p className="text-text-secondary text-sm line-clamp-2">
                {decision_made}
            </p>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-gold-primary/10">
                <span className="text-xs text-gold-primary hover:text-gold-hover transition-colors">
                    Voir détails →
                </span>
            </div>
        </Link>
    );
}
