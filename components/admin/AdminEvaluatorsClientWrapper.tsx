'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useRouter } from 'next/navigation';
import type { GeneratedCredential } from '@/lib/schemas';

export const AdminEvaluatorsClientWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const [name, setName] = useState('');
  const [role, setRole] = useState('evaluator');
  const [designation, setDesignation] = useState('');
  const [credential, setCredential] = useState<GeneratedCredential | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setCredential(null);

    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role, designation }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCredential(data.credential);
        router.refresh();
      } else {
        alert(data.error || 'Failed to create user.');
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

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Evaluator & Jury Roster</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage Round 1 evaluators and toggle Round 2 jury attendance (`round2_attendance = &apos;present&apos;`)
          </p>
        </div>
        <Button variant="accent" size="sm" onClick={() => setIsOpen(true)}>
          + Add Evaluator / Jury Member
        </Button>
      </div>

      {children}

      <Dialog
        isOpen={isOpen}
        onClose={resetAndClose}
        title="Add Evaluator / Jury Member"
        description="Create an internal account for a Round 1 Evaluator or Round 2 Jury member."
      >
        {!credential ? (
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="e.g. Dr. Ramesh Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Select
              label="Assigned Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={[
                { value: 'evaluator', label: 'Round 1 Evaluator' },
                { value: 'jury', label: 'Round 2 Jury Member' },
              ]}
            />
            <Input
              label="Designation / Department (Optional)"
              placeholder="e.g. Professor, Computer Science"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={resetAndClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                Create Account
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded bg-green-50 border border-green-200 space-y-3">
              <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Account Created Successfully!
              </div>
              <p className="text-xs text-green-800/80 pb-2 border-b border-green-200">
                Please copy the credentials below. The password is NOT stored and cannot be retrieved later.
              </p>
              <div className="grid grid-cols-[100px_1fr] gap-2 text-xs">
                <span className="text-slate-500 font-medium">Name:</span>
                <span className="text-slate-900 font-semibold">{credential.name}</span>
                
                <span className="text-slate-500 font-medium">Role:</span>
                <span className="text-slate-900 font-semibold uppercase">{credential.role}</span>
                
                <span className="text-slate-500 font-medium">Username:</span>
                <span className="text-slate-900 font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200">{credential.username}</span>
                
                <span className="text-slate-500 font-medium">Password:</span>
                <span className="text-slate-900 font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200">{credential.password}</span>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="button" variant="primary" size="sm" onClick={resetAndClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
};
