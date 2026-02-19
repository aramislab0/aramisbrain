import { getSupabaseClient } from '@/lib/supabase';

interface Recommendation {
    category: 'focus' | 'decision' | 'resource' | 'risk_mitigation' | 'opportunity';
    priority: number;
    title: string;
    description: string;
    rationale: string;
    expectedImpact: 'high' | 'medium' | 'low';
    estimatedEffort: 'quick_win' | 'moderate' | 'significant';
    timeSensitive: boolean;
    deadlineDate?: string;
    targetEntityType?: 'project' | 'portfolio' | 'decision';
    targetEntityId?: string;
    actionableSteps: string[];
    relatedPlaybookId?: string;
    confidenceScore: number;
}

export async function generateSmartSuggestions(): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    const supabase = getSupabaseClient();
    const { data: portfolioHealth } = await supabase
        .from('portfolio_health')
        .select('*')
        .order('score_date', { ascending: false })
        .limit(1)
        .single();

    const { data: projects } = await supabase
        .from('projects')
        .select('*, health_scores(*), pattern_analyses(*), risk_predictions(*)')
        .eq('status', 'active');

    if (!projects) return [];

    for (const project of projects) {
        const focusRec = generateFocusRecommendation(project);
        if (focusRec) recommendations.push(focusRec);

        const riskRecs = generateRiskMitigationRecommendations(project);
        recommendations.push(...riskRecs);

        const oppRec = generateOpportunityRecommendation(project);
        if (oppRec) recommendations.push(oppRec);

        const resourceRec = generateResourceRecommendation(project, portfolioHealth);
        if (resourceRec) recommendations.push(resourceRec);
    }

    const portfolioRec = generatePortfolioRecommendation(portfolioHealth, projects);
    if (portfolioRec) recommendations.push(portfolioRec);

    return recommendations
        .sort((a, b) => a.priority - b.priority)
        .slice(0, 10);
}

function generateFocusRecommendation(project: any): Recommendation | null {
    const latestHealth = project.health_scores?.[0];

    if (!latestHealth || latestHealth.overall_score >= 60) return null;

    const isCritical = latestHealth.overall_score < 50;

    return {
        category: 'focus',
        priority: isCritical ? 1 : 2,
        title: `Focus CEO requis sur ${project.name}`,
        description: `Health score à ${Math.round(latestHealth.overall_score)}/100 ${isCritical ? '(CRITIQUE)' : '(Attention)'}`,
        rationale: `Facteurs critiques: velocity ${Math.round(latestHealth.velocity_score)}/100, risk ${Math.round(latestHealth.risk_score)}/100. ${project.main_blocker ? `Blocker actuel: ${project.main_blocker}` : ''}`,
        expectedImpact: 'high',
        estimatedEffort: 'moderate',
        timeSensitive: isCritical,
        deadlineDate: isCritical ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
        targetEntityType: 'project',
        targetEntityId: project.id,
        actionableSteps: [
            `Analyser cause root du blocker: "${project.main_blocker || 'Non spécifié'}"`,
            'Organiser session focus CEO (2h) cette semaine',
            'Identifier décisions pending bloquantes',
            'Définir plan action avec timeline',
            'Allouer ressources si nécessaire'
        ],
        confidenceScore: 85
    };
}

function generateRiskMitigationRecommendations(project: any): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (!project.risk_predictions || project.risk_predictions.length === 0) {
        return recommendations;
    }

    for (const riskPred of project.risk_predictions) {
        if (riskPred.status !== 'active' || riskPred.probability_score < 60) continue;

        const isHighProbability = riskPred.probability_score >= 75;

        recommendations.push({
            category: 'risk_mitigation',
            priority: isHighProbability ? 1 : 3,
            title: `Anticiper risque ${riskPred.risk_type} sur ${project.name}`,
            description: `Probabilité ${Math.round(riskPred.probability_score)}% dans ${riskPred.time_horizon_days} jours`,
            rationale: `Facteurs: ${JSON.stringify(riskPred.factors)}. Impact estimé: ${riskPred.estimated_impact}`,
            expectedImpact: riskPred.estimated_impact === 'major' || riskPred.estimated_impact === 'severe' ? 'high' : 'medium',
            estimatedEffort: 'moderate',
            timeSensitive: true,
            deadlineDate: new Date(Date.now() + riskPred.time_horizon_days * 0.7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            targetEntityType: 'project',
            targetEntityId: project.id,
            actionableSteps: riskPred.mitigation_suggestions || [
                'Analyser facteurs de risque en détail',
                'Préparer plan mitigation',
                'Allouer ressources prévention'
            ],
            confidenceScore: riskPred.confidence_level || 70
        });
    }

    return recommendations;
}

