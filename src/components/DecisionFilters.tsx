'use client';

import { useState } from 'react';

interface DecisionFiltersProps {
    projects: Array<{ id: string; name: string }>;
    onFilterChange: (filters: {
        search: string;
        projectId: string;
        status: string;
        dateFrom: string;
        dateTo: string;
    }) => void;
}

export default function DecisionFilters({
    projects,
    onFilterChange,
}: DecisionFiltersProps) {
    const [filters, setFilters] = useState({
        search: '',
        projectId: '',
        status: '',
        dateFrom: '',
        dateTo: '',
    });

    const handleChange = (field: string, value: string) => {
        const newFilters = { ...filters, [field]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleReset = () => {
        const resetFilters = {
            search: '',
            projectId: '',
            status: '',
            dateFrom: '',
            dateTo: '',
        };
        setFilters(resetFilters);
        onFilterChange(resetFilters);
    };

    const hasActiveFilters = Object.values(filters).some((v) => v !== '');

    return (
        <div className="bg-obsidian border border-border rounded-card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gold-executive">Filtres</h3>
                {hasActiveFilters && (
                    <button
                        onClick={handleReset}
                        className="btn-ghost text-sm px-3 py-1"
                    >
                        ✕ Réinitialiser
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div className="lg:col-span-2">
                    <label className="block text-xs text-text-tertiary mb-2">
                        Recherche
                    </label>
                    <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => handleChange('search', e.target.value)}
                        placeholder="🔍 Titre, contexte..."
                        className="w-full bg-pixel-dark border border-border rounded-input px-4 py-2 text-sm text-text-primary"
                    />
                </div>

                {/* Project Filter */}
                <div>
                    <label className="block text-xs text-text-tertiary mb-2">
                        Projet
                    </label>
                    <select
                        value={filters.projectId}
                        onChange={(e) => handleChange('projectId', e.target.value)}
                        className="w-full bg-pixel-dark border border-border rounded-input px-4 py-2 text-sm text-text-primary"
                    >
                        <option value="">Tous les projets</option>
                        {projects.map((project) => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Status Filter */}
                <div>
                    <label className="block text-xs text-text-tertiary mb-2">
                        Statut
                    </label>
                    <select
                        value={filters.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                        className="w-full bg-pixel-dark border border-border rounded-input px-4 py-2 text-sm text-text-primary"
                    >
                        <option value="">Tous les statuts</option>
                        <option value="active">Active</option>
                        <option value="executed">Executed</option>
                        <option value="reversed">Reversed</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>

                {/* Date Range - placeholder for future implementation */}
                <div>
                    <label className="block text-xs text-text-tertiary mb-2">
                        Date
                    </label>
                    <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => handleChange('dateFrom', e.target.value)}
                        className="w-full bg-pixel-dark border border-border rounded-input px-4 py-2 text-sm text-text-primary"
                    />
                </div>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex flex-wrap gap-2">
                        {filters.search && (
                            <span className="badge badge-gold text-xs">
                                Recherche: "{filters.search}"
                            </span>
                        )}
                        {filters.projectId && (
                            <span className="badge badge-gold text-xs">
                                Projet: {projects.find((p) => p.id === filters.projectId)?.name}
                            </span>
                        )}
                        {filters.status && (
                            <span className="badge badge-gold text-xs">
                                Statut: {filters.status}
                            </span>
                        )}
                        {filters.dateFrom && (
                            <span className="badge badge-gold text-xs">
                                Date: {filters.dateFrom}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
