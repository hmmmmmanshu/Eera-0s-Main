import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Plus, FolderOpen } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function SOPLibrary() {
  const { user } = useAuth();
  const [sops, setSops] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [draft, setDraft] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadSOPs();
    }
  }, [user?.id]);

  const loadSOPs = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("ops_sops")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      setSops(data || []);
    } catch (e: any) {
      toast.error("Failed to load SOPs");
    } finally {
      setLoading(false);
    }
  };

  const addSOP = async () => {
    if (!title.trim() || !draft.trim() || !user?.id) {
      toast.error("Enter title and content");
      return;
    }
    try {
      const { error } = await supabase
        .from("ops_sops")
        .insert({
          user_id: user.id,
          title: title.trim(),
          steps: [{ description: draft.trim(), order: 1 }], // Simple manual step
          version: "1.0",
        });
      if (error) throw error;
      toast.success("SOP created");
      setTitle("");
      setDraft("");
      setShowAddForm(false);
      loadSOPs();
    } catch (e: any) {
      toast.error(e?.message || "Failed to create SOP");
    }
  };

  return (
    <Card className="border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FolderOpen className="h-5 w-5" />
          SOP Library
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showAddForm ? (
          <Button
            size="sm"
            className="gap-2"
            onClick={() => setShowAddForm(true)}
            disabled={!user}
          >
            <Plus className="h-4 w-4" />
            New SOP
          </Button>
        ) : (
          <div className="p-3 rounded-lg border space-y-2">
            <div className="text-sm font-medium">Create New SOP</div>
            <Input
              placeholder="SOP title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              rows={4}
              placeholder="Enter procedure steps..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={addSOP} disabled={!title.trim() || !draft.trim()}>
                Create SOP
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowAddForm(false);
                  setTitle("");
                  setDraft("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-sm text-muted-foreground text-center py-8">Loading...</div>
          ) : sops.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">No SOPs yet</div>
          ) : (
            sops.map((sop) => (
              <div
                key={sop.id}
                className="p-4 rounded-lg border border-accent/20 bg-background/50 hover:border-accent/40 transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 flex-1">
                    <FileText className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium">{sop.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {sop.created_at ? `Created ${new Date(sop.created_at).toLocaleDateString()}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {sop.version || "v1.0"}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
