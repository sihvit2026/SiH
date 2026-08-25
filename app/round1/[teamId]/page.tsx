import React from 'react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import type { CriterionRow, StudentRow, ScoreRow, CommentRow } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

const evaluatorNavItems = [
  { label: 'Assigned Teams', href: '/round1', icon: '📝' },
  { label: 'Evaluation Guidelines', href: '#', icon: '📖' },
];

async function submitRound1Scores(formData: FormData) {
  'use server';
  const session = await requireAuth(['evaluator', 'admin']);
  const teamId = formData.get('teamId') as string;
  const commentText = formData.get('comment') as string;
  const isFinalSubmit = formData.get('actionType') === 'final';

  try {
    const supabase = await createClient();

    // Check if scorecard is already locked
    const { data: lock } = await supabase
      .from('evaluation_locks')
      .select('status')
      .eq('evaluator_id', session.user.id)
      .eq('team_id', teamId)
      .eq('round', 1)
      .single();

    if (lock && lock.status === 'locked' && session.role !== 'admin') {
      throw new Error('Scorecard is locked and cannot be edited by evaluator.');
    }

    // Fetch Round 1 criteria
    const { data: criteria } = await supabase
      .from('criteria')
      .select('id, max_score')
      .eq('round', 1);

    if (criteria) {
      for (const crit of criteria) {
        const scoreVal = parseFloat(formData.get(`score_${crit.id}`) as string || '0');
        await supabase
          .from('round1_scores')
          .upsert({
            evaluator_id: session.user.id,
            team_id: teamId,
            criteria_id: crit.id,
            score: scoreVal,
          }, { onConflict: 'team_id, evaluator_id, criteria_id' });
      }
    }

    if (commentText) {
      await supabase
        .from('round1_comments')
        .insert({
          evaluator_id: session.user.id,
          team_id: teamId,
          comment: commentText,
        });
    }

    // Lock scorecard if final submission
    if (isFinalSubmit) {
      await supabase
        .from('evaluation_locks')
        .upsert({
          evaluator_id: session.user.id,
          team_id: teamId,
          round: 1,
          status: 'locked',
        }, { onConflict: 'evaluator_id, team_id, round' });
    }

    revalidatePath(`/round1/${teamId}`);
  } catch (err) {
    console.error('Failed to submit Round 1 scores:', err);
  }
}

