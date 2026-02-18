'use client';

import { useState } from 'react';

interface EventFiltersProps {
    onFilterChange: (filters: { event_type?: string; entity_type?: string }) => void;
}

const eventTypes = [
    { value: 'decision.created', label: '🎯 Décision créée' },
    { value: 'decision.updated', label: '✏️ Décision modifiée' },
    { value: 'project.updated', label: '📊 Projet mis à jour' },
    { value: 'focus.saved', label: '✍️ Focus enregistré' },
    { value: 'risk.added', label: '⚠️ Risque ajouté' },
    { value: 'ai.consulted', label: '🤖 IA consultée' }
];

const entityTypes = [
    { value: 'decision', label: 'Décision' },
    { value: 'project', label: 'Projet' },
    { value: 'risk', label: 'Risque' },
    { value: 'focus', label: 'Focus' }
];

export function EventFilters({ onFilterChange }: EventFiltersProps) {
    const [selectedEventType, setSelectedEventType] = useState('');
    const [selectedEntityType, setSelectedEntityType] = useState('');

    const handleEventTypeChange = (value: string) => {
        setSelectedEventType(value);
        onFilterChange({
            event_type: value || undefined,
            entity_type: selectedEntityType || undefined
        });
    };

    const handleEntityTypeChange = (value: string) => {
        setSelectedEntityType(value);
        onFilterChange({
            event_type: selectedEventType || undefined,
            entity_type: value || undefined
        });
    };

    const clearFilters = () => {
        setSelectedEventType('');
        setSelectedEntityType('');
        onFilterChange({});
    };

    return (
        <div className="bg-bg-secondary border border-gold-primary/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Filtres</h3>

            <div className="space-y-4">
                {/* Event Type Filter */}
                <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">
                        Type d'événement
                    </label>
                    <select
                        value={selectedEventType}
                        onChange={(e) => handleEventTypeChange(e.target.value)}
                        className="w-full bg-bg-primary border border-gold-primary/30 rounded px-4 py-2 text-text-primary focus:border-gold-primary focus:outline-none transition-colors"
                    >
                        <option value="">Tous</option>
                        {eventTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>
                </div>

                {/* Entity Type Filter */}
                <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">
                        Type d'entité
                    </label>
                    <select
                        value={selectedEntityType}
                        onChange={(e) => handleEntityTypeChange(e.target.value)}
                        className="w-full bg-bg-primary border border-gold-primary/30 rounded px-4 py-2 text-text-primary focus:border-gold-primary focus:outline-none transition-colors"
                    >
                        <option value="">Tous</option>
                        {entityTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>
                </div>

                {/* Clear Button */}
                {(selectedEventType || selectedEntityType) && (
                    <button
                        onClick={clearFilters}
                        className="w-full px-4 py-2 bg-bg-primary text-gold-primary rounded hover:bg-bg-tertiary transition-colors text-sm font-medium"
                    >
                        Réinitialiser les filtres
                    </button>
                )}
            </div>
        </div>
    );
}
