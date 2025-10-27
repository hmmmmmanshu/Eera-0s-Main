import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, FileText, Users, CheckCircle } from "lucide-react";
import { useState } from "react";

export function HiringScreening() {
  const [jdInput, setJdInput] = useState("");

  const candidates = [
    { name: "Alice Johnson", role: "Senior Developer", score: 92, status: "Interview Scheduled" },
    { name: "Bob Smith", role: "Senior Developer", score: 88, status: "Screening Complete" },
    { name: "Carol Davis", role: "Product Designer", score: 95, status: "Offer Extended" },
    { name: "David Lee", role: "Product Designer", score: 78, status: "Under Review" },
  ];

  return (
    <div className="space-y-6">
      {/* JD Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            AI Job Description Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Role Title</label>
            <Input placeholder="e.g., Senior Frontend Developer" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Key Requirements (AI will expand this)</label>
            <Textarea 
              placeholder="e.g., 5+ years React experience, TypeScript, team leadership..."
              value={jdInput}
              onChange={(e) => setJdInput(e.target.value)}
              rows={4}
            />
          </div>
          <div className="flex gap-3">
            <Button className="flex-1">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Complete JD
            </Button>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Use Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Candidate Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            Candidate Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {candidates.map((candidate, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-accent/50 transition-all">
                <div>
                  <p className="font-medium">{candidate.name}</p>
                  <p className="text-sm text-muted-foreground">{candidate.role}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent">{candidate.score}</p>
                    <p className="text-xs text-muted-foreground">AI Score</p>
                  </div>
                  <Badge variant={candidate.status.includes("Offer") ? "default" : "outline"}>
                    {candidate.status}
                  </Badge>
                  <Button size="sm" variant="outline">View Profile</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Screening Status */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Applications Received</p>
                <p className="text-3xl font-bold mt-2">47</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AI Screening In Progress</p>
                <p className="text-3xl font-bold mt-2">12</p>
              </div>
              <Sparkles className="h-8 w-8 text-amber-500 animate-pulse" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Qualified Candidates</p>
                <p className="text-3xl font-bold mt-2">8</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
