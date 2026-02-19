import { NextResponse } from 'next/server';
import { detectAllAnomalies, saveAnomaly } from '@/lib/analysis/anomalies';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const refresh = searchParams.get('refresh') === 'true';

        if (refresh) {
            // Detect fresh anomalies
            const anomalies = await detectAllAnomalies();

            await Promise.all(
                anomalies.map(a => saveAnomaly(a))
            );

            return NextResponse.json({ anomalies });
        }

        // Return unresolved anomalies from database
        const { getSupabaseClient } = await import('@/lib/supabase');
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('anomalies')
            .select('*, projects(name, slug)')
            .eq('resolved', false)
            .order('detected_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        return NextResponse.json({ anomalies: data });
    } catch (error: any) {
        console.error('Anomaly detection error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
