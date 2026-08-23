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

// ─── Shared DB row types ────────────────────────────────────────────────────

export interface EvaluatorRow {
  id: string;
  name: string;
  role: 'evaluator' | 'jury';
  round2_attendance: 'present' | 'absent';
  created_at?: string;
}

export interface StudentRow {
  id: string;
  name: string;
  roll_number?: string;
  email?: string;
  is_leader?: boolean;
}

export interface TeamRow {
  id: string;
  team_name: string;
  team_code: string;
  status: string;
  created_at?: string;
  students?: StudentRow[];
  problem_statement_id?: string;
  problem_statement?: ProblemStatementRow;
}

export interface AssignmentRow {
  id: string;
  team_code?: string;
  team_name?: string;
  evaluator_name?: string;
  teams?: { team_name: string; team_code: string };
  evaluators?: { name: string; role: string };
}

export interface CriterionRow {
  id: string;
  name: string;
  max_score: number;
  weight: number;
  round: number;
}

export interface AuditLogRow {
  id: string;
  table_name: string;
  operation: string;
  performed_by: string;
  created_at: string;
  new_value?: Record<string, unknown>;
  old_value?: Record<string, unknown>;
}

export interface Round1AverageRow {
  team_id: string;
  team_name: string;
  avg_score: number;
  evaluator_count?: number;
  score_count?: number;
}

export interface Round2AverageRow {
  team_id: string;
  team_name: string;
  avg_score: number;
  jury_count?: number;
  score_count?: number;
  merit_rank?: number;
  result?: string;
}

export interface ScoreRow {
  criteria_id: string;
  score: number;
}

export interface CommentRow {
  comment: string;
}

export interface ProblemStatementRow {
  id: string;
  event_id: string;
  statement_code: string;
  title: string;
  category?: string;
  theme?: string;
  organization?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}