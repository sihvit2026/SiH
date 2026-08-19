import { NextResponse } from 'next/server';
import { getCurrentUser, generateUsername, generatePassword, internalEmail } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { CreateUserSchema, type GeneratedCredential } from '@/lib/schemas';

/**
 * POST /api/admin/create-user
 * Creates a single evaluator or jury account server-side.
 * Returns generated credentials ONCE to the admin — they are never stored in plaintext.
 *
 * SECURITY: requires admin/data_operator role. Uses service-role admin client.
 * Service-role key never leaves this server-side handler.
 */
export async function POST(req: Request) {
  try {
    // 1. Verify caller is admin or data_operator
    const caller = await getCurrentUser();
    if (!caller || !['admin', 'data_operator'].includes(caller.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 2. Parse and validate input
    const body = await req.json();
    const parsed = CreateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { name, role } = parsed.data;

    // 3. Generate credentials server-side
    const prefix = role === 'evaluator' ? 'eval' : 'jury';
    const username = generateUsername(prefix as 'eval' | 'jury');
    const password = generatePassword();
    const email = internalEmail(username);

    // 4. Create Supabase Auth user via service-role client (bypasses email confirmation)
    const adminClient = createAdminClient();
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email verification
      user_metadata: { name, role, username },
    });

    if (authError || !authData?.user) {
      return NextResponse.json(
        { error: authError?.message || 'Failed to create auth user' },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    // 5. Insert into evaluators table
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: evalError } = await (adminClient.from('evaluators') as any).insert({
      id: userId,
      name,
      role,
      round2_attendance: 'absent',
    });

    if (evalError) {
      // Rollback: delete the auth user
      await adminClient.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: `Failed to create evaluator record: ${evalError.message}` },
        { status: 500 }
      );
    }

    // 6. Return credential once (admin must download/copy — password not stored anywhere)
    const credential: GeneratedCredential = {
      name,
      role,
      username,
      email,
      password,
      userId,
      status: 'created',
    };

    return NextResponse.json({ success: true, credential });
  } catch (err) {
    console.error('create-user error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 });
  }
}
