import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { useAuth } from "@/contexts/AuthContext";
import { useCognitiveActions } from "@/hooks/useCognitive";
import { useState } from "react";

export function CognitiveDiagnostics() {
  const { user } = useAuth();
  const { preflightLLM, weeklyOverview } = useCognitiveActions(user?.id);
  const [llmModel, setLlmModel] = useState<string | null>(null);
  const [weekOk, setWeekOk] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <Card className="border-lime-500/20 bg-gradient-to-br from-lime-500/5 to-emerald-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <DynamicIcon name="Beaker" className="h-4 w-4 text-lime-500"  />
          Cognitive Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="flex items-center gap-2">
          <Badge variant={llmModel ? "default" : "outline"}>LLM: {llmModel || "unknown"}</Badge>
          <Badge variant={weekOk ? "default" : "outline"}>Weekly Snapshot: {weekOk === null ? "…" : weekOk ? "OK" : "—"}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline" disabled={busy} onClick={async () => {
            setBusy(true);
            try {
              const pf = await preflightLLM();
              setLlmModel(pf.model || null);
            } finally { setBusy(false); }
          }}>Preflight LLM</Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={async () => {
            setBusy(true);
            try {
              const snap = await weeklyOverview();
              const payload = (snap as any)?.payload || snap;
              setWeekOk(!!payload);
            } finally { setBusy(false); }
          }}>Verify Weekly</Button>
        </div>
      </CardContent>
    </Card>
  );
}


