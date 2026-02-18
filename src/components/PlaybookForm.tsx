'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface PlaybookFormProps {
    playbook?: {
        id: string;
        name: string;
        description: string;
        rules: string[];
        is_active: boolean;
    };
    mode: 'create' | 'edit';
}

export default function PlaybookForm({ playbook, mode }: PlaybookFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: playbook?.name || '',
        description: playbook?.description || '',
        rules: playbook?.rules || [''],
        is_active: playbook?.is_active ?? true,
    });

    const handleRuleChange = (index: number, value: string) => {
        const newRules = [...formData.rules];
        newRules[index] = value;
        setFormData({ ...formData, rules: newRules });
    };

    const addRule = () => {
        setFormData({ ...formData, rules: [...formData.rules, ''] });
    };

    const removeRule = (index: number) => {
        const newRules = formData.rules.filter((_, i) => i !== index);
        setFormData({ ...formData, rules: newRules });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        // Validation
        if (!formData.name.trim()) {
            setError('Le nom est requis');
            setIsSubmitting(false);
            return;
        }

        const filteredRules = formData.rules.filter((r) => r.trim() !== '');
        if (filteredRules.length === 0) {
            setError('Au moins une règle est requise');
            setIsSubmitting(false);
            return;
        }

        try {
            const url =
                mode === 'create'
                    ? '/api/playbooks'
                    : `/api/playbooks/${playbook?.id}`;

            const method = mode === 'create' ? 'POST' : 'PUT';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    rules: filteredRules,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Une erreur est survenue');
            }

            // Success toast
            toast.success(
                mode === 'create'
                    ? '✅ Playbook créé avec succès'
                    : '✅ Playbook mis à jour'
            );

            router.push('/playbooks');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
            toast.error(`❌ Erreur : ${err.message}`);
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-danger/10 border border-danger text-danger px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Name */}
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                    Nom du Playbook *
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-pixel-dark border border-border rounded-input px-4 py-3 text-text-primary"
                    placeholder="Ex: Sprint Planning Workflow"
                />
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                    Description
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full bg-pixel-dark border border-border rounded-input px-4 py-3 text-text-primary"
                    rows={3}
                    placeholder="Description du playbook..."
                />
            </div>

            {/* Rules */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-text-secondary">
                        Règles * (minimum 1)
                    </label>
                    <button
                        type="button"
                        onClick={addRule}
                        className="btn-secondary text-sm px-3 py-1"
                    >
                        + Ajouter une règle
                    </button>
                </div>

                <div className="space-y-3">
                    {formData.rules.map((rule, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                type="text"
                                value={rule}
                                onChange={(e) => handleRuleChange(index, e.target.value)}
                                className="flex-1 bg-pixel-dark border border-border rounded-input px-4 py-2 text-text-primary"
                                placeholder={`Règle ${index + 1}`}
                            />
                            {formData.rules.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeRule(index)}
                                    className="btn-danger px-4"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Is Active */}
            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) =>
                        setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-border bg-pixel-dark"
                />
                <label htmlFor="is_active" className="text-text-secondary">
                    Playbook actif
                </label>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary px-6 py-3 flex-1"
                >
                    {isSubmitting
                        ? 'Enregistrement...'
                        : mode === 'create'
                            ? 'Créer le Playbook'
                            : 'Enregistrer les modifications'}
                </button>
                <button
                    type="button"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                    className="btn-secondary px-6 py-3"
                >
                    Annuler
                </button>
            </div>
        </form>
    );
}
