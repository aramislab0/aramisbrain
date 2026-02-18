interface EventCardProps {
    event_type: string;
    description: string;
    created_at: string;
    metadata?: any;
}

const eventIcons: Record<string, string> = {
    'decision.created': '🎯',
    'decision.updated': '✏️',
    'project.updated': '📊',
    'focus.saved': '✍️',
    'risk.added': '⚠️',
    'ai.consulted': '🤖'
};

const eventLabels: Record<string, string> = {
    'decision.created': 'Décision créée',
    'decision.updated': 'Décision modifiée',
    'project.updated': 'Projet mis à jour',
    'focus.saved': 'Focus enregistré',
    'risk.added': 'Risque ajouté',
    'ai.consulted': 'IA consultée'
};

function getRelativeTime(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'il y a quelques secondes';
    if (diffMins < 60) return `il y a ${diffMins} min`;
    if (diffHours < 24) return `il y a ${diffHours}h`;
    if (diffDays < 7) return `il y a ${diffDays}j`;

    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short'
    });
}

export function EventCard({ event_type, description, created_at, metadata }: EventCardProps) {
    const icon = eventIcons[event_type] || '📌';
    const label = eventLabels[event_type] || 'Événement';

    return (
        <div className="bg-bg-secondary border border-gold-primary/20 rounded-lg p-4 hover:border-gold-primary/40 transition-all">
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="text-2xl flex-shrink-0">
                    {icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gold-primary">
                            {label}
                        </span>
                        <span className="text-xs text-text-muted">
                            {getRelativeTime(created_at)}
                        </span>
                    </div>

                    <p className="text-text-primary text-sm">
                        {description}
                    </p>

                    {/* Metadata (expandable) */}
                    {metadata && Object.keys(metadata).length > 0 && (
                        <details className="mt-2">
                            <summary className="text-xs text-text-secondary cursor-pointer hover:text-gold-primary transition-colors">
                                Métadonnées
                            </summary>
                            <pre className="mt-2 text-xs bg-bg-primary p-2 rounded overflow-x-auto text-text-secondary">
                                {JSON.stringify(metadata, null, 2)}
                            </pre>
                        </details>
                    )}
                </div>
            </div>
        </div>
    );
}
