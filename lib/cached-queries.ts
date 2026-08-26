import { unstable_cache } from 'next/cache';
import { createAdminClient } from './supabase/admin';

/**
 * Cached active event query.
 * Events rarely change during active hackathons.
 * Cached for 60 seconds or invalidated via revalidateTag('events').
 */
export const getCachedActiveEvent = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('events')
      .select('id, name, status')
      .in('status', ['upcoming', 'ongoing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching cached active event:', error);
      return null;
    }
    return data;
  },
  ['active-event-key'],
  { revalidate: 60, tags: ['events'] }
);

/**
 * Cached criteria rubric query.
 * Rubrics are static scoring configurations.
 * Cached for 60 seconds or invalidated via revalidateTag('criteria').
 */
export const getCachedCriteria = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('criteria')
      .select('id, name, max_score, weight, round')
      .order('round', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching cached criteria:', error);
      return [];
    }
    return data || [];
  },
  ['criteria-list-key'],
  { revalidate: 60, tags: ['criteria'] }
);

/**
 * Cached problem statement options for select dropdowns.
 * Only fetches minimal columns (id, statement_code, title).
 * Cached for 60 seconds or invalidated via revalidateTag('problem-statements').
 */
export const getCachedProblemStatementOptions = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('problem_statements')
      .select('id, statement_code, title')
      .order('statement_code', { ascending: true });

    if (error) {
      console.error('Error fetching cached problem statement options:', error);
      return [];
    }
    return data || [];
  },
  ['problem-statement-options-key'],
  { revalidate: 60, tags: ['problem-statements'] }
);
