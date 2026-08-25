'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useRouter } from 'next/navigation';
import type { CriterionRow } from '@/lib/schemas';
import {
    createCriterion,
    updateCriterion,
    deleteCriterion,
} from '@/lib/actions/criteria';

interface Props {
    children: React.ReactNode;
    criteria: CriterionRow[];
}

export const CriteriaClientWrapper: React.FC<Props> = ({
    children,
    criteria,
}) => {
    const router = useRouter();

    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [editingCriterion, setEditingCriterion] =
        useState<CriterionRow | null>(null);

    const [name, setName] = useState('');
    const [maxScore, setMaxScore] = useState('');
    const [weight, setWeight] = useState('1');
    const [round, setRound] = useState<'1' | '2'>('1');

    const isEditing = Boolean(editingCriterion);

    const resetForm = () => {
        setEditingCriterion(null);
        setName('');
        setMaxScore('');
        setWeight('1');
        setRound('1');
    };

    const openCreate = () => {
        resetForm();
        setIsOpen(true);
    };

    const openEdit = (criterion: CriterionRow) => {
        setEditingCriterion(criterion);
        setName(criterion.name);
        setMaxScore(String(criterion.max_score));
        setWeight(String(criterion.weight));
        setRound(criterion.round === 2 ? '2' : '1');
        setIsOpen(true);
    };

    const closeDialog = () => {
        if (isSubmitting) return;

        setIsOpen(false);
        resetForm();
    };

    const handleSubmit = async (
        event: React.FormEvent
    ) => {
        event.preventDefault();

        setIsSubmitting(true);

        const payload = {
            name,
            max_score: Number(maxScore),
            weight: Number(weight),
            round: Number(round) as 1 | 2,
        };

        const result = editingCriterion
            ? await updateCriterion(
                editingCriterion.id,
                payload
            )
            : await createCriterion(payload);

        setIsSubmitting(false);

        if (!result.success) {
            alert(result.error);
            return;
        }

        closeDialog();
        router.refresh();
    };

    const handleDelete = async (
        criterion: CriterionRow
    ) => {
        const confirmed = window.confirm(
            `Delete "${criterion.name}"?\n\nThis will only work if no scores have been submitted using this criterion.`
        );

        if (!confirmed) return;

        const result = await deleteCriterion(
            criterion.id
        );

        if (!result.success) {
            alert(result.error);
            return;
        }

        router.refresh();
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Evaluation Criteria & Rubrics
                    </h1>

                    <p className="text-sm text-slate-500 mt-1">
                        Configure the scoring criteria used by Round 1
                        evaluators and Round 2 jury members.
                    </p>
                </div>

                <Button
                    variant="primary"
                    size="sm"
                    onClick={openCreate}
                >
                    + Add Criterion
                </Button>
            </div>

            <div className="mt-4">
                {children}
            </div>

            <Dialog
                isOpen={isOpen}
                onClose={closeDialog}
                title={
                    isEditing
                        ? 'Edit Criterion'
                        : 'Add Criterion'
                }
                description={
                    isEditing
                        ? 'Update an evaluation criterion.'
                        : 'Create a criterion for Round 1 or Round 2.'
                }
            >
                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    <Input
                        label="Criterion Name"
                        placeholder="e.g. Technical Innovation"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                        required
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Maximum Score"
                            type="number"
                            min="0.5"
                            step="0.5"
                            placeholder="10"
                            value={maxScore}
                            onChange={(e) =>
                                setMaxScore(e.target.value)
                            }
                            required
                        />

                        <Input
                            label="Weight"
                            type="number"
                            min="0.1"
                            step="0.1"
                            placeholder="1"
                            value={weight}
                            onChange={(e) =>
                                setWeight(e.target.value)
                            }
                            required
                        />
                    </div>

                    <Select
                        label="Evaluation Round"
                        value={round}
                        onChange={(e) =>
                            setRound(
                                e.target.value as '1' | '2'
                            )
                        }
                        options={[
                            {
                                value: '1',
                                label: 'Round 1 Evaluator',
                            },
                            {
                                value: '2',
                                label: 'Round 2 Jury',
                            },
                        ]}
                    />

                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                        The criterion will immediately become available
                        on the corresponding evaluation scorecard.
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={closeDialog}
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
                            {isEditing
                                ? 'Save Changes'
                                : 'Create Criterion'}
                        </Button>
                    </div>
                </form>
            </Dialog>

            <CriterionActionsBridge
                criteria={criteria}
                onEdit={openEdit}
                onDelete={handleDelete}
            />
        </>
    );
};

function CriterionActionsBridge({
    criteria,
    onEdit,
    onDelete,
}: {
    criteria: CriterionRow[];
    onEdit: (criterion: CriterionRow) => void;
    onDelete: (criterion: CriterionRow) => void;
}) {
    React.useEffect(() => {
        const handleEdit = (event: Event) => {
            const customEvent =
                event as CustomEvent<string>;

            const criterion = criteria.find(
                (item) => item.id === customEvent.detail
            );

            if (criterion) {
                onEdit(criterion);
            }
        };

        const handleDelete = (event: Event) => {
            const customEvent =
                event as CustomEvent<string>;

            const criterion = criteria.find(
                (item) => item.id === customEvent.detail
            );

            if (criterion) {
                onDelete(criterion);
            }
        };

        window.addEventListener(
            'edit-criterion',
            handleEdit
        );

        window.addEventListener(
            'delete-criterion',
            handleDelete
        );

        return () => {
            window.removeEventListener(
                'edit-criterion',
                handleEdit
            );

            window.removeEventListener(
                'delete-criterion',
                handleDelete
            );
        };
    }, [criteria, onEdit, onDelete]);

    return null;
}