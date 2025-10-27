import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Badge } from "@/components/ui/badge";
import { FileText, Image as ImageIcon, Video, Sparkles, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePostModal = ({ open, onOpenChange }: CreatePostModalProps) => {
  const [step, setStep] = useState(1);
  const [platform, setPlatform] = useState<"linkedin" | "instagram">("linkedin");
  const [contentType, setContentType] = useState<"text" | "image" | "carousel" | "video">("text");

  const resetAndClose = () => {
    setStep(1);
    onOpenChange(false);
  };

  const contentTypes = [
    { id: "text" as const, icon: FileText, label: "Text Only", platforms: ["linkedin"] },
    { id: "image" as const, icon: ImageIcon, label: "Image Post", platforms: ["linkedin", "instagram"] },
    { id: "carousel" as const, icon: ImageIcon, label: "Carousel", platforms: ["instagram"] },
    { id: "video" as const, icon: Video, label: "Reel/Short", platforms: ["instagram"] },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
          <DialogDescription>
            Step {step} of 5: {
              step === 1 ? "Choose Platform" :
              step === 2 ? "Select Format" :
              step === 3 ? "Add Content" :
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
              <Label htmlFor="headline">Headline / Hook</Label>
              <Input id="headline" placeholder="What's your main message?" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="keypoints">Key Points (optional)</Label>
              <Textarea 
                id="keypoints" 
                placeholder="• Point 1&#10;• Point 2&#10;• Point 3"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Reference Image (optional)</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <Select defaultValue="professional">
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
                <Select defaultValue="awareness">
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
              <Button className="flex-1 gap-2" onClick={() => setStep(4)}>
                <Sparkles className="w-4 h-4" />
                Generate
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Generate (Loading State) */}
        {step === 4 && (
          <div className="space-y-6 py-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <p className="font-semibold">Generating your content...</p>
                <p className="text-sm text-muted-foreground">This will take a few seconds</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>✓ Analyzing brand voice</span>
                <span className="text-green-600">Complete</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>⏳ Generating copy</span>
                <span className="text-muted-foreground">In progress...</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Generating visuals</span>
                <span>Queued</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setStep(5)}
            >
              Skip to Preview (Demo)
            </Button>
          </div>
        )}

        {/* Step 5: Preview */}
        {step === 5 && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10" />
                    <div>
                      <p className="font-semibold">Your Brand</p>
                      <p className="text-xs text-muted-foreground">Just now</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold">🚀 Exciting news from our journey!</p>
                    <p className="text-sm">
                      After months of building, testing, and iterating, we're thrilled to share what we've been working on...
                    </p>
                  </div>
                  {contentType !== "text" && (
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">#startup</Badge>
                    <Badge variant="secondary">#innovation</Badge>
                    <Badge variant="secondary">#technology</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(3)}>
                Edit
              </Button>
              <Button variant="outline" className="flex-1">
                Save Draft
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
