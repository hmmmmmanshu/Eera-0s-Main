import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    // Only check when the authenticated user changes.
    // Avoid flipping to a blocking loading state on every route change.
    checkOnboardingStatus(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const checkOnboardingStatus = async (showBlockingLoader: boolean) => {
    if (!user) {
      setCheckingOnboarding(false);
      return;
    }

    if (showBlockingLoader || needsOnboarding === null) {
    setCheckingOnboarding(true);
    }
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      const needsOnboard = !data?.onboarding_completed;
      setNeedsOnboarding(needsOnboard);
      
      console.log("Onboarding check:", {
        userId: user.id,
        onboarding_completed: data?.onboarding_completed,
        needsOnboarding: needsOnboard,
        currentPath: location.pathname
      });
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      // On error, assume onboarding is not needed to avoid blocking
      setNeedsOnboarding(false);
    } finally {
      setCheckingOnboarding(false);
    }
  };

  if (loading || (checkingOnboarding && needsOnboarding === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (needsOnboarding && location.pathname !== "/onboarding" && location.pathname !== "/dashboard") {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};
