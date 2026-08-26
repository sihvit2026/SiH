import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export type UserRole = 'admin' | 'data_operator' | 'evaluator' | 'jury' | 'viewer';

export interface CurrentUserSession {
  user: { id: string; email?: string };
  role: UserRole;
  name: string;
  email: string;
  round2Attendance?: 'present' | 'absent';
}

/**
 * Resolves the authenticated user's identity and role server-side.
 * Priority: profiles table (admin/data_operator/viewer) → evaluators table (evaluator/jury)
 * Returns null if not authenticated or no role can be determined.
 * Memoized per request using React cache.
 *
 * SECURITY: Never falls back to a privileged role. Returns null on any ambiguity.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUserSession | null> => {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) return null;

    // Run both table lookups in parallel — they are independent queries.
    // profiles table: admin/data_operator/viewer roles (RLS: own row only)
    // evaluators table: evaluator/jury roles (RLS: own row only)
    const [{ data: profile }, { data: evaluator }] = await Promise.all([
      supabase
        .from('profiles')
        .select('name, role')
        .eq('id', user.id)
        .maybeSingle(),
      supabase
        .from('evaluators')
        .select('name, role, round2_attendance')
        .eq('id', user.id)
        .maybeSingle(),
    ]);

    // profiles table takes priority (admin/data_operator/viewer)
    if (profile && profile.role) {
      const role = profile.role as UserRole;
      if (['admin', 'data_operator', 'viewer'].includes(role)) {
        return {
          user: { id: user.id, email: user.email },
          role,
          name: profile.name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
        };
      }
    }

    // evaluators table for evaluator/jury roles
    if (evaluator && evaluator.role) {
      const role = evaluator.role as UserRole;
      if (['evaluator', 'jury'].includes(role)) {
        return {
          user: { id: user.id, email: user.email },
          role,
          name: evaluator.name || 'Evaluator',
          email: user.email || '',
          round2Attendance: evaluator.round2_attendance as 'present' | 'absent',
        };
      }
    }

    // Authenticated but no role found — no access.
    // SECURITY: Never falls back to 'admin'. Unknown authenticated users get null.
    return null;
  } catch (err) {
    console.error('Error in getCurrentUser:', err);
    return null;
  }
});

/**
 * Server-side auth guard. Redirects to /login if unauthenticated.
 * Redirects to the user's own dashboard if they access a page requiring a different role.
 *
 * SECURITY: This is defense-in-depth. RLS is the primary database security boundary.
 * Never rely only on this function to protect data — always verify ownership in queries.
 */
export async function requireAuth(allowedRoles?: UserRole[]): Promise<CurrentUserSession> {
  const session = await getCurrentUser();

  if (!session) {
    redirect('/login');
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    // Redirect unauthorized users to their designated area
    const roleHome: Record<UserRole, string> = {
      admin: '/admin',
      data_operator: '/admin',
      evaluator: '/round1',
      jury: '/round2',
      viewer: '/reports',
    };
    redirect(roleHome[session.role] ?? '/login');
  }

  return session;
}

/** Role display labels */
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'SIH Super Admin',
  data_operator: 'Data Operator',
  evaluator: 'Round 1 Evaluator',
  jury: 'Round 2 Jury',
  viewer: 'View Only',
};

/** Whether a role has admin-level privileges */
export function isAdminRole(role: UserRole): boolean {
  return role === 'admin' || role === 'data_operator';
}

/** Generate a system-internal email from a username slug */
export function internalEmail(username: string): string {
  return `${username}@sih.vit.internal`;
}

/** Generate a random username slug */
export function generateUsername(prefix: 'eval' | 'jury'): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let slug = '';
  for (let i = 0; i < 6; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}-${slug}`;
}

/** Generate a secure random password */
export function generatePassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const special = '!@#$%&';
  const all = upper + lower + digits + special;

  let pw = '';
  // Ensure at least one of each category
  pw += upper[Math.floor(Math.random() * upper.length)];
  pw += lower[Math.floor(Math.random() * lower.length)];
  pw += digits[Math.floor(Math.random() * digits.length)];
  pw += special[Math.floor(Math.random() * special.length)];

  for (let i = pw.length; i < 12; i++) {
    pw += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle
  return pw.split('').sort(() => 0.5 - Math.random()).join('');
}