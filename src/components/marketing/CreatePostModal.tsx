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
  Zap,
  BarChart3,
  Package,
  MessageSquareQuote,
  Megaphone,
  BookOpen,
  Award,
  GitCompare,
  Calendar
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

// Image Type System
import type { ImageType } from "@/types/imageTypes";
import { IMAGE_TYPE_PRESETS } from "@/lib/imageTypePresets";

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

  // Step management (always start at Step 1 to avoid unintended resume)
  const [step, setStep] = useState(1);
  
  // Form data with auto-restore
  const [platform, setPlatform] = useState<"linkedin" | "instagram">(savedDraft?.platform || "linkedin");
  const [contentType, setContentType] = useState<"text" | "image" | "carousel" | "video">(savedDraft?.contentType || "text");
  const [imageType, setImageType] = useState<ImageType | null>(savedDraft?.imageType || null);
  const [headline, setHeadline] = useState(savedDraft?.headline || "");
  const [keyPoints, setKeyPoints] = useState(savedDraft?.keyPoints || "");
  const [tone, setTone] = useState<"quirky" | "humble" | "inspirational" | "professional" | "witty">(savedDraft?.tone || "professional");
  const [objective, setObjective] = useState<"awareness" | "leads" | "engagement" | "recruitment">(savedDraft?.objective || "engagement");
  
  // Image generation (Step 3.5)
  const [selectedModel, setSelectedModel] = useState<keyof typeof IMAGE_MODELS>("google/gemini-2.5-flash-image-preview");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "4:5" | "16:9" | "9:16">("1:1");
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
  const [slidePoints, setSlidePoints] = useState("");
  const [slideActionsBusy, setSlideActionsBusy] = useState<number | null>(null);
  const [batchGenerating, setBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ completed: number; total: number }>({ completed: 0, total: 0 });
  const [slideStatuses, setSlideStatuses] = useState<Record<number, "queued" | "generating" | "uploading" | "done" | "error">>({});
  const [reelStoryboard, setReelStoryboard] = useState<{ slides: { imageUrl: string; durationSec: number; overlayText?: string }[] } | null>(null);
  
  // Hooks
  const { data: profile } = useBrandProfile();
  const createPostMutation = useCreatePost();

  // Auto-save form data to localStorage (do not persist step to avoid auto-resume)
  useEffect(() => {
    if (open) {
      const draftData = {
        platform,
        contentType,
        imageType,
        headline,
        keyPoints,
        tone,
        objective,
        timestamp: Date.now(),
      };
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(draftData));
    }
  }, [open, platform, contentType, imageType, headline, keyPoints, tone, objective]);

  // Auto-select model, aspect ratio, and negative prompt based on image type
  useEffect(() => {
    if (imageType && (contentType === "image" || contentType === "carousel")) {
      const preset = IMAGE_TYPE_PRESETS[imageType];
      // Map preset model to OpenRouter model keys
      const modelMap: Record<string, keyof typeof IMAGE_MODELS> = {
        gemini: "google/gemini-2.5-flash-image-preview",
        dalle3: "google/gemini-2.5-flash-image-preview", // Using Gemini for now
        sdxl: "google/gemini-2.5-flash-image-preview", // Using Gemini for now
        leonardo: "google/gemini-2.5-flash-image-preview", // Using Gemini for now
      };
      setSelectedModel(modelMap[preset.suggestedModel] || "google/gemini-2.5-flash-image-preview");
      setAspectRatio(preset.aspectRatio);
      setNegativePrompt(preset.negativePrompt);
    }
  }, [imageType, contentType]);

  // Reset wizard when modal opens
  useEffect(() => {
    if (open) {
      setStep(1);
      setGeneratedContent(null);
      setGeneratedImageUrl(null);
      setSlides([]);
      setGenerationStatus({ brandAnalysis: "pending", contentGen: "pending", imageGen: "pending", optimization: "pending" });
    }
  }, [open]);

  // When platform or content type changes, clear generated state and keep user in editing steps only
  useEffect(() => {
    setGeneratedContent(null);
    setGeneratedImageUrl(null);
    setSlides([]);
    if (step > 3) {
      setStep(3);
    }
  }, [platform, contentType]);

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
            imageType: imageType || undefined,
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
        imageType: imageType || undefined,
      });
      setSlides((prev) => [...prev, { url: result.url, prompt: newSlidePrompt, aspectRatio, seed: consistentStyle ? seed : undefined, imageType }]);
      setNewSlidePrompt("");
    } catch (e) {
      toast.error("Failed to add slide");
    } finally {
      setSlideActionsBusy(null);
    }
  };

  const splitKeyPointsIntoPrompts = (): string[] => {
    const source = (contentType === "carousel" && slidePoints) ? slidePoints : keyPoints;
    const points = (source || "")
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
            imageType: imageType || undefined,
          });
          setSlideStatuses(prev => ({ ...prev, [idx]: "uploading" }));
          // upload already handled inside generateImageWithFallback -> result.url is public URL
          setSlides(prev => [...prev, { url: result.url, prompt, aspectRatio, seed: consistentStyle ? seed : undefined, imageType }]);
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

  const imageTypes = [
    { id: "infographic" as const, icon: BarChart3, label: "Infographic", desc: "Stats, process flows, data viz", platforms: ["linkedin", "instagram"] },
    { id: "product" as const, icon: Package, label: "Product Shot", desc: "Hero images, features, mockups", platforms: ["linkedin", "instagram"] },
    { id: "quote" as const, icon: MessageSquareQuote, label: "Quote Card", desc: "Testimonials, insights, wisdom", platforms: ["linkedin", "instagram"] },
    { id: "announcement" as const, icon: Megaphone, label: "Announcement", desc: "Launches, milestones, news", platforms: ["linkedin", "instagram"] },
    { id: "educational" as const, icon: BookOpen, label: "Educational", desc: "How-to guides, tips, tutorials", platforms: ["linkedin"] },
    { id: "social_proof" as const, icon: Award, label: "Social Proof", desc: "Reviews, case studies, trust", platforms: ["linkedin", "instagram"] },
    { id: "comparison" as const, icon: GitCompare, label: "Comparison", desc: "Before/after, us vs them", platforms: ["linkedin"] },
    { id: "event" as const, icon: Calendar, label: "Event/Webinar", desc: "Registrations, live sessions", platforms: ["linkedin", "instagram"] },
  ];

  const placeholders: Record<ImageType, { headline: string; keyPoints: string }> = {
    infographic: {
      headline: "e.g., How Our Process Works in 3 Steps",
      keyPoints: "Step 1: Discovery\nStep 2: Implementation\nStep 3: Results",
    },
    product: {
      headline: "e.g., Introducing Our New AI-Powered Dashboard",
      keyPoints: "• Real-time analytics\n• Beautiful visualizations\n• Easy to use",
    },
    quote: {
      headline: "e.g., 'This tool saved us 10 hours per week'",
      keyPoints: "- Sarah Chen, CEO at TechCorp",
    },
    announcement: {
      headline: "e.g., We Just Hit 10,000 Users!",
      keyPoints: "Thank you to our amazing community for making this possible",
    },
    educational: {
      headline: "e.g., 5 Ways to Improve Your Marketing ROI",
      keyPoints: "1. Focus on quality over quantity\n2. Track the right metrics\n3. Test and iterate",
    },
    social_proof: {
      headline: "e.g., Customer Success Story: 300% Growth",
      keyPoints: "Company: TechCorp\nResult: 300% increase in leads\nTimeframe: 3 months",
    },
    comparison: {
      headline: "e.g., Before vs After: Our New Approach",
      keyPoints: "Before: Manual process, slow\nAfter: Automated, 10x faster",
    },
    event: {
      headline: "e.g., Free Webinar: AI for Founders",
      keyPoints: "Date: March 15, 2025\nTime: 2:00 PM EST\nSpeaker: Jane Doe",
    },
  };

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
        
        if (contentType === "carousel") {
          // Batch generate from slide points
          await generateSlidesFromKeyPoints();
          console.log("[CreatePostModal] Carousel batch generation complete", { count: slides.length });
        } else {
          console.log("[CreatePostModal] Starting AI image generation");
          const imagePrompt = `${headline}. ${keyPoints || ""}`;
          const imageResult = await generateImageWithFallback({
            model: selectedModel,
            prompt: imagePrompt,
            brandContext,
            aspectRatio: aspectRatio,
            negativePrompt: negativePrompt || undefined,
            imageType: imageType || undefined,
          });
          imageUrl = imageResult.url;
          setGeneratedImageUrl(imageUrl);
          setSlides([{ url: imageUrl, prompt: imagePrompt, aspectRatio, seed: consistentStyle ? seed : undefined, imageType }]);
          console.log("[CreatePostModal] Image generation complete", { url: imageUrl });
        }
        setGenerationStatus(prev => ({ ...prev, imageGen: "complete" }));
        
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
      const message = error instanceof Error ? error.message : "Unknown error";
      if (message.includes("402")) {
        toast.error("Image generation failed: OpenRouter credits required. Please add credits and retry.");
      } else if (message.includes("No endpoints found") || message.includes(":free")) {
        toast.error("Selected model is unavailable. Switch to 'Gemini 2.5 Image Preview' (non-free) or another model.");
      } else {
        toast.error(`Generation failed: ${message}`);
      }
      setStep(3); // Go back to input
    } finally {
      setIsGenerating(false);
    }
  };

  // Quick edit handlers
  const handleQuickEdit = async (editType: "change_background" | "adjust_colors" | "add_text_space") => {
    if (!generatedImageUrl || !profile || !imageType) {
      toast.error("No image to edit. Please generate an image first.");
      return;
    }

    try {
      setIsGenerating(true);
      const brandContext = assembleBrandContext(profile);
      
      // Build edit-specific prompt modification
      let editInstruction = "";
      const basePrompt = `${headline}. ${keyPoints || ""}`;
      
      switch (editType) {
        case "change_background":
          editInstruction = "Regenerate this image with a completely different background style - try a gradient, abstract pattern, or contrasting color background while keeping the main subject unchanged.";
          break;
        case "adjust_colors":
          editInstruction = "Regenerate this image with adjusted color scheme - make it more vibrant and aligned with brand colors, adjusting saturation and contrast while maintaining the same composition.";
          break;
        case "add_text_space":
          editInstruction = "Regenerate this image with more empty space reserved for text overlay - ensure the main visual elements are pushed to one side leaving a clear text zone (typically 40% of the image area should be clean for text).";
          break;
      }

      const modifiedPrompt = `${basePrompt}. ${editInstruction}`;
      
      toast.info(`Regenerating image with ${editType.replace("_", " ")}...`);
      
      const imageResult = await generateImageWithFallback({
        model: selectedModel,
        prompt: modifiedPrompt,
        brandContext,
        aspectRatio: aspectRatio,
        negativePrompt: negativePrompt || undefined,
        imageType: imageType || undefined,
      });
      
      setGeneratedImageUrl(imageResult.url);
      setSlides([{ url: imageResult.url, prompt: modifiedPrompt, aspectRatio, seed: consistentStyle ? seed : undefined, imageType }]);
      toast.success("Image regenerated successfully!");
      
    } catch (error) {
      console.error("Quick edit failed:", error);
      toast.error(`Failed to regenerate image: ${error instanceof Error ? error.message : "Unknown error"}`);
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
          images: slides.length > 0 ? slides.map(s => ({ ...s, imageType })) : (generatedImageUrl ? [{ url: generatedImageUrl, aspectRatio, imageType }] : []),
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
              <Button className="flex-1" onClick={() => {
                // If image or carousel, go to image type selection. Otherwise go to content input.
                if (contentType === "image" || contentType === "carousel") {
                  setStep(2.5);
                } else {
                  setStep(3);
                }
              }}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 2.5: Image Type Selection (only for image/carousel) */}
        {step === 2.5 && (contentType === "image" || contentType === "carousel") && (
          <div className="space-y-4">
            <div>
              <Label>Choose Image Type</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Select the type of image you want to create. This helps AI generate the perfect design.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {imageTypes
                .filter(type => type.platforms.includes(platform))
                .map((type) => {
                  const Icon = type.icon;
                  const preset = imageType ? IMAGE_TYPE_PRESETS[imageType] : null;
                  return (
                    <Card
                      key={type.id}
                      className={`cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${
                        imageType === type.id ? "ring-2 ring-primary border-primary bg-primary/5" : "border-border"
                      }`}
                      onClick={() => setImageType(type.id)}
                    >
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-5 h-5 ${imageType === type.id ? "text-primary" : "text-muted-foreground"}`} />
                          </div>
                          {preset && imageType === type.id && (
                            <Badge variant="secondary" className="text-xs">✨ Recommended</Badge>
                          )}
                        </div>
                        <p className={`font-semibold text-sm ${imageType === type.id ? "text-foreground" : "text-foreground"}`}>{type.label}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{type.desc}</p>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button 
                className="flex-1" 
                onClick={() => setStep(3)}
                disabled={!imageType}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Content Input / Builder */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="headline">Headline / Hook *</Label>
              <Input 
                id="headline" 
                placeholder={imageType && placeholders[imageType] ? placeholders[imageType].headline : "What's your main message?"}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
              />
            </div>

            {contentType === "carousel" || contentType === "video" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="slidepoints">{contentType === "video" ? "Beats (one per line)" : "Slide Points (one per line)"}</Label>
                  <Textarea 
                    id="slidepoints" 
                    placeholder={contentType === "video" ? "Beat 1\nBeat 2\nBeat 3" : "Slide 1\nSlide 2\nSlide 3"}
                    rows={6}
                    value={slidePoints}
                    onChange={(e) => setSlidePoints(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">No AI yet. We’ll create one visual per line after you pick a model.</p>
                </div>

                {/* Placeholder tray from points */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{contentType === "video" ? "Storyboard Preview" : "Slides Preview"}</p>
                  {splitKeyPointsIntoPrompts().length === 0 ? (
                    <div className="text-xs text-muted-foreground">Add points above to preview placeholders.</div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {splitKeyPointsIntoPrompts().map((p, i) => (
                        <div key={i} className="aspect-square rounded-md border bg-muted/40 p-2 text-[11px] flex items-center justify-center text-center">
                          {i + 1}. {p}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="keypoints">Key Points (optional)</Label>
                <Textarea 
                  id="keypoints" 
                  placeholder={imageType && placeholders[imageType] ? placeholders[imageType].keyPoints : "• Point 1\n• Point 2\n• Point 3"}
                  rows={4}
                  value={keyPoints}
                  onChange={(e) => setKeyPoints(e.target.value)}
                />
              </div>
            )}

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
              <Button variant="outline" className="flex-1" onClick={() => {
                // If image/carousel, go back to image type selection. Otherwise go to content type.
                if (contentType === "image" || contentType === "carousel") {
                  setStep(2.5);
                } else {
                  setStep(2);
                }
              }}>
                Back
              </Button>
              <Button 
                className="flex-1 gap-2" 
                onClick={() => {
                  if (contentType === "image" || contentType === "carousel" || contentType === "video") {
                    setStep(3.5); // Go to model selection
                  } else {
                    setStep(4); // Text goes directly to generation
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
                const preset = imageType ? IMAGE_TYPE_PRESETS[imageType] : null;
                const isRecommended = preset && imageType && IMAGE_TYPE_PRESETS[imageType].suggestedModel === "gemini"; // All current models map to Gemini
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
                        <Badge variant={isRecommended && selectedModel === model ? "default" : "secondary"} className="text-xs">
                          {isRecommended ? "✨ Recommended" : info.badge}
                        </Badge>
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

            {/* Navigation controls */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep((contentType === "image" || contentType === "carousel" || contentType === "video") ? 3.5 : 3)}
                disabled={isGenerating}
              >
                Back
              </Button>
            </div>
          </div>
        )}

        {/* Slides Tray for Carousel - visible only after generation flow begins */}
        {step >= 4 && (contentType === "carousel" || contentType === "video") && (
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
        {step === 5 && (
          <div className="space-y-4">
            {generatedContent ? (
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
                      <div className="space-y-2">
                        <div className="aspect-video rounded-lg overflow-hidden">
                          <img 
                            src={generatedImageUrl} 
                            alt="Generated content" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {/* Quick Edit Options */}
                        <div className="space-y-2">
                          <Label>Quick Edits</Label>
                          <div className="flex gap-2 flex-wrap">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleQuickEdit("change_background")}
                              disabled={isGenerating || !generatedImageUrl || !imageType}
                            >
                              Change Background
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleQuickEdit("adjust_colors")}
                              disabled={isGenerating || !generatedImageUrl || !imageType}
                            >
                              Adjust Colors
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleQuickEdit("add_text_space")}
                              disabled={isGenerating || !generatedImageUrl || !imageType}
                            >
                              Add Text Space
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={async () => {
                                await handleGeneration();
                              }}
                              disabled={isGenerating || !imageType}
                            >
                              Regenerate
                            </Button>
                          </div>
                        </div>
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
            ) : (
              <div className="text-sm text-muted-foreground">No generated content yet. You can go back and generate, or add slides and save as draft.</div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(4)}>
                Back
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setStep(3)}>
                Edit
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleSaveDraft}
                disabled={createPostMutation.isPending || !generatedContent}
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
