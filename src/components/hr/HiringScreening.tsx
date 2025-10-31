import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, FileText, Users, CheckCircle, UserPlus, Briefcase } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIJobDescriptionGenerator } from "./AIJobDescriptionGenerator";
import { AIResumeScreener } from "./AIResumeScreener";
import { AIOfferLetterGenerator } from "./AIOfferLetterGenerator";
import { PositionsList } from "./PositionsList";
import { CandidatePipeline } from "./CandidatePipeline";
import { useHRCandidates } from "@/hooks/useHRData";

export function HiringScreening() {
  const { data: candidates = [], isLoading } = useHRCandidates();

  return (
    <div className="space-y-6">
      {/* Saved Positions */}
      <PositionsList />

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

      {/* Candidate Pipeline - Kanban View */}
      <CandidatePipeline />

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
