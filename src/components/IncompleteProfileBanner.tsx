import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Info, X } from "lucide-react";

export const IncompleteProfileBanner = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [completion, setCompletion] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkProfileCompletion();
  }, [user]);

  const checkProfileCompletion = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("profile_completion_percentage")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      const percentage = data?.profile_completion_percentage || 0;
      setCompletion(percentage);
      
      if (percentage < 100 && !dismissed) {
        setShow(true);
      }
    } catch (error) {
      console.error("Error checking profile completion:", error);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShow(false);
  };

  if (!show) return null;

  return (
    <Alert className="mb-6 border-primary/50 bg-primary/5">
      <Info className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-medium mb-1">
            Your profile is {completion}% complete
          </p>
          <p className="text-sm text-muted-foreground">
            Complete your profile to get better recommendations and personalized results.
          </p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/profile-settings")}
          >
            Complete Profile
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
