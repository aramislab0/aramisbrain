import { NextResponse } from 'next/server';
import { analyzeAllProjectsPatterns, savePatternAnalysis } from '@/lib/analysis/patterns';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const refresh = searchParams.get('refresh') === 'true';

        if (refresh) {
            // Run fresh analysis and save
            const analyses = await analyzeAllProjectsPatterns();

            await Promise.all(
                analyses.map(a => savePatternAnalysis(a))
            );

            return NextResponse.json({ patterns: analyses });
        }

        // Return cached from database
        const { getSupabaseClient } = await import('@/lib/supabase');
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('pattern_analyses')
            .select('*, projects(name, slug)')
            .order('analysis_date', { ascending: false })
            .limit(100);

        if (error) throw error;

        return NextResponse.json({ patterns: data });
    } catch (error: any) {
        console.error('Pattern analysis error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
