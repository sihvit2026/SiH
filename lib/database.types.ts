/**
 * Hand-maintained Database type derived from the SQL migrations (0001–0006).
 * This is the single type parameter passed to all Supabase client factories.
 *
 * IMPORTANT: Every Tables entry MUST include `Relationships: []` and every
 * Views entry MUST include `Relationships: []` to satisfy the GenericSchema /
 * GenericTable / GenericNonUpdatableView constraints in @supabase/supabase-js.
 * Without these, `Database['public']` does not extend GenericSchema and every
 * `.from()` call infers `never` for the row type.
 *
 * Update this file whenever a new migration adds/alters a table.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      events: {
        Row: { id: string; name: string; date: string | null; venue: string | null; status: string; created_at: string; updated_at: string }
        Insert: { id?: string; name: string; date?: string | null; venue?: string | null; status?: string; created_at?: string; updated_at?: string }
        Update: { id?: string; name?: string; date?: string | null; venue?: string | null; status?: string; created_at?: string; updated_at?: string }
        Relationships: []
      }
      criteria: {
        Row: { id: string; event_id: string; name: string; max_score: number; weight: number; round: number; created_at: string }
        Insert: { id?: string; event_id: string; name: string; max_score: number; weight?: number; round: number; created_at?: string }
        Update: { id?: string; event_id?: string; name?: string; max_score?: number; weight?: number; round?: number; created_at?: string }
        Relationships: [
          { foreignKeyName: "criteria_event_id_fkey"; columns: ["event_id"]; isOneToOne: false; referencedRelation: "events"; referencedColumns: ["id"] }
        ]
      }
      teams: {
        Row: { id: string; event_id: string; team_name: string; team_code: string; status: string; problem_statement_id: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; event_id: string; team_name: string; team_code: string; status?: string; problem_statement_id?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; event_id?: string; team_name?: string; team_code?: string; status?: string; problem_statement_id?: string | null; created_at?: string; updated_at?: string }
        Relationships: [
          { foreignKeyName: "teams_event_id_fkey"; columns: ["event_id"]; isOneToOne: false; referencedRelation: "events"; referencedColumns: ["id"] }
        ]
      }
      students: {
        Row: { id: string; team_id: string; name: string; roll_number: string | null; email: string | null; is_leader: boolean; created_at: string }
        Insert: { id?: string; team_id: string; name: string; roll_number?: string | null; email?: string | null; is_leader?: boolean; created_at?: string }
        Update: { id?: string; team_id?: string; name?: string; roll_number?: string | null; email?: string | null; is_leader?: boolean; created_at?: string }
        Relationships: [
          { foreignKeyName: "students_team_id_fkey"; columns: ["team_id"]; isOneToOne: false; referencedRelation: "teams"; referencedColumns: ["id"] }
        ]
      }
      evaluators: {
        Row: { id: string; name: string; role: string; round2_attendance: string; created_at: string }
        Insert: { id: string; name: string; role: string; round2_attendance?: string; created_at?: string }
        Update: { id?: string; name?: string; role?: string; round2_attendance?: string; created_at?: string }
        Relationships: []
      }
      profiles: {
        Row: { id: string; email: string | null; name: string; role: string; created_at: string; updated_at: string }
        Insert: { id: string; email?: string | null; name: string; role: string; created_at?: string; updated_at?: string }
        Update: { id?: string; email?: string | null; name?: string; role?: string; created_at?: string; updated_at?: string }
        Relationships: []
      }
      round1_assignments: {
        Row: { id: string; evaluator_id: string; team_id: string; event_id: string; assigned_at: string }
        Insert: { id?: string; evaluator_id: string; team_id: string; event_id: string; assigned_at?: string }
        Update: { id?: string; evaluator_id?: string; team_id?: string; event_id?: string; assigned_at?: string }
        Relationships: [
          { foreignKeyName: "round1_assignments_team_id_fkey"; columns: ["team_id"]; isOneToOne: false; referencedRelation: "teams"; referencedColumns: ["id"] },
          { foreignKeyName: "round1_assignments_evaluator_id_fkey"; columns: ["evaluator_id"]; isOneToOne: false; referencedRelation: "evaluators"; referencedColumns: ["id"] },
          { foreignKeyName: "round1_assignments_event_id_fkey"; columns: ["event_id"]; isOneToOne: false; referencedRelation: "events"; referencedColumns: ["id"] }
        ]
      }
      round1_scores: {
        Row: { id: string; evaluator_id: string; team_id: string; criteria_id: string; score: number; submitted_at: string }
        Insert: { id?: string; evaluator_id: string; team_id: string; criteria_id: string; score: number; submitted_at?: string }
        Update: { id?: string; evaluator_id?: string; team_id?: string; criteria_id?: string; score?: number; submitted_at?: string }
        Relationships: [
          { foreignKeyName: "round1_scores_evaluator_id_fkey"; columns: ["evaluator_id"]; isOneToOne: false; referencedRelation: "evaluators"; referencedColumns: ["id"] },
          { foreignKeyName: "round1_scores_team_id_fkey"; columns: ["team_id"]; isOneToOne: false; referencedRelation: "teams"; referencedColumns: ["id"] },
          { foreignKeyName: "round1_scores_criteria_id_fkey"; columns: ["criteria_id"]; isOneToOne: false; referencedRelation: "criteria"; referencedColumns: ["id"] }
        ]
      }
      round1_comments: {
        Row: { id: string; evaluator_id: string; team_id: string; comment: string; created_at: string }
        Insert: { id?: string; evaluator_id: string; team_id: string; comment: string; created_at?: string }
        Update: { id?: string; evaluator_id?: string; team_id?: string; comment?: string; created_at?: string }
        Relationships: [
          { foreignKeyName: "round1_comments_evaluator_id_fkey"; columns: ["evaluator_id"]; isOneToOne: false; referencedRelation: "evaluators"; referencedColumns: ["id"] },
          { foreignKeyName: "round1_comments_team_id_fkey"; columns: ["team_id"]; isOneToOne: false; referencedRelation: "teams"; referencedColumns: ["id"] }
        ]
      }
      round2_scores: {
        Row: { id: string; jury_id: string; team_id: string; criteria_id: string; score: number; submitted_at: string }
        Insert: { id?: string; jury_id: string; team_id: string; criteria_id: string; score: number; submitted_at?: string }
        Update: { id?: string; jury_id?: string; team_id?: string; criteria_id?: string; score?: number; submitted_at?: string }
        Relationships: [
          { foreignKeyName: "round2_scores_jury_id_fkey"; columns: ["jury_id"]; isOneToOne: false; referencedRelation: "evaluators"; referencedColumns: ["id"] },
          { foreignKeyName: "round2_scores_team_id_fkey"; columns: ["team_id"]; isOneToOne: false; referencedRelation: "teams"; referencedColumns: ["id"] },
          { foreignKeyName: "round2_scores_criteria_id_fkey"; columns: ["criteria_id"]; isOneToOne: false; referencedRelation: "criteria"; referencedColumns: ["id"] }
        ]
      }
      round2_comments: {
        Row: { id: string; jury_id: string; team_id: string; comment: string; created_at: string }
        Insert: { id?: string; jury_id: string; team_id: string; comment: string; created_at?: string }
        Update: { id?: string; jury_id?: string; team_id?: string; comment?: string; created_at?: string }
        Relationships: [
          { foreignKeyName: "round2_comments_jury_id_fkey"; columns: ["jury_id"]; isOneToOne: false; referencedRelation: "evaluators"; referencedColumns: ["id"] },
          { foreignKeyName: "round2_comments_team_id_fkey"; columns: ["team_id"]; isOneToOne: false; referencedRelation: "teams"; referencedColumns: ["id"] }
        ]
      }
      evaluation_locks: {
        Row: { id: string; evaluator_id: string; team_id: string; round: number; status: string; reopen_reason: string | null; locked_at: string }
        Insert: { id?: string; evaluator_id: string; team_id: string; round: number; status?: string; reopen_reason?: string | null; locked_at?: string }
        Update: { id?: string; evaluator_id?: string; team_id?: string; round?: number; status?: string; reopen_reason?: string | null; locked_at?: string }
        Relationships: [
          { foreignKeyName: "evaluation_locks_evaluator_id_fkey"; columns: ["evaluator_id"]; isOneToOne: false; referencedRelation: "evaluators"; referencedColumns: ["id"] },
          { foreignKeyName: "evaluation_locks_team_id_fkey"; columns: ["team_id"]; isOneToOne: false; referencedRelation: "teams"; referencedColumns: ["id"] }
        ]
      }
      audit_log: {
        Row: { id: string; table_name: string; operation: string; row_id: string | null; old_value: Json | null; new_value: Json | null; performed_by: string | null; created_at: string }
        Insert: { id?: string; table_name: string; operation: string; row_id?: string | null; old_value?: Json | null; new_value?: Json | null; performed_by?: string | null; created_at?: string }
        Update: { id?: string; table_name?: string; operation?: string; row_id?: string | null; old_value?: Json | null; new_value?: Json | null; performed_by?: string | null; created_at?: string }
        Relationships: []
      }
      problem_statements: {
        Row: { id: string; event_id: string; statement_code: string; title: string; category: string | null; theme: string | null; organization: string | null; description: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; event_id: string; statement_code: string; title: string; category?: string | null; theme?: string | null; organization?: string | null; description?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; event_id?: string; statement_code?: string; title?: string; category?: string | null; theme?: string | null; organization?: string | null; description?: string | null; created_at?: string; updated_at?: string }
        Relationships: [
          { foreignKeyName: "problem_statements_event_id_fkey"; columns: ["event_id"]; isOneToOne: false; referencedRelation: "events"; referencedColumns: ["id"] }
        ]
      }
    }
    Views: {
      team_round1_average: {
        Row: { team_id: string | null; team_name: string | null; event_id: string | null; avg_score: number | null; evaluator_count: number | null; score_count: number | null }
        Relationships: []
      }
      team_round2_average: {
        Row: { team_id: string | null; team_name: string | null; event_id: string | null; avg_score: number | null; jury_count: number | null; score_count: number | null }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
