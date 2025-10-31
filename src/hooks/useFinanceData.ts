import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect } from "react";

// ========================================
// TYPES
// ========================================

export type CompanyType = "private_limited" | "llp" | "opc" | "partnership" | "sole_proprietorship";
export type ComplianceType = "tax" | "statutory" | "labor" | "regulatory";
export type ComplianceFrequency = "monthly" | "quarterly" | "annual" | "one_time" | "event_based";
export type ComplianceTaskStatus = "upcoming" | "overdue" | "completed" | "not_applicable";
export type ComplianceTaskPriority = "low" | "medium" | "high" | "urgent";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export interface CompanyInfo {
  id: string;
  user_id: string;
  company_name: string;
  company_type: CompanyType;
  registration_number?: string;
  gst_number?: string;
  pan_number?: string;
  tan_number?: string;
  registration_date?: string;
  incorporation_state?: string;
  registered_address: Record<string, any>;
  number_of_directors: number;
  number_of_employees: number;
  financial_year_start?: number;
  created_at: string;
  updated_at: string;
}

export interface ComplianceRequirement {
  id: string;
  compliance_name: string;
  compliance_type: ComplianceType;
  applicable_company_types: CompanyType[];
  frequency: ComplianceFrequency;
  due_date_rule: {
    day: number;
    month_offset: number;
  };
  description?: string;
  required_documents: string[];
  penalties_for_non_compliance?: string;
  employee_threshold?: number;
  turnover_threshold?: number;
  is_system_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface ComplianceTask {
  id: string;
  user_id: string;
  compliance_requirement_id: string;
  title: string;
  description?: string;
  due_date: string;
  completed_date?: string;
  status: ComplianceTaskStatus;
  priority: ComplianceTaskPriority;
  ai_reminder_sent: boolean;
  proof_document_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  compliance_requirement?: ComplianceRequirement;
}

export interface PitchDeckAnalysis {
  id: string;
  user_id: string;
  deck_name: string;
  deck_url: string;
  analysis_date: string;
  analysis_summary?: string;
  financial_health_score?: number;
  key_insights: any[];
  red_flags: any[];
  recommendations: any[];
  investor_readiness_score?: number;
  created_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_name: string;
  client_email?: string;
  amount: number;
  status: InvoiceStatus;
  due_date: string;
  paid_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  vendor: string;
  expense_date: string;
  receipt_url?: string;
  status: "pending" | "approved" | "rejected";
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CashFlow {
  id: string;
  user_id: string;
  month: string;
  inflow: number;
  outflow: number;
  net_cash_flow: number;
  created_at: string;
}

export interface Runway {
  id: string;
  user_id: string;
  cash_balance: number;
  monthly_burn_rate: number;
  runway_months: number;
  updated_at: string;
}

export interface PayrollData {
  id: string;
  user_id: string;
  employee_id: string;
  pay_period: string;
  gross_pay: number;
  tax_deduction: number;
  other_deductions: number;
  bonuses: number;
  net_pay: number;
  status: "pending" | "processed" | "paid";
  payment_date?: string;
  created_at: string;
  updated_at: string;
  employee?: {
    id: string;
    name: string;
    designation: string;
    email: string;
  };
}

export interface PayrollSummary {
  total_monthly_payroll: number;
  total_gross_pay: number;
  total_tax_deductions: number;
  total_bonuses: number;
  total_net_pay: number;
  employee_count: number;
}

// ========================================
// COMPANY INFO HOOKS
// ========================================

export function useCompanyInfo() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["company-info"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("company_info")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as CompanyInfo | null;
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("company-info-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "company_info",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["company-info"] });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);

  return query;
}

export function useUpdateCompanyInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<CompanyInfo> & { id?: string }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const updateData = { ...data };
      delete updateData.id;

      // Check if company_info exists
      const { data: existing } = await supabase
        .from("company_info")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from("company_info")
          .update(updateData)
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        return data as CompanyInfo;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from("company_info")
          .insert({ ...updateData, user_id: user.id })
          .select()
          .single();

        if (error) throw error;
        return data as CompanyInfo;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-info"] });
      toast.success("Company information saved successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to save company information: ${error.message}`);
    },
  });
}

// ========================================
// COMPLIANCE HOOKS
// ========================================

export function useComplianceRequirements(companyType?: CompanyType) {
  return useQuery({
    queryKey: ["compliance-requirements", companyType],
    queryFn: async () => {
      let query = supabase
        .from("compliance_requirements")
        .select("*")
        .order("compliance_name");

      const { data, error } = await query;
      if (error) throw error;

      let requirements = data as ComplianceRequirement[];

      // Filter by company type if provided
      if (companyType) {
        requirements = requirements.filter((req) =>
          req.applicable_company_types.includes(companyType)
        );
      }

      return requirements;
    },
    staleTime: 1000 * 60 * 60, // 1 hour (reference data)
  });
}

