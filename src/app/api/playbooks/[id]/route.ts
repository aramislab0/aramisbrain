import { getSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/playbooks/[id] - Fetch single playbook
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
        .from('playbooks')
        .select('*')
        .eq('id', params.id)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ playbook: data });
}

// PUT /api/playbooks/[id] - Update playbook
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const supabase = getSupabaseClient();

    try {
        const body = await request.json();
        const { name, description, rules, is_active } = body;

        // Validation
        if (!name || !name.trim()) {
            return NextResponse.json(
                { error: 'Le nom est requis' },
                { status: 400 }
            );
        }

        if (!rules || rules.length === 0) {
            return NextResponse.json(
                { error: 'Au moins une règle est requise' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('playbooks')
            .update({
                name: name.trim(),
                description: description?.trim() || '',
                decision_rules: rules, // Match DB schema
                active: is_active ?? true, // Map is_active param to active column
            })
            .eq('id', params.id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ playbook: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/playbooks/[id] - Remove playbook
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const supabase = getSupabaseClient();

    const { error } = await supabase
        .from('playbooks')
        .delete()
        .eq('id', params.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Playbook supprimé' });
}
