import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Plus, FolderOpen } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOpsSkills } from "@/hooks/useOpsSkills";
import { toast } from "sonner";

export function SOPLibrary() {
  const sops = [
    { 
      id: 1, 
      title: "Monthly Financial Close", 
      category: "Finance", 
      version: "v2.3",
      lastUpdated: "2 days ago"
    },
    { 
      id: 2, 
      title: "New Employee Onboarding", 
      category: "HR", 
      version: "v1.8",
      lastUpdated: "1 week ago"
    },
    { 
      id: 3, 
      title: "Marketing Campaign Launch", 
      category: "Marketing", 
      version: "v3.1",
      lastUpdated: "3 days ago"
    },
    { 
      id: 4, 
      title: "Product Release Checklist", 
      category: "Product", 
      version: "v2.0",
      lastUpdated: "5 days ago"
    },
    { 
      id: 5, 
      title: "Customer Support Escalation", 
      category: "Support", 
      version: "v1.5",
      lastUpdated: "1 week ago"
    },
  ];

  const categories = ["All", "Finance", "HR", "Marketing", "Product", "Support"];

  const { user } = useAuth();
  const { generateSOPSteps } = useOpsSkills(user?.id);
  const [title, setTitle] = useState("");
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <Card className="border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            SOP Library
          </span>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New SOP
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <Badge 
              key={cat} 
              variant={cat === "All" ? "default" : "secondary"}
              className="cursor-pointer hover:bg-accent/20"
            >
              {cat}
            </Badge>
          ))}
        </div>

        <div className="p-3 rounded-lg border space-y-2">
          <div className="text-sm font-medium">Convert draft into SOP steps</div>
          <Input placeholder="SOP title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea rows={4} placeholder="Paste a draft procedure here..." value={draft} onChange={(e) => setDraft(e.target.value)} />
          <Button disabled={busy} onClick={async () => {
            if (!title.trim() || !draft.trim()) { toast.error("Enter title and draft"); return; }
            try {
              setBusy(true);
              const id = await generateSOPSteps(title.trim(), draft.trim());
              toast.success("SOP created");
              setTitle(""); setDraft("");
            } catch (e: any) { toast.error(e?.message || "Failed to generate steps"); } finally { setBusy(false); }
          }}>Convert to Steps</Button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sops.map((sop) => (
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
                      Updated {sop.lastUpdated}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {sop.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{sop.version}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
