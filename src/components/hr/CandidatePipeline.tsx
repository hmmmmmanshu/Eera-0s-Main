import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Sparkles, CheckCircle, UserPlus, X, ArrowRight, Briefcase, FileText, Copy, Download, Loader2 } from "lucide-react";
import { useHRCandidates, useHRRoles, useUpdateCandidate } from "@/hooks/useHRData";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const PIPELINE_STAGES = [
  { id: "applied", label: "Applied", icon: UserPlus, color: "bg-blue-500" },
  { id: "screening", label: "Screening", icon: Sparkles, color: "bg-amber-500" },
  { id: "interview", label: "Interview", icon: Users, color: "bg-purple-500" },
  { id: "offer", label: "Offer", icon: CheckCircle, color: "bg-green-500" },
  { id: "hired", label: "Hired", icon: CheckCircle, color: "bg-emerald-600" },
  { id: "rejected", label: "Rejected", icon: X, color: "bg-red-500" },
];

export function CandidatePipeline() {
  const { data: candidates = [], isLoading } = useHRCandidates();
  const { data: roles = [] } = useHRRoles();
  const updateCandidate = useUpdateCandidate();
  const queryClient = useQueryClient();
  const [localCandidates, setLocalCandidates] = useState(candidates);
  const [offerLetterCandidate, setOfferLetterCandidate] = useState<any>(null);
  const [showOfferLetterDialog, setShowOfferLetterDialog] = useState(false);

  // Update local state when candidates change
  useEffect(() => {
    setLocalCandidates(candidates);
  }, [candidates]);

  // Get role title for a candidate
  const getRoleTitle = (roleId: string | null) => {
    if (!roleId) return "No Position";
    const role = roles.find((r) => r.id === roleId);
    return role?.title || "Unknown Position";
  };

  // Group candidates by status
  const getCandidatesByStage = (stageId: string) => {
    return localCandidates.filter((c) => c.status === stageId);
  };

  const handleStatusChange = async (candidateId: string, newStatus: string) => {
    const candidate = localCandidates.find((c) => c.id === candidateId);
    if (!candidate || candidate.status === newStatus) return;

    // Optimistic update
    setLocalCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, status: newStatus } : c))
    );

    try {
      await updateCandidate.mutateAsync({
        id: candidateId,
        updates: { status: newStatus },
      });
      toast.success("Candidate status updated!");
    } catch (error) {
      // Revert on error
      setLocalCandidates(candidates);
      toast.error("Failed to update candidate status");
    }
  };

  const getNextStage = (currentStage: string) => {
    const stages = PIPELINE_STAGES.map((s) => s.id);
    const currentIndex = stages.indexOf(currentStage);
    // Allow progression through all stages except rejected and hired (which are final)
    if (currentIndex < stages.length - 1 && currentStage !== "rejected" && currentStage !== "hired") {
      return stages[currentIndex + 1];
    }
    // Special case: allow moving from offer directly to hired
    if (currentStage === "offer") {
      return "hired";
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-muted-foreground">
            Loading pipeline...
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalCandidates = localCandidates.length;

  if (totalCandidates === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            Candidate Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No candidates yet</p>
            <p className="text-sm">
              Add candidates using the "Add Candidate" button on positions or after resume screening.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-accent" />
          Candidate Pipeline ({totalCandidates})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto">
          {PIPELINE_STAGES.map((stage) => {
            const stageCandidates = getCandidatesByStage(stage.id);
            const StageIcon = stage.icon;

            return (
              <div
                key={stage.id}
                className="min-h-[300px] rounded-lg border-2 border-border bg-muted/30 p-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className={`${stage.color} p-2 rounded-lg`}>
                    <StageIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{stage.label}</h3>
                    <p className="text-xs text-muted-foreground">
                      {stageCandidates.length} candidate{stageCandidates.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 min-h-[200px]">
                  {stageCandidates.map((candidate) => {
                    const nextStage = getNextStage(stage.id);
                    const role = roles.find((r) => r.id === candidate.role_id);
                    
                    return (
                      <div
                        key={candidate.id}
                        className="p-3 rounded-lg border bg-background hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-medium text-sm">{candidate.name}</p>
                          {candidate.score !== null && (
                            <Badge variant="outline" className="text-xs">
                              {candidate.score}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {getRoleTitle(candidate.role_id)}
                        </p>
                        {candidate.email && (
                          <p className="text-xs text-muted-foreground truncate mb-2">
                            {candidate.email}
                          </p>
                        )}
                        
                        {/* Action buttons based on stage */}
                        <div className="space-y-1 mt-3">
                          {stage.id === "screening" && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                className="w-full text-xs"
                                onClick={() => handleStatusChange(candidate.id, "interview")}
                                disabled={updateCandidate.isPending}
                              >
                                <ArrowRight className="h-3 w-3 mr-1" />
                                Proceed to Interview
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="w-full text-xs"
                                onClick={() => handleStatusChange(candidate.id, "rejected")}
                                disabled={updateCandidate.isPending}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          
                          {stage.id === "offer" && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                className="w-full text-xs mb-1"
                                onClick={() => {
                                  setOfferLetterCandidate(candidate);
                                  setShowOfferLetterDialog(true);
                                }}
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                Generate Offer Letter
                              </Button>
                              {nextStage && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full text-xs"
                                  onClick={() => handleStatusChange(candidate.id, nextStage)}
                                  disabled={updateCandidate.isPending}
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Mark as {PIPELINE_STAGES.find((s) => s.id === nextStage)?.label}
                                </Button>
                              )}
                            </>
                          )}
                          
                          {stage.id !== "screening" && stage.id !== "offer" && nextStage && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full text-xs"
                              onClick={() => handleStatusChange(candidate.id, nextStage)}
                              disabled={updateCandidate.isPending}
                            >
                              <ArrowRight className="h-3 w-3 mr-1" />
                              Move to {PIPELINE_STAGES.find((s) => s.id === nextStage)?.label}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {stageCandidates.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-xs">
                      No candidates
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      
      {/* Offer Letter Dialog */}
      {offerLetterCandidate && (
        <Dialog open={showOfferLetterDialog} onOpenChange={setShowOfferLetterDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Generate Offer Letter for {offerLetterCandidate.name}</DialogTitle>
              <DialogDescription>
                Generate and send an offer letter to this candidate.
              </DialogDescription>
            </DialogHeader>
            <OfferLetterForm
              candidate={offerLetterCandidate}
              role={roles.find((r) => r.id === offerLetterCandidate.role_id)}
              onClose={() => {
                setShowOfferLetterDialog(false);
                setOfferLetterCandidate(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}

// Simplified Offer Letter Form Component
function OfferLetterForm({ candidate, role, onClose }: { candidate: any; role: any; onClose: () => void }) {
  const [salary, setSalary] = useState(candidate.salary || "");
  const [startDate, setStartDate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [offerLetter, setOfferLetter] = useState(candidate.offer_letter || "");
  const { user } = useAuth();
  const [organizationContext, setOrganizationContext] = useState<any>(null);
  const updateCandidate = useUpdateCandidate();
  const queryClient = useQueryClient();
  
  // If offer letter already exists, show it
  useEffect(() => {
    if (candidate.offer_letter) {
      setOfferLetter(candidate.offer_letter);
    }
  }, [candidate.offer_letter]);

  useEffect(() => {
    if (user?.id) {
      supabase
        .from("profiles")
        .select("startup_name, founder_name, industry, about, company_stage, tagline, target_audience, competitive_edge, brand_values, website_url, tone_personality, writing_style, language_style")
        .eq("id", user.id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            setOrganizationContext({
              companyName: data.startup_name,
              founderName: data.founder_name,
              tagline: data.tagline,
              about: data.about,
              industry: data.industry,
              companyStage: data.company_stage,
              targetAudience: data.target_audience,
              competitiveEdge: data.competitive_edge,
              brandValues: Array.isArray(data.brand_values) ? data.brand_values : null,
              websiteUrl: data.website_url,
              tonePersonality: Array.isArray(data.tone_personality) ? data.tone_personality : null,
              writingStyle: data.writing_style,
              languageStyle: data.language_style,
            });
          }
        });
    }
  }, [user?.id]);

  const handleGenerate = async () => {
    if (!salary.trim() || !startDate || !organizationContext?.companyName) {
      toast.error("Please fill in salary, start date, and ensure company name is set");
      return;
    }

    setIsGenerating(true);
    try {
      const { generateOfferLetter } = await import("@/lib/gemini");
      const letter = await generateOfferLetter(
        candidate.name,
        role?.title || "Position",
        salary,
        startDate,
        organizationContext.companyName,
        organizationContext
      );
      setOfferLetter(letter);
      
      // Save offer letter and salary to candidate record
      try {
        await updateCandidate.mutateAsync({
          id: candidate.id,
          updates: {
            offer_letter: letter,
            salary: salary,
            status: "offer", // Ensure status is set to offer if not already
          },
        });
        queryClient.invalidateQueries({ queryKey: ["hr-candidates"] });
        toast.success("Offer letter generated and saved successfully!");
      } catch (error) {
        console.error("Error saving offer letter:", error);
        toast.error("Offer letter generated but failed to save to database");
      }
    } catch (error) {
      console.error("Error generating offer letter:", error);
      toast.error("Failed to generate offer letter. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Salary *</label>
          <Input
            placeholder="e.g., $120,000 per year"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            disabled={isGenerating}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Start Date *</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={isGenerating}
          />
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button
          onClick={handleGenerate}
          disabled={!salary.trim() || !startDate || isGenerating || !organizationContext?.companyName}
          className="flex-1"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Generate Offer Letter
            </>
          )}
        </Button>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      {offerLetter && (
        <div className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Generated Offer Letter</h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(offerLetter);
                  toast.success("Copied to clipboard!");
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const blob = new Blob([offerLetter], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `offer-letter-${candidate.name.replace(/\s+/g, "-").toLowerCase()}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  toast.success("Offer letter downloaded!");
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-6 whitespace-pre-wrap font-mono text-sm max-h-96 overflow-y-auto">
            {offerLetter}
          </div>
        </div>
      )}
    </div>
  );
}

