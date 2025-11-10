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
  Sparkles, 
  Upload, 
  CheckCircle, 
  Settings,
  Palette,
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
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

// Hooks
import { useBrandProfile, useCreatePost, useUpdatePost } from "@/hooks/useMarketingData";
import { assembleBrandContext } from "@/lib/brandContext";

// AI Functions
import { generatePostContent, type GeneratedPostContent } from "@/lib/gemini";
import { generateImageVariations, generateWithGeminiSimple } from "@/lib/imageGeneration";

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
  
  // Account Type (NEW - First Question)
  const [accountType, setAccountType] = useState<"personal" | "company" | null>(savedDraft?.accountType || null);
  
  // Color Selection (NEW)
  const [colorMode, setColorMode] = useState<"brand" | "custom" | "mood">(savedDraft?.colorMode || "brand");
  const [customColors, setCustomColors] = useState<{ primary: string; accent: string } | null>(
    savedDraft?.customColors || null
  );
  
  // Form data with auto-restore
  const [platform, setPlatform] = useState<"linkedin" | "instagram">(savedDraft?.platform || "linkedin");
  const [imageType, setImageType] = useState<ImageType | null>(savedDraft?.imageType || "announcement");
  const [headline, setHeadline] = useState(savedDraft?.headline || "");
  const [keyPoints, setKeyPoints] = useState(savedDraft?.keyPoints || "");
  const [tone, setTone] = useState<"quirky" | "humble" | "inspirational" | "professional" | "witty">(savedDraft?.tone || "professional");
  const [objective, setObjective] = useState<"awareness" | "leads" | "engagement" | "recruitment">(savedDraft?.objective || "engagement");
  
  // Image generation - Always use Gemini
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "4:5" | "16:9" | "9:16">("1:1");
  const [imageCount, setImageCount] = useState<1 | 2 | 3>(savedDraft?.imageCount || 1);
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Hooks
  const { data: profile } = useBrandProfile();
  const createPostMutation = useCreatePost();
  const updatePostMutation = useUpdatePost();
  
  // Step 2 state - Image generation and selection
  const [generatedImages, setGeneratedImages] = useState<Array<{
    url: string;
    style: "minimal" | "bold" | "elegant";
    prompt: string;
    generationTime: number;
  }>>([]);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [imageGenerationStatus, setImageGenerationStatus] = useState<"idle" | "generating" | "complete" | "error">("idle");
  const [generationProgress, setGenerationProgress] = useState<{ completed: number; total: number }>({ completed: 0, total: 0 });
  const [generatedCaption, setGeneratedCaption] = useState<GeneratedPostContent | null>(null);
  const [currentPostId, setCurrentPostId] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  // Step 3 state - Refinement
  const [refinementCount, setRefinementCount] = useState(0);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null); // Selected or refined image
  const [styleSliderValue, setStyleSliderValue] = useState(50); // 0 = More Professional, 100 = More Casual
  const [refinementColorMode, setRefinementColorMode] = useState<"warmer" | "cooler" | "brand" | "custom">("brand");
  const [refinementCustomColors, setRefinementCustomColors] = useState<{ primary: string; accent: string } | null>(null);
  const [editedCaption, setEditedCaption] = useState<string>("");
  const [isRefining, setIsRefining] = useState(false);

  // Auto-save form data to localStorage (do not persist step to avoid auto-resume)
  useEffect(() => {
    if (open) {
      const draftData = {
        accountType,
        colorMode,
        customColors,
        platform,
        imageType,
        headline,
        keyPoints,
        tone,
        objective,
        aspectRatio,
        imageCount,
        timestamp: Date.now(),
      };
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(draftData));
    }
  }, [open, accountType, colorMode, customColors, platform, imageType, headline, keyPoints, tone, objective, aspectRatio, imageCount]);
  
  // Auto-select aspect ratio based on image type
  useEffect(() => {
    if (imageType) {
      const preset = IMAGE_TYPE_PRESETS[imageType];
      setAspectRatio(preset.aspectRatio);
    }
  }, [imageType]);

  // Reset wizard when modal opens - Always start fresh at Step 1
  useEffect(() => {
    if (open) {
      setStep(1);
      // Reset all state
      setGeneratedImages([]);
      setSelectedImageUrl(null);
      setImageGenerationStatus("idle");
      setGenerationProgress({ completed: 0, total: 0 });
      setGeneratedCaption(null);
      setCurrentPostId(null);
      setGenerationError(null);
      setRefinementCount(0);
      setCurrentImageUrl(null);
      setStyleSliderValue(50);
      setRefinementColorMode("brand");
      setRefinementCustomColors(null);
      setEditedCaption("");
      setIsRefining(false);
      setIsGenerating(false);
    }
  }, [open]);
  
  // Initialize current image and caption when Step 3 is reached
  useEffect(() => {
    if (step === 3 && selectedImageUrl && !currentImageUrl) {
      setCurrentImageUrl(selectedImageUrl);
      if (generatedCaption?.caption) {
        setEditedCaption(generatedCaption.caption);
      }
    }
  }, [step, selectedImageUrl, currentImageUrl, generatedCaption]);
  
  // Auto-generate images and caption when Step 2 is reached
  useEffect(() => {
    if (step === 2 && imageGenerationStatus === "idle" && accountType && platform && headline && imageType && aspectRatio && profile) {
      handleGenerateImagesAndCaption();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]); // Only trigger when step changes to 2
  
  // Function to generate images and caption
  const handleGenerateImagesAndCaption = async () => {
    if (!profile || !accountType || !platform || !headline || !imageType) {
      toast.error("Missing required information");
      return;
    }
    
    setIsGenerating(true);
    setImageGenerationStatus("generating");
    setGenerationProgress({ completed: 0, total: imageCount });
    setGenerationError(null);
    
    try {
      const brandContext = assembleBrandContext(profile);
      
      // Get brand colors
      const brandColors = profile.color_palette ? {
        primary: (profile.color_palette as any)?.primary,
        accent: (profile.color_palette as any)?.secondary,
      } : undefined;
      
      // Create post record in database with "generating" status
      const postData = {
        platform,
        content: headline,
        media_urls: [],
        status: "draft" as const, // Use "draft" instead of "generating" (not in PostStatus type)
        scheduled_time: null,
        published_time: null,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        // New fields from migration (using type assertion)
        ...({
          generated_images: [],
          aspect_ratio: aspectRatio,
          image_count: imageCount,
          refinement_count: 0,
          account_type: accountType,
        } as any),
      };
      
      const createdPost = await createPostMutation.mutateAsync(postData);
      setCurrentPostId(createdPost.id);
      console.log("[Step 2] Post created with generating status:", createdPost.id);
      
      // Generate caption in parallel with images
      const captionPromise = generatePostContent({
        platform,
        contentType: "image",
        headline,
        keyPoints: keyPoints || undefined,
        tone,
        objective,
        brandContext,
      });
      
      // Generate images
      const imagesPromise = generateImageVariations({
        count: imageCount,
        accountType,
        platform,
        imageType,
        headline,
        keyPoints: keyPoints || undefined,
        colorMode,
        customColors: colorMode === "custom" ? customColors || undefined : undefined,
        brandColors: colorMode === "brand" ? brandColors : undefined,
        tone,
        aspectRatio,
      });
      
      // Wait for both to complete
      const [caption, images] = await Promise.all([captionPromise, imagesPromise]);
      
      setGeneratedCaption(caption);
      setGeneratedImages(images);
      setImageGenerationStatus("complete");
      setGenerationProgress({ completed: images.length, total: imageCount });
      
      // Update post with generated images
      const imageUrls = images.map(img => img.url);
      await updatePostMutation.mutateAsync({
        id: createdPost.id,
        updates: {
          generated_images: imageUrls,
          media_urls: imageUrls, // Also update media_urls for compatibility
        },
      });
      
      console.log("[Step 2] Images and caption generated successfully");
    } catch (error) {
      console.error("[Step 2] Generation failed:", error);
      setImageGenerationStatus("error");
      setGenerationError(error instanceof Error ? error.message : "Failed to generate images");
      toast.error(`Generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Handle image selection
  const handleSelectImage = async (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    
    if (currentPostId) {
      try {
        await updatePostMutation.mutateAsync({
          id: currentPostId,
          updates: {
            selected_image_url: imageUrl,
            final_image_url: imageUrl,
            status: "draft",
            media_urls: [imageUrl], // Update media_urls to selected image
          },
        });
        console.log("[Step 2] Image selected and saved:", imageUrl);
      } catch (error) {
        console.error("[Step 2] Failed to save selected image:", error);
        toast.error("Failed to save selection");
      }
    }
  };
  
  // Handle refinement - Apply changes to image
  const handleRefineImage = async () => {
    if (!profile || !accountType || !platform || !headline || !imageType || !currentImageUrl || refinementCount >= 2) {
      return;
    }
    
    setIsRefining(true);
    
    try {
      const brandContext = assembleBrandContext(profile);
      const brandColors = profile.color_palette ? {
        primary: (profile.color_palette as any)?.primary,
        accent: (profile.color_palette as any)?.secondary,
      } : undefined;
      
      // Determine tone based on style slider (0-50 = professional, 50-100 = casual)
      const adjustedTone = styleSliderValue < 50 
        ? "professional" 
        : styleSliderValue < 75 
        ? "humble" 
        : "quirky";
      
      // Determine color mode based on refinement color selection
      let finalColorMode: "brand" | "custom" | "mood" = colorMode;
      let finalCustomColors = customColors;
      
      if (refinementColorMode === "warmer") {
        finalColorMode = "mood"; // Will use warm mood colors (handled by prompt builder)
      } else if (refinementColorMode === "cooler") {
        finalColorMode = "mood"; // Will use cool mood colors (handled by prompt builder)
      } else if (refinementColorMode === "brand") {
        finalColorMode = "brand";
      } else if (refinementColorMode === "custom") {
        finalColorMode = "custom";
        finalCustomColors = refinementCustomColors || customColors || { primary: "#3B82F6", accent: "#8B5CF6" };
      }
      
      // Add color temperature context to keyPoints for warmer/cooler
      let enhancedKeyPoints = keyPoints || "";
      if (refinementColorMode === "warmer") {
        enhancedKeyPoints = (enhancedKeyPoints ? enhancedKeyPoints + "\n" : "") + "Use warm color tones (oranges, reds, yellows)";
      } else if (refinementColorMode === "cooler") {
        enhancedKeyPoints = (enhancedKeyPoints ? enhancedKeyPoints + "\n" : "") + "Use cool color tones (blues, purples, greens)";
      }
      
      // Generate refined image with adjusted parameters
      const refinedResult = await generateWithGeminiSimple({
        accountType,
        platform,
        imageType,
        headline,
        keyPoints: enhancedKeyPoints || undefined,
        colorMode: finalColorMode,
        customColors: finalColorMode === "custom" ? finalCustomColors : undefined,
        brandColors: finalColorMode === "brand" ? brandColors : undefined,
        tone: adjustedTone,
        styleVariation: "minimal", // Use minimal for refinements
        aspectRatio,
      });
      
      // Update current image
      setCurrentImageUrl(refinedResult.url);
      const newRefinementCount = refinementCount + 1;
      setRefinementCount(newRefinementCount);
      
      // Update post in database
      if (currentPostId) {
        await updatePostMutation.mutateAsync({
          id: currentPostId,
          updates: {
            refined_image_url: refinedResult.url,
            refinement_count: newRefinementCount,
            final_image_url: refinedResult.url, // Also update final_image_url
            media_urls: [refinedResult.url], // Update media_urls
          } as any,
        });
      }
      
      toast.success(`Image refined! (${newRefinementCount}/2)`);
    } catch (error) {
      console.error("[Step 3] Refinement failed:", error);
      toast.error(`Refinement failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsRefining(false);
    }
  };
  
  // Handle finalization - Use This Image or Schedule Post
  const handleFinalizePost = async () => {
    if (!currentPostId || !currentImageUrl) {
      toast.error("Missing post or image");
      return;
    }
    
    try {
      // Update post with final image and caption
      const finalCaption = editedCaption || generatedCaption?.caption || headline;
      await updatePostMutation.mutateAsync({
        id: currentPostId,
        updates: {
          final_image_url: currentImageUrl,
          status: "draft",
          media_urls: [currentImageUrl],
          content: finalCaption,
          // Store caption in content field (final_caption field doesn't exist in schema)
          ...({
            final_caption: finalCaption,
          } as any),
        } as any,
      });
      
      toast.success("Post saved successfully!");
      resetAndClose();
    } catch (error) {
      console.error("[Step 3] Finalization failed:", error);
      toast.error(`Failed to save post: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };
  
  // Handle generate more (3 new variations)
  const handleGenerateMore = async () => {
    if (!profile || !accountType || !platform || !headline || !imageType) {
      return;
    }
    
    setIsGenerating(true);
    setImageGenerationStatus("generating");
    setGenerationProgress({ completed: 0, total: 3 });
    setSelectedImageUrl(null);
    setGenerationError(null);
    
    try {
      const brandContext = assembleBrandContext(profile);
      const brandColors = profile.color_palette ? {
        primary: (profile.color_palette as any)?.primary,
        accent: (profile.color_palette as any)?.secondary,
      } : undefined;
      
      // Generate 3 new variations
      const images = await generateImageVariations({
        count: 3,
        accountType,
        platform,
        imageType,
        headline,
        keyPoints: keyPoints || undefined,
        colorMode,
        customColors: colorMode === "custom" ? customColors || undefined : undefined,
        brandColors: colorMode === "brand" ? brandColors : undefined,
        tone,
        aspectRatio,
      });
      
      setGeneratedImages(images);
      setImageGenerationStatus("complete");
      setGenerationProgress({ completed: images.length, total: 3 });
      
      // Update post with new generated images
      if (currentPostId) {
        const imageUrls = images.map(img => img.url);
        await updatePostMutation.mutateAsync({
          id: currentPostId,
          updates: {
            generated_images: imageUrls,
            image_count: 3,
          },
        });
      }
      
      toast.success("Generated 3 new variations!");
    } catch (error) {
      console.error("[Step 2] Generate more failed:", error);
      setImageGenerationStatus("error");
      setGenerationError(error instanceof Error ? error.message : "Failed to generate images");
      toast.error(`Generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsGenerating(false);
    }
  };


  const resetAndClose = () => {
    setStep(1);
    // Reset all state
    setGeneratedImages([]);
    setSelectedImageUrl(null);
    setImageGenerationStatus("idle");
    setGenerationProgress({ completed: 0, total: 0 });
    setGeneratedCaption(null);
    setCurrentPostId(null);
    setGenerationError(null);
    setRefinementCount(0);
    setCurrentImageUrl(null);
    setStyleSliderValue(50);
    setRefinementColorMode("brand");
    setRefinementCustomColors(null);
    setEditedCaption("");
    setIsRefining(false);
    setIsGenerating(false);
    localStorage.removeItem(FORM_STORAGE_KEY); // Clear saved draft
    onOpenChange(false);
  };

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


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
          <DialogDescription>
            Step {step} of 3: {
              step === 1 ? "Quick Setup" :
              step === 2 ? "Choose Your Image" :
              "Refine & Finalize"
            }
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Quick Setup - All inputs on one screen */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Account Type Selection */}
            <div className="space-y-2">
              <Label>Account Type *</Label>
              <div className="grid grid-cols-2 gap-4">
                <Card 
                  className={`cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${
                    accountType === "personal" 
                      ? "ring-2 ring-accent border-2 border-accent bg-accent/10 shadow-md" 
                      : "border-2 border-border hover:border-accent/50"
                  }`}
                  onClick={() => {
                    setAccountType("personal");
                    setValidationErrors(prev => ({ ...prev, accountType: "" }));
                  }}
                >
                  <CardContent className="p-4 text-center space-y-2">
                    <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                      accountType === "personal" ? "bg-accent/20" : "bg-primary/10"
                    }`}>
                      <Settings className={`w-5 h-5 ${accountType === "personal" ? "text-accent" : "text-primary"}`} />
                    </div>
                    <p className="font-semibold text-sm">Personal</p>
                    <p className="text-xs text-muted-foreground">Founder's brand</p>
                  </CardContent>
                </Card>
                <Card 
                  className={`cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${
                    accountType === "company" 
                      ? "ring-2 ring-accent border-2 border-accent bg-accent/10 shadow-md" 
                      : "border-2 border-border hover:border-accent/50"
                  }`}
                  onClick={() => {
                    setAccountType("company");
                    setValidationErrors(prev => ({ ...prev, accountType: "" }));
                  }}
                >
                  <CardContent className="p-4 text-center space-y-2">
                    <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                      accountType === "company" ? "bg-accent/20" : "bg-primary/10"
                    }`}>
                      <FileText className={`w-5 h-5 ${accountType === "company" ? "text-accent" : "text-primary"}`} />
                    </div>
                    <p className="font-semibold text-sm">Company</p>
                    <p className="text-xs text-muted-foreground">Official brand</p>
                  </CardContent>
                </Card>
              </div>
              {validationErrors.accountType && (
                <p className="text-xs text-red-500">{validationErrors.accountType}</p>
              )}
            </div>

            {/* Platform Selection */}
            <div className="space-y-2">
              <Label>Platform *</Label>
              <div className="grid grid-cols-2 gap-4">
                <Card 
                  className={`cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${
                    platform === "linkedin" 
                      ? "ring-2 ring-accent border-2 border-accent bg-accent/10 shadow-md" 
                      : "border-2 border-border hover:border-accent/50"
                  }`}
                  onClick={() => {
                    setPlatform("linkedin");
                    setValidationErrors(prev => ({ ...prev, platform: "" }));
                    // Reset image type if it's not available for LinkedIn
                    if (imageType && !imageTypes.find(it => it.id === imageType && it.platforms.includes("linkedin"))) {
                      setImageType("announcement"); // Default to announcement which is available for both platforms
                    }
                  }}
                >
                  <CardContent className="p-4 text-center space-y-2">
                    <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                      platform === "linkedin" ? "bg-accent/20" : "bg-primary/10"
                    }`}>
                      <FileText className={`w-5 h-5 ${platform === "linkedin" ? "text-accent" : "text-primary"}`} />
                    </div>
                    <p className="font-semibold text-sm">LinkedIn</p>
                  </CardContent>
                </Card>
                <Card 
                  className={`cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${
                    platform === "instagram" 
                      ? "ring-2 ring-accent border-2 border-accent bg-accent/10 shadow-md" 
                      : "border-2 border-border hover:border-accent/50"
                  }`}
                  onClick={() => {
                    setPlatform("instagram");
                    setValidationErrors(prev => ({ ...prev, platform: "" }));
                    // Reset image type if it's not available for Instagram
                    if (imageType && !imageTypes.find(it => it.id === imageType && it.platforms.includes("instagram"))) {
                      setImageType("announcement"); // Default to announcement which is available for both platforms
                    }
                  }}
                >
                  <CardContent className="p-4 text-center space-y-2">
                    <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                      platform === "instagram" ? "bg-accent/20" : "bg-primary/10"
                    }`}>
                      <ImageIcon className={`w-5 h-5 ${platform === "instagram" ? "text-accent" : "text-primary"}`} />
                    </div>
                    <p className="font-semibold text-sm">Instagram</p>
                  </CardContent>
                </Card>
              </div>
              {validationErrors.platform && (
                <p className="text-xs text-red-500">{validationErrors.platform}</p>
              )}
            </div>

            {/* Headline Input */}
            <div className="space-y-2">
              <Label htmlFor="headline">What's your post about? *</Label>
              <Input 
                id="headline" 
                placeholder="e.g., We just hit 10,000 users! 🚀"
                value={headline}
                onChange={(e) => {
                  setHeadline(e.target.value);
                  setValidationErrors(prev => ({ ...prev, headline: "" }));
                }}
                className={validationErrors.headline ? "border-red-500" : ""}
              />
              {validationErrors.headline && (
                <p className="text-xs text-red-500">{validationErrors.headline}</p>
              )}
            </div>

            {/* Key Points Input (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="keypoints">Additional details (optional)</Label>
              <Textarea 
                id="keypoints" 
                placeholder="Thank you to everyone who believed in us"
                rows={3}
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
              />
            </div>

            {/* Aspect Ratio and Image Type in a row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aspectRatio">Aspect Ratio *</Label>
                <Select 
                  value={aspectRatio} 
                  onValueChange={(v: "1:1" | "4:5" | "16:9" | "9:16") => {
                    setAspectRatio(v);
                    setValidationErrors(prev => ({ ...prev, aspectRatio: "" }));
                  }}
                >
                  <SelectTrigger id="aspectRatio" className={validationErrors.aspectRatio ? "border-red-500" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1:1">1:1 (Square)</SelectItem>
                    <SelectItem value="4:5">4:5 (Portrait)</SelectItem>
                    <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                    <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.aspectRatio && (
                  <p className="text-xs text-red-500">{validationErrors.aspectRatio}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageType">Image Type *</Label>
                <Select 
                  value={imageType || ""} 
                  onValueChange={(v: ImageType) => {
                    setImageType(v);
                    setValidationErrors(prev => ({ ...prev, imageType: "" }));
                  }}
                >
                  <SelectTrigger id="imageType" className={validationErrors.imageType ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select image type" />
                  </SelectTrigger>
                  <SelectContent>
                    {imageTypes
                      .filter(type => type.platforms.includes(platform))
                      .map((type) => {
                        const Icon = type.icon;
                        return (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
                {validationErrors.imageType && (
                  <p className="text-xs text-red-500">{validationErrors.imageType}</p>
                )}
              </div>
            </div>

            {/* Advanced Options Accordion */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="advanced">
                <AccordionTrigger>Advanced Options</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  {/* Tone Dropdown */}
                  <div className="space-y-2">
                    <Label htmlFor="tone">Tone</Label>
                    <Select value={tone} onValueChange={(v: typeof tone) => setTone(v)}>
                      <SelectTrigger id="tone">
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

                  {/* Color Mode Selection */}
                  <div className="space-y-2">
                    <Label>Image Colors</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="color-brand"
                          name="colorMode"
                          value="brand"
                          checked={colorMode === "brand"}
                          onChange={(e) => setColorMode("brand")}
                          className="w-4 h-4"
                        />
                        <label htmlFor="color-brand" className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Brand Colors</span>
                            {profile?.color_palette && (
                              <div className="flex gap-1">
                                <div 
                                  className="w-5 h-5 rounded border"
                                  style={{ backgroundColor: (profile.color_palette as any)?.primary || "#3B82F6" }}
                                />
                                <div 
                                  className="w-5 h-5 rounded border"
                                  style={{ backgroundColor: (profile.color_palette as any)?.secondary || "#8B5CF6" }}
                                />
                              </div>
                            )}
                          </div>
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="color-custom"
                          name="colorMode"
                          value="custom"
                          checked={colorMode === "custom"}
                          onChange={(e) => setColorMode("custom")}
                          className="w-4 h-4"
                        />
                        <label htmlFor="color-custom" className="flex-1 cursor-pointer">
                          <span className="font-medium">Custom Colors</span>
                        </label>
                      </div>
                      {colorMode === "custom" && (
                        <div className="ml-6 space-y-2 p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Label className="text-xs w-16">Primary:</Label>
                            <input
                              type="color"
                              value={customColors?.primary || "#3B82F6"}
                              onChange={(e) => setCustomColors({ 
                                primary: e.target.value, 
                                accent: customColors?.accent || "#8B5CF6" 
                              })}
                              className="w-10 h-8 rounded border"
                            />
                            <Input
                              type="text"
                              value={customColors?.primary || "#3B82F6"}
                              onChange={(e) => setCustomColors({ 
                                primary: e.target.value, 
                                accent: customColors?.accent || "#8B5CF6" 
                              })}
                              className="w-20 h-8 text-xs"
                              placeholder="#3B82F6"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs w-16">Accent:</Label>
                            <input
                              type="color"
                              value={customColors?.accent || "#8B5CF6"}
                              onChange={(e) => setCustomColors({ 
                                primary: customColors?.primary || "#3B82F6", 
                                accent: e.target.value 
                              })}
                              className="w-10 h-8 rounded border"
                            />
                            <Input
                              type="text"
                              value={customColors?.accent || "#8B5CF6"}
                              onChange={(e) => setCustomColors({ 
                                primary: customColors?.primary || "#3B82F6", 
                                accent: e.target.value 
                              })}
                              className="w-20 h-8 text-xs"
                              placeholder="#8B5CF6"
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="color-mood"
                          name="colorMode"
                          value="mood"
                          checked={colorMode === "mood"}
                          onChange={(e) => setColorMode("mood")}
                          className="w-4 h-4"
                        />
                        <label htmlFor="color-mood" className="flex-1 cursor-pointer">
                          <span className="font-medium">Match Content Mood</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Generate Button with Image Count */}
            <div className="flex items-center gap-3 pt-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm">Generate:</Label>
                <div className="flex gap-1 border rounded-md">
                  {[1, 2, 3].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setImageCount(count as 1 | 2 | 3)}
                      className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                        imageCount === count
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">image(s)</span>
              </div>
              <Button 
                size="lg" 
                className="flex-1 gap-2"
                onClick={() => {
                  // Validate required fields
                  const errors: Record<string, string> = {};
                  if (!accountType) errors.accountType = "Account type is required";
                  if (!platform) errors.platform = "Platform is required";
                  if (!headline.trim()) errors.headline = "Headline is required";
                  if (!aspectRatio) errors.aspectRatio = "Aspect ratio is required";
                  if (!imageType) errors.imageType = "Image type is required";
                  
                  setValidationErrors(errors);
                  
                  if (Object.keys(errors).length === 0) {
                    setStep(2);
                  } else {
                    toast.error("Please fill in all required fields");
                  }
                }}
                disabled={!accountType || !platform || !headline.trim() || !aspectRatio || !imageType}
              >
                <Sparkles className="w-5 h-5" />
                Generate Image
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Image Selection */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Loading State */}
            {imageGenerationStatus === "generating" && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                <div className="text-center">
                  <p className="font-medium">Generating your images...</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {generationProgress.completed > 0 
                      ? `Generated ${generationProgress.completed} of ${generationProgress.total}...`
                      : "Starting generation..."}
                  </p>
                </div>
              </div>
            )}

            {/* Error State */}
            {imageGenerationStatus === "error" && (
              <div className="p-4 border border-red-500 rounded-lg bg-red-50 dark:bg-red-950 space-y-3">
                <p className="font-medium text-red-700 dark:text-red-400">Generation Failed</p>
                <p className="text-sm text-red-600 dark:text-red-300">{generationError || "Unknown error occurred"}</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleGenerateImagesAndCaption}
                >
                  Retry Generation
                </Button>
              </div>
            )}

            {/* Image Grid */}
            {imageGenerationStatus === "complete" && generatedImages.length > 0 && (
              <>
                <div className={`grid gap-4 ${
                  generatedImages.length === 1 ? "grid-cols-1 max-w-md mx-auto" :
                  generatedImages.length === 2 ? "grid-cols-2" :
                  "grid-cols-3"
                }`}>
                  {generatedImages.map((image, index) => {
                    const styleLabels: Record<"minimal" | "bold" | "elegant", string> = {
                      minimal: "Modern Minimal",
                      bold: "Bold Graphic",
                      elegant: "Elegant Professional",
                    };
                    
                    const isSelected = selectedImageUrl === image.url;
                    
                    return (
                      <Card 
                        key={index}
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          isSelected 
                            ? "ring-2 ring-accent border-2 border-accent shadow-lg" 
                            : "border hover:border-accent/50"
                        }`}
                        onClick={() => handleSelectImage(image.url)}
                      >
                        <CardContent className="p-0">
                          <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
                            <img 
                              src={image.url} 
                              alt={`Generated image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-accent-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="p-4 space-y-2">
                            <p className="text-sm font-medium text-center">{styleLabels[image.style]}</p>
                            <Button 
                              className="w-full"
                              variant={isSelected ? "default" : "outline"}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectImage(image.url);
                              }}
                            >
                              {isSelected ? "Selected" : "Select"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Caption Preview */}
                {generatedCaption && (
                  <div className="space-y-3 pt-4 border-t">
                    <Label>Generated Caption Preview:</Label>
                    <Textarea 
                      value={generatedCaption.caption || ""}
                      readOnly
                      rows={6}
                      className="font-mono text-sm"
                    />
                    {generatedCaption.hashtags && generatedCaption.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {generatedCaption.hashtags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleGenerateMore}
                    disabled={isGenerating}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate More
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => setStep(3)}
                    disabled={!selectedImageUrl}
                  >
                    Continue
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 3: Refinement Screen */}
        {step === 3 && currentImageUrl && (
          <div className="space-y-6">
            {/* Selected Image Display */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-lg">Your Image</Label>
                {refinementCount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    Refinements: {refinementCount}/2
                  </span>
                )}
              </div>
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className={`relative ${aspectRatio === "1:1" ? "aspect-square" : aspectRatio === "4:5" ? "aspect-[4/5]" : aspectRatio === "16:9" ? "aspect-video" : "aspect-[9/16]"} bg-muted`}>
                    <img 
                      src={currentImageUrl} 
                      alt="Selected or refined image"
                      className="w-full h-full object-cover"
                    />
                    {isRefining && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
                          <p className="text-sm text-muted-foreground">Refining image...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Refinement Controls */}
            <div className="space-y-6 pt-4 border-t">
              {/* Style Slider */}
              <div className="space-y-3">
                <Label>Style</Label>
                <div className="space-y-2">
                  <Slider
                    value={[styleSliderValue]}
                    onValueChange={(value) => setStyleSliderValue(value[0])}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>More Professional</span>
                    <span>More Casual</span>
                  </div>
                </div>
              </div>

              {/* Color Buttons */}
              <div className="space-y-3">
                <Label>Colors</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={refinementColorMode === "warmer" ? "default" : "outline"}
                    onClick={() => setRefinementColorMode("warmer")}
                    className="w-full"
                  >
                    Warmer
                  </Button>
                  <Button
                    type="button"
                    variant={refinementColorMode === "cooler" ? "default" : "outline"}
                    onClick={() => setRefinementColorMode("cooler")}
                    className="w-full"
                  >
                    Cooler
                  </Button>
                  <Button
                    type="button"
                    variant={refinementColorMode === "brand" ? "default" : "outline"}
                    onClick={() => setRefinementColorMode("brand")}
                    className="w-full"
                  >
                    Brand
                  </Button>
                  <Button
                    type="button"
                    variant={refinementColorMode === "custom" ? "default" : "outline"}
                    onClick={() => setRefinementColorMode("custom")}
                    className="w-full"
                  >
                    Custom
                  </Button>
                </div>
                {refinementColorMode === "custom" && (
                  <div className="mt-3 space-y-2 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs w-16">Primary:</Label>
                      <input
                        type="color"
                        value={refinementCustomColors?.primary || "#3B82F6"}
                        onChange={(e) => setRefinementCustomColors({ 
                          primary: e.target.value, 
                          accent: refinementCustomColors?.accent || "#8B5CF6" 
                        })}
                        className="w-10 h-8 rounded border"
                      />
                      <Input
                        type="text"
                        value={refinementCustomColors?.primary || "#3B82F6"}
                        onChange={(e) => setRefinementCustomColors({ 
                          primary: e.target.value, 
                          accent: refinementCustomColors?.accent || "#8B5CF6" 
                        })}
                        className="w-20 h-8 text-xs"
                        placeholder="#3B82F6"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs w-16">Accent:</Label>
                      <input
                        type="color"
                        value={refinementCustomColors?.accent || "#8B5CF6"}
                        onChange={(e) => setRefinementCustomColors({ 
                          primary: refinementCustomColors?.primary || "#3B82F6", 
                          accent: e.target.value 
                        })}
                        className="w-10 h-8 rounded border"
                      />
                      <Input
                        type="text"
                        value={refinementCustomColors?.accent || "#8B5CF6"}
                        onChange={(e) => setRefinementCustomColors({ 
                          primary: refinementCustomColors?.primary || "#3B82F6", 
                          accent: e.target.value 
                        })}
                        className="w-20 h-8 text-xs"
                        placeholder="#8B5CF6"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Layout Note */}
              <div className="text-sm text-muted-foreground">
                Layout: Centered composition (works for both platforms)
              </div>
            </div>

            {/* Generated Caption Section */}
            {generatedCaption && (
              <div className="space-y-3 pt-4 border-t">
                <Label>Generated Caption</Label>
                <Textarea 
                  value={editedCaption}
                  onChange={(e) => setEditedCaption(e.target.value)}
                  rows={6}
                  placeholder="Edit your caption..."
                />
                {generatedCaption.hashtags && generatedCaption.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {generatedCaption.hashtags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setStep(2)}
              >
                Back
              </Button>
              <Button 
                variant="outline"
                onClick={handleRefineImage}
                disabled={isRefining || refinementCount >= 2}
                className="flex-1"
              >
                {isRefining ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Refining...
                  </>
                ) : refinementCount >= 2 ? (
                  "Maximum refinements reached"
                ) : (
                  "Apply Changes"
                )}
              </Button>
              <Button 
                className="flex-1"
                onClick={handleFinalizePost}
              >
                Use This Image
              </Button>
              <Button 
                variant="default"
                onClick={handleFinalizePost}
              >
                Schedule Post
              </Button>
            </div>
            
            {refinementCount >= 2 && (
              <p className="text-xs text-muted-foreground text-center">
                Maximum refinements reached
              </p>
            )}
          </div>
        )}

        {/* Old wizard steps (3.5, 4, 4.5, 5) removed - using new 3-step flow */}
      </DialogContent>
    </Dialog>
  );
};

