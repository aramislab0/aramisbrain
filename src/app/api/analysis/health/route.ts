import { NextResponse } from 'next/server';
import { calculatePortfolioHealth, savePortfolioHealth } from '@/lib/analysis/health';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const refresh = searchParams.get('refresh') === 'true';

        if (refresh) {
            // Calculate fresh health score
            const health = await calculatePortfolioHealth();
            await savePortfolioHealth(health);

            return NextResponse.json({ health });
        }

        // Return cached from database
        const { getSupabaseClient } = await import('@/lib/supabase');
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('portfolio_health')
            .select('*')
            .order('score_date', { ascending: false })
            .limit(1)
            .single();

        if (error) throw error;

        return NextResponse.json({ health: data });
    } catch (error: any) {
        console.error('Health calculation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
