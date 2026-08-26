'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

type ProblemStatementInput = {
  event_id: string;
  statement_code: string;
  title: string;
  category?: string;
  theme?: string;
  organization?: string;
  description?: string;
};

type ProblemStatementUpdate = {
  statement_code: string;
  title: string;
  category?: string;
  theme?: string;
  organization?: string;
  description?: string;
};

export interface BulkProblemStatementRow {
  statement_code: string;
  title: string;
  organization?: string;
  category?: string;
  theme?: string;
}

export interface BulkProblemStatementResult {
  success: boolean;
  imported: number;
  skipped: number;
  failed: number;
  errors: string[];
}

/**
 * Fetch problem statements for an event.
 */
export async function fetchProblemStatements(eventId: string) {
  try {
    await requireAuth(['admin', 'data_operator']);

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('problem_statements')
<<<<<<< HEAD
      .select('id, event_id, statement_code, title, category, theme, organization, description, created_at, updated_at')
=======
      .select('*')
>>>>>>> 52fc6d6b1d321253741e9249f27c7a76ea218d59
      .eq('event_id', eventId)
      .order('statement_code', { ascending: true });

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: data ?? [],
    };
  } catch (error) {
    console.error('fetchProblemStatements error:', error);

    return {
      success: false,
      data: [],
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch problem statements.',
    };
  }
}

/**
 * Create a problem statement.
 */
export async function createProblemStatement(
  data: ProblemStatementInput
) {
  try {
    await requireAuth(['admin', 'data_operator']);

    const supabase = createAdminClient();

    const { data: newRow, error } = await supabase
      .from('problem_statements')
      .insert({
        event_id: data.event_id,
        statement_code: data.statement_code.trim(),
        title: data.title.trim(),
        category: data.category?.trim() || null,
        theme: data.theme?.trim() || null,
        organization: data.organization?.trim() || null,
        description: data.description?.trim() || null,
      })
<<<<<<< HEAD
      .select('id, event_id, statement_code, title, category, theme, organization, description, created_at, updated_at')
=======
      .select('*')
>>>>>>> 52fc6d6b1d321253741e9249f27c7a76ea218d59
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error(
          `Problem Statement with code ${data.statement_code} already exists for this event.`
        );
      }

      throw error;
    }

    revalidatePath('/admin/problem-statements');

    return {
      success: true,
      data: newRow,
    };
  } catch (error) {
    console.error('createProblemStatement error:', error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to create problem statement.',
    };
  }
}

/**
 * Update a problem statement.
 */
export async function updateProblemStatement(
  id: string,
  data: ProblemStatementUpdate
) {
  try {
    await requireAuth(['admin', 'data_operator']);

    const supabase = createAdminClient();

    const { data: updatedRow, error } = await supabase
      .from('problem_statements')
      .update({
        statement_code: data.statement_code.trim(),
        title: data.title.trim(),
        category: data.category?.trim() || null,
        theme: data.theme?.trim() || null,
        organization: data.organization?.trim() || null,
        description: data.description?.trim() || null,
      })
      .eq('id', id)
<<<<<<< HEAD
      .select('id, event_id, statement_code, title, category, theme, organization, description, created_at, updated_at')
=======
      .select('*')
>>>>>>> 52fc6d6b1d321253741e9249f27c7a76ea218d59
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error(
          `Problem Statement with code ${data.statement_code} already exists.`
        );
      }

      throw error;
    }

    revalidatePath('/admin/problem-statements');

    return {
      success: true,
      data: updatedRow,
    };
  } catch (error) {
    console.error('updateProblemStatement error:', error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update problem statement.',
    };
  }
}

/**
 * Delete a problem statement.
 */
export async function deleteProblemStatement(id: string) {
  try {
    await requireAuth(['admin']);

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('problem_statements')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    revalidatePath('/admin/problem-statements');

    return {
      success: true,
    };
  } catch (error) {
    console.error('deleteProblemStatement error:', error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to delete problem statement.',
    };
  }
}

