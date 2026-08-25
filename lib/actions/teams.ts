'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/auth';

export interface TeamMemberInput {
    id?: string;
    name: string;
    roll_number: string;
    email: string;
    is_leader: boolean;
}

export interface CreateTeamInput {
    team_name: string;
    team_code: string;
    status: string;
    problem_statement_id: string | null;
    students: TeamMemberInput[];
}

export interface UpdateTeamInput {
    team_name: string;
    team_code: string;
    status: string;
    problem_statement_id: string | null;
    students: TeamMemberInput[];
}

function validateTeamMembers(students: TeamMemberInput[]) {
    if (students.length !== 6) {
        return 'A team must have exactly 6 students.';
    }

    const leaders = students.filter((student) => student.is_leader);

    if (leaders.length !== 1) {
        return 'A team must have exactly 1 leader.';
    }

    for (let i = 0; i < students.length; i++) {
        const student = students[i];

        if (!student.name.trim()) {
            return `Student ${i + 1}: name is required.`;
        }

        if (!student.roll_number.trim()) {
            return `Student ${i + 1}: roll number is required.`;
        }

        if (!student.email.trim()) {
            return `Student ${i + 1}: email is required.`;
        }
    }

    return null;
}

export async function createTeamWithMembers(
    data: CreateTeamInput
) {
    try {
        await requireAuth(['admin', 'data_operator']);

        const validationError = validateTeamMembers(data.students);

        if (validationError) {
            return {
                success: false,
                error: validationError,
            };
        }

        const supabase = createAdminClient();

        // Get the active event for this team.
        const { data: event, error: eventError } = await supabase
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

        const { data: team, error: teamError } = await supabase
            .from('teams')
            .insert({
                event_id: event.id,
                team_name: data.team_name.trim(),
                team_code: data.team_code.trim(),
                status: data.status,
                problem_statement_id: data.problem_statement_id,
            })
            .select('id')
            .single();

        if (teamError) {
            if (teamError.code === '23505') {
                return {
                    success: false,
                    error: `Team code "${data.team_code}" already exists.`,
                };
            }

            throw teamError;
        }

        const students = data.students.map((student) => ({
            team_id: team.id,
            name: student.name.trim(),
            roll_number: student.roll_number.trim(),
            email: student.email.trim(),
            is_leader: student.is_leader,
        }));

        const { error: studentsError } = await supabase
            .from('students')
            .insert(students);

        if (studentsError) {
            await supabase
                .from('teams')
                .delete()
                .eq('id', team.id);

            throw studentsError;
        }

        revalidatePath('/admin/teams');
        revalidatePath('/round1');
        revalidatePath('/round2');

        return {
            success: true,
            teamId: team.id,
        };
    } catch (error) {
        console.error('createTeamWithMembers error:', error);

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to create team.',
        };
    }
}

export async function updateTeamWithMembers(
    teamId: string,
    data: UpdateTeamInput
) {
    try {
        await requireAuth(['admin', 'data_operator']);

        const validationError = validateTeamMembers(data.students);

        if (validationError) {
            return {
                success: false,
                error: validationError,
            };
        }

        const supabase = createAdminClient();

        // Get the existing team's event_id.
        const { data: existingTeam, error: existingTeamError } =
            await supabase
                .from('teams')
                .select('id, event_id')
                .eq('id', teamId)
                .single();

        if (existingTeamError || !existingTeam) {
            return {
                success: false,
                error: 'Team not found.',
            };
        }

        // Update team details while preserving its existing event.
        const { error: teamError } = await supabase
            .from('teams')
            .update({
                event_id: existingTeam.event_id,
                team_name: data.team_name.trim(),
                team_code: data.team_code.trim(),
                status: data.status,
                problem_statement_id: data.problem_statement_id,
            })
            .eq('id', teamId);

        if (teamError) {
            if (teamError.code === '23505') {
                return {
                    success: false,
                    error: `Team code "${data.team_code}" already exists.`,
                };
            }

            throw teamError;
        }

        /*
         * Rebuild the six-member roster.
         * Validation above guarantees:
         * - exactly 6 students
         * - exactly 1 leader
         */
        const { error: deleteError } = await supabase
            .from('students')
            .delete()
            .eq('team_id', teamId);

        if (deleteError) {
            throw deleteError;
        }

        const students = data.students.map((student) => ({
            team_id: teamId,
            name: student.name.trim(),
            roll_number: student.roll_number.trim(),
            email: student.email.trim(),
            is_leader: student.is_leader,
        }));

        const { error: insertError } = await supabase
            .from('students')
            .insert(students);

        if (insertError) {
            throw insertError;
        }

        revalidatePath('/admin/teams');
        revalidatePath('/round1');
        revalidatePath('/round2');

        return {
            success: true,
        };
    } catch (error) {
        console.error('updateTeamWithMembers error:', error);

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update team.',
        };
    }
}