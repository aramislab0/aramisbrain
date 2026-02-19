import { getSupabaseClient } from '@/lib/supabase';

interface Anomaly {
    projectId: string;
    anomalyType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    metricName: string;
    baselineValue: number;
    currentValue: number;
    deviationPercent: number;
    description: string;
    isPositive: boolean;
}

export async function detectAnomalies(projectId: string): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];

    const supabase = getSupabaseClient();

    const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

    if (!project) return [];

    // Get historical health scores
    const { data: healthHistory } = await supabase
        .from('health_scores')
        .select('*')
        .eq('project_id', projectId)
        .order('score_date', { ascending: false })
        .limit(30);

    // Get historical pattern analyses
    const { data: patternHistory } = await supabase
        .from('pattern_analyses')
        .select('*')
        .eq('project_id', projectId)
        .order('analysis_date', { ascending: false })
        .limit(30);

    if (!healthHistory || healthHistory.length < 2) return anomalies;

    const current = healthHistory[0];
    const baseline = calculateBaseline(healthHistory.slice(1, 8));

    // Check for velocity anomalies
    if (patternHistory && patternHistory.length >= 2) {
        const velocityAnomaly = detectVelocityAnomaly(patternHistory, project);
        if (velocityAnomaly) anomalies.push(velocityAnomaly);
    }

    // Check for stagnation
    const stagnationAnomaly = detectStagnation(patternHistory, project);
    if (stagnationAnomaly) anomalies.push(stagnationAnomaly);

    // Check for health score drop
    const healthDropAnomaly = detectHealthDrop(current, baseline, project);
    if (healthDropAnomaly) anomalies.push(healthDropAnomaly);

    // Check for risk spike
    const riskAnomaly = await detectRiskSpike(projectId, project);
    if (riskAnomaly) anomalies.push(riskAnomaly);

    return anomalies;
}

function calculateBaseline(history: any[]): any {
    if (history.length === 0) return null;

    return {
        overall_score: history.reduce((sum: number, h: any) => sum + h.overall_score, 0) / history.length,
        velocity_score: history.reduce((sum: number, h: any) => sum + h.velocity_score, 0) / history.length
    };
}

function detectVelocityAnomaly(history: any[], project: any): Anomaly | null {
    if (history.length < 2) return null;

    const current = history[0];
    const previous = history[1];

    const velocityChange = ((current.velocity_7d - previous.velocity_7d) / (previous.velocity_7d || 1)) * 100;

    if (Math.abs(velocityChange) > 40) {
        return {
            projectId: project.id,
            anomalyType: velocityChange < 0 ? 'velocity_drop' : 'velocity_spike',
            severity: Math.abs(velocityChange) > 60 ? 'critical' : 'high',
            metricName: 'Velocity 7d',
            baselineValue: previous.velocity_7d,
            currentValue: current.velocity_7d,
            deviationPercent: Math.abs(velocityChange),
            description: velocityChange < 0
                ? `Velocity dropped ${Math.abs(Math.round(velocityChange))}% in last period`
                : `Velocity increased ${Math.round(velocityChange)}% - potential acceleration opportunity`,
            isPositive: velocityChange > 0
        };
    }

    return null;
}

function detectStagnation(history: any[] | null, project: any): Anomaly | null {
    if (!history || history.length < 1) return null;

    const current = history[0];

    if (current.last_activity_days > 14) {
        return {
            projectId: project.id,
            anomalyType: 'stagnation',
            severity: current.last_activity_days > 30 ? 'critical' : 'high',
            metricName: 'Last Activity',
            baselineValue: 7,
            currentValue: current.last_activity_days,
            deviationPercent: ((current.last_activity_days - 7) / 7) * 100,
            description: `No activity for ${current.last_activity_days} days - project may be stalled`,
            isPositive: false
        };
    }

    return null;
}

function detectHealthDrop(current: any, baseline: any, project: any): Anomaly | null {
    if (!baseline) return null;

    const drop = baseline.overall_score - current.overall_score;

    if (drop > 15) {
        return {
            projectId: project.id,
            anomalyType: 'health_drop',
            severity: drop > 30 ? 'critical' : drop > 20 ? 'high' : 'medium',
            metricName: 'Health Score',
            baselineValue: baseline.overall_score,
            currentValue: current.overall_score,
            deviationPercent: (drop / baseline.overall_score) * 100,
            description: `Health score dropped ${Math.round(drop)} points from baseline`,
            isPositive: false
        };
    }

    return null;
}

async function detectRiskSpike(projectId: string, project: any): Promise<Anomaly | null> {
    const supabase = getSupabaseClient();

    // Count risks added in last 7 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);

    const { count: newRisks } = await supabase
        .from('risks')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId)
        .gte('created_at', cutoffDate.toISOString());

    if (newRisks && newRisks > 2) {
        return {
            projectId: project.id,
            anomalyType: 'risk_spike',
            severity: newRisks > 4 ? 'critical' : 'high',
            metricName: 'New Risks',
            baselineValue: 1,
            currentValue: newRisks,
            deviationPercent: ((newRisks - 1) / 1) * 100,
            description: `${newRisks} new risks identified in last 7 days - requires attention`,
            isPositive: false
        };
    }

    return null;
}

export async function detectAllAnomalies(): Promise<Anomaly[]> {
    const supabase = getSupabaseClient();

    const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .eq('status', 'active');

    if (!projects) return [];

    const allAnomalies = await Promise.all(
        projects.map(p => detectAnomalies(p.id))
    );

    return allAnomalies.flat();
}

export async function saveAnomaly(anomaly: Anomaly): Promise<void> {
    const supabase = getSupabaseClient();

    // Check if similar anomaly already exists (avoid duplicates)
    const { data: existing } = await supabase
        .from('anomalies')
        .select('id')
        .eq('project_id', anomaly.projectId)
        .eq('anomaly_type', anomaly.anomalyType)
        .eq('resolved', false)
        .limit(1)
        .single();

    if (existing) return; // Don't create duplicate

    await supabase.from('anomalies').insert({
        project_id: anomaly.projectId,
        anomaly_type: anomaly.anomalyType,
        severity: anomaly.severity,
        metric_name: anomaly.metricName,
        baseline_value: anomaly.baselineValue,
        current_value: anomaly.currentValue,
        deviation_percent: anomaly.deviationPercent,
        description: anomaly.description,
        is_positive: anomaly.isPositive
    });
}
