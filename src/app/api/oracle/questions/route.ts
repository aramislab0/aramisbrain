import { NextResponse } from 'next/server';
import { generateStrategicQuestions, saveStrategicQuestions } from '@/lib/oracle/questions';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const refresh = searchParams.get('refresh') === 'true';

        if (refresh) {
            const questions = await generateStrategicQuestions();
            await saveStrategicQuestions(questions);

            return NextResponse.json({
                questions,
                tone: 'exploratory',
                message: 'Questions pour réflexion'
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
            .from('oracle_questions')
            .select('*')
            .eq('week_start_date', weekStartDate)
            .order('created_at', { ascending: true });

        if (error) throw error;

        return NextResponse.json({
            questions: data,
            tone: 'exploratory'
        });
    } catch (error: any) {
        console.error('Questions error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
