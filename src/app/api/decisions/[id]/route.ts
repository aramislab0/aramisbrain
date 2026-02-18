import { getSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET /api/decisions/[id] - Get single decision
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = getSupabaseClient();

    const { data: decision, error } = await supabase
        .from('decisions')
        .select('*, projects(name, slug)')
        .eq('id', params.id)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ decision });
}

// PUT /api/decisions/[id] - Update decision
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = getSupabaseClient();
    const body = await request.json();

    const { data: decision, error } = await supabase
        .from('decisions')
        .update(body)
        .eq('id', params.id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log event
    await supabase.from('events').insert({
        event_type: 'decision.updated',
        entity_type: 'decision',
        entity_id: decision.id,
        description: `Décision modifiée: ${decision.title}`,
        metadata: { decision_id: decision.id }
    });

    return NextResponse.json({ decision });
}

// DELETE /api/decisions/[id] - Delete decision
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = getSupabaseClient();

    const { error } = await supabase
        .from('decisions')
        .delete()
        .eq('id', params.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
