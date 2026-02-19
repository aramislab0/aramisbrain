import { getSupabaseClient } from '@/lib/supabase';

interface CompletionForecast {
    projectId: string;
    currentCompletion: number;
    predictedCompletionDate: string;
    optimisticDate: string;
    realisticDate: string;
    pessimisticDate: string;
    confidenceLevel: number;
    velocityAssumption: number;
    factors: Record<string, any>;
    blockersAssumed: number;
}

export async function forecastProjectCompletion(projectId: string): Promise<CompletionForecast | null> {
    const supabase = getSupabaseClient();

    const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

    if (!project || project.completion_percentage === 100) return null;

    // Get pattern for velocity
    const { data: pattern } = await supabase
        .from('pattern_analyses')
        .select('*')
        .eq('project_id', projectId)
        .order('analysis_date', { ascending: false })
        .limit(1)
        .single();

    if (!pattern) return null;

    // Calculate average daily velocity (% per day)
    const dailyVelocity = pattern.velocity_30d / 30;

    if (dailyVelocity <= 0) {
        // Project stagnant, cannot forecast
        return null;
    }

    // Calculate remaining completion
    const remaining = 100 - project.completion_percentage;

    // Realistic scenario (current velocity)
    const daysToComplete = remaining / dailyVelocity;
    const realisticDate = new Date(Date.now() + daysToComplete * 24 * 60 * 60 * 1000);

    // Optimistic scenario (20% faster)
    const optimisticDays = daysToComplete * 0.8;
    const optimisticDate = new Date(Date.now() + optimisticDays * 24 * 60 * 60 * 1000);

    // Pessimistic scenario (40% slower, account for blockers)
    const pessimisticDays = daysToComplete * 1.4;
    const pessimisticDate = new Date(Date.now() + pessimisticDays * 24 * 60 * 60 * 1000);

    // Confidence based on velocity trend
    let confidenceLevel = 60; // baseline
    if (pattern.velocity_trend === 'stable') confidenceLevel = 75;
    if (pattern.velocity_trend === 'accelerating') confidenceLevel = 80;
    if (pattern.velocity_trend === 'decelerating') confidenceLevel = 50;
    if (pattern.velocity_trend === 'stagnant') confidenceLevel = 30;

    return {
        projectId: project.id,
        currentCompletion: project.completion_percentage,
        predictedCompletionDate: realisticDate.toISOString().split('T')[0],
        optimisticDate: optimisticDate.toISOString().split('T')[0],
        realisticDate: realisticDate.toISOString().split('T')[0],
        pessimisticDate: pessimisticDate.toISOString().split('T')[0],
        confidenceLevel,
        velocityAssumption: dailyVelocity,
        factors: {
            velocity_trend: pattern.velocity_trend,
            momentum_score: pattern.momentum_score,
            blockers_count: pattern.blockers_count,
            last_activity_days: pattern.last_activity_days
        },
        blockersAssumed: pattern.blockers_count
    };
}

export async function forecastAllProjectsCompletion(): Promise<CompletionForecast[]> {
    const supabase = getSupabaseClient();

    const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .eq('status', 'active')
        .lt('completion_percentage', 100);

    if (!projects) return [];

    const forecasts = await Promise.all(
        projects.map(p => forecastProjectCompletion(p.id))
    );

    return forecasts.filter(f => f !== null) as CompletionForecast[];
}

export async function saveCompletionForecast(forecast: CompletionForecast): Promise<void> {
    const supabase = getSupabaseClient();

    await supabase.from('completion_forecasts').upsert({
        project_id: forecast.projectId,
        forecast_date: new Date().toISOString().split('T')[0],
        current_completion: forecast.currentCompletion,
        predicted_completion_date: forecast.predictedCompletionDate,
        optimistic_date: forecast.optimisticDate,
        realistic_date: forecast.realisticDate,
        pessimistic_date: forecast.pessimisticDate,
        confidence_level: forecast.confidenceLevel,
        velocity_assumption: forecast.velocityAssumption,
        factors: forecast.factors,
        blockers_assumed: forecast.blockersAssumed
    }, {
        onConflict: 'project_id,forecast_date'
    });
}
