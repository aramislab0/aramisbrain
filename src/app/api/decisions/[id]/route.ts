import { createClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = createClient();

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

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = createClient();
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

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = createClient();

    const { error } = await supabase
        .from('decisions')
        .delete()
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