export function useComplianceTasks(
  status?: ComplianceTaskStatus,
  dateRange?: { start: string; end: string }
) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["compliance-tasks", status, dateRange],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let query = supabase
        .from("compliance_tasks")
        .select(`
          *,
          compliance_requirement:compliance_requirements (*)
        `)
        .eq("user_id", user.id)
        .order("due_date", { ascending: true });

      if (status) {
        query = query.eq("status", status);
      }

      if (dateRange) {
        query = query
          .gte("due_date", dateRange.start)
          .lte("due_date", dateRange.end);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ComplianceTask[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("compliance-tasks-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "compliance_tasks",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["compliance-tasks"] });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);

  return query;
}

export function useCreateComplianceTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      task: Omit<ComplianceTask, "id" | "user_id" | "created_at" | "updated_at" | "ai_reminder_sent">
    ) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("compliance_tasks")
        .insert({
          ...task,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ComplianceTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-tasks"] });
      toast.success("Compliance task created!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create task: ${error.message}`);
    },
  });
}

export function useUpdateComplianceTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<ComplianceTask>;
    }) => {
      const { data, error } = await supabase
        .from("compliance_tasks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as ComplianceTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-tasks"] });
      toast.success("Task updated!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update task: ${error.message}`);
    },
  });
}

// ========================================
// PAYROLL HOOKS
// ========================================

export function usePayrollData(month?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["payroll-data", month],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let query = supabase
        .from("hr_payroll")
        .select(`
          *,
          employee:hr_employees (id, name, designation, email)
        `)
        .eq("user_id", user.id)
        .order("pay_period", { ascending: false });

      if (month) {
        query = query.eq("pay_period", month);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PayrollData[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("payroll-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "hr_payroll",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["payroll-data"] });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);

  return query;
}

export function usePayrollSummary(month?: string) {
  return useQuery({
    queryKey: ["payroll-summary", month],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let query = supabase
        .from("hr_payroll")
        .select("*")
        .eq("user_id", user.id);

      if (month) {
        query = query.eq("pay_period", month);
      } else {
        // Default to current month
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        query = query.eq("pay_period", currentMonth);
      }

      const { data, error } = await query;
      if (error) throw error;

      const payroll = data as PayrollData[];

      const summary: PayrollSummary = {
        total_monthly_payroll: payroll.reduce((sum, p) => sum + p.net_pay, 0),
        total_gross_pay: payroll.reduce((sum, p) => sum + p.gross_pay, 0),
        total_tax_deductions: payroll.reduce((sum, p) => sum + p.tax_deduction, 0),
        total_bonuses: payroll.reduce((sum, p) => sum + p.bonuses, 0),
        total_net_pay: payroll.reduce((sum, p) => sum + p.net_pay, 0),
        employee_count: payroll.length,
      };

      return summary;
    },
  });
}

// ========================================
// CASH FLOW HOOKS
// ========================================

export function useCashFlow(months: number = 6) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["cash-flow", months],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get last N months
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const { data, error } = await supabase
        .from("finance_cash_flow")
        .select("*")
        .eq("user_id", user.id)
        .gte("month", startDate.toISOString().split("T")[0])
        .lte("month", endDate.toISOString().split("T")[0])
        .order("month", { ascending: true });

      if (error) throw error;
      return data as CashFlow[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("cash-flow-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "finance_cash_flow",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["cash-flow"] });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);

  return query;
}

export function useRunway() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["runway"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("finance_runway")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Runway | null;
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("runway-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "finance_runway",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["runway"] });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);

  return query;
}

// ========================================
// INVOICE HOOKS
// ========================================

export function useInvoices(status?: InvoiceStatus, dateRange?: { start: string; end: string }) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["invoices", status, dateRange],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let query = supabase
        .from("finance_invoices")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      if (dateRange) {
        query = query
          .gte("due_date", dateRange.start)
          .lte("due_date", dateRange.end);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Invoice[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("invoices-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "finance_invoices",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["invoices"] });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);

  return query;
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      invoice: Omit<Invoice, "id" | "user_id" | "created_at" | "updated_at">
    ) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("finance_invoices")
        .insert({
          ...invoice,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice created!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create invoice: ${error.message}`);
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Invoice>;
    }) => {
      const { data, error } = await supabase
        .from("finance_invoices")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice updated!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update invoice: ${error.message}`);
    },
  });
}

// ========================================
// EXPENSE HOOKS
// ========================================

export function useExpenses(category?: string, dateRange?: { start: string; end: string }) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["expenses", category, dateRange],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let query = supabase
        .from("finance_expenses")
        .select("*")
        .eq("user_id", user.id)
        .order("expense_date", { ascending: false });

      if (category) {
        query = query.eq("category", category);
      }

      if (dateRange) {
        query = query
          .gte("expense_date", dateRange.start)
          .lte("expense_date", dateRange.end);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Expense[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("expenses-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "finance_expenses",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["expenses"] });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);

  return query;
}

// ========================================
// PITCH DECK ANALYSIS HOOKS
// ========================================

export function usePitchDeckAnalyses() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["pitch-deck-analyses"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("pitch_deck_analyses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PitchDeckAnalysis[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("pitch-deck-analyses-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pitch_deck_analyses",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["pitch-deck-analyses"] });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);

  return query;
}

export function useCreatePitchDeckAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      analysis: Omit<PitchDeckAnalysis, "id" | "user_id" | "created_at">
    ) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("pitch_deck_analyses")
        .insert({
          ...analysis,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as PitchDeckAnalysis;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pitch-deck-analyses"] });
      toast.success("Pitch deck analysis saved!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to save analysis: ${error.message}`);
    },
  });
}
