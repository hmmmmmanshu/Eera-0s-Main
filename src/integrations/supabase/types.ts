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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          activity_count: number
          activity_date: string
          activity_type: string
          created_at: string
          hub_name: string
          id: string
          user_id: string
        }
        Insert: {
          activity_count?: number
          activity_date?: string
          activity_type: string
          created_at?: string
          hub_name: string
          id?: string
          user_id: string
        }
        Update: {
          activity_count?: number
          activity_date?: string
          activity_type?: string
          created_at?: string
          hub_name?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      dashboard_metrics: {
        Row: {
          created_at: string
          hub_name: string
          id: string
          metric_date: string
          metrics: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          hub_name: string
          id?: string
          metric_date?: string
          metrics?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          hub_name?: string
          id?: string
          metric_date?: string
          metrics?: Json
          user_id?: string
        }
        Relationships: []
      }
      hr_appraisals: {
        Row: {
          areas_for_improvement: string | null
          comments: string | null
          created_at: string
          employee_id: string
          goals: Json | null
          id: string
          rating: number
          review_date: string
          review_period: string
          reviewed_by: string | null
          status: string
          strengths: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          areas_for_improvement?: string | null
          comments?: string | null
          created_at?: string
          employee_id: string
          goals?: Json | null
          id?: string
          rating: number
          review_date: string
          review_period: string
          reviewed_by?: string | null
          status?: string
          strengths?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          areas_for_improvement?: string | null
          comments?: string | null
          created_at?: string
          employee_id?: string
          goals?: Json | null
          id?: string
          rating?: number
          review_date?: string
          review_period?: string
          reviewed_by?: string | null
          status?: string
          strengths?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_appraisals_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_candidates: {
        Row: {
          applied_date: string | null
          created_at: string
          email: string
          id: string
          interview_notes: string | null
          name: string
          phone: string | null
          resume_url: string | null
          role_id: string | null
          score: number | null
          screening_results: Json | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_date?: string | null
          created_at?: string
          email: string
          id?: string
          interview_notes?: string | null
          name: string
          phone?: string | null
          resume_url?: string | null
          role_id?: string | null
          score?: number | null
          screening_results?: Json | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_date?: string | null
          created_at?: string
          email?: string
          id?: string
          interview_notes?: string | null
          name?: string
          phone?: string | null
          resume_url?: string | null
          role_id?: string | null
          score?: number | null
          screening_results?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_candidates_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "hr_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_docs: {
        Row: {
          category: string | null
          content: string | null
          created_at: string
          employee_id: string | null
          id: string
          status: string
          tags: Json | null
          title: string
          type: string
          updated_at: string
          url: string | null
          user_id: string
          version: string | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string
          employee_id?: string | null
          id?: string
          status?: string
          tags?: Json | null
          title: string
          type: string
          updated_at?: string
          url?: string | null
          user_id: string
          version?: string | null
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string
          employee_id?: string | null
          id?: string
          status?: string
          tags?: Json | null
          title?: string
          type?: string
          updated_at?: string
          url?: string | null
          user_id?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_docs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_employees: {
        Row: {
          candidate_id: string | null
          contract_id: string | null
          created_at: string
          department: string | null
          designation: string
          email: string
          employment_type: string | null
          end_date: string | null
          id: string
          manager_id: string | null
          name: string
          performance_score: number | null
          salary: number
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          candidate_id?: string | null
          contract_id?: string | null
          created_at?: string
          department?: string | null
          designation: string
          email: string
          employment_type?: string | null
          end_date?: string | null
          id?: string
          manager_id?: string | null
          name: string
          performance_score?: number | null
          salary: number
          start_date: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          candidate_id?: string | null
          contract_id?: string | null
          created_at?: string
          department?: string | null
          designation?: string
          email?: string
          employment_type?: string | null
          end_date?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          performance_score?: number | null
          salary?: number
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_employees_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "hr_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_events: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          event_type: string
          id: string
          metadata: Json | null
          result: string | null
          source_hub: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          result?: string | null
          source_hub: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          result?: string | null
          source_hub?: string
          user_id?: string
        }
        Relationships: []
      }
      hr_payroll: {
        Row: {
          amount: number
          bonuses: number | null
          created_at: string
          deductions: number | null
          employee_id: string
          id: string
          net_amount: number | null
          notes: string | null
          payment_date: string
          payment_method: string | null
          status: string
          tax_deduction: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          bonuses?: number | null
          created_at?: string
          deductions?: number | null
          employee_id: string
          id?: string
          net_amount?: number | null
          notes?: string | null
          payment_date: string
          payment_method?: string | null
          status?: string
          tax_deduction?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          bonuses?: number | null
          created_at?: string
          deductions?: number | null
          employee_id?: string
          id?: string
          net_amount?: number | null
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          status?: string
          tax_deduction?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_payroll_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_roles: {
        Row: {
          created_at: string
          department: string | null
          id: string
          jd_text: string | null
          location: string | null
          requirements: Json | null
          responsibilities: Json | null
          salary_range: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          id?: string
          jd_text?: string | null
          location?: string | null
          requirements?: Json | null
          responsibilities?: Json | null
          salary_range?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string | null
          id?: string
          jd_text?: string | null
          location?: string | null
          requirements?: Json | null
          responsibilities?: Json | null
          salary_range?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      meetings: {
        Row: {
          attendees: string[] | null
          created_at: string
          description: string | null
          end_time: string
          google_calendar_event_id: string | null
          id: string
          location: string | null
          start_time: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attendees?: string[] | null
          created_at?: string
          description?: string | null
          end_time: string
          google_calendar_event_id?: string | null
          id?: string
          location?: string | null
          start_time: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attendees?: string[] | null
          created_at?: string
          description?: string | null
          end_time?: string
          google_calendar_event_id?: string | null
          id?: string
          location?: string | null
          start_time?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          about: string | null
          assistant_name: string | null
          assistant_style: string | null
          avatar_url: string | null
          brand_values: string[] | null
          color_palette: Json | null
          company_stage: string | null
          competitive_edge: string | null
          content_themes: string[] | null
          created_at: string
          design_philosophy: string | null
          email: string | null
          founder_name: string | null
          full_name: string | null
          id: string
          industry: string | null
          inspirational_brands: string | null
          key_offerings: string | null
          language_style: string | null
          logo_url: string | null
          marketing_goal: string | null
          notification_frequency: string | null
          offlimit_topics: string | null
          onboarding_completed: boolean | null
          posting_frequency: string | null
          posting_hours: Json | null
          preferred_formats: string[] | null
          preferred_platforms: string[] | null
          primary_metrics: string[] | null
          profile_completion_percentage: number | null
          startup_name: string | null
          tagline: string | null
          target_audience: string | null
          timezone: string | null
          tone_personality: string[] | null
          updated_at: string
          website_url: string | null
          writing_style: string | null
        }
        Insert: {
          about?: string | null
          assistant_name?: string | null
          assistant_style?: string | null
          avatar_url?: string | null
          brand_values?: string[] | null
          color_palette?: Json | null
          company_stage?: string | null
          competitive_edge?: string | null
          content_themes?: string[] | null
          created_at?: string
          design_philosophy?: string | null
          email?: string | null
          founder_name?: string | null
          full_name?: string | null
          id: string
          industry?: string | null
          inspirational_brands?: string | null
          key_offerings?: string | null
          language_style?: string | null
          logo_url?: string | null
          marketing_goal?: string | null
          notification_frequency?: string | null
          offlimit_topics?: string | null
          onboarding_completed?: boolean | null
          posting_frequency?: string | null
          posting_hours?: Json | null
          preferred_formats?: string[] | null
          preferred_platforms?: string[] | null
          primary_metrics?: string[] | null
          profile_completion_percentage?: number | null
          startup_name?: string | null
          tagline?: string | null
          target_audience?: string | null
          timezone?: string | null
          tone_personality?: string[] | null
          updated_at?: string
          website_url?: string | null
          writing_style?: string | null
        }
        Update: {
          about?: string | null
          assistant_name?: string | null
          assistant_style?: string | null
          avatar_url?: string | null
          brand_values?: string[] | null
          color_palette?: Json | null
          company_stage?: string | null
          competitive_edge?: string | null
          content_themes?: string[] | null
          created_at?: string
          design_philosophy?: string | null
          email?: string | null
          founder_name?: string | null
          full_name?: string | null
          id?: string
          industry?: string | null
          inspirational_brands?: string | null
          key_offerings?: string | null
          language_style?: string | null
          logo_url?: string | null
          marketing_goal?: string | null
          notification_frequency?: string | null
          offlimit_topics?: string | null
          onboarding_completed?: boolean | null
          posting_frequency?: string | null
          posting_hours?: Json | null
          preferred_formats?: string[] | null
          preferred_platforms?: string[] | null
          primary_metrics?: string[] | null
          profile_completion_percentage?: number | null
          startup_name?: string | null
          tagline?: string | null
          target_audience?: string | null
          timezone?: string | null
          tone_personality?: string[] | null
          updated_at?: string
          website_url?: string | null
          writing_style?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          category: string
          completed: boolean
          created_at: string
          description: string | null
          due_date: string
          google_calendar_event_id: string | null
          id: string
          priority: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date: string
          google_calendar_event_id?: string | null
          id?: string
          priority?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date?: string
          google_calendar_event_id?: string | null
          id?: string
          priority?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
