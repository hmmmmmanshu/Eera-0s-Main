import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCompanyInfo } from "@/hooks/useFinanceData";
import { usePitchDeckAnalyses, useCreatePitchDeckAnalysis } from "@/hooks/useFinanceData";
import { useRunway, useCashFlow } from "@/hooks/useFinanceData";
import { analyzePitchDeck } from "@/lib/gemini";
import {
  generatePresentation,
  buildPitchDeckPrompt,
  type SlidesGPTPresentation,
} from "@/lib/slidesgpt";
import {
  FileText,
  Upload,
  Loader2,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  History,
  Wand2,
  Download,
  ExternalLink,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import mammoth from "mammoth";
import { Buffer } from "buffer";

// Make Buffer available globally for pdf-parse
if (typeof window !== "undefined" && !window.Buffer) {
  window.Buffer = Buffer;
}

export function PitchDeckAnalyzer() {
  const { data: companyInfo } = useCompanyInfo();
  const { data: runway } = useRunway();
  const { data: cashFlow = [] } = useCashFlow(6);
  const { data: analyses = [] } = usePitchDeckAnalyses();
  const createAnalysisMutation = useCreatePitchDeckAnalysis();

  // Analysis states
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [deckText, setDeckText] = useState<string>("");

  // Generation states
  const [generating, setGenerating] = useState(false);
  const [generatedPresentation, setGeneratedPresentation] = useState<SlidesGPTPresentation | null>(null);
  const [generationForm, setGenerationForm] = useState({
    topic: "",
    keyPoints: [""],
    targetAudience: "",
    fundingAsk: "",
    useOfFunds: "",
    additionalContext: "",
    theme: "professional" as "default" | "modern" | "professional" | "creative" | "minimal",
    slides: 10,
  });

  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      // Extract text from PDF using dynamic import
      try {
        // Use dynamic import with proper error handling
        const pdfParseModule = await import("pdf-parse");
        
        // Handle different export patterns - pdf-parse exports in various ways
        let pdfParse: any;
        
        // Try default export first
        if (pdfParseModule.default && typeof pdfParseModule.default === "function") {
          pdfParse = pdfParseModule.default;
        } 
        // Try named export
        else if (pdfParseModule.pdfParse && typeof pdfParseModule.pdfParse === "function") {
          pdfParse = pdfParseModule.pdfParse;
        }
        // Try direct function
        else if (typeof pdfParseModule === "function") {
          pdfParse = pdfParseModule;
        }
        // Try accessing any function in the module
        else {
          const keys = Object.keys(pdfParseModule);
          const funcKey = keys.find((k) => typeof (pdfParseModule as any)[k] === "function" && k.toLowerCase().includes("parse"));
          if (funcKey) {
            pdfParse = (pdfParseModule as any)[funcKey];
          } else {
            // Last resort: try to find any function
            const anyFuncKey = keys.find((k) => typeof (pdfParseModule as any)[k] === "function");
            if (anyFuncKey) {
              pdfParse = (pdfParseModule as any)[anyFuncKey];
            } else {
              // If still nothing, try using default or module itself
              pdfParse = pdfParseModule.default || pdfParseModule;
            }
          }
        }
        
        const arrayBuffer = await file.arrayBuffer();
        // Use Uint8Array and convert to Buffer safely
        const uint8Array = new Uint8Array(arrayBuffer);
        const buffer = Buffer.from(uint8Array);
        
        // Try calling as function first
        let data;
        try {
          // First, try as a function call
          if (typeof pdfParse === "function") {
            // Check if it's a class constructor (has prototype)
            if (pdfParse.prototype && pdfParse.prototype.constructor === pdfParse) {
              // It's a class, instantiate it
              const instance = new pdfParse(buffer);
              // Some classes might have a parse method, others might be callable directly
              if (typeof instance.parse === "function") {
                data = await instance.parse();
              } else if (typeof instance === "object" && instance.text) {
                data = instance;
              } else {
                // Try calling the instance itself
                data = instance;
              }
            } else {
              // It's a regular function, call it directly
              data = await pdfParse(buffer);
            }
          } else {
            // Not a function, try to access default or parse method
            if (pdfParseModule.default && typeof pdfParseModule.default === "function") {
              const PdfClass = pdfParseModule.default;
              const instance = new PdfClass(buffer);
              data = instance.text ? instance : await (instance.parse ? instance.parse() : instance);
            } else {
              throw new Error("Could not find callable pdf-parse function or class");
            }
          }
        } catch (error: any) {
          // If function call fails, try as class constructor
          if (error.message?.includes("cannot be invoked without 'new'")) {
            try {
              // It's definitely a class, instantiate it
              const PdfClass = pdfParse as any;
              const instance = new PdfClass(buffer);
              // Try different ways to get the text
              if (instance.text) {
                data = instance;
              } else if (typeof instance.parse === "function") {
                data = await instance.parse();
              } else if (typeof instance.then === "function") {
                // It's a promise, await it
                data = await instance;
              } else {
                // Last resort: try calling the instance
                data = instance;
              }
            } catch (classError: any) {
              console.error("Failed to instantiate pdf-parse as class:", classError);
              throw new Error(`Failed to parse PDF: ${classError.message}`);
            }
          } else {
            throw error;
          }
        }
        
        // Extract text from result
        if (data && typeof data === "object") {
          return data.text || data.content || "";
        }
        
        return "";
      } catch (error: any) {
        console.error("PDF parsing error:", error);
        console.error("Error details:", error.stack);
        toast.error(`Failed to parse PDF: ${error.message}`);
        throw error;
      }
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
      file.name.endsWith(".pptx")
    ) {
      // Extract text from PowerPoint (.pptx) using mammoth
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value || "";
      } catch (error: any) {
        console.error("PPTX parsing error:", error);
        toast.error(`Failed to parse PowerPoint file: ${error.message}`);
        throw error;
      }
    } else if (
      file.type === "application/vnd.ms-powerpoint" ||
      file.name.endsWith(".ppt")
    ) {
      toast.error("Legacy .ppt format not supported. Please convert to .pptx");
      throw new Error("Legacy .ppt format not supported");
    } else {
      // Fallback for other file types (try as text)
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target?.result as string);
        };
        reader.onerror = reject;
        reader.readAsText(file);
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
    const isPptx =
      file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
      file.name.endsWith(".pptx");
    const isPpt = file.type === "application/vnd.ms-powerpoint" || file.name.endsWith(".ppt");

    if (!isPdf && !isPptx && !isPpt) {
      toast.error("Please upload a PDF or PowerPoint (.pptx) file");
      return;
    }

    try {
      setUploading(true);
      setUploadedFile(file);

      // Extract text from file
      const extractedText = await extractTextFromFile(file);
      setDeckText(extractedText);

      // Upload to Supabase Storage
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("pitch-decks")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      toast.success(
        `File uploaded successfully. Extracted ${extractedText.length.toLocaleString()} characters.`
      );
    } catch (error: any) {
      toast.error(`Failed to upload file: ${error.message}`);
      setUploadedFile(null);
      setDeckText("");
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile && !deckText) {
      toast.error("Please upload a pitch deck first");
      return;
    }

    try {
      setAnalyzing(true);

      // Prepare financial data
      const financialData = runway
        ? {
            runway: runway.runway_months,
            burnRate: runway.monthly_burn_rate,
            cashBalance: runway.cash_balance,
          }
        : undefined;

      const analysis = await analyzePitchDeck(
        deckText || "Pitch deck content extracted from uploaded file",
        companyInfo
          ? {
              companyName: companyInfo.company_name,
              industry: undefined, // Could be added to company_info
              stage: undefined,
            }
          : undefined,
        financialData
      );

      setAnalysisResult(analysis);
      toast.success("Analysis completed!");
    } catch (error: any) {
      toast.error(`Failed to analyze pitch deck: ${error.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveAnalysis = async () => {
    if (!analysisResult || !uploadedFile) {
      toast.error("Please complete analysis first");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      return;
    }

    // Get file URL
    const fileExt = uploadedFile.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const {
      data: { publicUrl },
    } = supabase.storage.from("pitch-decks").getPublicUrl(fileName);

    await createAnalysisMutation.mutateAsync({
      deck_name: uploadedFile.name,
      deck_url: publicUrl,
      analysis_summary: analysisResult.summary,
      financial_health_score: analysisResult.financialHealthScore,
      investor_readiness_score: analysisResult.investorReadinessScore,
      key_insights: analysisResult.keyInsights,
      red_flags: analysisResult.redFlags,
      recommendations: analysisResult.recommendations,
    });

    toast.success("Analysis saved!");
  };

  // Handle pitch deck generation
  const handleGeneratePitchDeck = async () => {
    if (!generationForm.topic.trim()) {
      toast.error("Please provide a topic/theme for your pitch deck");
      return;
    }

    try {
      setGenerating(true);

      // Build comprehensive prompt
      const prompt = buildPitchDeckPrompt(
        {
          companyName: companyInfo?.company_name,
          industry: undefined, // Could be added to company_info
          description: undefined,
          stage: undefined,
        },
        runway
          ? {
              runway: runway.runway_months,
              burnRate: runway.monthly_burn_rate,
              cashBalance: runway.cash_balance,
              revenue: undefined,
              growthRate: undefined,
            }
          : undefined,
        {
          topic: generationForm.topic,
          keyPoints: generationForm.keyPoints.filter((p) => p.trim()),
          targetAudience: generationForm.targetAudience,
          fundingAsk: generationForm.fundingAsk,
          useOfFunds: generationForm.useOfFunds,
          additionalContext: generationForm.additionalContext,
        }
      );

      // Generate presentation
      const response = await generatePresentation({
        prompt,
        theme: generationForm.theme,
        slides: generationForm.slides,
      });

      setGeneratedPresentation(response.presentation);
      toast.success("Pitch deck generated successfully!");
    } catch (error: any) {
      toast.error(`Failed to generate pitch deck: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  // Add key point
  const addKeyPoint = () => {
    setGenerationForm({
      ...generationForm,
      keyPoints: [...generationForm.keyPoints, ""],
    });
  };

  // Remove key point
  const removeKeyPoint = (index: number) => {
    setGenerationForm({
      ...generationForm,
      keyPoints: generationForm.keyPoints.filter((_, i) => i !== index),
    });
  };

  // Update key point
  const updateKeyPoint = (index: number, value: string) => {
    const newKeyPoints = [...generationForm.keyPoints];
    newKeyPoints[index] = value;
    setGenerationForm({
      ...generationForm,
      keyPoints: newKeyPoints,
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">
            <Wand2 className="h-4 w-4 mr-2" />
            Generate Pitch Deck
          </TabsTrigger>
          <TabsTrigger value="analyze">
            <FileText className="h-4 w-4 mr-2" />
            Analyze Existing
          </TabsTrigger>
        </TabsList>

        {/* Generate Pitch Deck Tab */}
        <TabsContent value="generate" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Generate AI Pitch Deck
              </CardTitle>
              <CardDescription>
                Create a professional pitch deck using AI. We'll use your company context and ask for key inputs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Company Context Preview */}
              {companyInfo && (
                <div className="p-4 bg-accent/10 rounded-lg">
                  <h4 className="font-semibold mb-2">Company Context (Auto-filled)</h4>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>
                      <strong>Company:</strong> {companyInfo.company_name}
                    </p>
                    {runway && (
                      <>
                        <p>
                          <strong>Cash Balance:</strong> $
                          {Number(runway.cash_balance).toLocaleString()}
                        </p>
                        <p>
                          <strong>Runway:</strong> {runway.runway_months} months
                        </p>
                        <p>
                          <strong>Burn Rate:</strong> $
                          {Number(runway.monthly_burn_rate).toLocaleString()}/month
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Topic */}
              <div>
                <Label htmlFor="pitch-topic">
                  Pitch Topic / Theme <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="pitch-topic"
                  placeholder="e.g., Seed funding round, Product launch, Market expansion"
                  value={generationForm.topic}
                  onChange={(e) =>
                    setGenerationForm({ ...generationForm, topic: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  What is the main focus of this pitch deck?
                </p>
              </div>

              {/* Key Points */}
              <div>
                <Label>Key Points to Highlight</Label>
                <div className="space-y-2">
                  {generationForm.keyPoints.map((point, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Key point ${index + 1} (e.g., 200% YoY growth, 10K+ users)`}
                        value={point}
                        onChange={(e) => updateKeyPoint(index, e.target.value)}
                      />
                      {generationForm.keyPoints.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeKeyPoint(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addKeyPoint}
                    className="w-full"
                  >
                    + Add Key Point
                  </Button>
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <Label htmlFor="target-audience">Target Audience</Label>
                <Input
                  id="target-audience"
                  placeholder="e.g., Seed-stage VCs, Angel investors, Strategic partners"
                  value={generationForm.targetAudience}
                  onChange={(e) =>
                    setGenerationForm({ ...generationForm, targetAudience: e.target.value })
                  }
                />
              </div>

              {/* Funding Ask */}
              <div>
                <Label htmlFor="funding-ask">Funding Ask</Label>
                <Input
                  id="funding-ask"
                  placeholder="e.g., $2M seed round, $500K pre-seed"
                  value={generationForm.fundingAsk}
                  onChange={(e) =>
                    setGenerationForm({ ...generationForm, fundingAsk: e.target.value })
                  }
                />
              </div>

              {/* Use of Funds */}
              <div>
                <Label htmlFor="use-of-funds">Use of Funds</Label>
                <Textarea
                  id="use-of-funds"
                  placeholder="e.g., 40% product development, 30% marketing, 20% team, 10% operations"
                  value={generationForm.useOfFunds}
                  onChange={(e) =>
                    setGenerationForm({ ...generationForm, useOfFunds: e.target.value })
                  }
                  rows={3}
                />
              </div>

              {/* Additional Context */}
              <div>
                <Label htmlFor="additional-context">Additional Context</Label>
                <Textarea
                  id="additional-context"
                  placeholder="Any additional information, milestones, partnerships, or highlights you want to include"
                  value={generationForm.additionalContext}
                  onChange={(e) =>
                    setGenerationForm({ ...generationForm, additionalContext: e.target.value })
                  }
                  rows={3}
                />
              </div>

              {/* Theme and Slides */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={generationForm.theme}
                    onValueChange={(value: any) =>
                      setGenerationForm({ ...generationForm, theme: value })
                    }
                  >
                    <SelectTrigger id="theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="slides">Number of Slides</Label>
                  <Input
                    id="slides"
                    type="number"
                    min="5"
                    max="30"
                    value={generationForm.slides}
                    onChange={(e) =>
                      setGenerationForm({
                        ...generationForm,
                        slides: parseInt(e.target.value) || 10,
                      })
                    }
                  />
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGeneratePitchDeck}
                disabled={generating || !generationForm.topic.trim()}
                className="w-full"
                size="lg"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Pitch Deck...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Pitch Deck
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Presentation */}
          {generatedPresentation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Presentation Generated Successfully!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Embed Preview */}
                {generatedPresentation.embed_url && (
                  <div className="border rounded-lg overflow-hidden">
                    <iframe
                      src={generatedPresentation.embed_url}
                      className="w-full h-[600px]"
                      title="Generated Pitch Deck"
                      allowFullScreen
                    />
                  </div>
                )}

                {/* Download Button */}
                <div className="flex gap-2">
                  {generatedPresentation.download_url && (
                    <Button
                      asChild
                      className="flex-1"
                      size="lg"
                    >
                      <a
                        href={generatedPresentation.download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PowerPoint
                      </a>
                    </Button>
                  )}
                  {generatedPresentation.embed_url && (
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1"
                      size="lg"
                    >
                      <a
                        href={generatedPresentation.embed_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in New Tab
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analyze Existing Deck Tab */}
        <TabsContent value="analyze" className="space-y-6 mt-6">
          {/* Upload Section */}
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Upload & Analyze Pitch Deck
          </CardTitle>
          <CardDescription>
            Upload your pitch deck (PDF or PowerPoint) for AI-powered financial analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="pitch-deck-upload">Pitch Deck File</Label>
            <Input
              id="pitch-deck-upload"
              type="file"
              accept=".pdf,.pptx,.ppt"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            {uploadedFile && (
              <p className="text-sm text-muted-foreground mt-2">
                Uploaded: {uploadedFile.name}
              </p>
            )}
          </div>

          {uploadedFile && (
            <Button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full"
              size="lg"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze with AI
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Scores */}
          <Card>
            <CardHeader>
              <CardTitle>Scores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Financial Health</span>
                  <span className="text-2xl font-bold">
                    {analysisResult.financialHealthScore}/100
                  </span>
                </div>
                <Progress value={analysisResult.financialHealthScore} className="h-3" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Investor Readiness</span>
                  <span className="text-2xl font-bold">
                    {analysisResult.investorReadinessScore}/100
                  </span>
                </div>
                <Progress value={analysisResult.investorReadinessScore} className="h-3" />
              </div>

              {analysisResult.summary && (
                <div className="p-4 bg-accent/10 rounded-lg">
                  <p className="text-sm">{analysisResult.summary}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisResult.keyInsights.map((insight: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 p-3 bg-green-500/10 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Red Flags */}
          {analysisResult.redFlags && analysisResult.redFlags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Red Flags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisResult.redFlags.map((flag: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-3 bg-red-500/10 rounded-lg"
                    >
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{flag}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-accent" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisResult.recommendations.map((rec: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-3 bg-accent/10 rounded-lg"
                    >
                      <TrendingUp className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{rec}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          <div className="lg:col-span-2">
            <Button onClick={handleSaveAnalysis} className="w-full" size="lg">
              <FileText className="h-4 w-4 mr-2" />
              Save Analysis
            </Button>
          </div>
        </div>
      )}

      {/* History */}
      {analyses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Analysis History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyses.map((analysis: any) => (
                <div
                  key={analysis.id}
                  className="p-4 border rounded-lg hover:bg-accent/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{analysis.deck_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(analysis.created_at), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Financial Health</div>
                      <div className="text-2xl font-bold">
                        {analysis.financial_health_score || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Investor Readiness</div>
                      <div className="text-2xl font-bold">
                        {analysis.investor_readiness_score || 0}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
