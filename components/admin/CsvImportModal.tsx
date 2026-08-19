'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { TableContainer, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: () => void;
}

interface ParsedRow {
  team_name: string;
  team_code: string;
  student_name: string;
  roll_number: string;
  email: string;
  isValid: boolean;
  error?: string;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSummary, setImportSummary] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setImportSummary(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCsvText(text);
    };
    reader.readAsText(selectedFile);
  };

  const parseCsvText = (text: string) => {
    const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) {
      setParsedRows([]);
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const rows: ParsedRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim());
      if (cols.length < 2) continue;

      const team_name = cols[0] || '';
      const team_code = cols[1] || '';
      const student_name = cols[2] || '';
      const roll_number = cols[3] || '';
      const email = cols[4] || '';

      const isValid = Boolean(team_name && team_code);
      const error = !isValid ? 'Missing mandatory Team Name or SIH Code' : undefined;

      rows.push({
        team_name,
        team_code,
        student_name,
        roll_number,
        email,
        isValid,
        error,
      });
    }

    setParsedRows(rows);
  };

  const handleConfirmImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) return;

    setIsProcessing(true);
    try {
      // Send rows to server action API
      const res = await fetch('/api/admin/import-teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: validRows }),
      });

      if (res.ok) {
        setImportSummary(`Successfully imported ${validRows.length} team records!`);
        if (onImportSuccess) onImportSuccess();
      } else {
        const data = await res.json();
        setImportSummary(`Import failed: ${data.error || 'Server error'}`);
      }
    } catch (err: any) {
      setImportSummary(`Import failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Team & Student CSV Import"
      description="Upload an Excel/CSV file with headers: team_name, team_code, student_name, roll_number, email"
      size="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleConfirmImport}
            disabled={parsedRows.length === 0 || isProcessing}
            isLoading={isProcessing}
          >
            Confirm Import ({parsedRows.filter((r) => r.isValid).length} Valid)
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Select CSV File:
          </label>
          <input
            type="file"
            accept=".csv, .txt"
            onChange={handleFileChange}
            className="text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-950 file:text-cyan-300 hover:file:bg-cyan-900"
          />
        </div>

        {importSummary && (
          <div className="p-3 rounded-lg bg-cyan-950 border border-cyan-500/40 text-xs font-medium text-cyan-300">
            {importSummary}
          </div>
        )}

        {parsedRows.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300">
              CSV Preview & Validation ({parsedRows.length} Rows Detected):
            </span>
            <TableContainer className="max-h-60 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SIH Code</TableHead>
                    <TableHead>Team Name</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Roll No.</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedRows.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono text-xs text-cyan-400">{row.team_code}</TableCell>
                      <TableCell className="font-semibold text-slate-200">{row.team_name}</TableCell>
                      <TableCell className="text-xs text-slate-300">{row.student_name || '—'}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-400">{row.roll_number || '—'}</TableCell>
                      <TableCell>
                        {row.isValid ? (
                          <span className="text-xs font-bold text-emerald-400">✓ Valid</span>
                        ) : (
                          <span className="text-xs font-bold text-rose-400">{row.error}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}
      </div>
    </Dialog>
  );
};
