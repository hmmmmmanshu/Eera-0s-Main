import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const HUBS = ["marketing","sales","finance","ops","hr","legal","cognitive","other"] as const;

export function FeatureRequestButton() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [hub, setHub] = useState<(typeof HUBS)[number]>("cognitive");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!user?.id) {
      toast.error("Please sign in to request a feature.");
      return;
    }
    if (!desc.trim()) {
      toast.error("Please describe the feature.");
      return;
    }
    try {
      setSubmitting(true);
      const { error } = await supabase
        .from("feature_requests")
        .insert({ user_id: user.id, hub, title: title.trim() || null, description: desc.trim(), status: "new" });
      if (error) throw error;
      toast.success("Feature request submitted. Thank you!");
      setOpen(false);
      setTitle("");
      setDesc("");
      setHub("cognitive");
    } catch (e: any) {
      toast.error(e?.message || "Could not submit feature request");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Request a feature</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request a feature</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">Hub</label>
                <select value={hub} onChange={(e) => setHub(e.target.value as any)} className="w-full h-9 rounded border bg-background px-2 text-sm">
                  {HUBS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div className="flex-[2]">
                <label className="text-xs text-muted-foreground">Short title (optional)</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="eg. Weekly focus board" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Describe the feature</label>
              <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={5} placeholder="What should it do? Why is it useful?" />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={submit} disabled={submitting}>{submitting ? "Submitting…" : "Submit"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


