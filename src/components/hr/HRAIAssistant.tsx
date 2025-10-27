import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Sparkles } from "lucide-react";
import { useState } from "react";

export function HRAIAssistant() {
  const [input, setInput] = useState("");

  const suggestions = [
    "Generate JD for Senior Developer",
    "What's our current attrition rate?",
    "Create onboarding plan for new hire",
    "Suggest salary benchmarks for UX Designer",
    "Draft performance review for Q4",
  ];

  const conversations = [
    { role: "user", message: "Generate a JD for Senior Frontend Developer" },
    { role: "assistant", message: "I've created a comprehensive job description for Senior Frontend Developer with 5+ years React experience, TypeScript proficiency, and team leadership skills. Would you like me to add any specific requirements?" },
    { role: "user", message: "Add remote work and competitive salary" },
    { role: "assistant", message: "Updated the JD with remote work flexibility and competitive salary range ($90k-$120k). The description is ready for review." },
  ];

  return (
    <div className="space-y-6">
      {/* AI Chat Interface */}
      <Card className="border-accent/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-accent" />
            HR AI Assistant
            <Badge variant="outline" className="ml-2">
              <Sparkles className="h-3 w-3 mr-1" />
              Powered by Acharya Brain
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chat History */}
          <div className="space-y-4 max-h-96 overflow-y-auto p-4 bg-muted/30 rounded-lg">
            {conversations.map((conv, idx) => (
              <div key={idx} className={`flex ${conv.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${conv.role === "user" ? "bg-accent text-accent-foreground" : "bg-background border border-border"}`}>
                  <p className="text-sm">{conv.message}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Ask HR AI anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && console.log("Send message")}
            />
            <Button>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {suggestions.map((suggestion, idx) => (
              <Button key={idx} variant="outline" className="justify-start text-left h-auto py-3">
                <Sparkles className="h-4 w-4 mr-2 shrink-0 text-accent" />
                <span className="text-sm">{suggestion}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle>AI Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-border">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                <Bot className="h-5 w-5 text-blue-500" />
              </div>
              <p className="font-medium mb-1">Recruitment AI</p>
              <p className="text-sm text-muted-foreground">JD generation, candidate screening, and scoring</p>
            </div>
            <div className="p-4 rounded-lg border border-border">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-3">
                <Bot className="h-5 w-5 text-green-500" />
              </div>
              <p className="font-medium mb-1">Documentation AI</p>
              <p className="text-sm text-muted-foreground">Contracts, offer letters, and NDAs</p>
            </div>
            <div className="p-4 rounded-lg border border-border">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
                <Bot className="h-5 w-5 text-purple-500" />
              </div>
              <p className="font-medium mb-1">Performance AI</p>
              <p className="text-sm text-muted-foreground">OKR tracking and appraisal summaries</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
