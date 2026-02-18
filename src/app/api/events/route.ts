import { getSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET /api/events - List events with filters
export async function GET(request: Request) {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);

    const eventType = searchParams.get('event_type');
    const entityType = searchParams.get('entity_type');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
        .from('events')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (eventType) {
        query = query.eq('event_type', eventType);
    }

    if (entityType) {
        query = query.eq('entity_type', entityType);
    }

    const { data: events, error, count } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ events, total: count || 0 });
}
