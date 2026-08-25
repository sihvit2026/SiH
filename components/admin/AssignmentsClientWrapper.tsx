'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Select } from '@/components/ui/Select';
import { useRouter } from 'next/navigation';
import {
    assignEvaluatorToTeam,
    unassignEvaluatorFromTeam,
    assignJuryToTeam,
    unassignJuryFromTeam,
} from '@/lib/actions/assignments';

interface TeamOption {
    id: string;
    team_code: string;
    team_name: string;
    status: string;
}

interface PersonOption {
    id: string;
    name: string;
    role: 'evaluator' | 'jury';
}

interface AssignmentItem {
    id: string;
    team_id: string;
    evaluator_id?: string;
    jury_id?: string;
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
}

interface Props {
    teams: TeamOption[];
    evaluators: PersonOption[];
    round1Assignments: AssignmentItem[];
    round2Assignments: AssignmentItem[];
}

type MappingTab = 'round1' | 'round2';

export const AssignmentsClientWrapper: React.FC<Props> = ({
    teams,
    evaluators,
    round1Assignments,
    round2Assignments,
}) => {
    const router = useRouter();

    const [activeTab, setActiveTab] =
        useState<MappingTab>('round1');

    const [isOpen, setIsOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [selectedPerson, setSelectedPerson] =
        useState('');
    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const round1Evaluators = useMemo(
        () =>
            evaluators.filter(
                (person) => person.role === 'evaluator'
            ),
        [evaluators]
    );

    const round2Jury = useMemo(
        () =>
            evaluators.filter(
                (person) => person.role === 'jury'
            ),
        [evaluators]
    );

    const round2Teams = useMemo(
        () =>
            teams.filter(
                (team) => team.status === 'shortlisted'
            ),
        [teams]
    );

    const openMappingDialog = () => {
        setSelectedTeam('');
        setSelectedPerson('');
        setIsOpen(true);
    };

    const closeMappingDialog = () => {
        if (isSubmitting) return;

        setIsOpen(false);
        setSelectedTeam('');
        setSelectedPerson('');
    };

    const handleAssign = async (
        event: React.FormEvent
    ) => {
        event.preventDefault();

        if (!selectedTeam || !selectedPerson) {
            alert(
                activeTab === 'round1'
                    ? 'Select both a team and an evaluator.'
                    : 'Select both a shortlisted team and a jury member.'
            );
            return;
        }

        setIsSubmitting(true);

        const result =
            activeTab === 'round1'
                ? await assignEvaluatorToTeam(
                    selectedPerson,
                    selectedTeam
                )
                : await assignJuryToTeam(
                    selectedPerson,
                    selectedTeam
                );

        setIsSubmitting(false);

        if (!result.success) {
            alert(result.error);
            return;
        }

        closeMappingDialog();
        router.refresh();
    };

    const handleUnassignRound1 = async (
        assignment: AssignmentItem
    ) => {
        const teamName =
            assignment.teams?.team_name || 'this team';

        const evaluatorName =
            assignment.evaluators?.name ||
            'this evaluator';

        const confirmed = window.confirm(
            `Remove ${evaluatorName} from ${teamName} for Round 1?`
        );

        if (!confirmed) return;

        const result =
            await unassignEvaluatorFromTeam(
                assignment.id
            );

        if (!result.success) {
            alert(result.error);
            return;
        }

        router.refresh();
    };

    const handleUnassignRound2 = async (
        assignment: AssignmentItem
    ) => {
        const teamName =
            assignment.teams?.team_name || 'this team';

        const juryName =
            assignment.evaluators?.name ||
            'this jury member';

        const confirmed = window.confirm(
            `Remove ${juryName} from ${teamName} for Round 2?`
        );

        if (!confirmed) return;

        const result =
            await unassignJuryFromTeam(
                assignment.id
            );

        if (!result.success) {
            alert(result.error);
            return;
        }

        router.refresh();
    };

    const mappingTeams =
        activeTab === 'round1'
            ? teams
            : round2Teams;

    const mappingPeople =
        activeTab === 'round1'
            ? round1Evaluators
            : round2Jury;

    const currentAssignments =
        activeTab === 'round1'
            ? round1Assignments
            : round2Assignments;

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Round 1 / Round 2 Mapping
                    </h1>

                    <p className="text-sm text-slate-500 mt-1">
                        Assign evaluators in Round 1 and jury members to
                        shortlisted teams in Round 2.
                    </p>
                </div>

                <Button
                    variant="primary"
                    size="sm"
                    onClick={openMappingDialog}
                >
                    {activeTab === 'round1'
                        ? '+ Map Evaluator to Team'
                        : '+ Map Jury to Team'}
                </Button>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <div className="flex gap-6">
                    <button
                        type="button"
                        onClick={() =>
                            setActiveTab('round1')
                        }
                        className={`border-b-2 px-1 pb-3 text-sm font-semibold transition-colors ${activeTab === 'round1'
                                ? 'border-blue-600 text-blue-700'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        Round 1 Mapping
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setActiveTab('round2')
                        }
                        className={`border-b-2 px-1 pb-3 text-sm font-semibold transition-colors ${activeTab === 'round2'
                                ? 'border-purple-600 text-purple-700'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        Round 2 Mapping
                    </button>
                </div>
            </div>

            {/* Status information */}
            {activeTab === 'round1' ? (
                <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                    <p className="text-xs font-semibold text-blue-900">
                        Round 1
                    </p>

                    <p className="mt-1 text-xs text-blue-700">
                        Assign Round 1 evaluators to participating teams.
                        Assigned teams will appear in the evaluator's
                        Round 1 workspace.
                    </p>
                </div>
            ) : (
                <div className="rounded-lg border border-purple-100 bg-purple-50 px-4 py-3">
                    <p className="text-xs font-semibold text-purple-900">
                        Round 2
                    </p>

                    <p className="mt-1 text-xs text-purple-700">
                        Only shortlisted teams can be assigned to Round 2
                        jury members. Assigned teams will appear in the
                        jury's Round 2 workspace.
                    </p>
                </div>
            )}

            {/* Assignments table */}
            {currentAssignments.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
                    <div className="text-2xl">
                        {activeTab === 'round1'
                            ? '📌'
                            : '⚖️'}
                    </div>

                    <h3 className="mt-2 text-sm font-semibold text-slate-900">
                        No {activeTab === 'round1'
                            ? 'Round 1'
                            : 'Round 2'} assignments yet
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                        Use the mapping button above to create the first
                        assignment.
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Team Code
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Team Name
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        {activeTab === 'round1'
                                            ? 'Evaluator'
                                            : 'Jury Member'}
                                    </th>

                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {currentAssignments.map(
                                    (assignment) => (
                                        <tr
                                            key={assignment.id}
                                            className="hover:bg-slate-50/70"
                                        >
                                            <td className="px-4 py-3 font-mono text-xs font-bold text-blue-600">
                                                {assignment.teams?.team_code ||
                                                    '—'}
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-slate-900">
                                                    {assignment.teams?.team_name ||
                                                        '—'}
                                                </div>

                                                {activeTab === 'round2' && (
                                                    <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-purple-600">
                                                        Shortlisted
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`h-2 w-2 rounded-full ${activeTab === 'round1'
                                                                ? 'bg-blue-600'
                                                                : 'bg-purple-600'
                                                            }`}
                                                    />

                                                    <span className="font-medium text-slate-700">
                                                        {assignment.evaluators
                                                            ?.name || '—'}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 text-right">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    onClick={() =>
                                                        activeTab === 'round1'
                                                            ? handleUnassignRound1(
                                                                assignment
                                                            )
                                                            : handleUnassignRound2(
                                                                assignment
                                                            )
                                                    }
                                                >
                                                    Unassign
                                                </Button>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Mapping dialog */}
            <Dialog
                isOpen={isOpen}
                onClose={closeMappingDialog}
                title={
                    activeTab === 'round1'
                        ? 'Map Evaluator to Team'
                        : 'Map Jury to Team'
                }
                description={
                    activeTab === 'round1'
                        ? 'Select a participating team and a Round 1 evaluator.'
                        : 'Select a shortlisted team and a Round 2 jury member.'
                }
            >
                <form
                    onSubmit={handleAssign}
                    className="space-y-4"
                >
                    <Select
                        label={
                            activeTab === 'round1'
                                ? 'Team'
                                : 'Shortlisted Team'
                        }
                        value={selectedTeam}
                        onChange={(event) =>
                            setSelectedTeam(event.target.value)
                        }
                        options={[
                            {
                                value: '',
                                label:
                                    activeTab === 'round1'
                                        ? 'Select Team'
                                        : 'Select Shortlisted Team',
                            },
                            ...mappingTeams.map((team) => ({
                                value: team.id,
                                label: `${team.team_code} — ${team.team_name}`,
                            })),
                        ]}
                    />

                    <Select
                        label={
                            activeTab === 'round1'
                                ? 'Round 1 Evaluator'
                                : 'Round 2 Jury Member'
                        }
                        value={selectedPerson}
                        onChange={(event) =>
                            setSelectedPerson(
                                event.target.value
                            )
                        }
                        options={[
                            {
                                value: '',
                                label:
                                    activeTab === 'round1'
                                        ? 'Select Evaluator'
                                        : 'Select Jury Member',
                            },
                            ...mappingPeople.map((person) => ({
                                value: person.id,
                                label: person.name,
                            })),
                        ]}
                    />

                    <div
                        className={`rounded-lg border p-3 ${activeTab === 'round1'
                                ? 'border-blue-100 bg-blue-50'
                                : 'border-purple-100 bg-purple-50'
                            }`}
                    >
                        <p
                            className={`text-xs ${activeTab === 'round1'
                                    ? 'text-blue-800'
                                    : 'text-purple-800'
                                }`}
                        >
                            {activeTab === 'round1'
                                ? 'The evaluator will see this team and its assigned problem statement in the Round 1 workspace.'
                                : 'The jury member will see this shortlisted team and its assigned problem statement in the Round 2 workspace.'}
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={closeMappingDialog}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            isLoading={isSubmitting}
                        >
                            {activeTab === 'round1'
                                ? 'Assign Evaluator'
                                : 'Assign Jury'}
                        </Button>
                    </div>
                </form>
            </Dialog>
        </div>
    );
};