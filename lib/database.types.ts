export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          created_at: string
          id: string
          new_value: Json | null
          old_value: Json | null
          operation: string
          performed_by: string | null
          row_id: string | null
          table_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          operation: string
          performed_by?: string | null
          row_id?: string | null
          table_name: string
        }
        Update: {
          created_at?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          operation?: string
          performed_by?: string | null
          row_id?: string | null
          table_name?: string
        }
        Relationships: []
      }
      criteria: {
        Row: {
          created_at: string
          event_id: string
          id: string
          max_score: number
          name: string
          round: number
          weight: number
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          max_score: number
          name: string
          round: number
          weight?: number
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          max_score?: number
          name?: string
          round?: number
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "criteria_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_locks: {
        Row: {
          evaluator_id: string
          id: string
          locked_at: string
          reopen_reason: string | null
          round: number
          status: string
          team_id: string
        }
        Insert: {
          evaluator_id: string
          id?: string
          locked_at?: string
          reopen_reason?: string | null
          round: number
          status?: string
          team_id: string
        }
        Update: {
          evaluator_id?: string
          id?: string
          locked_at?: string
          reopen_reason?: string | null
          round?: number
          status?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_locks_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "evaluators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluation_locks_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_round1_average"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "evaluation_locks_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_round2_average"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "evaluation_locks_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluators: {
        Row: {
          created_at: string
          id: string
          name: string
          role: string
          round2_attendance: string
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          role: string
          round2_attendance?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          role?: string
          round2_attendance?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          date: string | null
          id: string
          name: string
          status: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          created_at?: string
          date?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          created_at?: string
          date?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      problem_statements: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          event_id: string
          id: string
          organization: string | null
          statement_code: string
          theme: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          event_id: string
          id?: string
          organization?: string | null
          statement_code: string
          theme?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          event_id?: string
          id?: string
          organization?: string | null
          statement_code?: string
          theme?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "problem_statements_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          name: string
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      round1_assignments: {
        Row: {
          assigned_at: string
          evaluator_id: string
          event_id: string
          id: string
          team_id: string
        }
        Insert: {
          assigned_at?: string
          evaluator_id: string
          event_id: string
          id?: string
          team_id: string
        }
        Update: {
          assigned_at?: string
          evaluator_id?: string
          event_id?: string
          id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "round1_assignments_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "evaluators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "round1_assignments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "round1_assignments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_round1_average"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "round1_assignments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_round2_average"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "round1_assignments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      round1_comments: {
        Row: {
          comment: string
          created_at: string
          evaluator_id: string
          id: string
          team_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          evaluator_id: string
          id?: string
          team_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          evaluator_id?: string
          id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "round1_comments_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "evaluators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "round1_comments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_round1_average"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "round1_comments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_round2_average"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "round1_comments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      round1_scores: {
        Row: {
          criteria_id: string
          evaluator_id: string
          id: string
          score: number
          submitted_at: string
          team_id: string
        }
        Insert: {
          criteria_id: string
          evaluator_id: string
          id?: string
          score: number
          submitted_at?: string
          team_id: string
        }
        Update: {
          criteria_id?: string
          evaluator_id?: string
          id?: string
          score?: number
          submitted_at?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "round1_scores_criteria_id_fkey"
            columns: ["criteria_id"]
            isOneToOne: false
            referencedRelation: "criteria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "round1_scores_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "evaluators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "round1_scores_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_round1_average"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "round1_scores_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_round2_average"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "round1_scores_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      round2_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          jury_id: string
          team_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          jury_id: string
          team_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          jury_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "round2_comments_jury_id_fkey"
            columns: ["jury_id"]
            isOneToOne: false
            referencedRelation: "evaluators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "round2_comments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_round1_average"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "round2_comments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_round2_average"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "round2_comments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      round2_scores: {
        Row: {
          criteria_id: string
          id: string
          jury_id: string
          score: number
          submitted_at: string
          team_id: string
        }
        Insert: {
          criteria_id: string
          id?: string
          jury_id: string
          score: number
          submitted_at?: string
          team_id: string
        }
        Update: {
          criteria_id?: string
          id?: string
          jury_id?: string
          score?: number
          submitted_at?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "round2_scores_criteria_id_fkey"
            columns: ["criteria_id"]
            isOneToOne: false
            referencedRelation: "criteria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "round2_scores_jury_id_fkey"
            columns: ["jury_id"]
            isOneToOne: false
            referencedRelation: "evaluators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "round2_scores_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_round1_average"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "round2_scores_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_round2_average"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "round2_scores_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_leader: boolean
          name: string
          roll_number: string | null
          team_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_leader?: boolean
          name: string
          roll_number?: string | null
          team_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_leader?: boolean
          name?: string
          roll_number?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_round1_average"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "students_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_round2_average"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "students_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          event_id: string
          id: string
          problem_statement_id: string | null
          status: string
          team_code: string
          team_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          problem_statement_id?: string | null
          status?: string
          team_code: string
          team_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          problem_statement_id?: string | null
          status?: string
          team_code?: string
          team_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_problem_statement_id_fkey"
            columns: ["problem_statement_id"]
            isOneToOne: false
            referencedRelation: "problem_statements"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      team_round1_average: {
        Row: {
          avg_score: number | null
          evaluator_count: number | null
          event_id: string | null
          score_count: number | null
          team_id: string | null
          team_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      team_round2_average: {
        Row: {
          avg_score: number | null
          event_id: string | null
          jury_count: number | null
          score_count: number | null
          team_id: string | null
          team_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      fn_auth_assigned_to_team: {
        Args: { p_team_id: string }
        Returns: boolean
      }
      fn_auth_is_jury_present: { Args: never; Returns: boolean }
      fn_auth_role: { Args: never; Returns: string }
      fn_auth_user_role: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
