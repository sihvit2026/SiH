'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { TableContainer, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import type { AuditLogRow } from '@/lib/schemas';

interface AuditClientWrapperProps {
  initialLogs: AuditLogRow[];
}

export const AuditClientWrapper: React.FC<AuditClientWrapperProps> = ({ initialLogs }) => {
  const [filterOperation, setFilterOperation] = useState('ALL');
  const [searchTable, setSearchTable] = useState('');

  // Extract unique operations for the dropdown (from the loaded set)
  const operations = Array.from(new Set(initialLogs.map(log => log.operation)));

  // Filter logs based on selection
  const filteredLogs = initialLogs.filter((log) => {
    const matchOp = filterOperation === 'ALL' || log.operation === filterOperation;
    const matchTable = log.table_name.toLowerCase().includes(searchTable.toLowerCase());
    return matchOp && matchTable;
  });

  return (
    <div className="space-y-4">
      {initialLogs.length > 0 && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-end">
          <div className="w-full sm:w-1/3">
            <Input
              label="Search by Table Name"
              placeholder="e.g. round1_scores"
              value={searchTable}
              onChange={(e) => setSearchTable(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-1/4">
            <Select
              label="Filter by Operation"
              value={filterOperation}
              onChange={(e) => setFilterOperation(e.target.value)}
              options={[
                { label: 'All Operations', value: 'ALL' },
                ...operations.map(op => ({ label: op, value: op }))
              ]}
            />
          </div>
        </div>
      )}

      {filteredLogs.length === 0 ? (
        <EmptyState
          title="No Audit Records Found"
          description={initialLogs.length === 0 ? "The audit log is currently empty." : "No records match your filters."}
          icon="🛡️"
        />
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Operation</TableHead>
                <TableHead>Target Table</TableHead>
                <TableHead>Performed By (UID)</TableHead>
                <TableHead>Value Payload Snapshot</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs text-slate-500">
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={log.operation === 'INSERT' ? 'cyan' : log.operation === 'UPDATE' ? 'purple' : 'amber'}>
                      {log.operation}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-slate-900 text-xs">
                    {log.table_name}
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-blue-600 max-w-[150px] truncate" title={log.performed_by || 'System / Service Role'}>
                    {log.performed_by || 'System / Service Role'}
                  </TableCell>
                  <TableCell>
                    <div className="max-h-32 overflow-y-auto">
                      <pre className="text-[10px] font-mono text-slate-600 bg-slate-50 p-2 rounded border border-slate-200 overflow-x-auto whitespace-pre-wrap break-all">
                        {JSON.stringify(log.new_value || log.old_value, null, 2)}
                      </pre>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};
