import { useState, useEffect } from "react";
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
  Link2,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ZohoConnection } from "./ZohoConnection";
import { getZohoTokens, createZohoInvoice } from "@/lib/zohoInvoice";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function InvoiceGenerator() {
  const { data: companyInfo } = useCompanyInfo();
  const createInvoiceMutation = useCreateInvoice();
  const [showPreview, setShowPreview] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<any>(null);
  const [isZohoConnected, setIsZohoConnected] = useState(false);
  const [creatingInZoho, setCreatingInZoho] = useState(false);

  useEffect(() => {
    checkZohoConnection();
  }, []);

  const checkZohoConnection = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const tokens = await getZohoTokens(user.id);
      setIsZohoConnected(!!tokens);
    } catch (error) {
      console.error("Error checking Zoho connection:", error);
    }
  };

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

  const handlePrintInvoice = () => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice</title>
          <style>
            @page {
              size: A4;
              margin: 20mm;
            }
            body {
              font-family: system-ui, -apple-system, sans-serif;
              color: black;
              background: white;
              margin: 0;
              padding: 20px;
            }
            * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              color-adjust: exact;
            }
          </style>
        </head>
        <body>
          ${previewInvoice.formattedInvoice.replace(/\n/g, "<br />")}
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleDownloadPDF = async () => {
    if (!previewInvoice) return;
    
    try {
      // Use html2canvas and jsPDF for PDF generation
      // First, create a temporary element with the invoice content
      const printContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                color: black;
                background: white;
                margin: 0;
                padding: 40px;
                font-size: 14px;
                line-height: 1.6;
              }
              h1 { font-size: 28px; margin-bottom: 10px; }
              h2 { font-size: 18px; margin-top: 20px; margin-bottom: 10px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
              th { background-color: #f5f5f5; font-weight: 600; }
              .text-right { text-align: right; }
              .text-bold { font-weight: 600; }
            </style>
          </head>
          <body>
            ${previewInvoice.formattedInvoice.replace(/\n/g, "<br />")}
          </body>
        </html>
      `;

      // Open in new window and trigger browser's print-to-PDF
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Please allow popups to download PDF");
        return;
      }

      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Wait for content to load, then trigger save as PDF
      setTimeout(() => {
        printWindow.print();
        // Note: User will need to select "Save as PDF" in print dialog
        toast.success("Select 'Save as PDF' in the print dialog");
      }, 500);
    } catch (error: any) {
      toast.error(`Failed to generate PDF: ${error.message}`);
      // Fallback to print
      handlePrintInvoice();
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

  const handleCreateInZoho = async () => {
    if (!isZohoConnected) {
      toast.error("Please connect Zoho Invoice first");
      return;
    }

    if (!formData.clientName || formData.lineItems.length === 0) {
      toast.error("Please fill in client name and line items");
      return;
    }

    try {
      setCreatingInZoho(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Convert line items to Zoho format
      const zohoLineItems = formData.lineItems
        .filter((item) => item.description && item.rate > 0)
        .map((item) => ({
          name: item.description,
          rate: item.rate,
          quantity: item.quantity,
          item_total: item.amount,
        }));

      if (zohoLineItems.length === 0) {
        toast.error("Please add at least one valid line item");
        return;
      }

      // Get currency from profile
      const currency = companyInfo?.gst_number ? "INR" : "USD"; // Default based on GST presence

      const zohoInvoice = {
        customer_name: formData.clientName,
        date: formData.invoiceDate,
        due_date: formData.dueDate,
        payment_terms: Math.ceil(
          (new Date(formData.dueDate).getTime() - new Date(formData.invoiceDate).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
        currency_code: currency,
        line_items: zohoLineItems,
        notes: formData.clientEmail
          ? `Client Email: ${formData.clientEmail}\nClient Phone: ${formData.clientPhone || "N/A"}`
          : undefined,
      };

      const response = await createZohoInvoice(user.id, zohoInvoice);

      if (response.invoice) {
        toast.success(
          `Invoice created in Zoho! Invoice #${response.invoice.invoice_number}`
        );
        
        // Also save to local database
        await createInvoiceMutation.mutateAsync({
          client_name: formData.clientName,
          client_email: formData.clientEmail || undefined,
          amount: totalAmount,
          status: "sent", // Mark as sent since it's created in Zoho
          due_date: formData.dueDate,
        });

        // Reset form
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
      } else {
        throw new Error(response.message || "Failed to create invoice in Zoho");
      }
    } catch (error: any) {
      toast.error(`Failed to create invoice in Zoho: ${error.message}`);
    } finally {
      setCreatingInZoho(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Zoho Connection Card */}
      {!isZohoConnected && (
        <ZohoConnection
          onConnected={() => {
            setIsZohoConnected(true);
            checkZohoConnection();
          }}
        />
      )}

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create Invoice</TabsTrigger>
          <TabsTrigger value="zoho">Zoho Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
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
            <div className="space-y-4">
              {formData.lineItems.map((item, index) => (
                <div key={index} className="flex gap-3 items-start p-4 border-2 rounded-lg bg-muted/30 hover:border-accent/50 transition-colors">
                  <div className="flex-1 space-y-3">
                    {/* Description - Full Width */}
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Description</Label>
                      <Input
                        placeholder="Item description or service name"
                        value={item.description}
                        onChange={(e) => updateLineItem(index, "description", e.target.value)}
                        className="w-full"
                      />
                    </div>
                    {/* Quantity, Rate, Amount - Side by Side */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Quantity</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) =>
                            updateLineItem(index, "quantity", parseInt(e.target.value) || 0)
                          }
                          className="w-full text-base"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Rate (₹)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Rate per unit"
                          value={item.rate}
                          onChange={(e) =>
                            updateLineItem(index, "rate", parseFloat(e.target.value) || 0)
                          }
                          className="w-full text-base"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Amount (₹)</Label>
                        <div className="flex items-center h-10 px-3 bg-background border border-input rounded-md text-base font-semibold">
                          ₹{item.amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLineItem(index)}
                    disabled={formData.lineItems.length === 1}
                    className="mt-7"
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
          <div className="space-y-2">
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
            {isZohoConnected && (
              <Button
                onClick={handleCreateInZoho}
                disabled={creatingInZoho || !formData.clientName || formData.lineItems.length === 0}
                variant="default"
                className="w-full"
              >
                {creatingInZoho ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating in Zoho...
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4 mr-2" />
                    Create in Zoho Invoice
                  </>
                )}
              </Button>
            )}
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
              {/* Enhanced Visual Preview */}
              <div className="border-2 border-accent/20 rounded-lg p-8 bg-gradient-to-br from-white to-accent/5 shadow-lg">
                <div className="prose prose-sm max-w-none">
                  {/* Invoice Header */}
                  <div className="border-b-2 border-accent/30 pb-4 mb-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h1 className="text-3xl font-bold text-accent mb-2">INVOICE</h1>
                        {companyInfo && (
                          <div className="space-y-1 text-sm">
                            <p className="font-semibold">{companyInfo.company_name}</p>
                            {companyInfo.gst_number && <p>GST: {companyInfo.gst_number}</p>}
                            {companyInfo.pan_number && <p>PAN: {companyInfo.pan_number}</p>}
                          </div>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-semibold mb-1">Invoice #{previewInvoice.invoiceNumber || 'DRAFT'}</p>
                        <p>Date: {format(new Date(formData.invoiceDate), "MMM dd, yyyy")}</p>
                        <p>Due: {format(new Date(formData.dueDate), "MMM dd, yyyy")}</p>
                      </div>
                    </div>
                  </div>

                  {/* Client Details */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-2">Bill To:</h3>
                    <div className="bg-muted/30 p-3 rounded-md">
                      <p className="font-semibold">{formData.clientName}</p>
                      {formData.clientEmail && <p className="text-sm text-muted-foreground">{formData.clientEmail}</p>}
                      {formData.clientPhone && <p className="text-sm text-muted-foreground">{formData.clientPhone}</p>}
                    </div>
                  </div>

                  {/* Line Items Table */}
                  <div className="mb-6">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-accent/10 border-b-2 border-accent/30">
                          <th className="text-left p-3 font-semibold">Description</th>
                          <th className="text-center p-3 font-semibold">Qty</th>
                          <th className="text-right p-3 font-semibold">Rate</th>
                          <th className="text-right p-3 font-semibold">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.lineItems.map((item, idx) => (
                          <tr key={idx} className="border-b border-border">
                            <td className="p-3">{item.description || "Item description"}</td>
                            <td className="p-3 text-center">{item.quantity}</td>
                            <td className="p-3 text-right">₹{item.rate.toFixed(2)}</td>
                            <td className="p-3 text-right font-semibold">₹{item.amount.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals */}
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>GST ({formData.gstPercentage}%):</span>
                        <span className="font-semibold">₹{gstAmount.toFixed(2)}</span>
                      </div>
                      <div className="border-t-2 border-accent/30 pt-2 flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-accent">₹{totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Terms */}
                  <div className="mt-8 pt-4 border-t border-border text-xs text-muted-foreground">
                    <p className="font-semibold mb-1">Payment Terms:</p>
                    <p>Payment is due within 30 days. Thank you for your business!</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Button onClick={handleDownloadPDF} variant="default">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button onClick={handlePrintInvoice} variant="outline">
                  Print
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
      </TabsContent>

      <TabsContent value="zoho">
        <ZohoConnection
          onConnected={() => {
            setIsZohoConnected(true);
            checkZohoConnection();
          }}
        />
      </TabsContent>
    </Tabs>
    </div>
  );
}
