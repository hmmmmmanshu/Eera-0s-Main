import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Eye, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";

export function ContractsManager() {
  const contracts = [
    {
      id: 1,
      name: "Vendor Agreement - TechCorp",
      counterparty: "TechCorp Ltd.",
      riskLevel: "high",
      status: "flagged",
      lastReviewed: "2 days ago",
      issues: ["Missing liability clause", "Unclear payment terms"]
    },
    {
      id: 2,
      name: "SaaS Subscription - CloudHost",
      counterparty: "CloudHost Inc.",
      riskLevel: "low",
      status: "approved",
      lastReviewed: "1 week ago",
      issues: []
    },
    {
      id: 3,
      name: "Employment Contract - Senior Dev",
      counterparty: "John Doe",
      riskLevel: "medium",
      status: "review",
      lastReviewed: "3 days ago",
      issues: ["Non-compete clause needs clarification"]
    },
    {
      id: 4,
      name: "NDA - Investor Meeting",
      counterparty: "Venture Capital Partners",
      riskLevel: "low",
      status: "approved",
      lastReviewed: "1 day ago",
      issues: []
    },
  ];

  const getRiskColor = (risk: string) => {
    if (risk === "high") return "text-red-500 border-red-500/20 bg-red-500/10";
    if (risk === "medium") return "text-yellow-500 border-yellow-500/20 bg-yellow-500/10";
    return "text-green-500 border-green-500/20 bg-green-500/10";
  };

  const getStatusIcon = (status: string) => {
    if (status === "approved") return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === "flagged") return <AlertCircle className="h-4 w-4 text-red-500" />;
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Upload & Actions */}
      <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
        <CardHeader>
          <CardTitle className="text-lg">Upload & Vet Contracts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input 
              type="file" 
              className="flex-1"
              accept=".pdf,.doc,.docx"
            />
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Upload & Vet
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            AI will automatically scan for risky clauses, missing terms, and compliance issues
          </p>
        </CardContent>
      </Card>

      {/* Contracts List */}
      <div className="grid gap-4">
        {contracts.map((contract) => (
          <Card 
            key={contract.id} 
            className="border-accent/20 bg-gradient-to-br from-accent/5 to-background hover:border-accent/40 transition-all"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                    <FileText className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{contract.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{contract.counterparty}</p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className={getRiskColor(contract.riskLevel)}>
                        {contract.riskLevel} risk
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getStatusIcon(contract.status)}
                        {contract.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-2">
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                </div>
              </div>

              {contract.issues.length > 0 && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-red-500 mb-1">Issues Detected</p>
                      <ul className="space-y-1">
                        {contract.issues.map((issue, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground">• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last reviewed: {contract.lastReviewed}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Analysis Summary */}
      <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
        <CardHeader>
          <CardTitle className="text-lg">AI Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <Button variant="outline" size="sm">
              Generate Plain English Summary
            </Button>
            <Button variant="outline" size="sm">
              Highlight Risky Clauses
            </Button>
            <Button variant="outline" size="sm">
              Compare with Template
            </Button>
            <Button variant="outline" size="sm">
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
