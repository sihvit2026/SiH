'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { ProblemStatementRow } from '@/lib/schemas';

export const ProblemStatementRowActions: React.FC<{ ps: ProblemStatementRow }> = ({ ps }) => {
  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const event = new CustomEvent('edit-ps', { detail: ps });
          window.dispatchEvent(event);
        }}
      >
        Edit
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={() => {
          const event = new CustomEvent('delete-ps', { detail: ps.id });
          window.dispatchEvent(event);
        }}
      >
        Delete
      </Button>
    </div>
  );
};
