import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const body = await request.json();
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('recommendations')
            .update({
                status: body.status,
                accepted_at: body.status === 'accepted' ? new Date().toISOString() : null,
                rejected_at: body.status === 'rejected' ? new Date().toISOString() : null,
                rejection_reason: body.rejection_reason,
                completed_at: body.status === 'completed' ? new Date().toISOString() : null,
                outcome_notes: body.outcome_notes,
                effectiveness_score: body.effectiveness_score
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Log feedback
        if (body.status === 'accepted' || body.status === 'rejected') {
            await supabase.from('recommendation_feedback').insert({
                recommendation_id: id,
                feedback_type: body.status,
                feedback_notes: body.rejection_reason || body.outcome_notes
            });
        }

        return NextResponse.json({ recommendation: data });
    } catch (error: any) {
        console.error('Update recommendation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
