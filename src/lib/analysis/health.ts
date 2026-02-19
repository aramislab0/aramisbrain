import { getSupabaseClient } from '@/lib/supabase';

interface HealthScore {
    projectId: string;
    overallScore: number;
    completionScore: number;
    velocityScore: number;
    riskScore: number;
    cashImpactScore: number;
    decisionQualityScore: number;
    momentumScore: number;
    grade: 'excellent' | 'good' | 'warning' | 'critical';
    factorsBreakdown: Record<string, any>;
}

interface PortfolioHealth {
    overallScore: number;
    projectsCount: number;
    projectsHealthy: number;
    projectsWarning: number;
    projectsCritical: number;
    trend7d: number;
    trend30d: number;
    topConcern: string;
    topOpportunity: string;
}

export async function calculateProjectHealth(projectId: string): Promise<HealthScore> {
    const supabase = getSupabaseClient();

    const { data: project } = await supabase
        .from('projects')
        .select('*, decisions(*), risks(*)')
        .eq('id', projectId)
        .single();

    if (!project) throw new Error('Project not found');

    // Get pattern analysis for momentum
    const { data: pattern } = await supabase
        .from('pattern_analyses')
        .select('*')
        .eq('project_id', projectId)
        .order('analysis_date', { ascending: false })
        .limit(1)
        .single();

    // Calculate component scores
    const completionScore = calculateCompletionScore(project);
    const velocityScore = calculateVelocityScore(pattern);
    const riskScore = calculateRiskScore(project);
    const cashImpactScore = project.cash_impact_score * 10; // 0-10 → 0-100
    const decisionQualityScore = await calculateDecisionQualityScore(projectId);
    const momentumScore = pattern?.momentum_score || 50;

    // Weighted overall score
    const overallScore =
        completionScore * 0.30 +
        velocityScore * 0.25 +
        riskScore * 0.20 +
        cashImpactScore * 0.15 +
        decisionQualityScore * 0.10;

    const grade = getGrade(overallScore);

    return {
        projectId,
        overallScore: Math.round(overallScore * 100) / 100,
        completionScore,
        velocityScore,
        riskScore,
        cashImpactScore,
        decisionQualityScore,
        momentumScore,
        grade,
        factorsBreakdown: {
            completion: { score: completionScore, weight: 0.30 },
            velocity: { score: velocityScore, weight: 0.25 },
            risk: { score: riskScore, weight: 0.20 },
            cashImpact: { score: cashImpactScore, weight: 0.15 },
            decisionQuality: { score: decisionQualityScore, weight: 0.10 }
        }
    };
}

function calculateCompletionScore(project: any): number {
    return project.completion_percentage;
}

function calculateVelocityScore(pattern: any): number {
    if (!pattern) return 50;

    switch (pattern.velocity_trend) {
        case 'accelerating': return 90;
        case 'stable': return 70;
        case 'decelerating': return 40;
        case 'stagnant': return 10;
        default: return 50;
    }
}

function calculateRiskScore(project: any): number {
    // Inverse of risk level (low risk = high score)
    const riskLevels: Record<string, number> = { low: 100, medium: 60, high: 30, critical: 0 };
    return riskLevels[project.risk_level] || 50;
}

async function calculateDecisionQualityScore(projectId: string): Promise<number> {
    const supabase = getSupabaseClient();

    const { data: decisions } = await supabase
        .from('decisions')
        .select('status, rationale')
        .eq('project_id', projectId);

    if (!decisions || decisions.length === 0) return 50;

    const executedCount = decisions.filter(d => d.status === 'executed').length;
    const executedRate = executedCount / decisions.length;

    const avgRationaleLength = decisions.reduce((sum, d) =>
        sum + (d.rationale?.length || 0), 0) / decisions.length;

    const executionScore = executedRate * 100;
    const rationaleScore = Math.min(100, (avgRationaleLength / 200) * 100);

    return (executionScore + rationaleScore) / 2;
}

function getGrade(score: number): 'excellent' | 'good' | 'warning' | 'critical' {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'warning';
    return 'critical';
}

