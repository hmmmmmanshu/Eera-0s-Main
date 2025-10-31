import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Types
export type HRRole = {
  id: string;
  user_id: string;
  title: string;
  department: string | null;
  jd_text: string | null;
  status: string;
  requirements: any;
  responsibilities: any;
  salary_range: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
};

export type HRCandidate = {
  id: string;
  user_id: string;
  role_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  resume_url: string | null;
  score: number | null;
  status: string;
  applied_date: string;
  interview_notes: string | null;
  screening_results: any;
  offer_letter: string | null;
  salary: string | null;
  created_at: string;
  updated_at: string;
};

// Fetch all job roles
export function useHRRoles() {
  return useQuery({
    queryKey: ["hr-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hr_roles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as HRRole[];
    },
  });
}

// Fetch all candidates
export function useHRCandidates(roleId?: string) {
  return useQuery({
    queryKey: ["hr-candidates", roleId],
    queryFn: async () => {
      let query = supabase
        .from("hr_candidates")
        .select("*")
        .order("applied_date", { ascending: false });

      if (roleId) {
        query = query.eq("role_id", roleId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as HRCandidate[];
    },
  });
}

// Create job role
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (role: Omit<HRRole, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("hr_roles")
        .insert({ ...role, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-roles"] });
      toast.success("Job role created successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to create role: ${error.message}`);
    },
  });
}

// Create candidate
export function useCreateCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (candidate: Omit<HRCandidate, "id" | "user_id" | "created_at" | "updated_at" | "applied_date">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("hr_candidates")
        .insert({ ...candidate, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-candidates"] });
      toast.success("Candidate added successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to add candidate: ${error.message}`);
    },
  });
}

// Update candidate
export function useUpdateCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<HRCandidate> }) => {
      const { data, error } = await supabase
        .from("hr_candidates")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-candidates"] });
      toast.success("Candidate updated successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to update candidate: ${error.message}`);
    },
  });
}

