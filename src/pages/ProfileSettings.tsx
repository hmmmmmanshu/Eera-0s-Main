import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, CheckCircle2, Building2, DollarSign } from "lucide-react";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import { lazy, Suspense } from "react";
// Lazy load CompanySetup to prevent circular dependency during module initialization
const CompanySetup = lazy(() => import("@/components/finance/CompanySetup").then(m => ({ default: m.CompanySetup })));

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  const form = useForm({
    defaultValues: {
      startup_name: "",
      founder_name: "",
      website_url: "",
      logo_url: "",
      tagline: "",
      about: "",
      industry: "",
      target_audience: "",
      key_offerings: "",
      company_stage: "",
      design_philosophy: "",
      tone_personality: "",
      writing_style: "",
      language_style: "",
      brand_values: "",
      competitive_edge: "",
      inspirational_brands: "",
      preferred_platforms: "",
      preferred_formats: "",
      content_themes: "",
      posting_frequency: "",
      assistant_name: "",
      assistant_style: "",
      notification_frequency: "",
      currency: "",
      country: "",
    },
  });

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        form.reset({
          startup_name: data.startup_name || "",
          founder_name: data.founder_name || "",
          website_url: data.website_url || "",
          logo_url: data.logo_url || "",
          tagline: data.tagline || "",
          about: data.about || "",
          industry: data.industry || "",
          target_audience: data.target_audience || "",
          key_offerings: data.key_offerings || "",
          company_stage: data.company_stage || "",
          design_philosophy: data.design_philosophy || "",
          tone_personality: data.tone_personality?.join(", ") || "",
          writing_style: data.writing_style || "",
          language_style: data.language_style || "",
          brand_values: data.brand_values?.join(", ") || "",
          competitive_edge: data.competitive_edge || "",
          inspirational_brands: data.inspirational_brands || "",
          preferred_platforms: data.preferred_platforms?.join(", ") || "",
          preferred_formats: data.preferred_formats?.join(", ") || "",
          content_themes: data.content_themes?.join(", ") || "",
          posting_frequency: data.posting_frequency || "",
          assistant_name: data.assistant_name || "",
          assistant_style: data.assistant_style || "",
          notification_frequency: data.notification_frequency || "",
          currency: data.currency || "INR",
          country: data.country || "India",
        });

        setCompletionPercentage(data.profile_completion_percentage || 0);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCompletion = (values: any) => {
    const fields = Object.values(values).filter(v => v && v !== "");
    return Math.round((fields.length / Object.keys(values).length) * 100);
  };

  const onSubmit = async (values: any) => {
    if (!user) return;

    setIsSaving(true);
    try {
      const completion = calculateCompletion(values);
      
      const updateData = {
        ...values,
        tone_personality: values.tone_personality ? values.tone_personality.split(",").map((s: string) => s.trim()) : [],
        brand_values: values.brand_values ? values.brand_values.split(",").map((s: string) => s.trim()) : [],
        preferred_platforms: values.preferred_platforms ? values.preferred_platforms.split(",").map((s: string) => s.trim()) : [],
        preferred_formats: values.preferred_formats ? values.preferred_formats.split(",").map((s: string) => s.trim()) : [],
        content_themes: values.content_themes ? values.content_themes.split(",").map((s: string) => s.trim()) : [],
        profile_completion_percentage: completion,
      };

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

      if (error) throw error;

      setCompletionPercentage(completion);

      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      <DashboardTopBar />
      
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
              <p className="text-muted-foreground">
                Complete your profile to get personalized results and better recommendations
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary mb-1">{completionPercentage}%</div>
              <p className="text-sm text-muted-foreground">Complete</p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="brand">Brand Voice</TabsTrigger>
                <TabsTrigger value="marketing">Marketing</TabsTrigger>
                <TabsTrigger value="assistant">Assistant</TabsTrigger>
                <TabsTrigger value="finance">Company & Finance</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                    <CardDescription>Core details about your startup</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="startup_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Startup Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="founder_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Founder Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="website_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website URL</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tagline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tagline</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="about"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>About</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={4} placeholder="Tell us about your startup..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select industry" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="SaaS">SaaS</SelectItem>
                              <SelectItem value="Fintech">Fintech</SelectItem>
                              <SelectItem value="Healthcare">Healthcare</SelectItem>
                              <SelectItem value="E-commerce">E-commerce</SelectItem>
                              <SelectItem value="AI/ML">AI/ML</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="target_audience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Audience</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="key_offerings"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Key Offerings</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Comma-separated" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="company_stage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Stage</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select stage" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Idea">Idea</SelectItem>
                              <SelectItem value="Pre-seed">Pre-seed</SelectItem>
                              <SelectItem value="Seed">Seed</SelectItem>
                              <SelectItem value="Series A">Series A</SelectItem>
                              <SelectItem value="Series B+">Series B+</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="brand" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Brand Voice & Personality</CardTitle>
                    <CardDescription>Define how your brand communicates</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="tone_personality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tone Personality</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Bold, Inspirational, Technical" />
                          </FormControl>
                          <FormDescription>Comma-separated values</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="writing_style"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Writing Style</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select style" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Concise">Concise</SelectItem>
                              <SelectItem value="Storytelling">Storytelling</SelectItem>
                              <SelectItem value="Educational">Educational</SelectItem>
                              <SelectItem value="Visionary">Visionary</SelectItem>
                              <SelectItem value="Conversational">Conversational</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="language_style"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Language Style</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select language style" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Formal">Formal</SelectItem>
                              <SelectItem value="Neutral">Neutral</SelectItem>
                              <SelectItem value="Casual">Casual</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="brand_values"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand Values</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Transparency, Innovation, Growth" />
                          </FormControl>
                          <FormDescription>Comma-separated values</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="competitive_edge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Competitive Edge</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} placeholder="What makes you different?" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="inspirational_brands"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inspirational Brands</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Brands you admire" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="marketing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Marketing Preferences</CardTitle>
                    <CardDescription>Configure your content and platform preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="preferred_platforms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Platforms</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., LinkedIn, Instagram, Twitter" />
                          </FormControl>
                          <FormDescription>Comma-separated values</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preferred_formats"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Content Formats</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Text, Carousel, Video" />
                          </FormControl>
                          <FormDescription>Comma-separated values</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="content_themes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content Themes</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Storytelling, Product Launches, Tips" />
                          </FormControl>
                          <FormDescription>Comma-separated values</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="posting_frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Posting Frequency</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Daily">Daily</SelectItem>
                              <SelectItem value="3x per week">3x per week</SelectItem>
                              <SelectItem value="Weekly">Weekly</SelectItem>
                              <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="assistant" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Assistant Configuration</CardTitle>
                    <CardDescription>Personalize your AI assistant experience</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="assistant_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assistant Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Give your assistant a name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="assistant_style"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Communication Style</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select style" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Direct">Direct</SelectItem>
                              <SelectItem value="Friendly">Friendly</SelectItem>
                              <SelectItem value="Formal">Formal</SelectItem>
                              <SelectItem value="Witty">Witty</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notification_frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notification Frequency</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Daily">Daily tips</SelectItem>
                              <SelectItem value="Weekly">Weekly report</SelectItem>
                              <SelectItem value="Silent">Silent mode</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="finance" className="space-y-6">
                {/* Currency and Country Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Currency & Location
                    </CardTitle>
                    <CardDescription>Set your preferred currency and country for financial calculations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || "INR"}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="INR">₹ INR (Indian Rupee)</SelectItem>
                              <SelectItem value="USD">$ USD (US Dollar)</SelectItem>
                              <SelectItem value="EUR">€ EUR (Euro)</SelectItem>
                              <SelectItem value="GBP">£ GBP (British Pound)</SelectItem>
                              <SelectItem value="SGD">S$ SGD (Singapore Dollar)</SelectItem>
                              <SelectItem value="AED">د.إ AED (UAE Dirham)</SelectItem>
                              <SelectItem value="JPY">¥ JPY (Japanese Yen)</SelectItem>
                              <SelectItem value="AUD">A$ AUD (Australian Dollar)</SelectItem>
                              <SelectItem value="CAD">C$ CAD (Canadian Dollar)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || "India"}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="India">India</SelectItem>
                              <SelectItem value="United States">United States</SelectItem>
                              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                              <SelectItem value="Singapore">Singapore</SelectItem>
                              <SelectItem value="United Arab Emirates">United Arab Emirates</SelectItem>
                              <SelectItem value="Australia">Australia</SelectItem>
                              <SelectItem value="Canada">Canada</SelectItem>
                              <SelectItem value="Germany">Germany</SelectItem>
                              <SelectItem value="France">France</SelectItem>
                              <SelectItem value="Japan">Japan</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Country selection determines compliance requirements and tax calculations
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Company Setup */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Company Registration
                    </CardTitle>
                    <CardDescription>
                      Configure your company details for compliance tracking and invoicing
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
                      <CompanySetup />
                    </Suspense>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end mt-6">
              <Button type="submit" size="lg" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ProfileSettings;
