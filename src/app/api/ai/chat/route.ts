import { getSupabaseClient } from '@/lib/supabase';
import { getOpenAI, getAnthropic } from '@/lib/ai';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { message, model = 'claude' } = await request.json();

    // Récupérer contexte projets
    const supabase = getSupabaseClient();
    const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active');

    const { data: focus } = await supabase
        .from('daily_focus')
        .select('*')
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

    // Construire contexte
    const systemPrompt = `Tu es le conseiller stratégique d'Assane, CEO d'Aramis Lab.

RÈGLES DÉCISIONNELLES ABSOLUES :
1. Cash court terme > vision long terme
2. Réduction risque > ajout features
3. Focus mono-objectif > dispersion
4. Finir ce qui est à 80%+ avant de lancer nouveau
5. FLUZ doit être intégré dans tout projet paiement

CONTEXTE PROJETS ACTUELS :
${projects?.map(p => `
- ${p.name} (${p.slug}) : ${p.completion_percentage}% complete
  Cash Impact: ${p.cash_impact_score}/10
  Risk: ${p.risk_level}
  Blocker: ${p.main_blocker || 'Aucun'}
  Next: ${p.next_action}
`).join('\n')}

FOCUS DU JOUR :
Priorités: ${focus?.priorities?.join(', ') || 'Non défini'}
Risque critique: ${focus?.critical_risk || 'Aucun'}
Décision needed: ${focus?.decision_needed || 'Aucune'}

Recommandation attendue : directe, chiffrée, actionnable.`;

    try {
        if (model === 'gpt4') {
            const completion = await getOpenAI().chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
                temperature: 0.7,
                max_tokens: 1000
            });

            return NextResponse.json({
                response: completion.choices[0].message.content,
                model: 'gpt4'
            });

        } else {
            const completion = await getAnthropic().messages.create({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1000,
                system: systemPrompt,
                messages: [
                    { role: 'user', content: message }
                ]
            });

            return NextResponse.json({
                response: completion.content[0].type === 'text' ? completion.content[0].text : '',
                model: 'claude'
            });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
