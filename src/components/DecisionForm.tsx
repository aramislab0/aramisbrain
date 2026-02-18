'use client';

import { useState } from 'react';

interface DecisionFormProps {
    initialData?: any;
    projects?: any[];
    onSubmit: (data: any) => Promise<void>;
    onCancel?: () => void;
}

export function DecisionForm({ initialData, projects = [], onSubmit, onCancel }: DecisionFormProps) {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        project_id: initialData?.project_id || '',
        date: initialData?.date || new Date().toISOString().split('T')[0],
        context: initialData?.context || '',
        decision_made: initialData?.decision_made || '',
        rationale: initialData?.rationale || '',
        consequences: initialData?.consequences || '',
        status: initialData?.status || 'active',
        revisit_date: initialData?.revisit_date || '',
        options_considered: initialData?.options_considered || ['']
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Filter empty options
            const cleanedOptions = formData.options_considered.filter((opt: string) => opt.trim() !== '');

            await onSubmit({
                ...formData,
                options_considered: cleanedOptions
            });
        } catch (error) {
            console.error('Submit error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const addOption = () => {
        setFormData(prev => ({
            ...prev,
            options_considered: [...prev.options_considered, '']
        }));
    };

    const updateOption = (index: number, value: string) => {
        const newOptions = [...formData.options_considered];
        newOptions[index] = value;
        setFormData(prev => ({ ...prev, options_considered: newOptions }));
    };

    const removeOption = (index: number) => {
        setFormData(prev => ({
            ...prev,
            options_considered: prev.options_considered.filter((_: any, i: number) => i !== index)
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                    Titre de la décision *
                </label>
                <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-bg-primary border border-gold-primary/30 rounded px-4 py-3 text-text-primary focus:border-gold-primary focus:outline-none transition-colors"
                    placeholder="Ex: Lancer WURUS beta ou attendre Q2 ?"
                />
            </div>

            {/* Project & Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">
                        Projet (optionnel)
                    </label>
                    <select
                        value={formData.project_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, project_id: e.target.value }))}
                        className="w-full bg-bg-primary border border-gold-primary/30 rounded px-4 py-3 text-text-primary focus:border-gold-primary focus:outline-none transition-colors"
                    >
                        <option value="">Aucun projet</option>
                        {projects.map(project => (
                            <option key={project.id} value={project.id}>{project.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">
                        Date
                    </label>
                    <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full bg-bg-primary border border-gold-primary/30 rounded px-4 py-3 text-text-primary focus:border-gold-primary focus:outline-none transition-colors"
                    />
                </div>
            </div>

            {/* Context */}
            <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                    Contexte
                </label>
                <textarea
                    value={formData.context}
                    onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
                    rows={3}
                    className="w-full bg-bg-primary border border-gold-primary/30 rounded px-4 py-3 text-text-primary focus:border-gold-primary focus:outline-none transition-colors"
                    placeholder="Quelle était la situation qui a mené à cette décision ?"
                />
            </div>

            {/* Options Considered */}
            <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                    Options considérées
                </label>
                {formData.options_considered.map((option: string, index: number) => (
                    <div key={index} className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            className="flex-1 bg-bg-primary border border-gold-primary/30 rounded px-4 py-2 text-text-primary focus:border-gold-primary focus:outline-none transition-colors"
                            placeholder={`Option ${index + 1}`}
                        />
                        {formData.options_considered.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeOption(index)}
                                className="px-3 py-2 bg-risk-critical/20 text-risk-critical rounded hover:bg-risk-critical/30 transition-colors"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addOption}
                    className="text-sm text-gold-primary hover:text-gold-hover transition-colors"
                >
                    + Ajouter option
                </button>
            </div>

            {/* Decision Made */}
            <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                    Décision prise *
                </label>
                <textarea
                    required
                    value={formData.decision_made}
                    onChange={(e) => setFormData(prev => ({ ...prev, decision_made: e.target.value }))}
                    rows={3}
                    className="w-full bg-bg-primary border border-gold-primary/30 rounded px-4 py-3 text-text-primary focus:border-gold-primary focus:outline-none transition-colors"
                    placeholder="Quelle décision finale a été prise ?"
                />
            </div>

            {/* Rationale */}
            <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                    Justification
                </label>
                <textarea
                    value={formData.rationale}
                    onChange={(e) => setFormData(prev => ({ ...prev, rationale: e.target.value }))}
                    rows={3}
                    className="w-full bg-bg-primary border border-gold-primary/30 rounded px-4 py-3 text-text-primary focus:border-gold-primary focus:outline-none transition-colors"
                    placeholder="Pourquoi cette décision ?"
                />
            </div>

            {/* Consequences */}
            <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                    Conséquences anticipées
                </label>
                <textarea
                    value={formData.consequences}
                    onChange={(e) => setFormData(prev => ({ ...prev, consequences: e.target.value }))}
                    rows={2}
                    className="w-full bg-bg-primary border border-gold-primary/30 rounded px-4 py-3 text-text-primary focus:border-gold-primary focus:outline-none transition-colors"
                    placeholder="Quel impact cette décision aura-t-elle ?"
                />
            </div>

            {/* Status & Revisit Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">
                        Statut
                    </label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full bg-bg-primary border border-gold-primary/30 rounded px-4 py-3 text-text-primary focus:border-gold-primary focus:outline-none transition-colors"
                    >
                        <option value="active">Active</option>
                        <option value="executed">Exécutée</option>
                        <option value="reversed">Annulée</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">
                        Date de révision (optionnel)
                    </label>
                    <input
                        type="date"
                        value={formData.revisit_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, revisit_date: e.target.value }))}
                        className="w-full bg-bg-primary border border-gold-primary/30 rounded px-4 py-3 text-text-primary focus:border-gold-primary focus:outline-none transition-colors"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gold-primary text-bg-primary px-6 py-3 rounded font-semibold hover:bg-gold-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Enregistrement...' : (initialData ? 'Mettre à jour' : 'Créer la décision')}
                </button>

                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 bg-bg-secondary text-text-secondary rounded font-semibold hover:bg-bg-tertiary transition-colors"
                    >
                        Annuler
                    </button>
                )}
            </div>
        </form>
    );
}
