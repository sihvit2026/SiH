'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { CsvImportModal } from '@/components/admin/CsvImportModal';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useRouter } from 'next/navigation';

export const AdminTeamsClientWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const [teamName, setTeamName] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [status, setStatus] = useState('registered');

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/create-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_name: teamName, team_code: teamCode, status }),
      });

      if (res.ok) {
        setIsAddTeamOpen(false);
        setTeamName('');
        setTeamCode('');
        router.refresh();
      } else {
        alert('Failed to create team.');
      }
    } catch (err) {
      console.error('Create team error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">SIH Team Master Index</h1>
          <p className="text-sm text-slate-500 mt-1">View participating teams, SIH IDs, student members, and round statuses</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsCsvModalOpen(true)}>
            📥 Import Excel/CSV
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsAddTeamOpen(true)}>
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
        isOpen={isAddTeamOpen}
        onClose={() => setIsAddTeamOpen(false)}
        title="Register New SIH Team"
        description="Enter official team details and unique SIH project code"
      >
        <form onSubmit={handleCreateTeam} className="space-y-4">
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
          <Select
            label="Initial Stage Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: 'registered', label: 'Registered' },
              { value: 'round1_pending', label: 'Round 1 Pending' },
              { value: 'shortlisted', label: 'Shortlisted for Round 2' },
            ]}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddTeamOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Create Team
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
};
