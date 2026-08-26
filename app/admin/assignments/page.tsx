import React from 'react';
import { Shell } from '@/components/layout/Shell';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/auth';
import { AssignmentsClientWrapper } from '@/components/admin/AssignmentsClientWrapper';
import { Pagination } from '@/components/ui/Pagination';

export const dynamic = 'force-dynamic';

import { adminNavItems } from '@/lib/nav';

export default async function AdminAssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tab?: string }>;
}) {
  const session = await requireAuth([
    'admin',
    'data_operator',
  ]);

  const resolvedParams = await searchParams;
  const pageStr = resolvedParams?.page || '1';
  const page = parseInt(pageStr, 10) || 1;
  const tabParam = resolvedParams?.tab || 'round1';
  const tab: 'round1' | 'round2' =
    tabParam === 'round2' ? 'round2' : 'round1';

  const PAGE_SIZE = 50;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

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

  let totalRound1 = 0;
  let totalRound2 = 0;

  try {
    const [
      { data: fetchedTeams, error: teamError },
      { data: fetchedEvaluators, error: evaluatorError },
    ] = await Promise.all([
      supabase
        .from('teams')
        .select('id, team_code, team_name, status')
        .order('team_code', {
          ascending: true,
        }),

      supabase
        .from('evaluators')
        .select('id, name, role')
        .order('name', {
          ascending: true,
        }),
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

    // Fetch only the active tab with pagination
    if (tab === 'round1') {
      const {
        data: fetchedRound1,
        error: round1Error,
        count,
      } = await supabase
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
        round1Assignments =
          fetchedRound1 as typeof round1Assignments;
        totalRound1 = count || fetchedRound1.length || 0;
      }
    } else {
      const {
        data: fetchedRound2,
        error: round2Error,
        count,
      } = await supabase
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
        round2Assignments =
          fetchedRound2 as typeof round2Assignments;
        totalRound2 = count || fetchedRound2.length || 0;
      }
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
        activeTab={tab}
        pagination={{
          currentPage: page,
          totalCount:
            tab === 'round1' ? totalRound1 : totalRound2,
          pageSize: PAGE_SIZE,
          baseUrl: '/admin/assignments',
          tab,
        }}
      />
    </Shell>
  );
}