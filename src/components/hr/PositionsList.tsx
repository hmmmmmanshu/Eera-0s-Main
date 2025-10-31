import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Plus, Users, Eye } from "lucide-react";
import { useHRRoles, useHRCandidates } from "@/hooks/useHRData";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

export function PositionsList() {
  const { data: roles = [], isLoading } = useHRRoles();
  const { data: allCandidates = [] } = useHRCandidates();

  // Count candidates per role
  const getCandidateCount = (roleId: string) => {
    return allCandidates.filter((c) => c.role_id === roleId).length;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-muted-foreground">
            Loading positions...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (roles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-accent" />
            Open Positions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No positions yet. Create your first position using the Job Description Generator above.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-accent" />
          Open Positions ({roles.filter((r) => r.status === "open").length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {roles.map((role) => {
            const candidateCount = getCandidateCount(role.id);
            return (
              <PositionCard key={role.id} role={role} candidateCount={candidateCount} />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function PositionCard({ role, candidateCount }: { role: any; candidateCount: number }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="p-4 rounded-lg border border-accent/20 hover:border-accent/40 transition-all bg-background/50">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-lg">{role.title}</h3>
            <Badge variant={role.status === "open" ? "default" : "secondary"}>
              {role.status}
            </Badge>
          </div>
          {role.department && (
            <p className="text-sm text-muted-foreground mb-2">
              Department: {role.department}
            </p>
          )}
          {role.jd_text && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {role.jd_text}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{candidateCount} {candidateCount === 1 ? "candidate" : "candidates"}</span>
            </div>
            <span>
              Created {format(new Date(role.created_at), "MMM d, yyyy")}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View JD
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>{role.title}</DialogTitle>
                <DialogDescription>
                  {role.department && `Department: ${role.department}`}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] pr-4">
                <div className="space-y-4">
                  {role.jd_text && (
                    <div>
                      <h4 className="font-semibold mb-2">Summary</h4>
                      <p className="text-sm text-muted-foreground">{role.jd_text}</p>
                    </div>
                  )}
                  {role.responsibilities && Array.isArray(role.responsibilities) && role.responsibilities.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Responsibilities</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {role.responsibilities.map((resp: string, idx: number) => (
                          <li key={idx}>{resp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {role.requirements && Array.isArray(role.requirements) && role.requirements.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Requirements</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {role.requirements.map((req: string, idx: number) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
          <Button size="sm" onClick={() => {
            // TODO: Navigate to add candidate for this role
            // For now, just show a message
            console.log("Add candidate for role:", role.id);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Candidate
          </Button>
        </div>
      </div>
    </div>
  );
}

