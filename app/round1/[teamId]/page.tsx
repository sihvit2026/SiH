import React from 'react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
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

  let teamDetails: { id: string; team_name: string; team_code: string; status: string; students?: StudentRow[] } | null = null;
  let criteriaList: CriterionRow[] = [];
  const existingScores: Record<string, number> = {};
  let existingComment = '';
  let isLocked = false;

  try {
    const supabase = await createClient();

    // Verify evaluator assignment or admin role
    if (session.role !== 'admin') {
      const { data: assignment } = await supabase
        .from('round1_assignments')
        .select('id')
        .eq('evaluator_id', session.user.id)
        .eq('team_id', teamId)
        .single();

      if (!assignment) {
        redirect('/round1');
      }
    }

    // Check lock status
    const { data: lock } = await supabase
      .from('evaluation_locks')
      .select('status')
      .eq('evaluator_id', session.user.id)
      .eq('team_id', teamId)
      .eq('round', 1)
      .single();

    if (lock && lock.status === 'locked') {
      isLocked = true;
    }

    const [{ data: team }, { data: criteria }, { data: scores }, { data: comments }] = await Promise.all([
      supabase.from('teams').select('*, students(*)').eq('id', teamId).single(),
      supabase.from('criteria').select('*').eq('round', 1),
      supabase.from('round1_scores').select('*').eq('team_id', teamId).eq('evaluator_id', session.user.id),
      supabase.from('round1_comments').select('*').eq('team_id', teamId).eq('evaluator_id', session.user.id).order('created_at', { ascending: false }).limit(1),
    ]);

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

  // Fallback demo state if database record not present
  if (!teamDetails) {
    teamDetails = {
      id: teamId,
      team_name: 'CyberGuard AI',
      team_code: 'SIH2026-001',
      status: 'round1_pending',
      students: [
        { id: 's1', name: 'Aarav Sharma', roll_number: '21BCE012', email: 'aarav@vit.ac.in' },
        { id: 's2', name: 'Ananya Verma', roll_number: '21BCE045', email: 'ananya@vit.ac.in' },
      ],
    };
  }

  if (criteriaList.length === 0) {
    criteriaList = [
      { id: 'c1', name: 'Innovation & Technical Feasibility', max_score: 25, weight: 1.0, round: 1 },
      { id: 'c2', name: 'Problem Statement Alignment', max_score: 25, weight: 1.0, round: 1 },
      { id: 'c3', name: 'Prototype / Proof of Concept', max_score: 25, weight: 1.0, round: 1 },
      { id: 'c4', name: 'Presentation & Communication', max_score: 25, weight: 1.0, round: 1 },
    ];
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
        <Link href="/round1" className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1">
          ← Back to Assigned Teams
        </Link>
        <div className="flex items-center gap-2">
          {isLocked && <Badge variant="rose" glow>🔒 SCORECARD LOCKED</Badge>}
          <Badge variant={teamDetails.status as 'shortlisted' | 'registered' | 'round1_pending' | 'selected' | 'standby'} glow>
            {teamDetails.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </div>

      {isLocked && (
        <div className="p-4 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs space-y-1">
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
            <span className="text-xs font-mono text-cyan-400 font-bold">{teamDetails.team_code}</span>
            <CardTitle>{teamDetails.team_name}</CardTitle>
            <CardDescription>Participating Team Profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-xs font-semibold uppercase text-slate-400 block mb-2">Student Roster:</span>
              <div className="space-y-2">
                {teamDetails.students && teamDetails.students.length > 0 ? (
                  teamDetails.students.map((student: StudentRow) => (
                    <div key={student.id} className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
                      <div className="font-semibold text-slate-200">{student.name}</div>
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

            <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-300 space-y-1">
              <span className="font-bold block">📌 Round 1 Security Policy</span>
              <p className="text-[11px] text-cyan-200/80">
                Your scores and comments are linked strictly to your evaluator ID in `round1_scores.evaluator_id` and `round1_comments.evaluator_id`.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right: Scoring Rubric Form */}
        <Card glowColor="cyan" className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-cyan-300">Round 1 Evaluation Rubric</CardTitle>
            <CardDescription>Enter scores per criterion out of maximum allowed points (Total Max: {totalMaxScore} pts)</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={submitRound1Scores} className="space-y-6">
              <input type="hidden" name="teamId" value={teamDetails.id} />

              <div className="space-y-4">
                {criteriaList.map((crit) => (
                  <div key={crit.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor={`score_${crit.id}`} className="text-sm font-bold text-slate-200">
                        {crit.name}
                      </label>
                      <span className="text-xs font-mono text-cyan-400">Max: {crit.max_score} pts</span>
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
                <label htmlFor="comment" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Evaluator Comments & Qualitative Feedback
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  rows={4}
                  defaultValue={existingComment}
                  placeholder="Provide detailed feedback regarding technical implementation, innovation, and areas of improvement..."
                  disabled={isLocked && session.role !== 'admin'}
                  className="w-full bg-slate-950/80 text-slate-100 text-sm rounded-lg border border-slate-800 p-3 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 focus:outline-none disabled:opacity-50"
                />
              </div>

              {(!isLocked || session.role === 'admin') && (
                <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="submit"
                    name="actionType"
                    value="draft"
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 transition"
                  >
                    💾 Save Draft
                  </button>
                  <button
                    type="submit"
                    name="actionType"
                    value="final"
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition"
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
