import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useCognitiveActions } from "@/hooks/useCognitive";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import { Loader2, Maximize2, Minimize2 } from "lucide-react";

export function CognitiveChatPanel({ onPlanCreated }: { onPlanCreated?: (planId?: string | null) => void }) {
  const { user } = useAuth();
  const { preflightLLM } = useCognitiveActions(user?.id);
  const { sendChatWithPlanExtractStreaming } = useCognitiveActions(user?.id) as any;
  const [messages, setMessages] = useState<{ role: "user"|"assistant", text: string; streaming?: boolean }[]>([
    { role: "assistant", text: "Hi! What should we work on today?" }
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [modelOk, setModelOk] = useState<boolean | null>(null);
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [fullScreen, setFullScreen] = useState(false);
  const { createOrGetSession, listRecentMessages } = useCognitiveActions(user?.id) as any;

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

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // If user clicked Continue from plans list, pre-fill a helpful prompt
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const cont = sp.get("continuePlan");
    if (cont) {
      setMessages((h) => [...h, { role: "assistant", text: "Continuing the selected plan. Share your next detail or ask to generate steps." }]);
    }
  }, [location.search]);

  // Load recent messages from the latest session on mount
  useEffect(() => {
    (async () => {
      try {
        const sessionId = await createOrGetSession("cognitive");
        const recent = await listRecentMessages(sessionId, 20);
        if (recent && recent.length > 0) {
          const mapped = recent.map((m: any) => ({ role: m.role as "user"|"assistant", text: m.content as string }));
          setMessages(mapped);
        }
      } catch {
        // ignore loading errors
      }
    })();
  }, [createOrGetSession, listRecentMessages]);

  const handleSend = async () => {
    if (!input.trim() || busy || !modelOk) return;
    
    const msg = input.trim();
    setInput("");
    setBusy(true);

    // Optimistic UI: Add user message immediately
    setMessages((h) => [...h, { role: "user", text: msg }]);
    
    // Add typing indicator
    setMessages((h) => [...h, { role: "assistant", text: "", streaming: true }]);

    try {
      let fullReply = "";
      const stream = sendChatWithPlanExtractStreaming(msg);

      for await (const item of stream) {
        if (item.chunk) {
          fullReply += item.chunk;
          // Update the last message with streaming content
          setMessages((h) => {
            const newMessages = [...h];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg && lastMsg.role === "assistant") {
              lastMsg.text = fullReply;
              lastMsg.streaming = true;
            }
            return newMessages;
          });
        }

        if (item.complete) {
          // Finalize the message
          setMessages((h) => {
            const newMessages = [...h];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg && lastMsg.role === "assistant") {
              lastMsg.text = item.complete.reply;
              lastMsg.streaming = false;
            }
            return newMessages;
          });
          
          onPlanCreated?.(item.complete.pinnedPlanId);
          break; // Exit loop once complete
        }
      }
    } catch (e: any) {
      toast.error(e?.message || "Chat failed");
      // Remove the streaming message on error
      setMessages((h) => {
        const filtered = h.filter((msg, idx) => {
          // Remove the last assistant message if it's empty/streaming
          if (idx === h.length - 1 && msg.role === "assistant" && !msg.text) {
            return false;
          }
          return true;
        });
        return filtered;
      });
    } finally {
      setBusy(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className={`border-accent/30 ${fullScreen ? "fixed inset-0 z-50 rounded-none" : ""}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Acharya Chat</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={modelOk ? "default" : "outline"}>{modelOk === false ? "Model unavailable" : "Ready"}</Badge>
            <Button size="icon" variant="ghost" onClick={() => setFullScreen((v) => !v)}>
              {fullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] p-3 rounded-lg text-sm relative ${
                m.role === "user" 
                  ? "bg-accent text-accent-foreground" 
                  : "bg-muted border"
              }`}>
                {m.text || (m.streaming && <span className="text-muted-foreground">Thinking...</span>)}
                {m.streaming && (
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground ml-2 inline" />
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex gap-2">
          <Input 
            placeholder="Chat with Acharya… (Press Enter to send)" 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={busy || !modelOk}
          />
          <Button 
            disabled={busy || !modelOk || !input.trim()} 
            onClick={handleSend}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


