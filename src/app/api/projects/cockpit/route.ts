import { getSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = getSupabaseClient();

    const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .order('cash_impact_score', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calcul jours restants pour target_launch_date
    const projectsWithDays = projects.map(p => ({
        ...p,
        daysToLaunch: p.target_launch_date
            ? Math.ceil((new Date(p.target_launch_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : null
    }));

    return NextResponse.json({ projects: projectsWithDays });
}
