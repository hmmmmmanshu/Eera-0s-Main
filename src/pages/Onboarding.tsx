import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Loader2, Rocket } from "lucide-react";

const onboardingSchema = z.object({
  startup_name: z.string().min(1, "Startup name is required").max(100),
  founder_name: z.string().min(1, "Founder name is required").max(100),
  website_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  tagline: z.string().min(1, "Tagline is required").max(200),
  industry: z.string().min(1, "Please select an industry"),
  target_audience: z.string().min(1, "Target audience is required").max(500),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const industries = [
  "SaaS",
  "Fintech",
  "Healthcare",
  "E-commerce",
  "Education",
  "AI/ML",
  "Marketing",
  "Real Estate",
  "Food & Beverage",
  "Entertainment",
  "Other"
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      startup_name: "",
      founder_name: "",
      website_url: "",
      tagline: "",
      industry: "",
      target_audience: "",
    },
  });

  const onSubmit = async (data: OnboardingFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...data,
          onboarding_completed: true,
          profile_completion_percentage: 30,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Welcome aboard!",
        description: "Your profile has been created successfully.",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      toast({
        title: "Error",
        description: "Failed to save your information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl p-8 md:p-12">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Rocket className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to Your Startup Hub</h1>
          <p className="text-muted-foreground">
            Let's get started with some essential information. You can add more details later from your profile settings.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="startup_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Startup Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Inc." {...field} />
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
                  <FormLabel>Founder Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" {...field} />
                  </FormControl>
                  <FormDescription>
                    For personal branding and attribution
                  </FormDescription>
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
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    We'll use this to extract brand information
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tagline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tagline / Elevator Pitch *</FormLabel>
                  <FormControl>
                    <Input placeholder="Revolutionizing the way startups grow" {...field} />
                  </FormControl>
                  <FormDescription>
                    A short one-liner about your company
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry / Category *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
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
                  <FormLabel>Target Audience *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Startup founders, SMBs, Tech enthusiasts..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Who are your primary customers?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default Onboarding;
