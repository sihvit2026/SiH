'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function fetchProblemStatements(eventId: string) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('problem_statements')
      .select('*')
      .eq('event_id', eventId)
      .order('statement_code', { ascending: true });

    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('fetchProblemStatements error:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function createProblemStatement(data: {
  event_id: string;
  statement_code: string;
  title: string;
  category?: string;
  theme?: string;
  organization?: string;
  description?: string;
}) {
  try {
    await requireAuth(['admin', 'data_operator']);
    const supabase = createAdminClient();

    const { data: newRow, error } = await supabase
      .from('problem_statements')
      .insert({
        event_id: data.event_id,
        statement_code: data.statement_code,
        title: data.title,
        category: data.category || null,
        theme: data.theme || null,
        organization: data.organization || null,
        description: data.description || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error(`Problem Statement with code ${data.statement_code} already exists for this event.`);
      }
      throw error;
    }

    revalidatePath('/admin/problem-statements');
    return { success: true, data: newRow };
  } catch (error) {
    console.error('createProblemStatement error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateProblemStatement(id: string, data: {
  statement_code: string;
  title: string;
  category?: string;
  theme?: string;
  organization?: string;
  description?: string;
}) {
  try {
    await requireAuth(['admin', 'data_operator']);
    const supabase = createAdminClient();

    const { data: updatedRow, error } = await supabase
      .from('problem_statements')
      .update({
        statement_code: data.statement_code,
        title: data.title,
        category: data.category || null,
        theme: data.theme || null,
        organization: data.organization || null,
        description: data.description || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error(`Problem Statement with code ${data.statement_code} already exists.`);
      }
      throw error;
    }

    revalidatePath('/admin/problem-statements');
    return { success: true, data: updatedRow };
  } catch (error) {
    console.error('updateProblemStatement error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteProblemStatement(id: string) {
  try {
    await requireAuth(['admin']); // Only super admin can delete? Let's say admin or data_operator.
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('problem_statements')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/problem-statements');
    return { success: true };
  } catch (error) {
    console.error('deleteProblemStatement error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
