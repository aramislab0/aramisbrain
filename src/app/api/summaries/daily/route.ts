import { getSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET /api/summaries/daily?date=YYYY-MM-DD
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    try {
        const supabase = getSupabaseClient();

        // Fetch focus
        const { data: focus } = await supabase
            .from('daily_focus')
            .select('*')
            .eq('date', date)
            .single();

        // Fetch decisions count
        const { count: decisionsCount } = await supabase
            .from('decisions')
            .select('*', { count: 'exact', head: true })
            .eq('date', date);

        // Fetch events count for today
        const startOfDay = `${date}T00:00:00Z`;
        const endOfDay = `${date}T23:59:59Z`;

        const { count: eventsCount } = await supabase
            .from('events')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startOfDay)
            .lte('created_at', endOfDay);

        // Fetch active projects count
        const { count: projectsCount } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active');

        // Build a data-driven summary (no AI needed)
        const priorities = focus?.priorities || [];
        const summary = `Résumé exe ${new Date(date).toLocaleDateString('fr-FR')} - ${decisionsCount || 0} décisions - ${eventsCount || 0} événements - ${projectsCount || 0} projets actifs`;

        return NextResponse.json({
            summary,
            date,
            context: {
                focus,
                decisions_count: decisionsCount || 0,
                events_count: eventsCount || 0,
                projects_count: projectsCount || 0,
            }
        });

    } catch (error: any) {
        console.error('Error in /api/summaries/daily:', error);

        // Return fallback even on error (prevents 500 loop)
        return NextResponse.json({
            summary: `Résumé quotidien temporairement indisponible`,
            date,
            context: {
                decisions_count: 0,
                events_count: 0,
                projects_count: 0,
            }
        }, { status: 200 }); // Return 200 instead of 500 to avoid retry loop
    }
}