export default async function Round1EvaluationFormPage({ params }: { params: Promise<{ teamId: string }> }) {
  const session = await requireAuth(['evaluator', 'admin']);
  const resolvedParams = await params;
  const teamId = resolvedParams.teamId;

  let teamDetails: {
    id: string;
    team_name: string;
    team_code: string;
    status: string;
    students?: StudentRow[];
    problem_statement?: {
      id: string;
      statement_code: string;
      title: string;
      description: string | null;
      theme: string | null;
      category: string | null;
      organization: string | null;
    } | null;
  } | null = null;
  let criteriaList: CriterionRow[] = [];
  const existingScores: Record<string, number> = {};
  let existingComment = '';
  let isLocked = false;

  try {
    const supabase = await createClient();

    // Fire all queries in parallel — assignment check, lock status, and all data fetches.
    // For admins, the assignment check is skipped (resolved immediately).
    // The redirect happens after all queries return, but we don't block any fetches.
    const assignmentPromise = session.role !== 'admin'
      ? supabase.from('round1_assignments').select('id').eq('evaluator_id', session.user.id).eq('team_id', teamId).single()
      : Promise.resolve({ data: { id: 'admin-bypass' }, error: null });

    const [
      { data: assignment },
      { data: lock },
      { data: team },
      { data: criteria },
      { data: scores },
      { data: comments },
    ] = await Promise.all([
      assignmentPromise,
      supabase.from('evaluation_locks').select('status').eq('evaluator_id', session.user.id).eq('team_id', teamId).eq('round', 1).single(),
      supabase.from('teams').select('*, students(*),problem_statement:problem_statements(*)').eq('id', teamId).single(),
      supabase.from('criteria').select('*').eq('round', 1),
      supabase.from('round1_scores').select('*').eq('team_id', teamId).eq('evaluator_id', session.user.id),
      supabase.from('round1_comments').select('*').eq('team_id', teamId).eq('evaluator_id', session.user.id).order('created_at', { ascending: false }).limit(1),
    ]);

    // Authorization check: redirect if evaluator is not assigned to this team
    if (session.role !== 'admin' && !assignment) {
      redirect('/round1');
    }

    if (lock && lock.status === 'locked') {
      isLocked = true;
    }

    teamDetails = team;
    criteriaList = criteria || [];

    if (scores) {
      (scores as ScoreRow[]).forEach((s) => {
        existingScores[s.criteria_id] = Number(s.score);
      });
    }

    if (comments && comments.length > 0) {
      existingComment = (comments as CommentRow[])[0].comment;
    }
  } catch (err) {
    console.error('Error fetching team evaluation data:', err);
  }

  // If team is not found or no criteria are setup, return 404
  if (!teamDetails || criteriaList.length === 0) {
    notFound();
  }

  const totalMaxScore = criteriaList.reduce((acc, curr) => acc + Number(curr.max_score), 0);

  return (
    <Shell
      title={`Evaluate: ${teamDetails.team_name}`}
      roleName="Round 1 Evaluator"
      roleType="evaluator"
      userName={session.name}
      navItems={evaluatorNavItems}
    >
      <div className="flex items-center justify-between">
        <Link href="/round1" className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
          ← Back to Assigned Teams
        </Link>
        <div className="flex items-center gap-2">
          {isLocked && <Badge variant="rose">🔒 SCORECARD LOCKED</Badge>}
          <Badge variant={teamDetails.status as 'shortlisted' | 'registered' | 'round1_pending' | 'selected' | 'standby'}>
            {teamDetails.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </div>

      {isLocked && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs space-y-1">
          <span className="font-bold block">🔒 Scorecard Submitted & Locked</span>
          <p>
            Your evaluation has been finalized and locked. If you need to modify scores, contact an administrator to reopen your submission.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Team Information Panel */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <span className="text-xs font-mono text-blue-600 font-bold">{teamDetails.team_code}</span>
            <CardTitle>{teamDetails.team_name}</CardTitle>
            <CardDescription>Participating Team Profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Problem Statement */}
            {teamDetails.problem_statement ? (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-700">
                    Assigned Problem Statement
                  </p>

                  <p className="mt-1 font-mono text-xs font-bold text-blue-900">
                    {teamDetails.problem_statement.statement_code}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {teamDetails.problem_statement.title}
                  </p>
                </div>

                {teamDetails.problem_statement.description && (
                  <div className="pt-2 border-t border-blue-100">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Description
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-700">
                      {teamDetails.problem_statement.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-1 pt-2">
                  {teamDetails.problem_statement.theme && (
                    <p className="text-[11px] text-slate-600">
                      <span className="font-semibold">Theme:</span>{' '}
                      {teamDetails.problem_statement.theme}
                    </p>
                  )}

                  {teamDetails.problem_statement.category && (
                    <p className="text-[11px] text-slate-600">
                      <span className="font-semibold">Category:</span>{' '}
                      {teamDetails.problem_statement.category}
                    </p>
                  )}

                  {teamDetails.problem_statement.organization && (
                    <p className="text-[11px] text-slate-600">
                      <span className="font-semibold">Organization:</span>{' '}
                      {teamDetails.problem_statement.organization}
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
            <div>
              <span className="text-xs font-semibold uppercase text-slate-500 block mb-2">Student Roster:</span>
              <div className="space-y-2">
                {teamDetails.students && teamDetails.students.length > 0 ? (
                  teamDetails.students.map((student: StudentRow) => (
                    <div key={student.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <div className="font-semibold text-slate-900">{student.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between mt-0.5">
                        <span>{student.roll_number}</span>
                        <span>{student.email}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">No students registered</span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-700 space-y-1">
              <span className="font-bold block">📌 Round 1 Security Policy</span>
              <p className="text-[11px] text-blue-600">
                Your scores and comments are linked strictly to your evaluator ID in `round1_scores.evaluator_id` and `round1_comments.evaluator_id`.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right: Scoring Rubric Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-slate-900">Round 1 Evaluation Rubric</CardTitle>
            <CardDescription>Enter scores per criterion out of maximum allowed points (Total Max: {totalMaxScore} pts)</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={submitRound1Scores} className="space-y-6">
              <input type="hidden" name="teamId" value={teamDetails.id} />

              <div className="space-y-4">
                {criteriaList.map((crit) => (
                  <div key={crit.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor={`score_${crit.id}`} className="text-sm font-bold text-slate-900">
                        {crit.name}
                      </label>
                      <span className="text-xs font-mono text-blue-600">Max: {crit.max_score} pts</span>
                    </div>
                    <Input
                      id={`score_${crit.id}`}
                      name={`score_${crit.id}`}
                      type="number"
                      min="0"
                      max={crit.max_score}
                      step="0.5"
                      defaultValue={existingScores[crit.id] ?? ''}
                      placeholder={`Enter score (0 - ${crit.max_score})`}
                      disabled={isLocked && session.role !== 'admin'}
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label htmlFor="comment" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Evaluator Comments & Qualitative Feedback
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  rows={4}
                  defaultValue={existingComment}
                  placeholder="Provide detailed feedback regarding technical implementation, innovation, and areas of improvement..."
                  disabled={isLocked && session.role !== 'admin'}
                  className="w-full bg-white text-slate-900 text-sm rounded-lg border border-slate-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:opacity-50 shadow-sm"
                />
              </div>

              {(!isLocked || session.role === 'admin') && (
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
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-sm transition"
                  >
                    🔒 Final Submit Scorecard
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
