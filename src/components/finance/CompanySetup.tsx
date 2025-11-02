import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompanyInfo, useUpdateCompanyInfo, type CompanyType } from "@/hooks/useFinanceData";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Building2, Users, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { syncEmployeeCount, regenerateTasksAfterEmployeeSync, generateComplianceTasks } from "@/lib/virtualCFO";
import { supabase } from "@/integrations/supabase/client";

export function CompanySetup() {
  const { data: companyInfo, isLoading } = useCompanyInfo();
  const updateMutation = useUpdateCompanyInfo();
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState(false);

  const [formData, setFormData] = useState({
    company_name: companyInfo?.company_name || "",
    company_type: (companyInfo?.company_type || "private_limited") as CompanyType,
    registration_number: companyInfo?.registration_number || "",
    gst_number: companyInfo?.gst_number || "",
    pan_number: companyInfo?.pan_number || "",
    tan_number: companyInfo?.tan_number || "",
    registration_date: companyInfo?.registration_date || "",
    incorporation_state: companyInfo?.incorporation_state || "",
    number_of_directors: companyInfo?.number_of_directors || 0,
    financial_year_start: companyInfo?.financial_year_start || 4,
    registered_address: companyInfo?.registered_address || {
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
    },
  });

  // Update form when data loads
  useEffect(() => {
    if (companyInfo) {
      setFormData({
        company_name: companyInfo.company_name || "",
        company_type: companyInfo.company_type || "private_limited",
        registration_number: companyInfo.registration_number || "",
        gst_number: companyInfo.gst_number || "",
        pan_number: companyInfo.pan_number || "",
        tan_number: companyInfo.tan_number || "",
        registration_date: companyInfo.registration_date || "",
        incorporation_state: companyInfo.incorporation_state || "",
        number_of_directors: companyInfo.number_of_directors || 0,
        financial_year_start: companyInfo.financial_year_start || 4,
        registered_address: (companyInfo.registered_address as any) || {
          line1: "",
          line2: "",
          city: "",
          state: "",
          pincode: "",
        },
      });
    }
  }, [companyInfo]);

  const handleSyncEmployees = async () => {
    try {
      setSyncing(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const count = await syncEmployeeCount(user.id);
      
      // Invalidate and refetch company info to show updated employee count
      queryClient.invalidateQueries({ queryKey: ["company-info"] });
      
      toast.success(`Synced ${count} employees from HR Hub`);

      // Regenerate compliance tasks if thresholds crossed
      await regenerateTasksAfterEmployeeSync(user.id);
    } catch (error: any) {
      toast.error(`Failed to sync employees: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      return;
    }

    updateMutation.mutate(
      {
        ...formData,
        registered_address: formData.registered_address,
      },
      {
        onSuccess: async () => {
          // Mark finance onboarding as completed
          await supabase
            .from("profiles")
            .update({ finance_onboarding_completed: true })
            .eq("id", user.id);

          // Generate compliance tasks
          const { data: companyInfoData } = await supabase
            .from("company_info")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();
          
          if (companyInfoData) {
            await generateComplianceTasks(user.id, companyInfoData as any);
          }
        },
      }
    );
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
          <Building2 className="h-5 w-5" />
          Company Registration Details
        </CardTitle>
        <CardDescription>
          Set up your company information for compliance tracking and financial management
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Company Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) =>
                    setFormData({ ...formData, company_name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="company_type">Company Type *</Label>
                <Select
                  value={formData.company_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, company_type: value as CompanyType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private_limited">Private Limited</SelectItem>
                    <SelectItem value="llp">LLP</SelectItem>
                    <SelectItem value="opc">OPC (One Person Company)</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="registration_number">
                  {formData.company_type === "private_limited" || formData.company_type === "opc"
                    ? "CIN"
                    : formData.company_type === "llp"
                    ? "LLPIN"
                    : "Registration Number"}
                </Label>
                <Input
                  id="registration_number"
                  value={formData.registration_number}
                  onChange={(e) =>
                    setFormData({ ...formData, registration_number: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="registration_date">Registration Date</Label>
                <Input
                  id="registration_date"
                  type="date"
                  value={formData.registration_date}
                  onChange={(e) =>
                    setFormData({ ...formData, registration_date: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Tax Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Tax Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gst_number">GST Number</Label>
                <Input
                  id="gst_number"
                  value={formData.gst_number}
                  onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="pan_number">PAN Number</Label>
                <Input
                  id="pan_number"
                  value={formData.pan_number}
                  onChange={(e) => setFormData({ ...formData, pan_number: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tan_number">TAN Number</Label>
              <Input
                id="tan_number"
                value={formData.tan_number}
                onChange={(e) => setFormData({ ...formData, tan_number: e.target.value })}
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Registered Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="line1">Address Line 1</Label>
                <Input
                  id="line1"
                  value={(formData.registered_address as any).line1 || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      registered_address: {
                        ...(formData.registered_address as any),
                        line1: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="line2">Address Line 2</Label>
                <Input
                  id="line2"
                  value={(formData.registered_address as any).line2 || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      registered_address: {
                        ...(formData.registered_address as any),
                        line2: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={(formData.registered_address as any).city || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      registered_address: {
                        ...(formData.registered_address as any),
                        city: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={(formData.registered_address as any).state || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      registered_address: {
                        ...(formData.registered_address as any),
                        state: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={(formData.registered_address as any).pincode || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      registered_address: {
                        ...(formData.registered_address as any),
                        pincode: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="incorporation_state">Incorporation State</Label>
              <Input
                id="incorporation_state"
                value={formData.incorporation_state}
                onChange={(e) =>
                  setFormData({ ...formData, incorporation_state: e.target.value })
                }
              />
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Additional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="number_of_directors">Number of Directors</Label>
                <Input
                  id="number_of_directors"
                  type="number"
                  min="0"
                  value={formData.number_of_directors}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      number_of_directors: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="financial_year_start">Financial Year Start Month</Label>
                <Select
                  value={String(formData.financial_year_start)}
                  onValueChange={(value) =>
                    setFormData({ ...formData, financial_year_start: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      { value: "1", label: "January" },
                      { value: "2", label: "February" },
                      { value: "3", label: "March" },
                      { value: "4", label: "April" },
                      { value: "5", label: "May" },
                      { value: "6", label: "June" },
                      { value: "7", label: "July" },
                      { value: "8", label: "August" },
                      { value: "9", label: "September" },
                      { value: "10", label: "October" },
                      { value: "11", label: "November" },
                      { value: "12", label: "December" },
                    ].map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Employee Sync */}
          <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" />
              <div>
                <p className="font-semibold text-sm">Sync Employees from HR Hub</p>
                <p className="text-xs text-muted-foreground">
                  Automatically update employee count for compliance calculations
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleSyncEmployees}
              disabled={syncing}
            >
              {syncing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Now
                </>
              )}
            </Button>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Company Information"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
