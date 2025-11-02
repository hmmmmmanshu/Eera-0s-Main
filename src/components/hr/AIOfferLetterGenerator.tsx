import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Copy, Check, Download, Mail } from "lucide-react";
import { generateOfferLetter } from "@/lib/gemini";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function AIOfferLetterGenerator() {
  const { user } = useAuth();
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [role, setRole] = useState("");
  const [salary, setSalary] = useState("");
  const [startDate, setStartDate] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [offerLetter, setOfferLetter] = useState("");
  const [copied, setCopied] = useState(false);
  const [organizationContext, setOrganizationContext] = useState<any>(null);

  // Fetch comprehensive organization context from user profile and auto-fill company name
  useEffect(() => {
    if (user?.id) {
      supabase
        .from("profiles")
        .select(`
          startup_name,
          founder_name,
          industry,
          about,
          company_stage,
          tagline,
          target_audience,
          competitive_edge,
          brand_values,
          website_url,
          tone_personality,
          writing_style,
          language_style
        `)
        .eq("id", user.id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error("Error fetching organization context:", error);
            return;
          }
          
          if (data) {
            // Auto-fill company name if empty
            setCompanyName((prev) => prev || data.startup_name || "");
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
    if (!candidateName.trim() || !role.trim() || !salary.trim() || !startDate || !companyName.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsGenerating(true);
    try {
      const letter = await generateOfferLetter(
        candidateName,
        role,
        salary,
        startDate,
        companyName,
        organizationContext
      );
      setOfferLetter(letter);
      toast.success("Offer letter generated successfully!");
    } catch (error) {
      console.error("Error generating offer letter:", error);
      toast.error("Failed to generate offer letter. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(offerLetter);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([offerLetter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `offer-letter-${candidateName.replace(/\s+/g, "-").toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Offer letter downloaded!");
  };

  const handleReset = () => {
    setCandidateName("");
    setCandidateEmail("");
    setRole("");
    setSalary("");
    setStartDate("");
    setCompanyName("");
    setOfferLetter("");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Offer Letter Generator
          </CardTitle>
          <CardDescription>
            Generate professional offer letters in seconds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="candidate-name">Candidate Name *</Label>
              <Input
                id="candidate-name"
                placeholder="e.g., John Doe"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="candidate-email">Candidate Email</Label>
              <Input
                id="candidate-email"
                type="email"
                placeholder="e.g., john.doe@example.com"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                placeholder="e.g., Senior React Developer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary">Salary *</Label>
              <Input
                id="salary"
                placeholder="e.g., $120,000 per year"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date *</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="company-name">Company Name *</Label>
              <Input
                id="company-name"
                placeholder="e.g., Acharya Ventures"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isGenerating}
              />
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={
              isGenerating ||
              !candidateName.trim() ||
              !role.trim() ||
              !salary.trim() ||
              !startDate ||
              !companyName.trim()
            }
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Offer Letter
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {offerLetter && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Offer Letter</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                {candidateEmail && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      const subject = encodeURIComponent(`Job Offer - ${role} at ${companyName}`);
                      const body = encodeURIComponent(offerLetter);
                      window.location.href = `mailto:${candidateEmail}?subject=${subject}&body=${body}`;
                    }}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleReset}>
                  New Letter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-6 whitespace-pre-wrap font-mono text-sm">
              {offerLetter}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

