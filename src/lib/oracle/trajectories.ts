import { getSupabaseClient } from '@/lib/supabase';

interface Trajectory {
    trajectoryNumber: number;
    title: string;
    context: string;
    whatItMeans: string;
    tradeoffs: string;
    timelineEstimate: string;
    focusAllocation: Record<string, number>;
    questions: string[];
    tone: 'opportunity' | 'neutral' | 'gentle_attention';
    confidenceNote?: string;
}

export async function generateWeeklyTrajectories(): Promise<Trajectory[]> {
    const trajectories: Trajectory[] = [];

    const supabase = getSupabaseClient();

    const { data: portfolioHealth } = await supabase
        .from('portfolio_health')
        .select('*')
        .order('score_date', { ascending: false })
        .limit(1)
        .single();

    const { data: projects } = await supabase
        .from('projects')
        .select('*, health_scores(*), pattern_analyses(*)')
        .eq('status', 'active')
        .order('cash_impact_score', { ascending: false });

    if (!projects || projects.length === 0) return [];

    // Find highest momentum project
    const sortedByMomentum = [...projects].sort((a, b) => {
        const aMomentum = a.pattern_analyses?.[0]?.momentum_score || 0;
        const bMomentum = b.pattern_analyses?.[0]?.momentum_score || 0;
        return bMomentum - aMomentum;
    });

    const highMomentumProject = sortedByMomentum[0];

    // Find project needing attention (low health but not catastrophizing)
    const needsAttention = projects.find(p => {
        const health = p.health_scores?.[0];
        return health && health.overall_score < 60;
    });

    // Trajectory 1: Concentration sur momentum positif
    if (highMomentumProject) {
        trajectories.push(generateConcentrationTrajectory(highMomentumProject, projects));
    }

    // Trajectory 2: Équilibre multi-projets
    trajectories.push(generateBalanceTrajectory(projects));

    // Trajectory 3: Déblocage si projet bloqué
    if (needsAttention) {
        trajectories.push(generateUnblockingTrajectory(needsAttention, projects));
    } else {
        trajectories.push(generateOpportunityTrajectory(projects));
    }

    return trajectories.slice(0, 3);
}

function generateConcentrationTrajectory(project: any, allProjects: any[]): Trajectory {
    const pattern = project.pattern_analyses?.[0];
    const momentum = pattern?.momentum_score || 50;
    const currentCompletion = project.completion_percentage;
    const remainingPercent = 100 - currentCompletion;
    const weeksToComplete = Math.ceil(remainingPercent / 10);

    return {
        trajectoryNumber: 1,
        title: `Concentration sur ${project.name}`,
        context: `${project.name} montre bon momentum (${Math.round(momentum)}/100). Progression actuelle : ${currentCompletion}%.`,
        whatItMeans: `Si focus 70% sur ${project.name} cette semaine, delivery probable dans ~${weeksToComplete} semaines. Les autres projets ralentissent mais restent stables.`,
        tradeoffs: allProjects.length > 1
            ? `${allProjects.filter((p: any) => p.id !== project.id).map((p: any) => p.name).join(', ')} progressent ~30% de vélocité normale.`
            : 'Aucun autre projet actif.',
        timelineEstimate: `${weeksToComplete} semaines si concentration maintenue`,
        focusAllocation: {
            [project.slug]: 70,
            'autres': 30
        },
        questions: [
            `${project.name} est-il priorité stratégique immédiate ?`,
            'As-tu capacité de concentration intense sur 1 moteur ?',
            `Cash impact ${project.cash_impact_score}/10 justifie-t-il cette concentration ?`
        ],
        tone: momentum > 70 ? 'opportunity' : 'neutral',
        confidenceNote: momentum < 60 ? 'Momentum modéré, timeline peut varier' : undefined
    };
}

function generateBalanceTrajectory(projects: any[]): Trajectory {
    const avgCompletion = projects.reduce((sum: number, p: any) => sum + p.completion_percentage, 0) / projects.length;

    return {
        trajectoryNumber: 2,
        title: 'Équilibre multi-projets',
        context: `${projects.length} projets actifs. Moyenne completion : ${Math.round(avgCompletion)}%.`,
        whatItMeans: `Chaque projet avance ~${Math.round(100 / projects.length)}% de vélocité. Progression parallèle sans priorité dominante.`,
        tradeoffs: 'Timeline plus longue sur chaque moteur, mais risques distribués. Pas de "single point of failure".',
        timelineEstimate: 'Variable selon projet (4-8 semaines)',
        focusAllocation: projects.reduce((acc: Record<string, number>, p: any) => {
            acc[p.slug] = Math.round(100 / projects.length);
            return acc;
        }, {} as Record<string, number>),
        questions: [
            'As-tu capacité attention divisée efficacement ?',
            'Quel projet bénéficierait le plus de concentration ?',
            'Équilibre actuel te convient-il ou génère-t-il dispersion ?'
        ],
        tone: 'neutral'
    };
}

