import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActivitySquare, Beaker } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCognitiveActions } from "@/hooks/useCognitive";
import { useState } from "react";

export function CognitiveDiagnostics() {
  const { user } = useAuth();
  const { preflightLLM, skillsStatus, weeklyOverview } = useCognitiveActions(user?.id);
  const [llmModel, setLlmModel] = useState<string | null>(null);
  const [dockerOn, setDockerOn] = useState<boolean | null>(null);
  const [skills, setSkills] = useState<Array<{ id: string; healthy: boolean }>>([]);
  const [weekOk, setWeekOk] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <Card className="border-lime-500/20 bg-gradient-to-br from-lime-500/5 to-emerald-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Beaker className="h-4 w-4 text-lime-500" />
          Cognitive Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="flex items-center gap-2">
          <Badge variant={llmModel ? "default" : "outline"}>LLM: {llmModel || "unknown"}</Badge>
          <Badge variant={dockerOn ? "default" : "outline"}>Docker: {dockerOn === null ? "…" : dockerOn ? "On" : "Off"}</Badge>
          <Badge variant={weekOk ? "default" : "outline"}>Weekly Snapshot: {weekOk === null ? "…" : weekOk ? "OK" : "—"}</Badge>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button size="sm" variant="outline" disabled={busy} onClick={async () => {
            setBusy(true);
            try {
              const pf = await preflightLLM();
              setLlmModel(pf.model);
            } finally { setBusy(false); }
          }}>Preflight LLM</Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={async () => {
            setBusy(true);
            try {
              const st = await skillsStatus();
              setDockerOn(!!st?.dockerAvailable);
              setSkills(st?.skills || []);
            } finally { setBusy(false); }
          }}>Check Skills</Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={async () => {
            setBusy(true);
            try {
              const snap = await weeklyOverview();
              const payload = (snap as any)?.payload || snap;
              setWeekOk(!!payload);
            } finally { setBusy(false); }
          }}>Verify Weekly</Button>
        </div>
        {skills.length > 0 && (
          <div className="grid grid-cols-2 gap-1">
            {skills.map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                <ActivitySquare className={`h-3 w-3 ${s.healthy ? "text-green-500" : "text-amber-600"}`} />
                <span>{s.id}: {s.healthy ? "healthy" : "down"}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


