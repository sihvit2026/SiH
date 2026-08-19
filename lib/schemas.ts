import { z } from 'zod';

/** Schema for creating a single evaluator/jury account */
export const CreateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),

  role: z.enum(['evaluator', 'jury'], {
    error: 'Role must be evaluator or jury',
  }),

  designation: z.string().max(100).optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

/** Schema for a single CSV row during bulk import */
export const CsvEvaluatorRowSchema = z.object({
  name: z.string().min(2).max(100),
  role: z.enum(['evaluator', 'jury']),
  designation: z.string().max(100).optional().default(''),
});

export type CsvEvaluatorRow = z.infer<typeof CsvEvaluatorRowSchema>;

/** Schema for team CSV import */
export const CsvTeamRowSchema = z.object({
  team_name: z.string().min(1, 'Team name required').max(200),
  team_code: z.string().min(1, 'SIH code required').max(50),
  student_name: z.string().max(100).optional().default(''),
  roll_number: z.string().max(50).optional().default(''),
  email: z.string().email().optional().or(z.literal('')).default(''),
});

export type CsvTeamRow = z.infer<typeof CsvTeamRowSchema>;

/** Credential record returned to admin after account creation */
export interface GeneratedCredential {
  name: string;
  role: 'evaluator' | 'jury';
  username: string;
  email: string;
  password: string;
  userId: string;
  status: 'created' | 'failed' | 'duplicate';
  error?: string;
}

/** Schema for shortlist action */
export const ShortlistSchema = z.object({
  topN: z.number().int().positive().max(500),
  eventId: z.string().uuid(),
});