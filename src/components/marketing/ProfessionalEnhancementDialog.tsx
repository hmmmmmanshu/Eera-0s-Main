import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, RotateCcw } from "lucide-react";
import type { ImageType } from "@/types/imageTypes";
import {
  getSmartDefaults,
  type ProfessionalSettings,
  type SmartDefaultsContext,
} from "@/lib/professionalDefaults";
import type {
  QualityLevel,
  PhotographyStyle,
  DesignSophistication,
  PlatformStandard,
  IndustryAesthetic,
  ColorGradingStyle,
} from "@/lib/professionalKeywords";

interface ProfessionalEnhancementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (settings: ProfessionalSettings) => void;
  onSkip: () => void;
  initialSettings?: ProfessionalSettings;
  context: {
    accountType: "personal" | "company";
    platform: "linkedin" | "instagram";
    imageType: ImageType | null;
    tone: string;
    brandProfile?: {
      industry?: string;
      style?: string;
      mood?: string[];
    };
  };
}

// Photography style options
const PHOTOGRAPHY_STYLES: { value: PhotographyStyle; label: string }[] = [
  { value: "natural", label: "Natural Lighting" },
  { value: "studio", label: "Studio Lighting" },
  { value: "goldenHour", label: "Golden Hour" },
  { value: "dramatic", label: "Dramatic Lighting" },
  { value: "flatLay", label: "Flat Lay" },
  { value: "portrait", label: "Portrait Style" },
  { value: "documentary", label: "Documentary Style" },
];

// Quality level options
const QUALITY_LEVELS: { value: QualityLevel; label: string; description: string }[] = [
  { value: "standard", label: "Standard", description: "Current quality" },
  { value: "professional", label: "Professional", description: "Enhanced lighting, composition" },
  { value: "premium", label: "Premium", description: "Cinematic, studio-grade, magazine-worthy" },
];

// Design sophistication options
const DESIGN_SOPHISTICATION_OPTIONS: { value: DesignSophistication; label: string }[] = [
  { value: "cleanSimple", label: "Clean & Simple" },
  { value: "modernBold", label: "Modern & Bold" },
  { value: "elegantRefined", label: "Elegant & Refined" },
  { value: "editorial", label: "Editorial" },
  { value: "minimalist", label: "Minimalist" },
];

// Platform standard options
const PLATFORM_STANDARD_OPTIONS: { value: PlatformStandard; label: string }[] = [
  { value: "linkedinProfessional", label: "LinkedIn Professional" },
  { value: "linkedinCreative", label: "LinkedIn Creative" },
  { value: "instagramPremium", label: "Instagram Premium" },
  { value: "instagramAuthentic", label: "Instagram Authentic" },
];

// Industry aesthetic options
const INDUSTRY_AESTHETIC_OPTIONS: { value: IndustryAesthetic; label: string }[] = [
  { value: "techSaaS", label: "Tech/SaaS" },
  { value: "finance", label: "Finance" },
  { value: "creativeAgency", label: "Creative Agency" },
  { value: "healthcare", label: "Healthcare" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "consulting", label: "Consulting" },
  { value: "startup", label: "Startup" },
];

// Color grading options
const COLOR_GRADING_OPTIONS: { value: ColorGradingStyle; label: string }[] = [
  { value: "natural", label: "Natural" },
  { value: "warmInviting", label: "Warm & Inviting" },
  { value: "coolProfessional", label: "Cool & Professional" },
  { value: "highContrast", label: "High Contrast" },
  { value: "mutedSophisticated", label: "Muted & Sophisticated" },
  { value: "cinematic", label: "Cinematic" },
];

