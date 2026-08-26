'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import {
  createProblemStatement,
  updateProblemStatement,
  deleteProblemStatement,
  bulkImportProblemStatements,
} from '@/lib/actions/problemStatements';
import type { ProblemStatementRow } from '@/lib/schemas';

interface ProblemStatementCsvRow {
  statement_code: string;
  title: string;
  organization: string;
  category: string;
  theme: string;
}

interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  failed: number;
  errors: string[];
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (insideQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (char === ',' && !insideQuotes) {
      result.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  result.push(current.trim());

  return result;
}

function normalizeHeader(value: string): string {
  return value
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function parseCsv(text: string): {
  rows: ProblemStatementCsvRow[];
  errors: string[];
} {
  const lines = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    return {
      rows: [],
      errors: ['CSV must contain a header row and at least one data row.'],
    };
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);

  const psNumberIndex = headers.indexOf('ps number');
  const titleIndex = headers.indexOf('problem statement title');
  const organizationIndex = headers.indexOf('organization');
  const categoryIndex = headers.indexOf('category');
  const themeIndex = headers.indexOf('theme');

  const errors: string[] = [];

  if (psNumberIndex === -1) {
    errors.push('Missing CSV column: "PS Number".');
  }

  if (titleIndex === -1) {
    errors.push('Missing CSV column: "Problem Statement Title".');
  }

  if (organizationIndex === -1) {
    errors.push('Missing CSV column: "Organization".');
  }

  if (categoryIndex === -1) {
    errors.push('Missing CSV column: "Category".');
  }

  if (themeIndex === -1) {
    errors.push('Missing CSV column: "Theme".');
  }

  if (errors.length > 0) {
    return { rows: [], errors };
  }

  const rows: ProblemStatementCsvRow[] = [];
  const seenCodes = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const lineNumber = i + 1;
    const values = parseCsvLine(lines[i]);

    const statementCode = values[psNumberIndex]?.trim() ?? '';
    const title = values[titleIndex]?.trim() ?? '';
    const organization = values[organizationIndex]?.trim() ?? '';
    const category = values[categoryIndex]?.trim() ?? '';
    const theme = values[themeIndex]?.trim() ?? '';

    if (!statementCode && !title) {
      continue;
    }

    if (!statementCode) {
      errors.push(`Row ${lineNumber}: PS Number is missing.`);
      continue;
    }

    if (!title) {
      errors.push(`Row ${lineNumber}: Problem Statement Title is missing.`);
      continue;
    }

    const normalizedCode = statementCode.toLowerCase();

    if (seenCodes.has(normalizedCode)) {
      errors.push(
        `Row ${lineNumber}: Duplicate PS Number "${statementCode}" in CSV.`
      );
      continue;
    }

    seenCodes.add(normalizedCode);

    rows.push({
      statement_code: statementCode,
      title,
      organization,
      category,
      theme,
    });
  }

  return { rows, errors };
}