export async function calculatePortfolioHealth(): Promise<PortfolioHealth> {
    const supabase = getSupabaseClient();

    const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .eq('status', 'active');

    if (!projects || projects.length === 0) {
        return {
            overallScore: 0,
            projectsCount: 0,
            projectsHealthy: 0,
            projectsWarning: 0,
            projectsCritical: 0,
            trend7d: 0,
            trend30d: 0,
            topConcern: 'No active projects',
            topOpportunity: 'N/A'
        };
    }

    const healthScores = await Promise.all(
        projects.map(p => calculateProjectHealth(p.id))
    );

    const overallScore = healthScores.reduce((sum, h) => sum + h.overallScore, 0) / healthScores.length;

    const projectsHealthy = healthScores.filter(h => h.overallScore >= 70).length;
    const projectsWarning = healthScores.filter(h => h.overallScore >= 50 && h.overallScore < 70).length;
    const projectsCritical = healthScores.filter(h => h.overallScore < 50).length;

    // Get historical scores for trends
    const { data: history } = await supabase
        .from('portfolio_health')
        .select('overall_score, score_date')
        .order('score_date', { ascending: false })
        .limit(30);

    const trend7d = calculateTrend(history, 7, overallScore);
    const trend30d = calculateTrend(history, 30, overallScore);

    // Find top concern (lowest score project)
    const topConcernProject = healthScores.reduce((min, h) =>
        h.overallScore < min.overallScore ? h : min
    );

    const { data: concernProject } = await supabase
        .from('projects')
        .select('name')
        .eq('id', topConcernProject.projectId)
        .single();

    const topConcern = `${concernProject?.name}: ${Math.round(topConcernProject.overallScore)}/100`;

    // Find top opportunity (highest momentum project below 80%)
    const opportunityProject = healthScores
        .filter(h => h.overallScore < 80)
        .reduce((max, h) => h.momentumScore > max.momentumScore ? h : max, healthScores[0]);

    const { data: oppProject } = await supabase
        .from('projects')
        .select('name')
        .eq('id', opportunityProject.projectId)
        .single();

    const topOpportunity = `${oppProject?.name}: High momentum (${Math.round(opportunityProject.momentumScore)})`;

    return {
        overallScore: Math.round(overallScore * 100) / 100,
        projectsCount: projects.length,
        projectsHealthy,
        projectsWarning,
        projectsCritical,
        trend7d: Math.round(trend7d * 100) / 100,
        trend30d: Math.round(trend30d * 100) / 100,
        topConcern,
        topOpportunity
    };
}

function calculateTrend(history: any[] | null, days: number, currentScore: number): number {
    if (!history || history.length === 0) return 0;

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - days);

    const historicalScore = history.find(h => {
        const scoreDate = new Date(h.score_date);
        return scoreDate <= targetDate;
    });

    if (!historicalScore) return 0;

    return currentScore - historicalScore.overall_score;
}

export async function saveHealthScore(health: HealthScore): Promise<void> {
    const supabase = getSupabaseClient();

    await supabase.from('health_scores').upsert({
        project_id: health.projectId,
        score_date: new Date().toISOString().split('T')[0],
        overall_score: health.overallScore,
        completion_score: health.completionScore,
        velocity_score: health.velocityScore,
        risk_score: health.riskScore,
        cash_impact_score: health.cashImpactScore,
        decision_quality_score: health.decisionQualityScore,
        momentum_score: health.momentumScore,
        grade: health.grade,
        factors_breakdown: health.factorsBreakdown
    }, {
        onConflict: 'project_id,score_date'
    });
}

export async function savePortfolioHealth(portfolio: PortfolioHealth): Promise<void> {
    const supabase = getSupabaseClient();

    await supabase.from('portfolio_health').upsert({
        score_date: new Date().toISOString().split('T')[0],
        overall_score: portfolio.overallScore,
        projects_count: portfolio.projectsCount,
        projects_healthy: portfolio.projectsHealthy,
        projects_warning: portfolio.projectsWarning,
        projects_critical: portfolio.projectsCritical,
        trend_7d: portfolio.trend7d,
        trend_30d: portfolio.trend30d,
        top_concern: portfolio.topConcern,
        top_opportunity: portfolio.topOpportunity
    }, {
        onConflict: 'score_date'
    });
}
