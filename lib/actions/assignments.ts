'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/auth';

export async function assignEvaluatorToTeam(
    evaluatorId: string,
    teamId: string
) {
    try {
        await requireAuth(['admin', 'data_operator']);

        if (!evaluatorId || !teamId) {
            return {
                success: false,
                error: 'Evaluator and team are required.',
            };
        }

        const supabase = createAdminClient();

        const { data: evaluator, error: evaluatorError } =
            await supabase
                .from('evaluators')
                .select('id, role')
                .eq('id', evaluatorId)
                .single();

        if (evaluatorError || !evaluator) {
            return {
                success: false,
                error: 'Evaluator not found.',
            };
        }

        if (evaluator.role !== 'evaluator') {
            return {
                success: false,
                error:
                    'Only Round 1 evaluator accounts can be assigned to Round 1 teams.',
            };
        }

        const { data: team, error: teamError } =
            await supabase
                .from('teams')
                .select('id, event_id')
                .eq('id', teamId)
                .single();

        if (teamError || !team) {
            return {
                success: false,
                error: 'Team not found.',
            };
        }

        const { data: existing } = await supabase
            .from('round1_assignments')
            .select('id')
            .eq('evaluator_id', evaluatorId)
            .eq('team_id', teamId)
            .maybeSingle();

        if (existing) {
            return {
                success: false,
                error:
                    'This evaluator is already assigned to this team.',
            };
        }

        const { error } = await supabase
            .from('round1_assignments')
            .insert({
                event_id: team.event_id,
                evaluator_id: evaluatorId,
                team_id: teamId,
            });

        if (error) {
            if (error.code === '23505') {
                return {
                    success: false,
                    error:
                        'This evaluator is already assigned to this team.',
                };
            }

            throw error;
        }

        revalidatePath('/admin/assignments');
        revalidatePath('/round1');

        return {
            success: true,
        };
    } catch (error) {
        console.error('assignEvaluatorToTeam error:', error);

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to assign evaluator.',
        };
    }
}

export async function unassignEvaluatorFromTeam(
    assignmentId: string
) {
    try {
        await requireAuth(['admin', 'data_operator']);

        const supabase = createAdminClient();

        const { error } = await supabase
            .from('round1_assignments')
            .delete()
            .eq('id', assignmentId);

        if (error) {
            throw error;
        }

        revalidatePath('/admin/assignments');
        revalidatePath('/round1');

        return {
            success: true,
        };
    } catch (error) {
        console.error(
            'unassignEvaluatorFromTeam error:',
            error
        );

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to unassign evaluator.',
        };
    }
}

export async function assignJuryToTeam(
    juryId: string,
    teamId: string
) {
    try {
        await requireAuth(['admin', 'data_operator']);

        const supabase = createAdminClient();

        const { data: jury, error: juryError } =
            await supabase
                .from('evaluators')
                .select('id, role')
                .eq('id', juryId)
                .single();

        if (juryError || !jury) {
            return {
                success: false,
                error: 'Jury member not found.',
            };
        }

        if (jury.role !== 'jury') {
            return {
                success: false,
                error:
                    'Only Round 2 jury members can be assigned to Round 2 teams.',
            };
        }

        const { data: team, error: teamError } =
            await supabase
                .from('teams')
                .select('id, event_id, status')
                .eq('id', teamId)
                .single();

        if (teamError || !team) {
            return {
                success: false,
                error: 'Team not found.',
            };
        }

        if (team.status !== 'shortlisted') {
            return {
                success: false,
                error:
                    'Only shortlisted teams can be assigned to Round 2 jury members.',
            };
        }

        const { data: existing } = await supabase
            .from('round2_assignments')
            .select('id')
            .eq('jury_id', juryId)
            .eq('team_id', teamId)
            .maybeSingle();

        if (existing) {
            return {
                success: false,
                error:
                    'This jury member is already assigned to this team.',
            };
        }

        const { error } = await supabase
            .from('round2_assignments')
            .insert({
                event_id: team.event_id,
                jury_id: juryId,
                team_id: teamId,
            });

        if (error) {
            if (error.code === '23505') {
                return {
                    success: false,
                    error:
                        'This jury member is already assigned to this team.',
                };
            }

            throw error;
        }

        revalidatePath('/admin/assignments');
        revalidatePath('/round2');

        return {
            success: true,
        };
    } catch (error) {
        console.error('assignJuryToTeam error:', error);

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to assign jury member.',
        };
    }
}

export async function unassignJuryFromTeam(
    assignmentId: string
) {
    try {
        await requireAuth(['admin', 'data_operator']);

        const supabase = createAdminClient();

        const { error } = await supabase
            .from('round2_assignments')
            .delete()
            .eq('id', assignmentId);

        if (error) {
            throw error;
        }

        revalidatePath('/admin/assignments');
        revalidatePath('/round2');

        return {
            success: true,
        };
    } catch (error) {
        console.error(
            'unassignJuryFromTeam error:',
            error
        );

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to unassign jury member.',
        };
    }
}