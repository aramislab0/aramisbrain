import { getSupabaseClient } from '@/lib/supabase';

interface DecisionSupport {
    decisionTitle: string;
    context: string;
    options: DecisionOption[];
    recommendation: string;
    relatedPlaybook?: any;
}

interface DecisionOption {
    option: string;
    pros: string[];
    cons: string[];
    riskLevel: 'low' | 'medium' | 'high';
    estimatedImpact: string;
}

export async function generateDecisionSupport(projectId: string): Promise<DecisionSupport[]> {
    const supports: DecisionSupport[] = [];
    const supabase = getSupabaseClient();

    const { data: project } = await supabase
        .from('projects')
        .select('*, health_scores(*), pattern_analyses(*), decisions(*)')
        .eq('id', projectId)
        .single();

    if (!project) return [];

    const latestHealth = project.health_scores?.[0];
    const latestPattern = project.pattern_analyses?.[0];

    // Decision: Should we accelerate, maintain, or pause?
    if (latestHealth && latestPattern) {
        const paceDecision = generatePaceDecisionSupport(project, latestHealth, latestPattern);
        supports.push(paceDecision);
    }

    // Decision: How to handle blocker?
    if (project.main_blocker && project.main_blocker !== 'Aucun') {
        const blockerDecision = generateBlockerDecisionSupport(project);
        supports.push(blockerDecision);
    }

    return supports;
}

function generatePaceDecisionSupport(project: any, health: any, pattern: any): DecisionSupport {
    const options: DecisionOption[] = [
        {
            option: 'Accélérer (augmenter ressources)',
            pros: [
                `Health correct (${Math.round(health.overall_score)}/100)`,
                `Cash impact élevé (${project.cash_impact_score}/10)`,
                pattern.velocity_trend === 'accelerating' ? 'Momentum positif' : '',
                'Delivery rapide = ROI rapide'
            ].filter(Boolean),
            cons: [
                'Coût ressources supplémentaires',
                'Risque burnout équipe',
                pattern.velocity_trend === 'decelerating' ? 'Vélocité en baisse' : '',
                'Peut impacter autres projets'
            ].filter(Boolean),
            riskLevel: health.overall_score < 60 ? 'medium' : 'low',
            estimatedImpact: 'Delivery 30-40% plus rapide'
        },
        {
            option: 'Maintenir (status quo)',
            pros: [
                'Pas de changement organisationnel',
                'Équilibre actuel préservé',
                'Risque minimal'
            ],
            cons: [
                pattern.velocity_trend === 'decelerating' ? 'Vélocité pourrait continuer à baisser' : '',
                health.overall_score < 60 ? 'Health faible non adressée' : '',
                'Opportunités d\'accélération manquées'
            ].filter(Boolean),
            riskLevel: 'low',
            estimatedImpact: 'Completion selon timeline actuelle'
        },
        {
            option: 'Pauser (réallouer ressources)',
            pros: [
                project.cash_impact_score < 6 ? 'Cash impact modéré' : '',
                'Ressources libérées pour autres projets',
                'Temps pour réflexion stratégique'
            ].filter(Boolean),
            cons: [
                project.cash_impact_score > 7 ? 'Cash impact élevé perdu' : '',
                'Momentum perdu',
                `Completion ${project.completion_percentage}% déjà investi`,
                'Peut être difficile de redémarrer'
            ],
            riskLevel: project.cash_impact_score > 7 ? 'high' : 'medium',
            estimatedImpact: 'Delivery repoussée indéfiniment'
        }
    ];

    let recommendation = '';
    if (health.overall_score > 70 && pattern.momentum_score > 70) {
        recommendation = 'RECOMMANDATION: Accélérer. Projet en bonne santé avec momentum positif.';
    } else if (health.overall_score < 50) {
        recommendation = 'RECOMMANDATION: Maintenir ou Pauser selon priorité stratégique. Health faible nécessite investigation.';
    } else {
        recommendation = 'RECOMMANDATION: Maintenir. Velocity stable, pas d\'urgence à changer.';
    }

    return {
        decisionTitle: `Pace stratégique: ${project.name}`,
        context: `Health ${Math.round(health.overall_score)}/100, Momentum ${Math.round(pattern.momentum_score)}/100, Completion ${project.completion_percentage}%`,
        options,
        recommendation
    };
}

function generateBlockerDecisionSupport(project: any): DecisionSupport {
    const options: DecisionOption[] = [
        {
            option: 'Résoudre immédiatement (sprint dédié)',
            pros: [
                'Déblocage rapide progression',
                'Équipe focus 100%',
                'Solution permanente si bien fait'
            ],
            cons: [
                'Coût court-terme élevé',
                'Autres tâches repoussées',
                'Pression sur équipe'
            ],
            riskLevel: 'low',
            estimatedImpact: 'Blocker résolu en 3-7 jours'
        },
        {
            option: 'Contourner (workaround temporaire)',
            pros: [
                'Solution rapide',
                'Progression immédiate',
                'Coût faible'
            ],
            cons: [
                'Dette technique créée',
                'Blocage peut revenir',
                'Solution non-optimale'
            ],
            riskLevel: 'medium',
            estimatedImpact: 'Progression reprend, résolution permanente à faire plus tard'
        },
        {
            option: 'Escalader (external help)',
            pros: [
                'Expertise externe',
                'Solution professionnelle',
                'Équipe interne focus sur core'
            ],
            cons: [
                'Coût élevé',
                'Dépendance externe',
                'Timeline incertaine'
            ],
            riskLevel: 'medium',
            estimatedImpact: 'Résolution en 1-2 semaines'
        }
    ];

    return {
        decisionTitle: `Résolution blocker: ${project.main_blocker}`,
        context: `Blocker actuel impact progression de ${project.name}`,
        options,
        recommendation: 'RECOMMANDATION: Analyser cause root puis choisir entre Résolution immédiate (si simple) ou Escalade (si complexe).'
    };
}

export async function saveDecisionSupport(support: DecisionSupport, projectId: string): Promise<void> {
    const supabase = getSupabaseClient();

    await supabase.from('recommendations').insert({
        category: 'decision',
        priority: 2,
        title: support.decisionTitle,
        description: support.context,
        rationale: support.recommendation,
        expected_impact: 'high',
        estimated_effort: 'moderate',
        target_entity_type: 'project',
        target_entity_id: projectId,
        actionable_steps: support.options.map(o => `Option: ${o.option} - ${o.estimatedImpact}`),
        confidence_score: 75
    });
}
