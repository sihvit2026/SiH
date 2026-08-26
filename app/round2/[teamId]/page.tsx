import React from 'react';
import { Shell } from '@/components/layout/Shell';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import type {
  CriterionRow,
  StudentRow,
  ScoreRow,
  CommentRow,
} from '@/lib/schemas';

export const dynamic = 'force-dynamic';

const juryNavItems = [
  { label: 'Shortlisted Teams', href: '/round2', icon: '⚖️' },
  { label: 'Jury Rules', href: '#', icon: '📖' },
];

interface ProblemStatementDetails {
  id: string;
  statement_code: string;
  title: string;
  description: string | null;
  theme: string | null;
  category: string | null;
  organization: string | null;
}

interface TeamDetails {
  id: string;
  team_name: string;
  team_code: string;
  status: string;
  students?: StudentRow[];
  problem_statement?: ProblemStatementDetails | null;
}

async function submitRound2JuryScores(formData: FormData) {
  'use server';

  const session = await requireAuth(['jury', 'admin']);

  const teamId = formData.get('teamId') as string;
  const commentText =
    (formData.get('comment') as string | null)?.trim() || '';

  const isFinalSubmit =
    formData.get('actionType') === 'final';

  if (!teamId) {
    throw new Error('Team ID is required.');
  }

  try {
    const supabase = await createClient();

    /*
     * ------------------------------------------------------------------
     * 1. Verify Round 2 assignment
     * ------------------------------------------------------------------
     */
<<<<<<< HEAD
    const assignmentPromise = session.role !== 'admin'
      ? supabase.from('round2_assignments').select('id').eq('jury_id', session.user.id).eq('team_id', teamId).maybeSingle()
      : Promise.resolve({ data: { id: 'admin-bypass' }, error: null });

    const evaluatorPromise = session.role !== 'admin'
      ? supabase.from('evaluators').select('round2_attendance, role').eq('id', session.user.id).single()
      : Promise.resolve({ data: { role: 'jury', round2_attendance: 'present' }, error: null });

    const [
      { data: assignment, error: assignmentError },
      { data: evaluator, error: evaluatorError },
      { data: team, error: teamError },
      { data: lock, error: lockError },
      { data: criteria, error: criteriaError }
    ] = await Promise.all([
      assignmentPromise,
      evaluatorPromise,
      supabase.from('teams').select('id, status').eq('id', teamId).single(),
      supabase.from('evaluation_locks').select('status').eq('evaluator_id', session.user.id).eq('team_id', teamId).eq('round', 2).maybeSingle(),
      supabase.from('criteria').select('id, name, max_score').eq('round', 2).order('name', { ascending: true })
    ]);

    if (assignmentError) throw assignmentError;
    if (session.role !== 'admin' && !assignment) {
      throw new Error('You are not assigned to this team for Round 2 evaluation.');
    }

    if (evaluatorError) throw evaluatorError;
    if (session.role !== 'admin') {
      if (evaluator.role !== 'jury') throw new Error('Only Round 2 jury members can submit Round 2 scores.');
      if (evaluator.round2_attendance !== 'present') throw new Error('Jury attendance is absent. Round 2 submission is locked.');
    }

    if (teamError) throw teamError;
    if (!team) throw new Error('Team not found.');
    if (team.status !== 'shortlisted' && session.role !== 'admin') {
      throw new Error('This team is no longer shortlisted for Round 2.');
    }

    if (lockError) throw lockError;
    if (lock?.status === 'locked' && session.role !== 'admin') {
      throw new Error('Jury scorecard is locked and cannot be edited.');
    }

    if (criteriaError) throw criteriaError;
    if (!criteria || criteria.length === 0) {
      throw new Error('No Round 2 criteria are configured.');
=======
    if (session.role !== 'admin') {
      const { data: assignment, error: assignmentError } =
        await supabase
          .from('round2_assignments')
          .select('id')
          .eq('jury_id', session.user.id)
          .eq('team_id', teamId)
          .maybeSingle();

      if (assignmentError) {
        throw assignmentError;
      }

      if (!assignment) {
        throw new Error(
          'You are not assigned to this team for Round 2 evaluation.'
        );
      }
    }

    /*
     * ------------------------------------------------------------------
     * 2. Verify jury attendance
     * ------------------------------------------------------------------
     */
    if (session.role !== 'admin') {
      const { data: evaluator, error: evaluatorError } =
        await supabase
          .from('evaluators')
          .select('round2_attendance, role')
          .eq('id', session.user.id)
          .single();

      if (evaluatorError) {
        throw evaluatorError;
      }

      if (evaluator.role !== 'jury') {
        throw new Error(
          'Only Round 2 jury members can submit Round 2 scores.'
        );
      }

      if (
        evaluator.round2_attendance !== 'present'
      ) {
        throw new Error(
          'Jury attendance is absent. Round 2 submission is locked.'
        );
      }
    }

    /*
     * ------------------------------------------------------------------
     * 3. Verify the team is still shortlisted
     * ------------------------------------------------------------------
     */
    const { data: team, error: teamError } =
      await supabase
        .from('teams')
        .select('id, status')
        .eq('id', teamId)
        .single();

    if (teamError) {
      throw teamError;
    }

    if (!team) {
      throw new Error('Team not found.');
    }

    if (
      team.status !== 'shortlisted' &&
      session.role !== 'admin'
    ) {
      throw new Error(
        'This team is no longer shortlisted for Round 2.'
      );
    }

    /*
     * ------------------------------------------------------------------
     * 4. Check scorecard lock
     * ------------------------------------------------------------------
     */
    const { data: lock, error: lockError } =
      await supabase
        .from('evaluation_locks')
        .select('status')
        .eq('evaluator_id', session.user.id)
        .eq('team_id', teamId)
        .eq('round', 2)
        .maybeSingle();

    if (lockError) {
      throw lockError;
    }

    if (
      lock?.status === 'locked' &&
      session.role !== 'admin'
    ) {
      throw new Error(
        'Jury scorecard is locked and cannot be edited.'
      );
    }

    /*
     * ------------------------------------------------------------------
     * 5. Fetch Round 2 criteria
     * ------------------------------------------------------------------
     */
    const { data: criteria, error: criteriaError } =
      await supabase
        .from('criteria')
        .select('id, name, max_score')
        .eq('round', 2)
        .order('name', {
          ascending: true,
        });

    if (criteriaError) {
      throw criteriaError;
    }

    if (!criteria || criteria.length === 0) {
      throw new Error(
        'No Round 2 criteria are configured.'
      );
>>>>>>> 52fc6d6b1d321253741e9249f27c7a76ea218d59
    }

    /*
     * ------------------------------------------------------------------
     * 6. Validate and save every score
     * ------------------------------------------------------------------
     */
<<<<<<< HEAD
    const scoreRows = [];
    for (const criterion of criteria) {
      const rawValue = formData.get(`score_${criterion.id}`);
      const scoreVal = Number(rawValue);

      if (!Number.isFinite(scoreVal) || scoreVal < 0 || scoreVal > Number(criterion.max_score)) {
        throw new Error(`Invalid score for "${criterion.name}". Score must be between 0 and ${criterion.max_score}.`);
      }

      scoreRows.push({
        jury_id: session.user.id,
        team_id: teamId,
        criteria_id: criterion.id,
        score: scoreVal,
      });
    }

    if (scoreRows.length > 0) {
      const { error: scoreError } = await supabase
        .from('round2_scores')
        .upsert(scoreRows, { onConflict: 'team_id, jury_id, criteria_id' });

      if (scoreError) throw scoreError;
=======
    for (const criterion of criteria) {
      const rawValue = formData.get(
        `score_${criterion.id}`
      );

      const scoreVal = Number(rawValue);

      if (
        !Number.isFinite(scoreVal) ||
        scoreVal < 0 ||
        scoreVal > Number(criterion.max_score)
      ) {
        throw new Error(
          `Invalid score for "${criterion.name}". ` +
          `Score must be between 0 and ${criterion.max_score}.`
        );
      }

      const { error: scoreError } =
        await supabase
          .from('round2_scores')
          .upsert(
            {
              jury_id: session.user.id,
              team_id: teamId,
              criteria_id: criterion.id,
              score: scoreVal,
            },
            {
              onConflict:
                'team_id, jury_id, criteria_id',
            }
          );

      if (scoreError) {
        throw scoreError;
      }
>>>>>>> 52fc6d6b1d321253741e9249f27c7a76ea218d59
    }

    /*
     * ------------------------------------------------------------------
     * 7. Save comment
     * ------------------------------------------------------------------
     *
     * We only create a new comment when the submitted field
     * is non-empty. Existing comments remain available as history.
     */
    if (commentText) {
      const { error: commentError } =
        await supabase
          .from('round2_comments')
          .insert({
            jury_id: session.user.id,
            team_id: teamId,
            comment: commentText,
          });

      if (commentError) {
        throw commentError;
      }
    }

    /*
     * ------------------------------------------------------------------
     * 8. Final submission locks the scorecard
     * ------------------------------------------------------------------
     */
    if (isFinalSubmit) {
      const { error: lockUpsertError } =
        await supabase
          .from('evaluation_locks')
          .upsert(
            {
              evaluator_id: session.user.id,
              team_id: teamId,
              round: 2,
              status: 'locked',
            },
            {
              onConflict:
                'evaluator_id, team_id, round',
            }
          );

      if (lockUpsertError) {
        throw lockUpsertError;
      }
    }

    revalidatePath(`/round2/${teamId}`);
    revalidatePath('/round2');
    revalidatePath('/reports');
  } catch (err) {
    console.error(
      'Failed to submit Round 2 jury scores:',
      err
    );

    throw new Error(
      err instanceof Error
        ? err.message
        : 'Failed to submit Round 2 scores.'
    );
  }
}

export default async function Round2JuryEvaluationFormPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const session = await requireAuth([
    'jury',
    'admin',
  ]);

  const resolvedParams = await params;
  const teamId = resolvedParams.teamId;

  let teamDetails: TeamDetails | null = null;
  let criteriaList: CriterionRow[] = [];

  const existingScores: Record<string, number> = {};
  let existingComment = '';

  const isAttendancePresent =
    session.round2Attendance === 'present' ||
    session.role === 'admin';

  let isLocked = false;

  try {
    const supabase = await createClient();

    /*
     * ------------------------------------------------------------------
     * Assignment check
     * ------------------------------------------------------------------
     *
     * Admin bypasses assignment validation.
     */
    const assignmentPromise =
      session.role !== 'admin'
        ? supabase
          .from('round2_assignments')
          .select('id')
          .eq('jury_id', session.user.id)
          .eq('team_id', teamId)
          .maybeSingle()
        : Promise.resolve({
          data: { id: 'admin-bypass' },
          error: null,
        });

    const [
      {
        data: assignment,
        error: assignmentError,
      },
      { data: lock, error: lockError },
      { data: team, error: teamError },
      { data: criteria, error: criteriaError },
      { data: scores, error: scoresError },
      {
        data: comments,
        error: commentsError,
      },
    ] = await Promise.all([
      assignmentPromise,

      supabase
        .from('evaluation_locks')
        .select('status')
        .eq('evaluator_id', session.user.id)
        .eq('team_id', teamId)
        .eq('round', 2)
        .maybeSingle(),

      supabase
        .from('teams')
<<<<<<< HEAD
        .select(`id, team_name, team_code, status, students(id, name, email, roll_number, is_leader, created_at), problem_statement:problem_statements(id, statement_code, title, description, theme, category, organization)`)
=======
        .select(`
          *,
          students(*),
          problem_statement:problem_statements(*)
        `)
>>>>>>> 52fc6d6b1d321253741e9249f27c7a76ea218d59
        .eq('id', teamId)
        .single(),

      supabase
        .from('criteria')
<<<<<<< HEAD
        .select('id, name, max_score, weight, round')
=======
        .select('*')
>>>>>>> 52fc6d6b1d321253741e9249f27c7a76ea218d59
        .eq('round', 2)
        .order('name', {
          ascending: true,
        }),

      supabase
        .from('round2_scores')
<<<<<<< HEAD
        .select('criteria_id, score')
=======
        .select('*')
>>>>>>> 52fc6d6b1d321253741e9249f27c7a76ea218d59
        .eq('team_id', teamId)
        .eq('jury_id', session.user.id),

      supabase
        .from('round2_comments')
<<<<<<< HEAD
        .select('comment')
=======
        .select('*')
>>>>>>> 52fc6d6b1d321253741e9249f27c7a76ea218d59
        .eq('team_id', teamId)
        .eq('jury_id', session.user.id)
        .order('created_at', {
          ascending: false,
        })
        .limit(1),
    ]);

    if (assignmentError) {
      throw assignmentError;
    }

    if (
      session.role !== 'admin' &&
      !assignment
    ) {
      redirect('/round2');
    }

    if (lockError) {
      throw lockError;
    }

    if (teamError) {
      throw teamError;
    }

    if (criteriaError) {
      throw criteriaError;
    }

    if (scoresError) {
      throw scoresError;
    }

    if (commentsError) {
      throw commentsError;
    }

    if (
      team?.status !== 'shortlisted' &&
      session.role !== 'admin'
    ) {
      redirect('/round2');
    }

    if (lock?.status === 'locked') {
      isLocked = true;
    }

    teamDetails = team as TeamDetails;
    criteriaList = (criteria ||
      []) as CriterionRow[];

    if (scores) {
      (
        scores as ScoreRow[]
      ).forEach((score) => {
        existingScores[score.criteria_id] =
          Number(score.score);
      });
    }

    if (comments && comments.length > 0) {
      existingComment = (
        comments as CommentRow[]
      )[0].comment;
    }
  } catch (err) {
    /*
     * redirect() and notFound() throw internally in Next.js.
     * Re-throw those so Next.js can handle them normally.
     */
    if (
      err &&
      typeof err === 'object' &&
      'digest' in err &&
      typeof err.digest === 'string' &&
      (
        err.digest.startsWith(
          'NEXT_REDIRECT'
        ) ||
        err.digest.startsWith('NEXT_NOT_FOUND')
      )
    ) {
      throw err;
    }

    console.error(
      'Error fetching Round 2 evaluation details:',
      err
    );
  }

  if (
    !teamDetails ||
    criteriaList.length === 0
  ) {
    notFound();
  }

  const totalMaxScore =
    criteriaList.reduce(
      (total, criterion) =>
        total + Number(criterion.max_score),
      0
    );

  return (
    <Shell
      title={`Jury Evaluation: ${teamDetails.team_name}`}
      roleName="Round 2 Jury"
      roleType="jury"
      userName={session.name}
      navItems={juryNavItems}
    >
      <div className="flex items-center justify-between">
        <Link
          href="/round2"
          className="text-xs text-purple-700 hover:text-purple-800 font-semibold flex items-center gap-1"
        >
          ← Back to Assigned Teams
        </Link>

        <div className="flex items-center gap-2">
          {isLocked && (
            <Badge variant="rose">
              🔒 SCORECARD LOCKED
            </Badge>
          )}

          <Badge variant="shortlisted">
            SHORTLISTED FOR ROUND 2
          </Badge>
        </div>
      </div>

      {!isAttendancePresent && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs space-y-1">
          <span className="font-bold block">
            🔴 Jury Attendance Absent
          </span>

          <p>
            Your attendance status is currently marked
            as absent. You cannot enter or submit scores
            until the administrator updates your attendance
            to present.
          </p>
        </div>
      )}

      {isLocked && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs space-y-1">
          <span className="font-bold block">
            🔒 Scorecard Locked
          </span>

          <p>
            Your jury score for this team has been
            submitted and locked. Contact an administrator
            if changes are required.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Team Information */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <span className="text-xs font-mono text-purple-700 font-bold">
              {teamDetails.team_code}
            </span>

            <CardTitle>
              {teamDetails.team_name}
            </CardTitle>

            <CardDescription>
              Shortlisted Finalist Team
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Problem Statement */}
            {teamDetails.problem_statement ? (
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 space-y-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-orange-700">
                    Assigned Problem Statement
                  </p>

                  <p className="mt-1 font-mono text-xs font-bold text-orange-800">
                    {
                      teamDetails
                        .problem_statement
                        .statement_code
                    }
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {
                      teamDetails
                        .problem_statement
                        .title
                    }
                  </p>
                </div>

                {teamDetails.problem_statement.description && (
                  <div className="pt-2 border-t border-orange-100">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Description
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-700">
                      {
                        teamDetails
                          .problem_statement
                          .description
                      }
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-1 pt-2">
                  {teamDetails.problem_statement.theme && (
                    <p className="text-[11px] text-slate-600">
                      <span className="font-semibold">
                        Theme:
                      </span>{' '}
                      {
                        teamDetails
                          .problem_statement
                          .theme
                      }
                    </p>
                  )}

                  {teamDetails.problem_statement.category && (
                    <p className="text-[11px] text-slate-600">
                      <span className="font-semibold">
                        Category:
                      </span>{' '}
                      {
                        teamDetails
                          .problem_statement
                          .category
                      }
                    </p>
                  )}

                  {teamDetails.problem_statement.organization && (
                    <p className="text-[11px] text-slate-600">
                      <span className="font-semibold">
                        Organization:
                      </span>{' '}
                      {
                        teamDetails
                          .problem_statement
                          .organization
                      }
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs font-semibold text-amber-800">
                  No Problem Statement Assigned
                </p>

                <p className="mt-1 text-[11px] text-amber-700">
                  Please contact the administrator.
                </p>
              </div>
            )}

            {/* Students */}
            <div>
              <span className="text-xs font-semibold uppercase text-slate-500 block mb-2">
                Student Members:
              </span>

              <div className="space-y-2">
                {teamDetails.students &&
                  teamDetails.students.length > 0 ? (
                  teamDetails.students.map(
                    (student: StudentRow) => (
                      <div
                        key={student.id}
                        className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                          <span>
                            {student.name}
                          </span>

                          {student.is_leader && (
                            <span className="text-[9px] font-semibold text-orange-700">
                              LEADER
                            </span>
                          )}
                        </div>

                        <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between gap-2 mt-0.5">
                          <span>
                            {student.roll_number}
                          </span>

                          <span className="truncate">
                            {student.email}
                          </span>
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <span className="text-xs text-slate-500 italic">
                    No students registered
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 text-xs text-purple-700 space-y-1">
              <span className="font-bold block">
                ⚖️ Round 2 Security Policy
              </span>

              <p className="text-[11px] text-purple-600">
                Only an assigned Round 2 jury member with
                present attendance can submit scores.
                Scores and comments are linked to the jury ID.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right: Jury Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-slate-900">
              Round 2 Jury Scorecard
            </CardTitle>

            <CardDescription>
              Enter final jury scores (Total Max:{' '}
              {totalMaxScore} pts)
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              action={submitRound2JuryScores}
              className="space-y-6"
            >
              <input
                type="hidden"
                name="teamId"
                value={teamDetails.id}
              />

              <div className="space-y-4">
                {criteriaList.map((criterion) => (
                  <div
                    key={criterion.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor={`score_${criterion.id}`}
                        className="text-sm font-bold text-slate-900"
                      >
                        {criterion.name}
                      </label>

                      <span className="text-xs font-mono text-purple-700">
                        Max: {criterion.max_score} pts
                      </span>
                    </div>

                    <Input
                      id={`score_${criterion.id}`}
                      name={`score_${criterion.id}`}
                      type="number"
                      min="0"
                      max={criterion.max_score}
                      step="0.5"
                      defaultValue={
                        existingScores[
                        criterion.id
                        ] ?? ''
                      }
                      placeholder={`Enter jury score (0 - ${criterion.max_score})`}
                      disabled={
                        !isAttendancePresent ||
                        (isLocked &&
                          session.role !== 'admin')
                      }
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="comment"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                >
                  Jury Deliberation & Recommendations
                </label>

                <textarea
                  id="comment"
                  name="comment"
                  rows={4}
                  defaultValue={existingComment}
                  placeholder="Record final jury notes, prototype evaluation observations, and award recommendations..."
                  disabled={
                    !isAttendancePresent ||
                    (isLocked &&
                      session.role !== 'admin')
                  }
                  className="w-full bg-white text-slate-900 text-sm rounded-lg border border-slate-300 p-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none disabled:opacity-50 shadow-sm"
                />
              </div>

              {isAttendancePresent &&
                (!isLocked ||
                  session.role === 'admin') && (
                  <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="submit"
                      name="actionType"
                      value="draft"
                      className="px-4 py-2 rounded-lg bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
                    >
                      💾 Save Draft
                    </button>

                    <button
                      type="submit"
                      name="actionType"
                      value="final"
                      className="px-4 py-2 rounded-lg bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 shadow-sm transition"
                    >
                      ⚖️ Submit Final Jury Score
                    </button>
                  </div>
                )}
            </form>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}