function generateOpportunityRecommendation(project: any): Recommendation | null {
    const latestPattern = project.pattern_analyses?.[0];
    const latestHealth = project.health_scores?.[0];

    if (!latestPattern || !latestHealth) return null;

    if (latestPattern.momentum_score > 70 &&
        latestHealth.overall_score > 60 &&
        project.completion_percentage < 90) {

        return {
            category: 'opportunity',
            priority: 2,
            title: `Opportunité accélération: ${project.name}`,
            description: `Momentum élevé (${Math.round(latestPattern.momentum_score)}/100) - potentiel pour delivery rapide`,
            rationale: `Velocity trend: ${latestPattern.velocity_trend}. Health: ${Math.round(latestHealth.overall_score)}/100. Pas de blockers majeurs.`,
            expectedImpact: 'high',
            estimatedEffort: 'moderate',
            timeSensitive: true,
            deadlineDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            targetEntityType: 'project',
            targetEntityId: project.id,
            actionableSteps: [
                'Capitaliser sur momentum actuel',
                'Augmenter allocation ressources temporairement',
                'Prioriser ce projet pour les 2 prochaines semaines',
                'Viser delivery avant fin du mois',
                `Cash impact: ${project.cash_impact_score}/10 - ROI rapide potentiel`
            ],
            confidenceScore: 75
        };
    }

    return null;
}

function generateResourceRecommendation(project: any, portfolioHealth: any): Recommendation | null {
    const latestHealth = project.health_scores?.[0];

    if (!latestHealth) return null;

    if (latestHealth.overall_score < 55 && project.cash_impact_score > 7) {
        return {
            category: 'resource',
            priority: 2,
            title: `Décision ressources: ${project.name}`,
            description: `Cash impact élevé (${project.cash_impact_score}/10) mais health faible (${Math.round(latestHealth.overall_score)}/100)`,
            rationale: 'Projet stratégique sous-performant. Choix: augmenter ressources OU pauser et réallouer.',
            expectedImpact: 'high',
            estimatedEffort: 'significant',
            timeSensitive: true,
            targetEntityType: 'project',
            targetEntityId: project.id,
            actionableSteps: [
                'Analyser cause root de la faible performance',
                'Option A: Doubler ressources (budget + équipe) si critique',
                'Option B: Pauser et réallouer vers projets plus performants',
                'Décision CEO requise sous 1 semaine',
                'Documenter rationale dans decisions'
            ],
            confidenceScore: 80
        };
    }

    if (latestHealth.overall_score < 50 && project.cash_impact_score < 5) {
        return {
            category: 'resource',
            priority: 3,
            title: `Considérer pause: ${project.name}`,
            description: `Faible cash impact (${project.cash_impact_score}/10) + faible health (${Math.round(latestHealth.overall_score)}/100)`,
            rationale: 'Ressources pourraient être mieux utilisées sur projets plus stratégiques.',
            expectedImpact: 'medium',
            estimatedEffort: 'quick_win',
            timeSensitive: false,
            targetEntityType: 'project',
            targetEntityId: project.id,
            actionableSteps: [
                'Réévaluer ROI stratégique du projet',
                'Comparer avec autres opportunités portefeuille',
                'Si non-critique: pauser et réallouer ressources',
                'Documenter décision et critères de reprise'
            ],
            confidenceScore: 70
        };
    }

    return null;
}

function generatePortfolioRecommendation(portfolioHealth: any, projects: any[]): Recommendation | null {
    if (!portfolioHealth) return null;

    if (portfolioHealth.trend_7d < -5) {
        return {
            category: 'focus',
            priority: 1,
            title: 'Health portefeuille en baisse',
            description: `Score global à ${Math.round(portfolioHealth.overall_score)}/100 (${portfolioHealth.trend_7d.toFixed(1)} pts cette semaine)`,
            rationale: `${portfolioHealth.projects_critical} projet(s) critiques. Top concern: ${portfolioHealth.top_concern}`,
            expectedImpact: 'high',
            estimatedEffort: 'significant',
            timeSensitive: true,
            deadlineDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            targetEntityType: 'portfolio',
            actionableSteps: [
                'Session stratégique CEO cette semaine',
                'Review chaque projet critique individuellement',
                'Identifier patterns communs aux problèmes',
                'Réallouer ressources si nécessaire',
                'Définir plan redressement 30 jours'
            ],
            confidenceScore: 90
        };
    }

    return null;
}

export async function saveRecommendation(rec: Recommendation): Promise<void> {
    const supabase = getSupabaseClient();

    await supabase.from('recommendations').insert({
        category: rec.category,
        priority: rec.priority,
        title: rec.title,
        description: rec.description,
        rationale: rec.rationale,
        expected_impact: rec.expectedImpact,
        estimated_effort: rec.estimatedEffort,
        time_sensitive: rec.timeSensitive,
        deadline_date: rec.deadlineDate,
        target_entity_type: rec.targetEntityType,
        target_entity_id: rec.targetEntityId,
        actionable_steps: rec.actionableSteps,
        related_playbook_id: rec.relatedPlaybookId,
        confidence_score: rec.confidenceScore
    });
}
