import React from 'react';
import { Shell } from '@/components/layout/Shell';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/auth';
import { AssignmentsClientWrapper } from '@/components/admin/AssignmentsClientWrapper';
<<<<<<< HEAD
import { Pagination } from '@/components/ui/Pagination';

export const dynamic = 'force-dynamic';

import { adminNavItems } from '@/lib/nav';

export default async function AdminAssignmentsPage({ searchParams }: { searchParams: Promise<{ page?: string; tab?: string }> }) {
=======

export const dynamic = 'force-dynamic';

const adminNavItems = [
  { label: 'Dashboard', href: '/admin', icon: '📊' },
  { label: 'Teams & Members', href: '/admin/teams', icon: '👥' },
  { label: 'Problem Statements', href: '/admin/problem-statements', icon: '📋' },
  { label: 'Evaluators & Jury', href: '/admin/evaluators', icon: '🎓' },
  { label: 'Criteria Builder', href: '/admin/criteria', icon: '🎯' },
  {
    label: 'Round 1 / Round 2 Mapping',
    href: '/admin/assignments',
    icon: '📌',
  },
  { label: 'Audit Trail', href: '/admin/audit', icon: '🛡️' },
  { label: 'Merit & Reports', href: '/reports', icon: '🏆' },
];

export default async function AdminAssignmentsPage() {
>>>>>>> 52fc6d6b1d321253741e9249f27c7a76ea218d59
  const session = await requireAuth([
    'admin',
    'data_operator',
  ]);

<<<<<<< HEAD
  const resolvedParams = await searchParams;
  const pageStr = resolvedParams?.page || '1';
  const page = parseInt(pageStr, 10) || 1;
  const tabParam = resolvedParams?.tab || 'round1';
  const tab: 'round1' | 'round2' = tabParam === 'round2' ? 'round2' : 'round1';
  const PAGE_SIZE = 50;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

=======
>>>>>>> 52fc6d6b1d321253741e9249f27c7a76ea218d59
  const supabase = createAdminClient();

  let teams: {
    id: string;
    team_code: string;
    team_name: string;
    status: string;
  }[] = [];

  let evaluators: {
    id: string;
    name: string;
    role: 'evaluator' | 'jury';
  }[] = [];

  let round1Assignments: {
    id: string;
    team_id: string;
    evaluator_id: string;
    assigned_at?: string;
    teams?: {
      team_code: string;
      team_name: string;
      status?: string;
    } | null;
    evaluators?: {
      name: string;
      role: string;
    } | null;
  }[] = [];

  let round2Assignments: {
    id: string;
    team_id: string;
    jury_id: string;
    assigned_at?: string;
    teams?: {
      team_code: string;
      team_name: string;
      status?: string;
    } | null;
    evaluators?: {
      name: string;
      role: string;
    } | null;
  }[] = [];

<<<<<<< HEAD
  let totalRound1 = 0;
  let totalRound2 = 0;

=======
>>>>>>> 52fc6d6b1d321253741e9249f27c7a76ea218d59
  try {
    const [
      { data: fetchedTeams, error: teamError },
      { data: fetchedEvaluators, error: evaluatorError },
<<<<<<< HEAD
=======
      {
        data: fetchedRound1,
        error: round1Error,
      },
      {
        data: fetchedRound2,
        error: round2Error,
      },
>>>>>>> 52fc6d6b1d321253741e9249f27c7a76ea218d59
    ] = await Promise.all([
      supabase
        .from('teams')
        .select(
          'id, team_code, team_name, status'
        )
        .order('team_code', {
          ascending: true,
        }),

      supabase
        .from('evaluators')
        .select('id, name, role')
        .order('name', {
          ascending: true,
        }),
<<<<<<< HEAD
=======

      supabase
        .from('round1_assignments')
        .select(
          'id, team_id, evaluator_id, assigned_at, teams(team_code, team_name, status), evaluators(name, role)'
        )
        .order('assigned_at', {
          ascending: false,
        }),

      supabase
        .from('round2_assignments')
        .select(
          'id, team_id, jury_id, assigned_at, teams(team_code, team_name, status), evaluators(name, role)'
        )
        .order('assigned_at', {
          ascending: false,
        }),
>>>>>>> 52fc6d6b1d321253741e9249f27c7a76ea218d59
    ]);

    if (teamError) {
      console.error(
        'Failed to fetch teams:',
        teamError
      );
    } else if (fetchedTeams) {
      teams = fetchedTeams;
    }

    if (evaluatorError) {
      console.error(
        'Failed to fetch evaluators:',
        evaluatorError
      );
    } else if (fetchedEvaluators) {
      evaluators = fetchedEvaluators as {
        id: string;
        name: string;
        role: 'evaluator' | 'jury';
      }[];
    }

<<<<<<< HEAD
    // Fetch assignments with pagination based on active tab
    if (tab === 'round1') {
      const { data: fetchedRound1, error: round1Error, count } = await supabase
        .from('round1_assignments')
        .select(
          'id, team_id, evaluator_id, assigned_at, teams(team_code, team_name, status), evaluators(name, role)',
          { count: 'exact' }
        )
        .order('assigned_at', {
          ascending: false,
        })
        .range(from, to);

      if (round1Error) {
        console.error(
          'Failed to fetch Round 1 assignments:',
          round1Error
        );
      } else if (fetchedRound1) {
        round1Assignments = fetchedRound1 as typeof round1Assignments;
        totalRound1 = count || fetchedRound1.length || 0;
      }
    } else {
      const { data: fetchedRound2, error: round2Error, count } = await supabase
        .from('round2_assignments')
        .select(
          'id, team_id, jury_id, assigned_at, teams(team_code, team_name, status), evaluators(name, role)',
          { count: 'exact' }
        )
        .order('assigned_at', {
          ascending: false,
        })
        .range(from, to);

      if (round2Error) {
        console.error(
          'Failed to fetch Round 2 assignments:',
          round2Error
        );
      } else if (fetchedRound2) {
        round2Assignments = fetchedRound2 as typeof round2Assignments;
        totalRound2 = count || fetchedRound2.length || 0;
      }
=======
    if (round1Error) {
      console.error(
        'Failed to fetch Round 1 assignments:',
        round1Error
      );
    } else if (fetchedRound1) {
      round1Assignments = fetchedRound1 as typeof round1Assignments;
    }

    if (round2Error) {
      console.error(
        'Failed to fetch Round 2 assignments:',
        round2Error
      );
    } else if (fetchedRound2) {
      round2Assignments = fetchedRound2 as typeof round2Assignments;
>>>>>>> 52fc6d6b1d321253741e9249f27c7a76ea218d59
    }
  } catch (error) {
    console.error(
      'Failed to load mapping data:',
      error
    );
  }

  return (
    <Shell
      title="Round 1 / Round 2 Mapping"
      roleName={
        session.role === 'admin'
          ? 'SIH Super Admin'
          : 'Data Operator'
      }
      roleType="admin"
      userName={session.name}
      navItems={adminNavItems}
    >
      <AssignmentsClientWrapper
        teams={teams}
        evaluators={evaluators}
        round1Assignments={round1Assignments}
        round2Assignments={round2Assignments}
<<<<<<< HEAD
        activeTab={tab}
        pagination={{
          currentPage: page,
          totalCount: tab === 'round1' ? totalRound1 : totalRound2,
          pageSize: PAGE_SIZE,
          baseUrl: '/admin/assignments',
          tab,
        }}
=======
>>>>>>> 52fc6d6b1d321253741e9249f27c7a76ea218d59
      />
    </Shell>
  );
}