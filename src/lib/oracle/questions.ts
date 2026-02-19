import { getSupabaseClient } from '@/lib/supabase';

interface StrategicQuestion {
    question: string;
    context: string;
    whyNow: string;
    relatedEntityType?: 'project' | 'decision' | 'portfolio';
    relatedEntityId?: string;
    questionType: 'reflection' | 'decision' | 'priority' | 'strategy';
}

/**
 * Generates 1-3 strategic questions for CEO reflection.
 * Questions are non-directive and context-aware, drawn from:
 * - Pending decisions (oldest first)
 * - Stagnant projects (14+ days inactive)
 * - Portfolio concentration opportunities
 * - Quick win identification
 *
 * @returns Array of 1-3 strategic questions with context and rationale
 */
export async function generateStrategicQuestions(): Promise<StrategicQuestion[]> {
    const questions: StrategicQuestion[] = [];
    const supabase = getSupabaseClient();

    // Get pending decisions
    const { data: pendingDecisions } = await supabase
        .from('decisions')
        .select('*, projects(name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(5);

    // Get stagnant projects
    const { data: patterns } = await supabase
        .from('pattern_analyses')
        .select('*, projects(name, id)')
        .gte('last_activity_days', 14)
        .order('last_activity_days', { ascending: false })
        .limit(3);

    // Get active projects count
    const { count: activeProjectsCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

    // Question 1: Pending decisions
    if (pendingDecisions && pendingDecisions.length > 0) {
        const oldestDecision = pendingDecisions[0];
        const daysPending = Math.floor(
            (Date.now() - new Date(oldestDecision.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        questions.push({
            question: `"${oldestDecision.title}" attend depuis ${daysPending} jours. Qu'est-ce qui te retient ?`,
            context: `Décision sur ${oldestDecision.projects?.name || 'projet'}`,
            whyNow: `${daysPending} jours sans résolution. Clarté aide mouvement.`,
            relatedEntityType: 'decision',
            relatedEntityId: oldestDecision.id,
            questionType: 'decision'
        });
    }

    // Question 2: Stagnation
    if (patterns && patterns.length > 0) {
        const mostStagnant = patterns[0];

        questions.push({
            question: `${mostStagnant.projects?.name} sans mouvement depuis ${mostStagnant.last_activity_days} jours. Silence stratégique ou oubli ?`,
            context: `Pas d'activité récente sur ce projet`,
            whyNow: 'Clarifier intention aide allocation attention',
            relatedEntityType: 'project',
            relatedEntityId: mostStagnant.projects?.id,
            questionType: 'reflection'
        });
    }

    // Question 3: Focus concentration
    if (activeProjectsCount && activeProjectsCount >= 3) {
        questions.push({
            question: `${activeProjectsCount} projets actifs. Si tu devais concentrer 80% énergie sur 1 seul, lequel et pourquoi ?`,
            context: 'Attention potentiellement dispersée',
            whyNow: 'Concentration = accélération. Clarifier priorité ultime.',
            relatedEntityType: 'portfolio',
            questionType: 'priority'
        });
    }

    // Question 4: Quick wins
    questions.push({
        question: 'Quel quick win (2-3 jours max) générerait le plus de momentum cette semaine ?',
        context: 'Opportunité petites victoires rapides',
        whyNow: 'Quick wins créent élan psychologique positif',
        questionType: 'strategy'
    });

    // Question 5: Strategic silence
    const { data: projects } = await supabase
        .from('projects')
        .select('*, health_scores(*)')
        .eq('status', 'active')
        .order('cash_impact_score', { ascending: true })
        .limit(1);

    if (projects && projects.length > 0) {
        const lowImpactProject = projects[0];
        const health = lowImpactProject.health_scores?.[0];

        if (health && health.overall_score < 60) {
            questions.push({
                question: `${lowImpactProject.name} (cash impact ${lowImpactProject.cash_impact_score}/10) mérite-t-il pause stratégique ?`,
                context: 'Faible impact + health modérée',
                whyNow: 'Libérer ressources pour moteurs prioritaires',
                relatedEntityType: 'project',
                relatedEntityId: lowImpactProject.id,
                questionType: 'strategy'
            });
        }
    }

    return questions.slice(0, 3);
}

export async function saveStrategicQuestions(questions: StrategicQuestion[]): Promise<void> {
    const supabase = getSupabaseClient();

    // Get current week start
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysToMonday = (dayOfWeek + 6) % 7;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysToMonday);
    const weekStartDate = weekStart.toISOString().split('T')[0];

    // Delete existing questions for this week
    await supabase
        .from('oracle_questions')
        .delete()
        .eq('week_start_date', weekStartDate);

    // Insert new questions
    for (const q of questions) {
        await supabase.from('oracle_questions').insert({
            week_start_date: weekStartDate,
            question: q.question,
            context: q.context,
            why_now: q.whyNow,
            related_entity_type: q.relatedEntityType,
            related_entity_id: q.relatedEntityId,
            question_type: q.questionType
        });
    }
}
