import { getSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = getSupabaseClient();
    const today = new Date().toISOString().split('T')[0];

    let { data: focus, error } = await supabase
        .from('daily_focus')
        .select('*')
        .eq('date', today)
        .single();

    // Si pas de focus aujourd'hui, créer un vide
    if (!focus) {
        const { data: newFocus, error: createError } = await supabase
            .from('daily_focus')
            .insert({
                date: today,
                priorities: ['', '', ''],
                critical_risk: '',
                decision_needed: '',
                ignore_today: ''
            })
            .select()
            .single();

        if (createError) {
            return NextResponse.json({ error: createError.message }, { status: 500 });
        }

        focus = newFocus;
    }

    return NextResponse.json({ focus });
}

export async function PUT(request: Request) {
    const supabase = getSupabaseClient();
    const today = new Date().toISOString().split('T')[0];
    const body = await request.json();

    const { data, error } = await supabase
        .from('daily_focus')
        .update({
            priorities: body.priorities,
            critical_risk: body.critical_risk,
            decision_needed: body.decision_needed,
            ignore_today: body.ignore_today
        })
        .eq('date', today)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ focus: data });
}
