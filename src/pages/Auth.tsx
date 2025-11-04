import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const [isLogin, setIsLogin] = useState(mode !== "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
      // Redirect happens via Supabase; nothing else to do here.
    } catch (error: any) {
      console.error("Google auth error:", error);
      toast({
        title: "Google sign-in failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        if (data.user) {
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in.",
          });
          navigate("/dashboard");
        }
      } else {
        // Sign up the user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        
        if (error) throw error;
        
        // Check if email confirmation is required
        if (data.user && !data.session) {
          // Email confirmation is required
          setShowEmailConfirmation(true);
          toast({
            title: "Check your email!",
            description: "We've sent you a confirmation link. Please check your inbox and click the link to activate your account.",
            duration: 8000,
          });
          // Don't navigate, stay on auth page and show confirmation message
        } else if (data.user && data.session) {
          // No email confirmation required, user is logged in
          toast({
            title: "Account created!",
            description: "Welcome to EERA OS",
          });
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred during authentication",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show email confirmation message if needed
  if (showEmailConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-background p-6">
        <Card className="w-full max-w-md border-2 shadow-2xl">
          <CardHeader className="space-y-4 text-center">
            <Button
              variant="ghost"
              size="sm"
              className="w-fit mb-2"
              onClick={() => {
                setShowEmailConfirmation(false);
                setEmail("");
                setPassword("");
                setFullName("");
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign Up
            </Button>
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription className="text-base">
              We've sent a confirmation link to <strong>{email}</strong>
              <br />
              <br />
              Click the link in the email to activate your account and get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
              <p className="font-medium mb-2">💡 Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Check your spam folder</li>
                <li>The link expires in 24 hours</li>
                <li>Make sure {email} is correct</li>
              </ul>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowEmailConfirmation(false);
                setIsLogin(true);
              }}
            >
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-background p-6">
      <Card className="w-full max-w-md border-2 shadow-2xl">
        <CardHeader className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit mb-2"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-hub-marketing flex items-center justify-center">
              <img src="/Logo.png" alt="Logo" className="w-6 h-6 object-contain" />
            </div>
            <span className="text-2xl font-bold">EERA OS</span>
          </div>
          <CardTitle className="text-2xl">
            {isLogin ? "Welcome back" : "Create your account"}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? "Enter your credentials to access your Founder's Office"
              : "Start your journey with the ultimate Founder's OS"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="founder@startup.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
              {!isLogin && (
                <p className="text-xs text-muted-foreground">
                  Must be at least 6 characters long
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>
          
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={loading}
              onClick={handleGoogleAuth}
              aria-label="Continue with Google"
            >
              {/* Simple Google "G" mark */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 533.5 544.3"
                className="mr-2 h-4 w-4"
              >
                <path fill="#4285F4" d="M533.5 278.4c0-18.6-1.7-36.5-4.8-53.8H272v101.8h146.9c-6.3 34.1-25.1 63.1-53.5 82.4v68h86.7c50.8-46.8 81.4-115.7 81.4-198.4z"/>
                <path fill="#34A853" d="M272 544.3c72.9 0 134.2-24.1 178.9-65.5l-86.7-68c-24.1 16.2-55 25.8-92.2 25.8-70.9 0-131-47.9-152.5-112.3H30.8v70.6c44.5 88 135.9 149.4 241.2 149.4z"/>
                <path fill="#FBBC05" d="M119.5 324.3c-10.1-30.1-10.1-62.6 0-92.7V161H30.8c-41.2 82.4-41.2 179.9 0 262.3l88.7-68.9z"/>
                <path fill="#EA4335" d="M272 107.7c39.6-.6 77.5 13.9 106.6 40.7l79.7-79.7C406.2 24.4 343.9 0 272 0 166.7 0 75.3 61.4 30.8 149.4l88.7 70.6C141 155.6 201.1 107.7 272 107.7z"/>
              </svg>
              Continue with Google
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <Button
              variant="link"
              className="mt-1 font-semibold"
              onClick={() => setIsLogin(!isLogin)}
              disabled={loading}
            >
              {isLogin ? "Create a free account" : "Sign in to your account"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
