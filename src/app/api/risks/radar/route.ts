import { getSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = getSupabaseClient();

    const { data: risks, error } = await supabase
        .from('risks')
        .select('category, severity, probability')
        .eq('status', 'active');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calcul scores par catégorie (severity × probability)
    const categories = ['technical', 'administrative', 'financial', 'dispersion'];
    const severityMap = { low: 1, medium: 3, high: 7, critical: 10 };
    const probabilityMap = { low: 0.3, medium: 0.6, high: 0.9 };

    const scores = categories.map(cat => {
        const categoryRisks = risks.filter((r: any) => r.category === cat);
        const totalScore = categoryRisks.reduce((sum: number, r: any) => {
            const sev = severityMap[r.severity as keyof typeof severityMap] || 1;
            const prob = probabilityMap[r.probability as keyof typeof probabilityMap] || 0.5;
            return sum + (sev * prob);
        }, 0);

        // Normaliser sur 10
        return Math.min(10, totalScore);
    });

    return NextResponse.json({
        radar: {
            technical: scores[0],
            administrative: scores[1],
            financial: scores[2],
            dispersion: scores[3]
        },
        risksCount: risks.length
    });
}
