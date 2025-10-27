import { Card, CardContent } from "@/components/ui/card";
import { Scale, FileText, Shield, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const LegalHubMockup = () => {
  return (
    <div className="w-full h-[300px] bg-background rounded-lg border border-border p-4 space-y-3 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-accent" />
          <span className="font-semibold text-sm">Legal & Compliance</span>
        </div>
        <Badge variant="outline" className="text-xs">88% Health</Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="border-accent/20">
          <CardContent className="p-3">
            <FileText className="h-4 w-4 text-accent mb-1" />
            <p className="text-xs text-muted-foreground">Contracts</p>
            <p className="text-lg font-bold">12</p>
          </CardContent>
        </Card>
        <Card className="border-green-500/20">
          <CardContent className="p-3">
            <Shield className="h-4 w-4 text-green-500 mb-1" />
            <p className="text-xs text-muted-foreground">Compliant</p>
            <p className="text-lg font-bold">8</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/20">
          <CardContent className="p-3">
            <AlertTriangle className="h-4 w-4 text-amber-500 mb-1" />
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-lg font-bold">1</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="space-y-2">
        <p className="text-xs font-medium">Recent Activity</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <div className="h-1 w-1 rounded-full bg-green-500" />
            <span className="text-muted-foreground">NDA signed - Vendor A</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="h-1 w-1 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">Policy review due - DPDP</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalHubMockup;
