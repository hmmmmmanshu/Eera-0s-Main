import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useCognitiveActions } from "@/hooks/useCognitive";
import { useState } from "react";
import { toast } from "sonner";

export function JournalPanel() {
  const { user } = useAuth();
  const { addReflection } = useCognitiveActions(user?.id);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <Card className="border-accent/30">
      <CardHeader><CardTitle>Journaling & Reflection</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Textarea rows={3} placeholder="Write freely…" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="flex items-center gap-2">
          <Button disabled={busy} onClick={async () => {
            if (!text.trim()) { toast.error("Write something first"); return; }
            try {
              setBusy(true);
              await addReflection({ type: "journal", content: text.trim() });
              toast.success("Saved");
              setText("");
            } catch (e: any) { toast.error(e?.message || "Failed"); } finally { setBusy(false); }
          }}>Save</Button>
          <Button variant="outline">View Monthly</Button>
          <Button variant="outline">View Weekly</Button>
        </div>
      </CardContent>
    </Card>
  );
}


