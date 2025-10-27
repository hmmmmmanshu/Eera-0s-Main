import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Sparkles } from "lucide-react";
import { useState } from "react";

export function LegalAIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your Legal AI Assistant. I can help you with contract vetting, policy generation, compliance questions, and more. How can I assist you today?"
    }
  ]);
  const [input, setInput] = useState("");

  const suggestedActions = [
    { label: "Vet this contract", icon: "📄" },
    { label: "Generate refund policy", icon: "📝" },
    { label: "Check compliance status", icon: "✅" },
    { label: "Review data privacy", icon: "🔒" },
    { label: "Summarize legal risks", icon: "⚠️" },
    { label: "Create NDA template", icon: "🤝" },
  ];

  return (
    <div className="space-y-6">
      {/* AI Status */}
      <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-accent/10 border border-accent/20">
                <Bot className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold">Legal AI Assistant</h3>
                <p className="text-sm text-muted-foreground">Powered by Acharya Brain</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <Badge variant="secondary">Online</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suggested Actions */}
      <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-accent" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {suggestedActions.map((action, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="justify-start gap-2 h-auto p-3 text-left"
              >
                <span className="text-lg">{action.icon}</span>
                <span className="text-sm">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
        <CardHeader>
          <CardTitle className="text-lg">Chat with Legal AI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Messages */}
          <div className="space-y-4 max-h-96 overflow-y-auto p-4 rounded-lg bg-card border border-border">
            {messages.map((message, idx) => (
              <div 
                key={idx}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === "user" 
                      ? "bg-accent text-accent-foreground" 
                      : "bg-muted border border-border"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about legal matters..."
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  // Handle send
                }
              }}
            />
            <Button className="gap-2">
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Context & Capabilities */}
      <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
        <CardHeader>
          <CardTitle className="text-lg">AI Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border bg-card">
              <h4 className="font-semibold mb-2">Contract Analysis</h4>
              <p className="text-sm text-muted-foreground">
                AI can analyze contracts, identify risky clauses, and suggest improvements
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <h4 className="font-semibold mb-2">Policy Generation</h4>
              <p className="text-sm text-muted-foreground">
                Generate custom policies tailored to your business and jurisdiction
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <h4 className="font-semibold mb-2">Compliance Tracking</h4>
              <p className="text-sm text-muted-foreground">
                Monitor compliance deadlines and get proactive reminders
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <h4 className="font-semibold mb-2">Case Classification</h4>
              <p className="text-sm text-muted-foreground">
                Automatically classify and prioritize legal cases
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
