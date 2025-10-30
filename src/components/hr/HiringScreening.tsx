import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, FileText, Users, CheckCircle, UserPlus } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIJobDescriptionGenerator } from "./AIJobDescriptionGenerator";
import { AIResumeScreener } from "./AIResumeScreener";
import { AIOfferLetterGenerator } from "./AIOfferLetterGenerator";
import { useHRCandidates } from "@/hooks/useHRData";

export function HiringScreening() {
  const { data: candidates = [], isLoading } = useHRCandidates();

  return (
    <div className="space-y-6">
      {/* AI Tools Tabs */}
      <Tabs defaultValue="jd-generator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="jd-generator">
            <FileText className="h-4 w-4 mr-2" />
            Job Description
          </TabsTrigger>
          <TabsTrigger value="resume-screener">
              <Sparkles className="h-4 w-4 mr-2" />
            Resume Screener
          </TabsTrigger>
          <TabsTrigger value="offer-letter">
            <UserPlus className="h-4 w-4 mr-2" />
            Offer Letter
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jd-generator">
          <AIJobDescriptionGenerator />
        </TabsContent>

        <TabsContent value="resume-screener">
          <AIResumeScreener />
        </TabsContent>

        <TabsContent value="offer-letter">
          <AIOfferLetterGenerator />
        </TabsContent>
      </Tabs>

      {/* Candidate Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            Candidate Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading candidates...
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No candidates yet. Add candidates using the tools above.
            </div>
          ) : (
          <div className="space-y-3">
            {candidates.map((candidate, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-accent/50 transition-all">
                <div>
                  <p className="font-medium">{candidate.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {typeof candidate.role === 'string' ? candidate.role : 'Role not specified'}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                      <p className="text-2xl font-bold text-accent">
                        {candidate.score || 'N/A'}
                      </p>
                    <p className="text-xs text-muted-foreground">AI Score</p>
                  </div>
                    <Badge variant={candidate.status?.includes("Offer") || candidate.status === "offer" ? "default" : "outline"}>
                      {candidate.status || 'Applied'}
                  </Badge>
                  <Button size="sm" variant="outline">View Profile</Button>
                </div>
              </div>
            ))}
          </div>
          )}
        </CardContent>
      </Card>

      {/* AI Screening Status */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Applications Received</p>
                <p className="text-3xl font-bold mt-2">{candidates.length}</p>
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
                <p className="text-3xl font-bold mt-2">
                  {candidates.filter(c => c.status === 'screening').length}
                </p>
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
                <p className="text-3xl font-bold mt-2">
                  {candidates.filter(c => (c.score || 0) >= 70).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
