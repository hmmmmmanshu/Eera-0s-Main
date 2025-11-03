import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Map route paths to activity_log hub_name values
const hubNameMap: Record<string, string> = {
  "/marketing": "marketing",
  "/finance": "finance",
  "/sales": "sales",
  "/operations": "ops",
  "/ops": "ops", // alias
  "/hr": "hiring",
  "/legal": "legal", // Note: may need to add to DB schema if not supported
  "/cognitive": "cognitive", // Note: may need to add to DB schema if not supported
};

type HubName = "marketing" | "finance" | "ops" | "hiring" | "sales";

/**
 * Hook to log user activity for activity heatmap
 * Call this when user visits a hub or performs an action
 */
export function useActivityLogger() {
  const { user } = useAuth();

  const logActivity = useCallback(
    async (hubPath: string, activityType: string = "visit") => {
      if (!user) return;

      const hubName = hubNameMap[hubPath] as HubName;
      if (!hubName) {
        // Skip logging for unmapped hubs (like legal, cognitive if not in schema)
        return;
      }

      const today = new Date().toISOString().split("T")[0];

      try {
        // Check if activity exists for today
        const { data: existing } = await supabase
          .from("activity_log")
          .select("id, activity_count")
          .eq("user_id", user.id)
          .eq("hub_name", hubName)
          .eq("activity_date", today)
          .single();

        if (existing) {
          // Update: increment count
          await supabase
            .from("activity_log")
            .update({
              activity_count: existing.activity_count + 1,
              activity_type: activityType,
            })
            .eq("id", existing.id);
        } else {
          // Insert: new activity for today
          await supabase.from("activity_log").insert({
            user_id: user.id,
            hub_name: hubName,
            activity_type: activityType,
            activity_date: today,
            activity_count: 1,
          });
        }
      } catch (error) {
        // Silently fail to avoid disrupting user experience
        console.error("Failed to log activity:", error);
      }
    },
    [user]
  );

  return { logActivity };
}

