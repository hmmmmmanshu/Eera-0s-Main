import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Types
export type BusinessMode = "b2b" | "b2c" | "b2b2b";
export type LeadStage = "lead" | "contacted" | "proposal" | "negotiation" | "won" | "lost";
export type LeadSource = "LinkedIn" | "Email" | "Website" | "Referrals" | "Other";
export type TimeRange = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

export type SalesLead = {
  id: string;
  user_id: string;
  company: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  deal_value: number;
  stage: LeadStage;
  business_mode: BusinessMode;
  source: LeadSource | null;
  ai_confidence: number;
  progress: number;
  last_activity: string;
  created_at: string;
  updated_at: string;
};

export type SalesCampaign = {
  id: string;
  user_id: string;
  name: string;
  status: "active" | "completed" | "paused";
  channel: "email" | "linkedin" | "phone" | "other" | null;
  sent_count: number;
  opened_count: number;
  conversion_count: number;
  created_at: string;
  updated_at: string;
};

export type SalesQuote = {
  id: string;
  user_id: string;
  lead_id: string | null;
  client_name: string;
  value: number;
  status: "pending" | "sent" | "signed" | "rejected";
  created_at: string;
  sent_at: string | null;
  signed_at: string | null;
  updated_at: string;
};

export type SalesKPIs = {
  leadsGenerated: { value: number; change: number };
  conversionRate: { value: number; change: number };
  totalRevenue: { value: number; change: number };
  avgDealSize: { value: number; change: number };
  activeCampaigns: { value: number; change: number };
};

// Helper function to calculate date range
function getDateRange(timeRange: TimeRange): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = new Date();

  switch (timeRange) {
    case "daily":
      startDate.setDate(endDate.getDate() - 1);
      break;
    case "weekly":
      startDate.setDate(endDate.getDate() - 7);
      break;
    case "monthly":
      startDate.setMonth(endDate.getMonth() - 1);
      break;
    case "quarterly":
      startDate.setMonth(endDate.getMonth() - 3);
      break;
    case "yearly":
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
  }

  return { startDate, endDate };
}

// Fetch all sales leads with filters
export function useSalesLeads(
  timeRange?: TimeRange,
  businessMode?: BusinessMode | "all",
  stage?: LeadStage
) {
  return useQuery({
    queryKey: ["sales-leads", timeRange, businessMode, stage],
    queryFn: async () => {
      let query = supabase
        .from("sales_leads")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply time range filter
      if (timeRange) {
        const { startDate } = getDateRange(timeRange);
        query = query.gte("created_at", startDate.toISOString());
      }

      // Apply business mode filter
      if (businessMode && businessMode !== "all") {
        query = query.eq("business_mode", businessMode);
      }

      // Apply stage filter
      if (stage) {
        query = query.eq("stage", stage);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as SalesLead[];
    },
  });
}

// Create new lead
export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      lead: Omit<SalesLead, "id" | "user_id" | "created_at" | "updated_at" | "last_activity">
    ) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("sales_leads")
        .insert({ ...lead, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-leads"] });
      queryClient.invalidateQueries({ queryKey: ["sales-kpis"] });
      toast.success("Lead created successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to create lead: ${error.message}`);
    },
  });
}

// Update lead
export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SalesLead> }) => {
      const { data, error } = await supabase
        .from("sales_leads")
        .update({ ...updates, last_activity: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-leads"] });
      queryClient.invalidateQueries({ queryKey: ["sales-kpis"] });
      toast.success("Lead updated successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to update lead: ${error.message}`);
    },
  });
}

// Delete lead
export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sales_leads").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-leads"] });
      queryClient.invalidateQueries({ queryKey: ["sales-kpis"] });
      toast.success("Lead deleted successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to delete lead: ${error.message}`);
    },
  });
}

// Fetch sales campaigns
export function useSalesCampaigns() {
  return useQuery({
    queryKey: ["sales-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SalesCampaign[];
    },
  });
}

