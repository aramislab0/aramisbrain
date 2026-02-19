import { getSupabaseClient } from '@/lib/supabase';

interface RiskPrediction {
    projectId: string;
    riskType: 'technical' | 'administrative' | 'financial' | 'dispersion';
    predictedSeverity: 'low' | 'medium' | 'high' | 'critical';
    probabilityScore: number;
    estimatedImpact: 'minor' | 'moderate' | 'major' | 'severe';
    timeHorizonDays: number;
    predictedOccurrenceDate: string;
    confidenceLevel: number;
    factors: Record<string, any>;
    mitigationSuggestions: string[];
}

export async function predictProjectRisks(projectId: string): Promise<RiskPrediction[]> {
    const predictions: RiskPrediction[] = [];
    const supabase = getSupabaseClient();

    // Get project data
    const { data: project } = await supabase
        .from('projects')
        .select('*, risks(*), decisions(*)')
        .eq('id', projectId)
        .single();

    if (!project) return [];

    // Get pattern analysis
    const { data: pattern } = await supabase
        .from('pattern_analyses')
        .select('*')
        .eq('project_id', projectId)
        .order('analysis_date', { ascending: false })
        .limit(1)
        .single();

    // Get health score
    const { data: health } = await supabase
        .from('health_scores')
        .select('*')
        .eq('project_id', projectId)
        .order('score_date', { ascending: false })
        .limit(1)
        .single();

    // Predict technical risks
    const technicalRisk = predictTechnicalRisk(project, pattern, health);
    if (technicalRisk) predictions.push(technicalRisk);

    // Predict stagnation risk
    const stagnationRisk = predictStagnationRisk(project, pattern);
    if (stagnationRisk) predictions.push(stagnationRisk);

    // Predict dispersion risk
    const dispersionRisk = predictDispersionRisk(project, pattern);
    if (dispersionRisk) predictions.push(dispersionRisk);

    // Predict resource risk
    const resourceRisk = predictResourceRisk(project, health);
    if (resourceRisk) predictions.push(resourceRisk);

    return predictions;
}

function predictTechnicalRisk(project: any, pattern: any, health: any): RiskPrediction | null {
    // Check for technical debt indicators
    const hasRecurringTechnicalBlockers = pattern?.blockers_recurring?.some((b: string) =>
        b.toLowerCase().includes('technique') ||
        b.toLowerCase().includes('bug') ||
        b.toLowerCase().includes('css') ||
        b.toLowerCase().includes('tailwind')
    );

    if (hasRecurringTechnicalBlockers || project.main_blocker?.toLowerCase().includes('css')) {
        const probabilityScore = 75;
        const timeHorizonDays = 14;

        return {
            projectId: project.id,
            riskType: 'technical',
            predictedSeverity: 'high',
            probabilityScore,
            estimatedImpact: 'major',
            timeHorizonDays,
            predictedOccurrenceDate: new Date(Date.now() + timeHorizonDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            confidenceLevel: 70,
            factors: {
                recurring_blockers: hasRecurringTechnicalBlockers,
                current_blocker: project.main_blocker,
                velocity_trend: pattern?.velocity_trend
            },
            mitigationSuggestions: [
                'Allouer temps développeur senior pour résoudre dette technique',
                'Créer sprint dédié résolution blockers techniques',
                'Documenter solutions pour éviter récurrence'
            ]
        };
    }

    return null;
}

function predictStagnationRisk(project: any, pattern: any): RiskPrediction | null {
    if (!pattern) return null;

    if (pattern.velocity_trend === 'decelerating' || pattern.momentum_score < 40) {
        const probabilityScore = pattern.momentum_score < 30 ? 80 : 60;
        const timeHorizonDays = pattern.last_activity_days > 7 ? 7 : 14;

        return {
            projectId: project.id,
            riskType: 'administrative',
            predictedSeverity: 'medium',
            probabilityScore,
            estimatedImpact: 'moderate',
            timeHorizonDays,
            predictedOccurrenceDate: new Date(Date.now() + timeHorizonDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            confidenceLevel: 65,
            factors: {
                velocity_trend: pattern.velocity_trend,
                momentum_score: pattern.momentum_score,
                last_activity_days: pattern.last_activity_days
            },
            mitigationSuggestions: [
                'Planifier session focus CEO sur ce projet',
                'Identifier et débloquer décisions pending',
                'Réallouer ressources si nécessaire'
            ]
        };
    }

    return null;
}

function predictDispersionRisk(project: any, pattern: any): RiskPrediction | null {
    if (!pattern) return null;

    if (pattern.decisions_velocity > 5 || pattern.blockers_count > 2) {
        return {
            projectId: project.id,
            riskType: 'dispersion',
            predictedSeverity: 'medium',
            probabilityScore: 55,
            estimatedImpact: 'moderate',
            timeHorizonDays: 21,
            predictedOccurrenceDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            confidenceLevel: 60,
            factors: {
                decisions_velocity: pattern.decisions_velocity,
                blockers_count: pattern.blockers_count
            },
            mitigationSuggestions: [
                'Consolider focus sur 1-2 priorités max',
                'Reporter décisions non-critiques',
                'Simplifier scope si possible'
            ]
        };
    }

    return null;
}

function predictResourceRisk(project: any, health: any): RiskPrediction | null {
    if (!health) return null;

    if (project.cash_impact_score > 7 && health.overall_score < 60) {
        return {
            projectId: project.id,
            riskType: 'financial',
            predictedSeverity: 'high',
            probabilityScore: 70,
            estimatedImpact: 'major',
            timeHorizonDays: 30,
            predictedOccurrenceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            confidenceLevel: 65,
            factors: {
                cash_impact_score: project.cash_impact_score,
                overall_health: health.overall_score,
                risk_level: project.risk_level
            },
            mitigationSuggestions: [
                'Réévaluer allocation budget/ressources',
                'Accélérer ou pauser selon priorités stratégiques',
                'Décision CEO requise sur continuation'
            ]
        };
    }

    return null;
}

export async function predictAllProjectsRisks(): Promise<RiskPrediction[]> {
    const supabase = getSupabaseClient();

    const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .eq('status', 'active');

    if (!projects) return [];

    const allPredictions = await Promise.all(
        projects.map(p => predictProjectRisks(p.id))
    );

    return allPredictions.flat();
}

export async function saveRiskPrediction(prediction: RiskPrediction): Promise<void> {
    const supabase = getSupabaseClient();

    await supabase.from('risk_predictions').insert({
        project_id: prediction.projectId,
        risk_type: prediction.riskType,
        predicted_severity: prediction.predictedSeverity,
        probability_score: prediction.probabilityScore,
        estimated_impact: prediction.estimatedImpact,
        time_horizon_days: prediction.timeHorizonDays,
        predicted_occurrence_date: prediction.predictedOccurrenceDate,
        confidence_level: prediction.confidenceLevel,
        factors: prediction.factors,
        mitigation_suggestions: prediction.mitigationSuggestions
    });
}
