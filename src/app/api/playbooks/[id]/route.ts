import { getSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
    const { id } = await params;
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
        .from('playbooks')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ playbook: data });
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
    const { id } = await params;
    const supabase = getSupabaseClient();
    const body = await request.json();

    const { data, error } = await supabase
        .from('playbooks')
        .update({
            name: body.name,
            description: body.description,
            rules: body.rules,
            active: body.active,
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ playbook: data });
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
    const { id } = await params;
    const supabase = getSupabaseClient();

    const { error } = await supabase
        .from('playbooks')
        .delete()
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
