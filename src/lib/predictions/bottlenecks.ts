import { getSupabaseClient } from '@/lib/supabase';

interface BottleneckPrediction {
    projectId: string;
    bottleneckType: 'resource' | 'dependency' | 'technical' | 'decision';
    bottleneckDescription: string;
    probabilityScore: number;
    estimatedImpactDays: number;
    timeHorizonDays: number;
    predictedOccurrenceDate: string;
    mitigationActions: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
}

export async function predictProjectBottlenecks(projectId: string): Promise<BottleneckPrediction[]> {
    const bottlenecks: BottleneckPrediction[] = [];
    const supabase = getSupabaseClient();

    const { data: project } = await supabase
        .from('projects')
        .select('*, decisions(*)')
        .eq('id', projectId)
        .single();

    if (!project) return [];

    const { data: pattern } = await supabase
        .from('pattern_analyses')
        .select('*')
        .eq('project_id', projectId)
        .order('analysis_date', { ascending: false })
        .limit(1)
        .single();

    // Detect decision bottleneck
    const decisionBottleneck = detectDecisionBottleneck(project, pattern);
    if (decisionBottleneck) bottlenecks.push(decisionBottleneck);

    // Detect resource bottleneck
    const resourceBottleneck = detectResourceBottleneck(project, pattern);
    if (resourceBottleneck) bottlenecks.push(resourceBottleneck);

    // Detect technical debt bottleneck
    const technicalBottleneck = detectTechnicalBottleneck(project, pattern);
    if (technicalBottleneck) bottlenecks.push(technicalBottleneck);

    return bottlenecks;
}

function detectDecisionBottleneck(project: any, pattern: any): BottleneckPrediction | null {
    const pendingDecisions = project.decisions?.filter((d: any) => d.status === 'pending') || [];

    if (pendingDecisions.length >= 2) {
        return {
            projectId: project.id,
            bottleneckType: 'decision',
            bottleneckDescription: `${pendingDecisions.length} décisions pending bloquent progression`,
            probabilityScore: 80,
            estimatedImpactDays: pendingDecisions.length * 3,
            timeHorizonDays: 7,
            predictedOccurrenceDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            mitigationActions: [
                'Planifier session décisions CEO cette semaine',
                'Prioriser décisions par impact/urgence',
                'Déléguer décisions non-stratégiques si possible'
            ],
            priority: pendingDecisions.length > 3 ? 'critical' : 'high'
        };
    }

    return null;
}

function detectResourceBottleneck(project: any, pattern: any): BottleneckPrediction | null {
    if (!pattern) return null;

    if (pattern.momentum_score > 70 && project.completion_percentage < 50) {
        return {
            projectId: project.id,
            bottleneckType: 'resource',
            bottleneckDescription: 'Bon momentum mais progression lente - ressources insuffisantes possible',
            probabilityScore: 60,
            estimatedImpactDays: 14,
            timeHorizonDays: 21,
            predictedOccurrenceDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            mitigationActions: [
                'Évaluer allocation ressources actuelles',
                'Considérer augmentation budget/équipe',
                'Identifier tâches parallélisables'
            ],
            priority: 'medium'
        };
    }

    return null;
}

function detectTechnicalBottleneck(project: any, pattern: any): BottleneckPrediction | null {
    if (!pattern) return null;

    const hasRecurringTech = pattern.blockers_recurring?.some((b: string) =>
        b.toLowerCase().includes('technique') ||
        b.toLowerCase().includes('bug') ||
        b.toLowerCase().includes('debt')
    );

    if (hasRecurringTech) {
        return {
            projectId: project.id,
            bottleneckType: 'technical',
            bottleneckDescription: 'Dette technique récurrente ralentit développement',
            probabilityScore: 75,
            estimatedImpactDays: 10,
            timeHorizonDays: 14,
            predictedOccurrenceDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            mitigationActions: [
                'Sprint dédié résolution dette technique',
                'Refactoring code critique',
                'Documentation solutions pour éviter récurrence'
            ],
            priority: 'high'
        };
    }

    return null;
}

export async function predictAllBottlenecks(): Promise<BottleneckPrediction[]> {
    const supabase = getSupabaseClient();

    const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .eq('status', 'active');

    if (!projects) return [];

    const allBottlenecks = await Promise.all(
        projects.map(p => predictProjectBottlenecks(p.id))
    );

    return allBottlenecks.flat();
}

export async function saveBottleneckPrediction(bottleneck: BottleneckPrediction): Promise<void> {
    const supabase = getSupabaseClient();

    await supabase.from('bottleneck_predictions').insert({
        project_id: bottleneck.projectId,
        bottleneck_type: bottleneck.bottleneckType,
        bottleneck_description: bottleneck.bottleneckDescription,
        probability_score: bottleneck.probabilityScore,
        estimated_impact_days: bottleneck.estimatedImpactDays,
        time_horizon_days: bottleneck.timeHorizonDays,
        predicted_occurrence_date: bottleneck.predictedOccurrenceDate,
        mitigation_actions: bottleneck.mitigationActions,
        priority: bottleneck.priority
    });
}
