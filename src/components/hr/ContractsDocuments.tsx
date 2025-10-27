import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Download, Eye } from "lucide-react";

export function ContractsDocuments() {
  const documents = [
    { name: "Employment Agreement - John Doe", type: "Contract", date: "2024-01-15", status: "Signed" },
    { name: "NDA - Jane Smith", type: "Legal", date: "2024-02-20", status: "Signed" },
    { name: "Offer Letter - Mike Johnson", type: "Offer", date: "2024-03-10", status: "Pending" },
    { name: "Performance Review Template", type: "Template", date: "2024-01-01", status: "Active" },
    { name: "Onboarding Checklist", type: "Template", date: "2024-01-01", status: "Active" },
  ];

  const templates = [
    { name: "Employment Contract", uses: 12 },
    { name: "NDA Template", uses: 8 },
    { name: "Offer Letter", uses: 15 },
    { name: "Performance Review", uses: 24 },
  ];

  return (
    <div className="space-y-6">
      {/* Document Actions */}
      <div className="flex gap-3">
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Generate New Document
        </Button>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" />
            HR Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {documents.map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-accent/50 transition-all">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">{doc.type} • {doc.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={doc.status === "Signed" || doc.status === "Active" ? "default" : "outline"}>
                    {doc.status}
                  </Badge>
                  <Button size="sm" variant="ghost">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Document Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {templates.map((template, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-border hover:border-accent/50 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{template.name}</p>
                  <Badge variant="outline">{template.uses} uses</Badge>
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  Use Template
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
