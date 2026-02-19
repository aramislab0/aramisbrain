import { NextResponse } from 'next/server';
import { generateSmartSuggestions, saveRecommendation } from '@/lib/recommendations/suggestions';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const refresh = searchParams.get('refresh') === 'true';

        if (refresh) {
            const suggestions = await generateSmartSuggestions();

            await Promise.all(
                suggestions.map(s => saveRecommendation(s))
            );

            return NextResponse.json({ recommendations: suggestions });
        }

        const { getSupabaseClient } = await import('@/lib/supabase');
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('recommendations')
            .select('*')
            .eq('status', 'active')
            .order('priority', { ascending: true })
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        return NextResponse.json({ recommendations: data });
    } catch (error: any) {
        console.error('Suggestions error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
