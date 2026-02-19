import { getSupabaseClient } from '@/lib/supabase';

interface PatternAnalysis {
    projectId: string;
    velocity7d: number;
    velocity30d: number;
    velocityTrend: 'accelerating' | 'stable' | 'decelerating' | 'stagnant';
    blockersCount: number;
    blockersRecurring: string[];
    decisionsVelocity: number;
    lastActivityDays: number;
    momentumScore: number;
}

export async function analyzeProjectPatterns(projectId: string): Promise<PatternAnalysis> {
    const supabase = getSupabaseClient();

    // Fetch project data
    const { data: project } = await supabase
        .from('projects')
        .select('*, decisions(*), risks(*), events(*)')
        .eq('id', projectId)
        .single();

    if (!project) throw new Error('Project not found');

    // Calculate velocity 7 days
    const velocity7d = calculateVelocity(project, 7);

    // Calculate velocity 30 days
    const velocity30d = calculateVelocity(project, 30);

    // Determine trend
    const velocityTrend = determineVelocityTrend(velocity7d, velocity30d);

    // Count blockers
    const blockersCount = project.main_blocker && project.main_blocker !== 'Aucun' ? 1 : 0;

    // Get recurring blockers (analyze historical events)
    const blockersRecurring = await getRecurringBlockers(projectId);

    // Calculate decisions velocity (last 30 days)
    const decisionsVelocity = await getDecisionsVelocity(projectId, 30);

    // Last activity days
    const lastActivityDays = await getLastActivityDays(projectId);

    // Calculate momentum score
    const momentumScore = calculateMomentumScore({
        velocity7d,
        velocity30d,
        decisionsVelocity,
        lastActivityDays,
        blockersCount
    });

    return {
        projectId,
        velocity7d,
        velocity30d,
        velocityTrend,
        blockersCount,
        blockersRecurring,
        decisionsVelocity,
        lastActivityDays,
        momentumScore
    };
}

function calculateVelocity(project: any, days: number): number {
    // Simple: assume linear progression
    // In reality, would look at historical completion_percentage changes
    const dailyRate = project.completion_percentage / 30; // rough estimate
    return dailyRate * days;
}

function determineVelocityTrend(v7d: number, v30d: number): 'accelerating' | 'stable' | 'decelerating' | 'stagnant' {
    const ratio = v7d / (v30d / 4.3); // v7d vs weekly average from v30d

    if (v7d === 0 && v30d === 0) return 'stagnant';
    if (ratio > 1.2) return 'accelerating';
    if (ratio < 0.8) return 'decelerating';
    return 'stable';
}

async function getRecurringBlockers(projectId: string): Promise<string[]> {
    const supabase = getSupabaseClient();

    const { data: events } = await supabase
        .from('events')
        .select('description')
        .eq('entity_id', projectId)
        .ilike('description', '%blocker%')
        .order('created_at', { ascending: false })
        .limit(10);

    // Simple: extract unique blocker mentions
    const blockers = events?.map(e => e.description) || [];
    return [...new Set(blockers)];
}

async function getDecisionsVelocity(projectId: string, days: number): Promise<number> {
    const supabase = getSupabaseClient();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { count } = await supabase
        .from('decisions')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId)
        .gte('created_at', cutoffDate.toISOString());

    return count || 0;
}

async function getLastActivityDays(projectId: string): Promise<number> {
    const supabase = getSupabaseClient();

    // Get most recent event/decision/update
    const { data: latestEvent } = await supabase
        .from('events')
        .select('created_at')
        .eq('entity_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (!latestEvent) return 999;

    const lastActivity = new Date(latestEvent.created_at);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    return diffDays;
}

function calculateMomentumScore(data: {
    velocity7d: number;
    velocity30d: number;
    decisionsVelocity: number;
    lastActivityDays: number;
    blockersCount: number;
}): number {
    let score = 50; // baseline

    // Velocity contribution (0-30 points)
    const velocityRatio = data.velocity7d / (data.velocity30d / 4.3 || 1);
    if (velocityRatio > 1.5) score += 30;
    else if (velocityRatio > 1.2) score += 20;
    else if (velocityRatio > 0.8) score += 10;
    else if (velocityRatio < 0.5) score -= 20;

    // Decisions velocity (0-20 points)
    if (data.decisionsVelocity > 5) score += 20;
    else if (data.decisionsVelocity > 2) score += 10;
    else if (data.decisionsVelocity === 0) score -= 10;

    // Last activity penalty (-30 to 0 points)
    if (data.lastActivityDays > 30) score -= 30;
    else if (data.lastActivityDays > 14) score -= 15;
    else if (data.lastActivityDays > 7) score -= 5;

    // Blockers penalty (0 to -20 points)
    score -= data.blockersCount * 10;

    return Math.max(0, Math.min(100, score));
}

export async function analyzeAllProjectsPatterns(): Promise<PatternAnalysis[]> {
    const supabase = getSupabaseClient();

    const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .eq('status', 'active');

    if (!projects) return [];

    const analyses = await Promise.all(
        projects.map(p => analyzeProjectPatterns(p.id))
    );

    return analyses;
}

export async function savePatternAnalysis(analysis: PatternAnalysis): Promise<void> {
    const supabase = getSupabaseClient();

    await supabase.from('pattern_analyses').insert({
        project_id: analysis.projectId,
        velocity_7d: analysis.velocity7d,
        velocity_30d: analysis.velocity30d,
        velocity_trend: analysis.velocityTrend,
        blockers_count: analysis.blockersCount,
        blockers_recurring: analysis.blockersRecurring,
        decisions_velocity: analysis.decisionsVelocity,
        last_activity_days: analysis.lastActivityDays,
        momentum_score: analysis.momentumScore
    });
}
