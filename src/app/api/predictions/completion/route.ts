import { NextResponse } from 'next/server';
import { forecastAllProjectsCompletion, saveCompletionForecast } from '@/lib/predictions/completion';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const refresh = searchParams.get('refresh') === 'true';

        if (refresh) {
            const forecasts = await forecastAllProjectsCompletion();

            await Promise.all(
                forecasts.map(f => saveCompletionForecast(f))
            );

            return NextResponse.json({ forecasts });
        }

        const { getSupabaseClient } = await import('@/lib/supabase');
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('completion_forecasts')
            .select('*, projects(name, slug, completion_percentage)')
            .eq('status', 'active')
            .order('forecast_date', { ascending: false })
            .limit(20);

        if (error) throw error;

        return NextResponse.json({ forecasts: data });
    } catch (error: any) {
        console.error('Completion forecast error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
