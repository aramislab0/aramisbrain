'use client';

import { useState, useEffect } from 'react';

interface FocusCardProps {
    initialPriorities: [string, string, string];
    initialCriticalRisk: string;
    initialDecisionNeeded: string;
    initialIgnoreToday: string;
    onSave: (data: any) => Promise<void>;
}

export function FocusCard({
    initialPriorities,
    initialCriticalRisk,
    initialDecisionNeeded,
    initialIgnoreToday,
    onSave
}: FocusCardProps) {
    const [priorities, setPriorities] = useState(initialPriorities);
    const [criticalRisk, setCriticalRisk] = useState(initialCriticalRisk);
    const [decisionNeeded, setDecisionNeeded] = useState(initialDecisionNeeded);
    const [ignoreToday, setIgnoreToday] = useState(initialIgnoreToday);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Auto-save avec debounce 3s
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (lastSaved === null && priorities[0] === '' && criticalRisk === '' && decisionNeeded === '' && ignoreToday === '') {
                // Skip auto-save for initial empty state
                return;
            }

            setIsSaving(true);
            try {
                await onSave({
                    priorities,
                    critical_risk: criticalRisk,
                    decision_needed: decisionNeeded,
                    ignore_today: ignoreToday
                });
                setLastSaved(new Date());
            } catch (error) {
                console.error('Auto-save failed:', error);
            } finally {
                setIsSaving(false);
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [priorities, criticalRisk, decisionNeeded, ignoreToday, onSave, lastSaved]);

    return (
        <div className="bg-bg-secondary border border-gold-primary/20 rounded-lg p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-text-primary">🎯 Focus du Jour</h2>
                <div className="text-xs text-text-secondary">
                    {isSaving ? '💾 Sauvegarde...' : lastSaved ? `✅ Sauvegardé ${lastSaved.toLocaleTimeString()}` : ''}
                </div>
            </div>

            {/* 3 Priorités */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-gold-primary mb-3">3 PRIORITÉS</h3>
                {[0, 1, 2].map(i => (
                    <input
                        key={i}
                        type="text"
                        value={priorities[i]}
                        onChange={(e) => {
                            const newPriorities = [...priorities] as [string, string, string];
                            newPriorities[i] = e.target.value;
                            setPriorities(newPriorities);
                        }}
                        placeholder={`Priorité ${i + 1}`}
                        className="w-full bg-bg-primary border border-gold-primary/30 rounded px-4 py-3 text-text-primary mb-2 focus:border-gold-primary focus:outline-none transition-colors"
                    />
                ))}
            </div>

            {/* Risque Critique */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-risk-critical mb-3">🚨 RISQUE CRITIQUE</h3>
                <textarea
                    value={criticalRisk}
                    onChange={(e) => setCriticalRisk(e.target.value)}
                    placeholder="Quel est le risque qui pourrait tout bloquer aujourd'hui ?"
                    className="w-full bg-bg-primary border border-risk-critical/30 rounded px-4 py-3 text-text-primary focus:border-risk-critical focus:outline-none transition-colors min-h-[80px]"
                />
            </div>

            {/* Décision Needed */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-gold-primary mb-3">⚖️ DÉCISION À PRENDRE</h3>
                <textarea
                    value={decisionNeeded}
                    onChange={(e) => setDecisionNeeded(e.target.value)}
                    placeholder="Quelle décision stratégique dois-tu trancher aujourd'hui ?"
                    className="w-full bg-bg-primary border border-gold-primary/30 rounded px-4 py-3 text-text-primary focus:border-gold-primary focus:outline-none transition-colors min-h-[80px]"
                />
            </div>

            {/* Ignore Today */}
            <div>
                <h3 className="text-sm font-semibold text-text-secondary mb-3">🚫 À IGNORER AUJOURD'HUI</h3>
                <input
                    type="text"
                    value={ignoreToday}
                    onChange={(e) => setIgnoreToday(e.target.value)}
                    placeholder="Quelle distraction dois-tu éviter absolument ?"
                    className="w-full bg-bg-primary border border-text-secondary/30 rounded px-4 py-3 text-text-secondary focus:border-text-secondary focus:outline-none transition-colors"
                />
            </div>
        </div>
    );
}
