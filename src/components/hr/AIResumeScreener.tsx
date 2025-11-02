import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, CheckCircle2, AlertCircle, UserPlus, Upload, FileText } from "lucide-react";
import { scoreResume } from "@/lib/gemini";
import { useCreateCandidate, useHRRoles } from "@/hooks/useHRData";
import { toast } from "sonner";
import mammoth from "mammoth";
import { Buffer } from "buffer";

// Make Buffer available globally for pdf-parse
if (typeof window !== "undefined" && !window.Buffer) {
  window.Buffer = Buffer;
}

interface ResumeScore {
  score: number;
  strengths: string[];
  gaps: string[];
  summary: string;
}

interface AIResumeScreenerProps {
  jobRequirements?: string[];
  onScoreGenerated?: (score: number) => void;
  preselectedRoleId?: string;
}

export function AIResumeScreener({ 
  jobRequirements = [],
  onScoreGenerated,
  preselectedRoleId
}: AIResumeScreenerProps) {
  const [resumeText, setResumeText] = useState("");
  const [requirements, setRequirements] = useState(
    jobRequirements.join("\n") || ""
  );
  const [isScoring, setIsScoring] = useState(false);
  const [result, setResult] = useState<ResumeScore | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidatePhone, setCandidatePhone] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<string | undefined>(preselectedRoleId);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  
  const { data: roles = [] } = useHRRoles();
  const createCandidate = useCreateCandidate();

  // Extract text from uploaded file
  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      try {
        const pdfParseModule = await import("pdf-parse");
        let pdfParse: any;
        
        if (pdfParseModule.default && typeof pdfParseModule.default === "function") {
          pdfParse = pdfParseModule.default;
        } else if (pdfParseModule.pdfParse && typeof pdfParseModule.pdfParse === "function") {
          pdfParse = pdfParseModule.pdfParse;
        } else if (typeof pdfParseModule === "function") {
          pdfParse = pdfParseModule;
        } else {
          const keys = Object.keys(pdfParseModule);
          const funcKey = keys.find((k) => typeof (pdfParseModule as any)[k] === "function" && k.toLowerCase().includes("parse"));
          pdfParse = funcKey ? (pdfParseModule as any)[funcKey] : pdfParseModule.default || pdfParseModule;
        }
        
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const buffer = Buffer.from(uint8Array);
        
        let data;
        if (typeof pdfParse === "function") {
          if (pdfParse.prototype && pdfParse.prototype.constructor === pdfParse) {
            const instance = new pdfParse(buffer);
            if (typeof instance.parse === "function") {
              data = await instance.parse();
            } else if (typeof instance === "object" && instance.text) {
              data = instance;
            } else {
              data = instance;
            }
          } else {
            data = await pdfParse(buffer);
          }
        }
        
        return data?.text || "";
      } catch (error: any) {
        console.error("PDF parsing error:", error);
        toast.error(`Failed to parse PDF: ${error.message}`);
        throw error;
      }
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.endsWith(".docx")
    ) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value || "";
      } catch (error: any) {
        console.error("DOCX parsing error:", error);
        toast.error(`Failed to parse DOCX: ${error.message}`);
        throw error;
      }
    } else if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target?.result as string);
        };
        reader.onerror = reject;
        reader.readAsText(file);
      });
    } else {
      toast.error("Unsupported file type. Please upload PDF, DOCX, or TXT.");
      throw new Error("Unsupported file type");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const extractedText = await extractTextFromFile(file);
      setResumeText(extractedText);
      setUploadedFileName(file.name);
      toast.success(`Resume uploaded and extracted (${extractedText.length.toLocaleString()} characters)`);
    } catch (error) {
      // Error already handled in extractTextFromFile
    } finally {
      setUploading(false);
    }
  };

  // Update selected role when preselectedRoleId changes
  useEffect(() => {
    if (preselectedRoleId) {
      setSelectedRoleId(preselectedRoleId);
    }
  }, [preselectedRoleId]);

  const handleScore = async () => {
    if (!resumeText.trim()) {
      toast.error("Please paste the resume content");
      return;
    }

    if (!requirements.trim()) {
      toast.error("Please enter job requirements");
      return;
    }

    setIsScoring(true);
    try {
      const reqArray = requirements
        .split("\n")
        .filter((r) => r.trim())
        .map((r) => r.trim());

      const score = await scoreResume(resumeText, reqArray);
      setResult(score);
      
      if (onScoreGenerated) {
        onScoreGenerated(score.score);
      }
      
      toast.success("Resume scored successfully!");
      setShowSaveDialog(true);
    } catch (error) {
      console.error("Error scoring resume:", error);
      toast.error("Failed to score resume. Please try again.");
    } finally {
      setIsScoring(false);
    }
  };

  const handleSaveCandidate = async () => {
    if (!candidateName.trim() || !candidateEmail.trim()) {
      toast.error("Name and email are required");
      return;
    }

    if (!result) {
      toast.error("No score result available");
      return;
    }

    try {
      await createCandidate.mutateAsync({
        name: candidateName.trim(),
        email: candidateEmail.trim(),
        phone: candidatePhone.trim() || null,
        role_id: selectedRoleId && selectedRoleId !== "none" ? selectedRoleId : null,
        resume_url: null,
        score: result.score,
        status: "screening",
        interview_notes: null,
        screening_results: {
          strengths: result.strengths,
          gaps: result.gaps,
          summary: result.summary,
        },
      });

      setShowSaveDialog(false);
      setCandidateName("");
      setCandidateEmail("");
      setCandidatePhone("");
      setSelectedRoleId(preselectedRoleId);
      toast.success("Candidate saved successfully!");
    } catch (error) {
      console.error("Error saving candidate:", error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: "Excellent Match", variant: "default" as const };
    if (score >= 60) return { label: "Good Match", variant: "secondary" as const };
    return { label: "Needs Review", variant: "destructive" as const };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Resume Screener
          </CardTitle>
          <CardDescription>
            Automatically score resumes against job requirements using AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="requirements">Job Requirements *</Label>
            <Textarea
              id="requirements"
              placeholder="Enter each requirement on a new line&#10;e.g.,&#10;5+ years React experience&#10;TypeScript proficiency&#10;Team leadership skills"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              disabled={isScoring}
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              One requirement per line
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume">Resume Content *</Label>
            <div className="flex items-center gap-2 mb-2">
              <Input
                id="file-upload"
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileUpload}
                disabled={isScoring || uploading}
                className="hidden"
              />
              <Label htmlFor="file-upload" asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isScoring || uploading}
                  className="cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Resume
                    </>
                  )}
                </Button>
              </Label>
              {uploadedFileName && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span className="truncate max-w-[200px]">{uploadedFileName}</span>
                </div>
              )}
            </div>
            <Textarea
              id="resume"
              placeholder="Paste the candidate's resume content here, or upload a PDF/DOCX file above..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              disabled={isScoring || uploading}
              rows={10}
            />
            <p className="text-xs text-muted-foreground">
              Supports PDF, DOCX, or TXT files. You can also paste plain text.
            </p>
          </div>

          <Button
            onClick={handleScore}
            disabled={isScoring || !resumeText.trim() || !requirements.trim()}
            className="w-full"
          >
            {isScoring ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Resume...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Score Resume
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Resume Analysis Results</CardTitle>
              <Badge {...getScoreBadge(result.score)}>
                {getScoreBadge(result.score).label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Display */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Score</span>
                <span className={`text-3xl font-bold ${getScoreColor(result.score)}`}>
                  {result.score}/100
                </span>
              </div>
              <Progress value={result.score} className="h-3" />
            </div>

            {/* Summary */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Summary</h3>
              <p className="text-muted-foreground">{result.summary}</p>
            </div>

            {/* Strengths */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Strengths
              </h3>
              <ul className="space-y-2">
                {result.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-600 mt-2" />
                    <span className="text-muted-foreground">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Gaps */}
            {result.gaps.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  Gaps / Areas of Concern
                </h3>
                <ul className="space-y-2">
                  {result.gaps.map((gap, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-yellow-600 mt-2" />
                      <span className="text-muted-foreground">{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Save Candidate Dialog */}
            {result && (
              <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-accent" />
                      Save Candidate
                    </DialogTitle>
                    <DialogDescription>
                      Save this candidate to your pipeline with the AI screening results.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="candidate-name">Name *</Label>
                      <Input
                        id="candidate-name"
                        placeholder="John Doe"
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="candidate-email">Email *</Label>
                      <Input
                        id="candidate-email"
                        type="email"
                        placeholder="john.doe@example.com"
                        value={candidateEmail}
                        onChange={(e) => setCandidateEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="candidate-phone">Phone</Label>
                      <Input
                        id="candidate-phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={candidatePhone}
                        onChange={(e) => setCandidatePhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="candidate-role">Role</Label>
                      <Select 
                        value={selectedRoleId || "none"} 
                        onValueChange={(value) => setSelectedRoleId(value === "none" ? undefined : value)}
                      >
                        <SelectTrigger id="candidate-role">
                          <SelectValue placeholder="Select a role (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Role</SelectItem>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="rounded-lg border p-3 bg-muted/50">
                      <p className="text-sm font-medium mb-1">AI Score: {result.score}/100</p>
                      <p className="text-xs text-muted-foreground">
                        Screening results will be saved with the candidate profile.
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveCandidate}
                      disabled={!candidateName.trim() || !candidateEmail.trim() || createCandidate.isPending}
                    >
                      {createCandidate.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Save Candidate
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

