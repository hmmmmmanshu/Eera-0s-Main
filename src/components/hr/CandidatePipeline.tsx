import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Sparkles, CheckCircle, UserPlus, X, ArrowRight, Briefcase } from "lucide-react";
import { useHRCandidates, useHRRoles, useUpdateCandidate } from "@/hooks/useHRData";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  const [localCandidates, setLocalCandidates] = useState(candidates);

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
                        {nextStage && (
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
    </Card>
  );
}

