import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, Calendar, DollarSign } from "lucide-react";
import { useHRCandidates, useHRRoles } from "@/hooks/useHRData";
import { format } from "date-fns";

export function Workforce() {
  const { data: candidates = [], isLoading } = useHRCandidates();
  const { data: roles = [] } = useHRRoles();

  // Get hired candidates (status = "hired")
  const hiredCandidates = candidates.filter((c) => c.status === "hired");

  // Get role title for a candidate
  const getRoleTitle = (roleId: string | null) => {
    if (!roleId) return "No Position";
    const role = roles.find((r) => r.id === roleId);
    return role?.title || "Unknown Position";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-muted-foreground">
            Loading workforce...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hiredCandidates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            Current Workforce
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No employees yet</p>
            <p className="text-sm">
              Hired candidates will appear here once they accept an offer.
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
          Current Workforce ({hiredCandidates.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hiredCandidates.map((employee) => {
            const role = roles.find((r) => r.id === employee.role_id);
            return (
              <div
                key={employee.id}
                className="p-4 rounded-lg border border-accent/20 hover:border-accent/40 transition-all bg-background/50"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{employee.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getRoleTitle(employee.role_id)}
                    </p>
                  </div>
                  <Badge variant="default" className="bg-emerald-600">
                    Hired
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  {employee.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>📧</span>
                      <span className="truncate">{employee.email}</span>
                    </div>
                  )}
                  {employee.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>📞</span>
                      <span>{employee.phone}</span>
                    </div>
                  )}
                  {employee.applied_date && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Joined {format(new Date(employee.applied_date), "MMM d, yyyy")}
                      </span>
                    </div>
                  )}
                  {employee.score !== null && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">AI Score:</span>
                      <Badge variant="outline" className="text-xs">
                        {employee.score}/100
                      </Badge>
                    </div>
                  )}
                  {role?.department && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <span>{role.department}</span>
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

