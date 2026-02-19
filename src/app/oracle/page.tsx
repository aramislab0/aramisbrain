'use client';

import { useEffect, useState } from 'react';
import { Calendar, Sparkles, MessageCircle, TrendingUp, RefreshCw } from 'lucide-react';
import './animations.css';

interface Trajectory {
    trajectory_number: number;
    title: string;
    context: string;
    what_it_means: string;
    tradeoffs: string;
    timeline_estimate: string;
    focus_allocation: Record<string, number>;
    questions: string[];
    tone: 'opportunity' | 'neutral' | 'gentle_attention';
    confidence_note?: string;
}

interface Question {
    question: string;
    context: string;
    why_now: string;
    question_type: string;
}

interface Summary {
    weekStartDate?: string;
    weekEndDate?: string;
    week_start_date?: string;
    week_end_date?: string;
    overviewNarrative?: string;
    overview_narrative?: string;
    whatAdvances?: string;
    what_advances?: string;
    needsAttention?: string;
    needs_attention?: string;
    decisionsMade?: string;
    decisions_made?: string;
}

export default function OraclePage() {
    const [trajectories, setTrajectories] = useState<Trajectory[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [selectedTrajectory, setSelectedTrajectory] = useState<number>(1);
    const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadOracleData();
    }, []);

    async function loadOracleData() {
        setLoading(true);
        setError(null);
        try {
            const [trajRes, qRes, sumRes] = await Promise.all([
                fetch('/api/oracle/trajectories?refresh=true'),
                fetch('/api/oracle/questions?refresh=true'),
                fetch('/api/oracle/summary?refresh=true'),
            ]);

            const trajData = await trajRes.json();
            // Normalize: API may return camelCase or snake_case
            const normalizedTrajectories = (trajData.trajectories || []).map((t: any) => ({
                trajectory_number: t.trajectory_number ?? t.trajectoryNumber,
                title: t.title,
                context: t.context,
                what_it_means: t.what_it_means ?? t.whatItMeans ?? '',
                tradeoffs: t.tradeoffs ?? '',
                timeline_estimate: t.timeline_estimate ?? t.timelineEstimate ?? '',
                focus_allocation: t.focus_allocation ?? t.focusAllocation ?? {},
                questions: t.questions ?? [],
                tone: t.tone ?? 'neutral',
                confidence_note: t.confidence_note ?? t.confidenceNote,
            }));
            setTrajectories(normalizedTrajectories);

            const qData = await qRes.json();
            const normalizedQuestions = (qData.questions || []).map((q: any) => ({
                question: q.question,
                context: q.context,
                why_now: q.why_now ?? q.whyNow ?? '',
                question_type: q.question_type ?? q.questionType ?? 'reflection',
            }));
            setQuestions(normalizedQuestions);

            const sumData = await sumRes.json();
            setSummary(sumData.summary || null);
        } catch (err) {
            console.error('Error loading Oracle data:', err);
            setError('Impossible de charger les insights ORACLE. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    }

    // Helper to get summary fields (handles both camelCase from refresh and snake_case from DB)
    const getSummaryField = (field: string): string => {
        if (!summary) return '';
        const camelMap: Record<string, string> = {
            overview_narrative: 'overviewNarrative',
            what_advances: 'whatAdvances',
            needs_attention: 'needsAttention',
            decisions_made: 'decisionsMade',
        };
        return (summary as any)[field] || (summary as any)[camelMap[field]] || '';
    };

    // ─── Loading Skeleton ───
    if (loading) {
        return (
            <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #0F0F0F, #1A1A1A)' }}>
                <header className="border-b border-white/[0.06] py-10" role="banner">
                    <div className="max-w-5xl mx-auto px-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-[#D4AF37] animate-pulse" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-light tracking-wide" style={{ color: '#D4AF37' }}>ORACLE</h1>
                                <p className="text-sm text-white/40 mt-0.5">Génération insights...</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="max-w-5xl mx-auto px-6 py-12 space-y-16" role="main">
                    {/* Summary skeleton */}
                    <div className="rounded-2xl p-8 border border-white/[0.06]" style={{ background: 'rgba(26,26,26,0.5)' }}>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="oracle-skeleton w-5 h-5 rounded" />
                            <div className="oracle-skeleton h-5 w-40" />
                        </div>
                        <div className="space-y-3">
                            <div className="oracle-skeleton h-4 w-full" />
                            <div className="oracle-skeleton h-4 w-3/4" />
                            <div className="oracle-skeleton h-4 w-5/6" />
                        </div>
                        <div className="grid md:grid-cols-2 gap-8 mt-8">
                            <div className="space-y-3">
                                <div className="oracle-skeleton h-3 w-24" />
                                <div className="oracle-skeleton h-4 w-full" />
                                <div className="oracle-skeleton h-4 w-3/4" />
                            </div>
                            <div className="space-y-3">
                                <div className="oracle-skeleton h-3 w-28" />
                                <div className="oracle-skeleton h-4 w-full" />
                                <div className="oracle-skeleton h-4 w-2/3" />
                            </div>
                        </div>
                    </div>

                    {/* Trajectories skeleton */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="oracle-skeleton w-5 h-5 rounded" />
                            <div className="oracle-skeleton h-5 w-48" />
                        </div>
                        <div className="flex gap-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="oracle-skeleton h-11 w-52 rounded-xl" />
                            ))}
                        </div>
                        <div className="rounded-2xl p-8 border border-white/[0.06]" style={{ background: 'rgba(26,26,26,0.5)' }}>
                            <div className="space-y-6">
                                <div className="oracle-skeleton h-6 w-28 rounded-full" />
                                <div className="space-y-3">
                                    <div className="oracle-skeleton h-3 w-16" />
                                    <div className="oracle-skeleton h-4 w-full" />
                                    <div className="oracle-skeleton h-4 w-4/5" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Questions skeleton */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="oracle-skeleton w-5 h-5 rounded" />
                            <div className="oracle-skeleton h-5 w-44" />
                        </div>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="oracle-skeleton h-20 w-full rounded-xl" />
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    // ─── Error State ───
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom, #0F0F0F, #1A1A1A)' }}>
                <div
                    className="rounded-2xl p-8 max-w-md text-center border border-white/[0.06]"
                    style={{ background: 'rgba(26,26,26,0.5)', backdropFilter: 'blur(12px)' }}
                    role="alert"
                >
                    <Sparkles className="w-10 h-10 text-[#D4AF37]/40 mx-auto mb-4" />
                    <h2 className="text-lg text-white/80 mb-3 font-light">Une erreur est survenue</h2>
                    <p className="text-white/50 text-sm mb-6 leading-relaxed">{error}</p>
                    <button
                        onClick={loadOracleData}
                        className="oracle-focusable inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm transition-all duration-200 hover:opacity-90"
                        style={{ background: '#D4AF37', color: '#000' }}
                    >
                        <RefreshCw className="w-4 h-4" />
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #0F0F0F, #1A1A1A)' }}>
            {/* Hero Header */}
            <header className="border-b border-white/[0.06] py-10" role="banner">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-[#D4AF37]" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-light tracking-wide" style={{ color: '#D4AF37' }}>ORACLE</h1>
                                <p className="text-sm text-white/40 mt-0.5">Clarté sans pression • Accompagnement stratégique</p>
                            </div>
                        </div>
                        <button
                            onClick={loadOracleData}
                            className="oracle-focusable p-2.5 rounded-xl border border-white/[0.06] text-white/30 hover:text-[#D4AF37] hover:border-[#D4AF37]/20 transition-all duration-200"
                            aria-label="Rafraîchir les insights"
                            title="Rafraîchir"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12 space-y-16" role="main">
                {/* ───────── Weekly Summary ───────── */}
                {summary && (
                    <section className="oracle-fadeInUp rounded-2xl p-8 border border-white/[0.06]" style={{ background: 'rgba(26,26,26,0.5)', backdropFilter: 'blur(12px)' }} aria-labelledby="summary-heading">
                        <div className="flex items-center gap-3 mb-8">
                            <Calendar className="w-5 h-5 text-[#D4AF37]" />
                            <h2 id="summary-heading" className="text-lg font-light text-white/90">Semaine en bref</h2>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-3">Vue d&apos;ensemble</h3>
                                <p className="text-white/70 leading-relaxed whitespace-pre-line text-[15px]">
                                    {getSummaryField('overview_narrative')}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/30">Ce qui avance</h3>
                                    <div className="text-white/60 text-sm leading-relaxed whitespace-pre-line">
                                        {getSummaryField('what_advances')}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/30">Demande attention</h3>
                                    <div className="text-white/60 text-sm leading-relaxed whitespace-pre-line">
                                        {getSummaryField('needs_attention')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* ───────── Trajectories ───────── */}
                <section className="oracle-fadeInUp oracle-delay-100" aria-labelledby="trajectories-heading">
                    <div className="flex items-center gap-3 mb-8">
                        <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
                        <h2 id="trajectories-heading" className="text-lg font-light text-white/90">Trajectoires possibles</h2>
                    </div>

                    {/* Trajectory Tabs */}
                    <div className="flex gap-3 mb-8 overflow-x-auto pb-2 oracle-scroll-hide" role="tablist" aria-label="Trajectoires stratégiques">
                        {trajectories.map((traj) => (
                            <button
                                key={traj.trajectory_number}
                                role="tab"
                                aria-selected={selectedTrajectory === traj.trajectory_number}
                                aria-controls={`trajectory-panel-${traj.trajectory_number}`}
                                onClick={() => setSelectedTrajectory(traj.trajectory_number)}
                                className="oracle-focusable oracle-trajectory-btn px-5 py-2.5 rounded-xl text-sm whitespace-nowrap"
                                style={{
                                    background: selectedTrajectory === traj.trajectory_number
                                        ? '#D4AF37'
                                        : 'rgba(255,255,255,0.03)',
                                    color: selectedTrajectory === traj.trajectory_number
                                        ? '#000'
                                        : 'rgba(255,255,255,0.5)',
                                    border: selectedTrajectory === traj.trajectory_number
                                        ? '1px solid #D4AF37'
                                        : '1px solid rgba(255,255,255,0.06)',
                                    fontWeight: selectedTrajectory === traj.trajectory_number ? 600 : 400,
                                }}
                            >
                                {traj.trajectory_number}. {traj.title}
                            </button>
                        ))}
                    </div>

                    {/* Active Trajectory Panel */}
                    {trajectories.map((traj) => (
                        selectedTrajectory === traj.trajectory_number && (
                            <div
                                key={traj.trajectory_number}
                                id={`trajectory-panel-${traj.trajectory_number}`}
                                role="tabpanel"
                                aria-labelledby={`trajectory-tab-${traj.trajectory_number}`}
                                className="oracle-fadeIn rounded-2xl p-6 md:p-8 border border-white/[0.06] space-y-8"
                                style={{ background: 'rgba(26,26,26,0.5)', backdropFilter: 'blur(12px)' }}
                            >
                                {/* Tone Badge */}
                                <div
                                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs"
                                    style={{ background: 'rgba(212,175,55,0.08)', color: '#D4AF37' }}
                                >
                                    {traj.tone === 'opportunity' && '✨ Opportunité'}
                                    {traj.tone === 'neutral' && '⚖️ Équilibre'}
                                    {traj.tone === 'gentle_attention' && '💭 Attention douce'}
                                </div>

                                <div>
                                    <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-3">Contexte</h3>
                                    <p className="text-white/70 leading-relaxed">{traj.context}</p>
                                </div>

                                <div>
                                    <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-3">Ce que ça signifie</h3>
                                    <p className="text-white/70 leading-relaxed">{traj.what_it_means}</p>
                                </div>

                                <div>
                                    <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-3">Trade-offs</h3>
                                    <p className="text-white/50 leading-relaxed text-sm">{traj.tradeoffs}</p>
                                </div>

                                {/* Focus Allocation Bars */}
                                <div>
                                    <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-4">Allocation focus suggérée</h3>
                                    <div className="space-y-3">
                                        {Object.entries(traj.focus_allocation).map(([project, percent]) => (
                                            <div key={project} className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
                                                <span className="text-white/50 text-sm sm:min-w-[120px] capitalize">{project}</span>
                                                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                                    <div
                                                        className="h-full rounded-full oracle-focus-bar"
                                                        style={{
                                                            width: `${percent}%`,
                                                            background: 'linear-gradient(90deg, #D4AF37, rgba(212,175,55,0.4))'
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-white/30 text-xs sm:min-w-[40px] sm:text-right">{percent}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Timeline */}
                                {traj.timeline_estimate && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="w-4 h-4 text-[#D4AF37]/60" />
                                        <span className="text-white/40">Timeline estimée :</span>
                                        <span className="text-white/70">{traj.timeline_estimate}</span>
                                    </div>
                                )}

                                {/* Questions */}
                                {traj.questions && traj.questions.length > 0 && (
                                    <div>
                                        <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-4">Questions pour toi</h3>
                                        <ul className="space-y-2.5">
                                            {traj.questions.map((q, idx) => (
                                                <li key={idx} className="flex items-start gap-3 text-white/60 text-sm">
                                                    <span className="text-[#D4AF37]/60 mt-0.5">•</span>
                                                    <span className="leading-relaxed">{q}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Confidence */}
                                {traj.confidence_note && (
                                    <div className="text-xs text-white/30 italic pl-4" style={{ borderLeft: '2px solid rgba(255,255,255,0.06)' }}>
                                        Note : {traj.confidence_note}
                                    </div>
                                )}
                            </div>
                        )
                    ))}
                </section>

                {/* ───────── Strategic Questions ───────── */}
                <section className="oracle-fadeInUp oracle-delay-200" aria-labelledby="questions-heading">
                    <div className="flex items-center gap-3 mb-8">
                        <MessageCircle className="w-5 h-5 text-[#D4AF37]" />
                        <h2 id="questions-heading" className="text-lg font-light text-white/90">Questions stratégiques</h2>
                    </div>

                    <div className="space-y-3">
                        {questions.map((q, idx) => (
                            <div
                                key={idx}
                                className="oracle-question-card rounded-xl overflow-hidden border border-white/[0.06]"
                                style={{ background: 'rgba(26,26,26,0.4)', backdropFilter: 'blur(8px)' }}
                            >
                                <button
                                    onClick={() => setExpandedQuestion(expandedQuestion === idx ? null : idx)}
                                    className="oracle-focusable w-full px-4 md:px-6 py-5 text-left transition-colors duration-200"
                                    style={{ background: 'transparent' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                    aria-expanded={expandedQuestion === idx}
                                    aria-controls={`question-detail-${idx}`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <p className="text-white/80 leading-relaxed text-[15px]">{q.question}</p>
                                            <span className="text-[11px] text-white/30 mt-2 inline-block">
                                                {q.question_type === 'reflection' && '💭 Réflexion'}
                                                {q.question_type === 'decision' && '🎯 Décision'}
                                                {q.question_type === 'priority' && '⚡ Priorité'}
                                                {q.question_type === 'strategy' && '🧭 Stratégie'}
                                            </span>
                                        </div>
                                        <div
                                            className="transition-transform duration-300 mt-1"
                                            style={{ transform: expandedQuestion === idx ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                        >
                                            <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </button>

                                {expandedQuestion === idx && (
                                    <div
                                        id={`question-detail-${idx}`}
                                        className="oracle-fadeIn px-4 md:px-6 pb-5 space-y-3 border-t border-white/[0.04]"
                                    >
                                        <div className="pt-4">
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-1">Contexte</p>
                                            <p className="text-sm text-white/60">{q.context}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-1">Pourquoi maintenant</p>
                                            <p className="text-sm text-white/60">{q.why_now}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* ───────── Footer ───────── */}
                <footer className="text-center pt-16 pb-8" role="contentinfo">
                    <p className="text-[11px] tracking-[0.3em] text-white/20 uppercase">
                        Oracle • Clarté sans pression • Discipline sans jugement • Liberté intacte
                    </p>
                </footer>
            </main>
        </div>
    );
}
