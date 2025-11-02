import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useCognitiveActions } from "@/hooks/useCognitive";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";

export function CognitiveChatPanel({ onPlanCreated }: { onPlanCreated?: (planId?: string | null) => void }) {
  const { user } = useAuth();
  const { preflightLLM } = useCognitiveActions(user?.id);
  const { sendChatWithPlanExtract } = useCognitiveActions(user?.id) as any;
  const { } = useCognitiveActions(user?.id) as any;
  const [messages, setMessages] = useState<{ role: "user"|"assistant", text: string }[]>([
    { role: "assistant", text: "Hi! What should we work on today?" }
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [modelOk, setModelOk] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    (async () => {
      try {
        const pf = await preflightLLM();
        setModelOk(!!pf.model || pf.ok);
      } catch {
        setModelOk(false);
      }
    })();
  }, [preflightLLM]);

  // If user clicked Continue from plans list, pre-fill a helpful prompt
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const cont = sp.get("continuePlan");
    if (cont) {
      setMessages((h) => [...h, { role: "assistant", text: "Continuing the selected plan. Share your next detail or ask to generate steps." }]);
    }
  }, [location.search]);

  return (
    <Card className="border-accent/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Acharya Chat</CardTitle>
          <Badge variant={modelOk ? "default" : "outline"}>{modelOk === false ? "Model unavailable" : "Ready"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] p-3 rounded-lg text-sm ${m.role === "user" ? "bg-accent text-accent-foreground" : "bg-muted border"}`}>{m.text}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input placeholder="Chat with Acharya…" value={input} onChange={(e) => setInput(e.target.value)} />
          <Button disabled={busy || !modelOk} onClick={async () => {
            if (!input.trim()) return;
            try {
              setBusy(true);
              const msg = input.trim();
              setMessages((h) => [...h, { role: "user", text: msg }]);
              setInput("");
              const res = await sendChatWithPlanExtract(msg);
              if (res?.classification?.hub) {
                // show classification chip above reply
              }
              setMessages((h) => [...h, { role: "assistant", text: res.reply }]);
              onPlanCreated?.(res?.pinnedPlanId);
            } catch (e: any) {
              toast.error(e?.message || "Chat failed");
            } finally { setBusy(false); }
          }}>Send</Button>
        </div>
      </CardContent>
    </Card>
  );
}


