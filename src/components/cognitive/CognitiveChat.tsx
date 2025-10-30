import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, Heart, Compass, GraduationCap, Briefcase, Send } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCognitiveActions } from "@/hooks/useCognitive";
import { toast } from "sonner";

interface CognitiveChatProps {
  mode: "friend" | "guide" | "mentor" | "ea";
  onModeChange: (mode: "friend" | "guide" | "mentor" | "ea") => void;
}

export function CognitiveChat({ mode, onModeChange }: CognitiveChatProps) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const { user } = useAuth();
  const { cognitiveChat } = useCognitiveActions(user?.id);

  const modes = [
    { id: "friend" as const, label: "Friend", icon: Heart, color: "text-pink-500" },
    { id: "guide" as const, label: "Guide", icon: Compass, color: "text-blue-500" },
    { id: "mentor" as const, label: "Mentor", icon: GraduationCap, color: "text-purple-500" },
    { id: "ea" as const, label: "EA", icon: Briefcase, color: "text-green-500" },
  ];

  const conversations = history.length ? history : [
    { role: "assistant", text: "Hi! I loaded your week trends. How can I help right now?" },
  ];

  return (
    <Card className="border-accent/30">
      <CardHeader>
        <div className="flex items-center justify-between mb-3">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-accent" />
            Acharya AI
          </CardTitle>
          <Badge variant="outline" className="animate-pulse">
            Active
          </Badge>
        </div>
        
        {/* Mode Selector */}
        <div className="grid grid-cols-4 gap-2">
          {modes.map((m) => (
            <Button
              key={m.id}
              variant={mode === m.id ? "default" : "outline"}
              size="sm"
              onClick={() => onModeChange(m.id)}
              className="flex flex-col h-auto py-2 gap-1"
            >
              <m.icon className={`h-4 w-4 ${m.color}`} />
              <span className="text-xs">{m.label}</span>
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chat History */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {conversations.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] p-3 rounded-lg text-sm ${
                msg.role === "user" 
                  ? "bg-accent text-accent-foreground" 
                  : "bg-muted border border-border"
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            placeholder={`Chat with your AI ${mode}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={async (e) => {
              if (e.key !== "Enter") return;
              if (!input.trim()) return;
              try {
                setBusy(true);
                const msg = input.trim();
                setHistory((h) => [...h, { role: "user", text: msg }]);
                setInput("");
                const reply = await cognitiveChat(msg, mode);
                setHistory((h) => [...h, { role: "assistant", text: reply }]);
              } catch (err: any) {
                toast.error(err?.message || "Chat failed");
              } finally {
                setBusy(false);
              }
            }}
          />
          <Button size="icon" disabled={busy} onClick={async () => {
            if (!input.trim()) return;
            try {
              setBusy(true);
              const msg = input.trim();
              setHistory((h) => [...h, { role: "user", text: msg }]);
              setInput("");
              const reply = await cognitiveChat(msg, mode);
              setHistory((h) => [...h, { role: "assistant", text: reply }]);
            } catch (err: any) {
              toast.error(err?.message || "Chat failed");
            } finally {
              setBusy(false);
            }
          }}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
