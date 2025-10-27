import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollText, Plus, Eye, RefreshCw, Globe } from "lucide-react";

export function PoliciesManager() {
  const policies = [
    {
      id: 1,
      type: "Privacy Policy",
      version: "v3.2",
      lastUpdated: "2 weeks ago",
      region: "Global",
      status: "active",
      compliance: ["GDPR", "DPDP", "CCPA"]
    },
    {
      id: 2,
      type: "Terms of Service",
      version: "v2.1",
      lastUpdated: "1 month ago",
      region: "India",
      status: "active",
      compliance: ["Consumer Protection Act"]
    },
    {
      id: 3,
      type: "Refund Policy",
      version: "v1.8",
      lastUpdated: "3 weeks ago",
      region: "Global",
      status: "active",
      compliance: ["E-commerce Guidelines"]
    },
    {
      id: 4,
      type: "Cookie Policy",
      version: "v2.0",
      lastUpdated: "1 week ago",
      region: "EU",
      status: "active",
      compliance: ["GDPR"]
    },
    {
      id: 5,
      type: "Customer Care Policy",
      version: "v1.5",
      lastUpdated: "2 days ago",
      region: "Global",
      status: "draft",
      compliance: ["ISO 9001"]
    },
  ];

  const policyTemplates = [
    { name: "Privacy Policy", tone: "Professional", scope: "Global" },
    { name: "Terms of Service", tone: "Legal", scope: "Regional" },
    { name: "Refund Policy", tone: "Friendly", scope: "E-commerce" },
    { name: "Content Policy", tone: "Clear", scope: "Social Media" },
  ];

  return (
    <div className="space-y-6">
      {/* Policy Generator */}
      <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="h-5 w-5 text-accent" />
            AI Policy Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Generate custom policies tailored to your business, region, and compliance needs
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {policyTemplates.map((template, idx) => (
              <Button 
                key={idx}
                variant="outline" 
                size="sm" 
                className="flex-col h-auto p-3"
              >
                <span className="font-medium">{template.name}</span>
                <span className="text-xs text-muted-foreground">{template.tone} • {template.scope}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Policies List */}
      <div className="space-y-4">
        {policies.map((policy) => (
          <Card 
            key={policy.id}
            className="border-accent/20 bg-gradient-to-br from-accent/5 to-background hover:border-accent/40 transition-all"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                    <ScrollText className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{policy.type}</h3>
                      <Badge variant="secondary" className="text-xs">{policy.version}</Badge>
                      <Badge 
                        variant={policy.status === "active" ? "default" : "secondary"}
                        className="text-xs capitalize"
                      >
                        {policy.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span>Updated: {policy.lastUpdated}</span>
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {policy.region}
                      </span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {policy.compliance.map((comp, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {comp}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-2">
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Update
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Website Compliance Checker */}
      <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5 text-accent" />
            Website Compliance Checker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Scan your website to ensure all required policies are properly linked and compliant
          </p>
          <div className="flex gap-3">
            <Input 
              type="url" 
              placeholder="https://your-website.com"
              className="flex-1"
            />
            <Button className="gap-2">
              Scan Website
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
