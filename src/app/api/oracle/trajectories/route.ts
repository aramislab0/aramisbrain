import { NextResponse } from 'next/server';
import { generateWeeklyTrajectories, saveWeeklyTrajectories } from '@/lib/oracle/trajectories';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const refresh = searchParams.get('refresh') === 'true';

        if (refresh) {
            const trajectories = await generateWeeklyTrajectories();
            await saveWeeklyTrajectories(trajectories);

            return NextResponse.json({
                trajectories,
                tone: 'calm',
                message: 'Trajectoires cette semaine'
            });
        }

        // Return from database
        const { getSupabaseClient } = await import('@/lib/supabase');
        const supabase = getSupabaseClient();

        // Get current week
        const now = new Date();
        const dayOfWeek = now.getDay();
        const daysToMonday = (dayOfWeek + 6) % 7;
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - daysToMonday);
        const weekStartDate = weekStart.toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('oracle_trajectories')
            .select('*')
            .eq('week_start_date', weekStartDate)
            .order('trajectory_number', { ascending: true });

        if (error) throw error;

        return NextResponse.json({
            trajectories: data,
            tone: 'calm',
            message: data && data.length > 0 ? 'Trajectoires disponibles' : 'Aucune trajectoire générée'
        });
    } catch (error: any) {
        console.error('Trajectories error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
