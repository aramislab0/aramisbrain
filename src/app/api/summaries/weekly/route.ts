import { getSupabaseClient } from '@/lib/supabase';
import { anthropic } from '@/lib/ai';
import { NextResponse } from 'next/server';

// GET /api/summaries/weekly?start_date=YYYY-MM-DD
export async function GET(request: Request) {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);

    // Calculate week range (last 7 days from start_date or today)
    const endDate = searchParams.get('start_date') || new Date().toISOString().split('T')[0];
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);
    const startDateStr = startDate.toISOString().split('T')[0];

    try {
        // Fetch week's decisions
        const { data: decisionsData } = await supabase
            .from('decisions')
            .select('title, decision_made, status, date')
            .gte('date', startDateStr)
            .lte('date', endDate)
            .order('date', { ascending: false });

        // Fetch week's events
        const { data: eventsData } = await supabase
            .from('events')
            .select('event_type, description, created_at')
            .gte('created_at', `${startDateStr}T00:00:00`)
            .lte('created_at', `${endDate}T23:59:59`);

        // Fetch projects
        const { data: projectsData } = await supabase
            .from('projects')
            .select('name, completion_percentage, risk_level, next_action');

        // Build context
        const context = `
RÉSUMÉ HEBDOMADAIRE (${startDateStr} au ${endDate}) :

DÉCISIONS STRATÉGIQUES (${decisionsData?.length || 0}) :
${decisionsData && decisionsData.length > 0
                ? decisionsData.map(d => `- [${d.date}] ${d.title} (${d.status})`).join('\n')
                : 'Aucune décision cette semaine'}

ACTIVITÉ SYSTÈME (${eventsData?.length || 0} événements) :
${eventsData ? `
- ${eventsData.filter((e: any) => e.event_type.includes('decision')).length} décisions documentées
- ${eventsData.filter((e: any) => e.event_type.includes('project')).length} mises à jour projet
- ${eventsData.filter((e: any) => e.event_type.includes('focus')).length} focus enregistrés
` : 'Faible activité'}

ÉTAT DES PROJETS (${projectsData?.length || 0}) :
${projectsData && projectsData.length > 0
                ? projectsData.map(p => `- ${p.name}: ${p.completion_percentage}% (${p.risk_level} risk) → ${p.next_action || 'N/A'}`).join('\n')
                : 'Aucun projet actif'}
`;

        // Generate weekly summary
        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1536,
            messages: [{
                role: 'user',
                content: `Tu es l'assistant exécutif d'Assane Aramis, CEO d'Aramis Lab.

${context}

MISSION :
Génère un résumé exécutif hebdomadaire (300 mots maximum) au format markdown avec :
1. **Vue d'ensemble** : Tendances et momentum de la semaine
2. **Accomplissements clés** : 3-4 victoires majeures
3. **Décisions stratégiques** : Impact des choix faits
4. **Risques & Blocages** : Points d'attention
5. **Focus semaine prochaine** : 3 priorités recommandées

Synthétise les patterns, pas les détails. Sois stratégique et anticipatif.`
            }]
        });

        const summary = message.content[0].type === 'text' ? message.content[0].text : 'Impossible de générer le résumé';

        return NextResponse.json({
            summary,
            period: { start: startDateStr, end: endDate },
            stats: {
                decisions_count: decisionsData?.length || 0,
                events_count: eventsData?.length || 0,
                projects_count: projectsData?.length || 0
            }
        });

    } catch (error) {
        console.error('Weekly summary error:', error);
        return NextResponse.json({
            error: (error as Error).message
        }, { status: 500 });
    }
}
