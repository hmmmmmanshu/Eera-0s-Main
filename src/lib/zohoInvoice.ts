/**
 * Zoho Invoice API Integration
 * 
 * Documentation: https://www.zoho.com/invoice/api/v3/introduction/#overview
 * API Base URL: https://www.zohoapis.com/invoice/v3 (or .eu, .in, .com.au, etc.)
 */

import { supabase } from "@/integrations/supabase/client";

export interface ZohoOAuthTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  organization_id?: string;
}

export interface ZohoInvoiceItem {
  name: string;
  description?: string;
  rate: number;
  quantity: number;
  item_total: number;
  tax_id?: string;
}

export interface ZohoInvoice {
  customer_id?: string;
  customer_name: string;
  contact_persons?: string[];
  invoice_number?: string;
  reference_number?: string;
  date: string; // YYYY-MM-DD
  payment_terms?: number; // days
  payment_terms_label?: string;
  due_date: string; // YYYY-MM-DD
  currency_code: string;
  exchange_rate?: number;
  line_items: ZohoInvoiceItem[];
  billing_address?: {
    address?: string;
    street2?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  shipping_address?: {
    address?: string;
    street2?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  notes?: string;
  terms?: string;
  custom_fields?: Array<{
    value: string;
    label: string;
  }>;
  template_id?: string;
  attachments?: string[];
  payment_options?: {
    payment_gateways?: Array<{
      gateway_name: string;
      gateway_account_id?: string;
    }>;
  };
}

export interface ZohoInvoiceResponse {
  code: number;
  message: string;
  invoice?: {
    invoice_id: string;
    invoice_number: string;
    date: string;
    status: string;
    customer_id: string;
    customer_name: string;
    total: number;
    currency_code: string;
    invoice_url: string;
  };
}

/**
 * Get Zoho OAuth tokens for user
 */
export async function getZohoTokens(userId: string): Promise<ZohoOAuthTokens | null> {
  const { data, error } = await supabase
    .from("zoho_integrations")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;

  // Check if token is expired
  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
    // Try to refresh token
    if (data.refresh_token) {
      try {
        const refreshed = await refreshZohoToken(userId, data.refresh_token);
        return refreshed;
      } catch (error) {
        console.error("Failed to refresh Zoho token:", error);
        return null;
      }
    }
    return null;
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: new Date(data.expires_at).getTime(),
    organization_id: data.organization_id,
  };
}

/**
 * Save Zoho OAuth tokens for user
 */
export async function saveZohoTokens(
  userId: string,
  tokens: ZohoOAuthTokens
): Promise<void> {
  const { error } = await supabase.from("zoho_integrations").upsert({
    user_id: userId,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: new Date(tokens.expires_at).toISOString(),
    organization_id: tokens.organization_id,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
}

/**
 * Refresh Zoho access token using refresh token
 */
async function refreshZohoToken(
  userId: string,
  refreshToken: string
): Promise<ZohoOAuthTokens | null> {
  // This should be done server-side for security
  // For now, we'll return null and require re-authentication
  // TODO: Implement server-side refresh token endpoint
  console.warn("Token refresh not implemented - requires server-side endpoint");
  return null;
}

/**
 * Get Zoho API base URL based on data center
 * Defaults to .com, but can be configured per user
 */
function getZohoApiBaseUrl(dataCenter: string = "com"): string {
  const domainMap: Record<string, string> = {
    com: "https://www.zohoapis.com",
    eu: "https://www.zohoapis.eu",
    in: "https://www.zohoapis.in",
    "com.au": "https://www.zohoapis.com.au",
    jp: "https://www.zohoapis.jp",
    ca: "https://www.zohoapis.ca",
    "com.cn": "https://www.zohoapis.com.cn",
    sa: "https://www.zohoapis.sa",
  };

  const baseUrl = domainMap[dataCenter] || domainMap.com;
  return `${baseUrl}/invoice/v3`;
}

/**
 * Make authenticated request to Zoho Invoice API
 */
async function zohoApiRequest(
  userId: string,
  endpoint: string,
  method: string = "GET",
  body?: any,
  dataCenter: string = "com"
): Promise<any> {
  const tokens = await getZohoTokens(userId);
  if (!tokens || !tokens.access_token) {
    throw new Error("Zoho not connected. Please connect your Zoho account first.");
  }

  const baseUrl = getZohoApiBaseUrl(dataCenter);
  let url = `${baseUrl}${endpoint}`;

  const headers: HeadersInit = {
    Authorization: `Zoho-oauthtoken ${tokens.access_token}`,
    "Content-Type": "application/json",
  };

  // Add organization_id if available
  if (tokens.organization_id) {
    url = url.includes("?") 
      ? `${url}&organization_id=${tokens.organization_id}`
      : `${url}?organization_id=${tokens.organization_id}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (data.code !== 0 && data.code !== 6000) {
    // 6000 is "success" for some operations
    throw new Error(data.message || "Zoho API error");
  }

  return data;
}

/**
 * Get list of organizations
 */
export async function getZohoOrganizations(userId: string): Promise<any[]> {
  const data = await zohoApiRequest(userId, "/organizations");
  return data.organizations || [];
}

/**
 * Create a contact (customer) in Zoho Invoice
 */
export async function createZohoContact(
  userId: string,
  contactData: {
    contact_name: string;
    company_name?: string;
    email?: string;
    phone?: string;
    billing_address?: {
      address?: string;
      city?: string;
      state?: string;
      zip?: string;
      country?: string;
    };
  }
): Promise<string> {
  const response = await zohoApiRequest(userId, "/contacts", "POST", contactData);
  return response.contact?.contact_id || response.contact_id;
}

/**
 * Find or create a contact in Zoho Invoice
 */
export async function findOrCreateZohoContact(
  userId: string,
  contactData: {
    contact_name: string;
    company_name?: string;
    email?: string;
    phone?: string;
  }
): Promise<string> {
  try {
    // Try to find existing contact by email
    if (contactData.email) {
      const searchResponse = await zohoApiRequest(
        userId,
        `/contacts?search_text=${encodeURIComponent(contactData.email)}`,
        "GET"
      );
      
      if (searchResponse.contacts && searchResponse.contacts.length > 0) {
        return searchResponse.contacts[0].contact_id;
      }
    }

    // Create new contact
    return await createZohoContact(userId, contactData);
  } catch (error) {
    console.error("Error finding/creating Zoho contact:", error);
    throw error;
  }
}

/**
 * Create an invoice in Zoho Invoice
 */
export async function createZohoInvoice(
  userId: string,
  invoice: ZohoInvoice
): Promise<ZohoInvoiceResponse> {
  // First, find or create the customer
  let customerId: string | undefined;
  
  try {
    customerId = await findOrCreateZohoContact(userId, {
      contact_name: invoice.customer_name,
      email: invoice.billing_address?.address || undefined,
      phone: undefined,
    });
  } catch (error) {
    console.warn("Could not create/find customer, proceeding without customer_id:", error);
  }

  const invoicePayload: any = {
    ...invoice,
    customer_id: customerId || undefined,
    line_items: invoice.line_items.map((item) => ({
      name: item.name,
      description: item.description,
      rate: item.rate,
      quantity: item.quantity,
      item_total: item.item_total,
      tax_id: item.tax_id,
    })),
  };

  const response = await zohoApiRequest(userId, "/invoices", "POST", invoicePayload);
  return response;
}

/**
 * List invoices from Zoho
 */
export async function listZohoInvoices(
  userId: string,
  options?: {
    page?: number;
    per_page?: number;
    sort_column?: string;
    sort_order?: "ascending" | "descending";
    status?: string;
  }
): Promise<any> {
  let endpoint = "/invoices";
  const params = new URLSearchParams();
  
  if (options?.page) params.append("page", options.page.toString());
  if (options?.per_page) params.append("per_page", options.per_page.toString());
  if (options?.sort_column) params.append("sort_column", options.sort_column);
  if (options?.sort_order) params.append("sort_order", options.sort_order);
  if (options?.status) params.append("status", options.status);

  if (params.toString()) {
    endpoint += `?${params.toString()}`;
  }

  return await zohoApiRequest(userId, endpoint);
}

/**
 * Get a specific invoice from Zoho
 */
export async function getZohoInvoice(
  userId: string,
  invoiceId: string
): Promise<any> {
  return await zohoApiRequest(userId, `/invoices/${invoiceId}`);
}

/**
 * Mark invoice as sent in Zoho
 */
export async function markZohoInvoiceAsSent(
  userId: string,
  invoiceId: string
): Promise<any> {
  return await zohoApiRequest(userId, `/invoices/${invoiceId}/status/sent`, "POST");
}

/**
 * Email invoice to customer via Zoho
 */
export async function emailZohoInvoice(
  userId: string,
  invoiceId: string,
  options?: {
    send_from_org_email_id?: boolean;
    customer_id?: string;
    email_ids?: string[];
    subject?: string;
    body?: string;
  }
): Promise<any> {
  return await zohoApiRequest(
    userId,
    `/invoices/${invoiceId}/email`,
    "POST",
    options
  );
}

