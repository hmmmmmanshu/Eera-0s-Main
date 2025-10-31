import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Copy, Check } from "lucide-react";
import { generateJobDescription } from "@/lib/gemini";
import { toast } from "sonner";
import { useCreateRole } from "@/hooks/useHRData";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface JobDescriptionResult {
  summary: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
}

export function AIJobDescriptionGenerator() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<JobDescriptionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [organizationContext, setOrganizationContext] = useState<any>(null);
  
  const createRole = useCreateRole();

  // Fetch organization context from user profile
  useEffect(() => {
    if (user?.id) {
      supabase
        .from("profiles")
        .select("startup_name, industry, about, key_offerings, company_stage, tagline, target_audience, competitive_edge, brand_values")
        .eq("id", user.id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            setOrganizationContext({
              companyName: data.startup_name,
              industry: data.industry,
              about: data.about,
              keyOfferings: data.key_offerings,
              companyStage: data.company_stage,
              tagline: data.tagline,
              targetAudience: data.target_audience,
              competitiveEdge: data.competitive_edge,
              brandValues: Array.isArray(data.brand_values) ? data.brand_values : null,
            });
          }
        });
    }
  }, [user?.id]);

  const handleGenerate = async () => {
    if (!title.trim()) {
      toast.error("Please enter a job title");
      return;
    }

    setIsGenerating(true);
    try {
      const jd = await generateJobDescription(
        title,
        department,
        additionalContext,
        organizationContext
      );
      setResult(jd);
      toast.success("Job description generated successfully!");
    } catch (error) {
      console.error("Error generating job description:", error);
      toast.error("Failed to generate job description. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!result) return;

    const fullJD = `
# ${title}
${department ? `**Department:** ${department}\n` : ""}

## Summary
${result.summary}

## Key Responsibilities
${result.responsibilities.map((r, i) => `${i + 1}. ${r}`).join("\n")}

## Required Qualifications
${result.requirements.map((r, i) => `${i + 1}. ${r}`).join("\n")}

## Nice to Have
${result.niceToHave.map((r, i) => `${i + 1}. ${r}`).join("\n")}
    `.trim();

    navigator.clipboard.writeText(fullJD);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAsRole = async () => {
    if (!result) return;

    try {
      await createRole.mutateAsync({
        title,
        department: department || null,
        jd_text: result.summary,
        status: "open",
        requirements: result.requirements,
        responsibilities: result.responsibilities,
        salary_range: null,
        location: null,
      });
      
      // Reset form
      setTitle("");
      setDepartment("");
      setAdditionalContext("");
      setResult(null);
    } catch (error) {
      // Error already handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Job Description Generator
          </CardTitle>
          <CardDescription>
            Generate professional job descriptions powered by Gemini 2.0 Flash
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job-title">Job Title *</Label>
            <Input
              id="job-title"
              placeholder="e.g., Senior React Developer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department (Optional)</Label>
            <Input
              id="department"
              placeholder="e.g., Engineering"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Additional Context (Optional)</Label>
            <Textarea
              id="context"
              placeholder="e.g., Remote position, startup environment, fast-paced team..."
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              disabled={isGenerating}
              rows={3}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !title.trim()}
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
                Generate Job Description
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Job Description</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyToClipboard}
                >
                  {copied ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveAsRole}
                  disabled={createRole.isPending}
                >
                  {createRole.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Save as Role
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Summary</h3>
              <p className="text-muted-foreground">{result.summary}</p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Key Responsibilities</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {result.responsibilities.map((resp, idx) => (
                  <li key={idx}>{resp}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Required Qualifications</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {result.requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Nice to Have</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {result.niceToHave.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

