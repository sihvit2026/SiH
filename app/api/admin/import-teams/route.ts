import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

interface ImportRow {
  team_name: string;
  team_code: string;
  problem_statement_code: string;
  student_name: string;
  roll_number: string;
  email: string;
  is_leader: boolean;
}

interface ImportResult {
  importedTeams: number;
  importedStudents: number;
  skippedTeams: number;
  errors: string[];
}

function normalizeCode(value: string): string {
  return value.trim().toLowerCase();
}

export async function POST(req: Request) {
  try {
    const userSession = await getCurrentUser();

    if (
      !userSession ||
      !['admin', 'data_operator'].includes(
        userSession.role
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Unauthorized. Admin or Data Operator role required.',
        },
        { status: 403 }
      );
    }

    const body = (await req.json()) as {
      rows?: ImportRow[];
    };

    const rows = body.rows;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        {
          error: 'Invalid rows payload.',
        },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    /* ---------------------------------------------------------
       1. Get active event
       --------------------------------------------------------- */
    const { data: event, error: eventError } =
      await supabase
        .from('events')
        .select('id')
        .in('status', ['upcoming', 'ongoing'])
        .order('created_at', {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

    if (eventError) {
      throw eventError;
    }

    if (!event) {
      return NextResponse.json(
        {
          error:
            'No active event found. Create an upcoming or ongoing event first.',
        },
        { status: 400 }
      );
    }

    /* ---------------------------------------------------------
       2. Group rows by team code
       --------------------------------------------------------- */
    const groupedTeams = new Map<
      string,
      ImportRow[]
    >();

    for (const row of rows) {
      const teamCode = row.team_code?.trim();

      if (!teamCode) {
        continue;
      }

      const key = normalizeCode(teamCode);

      const existing =
        groupedTeams.get(key) ?? [];

      existing.push({
        ...row,
        team_name: row.team_name.trim(),
        team_code: teamCode,
        problem_statement_code:
          row.problem_statement_code.trim(),
        student_name: row.student_name.trim(),
        roll_number: row.roll_number.trim(),
        email: row.email.trim(),
        is_leader: Boolean(row.is_leader),
      });

      groupedTeams.set(key, existing);
    }

    const errors: string[] = [];
    const validTeams: Array<{
      teamCode: string;
      rows: ImportRow[];
    }> = [];

    /* ---------------------------------------------------------
       3. Validate each team
       --------------------------------------------------------- */
    for (const [teamCode, teamRows] of groupedTeams) {
      if (teamRows.length !== 6) {
        errors.push(
          `${teamCode}: expected exactly 6 students, found ${teamRows.length}.`
        );
        continue;
      }

      const leaders = teamRows.filter(
        (row) => row.is_leader
      );

      if (leaders.length !== 1) {
        errors.push(
          `${teamCode}: expected exactly 1 leader, found ${leaders.length}.`
        );
        continue;
      }

      const psCodes = new Set(
        teamRows.map((row) =>
          normalizeCode(
            row.problem_statement_code
          )
        )
      );

      if (psCodes.size !== 1) {
        errors.push(
          `${teamCode}: all 6 students must have the same PS Number.`
        );
        continue;
      }

      const teamName = teamRows[0].team_name;

      const names = new Set(
        teamRows.map((row) =>
          row.student_name.toLowerCase()
        )
      );

      if (names.size !== teamRows.length) {
        errors.push(
          `${teamCode}: duplicate student names detected.`
        );
        continue;
      }

      const emails = new Set(
        teamRows.map((row) =>
          row.email.toLowerCase()
        )
      );

      if (emails.size !== teamRows.length) {
        errors.push(
          `${teamCode}: duplicate student emails detected.`
        );
        continue;
      }

      if (!teamName) {
        errors.push(
          `${teamCode}: team name is missing.`
        );
        continue;
      }

      if (
        teamRows.some(
          (row) =>
            !row.student_name ||
            !row.roll_number ||
            !row.email
        )
      ) {
        errors.push(
          `${teamCode}: every student must have name, roll number and email.`
        );
        continue;
      }

      validTeams.push({
        teamCode,
        rows: teamRows,
      });
    }

    if (validTeams.length === 0) {
      return NextResponse.json({
        success: false,
        importedTeams: 0,
        importedStudents: 0,
        skippedTeams: groupedTeams.size,
        errors,
      });
    }

    /* ---------------------------------------------------------
       4. Get all PS records for current event
       --------------------------------------------------------- */
    const psCodes = Array.from(
      new Set(
        validTeams.map((team) =>
          normalizeCode(
            team.rows[0].problem_statement_code
          )
        )
      )
    );

    const {
      data: problemStatements,
      error: psError,
    } = await supabase
      .from('problem_statements')
      .select('id, statement_code')
      .eq('event_id', event.id);

    if (psError) {
      throw psError;
    }

    const problemStatementMap = new Map<
      string,
      string
    >();

    for (const ps of problemStatements ?? []) {
      problemStatementMap.set(
        normalizeCode(ps.statement_code),
        ps.id
      );
    }

    /* ---------------------------------------------------------
       5. Import each team
       --------------------------------------------------------- */
    let importedTeams = 0;
    let importedStudents = 0;
    let skippedTeams = 0;

    for (const team of validTeams) {
      const psCode = normalizeCode(
        team.rows[0].problem_statement_code
      );

      const problemStatementId =
        problemStatementMap.get(psCode);

      if (!problemStatementId) {
        errors.push(
          `${team.teamCode}: PS Number "${team.rows[0].problem_statement_code}" does not exist for the active event.`
        );

        skippedTeams += 1;
        continue;
      }

      /* ----------------------------------------------
         Find or create team
         ---------------------------------------------- */
      const { data: existingTeam, error: findError } =
        await supabase
          .from('teams')
          .select('id')
          .eq('event_id', event.id)
          .eq('team_code', team.teamCode)
          .maybeSingle();

      if (findError) {
        errors.push(
          `${team.teamCode}: ${findError.message}`
        );
        skippedTeams += 1;
        continue;
      }

      let teamId: string;

      if (existingTeam) {
        teamId = existingTeam.id;

        const { error: updateTeamError } =
          await supabase
            .from('teams')
            .update({
              team_name: team.rows[0].team_name,
              problem_statement_id:
                problemStatementId,
            })
            .eq('id', teamId);

        if (updateTeamError) {
          errors.push(
            `${team.teamCode}: failed to update team - ${updateTeamError.message}`
          );

          skippedTeams += 1;
          continue;
        }

        /*
         * Rebuild the roster so a re-import does not create
         * duplicate students.
         */
        const { error: deleteStudentsError } =
          await supabase
            .from('students')
            .delete()
            .eq('team_id', teamId);

        if (deleteStudentsError) {
          errors.push(
            `${team.teamCode}: failed to replace students - ${deleteStudentsError.message}`
          );

          skippedTeams += 1;
          continue;
        }
      } else {
        const { data: newTeam, error: createTeamError } =
          await supabase
            .from('teams')
            .insert({
              event_id: event.id,
              team_name: team.rows[0].team_name,
              team_code: team.teamCode,
              status: 'registered',
              problem_statement_id:
                problemStatementId,
            })
            .select('id')
            .single();

        if (createTeamError || !newTeam) {
          errors.push(
            `${team.teamCode}: failed to create team - ${createTeamError?.message ??
            'Unknown database error'
            }`
          );

          skippedTeams += 1;
          continue;
        }

        teamId = newTeam.id;
      }

      /* ----------------------------------------------
         Insert exactly six students
         ---------------------------------------------- */
      const studentsToInsert = team.rows.map(
        (row) => ({
          team_id: teamId,
          name: row.student_name,
          roll_number: row.roll_number,
          email: row.email,
          is_leader: row.is_leader,
        })
      );

      const {
        error: studentsInsertError,
      } = await supabase
        .from('students')
        .insert(studentsToInsert);

      if (studentsInsertError) {
        errors.push(
          `${team.teamCode}: failed to insert students - ${studentsInsertError.message}`
        );

        skippedTeams += 1;
        continue;
      }

      importedTeams += 1;
      importedStudents += 6;
    }

    return NextResponse.json({
      success: errors.length === 0,
      importedTeams,
      importedStudents,
      skippedTeams,
      errors,
    });
  } catch (error) {
    console.error('Import API error:', error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Server error',
      },
      { status: 500 }
    );
  }
}