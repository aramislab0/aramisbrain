import { NextResponse } from 'next/server';
import { generateWeeklySummary, saveWeeklySummary } from '@/lib/oracle/summary';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const refresh = searchParams.get('refresh') === 'true';

        if (refresh) {
            const summary = await generateWeeklySummary();
            await saveWeeklySummary(summary);

            return NextResponse.json({
                summary,
                tone: 'calm',
                message: 'Résumé hebdomadaire généré'
            });
        }

        const { getSupabaseClient } = await import('@/lib/supabase');
        const supabase = getSupabaseClient();

        const now = new Date();
        const dayOfWeek = now.getDay();
        const daysToMonday = (dayOfWeek + 6) % 7;
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - daysToMonday);
        const weekStartDate = weekStart.toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('oracle_weekly_summaries')
            .select('*')
            .eq('week_start_date', weekStartDate)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        return NextResponse.json({
            summary: data,
            tone: 'calm'
        });
    } catch (error: any) {
        console.error('Summary error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
