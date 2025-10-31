import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCompanyInfo } from "@/hooks/useFinanceData";
import { usePitchDeckAnalyses, useCreatePitchDeckAnalysis } from "@/hooks/useFinanceData";
import { useRunway, useCashFlow } from "@/hooks/useFinanceData";
import { analyzePitchDeck } from "@/lib/gemini";
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

  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [deckText, setDeckText] = useState<string>("");

  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      // Extract text from PDF using dynamic import
      try {
        // Use dynamic import with proper error handling
        const pdfParseModule = await import("pdf-parse");
        
        // Handle different export patterns
        let pdfParse: any;
        if (typeof pdfParseModule === "function") {
          pdfParse = pdfParseModule;
        } else if (pdfParseModule.default) {
          pdfParse = pdfParseModule.default;
        } else if (pdfParseModule.pdfParse) {
          pdfParse = pdfParseModule.pdfParse;
        } else {
          // Get the default export or the module itself
          pdfParse = pdfParseModule.default || pdfParseModule;
        }
        
        // Ensure pdfParse is a function
        if (typeof pdfParse !== "function") {
          throw new Error("pdf-parse is not a function");
        }
        
        const arrayBuffer = await file.arrayBuffer();
        // Use Uint8Array and convert to Buffer safely
        const uint8Array = new Uint8Array(arrayBuffer);
        const buffer = Buffer.from(uint8Array);
        
        // Call with 'new' if it's a class, otherwise call as function
        let data;
        try {
          data = await pdfParse(buffer);
        } catch (constructorError: any) {
          // If it fails, try as constructor
          if (constructorError.message?.includes("cannot be invoked without 'new'")) {
            const PdfParseClass = pdfParse as any;
            const instance = new PdfParseClass(buffer);
            data = await instance.parse ? instance.parse() : instance;
          } else {
            throw constructorError;
          }
        }
        
        return data?.text || "";
      } catch (error: any) {
        console.error("PDF parsing error:", error);
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

  return (
    <div className="space-y-6">
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
    </div>
  );
}
