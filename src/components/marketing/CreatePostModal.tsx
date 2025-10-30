import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Sparkles, 
  Upload, 
  CheckCircle, 
  Settings,
  Palette,
  Zap 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

// Hooks
import { useBrandProfile, useCreatePost } from "@/hooks/useMarketingData";
import { assembleBrandContext } from "@/lib/brandContext";

// AI Functions
import { generatePostContent, type GeneratedPostContent } from "@/lib/gemini";
import { 
  generateImageWithFallback,
  IMAGE_MODELS,
  type ImageGenerationOptions
} from "@/lib/openrouter";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePostModal = ({ open, onOpenChange }: CreatePostModalProps) => {
  // Step management
  const [step, setStep] = useState(1);
  
  // Form data
  const [platform, setPlatform] = useState<"linkedin" | "instagram">("linkedin");
  const [contentType, setContentType] = useState<"text" | "image" | "carousel" | "video">("text");
  const [headline, setHeadline] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [tone, setTone] = useState<"quirky" | "humble" | "inspirational" | "professional" | "witty">("professional");
  const [objective, setObjective] = useState<"awareness" | "leads" | "engagement" | "recruitment">("engagement");
  
  // Image generation (Step 3.5)
  const [selectedModel, setSelectedModel] = useState<keyof typeof IMAGE_MODELS>("google/gemini-2.0-flash-exp-image:free");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "9:16">("1:1");
  const [negativePrompt, setNegativePrompt] = useState("");
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState({
    brandAnalysis: "pending",
    contentGen: "pending",
    imageGen: "pending",
    optimization: "pending",
  });
  const [generationTime, setGenerationTime] = useState(0);
  const [actualCost, setActualCost] = useState(0);
  
  // Generated content
  const [generatedContent, setGeneratedContent] = useState<GeneratedPostContent | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  
  // Hooks
  const { data: profile } = useBrandProfile();
  const createPostMutation = useCreatePost();

  const resetAndClose = () => {
    setStep(1);
    setHeadline("");
    setKeyPoints("");
    setGeneratedContent(null);
    setGeneratedImageUrl(null);
    onOpenChange(false);
  };

  const contentTypes = [
    { id: "text" as const, icon: FileText, label: "Text Only", platforms: ["linkedin"] },
    { id: "image" as const, icon: ImageIcon, label: "Image Post", platforms: ["linkedin", "instagram"] },
    { id: "carousel" as const, icon: ImageIcon, label: "Carousel", platforms: ["instagram"] },
    { id: "video" as const, icon: Video, label: "Reel/Short", platforms: ["instagram"] },
  ];

  // Auto-trigger generation when reaching step 4
  useEffect(() => {
    if (step === 4 && !generatedContent && !isGenerating) {
      handleGeneration();
    }
  }, [step]);

  const handleGeneration = async () => {
    if (!headline.trim()) {
      toast.error("Please provide a headline");
      setStep(3);
      return;
    }

    if (!profile) {
      toast.error("Complete your brand profile first");
      return;
    }

    setIsGenerating(true);
    const startTime = Date.now();

    try {
      // 1. Brand Analysis
      setGenerationStatus(prev => ({ ...prev, brandAnalysis: "in-progress" }));
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate analysis
      const brandContext = assembleBrandContext(profile);
      setGenerationStatus(prev => ({ ...prev, brandAnalysis: "complete" }));

      // 2. Generate Text Content
      setGenerationStatus(prev => ({ ...prev, contentGen: "in-progress" }));
      const textContent = await generatePostContent({
        platform,
        contentType,
        headline,
        keyPoints,
        tone,
        objective,
        brandContext,
      });
      setGeneratedContent(textContent);
      setGenerationStatus(prev => ({ ...prev, contentGen: "complete" }));

      // 3. Generate Image (if needed)
      let imageUrl = null;
      let imageCost = 0;
      if (contentType === "image" || contentType === "carousel") {
        setGenerationStatus(prev => ({ ...prev, imageGen: "in-progress" }));
        
        console.log("[CreatePostModal] Starting image generation with OpenRouter");
        const imagePrompt = `${headline}. ${keyPoints || ""}`;
        
        const imageResult = await generateImageWithFallback({
          model: selectedModel,
          prompt: imagePrompt,
          brandContext,
          aspectRatio: aspectRatio,
          negativePrompt: negativePrompt || undefined,
        });
        
        imageUrl = imageResult.url;
        imageCost = imageResult.cost;
        setGeneratedImageUrl(imageUrl);
        setGenerationStatus(prev => ({ ...prev, imageGen: "complete" }));
        
        console.log("[CreatePostModal] Image generation complete:", {
          url: imageUrl,
          model: imageResult.model,
          cost: imageCost,
          time: imageResult.generationTime
        });
      } else {
        setGenerationStatus(prev => ({ ...prev, imageGen: "skipped" }));
      }

      // 4. Optimization
      setGenerationStatus(prev => ({ ...prev, optimization: "in-progress" }));
      await new Promise(resolve => setTimeout(resolve, 500));
      setGenerationStatus(prev => ({ ...prev, optimization: "complete" }));

      const endTime = Date.now();
      setGenerationTime((endTime - startTime) / 1000);
      
      // Calculate actual cost
      let cost = 0; // Gemini text generation is FREE
      if (contentType === "image" || contentType === "carousel") {
        cost += imageCost;
      }
      setActualCost(cost);

      toast.success("Content generated successfully!");
      
      // Move to preview after short delay
      setTimeout(() => setStep(5), 1000);
      
    } catch (error: unknown) {
      console.error("Generation failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Generation failed: ${errorMessage}`);
      setStep(3); // Go back to input
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!generatedContent) {
      toast.error("No content to save");
      return;
    }

    console.log("[Save Draft] Starting save:", {
      platform,
      contentLength: generatedContent.caption?.length,
      hasImage: !!generatedImageUrl,
      imageUrl: generatedImageUrl,
    });

    try {
      const postData = {
        platform,
        content: generatedContent.caption,
        media_urls: generatedImageUrl ? [generatedImageUrl] : [],
        status: "draft" as const,
        scheduled_time: null,
        published_time: null,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
      };

      console.log("[Save Draft] Post data:", postData);

      const result = await createPostMutation.mutateAsync(postData);
      
      console.log("[Save Draft] Save successful:", result);
      toast.success("Draft saved successfully!");
      resetAndClose();
    } catch (error) {
      console.error("[Save Draft] Save failed:", error);
      toast.error(`Failed to save draft: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
          <DialogDescription>
            Step {step} of {contentType === "text" ? 4 : 5}: {
              step === 1 ? "Choose Platform" :
              step === 2 ? "Select Format" :
              step === 3 ? "Add Content" :
              step === 3.5 ? "Choose AI Model" :
              step === 4 ? "Generate" :
              "Preview & Schedule"
            }
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Platform */}
        {step === 1 && (
          <div className="space-y-4">
            <Label>Choose Platform</Label>
            <div className="grid grid-cols-2 gap-4">
              <Card 
                className={`cursor-pointer transition-all ${platform === "linkedin" ? "ring-2 ring-primary" : ""}`}
                onClick={() => setPlatform("linkedin")}
              >
                <CardContent className="p-6 text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-semibold">LinkedIn</p>
                  <Badge variant="secondary">Professional</Badge>
                </CardContent>
              </Card>
              <Card 
                className={`cursor-pointer transition-all ${platform === "instagram" ? "ring-2 ring-primary" : ""}`}
                onClick={() => setPlatform("instagram")}
              >
                <CardContent className="p-6 text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-semibold">Instagram</p>
                  <Badge variant="secondary">Visual</Badge>
                </CardContent>
              </Card>
            </div>
            <Button className="w-full" onClick={() => setStep(2)}>
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Content Type */}
        {step === 2 && (
          <div className="space-y-4">
            <Label>Select Content Type</Label>
            <div className="grid grid-cols-2 gap-4">
              {contentTypes
                .filter(type => type.platforms.includes(platform))
                .map((type) => {
                  const Icon = type.icon;
                  return (
                    <Card 
                      key={type.id}
                      className={`cursor-pointer transition-all ${contentType === type.id ? "ring-2 ring-primary" : ""}`}
                      onClick={() => setContentType(type.id)}
                    >
                      <CardContent className="p-6 text-center space-y-2">
                        <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <p className="font-semibold">{type.label}</p>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button className="flex-1" onClick={() => setStep(3)}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Content Input */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="headline">Headline / Hook *</Label>
              <Input 
                id="headline" 
                placeholder="What's your main message?" 
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="keypoints">Key Points (optional)</Label>
              <Textarea 
                id="keypoints" 
                placeholder="• Point 1&#10;• Point 2&#10;• Point 3"
                rows={4}
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <Select value={tone} onValueChange={(v: typeof tone) => setTone(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quirky">Quirky</SelectItem>
                    <SelectItem value="humble">Humble</SelectItem>
                    <SelectItem value="inspirational">Inspirational</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="witty">Witty</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="objective">Objective</Label>
                <Select value={objective} onValueChange={(v: typeof objective) => setObjective(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="awareness">Awareness</SelectItem>
                    <SelectItem value="leads">Generate Leads</SelectItem>
                    <SelectItem value="engagement">Engagement</SelectItem>
                    <SelectItem value="recruitment">Recruitment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button 
                className="flex-1 gap-2" 
                onClick={() => {
                  if (contentType === "image" || contentType === "carousel") {
                    setStep(3.5); // Go to model selection
                  } else {
                    setStep(4); // Skip to generation
                  }
                }}
              >
                <Sparkles className="w-4 h-4" />
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3.5: Model Selection (for image/video content) */}
        {step === 3.5 && (contentType === "image" || contentType === "carousel" || contentType === "video") && (
          <div className="space-y-4">
            <div>
              <Label>Choose AI Model</Label>
              <p className="text-xs text-muted-foreground mt-1">
                All models automatically apply your brand colors
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(IMAGE_MODELS).map(([modelKey, info]) => {
                const model = modelKey as keyof typeof IMAGE_MODELS;
                return (
                  <Card
                    key={model}
                    className={`cursor-pointer transition-all hover:border-primary/50 ${
                      selectedModel === model ? "ring-2 ring-primary border-primary" : ""
                    }`}
                    onClick={() => setSelectedModel(model)}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <Badge variant="secondary" className="text-xs">{info.badge}</Badge>
                      </div>
                      <p className="font-semibold text-sm">{info.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{info.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-medium">${info.cost}/img</span>
                        <span className="text-muted-foreground">{info.speed}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Advanced Options */}
            <Accordion type="single" collapsible>
              <AccordionItem value="advanced">
                <AccordionTrigger className="text-sm">Advanced Options</AccordionTrigger>
                <AccordionContent className="space-y-3 pt-2">
              <div className="space-y-2">
                <Label className="text-xs">Aspect Ratio</Label>
                <Select value={aspectRatio} onValueChange={(v: any) => setAspectRatio(v)}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1:1">Square (1:1) - Instagram/LinkedIn</SelectItem>
                    <SelectItem value="16:9">Landscape (16:9) - LinkedIn Post</SelectItem>
                    <SelectItem value="9:16">Portrait (9:16) - Instagram Stories</SelectItem>
                  </SelectContent>
                </Select>
              </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">Negative Prompt (Optional)</Label>
                    <Textarea 
                      placeholder="What to avoid in the image: blurry, watermark, text artifacts..."
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      rows={2}
                      className="text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Helps improve quality by specifying what should NOT appear
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button className="flex-1 gap-2" onClick={() => setStep(4)}>
                <Zap className="w-4 h-4" />
                Generate with {IMAGE_MODELS[selectedModel].name}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Generation */}
        {step === 4 && (
          <div className="space-y-6 py-8">
            {isGenerating ? (
              <>
                <div className="text-center">
                  <div className="relative">
                    <Sparkles className="w-16 h-16 mx-auto animate-pulse text-primary" />
                    {(contentType === "image" || contentType === "carousel") && (
                      <Badge className="absolute bottom-0 right-1/3 text-xs">
                        {IMAGE_MODELS[selectedModel].name}
                      </Badge>
                    )}
                  </div>
                  <p className="font-semibold mt-4">Generating your content...</p>
                  <p className="text-sm text-muted-foreground">
                    {contentType === "image" || contentType === "carousel"
                      ? `Using ${IMAGE_MODELS[selectedModel].name} via OpenRouter • ~5-10s`
                      : "Using Gemini 2.0 Flash (FREE) • ~2-3s"}
                  </p>
                </div>
                
                {/* Progressive Status */}
                <div className="space-y-2">
                  <StatusLine 
                    status={generationStatus.brandAnalysis} 
                    text="✓ Analyzing brand voice & colors" 
                  />
                  <StatusLine 
                    status={generationStatus.contentGen} 
                    text="✓ Generating copy & hashtags" 
                  />
                  {(contentType === "image" || contentType === "carousel") && (
                    <StatusLine 
                      status={generationStatus.imageGen} 
                      text="🎨 Creating brand-aware visuals" 
                    />
                  )}
                  <StatusLine 
                    status={generationStatus.optimization} 
                    text="⚡ Optimizing for engagement" 
                  />
                </div>
                
                {/* Cost Estimate */}
                <div className="text-center text-xs text-muted-foreground">
                  Estimated cost: ${contentType === "image" || contentType === "carousel" ? IMAGE_MODELS[selectedModel].cost.toFixed(3) : "0.000"} (Text is FREE!)
                </div>
              </>
            ) : generatedContent ? (
              <>
                <div className="text-center text-green-600">
                  <CheckCircle className="w-16 h-16 mx-auto" />
                  <p className="font-semibold">Content generated successfully!</p>
                  <p className="text-sm text-muted-foreground">
                    {contentType === "image" || contentType === "carousel" ? `${IMAGE_MODELS[selectedModel].name} • ` : "Gemini 2.0 Flash • "}
                    Time: {generationTime.toFixed(1)}s • Cost: ${actualCost.toFixed(3)}
                  </p>
                </div>
                <Button onClick={() => setStep(5)} className="w-full">
                  Preview & Edit
                </Button>
              </>
            ) : null}
          </div>
        )}

        {/* Step 5: Preview */}
        {step === 5 && generatedContent && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                      {profile?.startup_name?.[0] || "B"}
                    </div>
                    <div>
                      <p className="font-semibold">{profile?.startup_name || "Your Brand"}</p>
                      <p className="text-xs text-muted-foreground">Just now • {platform}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="whitespace-pre-wrap">{generatedContent.caption}</p>
                  </div>
                  
                  {generatedImageUrl && (
                    <div className="aspect-video rounded-lg overflow-hidden">
                      <img 
                        src={generatedImageUrl} 
                        alt="Generated content" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {generatedContent.hashtags.map((tag, i) => (
                      <Badge key={i} variant="secondary">#{tag}</Badge>
                    ))}
                  </div>

                  {generatedContent.callToAction && (
                    <div className="p-3 bg-muted/50 rounded-lg text-sm">
                      <strong>CTA:</strong> {generatedContent.callToAction}
                    </div>
                  )}

                  {/* AI Reasoning */}
                  <Accordion type="single" collapsible>
                    <AccordionItem value="reasoning">
                      <AccordionTrigger className="text-sm">AI Strategy Reasoning</AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        {generatedContent.aiReasoning}
                      </AccordionContent>
                    </AccordionItem>
                    {generatedContent.alternativeVersions.length > 0 && (
                      <AccordionItem value="alternatives">
                        <AccordionTrigger className="text-sm">Alternative Versions</AccordionTrigger>
                        <AccordionContent className="space-y-3">
                          {generatedContent.alternativeVersions.map((alt, i) => (
                            <div key={i} className="p-3 bg-muted/30 rounded text-sm">
                              <strong>Version {i + 1}:</strong>
                              <p className="mt-1 whitespace-pre-wrap">{alt}</p>
                            </div>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    )}
                  </Accordion>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(3)}>
                Edit
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleSaveDraft}
                disabled={createPostMutation.isPending}
              >
                {createPostMutation.isPending ? "Saving..." : "Save Draft"}
              </Button>
              <Button className="flex-1" onClick={resetAndClose}>
                Schedule
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Helper component for status lines
function StatusLine({ status, text }: { status: string; text: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={status === "complete" ? "text-green-600" : ""}>
        {status === "complete" ? "✓" : status === "in-progress" ? "⏳" : "○"} {text}
      </span>
      <span className={
        status === "complete" ? "text-green-600" :
        status === "in-progress" ? "text-primary" :
        status === "skipped" ? "text-muted-foreground" :
        "text-muted-foreground"
      }>
        {status === "complete" ? "Complete" :
         status === "in-progress" ? "In progress..." :
         status === "skipped" ? "Skipped" :
         "Pending"}
      </span>
    </div>
  );
}
