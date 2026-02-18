import { createClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

type RouteContext = { params: { id: string } | Promise<{ id: string }> };

async function resolveId(params: RouteContext['params']): Promise<string> {
    const resolved = await Promise.resolve(params);
    return resolved.id;
}

export async function GET(request: NextRequest, context: RouteContext) {
    const id = await resolveId(context.params);
    const supabase = createClient();

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

export async function PUT(request: NextRequest, context: RouteContext) {
    const id = await resolveId(context.params);
    const supabase = createClient();
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

export async function DELETE(request: NextRequest, context: RouteContext) {
    const id = await resolveId(context.params);
    const supabase = createClient();

    const { error } = await supabase
        .from('playbooks')
        .delete()
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
