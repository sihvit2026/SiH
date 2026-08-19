import { NextResponse } from 'next/server';
import { getCurrentUser, generateUsername, generatePassword, internalEmail } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { CsvEvaluatorRowSchema, type GeneratedCredential } from '@/lib/schemas';
import { z } from 'zod';

const BulkCreateSchema = z.object({
  rows: z.array(z.object({
    name: z.string(),
    role: z.string(),
    designation: z.string().optional(),
  })).min(1).max(200),
});

/**
 * POST /api/admin/bulk-create-users
 * Batch creates evaluator/jury accounts from validated CSV rows.
 * Returns per-row result + credential list.
 *
 * SECURITY: admin/data_operator only. Uses service-role client server-side.
 */
export async function POST(req: Request) {
  try {
    const caller = await getCurrentUser();
    if (!caller || !['admin', 'data_operator'].includes(caller.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = BulkCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const results: GeneratedCredential[] = [];

    for (const rawRow of parsed.data.rows) {
      // Validate individual row
      const rowParsed = CsvEvaluatorRowSchema.safeParse({
        name: rawRow.name?.trim(),
        role: rawRow.role?.trim().toLowerCase(),
        designation: rawRow.designation?.trim(),
      });

      if (!rowParsed.success) {
        results.push({
          name: rawRow.name || '(unknown)',
          role: 'evaluator',
          username: '',
          email: '',
          password: '',
          userId: '',
          status: 'failed',
          error: rowParsed.error.flatten().fieldErrors.role?.[0] || 'Validation failed',
        });
        continue;
      }

      const { name, role } = rowParsed.data;

      // Check for duplicate by name (approximate dedup)
      const { data: existing } = await (adminClient.from('evaluators') as any)
        .select('id')
        .eq('name', name)
        .limit(1);

      if (existing && existing.length > 0) {
        results.push({
          name,
          role,
          username: '',
          email: '',
          password: '',
          userId: existing[0].id,
          status: 'duplicate',
          error: 'Account with this name already exists',
        });
        continue;
      }

      // Generate credentials
      const prefix = role === 'evaluator' ? 'eval' : 'jury';
      const username = generateUsername(prefix as 'eval' | 'jury');
      const password = generatePassword();
      const email = internalEmail(username);

      // Create auth user
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, role, username },
      });

      if (authError || !authData?.user) {
        results.push({
          name,
          role,
          username,
          email,
          password,
          userId: '',
          status: 'failed',
          error: authError?.message || 'Auth creation failed',
        });
        continue;
      }

      const userId = authData.user.id;

      // Insert evaluators row
      const { error: evalError } = await (adminClient.from('evaluators') as any).insert({
        id: userId,
        name,
        role,
        round2_attendance: 'absent',
      });

      if (evalError) {
        await adminClient.auth.admin.deleteUser(userId);
        results.push({
          name,
          role,
          username,
          email,
          password,
          userId,
          status: 'failed',
          error: `DB insert failed: ${evalError.message}`,
        });
        continue;
      }

      results.push({
        name,
        role,
        username,
        email,
        password,
        userId,
        status: 'created',
      });
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: results.length,
        created: results.filter((r) => r.status === 'created').length,
        duplicates: results.filter((r) => r.status === 'duplicate').length,
        failed: results.filter((r) => r.status === 'failed').length,
      },
    });
  } catch (err: any) {
    console.error('bulk-create-users error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