export const ProfessionalEnhancementDialog = ({
  open,
  onOpenChange,
  onApply,
  onSkip,
  initialSettings,
  context,
}: ProfessionalEnhancementDialogProps) => {
  // Get smart defaults if initialSettings not provided
  const getDefaultSettings = (): ProfessionalSettings => {
    if (initialSettings) {
      return initialSettings;
    }
    const smartDefaultsContext: SmartDefaultsContext = {
      accountType: context.accountType,
      platform: context.platform,
      imageType: context.imageType || undefined,
      tone: context.tone,
      brandProfile: context.brandProfile,
    };
    return getSmartDefaults(smartDefaultsContext);
  };

  const defaultSettings = getDefaultSettings();

  // State management
  const [qualityLevel, setQualityLevel] = useState<QualityLevel>(defaultSettings.qualityLevel);
  const [photographyStyles, setPhotographyStyles] = useState<PhotographyStyle[]>(
    defaultSettings.photographyStyle || []
  );
  const [designSophistication, setDesignSophistication] = useState<DesignSophistication>(
    defaultSettings.designSophistication
  );
  const [platformStandard, setPlatformStandard] = useState<PlatformStandard>(
    defaultSettings.platformStandard
  );
  const [industryAesthetic, setIndustryAesthetic] = useState<IndustryAesthetic | undefined>(
    defaultSettings.industryAesthetic
  );
  const [colorGrading, setColorGrading] = useState<ColorGradingStyle>(defaultSettings.colorGrading);
  const [isApplying, setIsApplying] = useState(false);

  // Reset to defaults when dialog opens or context changes
  useEffect(() => {
    if (open) {
      const newDefaults = getDefaultSettings();
      setQualityLevel(newDefaults.qualityLevel);
      setPhotographyStyles(newDefaults.photographyStyle || []);
      setDesignSophistication(newDefaults.designSophistication);
      setPlatformStandard(newDefaults.platformStandard);
      setIndustryAesthetic(newDefaults.industryAesthetic);
      setColorGrading(newDefaults.colorGrading);
    }
  }, [open, context, initialSettings]);

  // Handle photography style toggle
  const handlePhotographyStyleToggle = (style: PhotographyStyle) => {
    setPhotographyStyles((prev) => {
      if (prev.includes(style)) {
        return prev.filter((s) => s !== style);
      }
      return [...prev, style];
    });
  };

  // Reset to smart defaults
  const handleResetToDefaults = () => {
    const defaults = getDefaultSettings();
    setQualityLevel(defaults.qualityLevel);
    setPhotographyStyles(defaults.photographyStyle || []);
    setDesignSophistication(defaults.designSophistication);
    setPlatformStandard(defaults.platformStandard);
    setIndustryAesthetic(defaults.industryAesthetic);
    setColorGrading(defaults.colorGrading);
  };

  // Handle apply
  const handleApply = () => {
    setIsApplying(true);
    const settings: ProfessionalSettings = {
      qualityLevel,
      photographyStyle: photographyStyles,
      designSophistication,
      platformStandard,
      industryAesthetic,
      colorGrading,
    };
    onApply(settings);
    // Note: Don't set isApplying to false here - let parent handle it
  };

  // Handle skip
  const handleSkip = () => {
    onSkip();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Professional Image Enhancement
          </DialogTitle>
          <DialogDescription>
            Fine-tune professional settings for higher quality images
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Accordion type="multiple" defaultValue={["quality", "photography", "design"]} className="w-full">
            {/* Section 1: Visual Quality Level */}
            <AccordionItem value="quality">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Visual Quality Level</span>
                  <Badge variant="secondary" className="text-xs">{qualityLevel}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Choose the level of professional quality
                  </p>
                  <RadioGroup value={qualityLevel} onValueChange={(value) => setQualityLevel(value as QualityLevel)}>
                    {QUALITY_LEVELS.map((option) => (
                      <div key={option.value} className="flex items-start space-x-2">
                        <RadioGroupItem value={option.value} id={`quality-${option.value}`} />
                        <div className="flex-1">
                          <Label
                            htmlFor={`quality-${option.value}`}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {option.label}
                          </Label>
                          <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section 2: Photography Style */}
            <AccordionItem value="photography">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Photography Style</span>
                  <Badge variant="secondary" className="text-xs">
                    {photographyStyles.length} {photographyStyles.length === 1 ? "style" : "styles"} selected
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Select photography techniques to apply (multiple selections allowed)
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {PHOTOGRAPHY_STYLES.map((style) => (
                      <div key={style.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`photo-${style.value}`}
                          checked={photographyStyles.includes(style.value)}
                          onCheckedChange={() => handlePhotographyStyleToggle(style.value)}
                        />
                        <Label
                          htmlFor={`photo-${style.value}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {style.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section 3: Design Sophistication */}
            <AccordionItem value="design">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Design Sophistication</span>
                  <Badge variant="secondary" className="text-xs">{designSophistication}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    How sophisticated should the design be?
                  </p>
                  <RadioGroup
                    value={designSophistication}
                    onValueChange={(value) => setDesignSophistication(value as DesignSophistication)}
                  >
                    {DESIGN_SOPHISTICATION_OPTIONS.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`design-${option.value}`} />
                        <Label htmlFor={`design-${option.value}`} className="text-sm font-medium cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section 4: Platform Standards */}
            <AccordionItem value="platform">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Platform Professional Standards</span>
                  <Badge variant="secondary" className="text-xs">{platformStandard}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Optimize for platform-specific professional standards
                  </p>
                  <RadioGroup
                    value={platformStandard}
                    onValueChange={(value) => setPlatformStandard(value as PlatformStandard)}
                  >
                    {PLATFORM_STANDARD_OPTIONS.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`platform-${option.value}`} />
                        <Label htmlFor={`platform-${option.value}`} className="text-sm font-medium cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section 5: Industry Aesthetic (Optional) */}
            {context.brandProfile?.industry && (
              <AccordionItem value="industry">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Industry Aesthetic</span>
                    {industryAesthetic && <Badge variant="secondary" className="text-xs">{industryAesthetic}</Badge>}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Match your industry&apos;s professional standards
                    </p>
                    <Select
                      value={industryAesthetic || "startup"}
                      onValueChange={(value) => setIndustryAesthetic(value as IndustryAesthetic)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry aesthetic" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRY_AESTHETIC_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
              </AccordionContent>
            </AccordionItem>
            )}

            {/* Section 6: Color Grading */}
            <AccordionItem value="color">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Color Treatment</span>
                  <Badge variant="secondary" className="text-xs">{colorGrading}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Professional color grading style</p>
                  <RadioGroup
                    value={colorGrading}
                    onValueChange={(value) => setColorGrading(value as ColorGradingStyle)}
                  >
                    {COLOR_GRADING_OPTIONS.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`color-${option.value}`} />
                        <Label htmlFor={`color-${option.value}`} className="text-sm font-medium cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Reset to Defaults Button */}
          <div className="flex justify-end pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetToDefaults}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Defaults
            </Button>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleSkip} disabled={isApplying}>
            Skip
          </Button>
          <Button onClick={handleApply} disabled={isApplying || photographyStyles.length === 0}>
            {isApplying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : (
              "Apply & Regenerate"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

