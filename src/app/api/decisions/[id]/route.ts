import { getSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(request: NextRequest, context: any) {
    const { id } = await Promise.resolve(context.params);
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
        .from('decisions')
        .select('*, projects(name, slug)')
        .eq('id', id)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ decision: data });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PUT(request: NextRequest, context: any) {
    const { id } = await Promise.resolve(context.params);
    const supabase = getSupabaseClient();
    const body = await request.json();

    const { data, error } = await supabase
        .from('decisions')
        .update({
            title: body.title,
            context: body.context,
            decision: body.decision,
            rationale: body.rationale,
            alternatives_considered: body.alternatives_considered,
            status: body.status,
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ decision: data });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(request: NextRequest, context: any) {
    const { id } = await Promise.resolve(context.params);
    const supabase = getSupabaseClient();

    const { error } = await supabase
        .from('decisions')
        .delete()
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
