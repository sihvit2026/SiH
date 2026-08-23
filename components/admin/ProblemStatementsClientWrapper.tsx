'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { createProblemStatement, updateProblemStatement, deleteProblemStatement } from '@/lib/actions/problemStatements';
import { ProblemStatementRow } from '@/lib/schemas';

export const ProblemStatementsClientWrapper: React.FC<{
  children: React.ReactNode;
  eventId: string;
}> = ({ children, eventId }) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const router = useRouter();

  // Form state
  const [statementCode, setStatementCode] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [theme, setTheme] = useState('');
  const [organization, setOrganization] = useState('');
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setStatementCode('');
    setTitle('');
    setCategory('');
    setTheme('');
    setOrganization('');
    setDescription('');
    setEditingId(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await createProblemStatement({
      event_id: eventId,
      statement_code: statementCode,
      title,
      category,
      theme,
      organization,
      description,
    });
    setIsSubmitting(false);

    if (res.success) {
      setIsAddOpen(false);
      resetForm();
    } else {
      alert(`Error: ${res.error}`);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setIsSubmitting(true);
    const res = await updateProblemStatement(editingId, {
      statement_code: statementCode,
      title,
      category,
      theme,
      organization,
      description,
    });
    setIsSubmitting(false);

    if (res.success) {
      setIsEditOpen(false);
      resetForm();
    } else {
      alert(`Error: ${res.error}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this problem statement?')) return;
    const res = await deleteProblemStatement(id);
    if (!res.success) {
      alert(`Error: ${res.error}`);
    }
  };

  // Expose methods to child components via window/event listener hack or React Context
  // For simplicity, since the wrapper wraps the table, we'll just intercept clicks via native JS on the table
  // but a better way is passing props. Since children is passed directly, we'll listen for a custom event.
  React.useEffect(() => {
    const handleEditEvent = (e: CustomEvent<ProblemStatementRow>) => {
      const ps = e.detail;
      setEditingId(ps.id);
      setStatementCode(ps.statement_code || '');
      setTitle(ps.title || '');
      setCategory(ps.category || '');
      setTheme(ps.theme || '');
      setOrganization(ps.organization || '');
      setDescription(ps.description || '');
      setIsEditOpen(true);
    };

    const handleDeleteEvent = (e: CustomEvent<string>) => {
      handleDelete(e.detail);
    };

    window.addEventListener('edit-ps', handleEditEvent as EventListener);
    window.addEventListener('delete-ps', handleDeleteEvent as EventListener);

    return () => {
      window.removeEventListener('edit-ps', handleEditEvent as EventListener);
      window.removeEventListener('delete-ps', handleDeleteEvent as EventListener);
    };
  }, []);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Problem Statements</h1>
          <p className="text-sm text-slate-500 mt-1">Manage problem statements and map them to SIH events</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={() => { resetForm(); setIsAddOpen(true); }}>
            + Add Problem Statement
          </Button>
        </div>
      </div>

      {children}

      {/* Add Modal */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Problem Statement"
        description="Create a new problem statement for this event."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Statement Code" placeholder="e.g. PS101" value={statementCode} onChange={(e) => setStatementCode(e.target.value)} required />
          <Input label="Title" placeholder="Problem Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input label="Category" placeholder="e.g. Software/Hardware" value={category} onChange={(e) => setCategory(e.target.value)} />
          <Input label="Theme" placeholder="e.g. Smart Automation" value={theme} onChange={(e) => setTheme(e.target.value)} />
          <Input label="Organization" placeholder="e.g. Ministry of Ayush" value={organization} onChange={(e) => setOrganization(e.target.value)} />
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea
              className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>Create</Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Modal */}
      <Dialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Problem Statement"
        description="Update details for the problem statement."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input label="Statement Code" placeholder="e.g. PS101" value={statementCode} onChange={(e) => setStatementCode(e.target.value)} required />
          <Input label="Title" placeholder="Problem Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input label="Category" placeholder="e.g. Software/Hardware" value={category} onChange={(e) => setCategory(e.target.value)} />
          <Input label="Theme" placeholder="e.g. Smart Automation" value={theme} onChange={(e) => setTheme(e.target.value)} />
          <Input label="Organization" placeholder="e.g. Ministry of Ayush" value={organization} onChange={(e) => setOrganization(e.target.value)} />
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea
              className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>Save Changes</Button>
          </div>
        </form>
      </Dialog>
    </>
  );
};
