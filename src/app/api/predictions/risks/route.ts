import { NextResponse } from 'next/server';
import { predictAllProjectsRisks, saveRiskPrediction } from '@/lib/predictions/risks';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const refresh = searchParams.get('refresh') === 'true';

        if (refresh) {
            const predictions = await predictAllProjectsRisks();

            await Promise.all(
                predictions.map(p => saveRiskPrediction(p))
            );

            return NextResponse.json({ predictions });
        }

        // Return from database
        const { getSupabaseClient } = await import('@/lib/supabase');
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('risk_predictions')
            .select('*, projects(name, slug)')
            .eq('status', 'active')
            .order('probability_score', { ascending: false })
            .limit(20);

        if (error) throw error;

        return NextResponse.json({ predictions: data });
    } catch (error: any) {
        console.error('Risk prediction error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
