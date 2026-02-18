import Link from 'next/link';

interface EmptyStateProps {
    icon?: string;
    title: string;
    description?: string;
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
}

export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
    return (
        <div className="text-center py-16">
            <div className="text-6xl mb-4">{icon}</div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">{title}</h3>
            {description && (
                <p className="text-text-secondary mb-6 max-w-md mx-auto">{description}</p>
            )}
            {action && (
                action.href ? (
                    <Link
                        href={action.href}
                        className="inline-block btn-primary px-6 py-3"
                    >
                        {action.label}
                    </Link>
                ) : (
                    <button
                        onClick={action.onClick}
                        className="btn-primary px-6 py-3"
                    >
                        {action.label}
                    </button>
                )
            )}
        </div>
    );
}
