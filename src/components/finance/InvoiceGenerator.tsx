import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCompanyInfo } from "@/hooks/useFinanceData";
import { useCreateInvoice } from "@/hooks/useFinanceData";
import { generateInvoice, type InvoiceLineItem } from "@/lib/gemini";
import {
  FileText,
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  Eye,
  Download,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function InvoiceGenerator() {
  const { data: companyInfo } = useCompanyInfo();
  const createInvoiceMutation = useCreateInvoice();
  const [showPreview, setShowPreview] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<any>(null);

  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    invoiceDate: format(new Date(), "yyyy-MM-dd"),
    dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"), // 30 days
    gstPercentage: 18,
    lineItems: [
      { description: "", quantity: 1, rate: 0, amount: 0 },
    ] as InvoiceLineItem[],
  });

  const calculateLineItemAmount = (item: InvoiceLineItem) => {
    return item.quantity * item.rate;
  };

  const updateLineItem = (index: number, field: keyof InvoiceLineItem, value: any) => {
    const updated = [...formData.lineItems];
    updated[index] = { ...updated[index], [field]: value };
    if (field === "quantity" || field === "rate") {
      updated[index].amount = calculateLineItemAmount(updated[index]);
    }
    setFormData({ ...formData, lineItems: updated });
  };

  const addLineItem = () => {
    setFormData({
      ...formData,
      lineItems: [
        ...formData.lineItems,
        { description: "", quantity: 1, rate: 0, amount: 0 },
      ],
    });
  };

  const removeLineItem = (index: number) => {
    if (formData.lineItems.length > 1) {
      setFormData({
        ...formData,
        lineItems: formData.lineItems.filter((_, i) => i !== index),
      });
    }
  };

  const subtotal = formData.lineItems.reduce((sum, item) => sum + item.amount, 0);
  const gstAmount = (subtotal * formData.gstPercentage) / 100;
  const totalAmount = subtotal + gstAmount;

  const handleGenerateWithAI = async () => {
    if (!companyInfo) {
      toast.error("Please complete company setup first");
      return;
    }

    if (!formData.clientName || formData.lineItems.some((item) => !item.description || item.rate === 0)) {
      toast.error("Please fill in client name and all line items");
      return;
    }

    try {
      setGenerating(true);
      const invoice = await generateInvoice({
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        companyInfo: {
          companyName: companyInfo.company_name,
          gstNumber: companyInfo.gst_number || undefined,
          panNumber: companyInfo.pan_number || undefined,
          address: companyInfo.registered_address
            ? `${(companyInfo.registered_address as any).line1 || ""} ${(companyInfo.registered_address as any).city || ""}`
            : undefined,
        },
        lineItems: formData.lineItems,
        dueDate: formData.dueDate,
        invoiceDate: formData.invoiceDate,
        gstPercentage: formData.gstPercentage,
      });

      setPreviewInvoice(invoice);
      setShowPreview(true);
      toast.success("Invoice generated successfully!");
    } catch (error: any) {
      toast.error(`Failed to generate invoice: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveInvoice = async (status: "draft" | "sent" = "draft") => {
    if (!previewInvoice) {
      // Save without AI generation
      await createInvoiceMutation.mutateAsync({
        client_name: formData.clientName,
        client_email: formData.clientEmail || undefined,
        amount: totalAmount,
        status: status,
        due_date: formData.dueDate,
      });
      toast.success(`Invoice saved as ${status}`);
      return;
    }

    await createInvoiceMutation.mutateAsync({
      client_name: formData.clientName,
      client_email: formData.clientEmail || undefined,
      amount: previewInvoice.totalAmount || totalAmount,
      status: status,
      due_date: formData.dueDate,
    });
    toast.success(`Invoice saved as ${status}`);
    setShowPreview(false);
    setFormData({
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      invoiceDate: format(new Date(), "yyyy-MM-dd"),
      dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
      gstPercentage: 18,
      lineItems: [{ description: "", quantity: 1, rate: 0, amount: 0 }],
    });
    setPreviewInvoice(null);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Invoice
          </CardTitle>
          <CardDescription>Create professional invoices with AI assistance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Client Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Client Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="clientEmail">Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="clientPhone">Phone</Label>
              <Input
                id="clientPhone"
                value={formData.clientPhone}
                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
              />
            </div>
          </div>

          {/* Invoice Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Invoice Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoiceDate">Invoice Date</Label>
                <Input
                  id="invoiceDate"
                  type="date"
                  value={formData.invoiceDate}
                  onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="gstPercentage">GST Percentage</Label>
              <Input
                id="gstPercentage"
                type="number"
                min="0"
                max="28"
                value={formData.gstPercentage}
                onChange={(e) =>
                  setFormData({ ...formData, gstPercentage: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Line Items</h3>
              <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
            <div className="space-y-3">
              {formData.lineItems.map((item, index) => (
                <div key={index} className="flex gap-2 items-start p-3 border rounded-lg">
                  <div className="flex-1 grid grid-cols-12 gap-2">
                    <div className="col-span-6">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateLineItem(index, "description", e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) =>
                          updateLineItem(index, "quantity", parseInt(e.target.value) || 0)
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Rate"
                        value={item.rate}
                        onChange={(e) =>
                          updateLineItem(index, "rate", parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                    <div className="col-span-2 flex items-center">
                      <span className="text-sm font-semibold">₹{item.amount.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLineItem(index)}
                    disabled={formData.lineItems.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 bg-accent/10 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>GST ({formData.gstPercentage}%):</span>
              <span className="font-semibold">₹{gstAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total:</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleGenerateWithAI}
              disabled={generating || !companyInfo}
              className="flex-1"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate with AI
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSaveInvoice("draft")}
              disabled={createInvoiceMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {previewInvoice ? (
            <div className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <div
                  dangerouslySetInnerHTML={{
                    __html: previewInvoice.formattedInvoice.replace(/\n/g, "<br />"),
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => window.print()}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" onClick={() => handleSaveInvoice("sent")}>
                  Mark as Sent
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Generate invoice to see preview</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
