import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Link2, X, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getZohoTokens, getZohoOrganizations, saveZohoTokens } from "@/lib/zohoInvoice";

interface ZohoConnectionProps {
  onConnected?: () => void;
}

export function ZohoConnection({ onConnected }: ZohoConnectionProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [organizationName, setOrganizationName] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const tokens = await getZohoTokens(user.id);
      if (tokens) {
        setIsConnected(true);
        // Try to get organization name
        try {
          const orgs = await getZohoOrganizations(user.id);
          if (orgs && orgs.length > 0) {
            setOrganizationName(orgs[0].name);
          }
        } catch (error) {
          console.warn("Could not fetch organization name:", error);
        }
      }
    } catch (error) {
      console.error("Error checking Zoho connection:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = () => {
    // Zoho OAuth requires a server-side callback URL
    // For now, we'll show instructions to the user
    // In production, you'd need to implement a proper OAuth flow with a server endpoint
    
    toast.info(
      "Zoho OAuth Setup:\n\n" +
      "1. Create a Zoho API application at https://api-console.zoho.com/\n" +
      "2. Set redirect URI to your callback URL\n" +
      "3. Copy Client ID and Client Secret\n" +
      "4. Visit the OAuth authorization URL\n\n" +
      "Note: Full OAuth flow requires a server endpoint to handle the callback."
    );

    // For development/testing, you can manually paste tokens
    // In production, implement proper OAuth redirect flow
    const manualToken = prompt(
      "Enter access token (for testing only - use OAuth in production):"
    );
    
    if (manualToken) {
      handleManualToken(manualToken);
    }
  };

  const handleManualToken = async (accessToken: string) => {
    try {
      setIsConnecting(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get refresh token (would normally come from OAuth callback)
      const refreshToken = prompt("Enter refresh token:");
      if (!refreshToken) {
        toast.error("Refresh token is required");
        return;
      }

      // Calculate expiration (Zoho tokens typically expire in 1 hour)
      const expiresAt = Date.now() + 3600 * 1000;

      await saveZohoTokens(user.id, {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt,
        organization_id: undefined, // Will be fetched on first API call
      });

      // Fetch organization ID
      try {
        const orgs = await getZohoOrganizations(user.id);
        if (orgs && orgs.length > 0) {
          const org = orgs[0];
          await saveZohoTokens(user.id, {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_at: expiresAt,
            organization_id: org.organization_id,
          });
          setOrganizationName(org.name);
        }
      } catch (error) {
        console.warn("Could not fetch organization:", error);
      }

      setIsConnected(true);
      toast.success("Zoho connected successfully!");
      onConnected?.();
    } catch (error: any) {
      toast.error(`Failed to connect: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("zoho_integrations")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      setIsConnected(false);
      setOrganizationName(null);
      toast.success("Zoho disconnected");
    } catch (error: any) {
      toast.error(`Failed to disconnect: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Zoho Invoice Integration
        </CardTitle>
        <CardDescription>
          Connect your Zoho Invoice account to create and sync invoices automatically
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-semibold text-sm">Connected to Zoho Invoice</p>
                  {organizationName && (
                    <p className="text-xs text-muted-foreground">{organizationName}</p>
                  )}
                </div>
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                Active
              </Badge>
            </div>
            <Button variant="outline" onClick={handleDisconnect} className="w-full">
              <X className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
            <div className="text-xs text-muted-foreground">
              <p className="mb-2">
                <strong>Note:</strong> Full OAuth flow requires server-side implementation.
              </p>
              <p>
                For production, implement OAuth callback endpoint that handles the redirect
                from Zoho and securely stores tokens.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-3">
                Connect your Zoho Invoice account to:
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                <li>Create invoices directly in Zoho</li>
                <li>Sync invoices between systems</li>
                <li>Send invoices via Zoho email</li>
                <li>Track invoice status in real-time</li>
              </ul>
            </div>
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4 mr-2" />
                  Connect Zoho Invoice
                </>
              )}
            </Button>
            <div className="text-xs text-muted-foreground">
              <p className="mb-2">
                <strong>Setup Required:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Create Zoho API application at{" "}
                  <a
                    href="https://api-console.zoho.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    api-console.zoho.com
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>Configure OAuth scopes: ZohoInvoice.fullaccess.all</li>
                <li>Set redirect URI to your callback endpoint</li>
                <li>Copy Client ID and Client Secret</li>
              </ol>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

