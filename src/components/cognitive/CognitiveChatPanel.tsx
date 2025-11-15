import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useCognitiveActions } from "@/hooks/useCognitive";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { FeatureRequestButton } from "@/components/FeatureRequestButton";

export function CognitiveChatPanel({ onPlanCreated }: { onPlanCreated?: (planId?: string | null) => void }) {
  const { user } = useAuth();
  const { preflightLLM } = useCognitiveActions(user?.id);
  const { sendChatWithPlanExtractStreaming, listSessions, listRecentMessages, createOrGetSession, renameSession, topicOfTheDay } = useCognitiveActions(user?.id) as any;
  const [messages, setMessages] = useState<{ role: "user"|"assistant", text: string; streaming?: boolean }[]>([
    { role: "assistant", text: "Hi! What should we work on today?" }
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [modelOk, setModelOk] = useState<boolean | null>(null);
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [fullScreen, setFullScreen] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [persona, setPersona] = useState<"friend"|"guide"|"mentor"|"ea">("friend");
  const [dailyTopic, setDailyTopic] = useState<string>("");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const pf = await preflightLLM();
        setModelOk(!!pf.model || pf.ok);
      } catch {
        setModelOk(false);
      }
      try {
        const t = await topicOfTheDay();
        setDailyTopic(t);
      } catch {}
    })();
  }, [preflightLLM, topicOfTheDay]);

  // Auto-scroll to bottom only when user sends a new message or when streaming
  // NOT when loading history from a different session
  useEffect(() => {
    if (shouldAutoScroll && !historyLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setShouldAutoScroll(false);
    }
  }, [messages, shouldAutoScroll, historyLoading]);

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
        setHistoryLoading(true);
        setShouldAutoScroll(false); // Don't auto-scroll on initial load
        const s = await listSessions(6);
        if (!s || s.length === 0) {
          const sessionId = await createOrGetSession("cognitive");
          setSessions([{ id: sessionId, title: "New Session" }]);
          setActiveSessionId(sessionId);
          setMessages([{ role: "assistant", text: "Hi! What should we work on today?" }]);
        } else {
          setSessions(s);
          setActiveSessionId(s[0].id);
          const recent = await listRecentMessages(s[0].id, 20);
          const mapped = (recent || []).map((m: any) => ({ role: m.role as "user"|"assistant", text: m.content as string }));
          setMessages(mapped.length ? mapped : [{ role: "assistant", text: "Hi! What should we work on today?" }]);
        }
      } catch {
        // ignore loading errors
      } finally {
        setHistoryLoading(false);
      }
    })();
  }, [listSessions, createOrGetSession, listRecentMessages]);

  const handleSend = async () => {
    if (!input.trim() || busy || !modelOk) return;
    
    const msg = input.trim();
    setInput("");
    setBusy(true);

    // Optimistic UI: Add user message immediately
    setMessages((h) => [...h, { role: "user", text: msg }]);
    setShouldAutoScroll(true); // Enable auto-scroll when user sends a message
    
    // Add typing indicator
    setMessages((h) => [...h, { role: "assistant", text: "", streaming: true }]);

    try {
      let fullReply = "";
      const stream = sendChatWithPlanExtractStreaming(msg, activeSessionId || undefined, persona);

      for await (const item of stream) {
        if (item.chunk) {
          fullReply += item.chunk;
          // Update the last message with streaming content
          setMessages((h) => {
            const newMessages = [...h];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg && lastMsg.role === "assistant") {
              lastMsg.text = sanitizeAssistant(fullReply);
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
              lastMsg.text = sanitizeAssistant(item.complete.reply);
              lastMsg.streaming = false;
            }
            return newMessages;
          });
          setShouldAutoScroll(true); // Auto-scroll when message completes
          
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

  const handleQuick = async (prompt: string) => {
    if (busy || !modelOk) return;
    setInput(prompt);
    await new Promise((r) => setTimeout(r, 0));
    await handleSend();
  };

  return (
    <Card className={`border-accent/30 ${fullScreen ? "fixed inset-0 z-50 rounded-none" : ""}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Eera Chat</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={modelOk ? "default" : "outline"}>{modelOk === false ? "Model unavailable" : "Ready"}</Badge>
            <FeatureRequestButton />
            <Button size="icon" variant="ghost" onClick={() => setFullScreen((v) => !v)}>
              {fullScreen ? <DynamicIcon name="Minimize2" className="h-4 w-4"  /> : <DynamicIcon name="Maximize2" className="h-4 w-4"  />}
            </Button>
          </div>
        </div>
        {/* Tabs: New Session + recent sessions */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto">
          <Button size="sm" variant="outline" onClick={async () => {
            // Force-create a new session to avoid reusing previous chat
            const sid = await createOrGetSession("cognitive", true);
            setSessions((arr: any[]) => [{ id: sid, title: "New Session" }, ...arr]);
            setActiveSessionId(sid);
            setHistoryLoading(true);
            setMessages([]);
            // Small delay to ensure UI updates before setting messages
            await new Promise((r) => setTimeout(r, 50));
            setMessages([{ role: "assistant", text: "Hi! What should we work on today?" }]);
            setHistoryLoading(false);
            setShouldAutoScroll(false); // Don't auto-scroll when switching to new session
          }}>+ New Session</Button>
          {sessions.map((s: any) => (
            <div key={s.id} className={`px-3 py-1 rounded border cursor-pointer ${activeSessionId === s.id ? 'bg-accent text-accent-foreground' : 'bg-muted'}`} onClick={async () => {
              setActiveSessionId(s.id);
              setHistoryLoading(true);
              setMessages([]);
              setShouldAutoScroll(false); // Don't auto-scroll when switching tabs
              const recent = await listRecentMessages(s.id, 20);
              const mapped = (recent || []).map((m: any) => ({ role: m.role as "user"|"assistant", text: m.content as string }));
              setMessages(mapped.length ? mapped : [{ role: "assistant", text: "Hi! What should we work on today?" }]);
              setHistoryLoading(false);
            }}>
              {renamingId === s.id ? (
                <input autoFocus defaultValue={s.title || 'Session'} className="bg-transparent outline-none w-40" onBlur={async (e) => {
                  const t = e.target.value.trim() || 'Session';
                  await renameSession(s.id, t);
                  setSessions((arr: any[]) => arr.map(it => it.id===s.id? { ...it, title: t }: it));
                  setRenamingId(null);
                }} onKeyDown={async (e) => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                }} />
              ) : (
                <span onDoubleClick={() => setRenamingId(s.id)}>{s.title || 'Session'}</span>
              )}
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Topic of the Day and Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => setInput((v) => (v ? v : (dailyTopic || "Suggest a focus topic for today based on my context.")))}>{dailyTopic ? `Topic: ${dailyTopic}` : "Topic of the Day"}</Button>
          <Button size="sm" variant="outline" onClick={() => handleQuick("Generate exactly 5 startup ideas with title, category, rationale, nextStep as compact bullets.")}>Generate 5 ideas</Button>
          <Button size="sm" variant="outline" onClick={() => handleQuick("Summarize our last session into Summary, Recommendations, Next steps.")}>Summarize last session</Button>
          <Button size="sm" variant="outline" onClick={() => handleQuick("Continue the pinned plan. Propose the next 3 concrete steps.")}>Continue plan</Button>
          <Button size="sm" variant="outline" onClick={() => handleQuick("Create a weekly focus checklist for me (3-5 items).")}>Create weekly focus</Button>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Persona</span>
            <select className="text-xs border rounded px-2 py-1 bg-background" value={persona} onChange={(e) => setPersona(e.target.value as any)}>
              <option value="friend">Friend</option>
              <option value="guide">Guide</option>
              <option value="mentor">Mentor</option>
              <option value="ea">EA</option>
            </select>
          </div>
        </div>
        <div className="space-y-2 min-h-[40vh] max-h-[65vh] overflow-y-auto transition-opacity duration-200" key={activeSessionId || 'no-session'}>
          {historyLoading && (
            <div className="flex justify-center py-6 text-sm text-muted-foreground">
              <DynamicIcon name="Loader2" className="h-4 w-4 animate-spin mr-2"  /> Loading conversation…
            </div>
          )}
          {!historyLoading && messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] p-3 rounded-lg text-sm relative ${
                m.role === "user" 
                  ? "bg-accent text-accent-foreground" 
                  : "bg-muted border"
              }`}>
                {m.text || (m.streaming && <span className="text-muted-foreground">Thinking...</span>)}
                {m.streaming && (
                  <DynamicIcon name="Loader2" className="h-3 w-3 animate-spin text-muted-foreground ml-2 inline"  />
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex gap-2">
          <Input 
            placeholder="Chat with Eera… (Press Enter to send)" 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={busy || !modelOk}
          />
          <Button 
            disabled={busy || !modelOk || !input.trim()} 
            onClick={handleSend}
          >
            {busy ? <DynamicIcon name="Loader2" className="h-4 w-4 animate-spin"  /> : "Send"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function sanitizeAssistant(text: string) {
  if (!text) return text;
  // Remove markdown asterisks and hashes, compress whitespace
  let s = text.replace(/\*\*/g, "").replace(/\*/g, "").replace(/^#+\s*/gm, "");
  s = s.replace(/\n{3,}/g, "\n\n");
  return s;
}
