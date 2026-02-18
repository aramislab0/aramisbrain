import { getSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/playbooks - List all active playbooks
export async function GET() {
    const supabase = getSupabaseClient();

    const { data: playbooks, error } = await supabase
        .from('playbooks')
        .select('*')
        .eq('active', true)
        .order('name');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ playbooks });
}

// POST /api/playbooks - Create new playbook
export async function POST(request: NextRequest) {
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
            .insert({
                name: name.trim(),
                description: description?.trim() || '',
                decision_rules: rules, // Match DB schema
                active: is_active ?? true, // Map is_active param to active column
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ playbook: data }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
