import { getSupabaseClient } from '@/lib/supabase';

interface PlaybookMatch {
    playbookId: string;
    playbookName: string;
    matchScore: number;
    relevantRules: string[];
    applicationContext: string;
    suggestedAdaptations: string[];
}

export async function matchPlaybooksToSituation(projectId: string): Promise<PlaybookMatch[]> {
    const matches: PlaybookMatch[] = [];
    const supabase = getSupabaseClient();

    const { data: project } = await supabase
        .from('projects')
        .select('*, health_scores(*), pattern_analyses(*)')
        .eq('id', projectId)
        .single();

    if (!project) return [];

    const { data: playbooks } = await supabase
        .from('playbooks')
        .select('*')
        .eq('active', true);

    if (!playbooks) return [];

    const latestHealth = project.health_scores?.[0];
    const latestPattern = project.pattern_analyses?.[0];

    for (const playbook of playbooks) {
        const match = calculatePlaybookMatch(playbook, project, latestHealth, latestPattern);
        if (match && match.matchScore > 50) {
            matches.push(match);
        }
    }

    return matches.sort((a, b) => b.matchScore - a.matchScore);
}

function calculatePlaybookMatch(
    playbook: any,
    project: any,
    health: any,
    pattern: any
): PlaybookMatch | null {
    let matchScore = 0;
    const relevantRules: string[] = [];
    const suggestedAdaptations: string[] = [];

    const playbookText = `${playbook.name} ${playbook.description} ${playbook.rules?.join(' ')}`.toLowerCase();
    const projectContext = `${project.name} ${project.main_blocker} ${project.risk_level}`.toLowerCase();

    const keywords: Record<string, boolean> = {
        'stagnation': pattern?.velocity_trend === 'stagnant' || pattern?.last_activity_days > 14,
        'risk': health?.risk_score < 50 || project.risk_level === 'high',
        'technique': project.main_blocker?.toLowerCase().includes('css') ||
            project.main_blocker?.toLowerCase().includes('technique'),
        'ressource': health?.overall_score < 60 && project.cash_impact_score > 7
    };

    for (const [keyword, isRelevant] of Object.entries(keywords)) {
        if (isRelevant && playbookText.includes(keyword)) {
            matchScore += 25;
            relevantRules.push(`Playbook addresses ${keyword} situation`);
        }
    }

    if (matchScore === 0) return null;

    let applicationContext = `Applicable à ${project.name} car: `;
    if (keywords.stagnation) applicationContext += 'projet en stagnation, ';
    if (keywords.risk) applicationContext += 'niveau de risque élevé, ';
    if (keywords.technique) applicationContext += 'blockers techniques, ';
    if (keywords.ressource) applicationContext += 'besoin ressources.';

    suggestedAdaptations.push('Adapter timeline selon contexte projet');
    if (project.completion_percentage > 50) {
        suggestedAdaptations.push('Focus sur finition plutôt que foundation');
    }

    return {
        playbookId: playbook.id,
        playbookName: playbook.name,
        matchScore: Math.min(100, matchScore),
        relevantRules: playbook.rules?.slice(0, 3) || [],
        applicationContext,
        suggestedAdaptations
    };
}

export async function savePlaybookRecommendation(match: PlaybookMatch, projectId: string): Promise<void> {
    const supabase = getSupabaseClient();

    await supabase.from('recommendations').insert({
        category: 'decision',
        priority: 3,
        title: `Appliquer playbook: ${match.playbookName}`,
        description: match.applicationContext,
        rationale: `Match score: ${match.matchScore}/100. Règles pertinentes: ${match.relevantRules.join(', ')}`,
        expected_impact: match.matchScore > 80 ? 'high' : 'medium',
        estimated_effort: 'moderate',
        target_entity_type: 'project',
        target_entity_id: projectId,
        related_playbook_id: match.playbookId,
        actionable_steps: match.suggestedAdaptations,
        confidence_score: match.matchScore
    });
}
