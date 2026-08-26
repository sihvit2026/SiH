'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/auth';

export async function updateEvaluator(
    id: string,
    data: {
        name: string;
        role: 'evaluator' | 'jury';
    }
) {
    try {
        await requireAuth(['admin', 'data_operator']);

        if (!data.name.trim()) {
            return {
                success: false,
                error: 'Name is required.',
            };
        }

        const supabase = createAdminClient();

        const { error } = await supabase
            .from('evaluators')
            .update({
                name: data.name.trim(),
                role: data.role,
            })
            .eq('id', id);

        if (error) {
            throw error;
        }

        revalidatePath('/admin/evaluators');
        revalidatePath('/admin/assignments');

        return {
            success: true,
        };
    } catch (error) {
        console.error('updateEvaluator error:', error);

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update evaluator.',
        };
    }
}

export async function deleteEvaluator(id: string) {
    try {
        await requireAuth(['admin']);

        const supabase = createAdminClient();

        // Do not silently destroy evaluation history.
        const { count: scoreCount, error: scoreError } =
            await supabase
                .from('round1_scores')
                .select('id', {
                    count: 'exact',
                    head: true,
                })
                .eq('evaluator_id', id);

        if (scoreError) {
            throw scoreError;
        }

        if ((scoreCount ?? 0) > 0) {
            return {
                success: false,
                error:
                    'This evaluator has submitted Round 1 scores and cannot be deleted. Disable or reassign the account instead.',
            };
        }

        const { count: assignmentCount, error: assignmentError } =
            await supabase
                .from('round1_assignments')
                .select('id', {
                    count: 'exact',
                    head: true,
                })
                .eq('evaluator_id', id);

        if (assignmentError) {
            throw assignmentError;
        }

        if ((assignmentCount ?? 0) > 0) {
            return {
                success: false,
                error:
                    'This evaluator still has Round 1 assignments. Unassign all teams first.',
            };
        }

        const { error: evaluatorError } = await supabase
            .from('evaluators')
            .delete()
            .eq('id', id);

        if (evaluatorError) {
            throw evaluatorError;
        }

        // Remove the Supabase Auth account only after the DB record
        // has been successfully removed.
        const { error: authError } =
            await supabase.auth.admin.deleteUser(id);

        if (authError) {
            console.error(
                'Auth user delete failed after evaluator removal:',
                authError
            );
        }

        revalidatePath('/admin/evaluators');

        return {
            success: true,
        };
    } catch (error) {
        console.error('deleteEvaluator error:', error);

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to delete evaluator.',
        };
    }
}