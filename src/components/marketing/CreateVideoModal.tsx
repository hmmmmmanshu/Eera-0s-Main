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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Play, X } from "lucide-react";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Hooks
import { useBrandProfile, useCreatePost, useUpdatePost } from "@/hooks/useMarketingData";
import { assembleBrandContext } from "@/lib/brandContext";

// AI Functions
import { generatePostContent, type GeneratedPostContent } from "@/lib/gemini";
import { generateVideoWithVEO3, type GeneratedVideo } from "@/lib/videoGeneration";
import { getSmartDefaults, type ProfessionalSettings } from "@/lib/professionalDefaults";
import type { ProfessionalKeywordSettings } from "@/lib/professionalKeywords";
import type { ImageType } from "@/types/imageTypes";

interface CreateVideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateVideoModal = ({ open, onOpenChange }: CreateVideoModalProps) => {
  // Step management
  const [step, setStep] = useState(1);
  
  // Form data
  const [accountType, setAccountType] = useState<"personal" | "company" | null>(null);
  const [platform, setPlatform] = useState<"linkedin" | "instagram">("linkedin");
  const [headline, setHeadline] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [tone, setTone] = useState<"quirky" | "humble" | "inspirational" | "professional" | "witty">("professional");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "1:1">("16:9");
  const [imageType, setImageType] = useState<ImageType | null>(null);
  
  // Color Selection
  const [colorMode, setColorMode] = useState<"brand" | "custom" | "mood">("brand");
  const [customColors, setCustomColors] = useState<{ primary: string; accent: string } | null>(null);
  
