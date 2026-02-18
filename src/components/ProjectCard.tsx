'use client';

import { TrendingUp, AlertCircle, ArrowRight, Flame } from 'lucide-react';

interface ProjectCardProps {
    name: string;
    code?: string;
    slug?: string;
    completion: number;
    cashImpact: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    currentBlocker?: string | null;
    mainBlocker?: string | null;
    nextAction: string;
    daysToLaunch?: number | null;
}

const riskConfig = {
    low: { label: 'LOW', color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
    medium: { label: 'MEDIUM', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
    high: { label: 'HIGH', color: '#F97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.2)' },
    critical: { label: 'CRITICAL', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
};

export function ProjectCard({
    name,
    code,
    slug,
    completion,
    cashImpact,
    riskLevel,
    currentBlocker,
    mainBlocker,
    nextAction,
    daysToLaunch,
}: ProjectCardProps) {
    const risk = riskConfig[riskLevel] || riskConfig.low;
    const blocker = currentBlocker || mainBlocker;
    const projectCode = code || slug;

    return (
        <div className="group relative bg-bg-secondary/80 border border-border hover:border-gold-primary/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(212,175,55,0.06)] hover:-translate-y-0.5">
            {/* Subtle glow on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-gold-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Header */}
            <div className="relative flex items-start justify-between mb-5">
                <div className="flex-1 min-w-0 pr-3">
                    <h3 className="text-base font-semibold text-text-primary group-hover:text-gold-primary transition-colors duration-200 truncate">
                        {name}
                    </h3>
                    {projectCode && (
                        <p className="text-[11px] text-text-muted font-mono uppercase tracking-widest mt-0.5">
                            {projectCode}
                        </p>
                    )}
                </div>
                <span
                    className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                    style={{
                        color: risk.color,
                        backgroundColor: risk.bg,
                        border: `1px solid ${risk.border}`,
                    }}
                >
                    {risk.label}
                </span>
            </div>

            {/* Metrics Row */}
            <div className="relative grid grid-cols-2 gap-5 mb-5">
                <div>
                    <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1.5">Completion</p>
                    <span className="text-2xl font-bold tabular-nums text-gold-primary">{completion}%</span>
                    <div className="w-full bg-bg-primary rounded-full h-1 mt-2.5 overflow-hidden">
                        <div
                            className="h-full rounded-full animate-progress"
                            style={{
                                width: `${completion}%`,
                                background: `linear-gradient(90deg, #D4AF37 0%, #E5C158 100%)`,
                            }}
                        />
                    </div>
                </div>

                <div>
                    <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1.5">Cash Impact</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold tabular-nums text-text-primary">{cashImpact}</span>
                        <span className="text-xs text-text-muted">/10</span>
                    </div>
                    {/* Mini bar indicator */}
                    <div className="flex gap-0.5 mt-2.5">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-1 flex-1 rounded-full transition-all duration-300"
                                style={{
                                    backgroundColor: i < cashImpact ? '#D4AF37' : '#27272A',
                                    opacity: i < cashImpact ? 0.4 + (i / 10) * 0.6 : 0.3,
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Days to Launch */}
            {daysToLaunch !== null && daysToLaunch !== undefined && (
                <div className="relative mb-4 flex items-center gap-2 px-3 py-2 bg-bg-primary/60 rounded-lg border border-gold-primary/10">
                    <Flame size={13} className="text-gold-primary shrink-0" />
                    <p className="text-xs text-text-secondary">
                        {daysToLaunch > 0 ? (
                            <>
                                <span className="font-semibold text-gold-primary">{daysToLaunch}j</span> avant lancement
                            </>
                        ) : (
                            <span className="text-risk-critical font-medium">Deadline dépassée</span>
                        )}
                    </p>
                </div>
            )}

            {/* Blocker */}
            {blocker && (
                <div className="relative mb-4 flex items-start gap-2.5 p-3 bg-risk-critical/5 border border-risk-critical/15 rounded-lg">
                    <AlertCircle size={13} className="text-risk-critical shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-risk-critical/70 mb-0.5">Blocage</p>
                        <p className="text-xs text-risk-critical leading-relaxed">{blocker}</p>
                    </div>
                </div>
            )}

            {/* Next Action */}
            <div className="relative pt-4 border-t border-border/60">
                <div className="flex items-start gap-2.5">
                    <ArrowRight size={12} className="text-gold-primary shrink-0 mt-1" />
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-text-muted mb-0.5">Next Action</p>
                        <p className="text-xs text-text-primary leading-relaxed">{nextAction}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
