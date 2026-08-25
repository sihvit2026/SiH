'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import {
  TableContainer,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/Table';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: () => void;
}

interface ParsedRow {
  team_name: string;
  team_code: string;
  problem_statement_code: string;
  student_name: string;
  roll_number: string;
  email: string;
  is_leader: boolean;
  isValid: boolean;
  error?: string;
}

function normalizeHeader(value: string): string {
  return value
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"';
        i += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (char === ',' && !insideQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());

  return values;
}

function parseLeader(value: string): boolean {
  const normalized = value.trim().toLowerCase();

  return [
    'true',
    'yes',
    'y',
    '1',
    'leader',
    'team leader',
  ].includes(normalized);
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSummary, setImportSummary] = useState<string | null>(null);

  const resetState = () => {
    setParsedRows([]);
    setImportSummary(null);
  };

  const handleClose = () => {
    if (isProcessing) return;

    resetState();
    onClose();
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    setImportSummary(null);

    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result;

      if (typeof text !== 'string') {
        setParsedRows([]);
        setImportSummary('Could not read the selected file.');
        return;
      }

      parseCsvText(text);
    };

    reader.onerror = () => {
      setParsedRows([]);
      setImportSummary('Could not read the selected file.');
    };

    reader.readAsText(selectedFile);
  };

  const parseCsvText = (text: string) => {
    const lines = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .split('\n')
      .filter((line) => line.trim().length > 0);

    if (lines.length <= 1) {
      setParsedRows([]);
      setImportSummary('The CSV contains no data rows.');
      return;
    }

    const headers = parseCsvLine(lines[0]).map(normalizeHeader);

    const findHeader = (...names: string[]) => {
      for (const name of names) {
        const index = headers.indexOf(name);
        if (index !== -1) return index;
      }

      return -1;
    };

    const teamNameIndex = findHeader(
      'team_name',
      'team name',
      'group / team name',
      'team'
    );

    const teamCodeIndex = findHeader(
      'team_code',
      'team code',
      'sih code',
      'sih project / team code',
      'project code'
    );

    const psIndex = findHeader(
      'ps number',
      'problem statement',
      'problem statement id',
      'problem statement code',
      'ps code'
    );

    const studentNameIndex = findHeader(
      'student_name',
      'student name',
      'member name',
      'name'
    );

    const rollNumberIndex = findHeader(
      'roll_number',
      'roll number',
      'roll no',
      'roll no.'
    );

    const emailIndex = findHeader(
      'email',
      'student email',
      'email id'
    );

    const leaderIndex = findHeader(
      'is_leader',
      'is leader',
      'leader',
      'team leader'
    );

    const missingColumns: string[] = [];

    if (teamNameIndex === -1) {
      missingColumns.push('Team Name');
    }

    if (teamCodeIndex === -1) {
      missingColumns.push('Team Code / SIH Code');
    }

    if (psIndex === -1) {
      missingColumns.push('PS Number');
    }

    if (studentNameIndex === -1) {
      missingColumns.push('Student Name');
    }

    if (rollNumberIndex === -1) {
      missingColumns.push('Roll Number');
    }

    if (emailIndex === -1) {
      missingColumns.push('Email');
    }

    if (leaderIndex === -1) {
      missingColumns.push('Leader / is_leader');
    }

    if (missingColumns.length > 0) {
      setParsedRows([]);
      setImportSummary(
        `Missing required CSV columns: ${missingColumns.join(', ')}`
      );
      return;
    }

    const rows: ParsedRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const lineNumber = i + 1;
      const cols = parseCsvLine(lines[i]);

      const team_name = cols[teamNameIndex]?.trim() ?? '';
      const team_code = cols[teamCodeIndex]?.trim() ?? '';
      const problem_statement_code =
        cols[psIndex]?.trim() ?? '';
      const student_name =
        cols[studentNameIndex]?.trim() ?? '';
      const roll_number =
        cols[rollNumberIndex]?.trim() ?? '';
      const email = cols[emailIndex]?.trim() ?? '';
      const is_leader = parseLeader(
        cols[leaderIndex] ?? ''
      );

      let error: string | undefined;

      if (!team_name) {
        error = 'Missing team name.';
      } else if (!team_code) {
        error = 'Missing team code.';
      } else if (!problem_statement_code) {
        error = 'Missing PS Number.';
      } else if (!student_name) {
        error = 'Missing student name.';
      } else if (!roll_number) {
        error = 'Missing roll number.';
      } else if (!email) {
        error = 'Missing email.';
      }

      rows.push({
        team_name,
        team_code,
        problem_statement_code,
        student_name,
        roll_number,
        email,
        is_leader,
        isValid: !error,
        error,
      });

      if (!error && !email.includes('@')) {
        rows[rows.length - 1].isValid = false;
        rows[rows.length - 1].error =
          'Invalid email address.';
      }

      if (!error && !is_leader) {
        // This is allowed because non-leaders are expected.
        // Team-level validation below ensures exactly one leader.
      }

      void lineNumber;
    }

    /*
     * Validate each team as a group.
     */
    const teams = new Map<string, ParsedRow[]>();

    for (const row of rows) {
      const key = row.team_code.toLowerCase();

      const existing = teams.get(key) ?? [];
      existing.push(row);
      teams.set(key, existing);
    }

    for (const [teamCode, teamRows] of teams.entries()) {
      const invalidRows = teamRows.filter(
        (row) => !row.isValid
      );

      if (invalidRows.length > 0) {
        continue;
      }

      if (teamRows.length !== 6) {
        const message = `Team ${teamCode}: expected exactly 6 students, found ${teamRows.length}.`;

        teamRows.forEach((row) => {
          row.isValid = false;
          row.error = message;
        });

        continue;
      }

      const leaders = teamRows.filter(
        (row) => row.is_leader
      );

      if (leaders.length !== 1) {
        const message = `Team ${teamCode}: expected exactly 1 leader, found ${leaders.length}.`;

        teamRows.forEach((row) => {
          row.isValid = false;
          row.error = message;
        });

        continue;
      }

      const problemStatementCodes = new Set(
        teamRows.map((row) =>
          row.problem_statement_code.toLowerCase()
        )
      );

      if (problemStatementCodes.size !== 1) {
        const message = `Team ${teamCode}: all 6 students must use the same PS Number.`;

        teamRows.forEach((row) => {
          row.isValid = false;
          row.error = message;
        });
      }
    }

    setParsedRows(rows);
  };

  const handleConfirmImport = async () => {
    const validRows = parsedRows.filter(
      (row) => row.isValid
    );

    if (validRows.length === 0) {
      setImportSummary(
        'There are no valid team rows available for import.'
      );
      return;
    }

    setIsProcessing(true);
    setImportSummary(null);

    try {
      const res = await fetch(
        '/api/admin/import-teams',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rows: validRows,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setImportSummary(
          `Import failed: ${data.error || 'Server error'
          }`
        );
        return;
      }

      setImportSummary(
        `Successfully imported ${data.importedTeams ?? 0} teams and ${data.importedStudents ?? 0
        } students.`
      );

      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (error) {
      setImportSummary(
        `Import failed: ${error instanceof Error
          ? error.message
          : 'Unknown error'
        }`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const validCount = parsedRows.filter(
    (row) => row.isValid
  ).length;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Bulk Team & Student CSV Import"
      description="Required columns: team_name, team_code, ps_number, student_name, roll_number, email, is_leader"
      size="lg"
      footer={
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleConfirmImport}
            disabled={
              parsedRows.length === 0 ||
              validCount === 0 ||
              isProcessing
            }
            isLoading={isProcessing}
          >
            Confirm Import
          </Button>
        </>
      }
    >
      <div className="space-y-4">

        <div className="rounded-md bg-slate-50 border border-slate-200 p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Required CSV Format
          </p>

          <p className="text-xs text-slate-600">
            One row per student. Each team must contain exactly
            6 students and exactly 1 leader.
          </p>

          <code className="block text-[11px] text-slate-700 whitespace-normal">
            team_name, team_code, ps_number, student_name,
            roll_number, email, is_leader
          </code>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
            Select CSV File
          </label>

          <input
            type="file"
            accept=".csv,.txt"
            onChange={handleFileChange}
            className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {importSummary && (
          <div className="p-3 rounded border border-blue-200 bg-blue-50 text-xs font-medium text-blue-800">
            {importSummary}
          </div>
        )}

        {parsedRows.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                CSV Preview ({parsedRows.length} rows)
              </span>

              <span className="text-xs text-slate-500">
                {validCount} valid
              </span>
            </div>

            <TableContainer className="max-h-72 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SIH Code</TableHead>
                    <TableHead>PS Number</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Leader</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {parsedRows.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-xs text-blue-600">
                        {row.team_code}
                      </TableCell>

                      <TableCell className="font-mono text-xs text-blue-700">
                        {row.problem_statement_code}
                      </TableCell>

                      <TableCell className="text-xs text-slate-700">
                        {row.student_name}
                      </TableCell>

                      <TableCell className="text-xs">
                        {row.is_leader ? (
                          <span className="font-semibold text-blue-800">
                            Yes
                          </span>
                        ) : (
                          'No'
                        )}
                      </TableCell>

                      <TableCell>
                        {row.isValid ? (
                          <span className="text-xs font-bold text-emerald-600">
                            ✓ Valid
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-rose-600">
                            {row.error}
                          </span>
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