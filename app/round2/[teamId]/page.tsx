import React from 'react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { CriterionRow, StudentRow, ScoreRow, CommentRow } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

const juryNavItems = [
  { label: 'Shortlisted Teams', href: '/round2', icon: '⚖️' },
  { label: 'Jury Rules', href: '#', icon: '📖' },
];

async function submitRound2JuryScores(formData: FormData) {
  'use server';
  const session = await requireAuth(['jury', 'admin']);
  const teamId = formData.get('teamId') as string;
  const commentText = formData.get('comment') as string;
  const isFinalSubmit = formData.get('actionType') === 'final';

  try {
    const supabase = await createClient();

    // Check attendance status
    const { data: evaluator } = await supabase
      .from('evaluators')
      .select('round2_attendance')
      .eq('id', session.user.id)
      .single();

    if (evaluator?.round2_attendance !== 'present' && session.role !== 'admin') {
      throw new Error('Jury attendance is absent. Round 2 submission locked.');
    }

    // Check lock status
    const { data: lock } = await supabase
      .from('evaluation_locks')
      .select('status')
      .eq('evaluator_id', session.user.id)
      .eq('team_id', teamId)
      .eq('round', 2)
      .single();

    if (lock && lock.status === 'locked' && session.role !== 'admin') {
      throw new Error('Jury scorecard is locked.');
    }

    // Fetch Round 2 criteria
    const { data: criteria } = await supabase
      .from('criteria')
      .select('id')
      .eq('round', 2);

    if (criteria) {
      for (const crit of criteria) {
        const scoreVal = parseFloat(formData.get(`score_${crit.id}`) as string || '0');
        await supabase
          .from('round2_scores')
          .upsert({
            jury_id: session.user.id, // STRIKING RULE: Always jury_id for Round 2
            team_id: teamId,
            criteria_id: crit.id,
            score: scoreVal,
          }, { onConflict: 'team_id, jury_id, criteria_id' });
      }
    }

    if (commentText) {
      await supabase
        .from('round2_comments')
        .insert({
          jury_id: session.user.id, // STRIKING RULE: Always jury_id for Round 2
          team_id: teamId,
          comment: commentText,
        });
    }

    if (isFinalSubmit) {
      await supabase
        .from('evaluation_locks')
        .upsert({
          evaluator_id: session.user.id,
          team_id: teamId,
          round: 2,
          status: 'locked',
        }, { onConflict: 'evaluator_id, team_id, round' });
    }

    revalidatePath(`/round2/${teamId}`);
  } catch (err) {
    console.error('Failed to submit Round 2 jury scores:', err);
  }
}

