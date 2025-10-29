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
      cognitive_events: {
        Row: {
          created_at: string | null
          description: string | null
          end_time: string | null
          id: string
          start_time: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          start_time: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          start_time?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cognitive_ideas: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          priority: number | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: number | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: number | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cognitive_moods: {
        Row: {
          created_at: string | null
          id: string
          intensity: number | null
          mood: string
          note: string | null
          tags: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          intensity?: number | null
          mood: string
          note?: string | null
          tags?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          intensity?: number | null
          mood?: string
          note?: string | null
          tags?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      cognitive_reflections: {
        Row: {
          ai_summary: string | null
          content: string
          created_at: string | null
          id: string
          type: string | null
          user_id: string
        }
        Insert: {
          ai_summary?: string | null
          content: string
          created_at?: string | null
          id?: string
          type?: string | null
          user_id: string
        }
        Update: {
          ai_summary?: string | null
          content?: string
          created_at?: string | null
          id?: string
          type?: string | null
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
      finance_cap_table: {
        Row: {
          created_at: string | null
          id: string
          investment_amount: number | null
          investment_date: string | null
          share_class: string | null
          shareholder_name: string
          shareholder_type: string | null
          shares: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          investment_amount?: number | null
          investment_date?: string | null
          share_class?: string | null
          shareholder_name: string
          shareholder_type?: string | null
          shares: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          investment_amount?: number | null
          investment_date?: string | null
          share_class?: string | null
          shareholder_name?: string
          shareholder_type?: string | null
          shares?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      finance_cash_flow: {
        Row: {
          created_at: string | null
          id: string
          inflow: number | null
          month: string
          net_cash_flow: number | null
          outflow: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          inflow?: number | null
          month: string
          net_cash_flow?: number | null
          outflow?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          inflow?: number | null
          month?: string
          net_cash_flow?: number | null
          outflow?: number | null
          user_id?: string
        }
        Relationships: []
      }
      finance_expenses: {
        Row: {
          amount: number
          approved_by: string | null
          category: string
          created_at: string | null
          expense_date: string
          id: string
          receipt_url: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          vendor: string
        }
        Insert: {
          amount: number
          approved_by?: string | null
          category: string
          created_at?: string | null
          expense_date: string
          id?: string
          receipt_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          vendor: string
        }
        Update: {
          amount?: number
          approved_by?: string | null
          category?: string
          created_at?: string | null
          expense_date?: string
          id?: string
          receipt_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          vendor?: string
        }
        Relationships: []
      }
      finance_funding_rounds: {
        Row: {
          actual_close: string | null
          committed_amount: number | null
          created_at: string | null
          expected_close: string | null
          id: string
          investors: Json | null
          name: string
          stage: string | null
          target_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_close?: string | null
          committed_amount?: number | null
          created_at?: string | null
          expected_close?: string | null
          id?: string
          investors?: Json | null
          name: string
          stage?: string | null
          target_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_close?: string | null
          committed_amount?: number | null
          created_at?: string | null
          expected_close?: string | null
          id?: string
          investors?: Json | null
          name?: string
          stage?: string | null
          target_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      finance_invoices: {
        Row: {
          amount: number
          client_email: string | null
          client_name: string
          created_at: string | null
          due_date: string
          id: string
          paid_date: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          client_email?: string | null
          client_name: string
          created_at?: string | null
          due_date: string
          id?: string
          paid_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          client_email?: string | null
          client_name?: string
          created_at?: string | null
          due_date?: string
          id?: string
          paid_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      finance_runway: {
        Row: {
          cash_balance: number
          id: string
          monthly_burn_rate: number
          runway_months: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cash_balance: number
          id?: string
          monthly_burn_rate: number
          runway_months?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cash_balance?: number
          id?: string
          monthly_burn_rate?: number
          runway_months?: number | null
          updated_at?: string | null
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
          bonuses: number | null
          created_at: string
          employee_id: string
          gross_pay: number
          id: string
          net_pay: number | null
          other_deductions: number | null
          pay_period: string
          payment_date: string | null
          payment_method: string | null
          status: string | null
          tax_deduction: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bonuses?: number | null
          created_at?: string
          employee_id: string
          gross_pay: number
          id?: string
          net_pay?: number | null
          other_deductions?: number | null
          pay_period: string
          payment_date?: string | null
          payment_method?: string | null
          status?: string | null
          tax_deduction?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bonuses?: number | null
          created_at?: string
          employee_id?: string
          gross_pay?: number
          id?: string
          net_pay?: number | null
          other_deductions?: number | null
          pay_period?: string
          payment_date?: string | null
          payment_method?: string | null
          status?: string | null
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
      legal_cases: {
        Row: {
          case_number: string
          created_at: string | null
          description: string
          documents: Json | null
          filing_date: string
          id: string
          next_hearing_date: string | null
          parties: Json | null
          priority: string | null
          resolution: string | null
          status: string | null
          title: string
          type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          case_number: string
          created_at?: string | null
          description: string
          documents?: Json | null
          filing_date: string
          id?: string
          next_hearing_date?: string | null
          parties?: Json | null
          priority?: string | null
          resolution?: string | null
          status?: string | null
          title: string
          type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          case_number?: string
          created_at?: string | null
          description?: string
          documents?: Json | null
          filing_date?: string
          id?: string
          next_hearing_date?: string | null
          parties?: Json | null
          priority?: string | null
          resolution?: string | null
          status?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      legal_compliances: {
        Row: {
          ai_recommendations: Json | null
          assigned_to: string | null
          category: string | null
          completed_date: string | null
          created_at: string | null
          description: string | null
          documents_required: Json | null
          due_date: string | null
          id: string
          name: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_recommendations?: Json | null
          assigned_to?: string | null
          category?: string | null
          completed_date?: string | null
          created_at?: string | null
          description?: string | null
          documents_required?: Json | null
          due_date?: string | null
          id?: string
          name: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_recommendations?: Json | null
          assigned_to?: string | null
          category?: string | null
          completed_date?: string | null
          created_at?: string | null
          description?: string | null
          documents_required?: Json | null
          due_date?: string | null
          id?: string
          name?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      legal_contracts: {
        Row: {
          ai_summary: string | null
          created_at: string | null
          document_url: string
          end_date: string | null
          id: string
          parties: Json | null
          renewal_date: string | null
          risk_score: number | null
          start_date: string | null
          status: string | null
          title: string
          type: string | null
          updated_at: string | null
          user_id: string
          value: number | null
        }
        Insert: {
          ai_summary?: string | null
          created_at?: string | null
          document_url: string
          end_date?: string | null
          id?: string
          parties?: Json | null
          renewal_date?: string | null
          risk_score?: number | null
          start_date?: string | null
          status?: string | null
          title: string
          type?: string | null
          updated_at?: string | null
          user_id: string
          value?: number | null
        }
        Update: {
          ai_summary?: string | null
          created_at?: string | null
          document_url?: string
          end_date?: string | null
          id?: string
          parties?: Json | null
          renewal_date?: string | null
          risk_score?: number | null
          start_date?: string | null
          status?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
          user_id?: string
          value?: number | null
        }
        Relationships: []
      }
      legal_policies: {
        Row: {
          approved_by: string | null
          category: string | null
          content: string
          created_at: string | null
          effective_date: string | null
          id: string
          last_review_date: string | null
          next_review_date: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
          version: string | null
        }
        Insert: {
          approved_by?: string | null
          category?: string | null
          content: string
          created_at?: string | null
          effective_date?: string | null
          id?: string
          last_review_date?: string | null
          next_review_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          version?: string | null
        }
        Update: {
          approved_by?: string | null
          category?: string | null
          content?: string
          created_at?: string | null
          effective_date?: string | null
          id?: string
          last_review_date?: string | null
          next_review_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          version?: string | null
        }
        Relationships: []
      }
      marketing_metrics: {
        Row: {
          clicks: number | null
          conversions: number | null
          created_at: string | null
          engagement: number | null
          id: string
          metric_date: string
          platform: string
          reach: number | null
          user_id: string
        }
        Insert: {
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          engagement?: number | null
          id?: string
          metric_date: string
          platform: string
          reach?: number | null
          user_id: string
        }
        Update: {
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          engagement?: number | null
          id?: string
          metric_date?: string
          platform?: string
          reach?: number | null
          user_id?: string
        }
        Relationships: []
      }
      marketing_posts: {
        Row: {
          comments: number | null
          content: string
          created_at: string | null
          id: string
          likes: number | null
          media_urls: Json | null
          platform: string
          published_time: string | null
          scheduled_time: string | null
          shares: number | null
          status: string | null
          updated_at: string | null
          user_id: string
          views: number | null
        }
        Insert: {
          comments?: number | null
          content: string
          created_at?: string | null
          id?: string
          likes?: number | null
          media_urls?: Json | null
          platform: string
          published_time?: string | null
          scheduled_time?: string | null
          shares?: number | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          views?: number | null
        }
        Update: {
          comments?: number | null
          content?: string
          created_at?: string | null
          id?: string
          likes?: number | null
          media_urls?: Json | null
          platform?: string
          published_time?: string | null
          scheduled_time?: string | null
          shares?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          views?: number | null
        }
        Relationships: []
      }
      marketing_targets: {
        Row: {
          created_at: string | null
          current_value: number | null
          deadline: string
          id: string
          name: string
          target_value: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_value?: number | null
          deadline: string
          id?: string
          name: string
          target_value: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_value?: number | null
          deadline?: string
          id?: string
          name?: string
          target_value?: number
          updated_at?: string | null
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
      ops_agentic_logs: {
        Row: {
          action: string
          agent: string
          created_at: string | null
          details: Json | null
          id: string
          status: string | null
          user_id: string
        }
        Insert: {
          action: string
          agent: string
          created_at?: string | null
          details?: Json | null
          id?: string
          status?: string | null
          user_id: string
        }
        Update: {
          action?: string
          agent?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ops_experiments: {
        Row: {
          created_at: string | null
          end_date: string | null
          hypothesis: string
          id: string
          learnings: string | null
          metrics: Json | null
          name: string
          results: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          hypothesis: string
          id?: string
          learnings?: string | null
          metrics?: Json | null
          name: string
          results?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          hypothesis?: string
          id?: string
          learnings?: string | null
          metrics?: Json | null
          name?: string
          results?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ops_sops: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          owner: string | null
          steps: Json
          title: string
          updated_at: string | null
          user_id: string
          version: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          owner?: string | null
          steps: Json
          title: string
          updated_at?: string | null
          user_id: string
          version?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          owner?: string | null
          steps?: Json
          title?: string
          updated_at?: string | null
          user_id?: string
          version?: string | null
        }
        Relationships: []
      }
      ops_tasks: {
        Row: {
          assignee: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          status: string | null
          subtasks: Json | null
          tags: Json | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assignee?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          subtasks?: Json | null
          tags?: Json | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assignee?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          subtasks?: Json | null
          tags?: Json | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ops_workflows: {
        Row: {
          created_at: string | null
          description: string | null
          execution_count: number | null
          id: string
          last_run: string | null
          name: string
          status: string | null
          steps: Json
          trigger: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          last_run?: string | null
          name: string
          status?: string | null
          steps: Json
          trigger: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          last_run?: string | null
          name?: string
          status?: string | null
          steps?: Json
          trigger?: string
          updated_at?: string | null
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
      sales_campaigns: {
        Row: {
          channel: string | null
          conversion_count: number | null
          created_at: string | null
          id: string
          name: string
          opened_count: number | null
          sent_count: number | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          channel?: string | null
          conversion_count?: number | null
          created_at?: string | null
          id?: string
          name: string
          opened_count?: number | null
          sent_count?: number | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          channel?: string | null
          conversion_count?: number | null
          created_at?: string | null
          id?: string
          name?: string
          opened_count?: number | null
          sent_count?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sales_leads: {
        Row: {
          ai_confidence: number | null
          business_mode: string | null
          company: string
          contact_name: string | null
          created_at: string | null
          deal_value: number | null
          email: string | null
          id: string
          last_activity: string | null
          phone: string | null
          progress: number | null
          source: string | null
          stage: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_confidence?: number | null
          business_mode?: string | null
          company: string
          contact_name?: string | null
          created_at?: string | null
          deal_value?: number | null
          email?: string | null
          id?: string
          last_activity?: string | null
          phone?: string | null
          progress?: number | null
          source?: string | null
          stage?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_confidence?: number | null
          business_mode?: string | null
          company?: string
          contact_name?: string | null
          created_at?: string | null
          deal_value?: number | null
          email?: string | null
          id?: string
          last_activity?: string | null
          phone?: string | null
          progress?: number | null
          source?: string | null
          stage?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sales_quotes: {
        Row: {
          client_name: string
          created_at: string | null
          id: string
          lead_id: string | null
          sent_at: string | null
          signed_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          value: number
        }
        Insert: {
          client_name: string
          created_at?: string | null
          id?: string
          lead_id?: string | null
          sent_at?: string | null
          signed_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          value: number
        }
        Update: {
          client_name?: string
          created_at?: string | null
          id?: string
          lead_id?: string | null
          sent_at?: string | null
          signed_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_quotes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "sales_leads"
            referencedColumns: ["id"]
          },
        ]
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