// Fetch sales quotes
export function useSalesQuotes() {
  return useQuery({
    queryKey: ["sales-quotes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_quotes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SalesQuote[];
    },
  });
}

// Calculate KPIs
export function useSalesKPIs(timeRange: TimeRange = "monthly", businessMode: BusinessMode | "all" = "all") {
  return useQuery({
    queryKey: ["sales-kpis", timeRange, businessMode],
    queryFn: async () => {
      const { startDate, endDate } = getDateRange(timeRange);

      // Fetch current period data
      let currentQuery = supabase
        .from("sales_leads")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (businessMode !== "all") {
        currentQuery = currentQuery.eq("business_mode", businessMode);
      }

      const { data: currentLeads, error: currentError } = await currentQuery;
      if (currentError) throw currentError;

      // Fetch previous period data for comparison
      const prevStartDate = new Date(startDate);
      const prevEndDate = new Date(startDate);
      const timeDiff = endDate.getTime() - startDate.getTime();
      prevStartDate.setTime(prevStartDate.getTime() - timeDiff);

      let prevQuery = supabase
        .from("sales_leads")
        .select("*")
        .gte("created_at", prevStartDate.toISOString())
        .lte("created_at", prevEndDate.toISOString());

      if (businessMode !== "all") {
        prevQuery = prevQuery.eq("business_mode", businessMode);
      }

      const { data: prevLeads, error: prevError } = await prevQuery;
      if (prevError) throw prevError;

      // Calculate current metrics
      const leadsGenerated = currentLeads?.length || 0;
      const wonLeads = currentLeads?.filter((l) => l.stage === "won").length || 0;
      const conversionRate = leadsGenerated > 0 ? (wonLeads / leadsGenerated) * 100 : 0;
      const totalRevenue = currentLeads
        ?.filter((l) => l.stage === "won")
        .reduce((sum, l) => sum + (l.deal_value || 0), 0) || 0;
      const avgDealSize = wonLeads > 0 ? totalRevenue / wonLeads : 0;

      // Calculate previous metrics
      const prevLeadsGenerated = prevLeads?.length || 0;
      const prevWonLeads = prevLeads?.filter((l) => l.stage === "won").length || 0;
      const prevConversionRate = prevLeadsGenerated > 0 ? (prevWonLeads / prevLeadsGenerated) * 100 : 0;
      const prevTotalRevenue = prevLeads
        ?.filter((l) => l.stage === "won")
        .reduce((sum, l) => sum + (l.deal_value || 0), 0) || 0;
      const prevAvgDealSize = prevWonLeads > 0 ? prevTotalRevenue / prevWonLeads : 0;

      // Calculate changes
      const leadsChange = prevLeadsGenerated > 0 
        ? ((leadsGenerated - prevLeadsGenerated) / prevLeadsGenerated) * 100 
        : 0;
      const conversionChange = prevConversionRate > 0 
        ? conversionRate - prevConversionRate 
        : 0;
      const revenueChange = prevTotalRevenue > 0 
        ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100 
        : 0;
      const avgDealChange = prevAvgDealSize > 0 
        ? ((avgDealSize - prevAvgDealSize) / prevAvgDealSize) * 100 
        : 0;

      // Fetch active campaigns
      const { data: campaigns } = await supabase
        .from("sales_campaigns")
        .select("*")
        .eq("status", "active");

      const activeCampaigns = campaigns?.length || 0;

      const kpis: SalesKPIs = {
        leadsGenerated: { value: leadsGenerated, change: leadsChange },
        conversionRate: { value: conversionRate, change: conversionChange },
        totalRevenue: { value: totalRevenue, change: revenueChange },
        avgDealSize: { value: avgDealSize, change: avgDealChange },
        activeCampaigns: { value: activeCampaigns, change: 0 },
      };

      return kpis;
    },
  });
}