export default async function Round2JuryEvaluationFormPage({ params }: { params: Promise<{ teamId: string }> }) {
  const session = await requireAuth(['jury', 'admin']);
  const resolvedParams = await params;
  const teamId = resolvedParams.teamId;

  let teamDetails: { id: string; team_name: string; team_code: string; status: string; students?: StudentRow[] } | null = null;
  let criteriaList: CriterionRow[] = [];
  const existingScores: Record<string, number> = {};
  let existingComment = '';
  const isAttendancePresent = session.round2Attendance === 'present' || session.role === 'admin';
  let isLocked = false;

  try {
    const supabase = await createClient();

    // Fire all queries in parallel — lock check and all data fetches run simultaneously.
    const [
      { data: lock },
      { data: team },
      { data: criteria },
      { data: scores },
      { data: comments },
    ] = await Promise.all([
      supabase.from('evaluation_locks').select('status').eq('evaluator_id', session.user.id).eq('team_id', teamId).eq('round', 2).single(),
      supabase.from('teams').select('*, students(*)').eq('id', teamId).single(),
      supabase.from('criteria').select('*').eq('round', 2),
      supabase.from('round2_scores').select('*').eq('team_id', teamId).eq('jury_id', session.user.id),
      supabase.from('round2_comments').select('*').eq('team_id', teamId).eq('jury_id', session.user.id).order('created_at', { ascending: false }).limit(1),
    ]);

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
    console.error('Error fetching Round 2 evaluation details:', err);
  }

  // If team is not found or no criteria are setup, return 404
  if (!teamDetails || criteriaList.length === 0) {
    notFound();
  }

  const totalMaxScore = criteriaList.reduce((acc, curr) => acc + Number(curr.max_score), 0);

  return (
    <Shell
      title={`Jury Evaluation: ${teamDetails.team_name}`}
      roleName="Round 2 Jury"
      roleType="jury"
      userName={session.name}
      navItems={juryNavItems}
    >
      <div className="flex items-center justify-between">
        <Link href="/round2" className="text-xs text-purple-700 hover:text-purple-800 font-semibold flex items-center gap-1">
          ← Back to Shortlisted Teams
        </Link>
        <div className="flex items-center gap-2">
          {isLocked && <Badge variant="rose">🔒 SCORECARD LOCKED</Badge>}
          <Badge variant="shortlisted">
            SHORTLISTED FOR ROUND 2
          </Badge>
        </div>
      </div>

      {!isAttendancePresent && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs space-y-1">
          <span className="font-bold block">🔴 Jury Attendance Absent</span>
          <p>
            Your attendance status is currently marked as `absent`. You cannot enter or submit scores until the administrator updates your attendance to `present`.
          </p>
        </div>
      )}

      {isLocked && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs space-y-1">
          <span className="font-bold block">🔒 Scorecard Locked</span>
          <p>
            Your jury score for this team has been submitted and locked. Contact an administrator if changes are required.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Team Info */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <span className="text-xs font-mono text-purple-700 font-bold">{teamDetails.team_code}</span>
            <CardTitle>{teamDetails.team_name}</CardTitle>
            <CardDescription>Shortlisted Finalist Team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-xs font-semibold uppercase text-slate-500 block mb-2">Student Members:</span>
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

            <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 text-xs text-purple-700 space-y-1">
              <span className="font-bold block">⚖️ Round 2 Jury Schema Contract</span>
              <p className="text-[11px] text-purple-600">
                Scores and comments use `round2_scores.jury_id` and `round2_comments.jury_id` strictly, and enforce `round2_attendance = &apos;present&apos;`.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right: Jury Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-slate-900">Round 2 Jury Scorecard</CardTitle>
            <CardDescription>Enter final jury scores (Total Max: {totalMaxScore} pts)</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={submitRound2JuryScores} className="space-y-6">
              <input type="hidden" name="teamId" value={teamDetails.id} />

              <div className="space-y-4">
                {criteriaList.map((crit) => (
                  <div key={crit.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor={`score_${crit.id}`} className="text-sm font-bold text-slate-900">
                        {crit.name}
                      </label>
                      <span className="text-xs font-mono text-purple-700">Max: {crit.max_score} pts</span>
                    </div>
                    <Input
                      id={`score_${crit.id}`}
                      name={`score_${crit.id}`}
                      type="number"
                      min="0"
                      max={crit.max_score}
                      step="0.5"
                      defaultValue={existingScores[crit.id] ?? ''}
                      placeholder={`Enter jury score (0 - ${crit.max_score})`}
                      disabled={!isAttendancePresent || (isLocked && session.role !== 'admin')}
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label htmlFor="comment" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Jury Deliberation & Recommendations
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  rows={4}
                  defaultValue={existingComment}
                  placeholder="Record final jury notes, prototype evaluation observations, and award recommendations..."
                  disabled={!isAttendancePresent || (isLocked && session.role !== 'admin')}
                  className="w-full bg-white text-slate-900 text-sm rounded-lg border border-slate-300 p-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none disabled:opacity-50 shadow-sm"
                />
              </div>

              {isAttendancePresent && (!isLocked || session.role === 'admin') && (
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