function generateUnblockingTrajectory(project: any, allProjects: any[]): Trajectory {
    const health = project.health_scores?.[0];
    const blocker = project.main_blocker || 'Blocage non spécifié';

    return {
        trajectoryNumber: 3,
        title: `Déblocage ${project.name}`,
        context: `${project.name} demande attention. Blocker actuel: "${blocker}". Health actuelle: ${Math.round(health?.overall_score || 50)}/100.`,
        whatItMeans: `Sprint déblocage ciblé cette semaine. Si blocker résolu, progression reprend rapidement. Autres projets en mode maintenance.`,
        tradeoffs: `${allProjects.filter((p: any) => p.id !== project.id).map((p: any) => p.name).join(', ')} en pause 1 semaine, reprennent après déblocage.`,
        timelineEstimate: '1 semaine déblocage + reprise normale',
        focusAllocation: {
            [project.slug]: 80,
            'autres': 20
        },
        questions: [
            `Blocker "${blocker}" peut-il être résolu rapidement ?`,
            'Quick win déblocage libère-t-il valeur significative ?',
            `Vaut-il mieux débloquer maintenant ou laisser ${project.name} en silence stratégique ?`
        ],
        tone: 'gentle_attention',
        confidenceNote: 'Succès dépend de résolution effective du blocker'
    };
}

function generateOpportunityTrajectory(projects: any[]): Trajectory {
    const highCashProject = projects.reduce((max: any, p: any) =>
        p.cash_impact_score > (max?.cash_impact_score || 0) ? p : max
        , null);

    if (!highCashProject) {
        return {
            trajectoryNumber: 3,
            title: 'Exploration nouvelle opportunité',
            context: 'Portefeuille stable. Fenêtre pour exploration.',
            whatItMeans: 'Moment propice pour lancer nouveau moteur ou expérimentation.',
            tradeoffs: 'Capacité attention disponible pour innovation.',
            timelineEstimate: 'Variable selon nature exploration',
            focusAllocation: { 'exploration': 30, 'maintenance': 70 },
            questions: [
                'Nouvelle idée mérite prototypage rapide ?',
                'Quel quick win pourrait générer momentum ?',
                'Temps pour réflexion stratégique ?'
            ],
            tone: 'opportunity'
        };
    }

    return {
        trajectoryNumber: 3,
        title: `Accélération ${highCashProject.name}`,
        context: `${highCashProject.name} a cash impact élevé (${highCashProject.cash_impact_score}/10).`,
        whatItMeans: `Accélération ciblée sur ROI maximum. Delivery rapide = impact business rapide.`,
        tradeoffs: 'Autres projets ralentis temporairement.',
        timelineEstimate: '2-3 semaines delivery si focus',
        focusAllocation: {
            [highCashProject.slug]: 70,
            'autres': 30
        },
        questions: [
            'ROI business justifie-t-il priorisation ?',
            `${highCashProject.name} delivery rapide débloque-t-il autres opportunités ?`,
            'Momentum market favorable en ce moment ?'
        ],
        tone: 'opportunity'
    };
}

export async function saveWeeklyTrajectories(trajectories: Trajectory[]): Promise<void> {
    const supabase = getSupabaseClient();

    // Get current week start (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysToMonday = (dayOfWeek + 6) % 7;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysToMonday);
    const weekStartDate = weekStart.toISOString().split('T')[0];

    // Delete existing trajectories for this week (refresh)
    await supabase
        .from('oracle_trajectories')
        .delete()
        .eq('week_start_date', weekStartDate);

    // Insert new trajectories
    for (const traj of trajectories) {
        await supabase.from('oracle_trajectories').insert({
            week_start_date: weekStartDate,
            trajectory_number: traj.trajectoryNumber,
            title: traj.title,
            context: traj.context,
            what_it_means: traj.whatItMeans,
            tradeoffs: traj.tradeoffs,
            timeline_estimate: traj.timelineEstimate,
            focus_allocation: traj.focusAllocation,
            questions: traj.questions,
            tone: traj.tone,
            confidence_note: traj.confidenceNote
        });
    }
}
