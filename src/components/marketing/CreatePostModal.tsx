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
import type { PostImageMeta } from "@/hooks/useMarketingData";

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

const FORM_STORAGE_KEY = "eera_create_post_draft";

export const CreatePostModal = ({ open, onOpenChange }: CreatePostModalProps) => {
  // Load saved draft from localStorage
  const loadDraft = () => {
    try {
      const saved = localStorage.getItem(FORM_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const savedDraft = loadDraft();

  // Step management
  const [step, setStep] = useState(savedDraft?.step || 1);
  
  // Form data with auto-restore
  const [platform, setPlatform] = useState<"linkedin" | "instagram">(savedDraft?.platform || "linkedin");
  const [contentType, setContentType] = useState<"text" | "image" | "carousel" | "video">(savedDraft?.contentType || "text");
  const [headline, setHeadline] = useState(savedDraft?.headline || "");
  const [keyPoints, setKeyPoints] = useState(savedDraft?.keyPoints || "");
  const [tone, setTone] = useState<"quirky" | "humble" | "inspirational" | "professional" | "witty">(savedDraft?.tone || "professional");
  const [objective, setObjective] = useState<"awareness" | "leads" | "engagement" | "recruitment">(savedDraft?.objective || "engagement");
  
  // Image generation (Step 3.5)
  const [selectedModel, setSelectedModel] = useState<keyof typeof IMAGE_MODELS>("google/gemini-2.5-flash-image-preview:free");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "9:16">("1:1");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [consistentStyle, setConsistentStyle] = useState(true);
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 1_000_000));
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState({
    brandAnalysis: "pending",
    contentGen: "pending",
    imageGen: "pending",
    optimization: "pending",
  });
  const [generationTime, setGenerationTime] = useState(0);
  
  // Generated content
  const [generatedContent, setGeneratedContent] = useState<GeneratedPostContent | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  // Slides (ordered) for carousel/reel
  const [slides, setSlides] = useState<PostImageMeta[]>([]);
  const [newSlidePrompt, setNewSlidePrompt] = useState("");
  const [slideActionsBusy, setSlideActionsBusy] = useState<number | null>(null);
  const [batchGenerating, setBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ completed: number; total: number }>({ completed: 0, total: 0 });
  const [slideStatuses, setSlideStatuses] = useState<Record<number, "queued" | "generating" | "uploading" | "done" | "error">>({});
  const [reelStoryboard, setReelStoryboard] = useState<{ slides: { imageUrl: string; durationSec: number; overlayText?: string }[] } | null>(null);
  
  // Hooks
  const { data: profile } = useBrandProfile();
  const createPostMutation = useCreatePost();

  // Auto-save form data to localStorage
  useEffect(() => {
    if (open) {
      const draftData = {
        step,
        platform,
        contentType,
        headline,
        keyPoints,
        tone,
        objective,
        timestamp: Date.now(),
      };
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(draftData));
    }
  }, [open, step, platform, contentType, headline, keyPoints, tone, objective]);

  const resetAndClose = () => {
    setStep(1);
    setHeadline("");
    setKeyPoints("");
    setGeneratedContent(null);
    setGeneratedImageUrl(null);
    setSlides([]);
    localStorage.removeItem(FORM_STORAGE_KEY); // Clear saved draft
    onOpenChange(false);
  };

  const moveSlide = (index: number, direction: "up" | "down") => {
    setSlides((prev) => {
      const next = [...prev];
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= next.length) return prev;
      const tmp = next[index];
      next[index] = next[newIndex];
      next[newIndex] = tmp;
      return next;
    });
  };

  const deleteSlide = (index: number) => {
    setSlides((prev) => prev.filter((_, i) => i !== index));
  };

  const regenerateSlide = async (index: number) => {
    try {
      setSlideActionsBusy(index);
      const brandContext = assembleBrandContext(profile!);
      const prompt = slides[index].prompt || `${headline}. ${keyPoints || ""}`;
      const result = await generateImageWithFallback({
        model: selectedModel,
        prompt,
        brandContext,
        aspectRatio,
        negativePrompt: negativePrompt || undefined,
      });
      setSlides((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], url: result.url };
        return next;
      });
    } catch (e) {
      toast.error("Failed to regenerate slide");
    } finally {
      setSlideActionsBusy(null);
    }
  };

  const addSlideFromPrompt = async () => {
    if (!newSlidePrompt.trim()) {
      toast.error("Enter a prompt for the slide");
      return;
    }
    if (slides.length >= 10) {
      toast.error("Maximum 10 slides per carousel");
      return;
    }
    try {
      setSlideActionsBusy(-1);
      const brandContext = assembleBrandContext(profile!);
      const result = await generateImageWithFallback({
        model: selectedModel,
        prompt: newSlidePrompt,
        brandContext,
        aspectRatio,
        negativePrompt: negativePrompt || undefined,
      });
      setSlides((prev) => [...prev, { url: result.url, prompt: newSlidePrompt, aspectRatio, seed: consistentStyle ? seed : undefined }]);
      setNewSlidePrompt("");
    } catch (e) {
      toast.error("Failed to add slide");
    } finally {
      setSlideActionsBusy(null);
    }
  };

  const splitKeyPointsIntoPrompts = (): string[] => {
    const points = (keyPoints || "")
      .split(/\n|•|\-|\u2022/)
      .map(p => p.trim())
      .filter(Boolean);
    if (points.length === 0) {
      // fallback: slice headline into 3 themed prompts
      return [headline, `${headline} – value proposition`, `${headline} – call to action`].filter(Boolean).slice(0, 3);
    }
    return points.slice(0, 10);
  };

  const generateSlidesFromKeyPoints = async () => {
    const remaining = 10 - slides.length;
    if (remaining <= 0) {
      toast.error("You already have 10 slides");
      return;
    }
    const prompts = splitKeyPointsIntoPrompts().slice(0, remaining);
    if (prompts.length === 0) {
      toast.error("No key points to generate from");
      return;
    }
    try {
      setBatchGenerating(true);
      setBatchProgress({ completed: 0, total: prompts.length });
      const brandContext = assembleBrandContext(profile!);
      for (let i = 0; i < prompts.length; i++) {
        const idx = slides.length + i;
        setSlideStatuses(prev => ({ ...prev, [idx]: "queued" }));
      }
      for (let i = 0; i < prompts.length; i++) {
        const prompt = prompts[i];
        const idx = slides.length + i;
        try {
          setSlideStatuses(prev => ({ ...prev, [idx]: "generating" }));
          const result = await generateImageWithFallback({
            model: selectedModel,
            prompt,
            brandContext,
            aspectRatio,
            negativePrompt: negativePrompt || "blurry, lowres, watermark, text artifacts, extra limbs",
          });
          setSlideStatuses(prev => ({ ...prev, [idx]: "uploading" }));
          // upload already handled inside generateImageWithFallback -> result.url is public URL
          setSlides(prev => [...prev, { url: result.url, prompt, aspectRatio, seed: consistentStyle ? seed : undefined }]);
          setSlideStatuses(prev => ({ ...prev, [idx]: "done" }));
        } catch (e) {
          setSlideStatuses(prev => ({ ...prev, [idx]: "error" }));
        } finally {
          setBatchProgress(prev => ({ ...prev, completed: prev.completed + 1 }));
        }
      }
      toast.success("Slides generated");
    } finally {
      setBatchGenerating(false);
    }
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

      // 3. Generate Image(s) (if needed)
      let imageUrl = null;
      if (contentType === "image" || contentType === "carousel") {
        setGenerationStatus(prev => ({ ...prev, imageGen: "in-progress" }));
        
        console.log("[CreatePostModal] Starting AI image generation");
        const imagePrompt = `${headline}. ${keyPoints || ""}`;
        
        const imageResult = await generateImageWithFallback({
          model: selectedModel,
          prompt: imagePrompt,
          brandContext,
          aspectRatio: aspectRatio,
          negativePrompt: negativePrompt || undefined,
        });
        
        imageUrl = imageResult.url;
        setGeneratedImageUrl(imageUrl);
        // If carousel, append to slides; if single image, replace
        if (contentType === "carousel") {
          setSlides(prev => [...prev, { url: imageUrl, prompt: imagePrompt, aspectRatio, seed: consistentStyle ? seed : undefined }]);
        } else {
          setSlides([{ url: imageUrl, prompt: imagePrompt, aspectRatio, seed: consistentStyle ? seed : undefined }]);
        }
        setGenerationStatus(prev => ({ ...prev, imageGen: "complete" }));
        
        console.log("[CreatePostModal] Image generation complete:", {
          url: imageUrl,
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
      slideCount: slides.length,
    });

    try {
      const orderedMedia = slides.length > 0 ? slides.map(s => s.url) : (generatedImageUrl ? [generatedImageUrl] : []);

      const postData = {
        platform,
        content_type: contentType,
        content: generatedContent.caption,
        media_urls: orderedMedia,
        status: "draft" as const,
        scheduled_time: null,
        published_time: null,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        post_meta: {
          images: slides.length > 0 ? slides : (generatedImageUrl ? [{ url: generatedImageUrl, aspectRatio }] : []),
          ...(contentType === "video" && reelStoryboard ? { reel_storyboard: reelStoryboard } : {}),
        },
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
                    className={`cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${
                      selectedModel === model ? "ring-2 ring-primary border-primary bg-primary/5" : "border-border"
                    }`}
                    onClick={() => setSelectedModel(model)}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className={`w-5 h-5 ${selectedModel === model ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <Badge variant="secondary" className="text-xs">{info.badge}</Badge>
                      </div>
                      <p className={`font-semibold text-sm ${selectedModel === model ? "text-foreground" : "text-foreground"}`}>{info.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{info.description}</p>
                      <div className="flex items-center justify-end text-xs">
                        <span className="text-muted-foreground">{info.speed} Generation</span>
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
                    <SelectItem value="1:1">Square (1:1) - Feed</SelectItem>
                    <SelectItem value="4:5">Portrait (4:5) - Feed</SelectItem>
                    <SelectItem value="9:16">Full (9:16) - Reels/Stories</SelectItem>
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
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={consistentStyle} onChange={(e) => setConsistentStyle(e.target.checked)} />
                  Consistent style across batch
                </label>
                <div className="flex items-center gap-2 text-xs">
                  <Label>Seed</Label>
                  <Input className="w-24 h-8 text-xs" type="number" value={seed} onChange={(e) => setSeed(parseInt(e.target.value || "0", 10) || 0)} />
                  <Button size="sm" variant="outline" onClick={() => setSeed(Math.floor(Math.random() * 1_000_000))}>Randomize</Button>
                </div>
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
                Generate Content
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
                      ? `Using ${IMAGE_MODELS[selectedModel].name} • ~5-10s`
                      : "AI Model • ~2-3s"}
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
                
                {/* Generation Info */}
                <div className="text-center text-xs text-muted-foreground">
                  AI-powered content generation with brand awareness
                </div>
              </>
            ) : generatedContent ? (
              <>
                <div className="text-center text-green-600">
                  <CheckCircle className="w-16 h-16 mx-auto" />
                  <p className="font-semibold">Content generated successfully!</p>
                  <p className="text-sm text-muted-foreground">
                    {contentType === "image" || contentType === "carousel" ? `${IMAGE_MODELS[selectedModel].name} • ` : ""}
                    Generated in {generationTime.toFixed(1)}s
                  </p>
                </div>
                <Button onClick={() => setStep(5)} className="w-full">
                  Preview & Edit
                </Button>
              </>
            ) : null}
          </div>
        )}

        {/* Slides Tray for Carousel */}
        {(contentType === "carousel" || contentType === "video") && (
          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Slides ({slides.length}/{contentType === "video" ? 16 : 10})</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Prompt for new slide"
                  value={newSlidePrompt}
                  onChange={(e) => setNewSlidePrompt(e.target.value)}
                  className="w-64"
                />
                <Button size="sm" onClick={addSlideFromPrompt} disabled={slideActionsBusy !== null || slides.length >= (contentType === "video" ? 16 : 10)}>
                  <Sparkles className="w-4 h-4 mr-1" /> Add Slide
                </Button>
                <Button size="sm" variant="outline" onClick={generateSlidesFromKeyPoints} disabled={batchGenerating || slides.length >= (contentType === "video" ? 16 : 10)}>
                  Generate from Key Points
                </Button>
                {contentType === "video" && (
                  <Button size="sm" variant="secondary" onClick={() => {
                    const storyboard = {
                      slides: (slides.length ? slides : [{ url: generatedImageUrl || "", prompt: headline, aspectRatio }]).filter(s => s.url).map(s => ({ imageUrl: s.url, durationSec: 2.5, overlayText: headline }))
                    };
                    setReelStoryboard(storyboard);
                    toast.success("Reel storyboard generated");
                  }}>
                    Generate Reel Storyboard
                  </Button>
                )}
              </div>
            </div>
            {batchGenerating && (
              <div className="text-xs text-muted-foreground">Generating {batchProgress.completed}/{batchProgress.total} slides…</div>
            )}
            {slides.length === 0 ? (
              <div className="text-sm text-muted-foreground">No slides yet. Generate an image or add from prompt.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {slides.map((s, idx) => (
                  <Card key={idx} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="aspect-square bg-muted relative">
                        <img src={s.url} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                        {slideStatuses[idx] && slideStatuses[idx] !== "done" && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-xs text-white">
                            {slideStatuses[idx]}
                          </div>
                        )}
                        <div className="absolute top-2 left-2 text-xs bg-background/80 px-2 py-0.5 rounded">
                          #{idx + 1}
                        </div>
                      </div>
                      <div className="p-2 flex items-center justify-between gap-2">
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => moveSlide(idx, "up")} disabled={idx === 0 || slideActionsBusy !== null}>
                            ↑
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => moveSlide(idx, "down")} disabled={idx === slides.length - 1 || slideActionsBusy !== null}>
                            ↓
                          </Button>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => regenerateSlide(idx)} disabled={slideActionsBusy !== null}>
                            Regenerate
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteSlide(idx)} disabled={slideActionsBusy !== null}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {contentType === "video" && reelStoryboard && (
              <div className="p-3 border rounded-lg">
                <p className="text-sm font-medium mb-2">Storyboard Preview</p>
                <div className="flex gap-2 overflow-x-auto">
                  {reelStoryboard.slides.map((sl, i) => (
                    <div key={i} className="w-24 flex-shrink-0">
                      <div className="aspect-[9/16] bg-muted rounded overflow-hidden">
                        <img src={sl.imageUrl} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-1 text-center">{sl.durationSec}s</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