export const ProblemStatementsClientWrapper: React.FC<{
  children: React.ReactNode;
  eventId: string;
}> = ({ children, eventId }) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [statementCode, setStatementCode] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [theme, setTheme] = useState('');
  const [organization, setOrganization] = useState('');
  const [description, setDescription] = useState('');

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvRows, setCsvRows] = useState<ProblemStatementCsvRow[]>([]);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const resetForm = () => {
    setStatementCode('');
    setTitle('');
    setCategory('');
    setTheme('');
    setOrganization('');
    setDescription('');
    setEditingId(null);
  };

  const closeAddModal = () => {
    setIsAddOpen(false);
    resetForm();
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    resetForm();
  };

  const resetImport = () => {
    setCsvFile(null);
    setCsvRows([]);
    setCsvErrors([]);
    setImportResult(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const closeImportModal = () => {
    setIsImportOpen(false);
    resetImport();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!statementCode.trim() || !title.trim()) {
      return;
    }

    setIsSubmitting(true);

    const res = await createProblemStatement({
      event_id: eventId,
      statement_code: statementCode.trim(),
      title: title.trim(),
      category: category.trim(),
      theme: theme.trim(),
      organization: organization.trim(),
      description: description.trim(),
    });

    setIsSubmitting(false);

    if (res.success) {
      closeAddModal();
      router.refresh();
    } else {
      alert(`Error: ${res.error}`);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingId) return;

    if (!statementCode.trim() || !title.trim()) {
      return;
    }

    setIsSubmitting(true);

    const res = await updateProblemStatement(editingId, {
      statement_code: statementCode.trim(),
      title: title.trim(),
      category: category.trim(),
      theme: theme.trim(),
      organization: organization.trim(),
      description: description.trim(),
    });

    setIsSubmitting(false);

    if (res.success) {
      closeEditModal();
      router.refresh();
    } else {
      alert(`Error: ${res.error}`);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this problem statement?'
    );

    if (!confirmed) return;

    const res = await deleteProblemStatement(id);

    if (!res.success) {
      alert(`Error: ${res.error}`);
      return;
    }

    router.refresh();
  };

  const openEdit = (ps: ProblemStatementRow) => {
    setEditingId(ps.id);
    setStatementCode(ps.statement_code || '');
    setTitle(ps.title || '');
    setCategory(ps.category || '');
    setTheme(ps.theme || '');
    setOrganization(ps.organization || '');
    setDescription(ps.description || '');
    setIsEditOpen(true);
  };

  const handleCsvChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setCsvFile(file);
    setCsvRows([]);
    setCsvErrors([]);
    setImportResult(null);

    try {
      const text = await file.text();
      const parsed = parseCsv(text);

      setCsvRows(parsed.rows);
      setCsvErrors(parsed.errors);
    } catch (error) {
      setCsvRows([]);
      setCsvErrors([
        error instanceof Error
          ? error.message
          : 'Failed to read the CSV file.',
      ]);
    }
  };

  const handleImport = async () => {
    if (!eventId) {
      alert('No active event is selected.');
      return;
    }

    if (csvRows.length === 0) {
      alert('There are no valid rows available to import.');
      return;
    }

    setIsImporting(true);

    const result = await bulkImportProblemStatements({
      event_id: eventId,
      rows: csvRows,
    });

    setIsImporting(false);
    setImportResult(result);

    if (result.success) {
      router.refresh();
    }
  };

  useEffect(() => {
    const handleEditEvent = (event: Event) => {
      const customEvent = event as CustomEvent<ProblemStatementRow>;
      openEdit(customEvent.detail);
    };

    const handleDeleteEvent = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      void handleDelete(customEvent.detail);
    };

    window.addEventListener('edit-ps', handleEditEvent);
    window.addEventListener('delete-ps', handleDeleteEvent);

    return () => {
      window.removeEventListener('edit-ps', handleEditEvent);
      window.removeEventListener('delete-ps', handleDeleteEvent);
    };
  }, []);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Problem Statements
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Manage problem statements for the selected SIH event.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              resetImport();
              setIsImportOpen(true);
            }}
          >
            Import CSV
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              resetForm();
              setIsAddOpen(true);
            }}
          >
            + Add Problem Statement
          </Button>
        </div>
      </div>

      {children}

      {/* ADD */}
      <Dialog
        isOpen={isAddOpen}
        onClose={closeAddModal}
        title="Add Problem Statement"
        description="Create a new problem statement for this event."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="PS Number"
            placeholder="e.g. SIH25001"
            value={statementCode}
            onChange={(e) => setStatementCode(e.target.value)}
            required
          />

          <Input
            label="Problem Statement"
            placeholder="Enter problem statement title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Input
            label="Organization"
            placeholder="e.g. Ministry of Education"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
          />

          <Input
            label="Category"
            placeholder="e.g. Software"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <Input
            label="Theme"
            placeholder="e.g. Smart Education"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          />

          <div className="space-y-1">
            <label
              htmlFor="problem-description"
              className="text-sm font-medium text-slate-700"
            >
              Description
            </label>

            <textarea
              id="problem-description"
              className="w-full rounded-md border border-slate-300 p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows={5}
              placeholder="Add the detailed problem statement description."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={closeAddModal}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              Create
            </Button>
          </div>
        </form>
      </Dialog>

      {/* EDIT */}
      <Dialog
        isOpen={isEditOpen}
        onClose={closeEditModal}
        title="Edit Problem Statement"
        description="Update the problem statement details."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="PS Number"
            placeholder="e.g. SIH25001"
            value={statementCode}
            onChange={(e) => setStatementCode(e.target.value)}
            required
          />

          <Input
            label="Problem Statement"
            placeholder="Enter problem statement title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Input
            label="Organization"
            placeholder="e.g. Ministry of Education"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
          />

          <Input
            label="Category"
            placeholder="e.g. Software"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <Input
            label="Theme"
            placeholder="e.g. Smart Education"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          />

          <div className="space-y-1">
            <label
              htmlFor="edit-problem-description"
              className="text-sm font-medium text-slate-700"
            >
              Description
            </label>

            <textarea
              id="edit-problem-description"
              className="w-full rounded-md border border-slate-300 p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows={5}
              placeholder="Add the detailed problem statement description."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={closeEditModal}
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

      {/* CSV IMPORT */}
      <Dialog
        isOpen={isImportOpen}
        onClose={closeImportModal}
        title="Import Problem Statements"
        description="Upload the SIH problem statement CSV for the selected event."
      >
        <div className="space-y-5">

          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-800">
              CSV columns used
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-600">
              PS Number, Problem Statement Title, Organization, Category, Theme
            </p>

            <p className="mt-2 text-xs text-slate-500">
              S.No., Submitted Idea(s) Count and Deadline for Idea Submission
              are ignored.
            </p>
          </div>

          <div>
            <label
              htmlFor="problem-statement-csv"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              CSV File
            </label>

            <input
              ref={fileInputRef}
              id="problem-statement-csv"
              type="file"
              accept=".csv,text/csv"
              onChange={handleCsvChange}
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-900 hover:file:bg-blue-100"
            />

            {csvFile && (
              <p className="mt-2 text-xs text-slate-500">
                Selected: {csvFile.name}
              </p>
            )}
          </div>

          {csvErrors.length > 0 && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-800">
                Validation Errors
              </p>

              <ul className="mt-2 space-y-1 text-xs text-red-700">
                {csvErrors.slice(0, 20).map((error, index) => (
                  <li key={`${error}-${index}`}>• {error}</li>
                ))}
              </ul>

              {csvErrors.length > 20 && (
                <p className="mt-2 text-xs text-red-600">
                  And {csvErrors.length - 20} more errors.
                </p>
              )}
            </div>
          )}

          {csvRows.length > 0 && (
            <div className="rounded-md border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">
                  Preview
                </p>

                <span className="text-xs text-slate-500">
                  {csvRows.length} valid rows
                </span>
              </div>

              <div className="mt-3 max-h-64 overflow-auto border border-slate-100">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2 font-semibold">PS Number</th>
                      <th className="px-3 py-2 font-semibold">
                        Problem Statement
                      </th>
                      <th className="px-3 py-2 font-semibold">
                        Organization
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {csvRows.slice(0, 20).map((row, index) => (
                      <tr
                        key={`${row.statement_code}-${index}`}
                        className="border-b border-slate-100"
                      >
                        <td className="px-3 py-2 font-mono text-blue-700">
                          {row.statement_code}
                        </td>

                        <td className="px-3 py-2 text-slate-700">
                          {row.title}
                        </td>

                        <td className="px-3 py-2 text-slate-600">
                          {row.organization || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {csvRows.length > 20 && (
                <p className="mt-2 text-xs text-slate-500">
                  Showing first 20 rows of {csvRows.length}.
                </p>
              )}
            </div>
          )}

          {importResult && (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-800">
                Import Result
              </p>

              <div className="mt-3 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[11px] uppercase text-slate-500">
                    Imported
                  </p>
                  <p className="text-lg font-bold text-emerald-700">
                    {importResult.imported}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] uppercase text-slate-500">
                    Skipped
                  </p>
                  <p className="text-lg font-bold text-amber-700">
                    {importResult.skipped}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] uppercase text-slate-500">
                    Failed
                  </p>
                  <p className="text-lg font-bold text-red-700">
                    {importResult.failed}
                  </p>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <ul className="mt-3 space-y-1 text-xs text-red-700">
                  {importResult.errors.slice(0, 20).map((error, index) => (
                    <li key={`${error}-${index}`}>• {error}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={closeImportModal}
            >
              Close
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isImporting}
              disabled={csvRows.length === 0}
              onClick={handleImport}
            >
              Import {csvRows.length > 0 ? `${csvRows.length} Rows` : 'CSV'}
            </Button>
          </div>

        </div>
      </Dialog>
    </>
  );
};