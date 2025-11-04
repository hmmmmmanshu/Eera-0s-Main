import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FeatureRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeatureRequestDialog({ open, onOpenChange }: FeatureRequestDialogProps) {
  const { user } = useAuth();
  const [hub, setHub] = useState<string>("cognitive");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const hubs = ["cognitive", "marketing", "sales", "finance", "ops", "hr", "legal", "general"];

  async function submit() {
    if (!title.trim() || !details.trim()) {
      toast.error("Please provide a short title and a description.");
      return;
    }
    try {
      setSubmitting(true);
      const { error } = await supabase.from("feature_requests").insert({
        user_id: user?.id || null,
        hub,
        title: title.trim(),
        description: details.trim(),
        status: "new",
      });
      if (error) throw error;
      toast.success("Thanks! Your request was submitted.");
      setTitle("");
      setDetails("");
      setHub("cognitive");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message || "Could not submit request");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request a feature</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Hub</label>
            <Select value={hub} onValueChange={setHub}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select hub" />
              </SelectTrigger>
              <SelectContent>
                {hubs.map((h) => (
                  <SelectItem key={h} value={h}>{h}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Feature title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Weekly focus board in Cognitive" className="mt-1" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Describe what you need</label>
            <Textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Briefly explain the feature and the problem it solves" className="mt-1 min-h-[96px]" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={submit} disabled={submitting}>{submitting ? "Submitting…" : "Submit"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


