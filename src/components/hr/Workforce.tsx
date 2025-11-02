import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, Calendar, DollarSign, FileText, Eye, Mail } from "lucide-react";
import { useHRCandidates, useHRRoles } from "@/hooks/useHRData";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { toast } from "sonner";

export function Workforce() {
  const { data: candidates = [], isLoading } = useHRCandidates();
  const { data: roles = [] } = useHRRoles();
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [showOfferLetter, setShowOfferLetter] = useState(false);

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

  // Group employees by department/role for org chart
  const employeesByDepartment = hiredCandidates.reduce((acc: any, employee) => {
    const role = roles.find((r) => r.id === employee.role_id);
    const dept = role?.department || "Other";
    if (!acc[dept]) {
      acc[dept] = [];
    }
    acc[dept].push(employee);
    return acc;
  }, {});

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
    <div className="space-y-6">
      {/* Organization Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-accent" />
            Organization Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hiredCandidates.length > 0 ? (
            <div className="space-y-6">
              {Object.entries(employeesByDepartment).map(([dept, employees]: [string, any]) => (
                <div key={dept} className="border rounded-lg p-4 bg-muted/20">
                  <h3 className="font-semibold text-lg mb-4 text-accent">{dept}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {employees.map((employee: any) => {
                      const role = roles.find((r) => r.id === employee.role_id);
                      return (
                        <div
                          key={employee.id}
                          className="bg-background rounded-lg p-3 border border-accent/20 hover:border-accent/40 transition-all"
                        >
                          <div className="text-center">
                            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
                              <Users className="h-6 w-6 text-accent" />
                            </div>
                            <h4 className="font-semibold text-sm">{employee.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {role?.title || "No Position"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No organization chart data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee Directory */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            Employee Directory ({hiredCandidates.length})
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
                  {employee.salary && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium">{employee.salary}</span>
                    </div>
                  )}
                  {role?.department && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <span>{role.department}</span>
                    </div>
                  )}
                  {employee.offer_letter && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-2 text-xs"
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setShowOfferLetter(true);
                      }}
                    >
                      <FileText className="h-3 w-3 mr-2" />
                      View Offer Letter
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      
      {/* Offer Letter Dialog */}
      {selectedEmployee && (
        <Dialog open={showOfferLetter} onOpenChange={setShowOfferLetter}>
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Offer Letter - {selectedEmployee.name}</DialogTitle>
              <DialogDescription>
                {selectedEmployee.salary && `Salary: ${selectedEmployee.salary}`}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="bg-muted/50 rounded-lg p-6 whitespace-pre-wrap font-mono text-sm">
                {selectedEmployee.offer_letter || "No offer letter available"}
              </div>
            </ScrollArea>
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  if (selectedEmployee.offer_letter) {
                    navigator.clipboard.writeText(selectedEmployee.offer_letter);
                    toast.success("Copied to clipboard!");
                  }
                }}
              >
                Copy
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (selectedEmployee.offer_letter) {
                    const blob = new Blob([selectedEmployee.offer_letter], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `offer-letter-${selectedEmployee.name.replace(/\s+/g, "-").toLowerCase()}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    toast.success("Offer letter downloaded!");
                  }
                }}
              >
                Download
              </Button>
              {selectedEmployee.email && (
                <Button
                  variant="default"
                  onClick={() => {
                    const subject = encodeURIComponent(`Job Offer - ${getRoleTitle(selectedEmployee.role_id)}`);
                    const body = encodeURIComponent(selectedEmployee.offer_letter || "");
                    window.location.href = `mailto:${selectedEmployee.email}?subject=${subject}&body=${body}`;
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              )}
              <Button variant="outline" onClick={() => setShowOfferLetter(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
    </div>
  );
}