  // Video generation state
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoGenerationError, setVideoGenerationError] = useState<string | null>(null);
  const [generatedCaption, setGeneratedCaption] = useState<GeneratedPostContent | null>(null);
  const [currentPostId, setCurrentPostId] = useState<string | null>(null);
  
  // Professional Enhancement state
  const [professionalSettings, setProfessionalSettings] = useState<ProfessionalSettings | null>(null);
  
  // Hooks
  const { data: profile } = useBrandProfile();
  const createPostMutation = useCreatePost();
  const updatePostMutation = useUpdatePost();
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Reset when modal opens/closes
  useEffect(() => {
    if (open) {
      setStep(1);
      setAccountType(null);
      setPlatform("linkedin");
      setHeadline("");
      setKeyPoints("");
      setTone("professional");
      setAspectRatio("16:9");
      setImageType(null);
      setColorMode("brand");
      setCustomColors(null);
      setGeneratedVideo(null);
      setIsGeneratingVideo(false);
      setVideoGenerationError(null);
      setGeneratedCaption(null);
      setCurrentPostId(null);
      setProfessionalSettings(null);
      setValidationErrors({});
    }
  }, [open]);
  
  // Validate Step 1
  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!accountType) errors.accountType = "Please select account type";
    if (!headline.trim()) errors.headline = "Headline is required";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle video generation
  const handleGenerateVideo = async () => {
    if (!validateStep1()) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (!profile || !accountType || !platform || !headline) {
      toast.error("Missing required information");
      return;
    }
    
    setIsGeneratingVideo(true);
    setVideoGenerationError(null);
    setGeneratedVideo(null);
    setStep(2);
    
    try {
      const brandContext = assembleBrandContext(profile);
      const brandColors = profile.color_palette ? {
        primary: (profile.color_palette as any)?.primary,
        accent: (profile.color_palette as any)?.secondary,
      } : undefined;
      
      // Get professional settings (smart defaults)
      let effectiveProfessionalSettings: ProfessionalKeywordSettings | undefined = undefined;
      
      if (professionalSettings) {
        // Convert ProfessionalSettings to ProfessionalKeywordSettings
        effectiveProfessionalSettings = {
          photographyStyle: professionalSettings.photographyStyle.length > 0 
            ? professionalSettings.photographyStyle[0] 
            : undefined,
          designSophistication: professionalSettings.designSophistication,
          platformStandard: professionalSettings.platformStandard,
          industryAesthetic: professionalSettings.industryAesthetic,
          colorGrading: professionalSettings.colorGrading,
        };
      } else {
        // Use smart defaults
        const smartDefaults = getSmartDefaults({
          accountType,
          platform,
          imageType: imageType || undefined,
          tone,
          brandProfile: profile ? {
            industry: profile.industry || undefined,
            style: profile.design_philosophy || undefined,
            mood: profile.tone_personality || undefined,
          } : undefined,
        });
        effectiveProfessionalSettings = {
          photographyStyle: smartDefaults.photographyStyle.length > 0 
            ? smartDefaults.photographyStyle[0] 
            : undefined,
          designSophistication: smartDefaults.designSophistication,
          platformStandard: smartDefaults.platformStandard,
          industryAesthetic: smartDefaults.industryAesthetic,
          colorGrading: smartDefaults.colorGrading,
        };
      }
      
      // Create post record in database
      const normalizedPlatform = platform.toLowerCase() as "linkedin" | "instagram";
      const createdPost = await createPostMutation.mutateAsync({
        platform: normalizedPlatform,
        content: headline, // Temporary content
        media_urls: [], // Empty array initially, will be updated with video URL
        status: "generating",
        account_type: accountType,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
      });
      
      setCurrentPostId(createdPost.id);
      
      // Generate caption in parallel
      const captionPromise = generatePostContent({
        headline,
        keyPoints: keyPoints || undefined,
        platform,
        accountType,
        tone,
        objective: "engagement",
        brandContext,
      });
      
      // Generate video with VEO3
      const videoPromise = generateVideoWithVEO3({
        accountType,
        platform,
        headline,
        keyPoints: keyPoints || undefined,
        colorMode,
        customColors: colorMode === "custom" ? customColors || undefined : undefined,
        brandColors: colorMode === "brand" ? brandColors : undefined,
        tone,
        aspectRatio,
        professionalSettings: effectiveProfessionalSettings,
        imageType: imageType || null,
        brandProfile: profile ? {
          industry: profile.industry || undefined,
          style: profile.design_philosophy || undefined,
          mood: profile.tone_personality || undefined,
        } : undefined,
      });
      
      // Wait for both to complete
      const [caption, videoResult] = await Promise.all([captionPromise, videoPromise]);
      
      setGeneratedCaption(caption);
      setGeneratedVideo(videoResult);
      
      // Update post with video and caption
      await updatePostMutation.mutateAsync({
        id: createdPost.id,
        updates: {
          media_urls: [videoResult.url], // Store video URL in media_urls array
          content: caption.caption || headline,
          status: "draft",
        } as any,
      });
      
      toast.success("Video generated successfully!");
      setStep(3);
    } catch (error) {
      console.error("[Video Generation] Failed:", error);
      setVideoGenerationError(error instanceof Error ? error.message : "Failed to generate video");
      toast.error(`Video generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsGeneratingVideo(false);
    }
  };
  
  // Handle save
  const handleSaveVideo = async () => {
    if (!currentPostId || !generatedVideo) {
      toast.error("Video not generated yet");
      return;
    }
    
    try {
      const normalizedPlatform = platform.toLowerCase() as "linkedin" | "instagram";
      await updatePostMutation.mutateAsync({
        id: currentPostId,
        updates: {
          platform: normalizedPlatform,
          media_urls: [generatedVideo.url], // Store video URL in media_urls array
          content: generatedCaption?.caption || headline,
          status: "draft",
        } as any,
      });
      
      toast.success("Video post saved successfully!");
      onOpenChange(false);
    } catch (error) {
      console.error("[Video Save] Failed:", error);
      toast.error(`Failed to save: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Generate Video
          </DialogTitle>
          <DialogDescription>
            Step {step} of 3: {
              step === 1 ? "Video Details" :
              step === 2 ? "Generating Video" :
              "Review & Save"
            }
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Video Details */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Account Type */}
            <div className="space-y-2">
              <Label>Account Type *</Label>
              <div className="grid grid-cols-2 gap-2">
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-sm ${
                    accountType === "personal" 
                      ? "ring-1 ring-accent border-accent bg-accent/5" 
                      : "border hover:border-accent/30"
                  }`}
                  onClick={() => {
                    setAccountType("personal");
                    setValidationErrors(prev => ({ ...prev, accountType: "" }));
                  }}
                >
                  <CardContent className="p-3 text-center">
                    <p className="font-medium text-sm">Personal</p>
                  </CardContent>
                </Card>
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-sm ${
                    accountType === "company" 
                      ? "ring-1 ring-accent border-accent bg-accent/5" 
                      : "border hover:border-accent/30"
                  }`}
                  onClick={() => {
                    setAccountType("company");
                    setValidationErrors(prev => ({ ...prev, accountType: "" }));
                  }}
                >
                  <CardContent className="p-3 text-center">
                    <p className="font-medium text-sm">Company</p>
                  </CardContent>
                </Card>
              </div>
              {validationErrors.accountType && (
                <p className="text-xs text-red-500">{validationErrors.accountType}</p>
              )}
            </div>

            {/* Platform */}
            <div className="space-y-2">
              <Label>Platform *</Label>
              <div className="grid grid-cols-2 gap-2">
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-sm ${
                    platform === "linkedin" 
                      ? "ring-1 ring-accent border-accent bg-accent/5" 
                      : "border hover:border-accent/30"
                  }`}
                  onClick={() => setPlatform("linkedin")}
                >
                  <CardContent className="p-3 text-center">
                    <p className="font-medium text-sm">LinkedIn</p>
                  </CardContent>
                </Card>
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-sm ${
                    platform === "instagram" 
                      ? "ring-1 ring-accent border-accent bg-accent/5" 
                      : "border hover:border-accent/30"
                  }`}
                  onClick={() => setPlatform("instagram")}
                >
                  <CardContent className="p-3 text-center">
                    <p className="font-medium text-sm">Instagram</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <Label htmlFor="video-headline">Headline/Description *</Label>
              <Textarea
                id="video-headline"
                value={headline}
                onChange={(e) => {
                  setHeadline(e.target.value);
                  setValidationErrors(prev => ({ ...prev, headline: "" }));
                }}
                placeholder="Describe what you want in the video..."
                rows={3}
              />
              {validationErrors.headline && (
                <p className="text-xs text-red-500">{validationErrors.headline}</p>
              )}
            </div>

            {/* Key Points */}
            <div className="space-y-2">
              <Label htmlFor="video-keypoints">Additional Details (Optional)</Label>
              <Textarea
                id="video-keypoints"
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
                placeholder="Add more context about the video..."
                rows={3}
              />
            </div>

            {/* Post Type */}
            <div className="space-y-2">
              <Label>Post Type (Optional)</Label>
              <Select
                value={imageType || "none"}
                onValueChange={(value) => setImageType(value === "none" ? null : value as ImageType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select post type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">General Video</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="product">Product Launch</SelectItem>
                  <SelectItem value="educational">Educational/How-to</SelectItem>
                  <SelectItem value="social_proof">Social Proof/Testimonial</SelectItem>
                  <SelectItem value="event">Event/Webinar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <Label>Video Aspect Ratio</Label>
              <RadioGroup value={aspectRatio} onValueChange={(value) => setAspectRatio(value as "16:9" | "9:16" | "1:1")}>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="16:9" id="aspect-16:9" />
                    <Label htmlFor="aspect-16:9" className="cursor-pointer">16:9 (Landscape)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="9:16" id="aspect-9:16" />
                    <Label htmlFor="aspect-9:16" className="cursor-pointer">9:16 (Vertical)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1:1" id="aspect-1:1" />
                    <Label htmlFor="aspect-1:1" className="cursor-pointer">1:1 (Square)</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Tone */}
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={(value) => setTone(value as typeof tone)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="inspirational">Inspirational</SelectItem>
                  <SelectItem value="humble">Humble</SelectItem>
                  <SelectItem value="witty">Witty</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={handleGenerateVideo}
                disabled={isGeneratingVideo}
              >
                <Video className="w-4 h-4" />
                Generate Video
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Generating */}
        {step === 2 && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            <div className="text-center">
              <p className="font-medium text-lg">Generating your video...</p>
              <p className="text-sm text-muted-foreground mt-2">
                This may take 30-60 seconds. Please wait...
              </p>
            </div>
            {videoGenerationError && (
              <div className="p-4 border border-red-500 rounded-lg bg-red-50 dark:bg-red-950 w-full max-w-md">
                <p className="font-medium text-red-700 dark:text-red-400">Generation Failed</p>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">{videoGenerationError}</p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Review & Save */}
        {step === 3 && generatedVideo && (
          <div className="space-y-6">
            {/* Video Preview */}
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Generated Video</Label>
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-video bg-muted">
                    <video
                      src={generatedVideo.url}
                      controls
                      className="w-full h-full object-contain"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Generated in {(generatedVideo.generationTime / 1000).toFixed(1)}s
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Caption */}
            {generatedCaption && (
              <div className="space-y-3 pt-4 border-t">
                <Label className="text-base font-semibold">Generated Caption</Label>
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
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                variant="default"
                className="flex-1 gap-2"
                onClick={handleSaveVideo}
              >
                <Video className="w-4 h-4" />
                Save Video Post
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

