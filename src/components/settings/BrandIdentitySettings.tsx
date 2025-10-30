import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Palette, Plus, X, Check } from "lucide-react";
import { useBrandProfile } from "@/hooks/useMarketingData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ColorPalette {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  text?: string;
}

export const BrandIdentitySettings = () => {
  const { data: profile, isLoading } = useBrandProfile();
  const [colors, setColors] = useState<ColorPalette>({
    primary: "#0A66FF",
    secondary: "#6B46C1",
    accent: "#2ECC71",
    background: "#FFFFFF",
    text: "#1A1A1A",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [newColor, setNewColor] = useState("");

  // Load colors from profile
  useEffect(() => {
    if (profile?.color_palette) {
      const palette = profile.color_palette as ColorPalette;
      setColors({
        primary: palette.primary || "#0A66FF",
        secondary: palette.secondary || "#6B46C1",
        accent: palette.accent || "#2ECC71",
        background: palette.background || "#FFFFFF",
        text: palette.text || "#1A1A1A",
      });
    }
  }, [profile]);

  const handleColorChange = (key: keyof ColorPalette, value: string) => {
    // Validate hex color
    const hexRegex = /^#[0-9A-F]{6}$/i;
    if (hexRegex.test(value) || value === "") {
      setColors((prev) => ({ ...prev, [key]: value }));
    }
  };

  const addCustomColor = () => {
    const hexRegex = /^#[0-9A-F]{6}$/i;
    if (newColor && hexRegex.test(newColor)) {
      setCustomColors((prev) => [...prev, newColor]);
      setNewColor("");
      toast.success("Color added to palette");
    } else {
      toast.error("Please enter a valid hex color (e.g., #FF5733)");
    }
  };

  const removeCustomColor = (index: number) => {
    setCustomColors((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const colorPalette = {
        ...colors,
        custom: customColors,
      };

      const { error } = await supabase
        .from("profiles")
        .update({ color_palette: colorPalette })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Brand colors saved successfully!");
      console.log("[Brand Identity] Colors saved:", colorPalette);
    } catch (error) {
      console.error("[Brand Identity] Save failed:", error);
      toast.error("Failed to save brand colors");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Brand Identity</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <CardTitle>Brand Identity</CardTitle>
        </div>
        <CardDescription>
          Define your brand colors to automatically apply them to AI-generated content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Brand Colors */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Primary Brand Colors</h3>
          
          {/* Primary Color */}
          <div className="space-y-2">
            <Label htmlFor="primary-color">Primary Color</Label>
            <div className="flex gap-3 items-center">
              <div className="relative">
                <Input
                  type="color"
                  id="primary-color"
                  value={colors.primary}
                  onChange={(e) => handleColorChange("primary", e.target.value)}
                  className="w-24 h-12 cursor-pointer border-2"
                />
              </div>
              <Input
                type="text"
                value={colors.primary}
                onChange={(e) => handleColorChange("primary", e.target.value.toUpperCase())}
                placeholder="#0A66FF"
                className="flex-1 font-mono"
                maxLength={7}
              />
              <div
                className="w-12 h-12 rounded-md border-2 border-border"
                style={{ backgroundColor: colors.primary }}
              />
            </div>
          </div>

          {/* Secondary Color */}
          <div className="space-y-2">
            <Label htmlFor="secondary-color">Secondary Color</Label>
            <div className="flex gap-3 items-center">
              <div className="relative">
                <Input
                  type="color"
                  id="secondary-color"
                  value={colors.secondary}
                  onChange={(e) => handleColorChange("secondary", e.target.value)}
                  className="w-24 h-12 cursor-pointer border-2"
                />
              </div>
              <Input
                type="text"
                value={colors.secondary}
                onChange={(e) => handleColorChange("secondary", e.target.value.toUpperCase())}
                placeholder="#6B46C1"
                className="flex-1 font-mono"
                maxLength={7}
              />
              <div
                className="w-12 h-12 rounded-md border-2 border-border"
                style={{ backgroundColor: colors.secondary }}
              />
            </div>
          </div>

          {/* Accent Color */}
          <div className="space-y-2">
            <Label htmlFor="accent-color">Accent Color</Label>
            <div className="flex gap-3 items-center">
              <div className="relative">
                <Input
                  type="color"
                  id="accent-color"
                  value={colors.accent}
                  onChange={(e) => handleColorChange("accent", e.target.value)}
                  className="w-24 h-12 cursor-pointer border-2"
                />
              </div>
              <Input
                type="text"
                value={colors.accent}
                onChange={(e) => handleColorChange("accent", e.target.value.toUpperCase())}
                placeholder="#2ECC71"
                className="flex-1 font-mono"
                maxLength={7}
              />
              <div
                className="w-12 h-12 rounded-md border-2 border-border"
                style={{ backgroundColor: colors.accent }}
              />
            </div>
          </div>
        </div>

        {/* Additional Colors */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Additional Colors (Optional)</h3>
          
          {/* Background Color */}
          <div className="space-y-2">
            <Label htmlFor="background-color">Background Color</Label>
            <div className="flex gap-3 items-center">
              <div className="relative">
                <Input
                  type="color"
                  id="background-color"
                  value={colors.background}
                  onChange={(e) => handleColorChange("background", e.target.value)}
                  className="w-24 h-12 cursor-pointer border-2"
                />
              </div>
              <Input
                type="text"
                value={colors.background}
                onChange={(e) => handleColorChange("background", e.target.value.toUpperCase())}
                placeholder="#FFFFFF"
                className="flex-1 font-mono"
                maxLength={7}
              />
              <div
                className="w-12 h-12 rounded-md border-2 border-border"
                style={{ backgroundColor: colors.background }}
              />
            </div>
          </div>

          {/* Text Color */}
          <div className="space-y-2">
            <Label htmlFor="text-color">Text Color</Label>
            <div className="flex gap-3 items-center">
              <div className="relative">
                <Input
                  type="color"
                  id="text-color"
                  value={colors.text}
                  onChange={(e) => handleColorChange("text", e.target.value)}
                  className="w-24 h-12 cursor-pointer border-2"
                />
              </div>
              <Input
                type="text"
                value={colors.text}
                onChange={(e) => handleColorChange("text", e.target.value.toUpperCase())}
                placeholder="#1A1A1A"
                className="flex-1 font-mono"
                maxLength={7}
              />
              <div
                className="w-12 h-12 rounded-md border-2 border-border"
                style={{ backgroundColor: colors.text }}
              />
            </div>
          </div>
        </div>

        {/* Custom Colors */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Custom Colors</h3>
          <p className="text-sm text-muted-foreground">
            Add additional brand colors that will be included in AI-generated images
          </p>

          {/* Add Custom Color */}
          <div className="flex gap-2">
            <Input
              type="text"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value.toUpperCase())}
              placeholder="#FF5733"
              className="font-mono"
              maxLength={7}
            />
            <Button onClick={addCustomColor} size="icon" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Custom Colors List */}
          {customColors.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {customColors.map((color, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 rounded-md border bg-card"
                >
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-mono">{color}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => removeCustomColor(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Color Palette Preview */}
        <div className="space-y-4 p-4 rounded-lg bg-muted/50">
          <h3 className="text-sm font-semibold">Preview</h3>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(colors).map(([key, value]) => (
              <div key={key} className="flex flex-col items-center gap-1">
                <div
                  className="w-16 h-16 rounded-lg border-2 border-border shadow-sm"
                  style={{ backgroundColor: value }}
                />
                <span className="text-xs font-medium capitalize">{key}</span>
                <span className="text-xs font-mono text-muted-foreground">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-2">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>Saving...</>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Save Brand Colors
              </>
            )}
          </Button>
        </div>

        {/* Usage Info */}
        <div className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
          <p className="font-semibold mb-2">How these colors are used:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Automatically applied to AI-generated images</li>
            <li>Influence the color scheme of visual content</li>
            <li>Ensure brand consistency across all marketing materials</li>
            <li>Can be overridden per post if needed</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