/**
 * Bulk import problem statements for an event.
 *
 * Expected CSV mapping:
 * PS Number                -> statement_code
 * Problem Statement Title  -> title
 * Organization             -> organization
 * Category                 -> category
 * Theme                    -> theme
 *
 * Description is intentionally left NULL/empty.
 */
export async function bulkImportProblemStatements(input: {
  event_id: string;
  rows: BulkProblemStatementRow[];
}): Promise<BulkProblemStatementResult> {
  try {
    await requireAuth(['admin', 'data_operator']);

    if (!input.event_id) {
      return {
        success: false,
        imported: 0,
        skipped: 0,
        failed: 0,
        errors: ['Event ID is required.'],
      };
    }

    if (!input.rows.length) {
      return {
        success: false,
        imported: 0,
        skipped: 0,
        failed: 0,
        errors: ['No valid rows were supplied for import.'],
      };
    }

    const supabase = createAdminClient();

    const cleanedRows = input.rows.map((row) => ({
      event_id: input.event_id,
      statement_code: row.statement_code.trim(),
      title: row.title.trim(),
      organization: row.organization?.trim() || null,
      category: row.category?.trim() || null,
      theme: row.theme?.trim() || null,
      description: null,
    }));

    const errors: string[] = [];
    const validRows = cleanedRows.filter((row, index) => {
      if (!row.statement_code) {
        errors.push(`Row ${index + 1}: PS Number is missing.`);
        return false;
      }

      if (!row.title) {
        errors.push(`Row ${index + 1}: Problem Statement Title is missing.`);
        return false;
      }

      return true;
    });

    if (!validRows.length) {
      return {
        success: false,
        imported: 0,
        skipped: 0,
        failed: errors.length,
        errors,
      };
    }

    /*
     * Get existing PS numbers for this event so we can avoid
     * silently overwriting existing records.
     */
    const existingResult = await supabase
      .from('problem_statements')
      .select('statement_code')
      .eq('event_id', input.event_id);

    if (existingResult.error) {
      throw existingResult.error;
    }

    const existingCodes = new Set(
      (existingResult.data ?? []).map((row) =>
        String(row.statement_code).trim().toLowerCase()
      )
    );

    const seenInImport = new Set<string>();

    const insertRows = validRows.filter((row) => {
      const normalizedCode = row.statement_code.toLowerCase();

      if (existingCodes.has(normalizedCode)) {
        errors.push(
          `Skipped "${row.statement_code}": Problem Statement already exists for this event.`
        );
        return false;
      }

      if (seenInImport.has(normalizedCode)) {
        errors.push(
          `Skipped "${row.statement_code}": Duplicate PS Number in import file.`
        );
        return false;
      }

      seenInImport.add(normalizedCode);

      return true;
    });

    let imported = 0;
    let failed = 0;

    /*
     * Insert in chunks instead of one extremely large request.
     */
    const chunkSize = 100;

    for (let i = 0; i < insertRows.length; i += chunkSize) {
      const chunk = insertRows.slice(i, i + chunkSize);

      const { error } = await supabase
        .from('problem_statements')
        .insert(chunk);

      if (error) {
        failed += chunk.length;

        errors.push(
          `Import failed for rows ${i + 1}-${i + chunk.length}: ${error.message}`
        );
      } else {
        imported += chunk.length;
      }
    }

    revalidatePath('/admin/problem-statements');

    return {
      success: failed === 0,
      imported,
      skipped: validRows.length - insertRows.length,
      failed,
      errors,
    };
  } catch (error) {
    console.error('bulkImportProblemStatements error:', error);

    return {
      success: false,
      imported: 0,
      skipped: 0,
      failed: input.rows.length,
      errors: [
        error instanceof Error
          ? error.message
          : 'Failed to import problem statements.',
      ],
    };
  }
}