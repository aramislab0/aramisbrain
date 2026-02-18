import { getSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// POST /api/events/log - Log a new event
export async function POST(request: Request) {
    const supabase = getSupabaseClient();
    const body = await request.json();

    const { data: event, error } = await supabase
        .from('events')
        .insert({
            event_type: body.event_type,
            entity_type: body.entity_type || null,
            entity_id: body.entity_id || null,
            description: body.description,
            metadata: body.metadata || {}
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ event });
}
