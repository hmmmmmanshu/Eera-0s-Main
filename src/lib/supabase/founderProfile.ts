import { supabase } from "@/integrations/supabase/client";
import type { FounderProfile } from "@/lib/bots/prompts";

/**
 * Get founder profile data from Supabase
 */
export async function getFounderProfile(): Promise<FounderProfile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "startup_name, founder_name, company_stage, industry, about, target_audience, key_offerings, brand_values, competitive_edge"
    )
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching founder profile:", error);
    return null;
  }

  return {
    startup_name: data.startup_name,
    founder_name: data.founder_name,
    company_stage: data.company_stage,
    industry: data.industry,
    about: data.about,
    target_audience: data.target_audience,
    key_offerings: data.key_offerings,
    brand_values: data.brand_values,
    competitive_edge: data.competitive_edge,
  };
}

