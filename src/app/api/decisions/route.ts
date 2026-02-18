import { getSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET /api/decisions - List decisions with filters
export async function GET(request: Request) {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);

    const projectId = searchParams.get('project_id');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('date_from');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
        .from('decisions')
        .select('*, projects(name, slug)', { count: 'exact' })
        .order('date', { ascending: false })
        .range(offset, offset + limit - 1);

    // Apply filters
    if (projectId) {
        query = query.eq('project_id', projectId);
    }

    if (status) {
        query = query.eq('status', status);
    }

    if (search) {
        query = query.or(`title.ilike.%${search}%,context.ilike.%${search}%`);
    }

    if (dateFrom) {
        query = query.gte('date', dateFrom);
    }

    const { data: decisions, error, count } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ decisions, total: count || 0 });
}

// POST /api/decisions - Create decision
export async function POST(request: Request) {
    const supabase = getSupabaseClient();
    const body = await request.json();

    const { data: decision, error } = await supabase
        .from('decisions')
        .insert({
            project_id: body.project_id || null,
            title: body.title,
            date: body.date || new Date().toISOString().split('T')[0],
            context: body.context || '',
            options_considered: body.options_considered || [],
            decision_made: body.decision_made,
            rationale: body.rationale || '',
            consequences: body.consequences || '',
            revisit_date: body.revisit_date || null,
            status: body.status || 'active',
            metadata: body.metadata || {}
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log event
    await supabase.from('events').insert({
        event_type: 'decision.created',
        entity_type: 'decision',
        entity_id: decision.id,
        description: `Décision créée: ${decision.title}`,
        metadata: { decision_id: decision.id }
    });

    return NextResponse.json({ decision });
}
