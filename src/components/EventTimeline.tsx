'use client';

import { EventCard } from './EventCard';

interface Event {
    id: string;
    event_type: string;
    description: string;
    created_at: string;
    metadata?: any;
}

interface EventTimelineProps {
    events: Event[];
}

export function EventTimeline({ events }: EventTimelineProps) {
    // Group events by day
    const groupedEvents = events.reduce((acc, event) => {
        const dayKey = new Date(event.created_at).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        if (!acc[dayKey]) {
            acc[dayKey] = [];
        }
        acc[dayKey].push(event);
        return acc;
    }, {} as Record<string, Event[]>);

    if (events.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                    Aucun événement enregistré
                </h3>
                <p className="text-text-secondary">
                    Les événements système seront automatiquement enregistrés ici
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {Object.entries(groupedEvents).map(([day, dayEvents]) => (
                <div key={day}>
                    {/* Day Header */}
                    <div className="flex items-center gap-4 mb-4">
                        <h2 className="text-lg font-bold text-gold-primary capitalize">
                            {day}
                        </h2>
                        <div className="flex-1 h-px bg-gold-primary/20"></div>
                        <span className="text-sm text-text-secondary">
                            {dayEvents.length} {dayEvents.length > 1 ? 'événements' : 'événement'}
                        </span>
                    </div>

                    {/* Events List */}
                    <div className="space-y-3">
                        {dayEvents.map(event => (
                            <EventCard key={event.id} {...event} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
