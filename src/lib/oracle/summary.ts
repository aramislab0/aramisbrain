import { getSupabaseClient } from '@/lib/supabase';

interface WeeklySummary {
    weekStartDate: string;
    weekEndDate: string;
    overviewNarrative: string;
    whatAdvances: string;
    needsAttention: string;
    decisionsMade: string;
    fullSummaryMarkdown: string;
}

export async function generateWeeklySummary(): Promise<WeeklySummary> {
    const supabase = getSupabaseClient();

    // Calculate week dates
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysToMonday = (dayOfWeek + 6) % 7;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysToMonday);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const weekStartDate = weekStart.toISOString().split('T')[0];
    const weekEndDate = weekEnd.toISOString().split('T')[0];

    // Get projects data
    const { data: projects } = await supabase
        .from('projects')
        .select('*, health_scores(*), pattern_analyses(*)')
        .eq('status', 'active');

    if (!projects) {
        return {
            weekStartDate,
            weekEndDate,
            overviewNarrative: 'Aucun projet actif cette semaine.',
            whatAdvances: 'N/A',
            needsAttention: 'N/A',
            decisionsMade: 'Aucune',
            fullSummaryMarkdown: '# Semaine calme\n\nAucune activité significative.'
        };
    }

    // Categorize projects
    const advancing = projects.filter(p => {
        const pattern = p.pattern_analyses?.[0];
        return pattern && (pattern.velocity_trend === 'accelerating' || pattern.momentum_score > 60);
    });

    const needsAttention = projects.filter(p => {
        const pattern = p.pattern_analyses?.[0];
        const health = p.health_scores?.[0];
        return (pattern && pattern.last_activity_days > 14) || (health && health.overall_score < 60);
    });

    const stable = projects.filter(p =>
        !advancing.includes(p) && !needsAttention.includes(p)
    );

    // Get decisions this week
    const { data: decisions } = await supabase
        .from('decisions')
        .select('*, projects(name)')
        .gte('created_at', weekStartDate)
        .lte('created_at', weekEndDate)
        .order('created_at', { ascending: false });

    // Build narratives (calm tone)
    const overviewNarrative = buildOverviewNarrative(projects, advancing, needsAttention, stable);
    const whatAdvancesText = buildAdvancesNarrative(advancing);
    const needsAttentionText = buildAttentionNarrative(needsAttention);
    const decisionsMade = buildDecisionsNarrative(decisions);

    // Full markdown
    const fullSummaryMarkdown = buildFullMarkdown({
        weekStartDate,
        weekEndDate,
        overviewNarrative,
        whatAdvances: whatAdvancesText,
        needsAttention: needsAttentionText,
        decisionsMade
    });

    return {
        weekStartDate,
        weekEndDate,
        overviewNarrative,
        whatAdvances: whatAdvancesText,
        needsAttention: needsAttentionText,
        decisionsMade,
        fullSummaryMarkdown
    };
}

function buildOverviewNarrative(
    all: any[],
    advancing: any[],
    attention: any[],
    stable: any[]
): string {
    const total = all.length;
    const avgCompletion = Math.round(
        all.reduce((sum, p) => sum + p.completion_percentage, 0) / total
    );

    let narrative = `${total} projet${total > 1 ? 's' : ''} en mouvement cette semaine.\n`;

    if (advancing.length > 0) {
        narrative += `${advancing.length} progresse${advancing.length > 1 ? 'nt' : ''} bien`;
    }

    if (attention.length > 0) {
        narrative += advancing.length > 0 ? ', ' : '';
        narrative += `${attention.length} demande${attention.length > 1 ? 'nt' : ''} attention`;
    }

    if (stable.length > 0) {
        narrative += (advancing.length > 0 || attention.length > 0) ? ', ' : '';
        narrative += `${stable.length} en rythme stable`;
    }

    narrative += `.\n\nCompletion moyenne : ${avgCompletion}%.`;

    return narrative;
}

function buildAdvancesNarrative(advancing: any[]): string {
    if (advancing.length === 0) return 'Aucun projet en accélération notable.';

    return advancing.map(p => {
        const pattern = p.pattern_analyses?.[0];
        const momentum = pattern ? Math.round(pattern.momentum_score) : 50;
        return `• ${p.name} : ${p.completion_percentage}% (momentum ${momentum}/100)`;
    }).join('\n');
}

function buildAttentionNarrative(needsAttention: any[]): string {
    if (needsAttention.length === 0) return 'Aucun blocage significatif.';

    return needsAttention.map(p => {
        const pattern = p.pattern_analyses?.[0];
        const blocker = p.main_blocker && p.main_blocker !== 'Aucun'
            ? p.main_blocker
            : 'Progression ralentie';
        const days = pattern?.last_activity_days || 0;

        let text = `• ${p.name}`;

        if (days > 14) {
            text += ` : ${days} jours sans mouvement visible`;
        }

        if (blocker !== 'Progression ralentie') {
            text += `\n  Blocker : "${blocker}"`;
        }

        if (pattern && pattern.momentum_score > 40) {
            text += `\n  Opportunité : Quick win potentiel si déblocage`;
        }

        return text;
    }).join('\n\n');
}

function buildDecisionsNarrative(decisions: any[] | null): string {
    if (!decisions || decisions.length === 0) {
        return 'Aucune décision formalisée cette semaine.';
    }

    return decisions.map(d => {
        const date = new Date(d.created_at).toLocaleDateString('fr-FR', {
            month: 'short',
            day: 'numeric'
        });
        return `• ${d.title} (${date})\n  Projet : ${d.projects?.name || 'N/A'}`;
    }).join('\n\n');
}

function buildFullMarkdown(data: any): string {
    const weekStartFormatted = new Date(data.weekStartDate).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long'
    });
    const weekEndFormatted = new Date(data.weekEndDate).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return `# Semaine du ${weekStartFormatted} au ${weekEndFormatted}

## Vue d'ensemble

${data.overviewNarrative}

---

## Ce qui avance

${data.whatAdvances}

---

## Ce qui demande attention

${data.needsAttention}

---

## Décisions prises

${data.decisionsMade}

---

## Trajectoires possibles

*Voir section Trajectoires pour les 3 options stratégiques de la semaine.*

---

## Questions pour toi

*Voir section Questions Stratégiques pour réflexion.*

---

*Généré automatiquement par ORACLE • Ton : Calme et accompagnant*
`;
}

export async function saveWeeklySummary(summary: WeeklySummary): Promise<void> {
    const supabase = getSupabaseClient();

    await supabase.from('oracle_weekly_summaries').upsert({
        week_start_date: summary.weekStartDate,
        week_end_date: summary.weekEndDate,
        overview_narrative: summary.overviewNarrative,
        what_advances: summary.whatAdvances,
        needs_attention: summary.needsAttention,
        decisions_made: summary.decisionsMade,
        full_summary_markdown: summary.fullSummaryMarkdown,
        tone_check: 'calm'
    }, {
        onConflict: 'week_start_date'
    });
}
