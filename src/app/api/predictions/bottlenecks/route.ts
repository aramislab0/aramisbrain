import { NextResponse } from 'next/server';
import { predictAllBottlenecks, saveBottleneckPrediction } from '@/lib/predictions/bottlenecks';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const refresh = searchParams.get('refresh') === 'true';

        if (refresh) {
            const bottlenecks = await predictAllBottlenecks();

            await Promise.all(
                bottlenecks.map(b => saveBottleneckPrediction(b))
            );

            return NextResponse.json({ bottlenecks });
        }

        const { getSupabaseClient } = await import('@/lib/supabase');
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('bottleneck_predictions')
            .select('*, projects(name, slug)')
            .eq('status', 'active')
            .order('probability_score', { ascending: false })
            .limit(20);

        if (error) throw error;

        return NextResponse.json({ bottlenecks: data });
    } catch (error: any) {
        console.error('Bottleneck prediction error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
