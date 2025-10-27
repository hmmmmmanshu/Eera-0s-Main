import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Tag, Clock, User } from "lucide-react";
import { Input } from "@/components/ui/input";

export function UserCases() {
  const cases = [
    {
      id: 1,
      title: "Payment Refund Dispute",
      source: "Customer Support",
      classification: "Financial",
      status: "escalated",
      priority: "high",
      assignedTo: "Legal Team",
      createdAt: "2 days ago",
      tags: ["refund", "payment", "urgent"]
    },
    {
      id: 2,
      title: "Data Privacy Request",
      source: "Email",
      classification: "Privacy",
      status: "active",
      priority: "medium",
      assignedTo: "Compliance AI",
      createdAt: "5 days ago",
      tags: ["gdpr", "data-privacy"]
    },
    {
      id: 3,
      title: "Contract Breach Allegation",
      source: "Vendor",
      classification: "Contract",
      status: "resolved",
      priority: "high",
      assignedTo: "Legal AI",
      createdAt: "1 week ago",
      tags: ["vendor", "breach", "resolved"]
    },
    {
      id: 4,
      title: "Service Complaint",
      source: "Social Media",
      classification: "Customer Care",
      status: "active",
      priority: "low",
      assignedTo: "Ops Hub",
      createdAt: "3 days ago",
      tags: ["complaint", "service-quality"]
    },
  ];

  const getStatusColor = (status: string) => {
    if (status === "resolved") return "default";
    if (status === "escalated") return "destructive";
    return "secondary";
  };

  const getPriorityColor = (priority: string) => {
    if (priority === "high") return "text-red-500";
    if (priority === "medium") return "text-yellow-500";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Cases</p>
            <p className="text-3xl font-bold">24</p>
          </CardContent>
        </Card>
        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Active</p>
            <p className="text-3xl font-bold text-yellow-500">12</p>
          </CardContent>
        </Card>
        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Resolved</p>
            <p className="text-3xl font-bold text-green-500">9</p>
          </CardContent>
        </Card>
        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Escalated</p>
            <p className="text-3xl font-bold text-red-500">3</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Input 
              placeholder="Search cases..." 
              className="flex-1"
            />
            <Button variant="outline">
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cases List */}
      <div className="space-y-4">
        {cases.map((caseItem) => (
          <Card 
            key={caseItem.id}
            className="border-accent/20 bg-gradient-to-br from-accent/5 to-background hover:border-accent/40 transition-all"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                    <FileText className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{caseItem.title}</h3>
                      <Badge variant={getStatusColor(caseItem.status)} className="capitalize">
                        {caseItem.status}
                      </Badge>
                      <span className={`text-xs font-semibold ${getPriorityColor(caseItem.priority)}`}>
                        {caseItem.priority} priority
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Source: {caseItem.source}
                      </span>
                      <span>Classification: {caseItem.classification}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {caseItem.createdAt}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <div className="flex gap-2 flex-wrap">
                        {caseItem.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Assigned to: <span className="font-medium">{caseItem.assignedTo}</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-2">
                    View Details
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2">
                    Generate Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
