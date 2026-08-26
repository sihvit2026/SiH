'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useRouter } from 'next/navigation';
import type {
  EvaluatorRow,
  GeneratedCredential,
} from '@/lib/schemas';
import {
  updateEvaluator,
  deleteEvaluator,
} from '@/lib/actions/evaluators';

interface AdminEvaluatorsClientWrapperProps {
  children: React.ReactNode;
  evaluators: EvaluatorRow[];
}

export const AdminEvaluatorsClientWrapper: React.FC<
  AdminEvaluatorsClientWrapperProps
> = ({ children, evaluators }) => {
  const router = useRouter();

  // Create dialog
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [role, setRole] = useState('evaluator');
  const [designation, setDesignation] = useState('');
  const [credential, setCredential] =
    useState<GeneratedCredential | null>(null);

  // Edit dialog
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingEvaluator, setEditingEvaluator] =
    useState<EvaluatorRow | null>(null);

  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] =
    useState<'evaluator' | 'jury'>('evaluator');

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(
    null
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setCredential(null);

    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          role,
          designation,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCredential(data.credential);
        router.refresh();
      } else {
        alert(
          data.error || 'Failed to create user.'
        );
      }
    } catch (err) {
      console.error('Create user error:', err);
      alert('An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setIsOpen(false);
    setName('');
    setRole('evaluator');
    setDesignation('');
    setCredential(null);
  };

  const openEdit = (person: EvaluatorRow) => {
    setEditingEvaluator(person);
    setEditName(person.name);
    setEditRole(person.role);
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    if (isSubmitting) return;

    setIsEditOpen(false);
    setEditingEvaluator(null);
    setEditName('');
    setEditRole('evaluator');
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingEvaluator) return;

    if (!editName.trim()) {
      alert('Name is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateEvaluator(
        editingEvaluator.id,
        {
          name: editName,
          role: editRole,
        }
      );

      if (!result.success) {
        alert(result.error);
        return;
      }

      closeEdit();
      router.refresh();
    } catch (error) {
      console.error('Edit evaluator error:', error);
      alert('Failed to update evaluator.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (
    person: EvaluatorRow
  ) => {
    const confirmed = window.confirm(
      `Delete "${person.name}"?\n\n` +
      `This is only allowed when the user has no submitted scores and no active Round 1 assignments.`
    );

    if (!confirmed) return;

    setDeletingId(person.id);

    try {
      const result = await deleteEvaluator(
        person.id
      );

      if (!result.success) {
        alert(result.error);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(
        'Delete evaluator error:',
        error
      );
      alert('Failed to delete evaluator.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {/* Page heading + create button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Evaluator & Jury Roster
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Manage Round 1 evaluators, Round 2 jury members,
            attendance, and account details.
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={() => setIsOpen(true)}
        >
          + Add Evaluator / Jury Member
        </Button>
      </div>

      {children}

      {/* Existing evaluator/jury list actions are exposed through
          custom events from the server-rendered page. */}
      <div className="hidden">
        {evaluators.length}
      </div>

      {/* Create dialog */}
      <Dialog
        isOpen={isOpen}
        onClose={resetAndClose}
        title="Add Evaluator / Jury Member"
        description="Create an internal account for a Round 1 Evaluator or Round 2 Jury member."
      >
        {!credential ? (
          <form
            onSubmit={handleCreate}
            className="space-y-4"
          >
            <Input
              label="Full Name"
              placeholder="e.g. Dr. Ramesh Kumar"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
            />

            <Select
              label="Assigned Role"
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
              }
              options={[
                {
                  value: 'evaluator',
                  label: 'Round 1 Evaluator',
                },
                {
                  value: 'jury',
                  label: 'Round 2 Jury Member',
                },
              ]}
            />

            <Input
              label="Designation / Department (Optional)"
              placeholder="e.g. Professor, Computer Science"
              value={designation}
              onChange={(e) =>
                setDesignation(e.target.value)
              }
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetAndClose}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
              >
                Create Account
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded bg-green-50 border border-green-200 space-y-3">
              <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>

                Account Created Successfully!
              </div>

              <p className="text-xs text-green-800/80 pb-2 border-b border-green-200">
                Please copy the credentials below. The
                password is NOT stored and cannot be
                retrieved later.
              </p>

              <div className="grid grid-cols-[100px_1fr] gap-2 text-xs">
                <span className="text-slate-500 font-medium">
                  Name:
                </span>

                <span className="text-slate-900 font-semibold">
                  {credential.name}
                </span>

                <span className="text-slate-500 font-medium">
                  Role:
                </span>

                <span className="text-slate-900 font-semibold uppercase">
                  {credential.role}
                </span>

                <span className="text-slate-500 font-medium">
                  Username:
                </span>

                <span className="text-slate-900 font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                  {credential.username}
                </span>

                <span className="text-slate-500 font-medium">
                  Password:
                </span>

                <span className="text-slate-900 font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                  {credential.password}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={resetAndClose}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Edit dialog */}
      <Dialog
        isOpen={isEditOpen}
        onClose={closeEdit}
        title="Edit Evaluator / Jury"
        description="Update the person's name or assigned role."
      >
        <form
          onSubmit={handleEdit}
          className="space-y-4"
        >
          <Input
            label="Full Name"
            value={editName}
            onChange={(e) =>
              setEditName(e.target.value)
            }
            required
          />

          <Select
            label="Role"
            value={editRole}
            onChange={(e) =>
              setEditRole(
                e.target.value as
                | 'evaluator'
                | 'jury'
              )
            }
            options={[
              {
                value: 'evaluator',
                label: 'Round 1 Evaluator',
              },
              {
                value: 'jury',
                label: 'Round 2 Jury Member',
              },
            ]}
          />

          {editingEvaluator &&
            editingEvaluator.role !==
            editRole && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                Changing a user&apos;s role can affect their
                existing permissions and assignments.
                Only do this before evaluation activity
                has started.
              </div>
            )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={closeEdit}
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
              Save Changes
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Hidden event bridge:
          the server page dispatches edit-evaluator/delete-evaluator
          events from row action buttons. */}
      <EvaluatorActionBridge
        evaluators={evaluators}
        onEdit={openEdit}
        onDelete={handleDelete}
      />
    </>
  );
};

function EvaluatorActionBridge({
  evaluators,
  onEdit,
  onDelete,
}: {
  evaluators: EvaluatorRow[];
  onEdit: (person: EvaluatorRow) => void;
  onDelete: (person: EvaluatorRow) => void;
}) {
  React.useEffect(() => {
    const handleEdit = (event: Event) => {
      const customEvent =
        event as CustomEvent<string>;

      const person = evaluators.find(
        (item) => item.id === customEvent.detail
      );

      if (person) {
        onEdit(person);
      }
    };

    const handleDelete = (event: Event) => {
      const customEvent =
        event as CustomEvent<string>;

      const person = evaluators.find(
        (item) => item.id === customEvent.detail
      );

      if (person) {
        onDelete(person);
      }
    };

    window.addEventListener(
      'edit-evaluator',
      handleEdit
    );

    window.addEventListener(
      'delete-evaluator',
      handleDelete
    );

    return () => {
      window.removeEventListener(
        'edit-evaluator',
        handleEdit
      );

      window.removeEventListener(
        'delete-evaluator',
        handleDelete
      );
    };
  }, [evaluators, onEdit, onDelete]);

  return null;
}