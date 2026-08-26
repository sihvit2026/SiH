'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { CsvImportModal } from '@/components/admin/CsvImportModal';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useRouter } from 'next/navigation';
import {
  createTeamWithMembers,
  updateTeamWithMembers,
  type TeamMemberInput,
} from '@/lib/actions/teams';

interface ProblemStatementOption {
  id: string;
  statement_code: string;
  title: string;
  description?: string | null;
  theme?: string | null;
  category?: string | null;
  organization?: string | null;
}

interface ExistingTeam {
  id: string;
  team_name: string;
  team_code: string;
  status: string;
  problem_statement_id?: string | null;
  students?: Array<{
    id: string;
    name: string;
    roll_number: string | null;
    email: string | null;
    is_leader: boolean;
  }>;
}

interface AdminTeamsClientWrapperProps {
  children: React.ReactNode;
  problemStatements: ProblemStatementOption[];
  teams: ExistingTeam[];
}

function emptyMembers(): TeamMemberInput[] {
  return Array.from({ length: 6 }, () => ({
    name: '',
    roll_number: '',
    email: '',
    is_leader: false,
  }));
}

function buildMembers(
  students?: ExistingTeam['students']
): TeamMemberInput[] {
  const result = emptyMembers();

  if (!students) {
    result[0].is_leader = true;
    return result;
  }

  students.slice(0, 6).forEach((student, index) => {
    result[index] = {
      id: student.id,
      name: student.name ?? '',
      roll_number: student.roll_number ?? '',
      email: student.email ?? '',
      is_leader: student.is_leader,
    };
  });

  if (!result.some((member) => member.is_leader)) {
    result[0].is_leader = true;
  }

  return result;
}

export const AdminTeamsClientWrapper: React.FC<
  AdminTeamsClientWrapperProps
