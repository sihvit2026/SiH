'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/auth';

export interface CriterionInput {
    name: string;
    max_score: number;
    weight: number;
    round: 1 | 2;
}

export async function createCriterion(
    data: CriterionInput
) {
    try {
        await requireAuth(['admin', 'data_operator']);

        const name = data.name.trim();
        const maxScore = Number(data.max_score);
        const weight = Number(data.weight);

        if (!name) {
            return {
                success: false,
                error: 'Criterion name is required.',
            };
        }

        if (!Number.isFinite(maxScore) || maxScore <= 0) {
            return {
                success: false,
                error: 'Maximum score must be greater than 0.',
            };
        }

        if (!Number.isFinite(weight) || weight <= 0) {
            return {
                success: false,
                error: 'Weight must be greater than 0.',
            };
        }

        if (data.round !== 1 && data.round !== 2) {
            return {
                success: false,
                error: 'Invalid evaluation round.',
            };
        }

        const supabase = createAdminClient();

        // Use the active event for the new criterion.
        const { data: event, error: eventError } =
            await supabase
                .from('events')
                .select('id')
                .in('status', ['upcoming', 'ongoing'])
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

        if (eventError) {
            throw eventError;
        }

        if (!event) {
            return {
                success: false,
                error:
                    'No active event found. Create an upcoming or ongoing event first.',
            };
        }

        const { data: criterion, error } =
            await supabase
                .from('criteria')
                .insert({
                    event_id: event.id,
                    name,
                    max_score: maxScore,
                    weight,
                    round: data.round,
                })
<<<<<<< HEAD
                .select('id, event_id, name, max_score, weight, round, created_at')
=======
                .select('*')
>>>>>>> 52fc6d6b1d321253741e9249f27c7a76ea218d59
                .single();

        if (error) {
            throw error;
        }

        revalidatePath('/admin/criteria');
        revalidatePath('/round1');
        revalidatePath('/round1/[teamId]');
        revalidatePath('/round2');
        revalidatePath('/round2/[teamId]');

        return {
            success: true,
            data: criterion,
        };
    } catch (error) {
        console.error('createCriterion error:', error);

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to create criterion.',
        };
    }
}

export async function updateCriterion(
    id: string,
    data: CriterionInput
) {
    try {
        await requireAuth(['admin', 'data_operator']);

        const name = data.name.trim();
        const maxScore = Number(data.max_score);
        const weight = Number(data.weight);

        if (!name) {
            return {
                success: false,
                error: 'Criterion name is required.',
            };
        }

        if (!Number.isFinite(maxScore) || maxScore <= 0) {
            return {
                success: false,
                error: 'Maximum score must be greater than 0.',
            };
        }

        if (!Number.isFinite(weight) || weight <= 0) {
            return {
                success: false,
                error: 'Weight must be greater than 0.',
            };
        }

        if (data.round !== 1 && data.round !== 2) {
            return {
                success: false,
                error: 'Invalid evaluation round.',
            };
        }

        const supabase = createAdminClient();

        // Preserve the criterion's existing event.
        const {
            data: existingCriterion,
            error: existingCriterionError,
        } = await supabase
            .from('criteria')
            .select('id, event_id')
            .eq('id', id)
            .single();

        if (existingCriterionError || !existingCriterion) {
            return {
                success: false,
                error: 'Criterion not found.',
            };
        }

        const { error } = await supabase
            .from('criteria')
            .update({
                event_id: existingCriterion.event_id,
                name,
                max_score: maxScore,
                weight,
                round: data.round,
            })
            .eq('id', id);

        if (error) {
            throw error;
        }

        revalidatePath('/admin/criteria');
        revalidatePath('/round1');
        revalidatePath('/round1/[teamId]');
        revalidatePath('/round2');
        revalidatePath('/round2/[teamId]');

        return {
            success: true,
        };
    } catch (error) {
        console.error('updateCriterion error:', error);

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update criterion.',
        };
    }
}

export async function deleteCriterion(
    id: string
) {
    try {
        await requireAuth(['admin']);

        const supabase = createAdminClient();

        /*
         * Don't delete a criterion if scores already exist.
         * This protects evaluation history.
         */
        const [
            { count: round1ScoreCount, error: r1Error },
            { count: round2ScoreCount, error: r2Error },
        ] = await Promise.all([
            supabase
                .from('round1_scores')
                .select('id', {
                    count: 'exact',
                    head: true,
                })
                .eq('criteria_id', id),

            supabase
                .from('round2_scores')
                .select('id', {
                    count: 'exact',
                    head: true,
                })
                .eq('criteria_id', id),
        ]);

        if (r1Error) {
            throw r1Error;
        }

        if (r2Error) {
            throw r2Error;
        }

        if (
            (round1ScoreCount ?? 0) > 0 ||
            (round2ScoreCount ?? 0) > 0
        ) {
            return {
                success: false,
                error:
                    'This criterion already has submitted scores and cannot be deleted.',
            };
        }

        const { error } = await supabase
            .from('criteria')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        revalidatePath('/admin/criteria');
        revalidatePath('/round1');
        revalidatePath('/round1/[teamId]');
        revalidatePath('/round2');
        revalidatePath('/round2/[teamId]');

        return {
            success: true,
        };
    } catch (error) {
        console.error('deleteCriterion error:', error);

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to delete criterion.',
        };
    }
}