> = ({
  children,
  problemStatements,
  teams,
}) => {
    const router = useRouter();

    const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
    const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [editingTeamId, setEditingTeamId] = useState<string | null>(null);

    const [teamName, setTeamName] = useState('');
    const [teamCode, setTeamCode] = useState('');
    const [status, setStatus] = useState('registered');
    const [problemStatementId, setProblemStatementId] = useState('');
    const [students, setStudents] = useState<TeamMemberInput[]>(
      emptyMembers()
    );

    const isEditing = Boolean(editingTeamId);

    const resetForm = () => {
      setEditingTeamId(null);
      setTeamName('');
      setTeamCode('');
      setStatus('registered');
      setProblemStatementId('');
      setStudents(emptyMembers());
    };

    const openCreate = () => {
      resetForm();

      const members = emptyMembers();
      members[0].is_leader = true;

      setStudents(members);
      setIsTeamDialogOpen(true);
    };

    const openEdit = (team: ExistingTeam) => {
      setEditingTeamId(team.id);
      setTeamName(team.team_name);
      setTeamCode(team.team_code);
      setStatus(team.status);
      setProblemStatementId(team.problem_statement_id ?? '');
      setStudents(buildMembers(team.students));
      setIsTeamDialogOpen(true);
    };

    const closeTeamDialog = () => {
      if (isSubmitting) return;

      setIsTeamDialogOpen(false);
      resetForm();
    };

    const updateStudent = (
      index: number,
      field: keyof TeamMemberInput,
      value: string | boolean
    ) => {
      setStudents((current) =>
        current.map((student, studentIndex) => {
          if (studentIndex !== index) {
            if (field === 'is_leader' && value === true) {
              return {
                ...student,
                is_leader: false,
              };
            }

            return student;
          }

          return {
            ...student,
            [field]: value,
          };
        })
      );
    };

    const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();

      if (!teamName.trim() || !teamCode.trim()) {
        alert('Team name and team code are required.');
        return;
      }

      const leaders = students.filter(
        (student) => student.is_leader
      );

      if (students.length !== 6) {
        alert('A team must have exactly 6 students.');
        return;
      }

      if (leaders.length !== 1) {
        alert('A team must have exactly 1 leader.');
        return;
      }

      setIsSubmitting(true);

      const payload = {
        team_name: teamName,
        team_code: teamCode,
        status,
        problem_statement_id: problemStatementId || null,
        students,
      };

      const result = isEditing
        ? await updateTeamWithMembers(editingTeamId!, payload)
        : await createTeamWithMembers(payload);

      setIsSubmitting(false);

      if (!result.success) {
        alert(result.error);
        return;
      }

      setIsTeamDialogOpen(false);
      resetForm();
      router.refresh();
    };

    const handleEditEvent = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      const team = teams.find((item) => item.id === customEvent.detail);

      if (team) {
        openEdit(team);
      }
    };

    useEffect(() => {
      window.addEventListener(
        'edit-team',
        handleEditEvent
      );

      return () => {
        window.removeEventListener(
          'edit-team',
          handleEditEvent
        );
      };
    }, [teams]);

    const selectedProblemStatement = problemStatements.find(
      (ps) => ps.id === problemStatementId
    );

    return (
      <>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              SIH Team Master Index
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Manage teams, six-member rosters, team leaders and problem
              statement assignments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCsvModalOpen(true)}
            >
              Import Excel/CSV
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={openCreate}
            >
              + Register New Team
            </Button>
          </div>
        </div>

        {children}

        <CsvImportModal
          isOpen={isCsvModalOpen}
          onClose={() => setIsCsvModalOpen(false)}
          onImportSuccess={() => {
            setIsCsvModalOpen(false);
            router.refresh();
          }}
        />

        <Dialog
          isOpen={isTeamDialogOpen}
          onClose={closeTeamDialog}
          title={isEditing ? 'Edit Team' : 'Register New SIH Team'}
          description={
            isEditing
              ? 'Update team details, members, leader and problem statement.'
              : 'Create a team with six students and assign its problem statement.'
          }
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Team details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="SIH Project / Team Code"
                placeholder="e.g. SIH2026-105"
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value)}
                required
              />

              <Input
                label="Group / Team Name"
                placeholder="e.g. CyberSentinel AI"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
              />
            </div>

            <Select
              label="Team Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                {
                  value: 'registered',
                  label: 'Registered',
                },
                {
                  value: 'round1_pending',
                  label: 'Round 1 Pending',
                },
                {
                  value: 'shortlisted',
                  label: 'Shortlisted for Round 2',
                },
                {
                  value: 'selected',
                  label: 'Selected',
                },
                {
                  value: 'standby',
                  label: 'Standby',
                },
              ]}
            />

            {/* Problem statement */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Problem Statement
              </label>

              <select
                value={problemStatementId}
                onChange={(e) =>
                  setProblemStatementId(e.target.value)
                }
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                <option value="">
                  Select Problem Statement
                </option>

                {problemStatements.map((ps) => (
                  <option key={ps.id} value={ps.id}>
                    {ps.statement_code} — {ps.title}
                  </option>
                ))}
              </select>

              {selectedProblemStatement && (
                <div className="rounded-md border border-blue-100 bg-blue-50 p-3">
                  <p className="text-xs font-semibold text-blue-900">
                    {selectedProblemStatement.statement_code}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {selectedProblemStatement.title}
                  </p>

                  {selectedProblemStatement.theme && (
                    <p className="mt-1 text-xs text-slate-600">
                      Theme: {selectedProblemStatement.theme}
                    </p>
                  )}

                  {selectedProblemStatement.category && (
                    <p className="text-xs text-slate-600">
                      Category: {selectedProblemStatement.category}
                    </p>
                  )}

                  {selectedProblemStatement.organization && (
                    <p className="text-xs text-slate-600">
                      Organization: {selectedProblemStatement.organization}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Members */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Team Members
                  </h3>

                  <p className="text-xs text-slate-500">
                    Exactly 6 students. Select exactly 1 leader.
                  </p>
                </div>

                <span className="text-xs font-semibold text-slate-500">
                  {students.length}/6
                </span>
              </div>

              <div className="space-y-3">
                {students.map((student, index) => (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-md p-3"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-500">
                        Member {index + 1}
                      </span>

                      <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                        <input
                          type="radio"
                          name="team-leader"
                          checked={student.is_leader}
                          onChange={() =>
                            updateStudent(
                              index,
                              'is_leader',
                              true
                            )
                          }
                        />

                        Team Leader
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Input
                        label="Name"
                        value={student.name}
                        onChange={(e) =>
                          updateStudent(
                            index,
                            'name',
                            e.target.value
                          )
                        }
                        required
                      />

                      <Input
                        label="Roll Number"
                        value={student.roll_number}
                        onChange={(e) =>
                          updateStudent(
                            index,
                            'roll_number',
                            e.target.value
                          )
                        }
                        required
                      />

                      <Input
                        label="Email"
                        type="email"
                        value={student.email}
                        onChange={(e) =>
                          updateStudent(
                            index,
                            'email',
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={closeTeamDialog}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
              >
                {isEditing ? 'Save Team Changes' : 'Create Team'}
              </Button>
            </div>
          </form>
        </Dialog>
      </>
    );
  };