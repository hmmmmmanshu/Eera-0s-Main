/**
 * Central Finance Data Sync Service
 * 
 * This service handles automatic synchronization of financial data across the system:
 * - When invoices are paid → updates runway cash balance
 * - When income/grants are added → updates runway cash balance
 * - When expenses are added → updates runway burn rate
 * - When payroll is paid → updates runway burn rate
 * - Auto-calculates monthly burn rate from expenses + payroll
 * - Syncs all data to cash flow automatically
 */

import { supabase } from "@/integrations/supabase/client";
import { syncCashFlow } from "./virtualCFO";

/**
 * Calculate total monthly burn rate from expenses and payroll
 */
export async function calculateMonthlyBurnRate(userId: string): Promise<number> {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get expenses for current month
    const { data: expenses, error: expenseError } = await supabase
      .from("finance_expenses")
      .select("amount, expense_date")
      .eq("user_id", userId)
      .gte("expense_date", monthStart.toISOString().split("T")[0])
      .lte("expense_date", monthEnd.toISOString().split("T")[0]);

    if (expenseError && expenseError.code !== "PGRST116") throw expenseError;

    // Get payroll for current month (paid or processed)
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const { data: payroll, error: payrollError } = await supabase
      .from("hr_payroll")
      .select("net_pay, gross_pay")
      .eq("user_id", userId)
      .eq("pay_period", currentMonth)
      .in("status", ["paid", "processed"]);

    if (payrollError && payrollError.code !== "PGRST116") throw payrollError;

    // Calculate totals
    const expenseTotal = expenses?.reduce((sum, exp) => sum + Number(exp.amount || 0), 0) || 0;
    const payrollTotal = payroll?.reduce((sum, pay) => sum + Number(pay.net_pay || pay.gross_pay || 0), 0) || 0;

    // Average burn rate from last 3 months if available
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    
    const { data: allExpenses, error: allExpensesError } = await supabase
      .from("finance_expenses")
      .select("amount, expense_date")
      .eq("user_id", userId)
      .gte("expense_date", threeMonthsAgo.toISOString().split("T")[0]);

    if (allExpensesError && allExpensesError.code !== "PGRST116") throw allExpensesError;

    const { data: allPayroll, error: allPayrollError } = await supabase
      .from("hr_payroll")
      .select("net_pay, gross_pay, pay_period")
      .eq("user_id", userId)
      .in("status", ["paid", "processed"])
      .gte("pay_period", `${threeMonthsAgo.getFullYear()}-${String(threeMonthsAgo.getMonth() + 1).padStart(2, "0")}`);

    if (allPayrollError && allPayrollError.code !== "PGRST116") throw allPayrollError;

    // Calculate 3-month average
    const threeMonthExpenseTotal = allExpenses?.reduce((sum, exp) => sum + Number(exp.amount || 0), 0) || 0;
    const threeMonthPayrollTotal = allPayroll?.reduce((sum, pay) => sum + Number(pay.net_pay || pay.gross_pay || 0), 0) || 0;
    const threeMonthAverage = (threeMonthExpenseTotal + threeMonthPayrollTotal) / 3;

    // Use current month if higher, otherwise use average (conservative estimate)
    const currentMonthBurn = expenseTotal + payrollTotal;
    return Math.max(currentMonthBurn, threeMonthAverage);
  } catch (error) {
    console.error("Error calculating monthly burn rate:", error);
    return 0;
  }
}

/**
 * Calculate current cash balance from all financial transactions
 */
export async function calculateCashBalance(userId: string): Promise<number> {
  try {
    // Get all paid invoices (inflow)
    const { data: invoices, error: invoiceError } = await supabase
      .from("finance_invoices")
      .select("amount")
      .eq("user_id", userId)
      .eq("status", "paid");

    if (invoiceError && invoiceError.code !== "PGRST116") throw invoiceError;

    // Get signed sales quotes (inflow)
    const { data: salesQuotes, error: salesError } = await supabase
      .from("sales_quotes")
      .select("value")
      .eq("user_id", userId)
      .eq("status", "signed");

    if (salesError && salesError.code !== "PGRST116") throw salesError;

    // Get all manual income (inflow)
    const { data: income, error: incomeError } = await supabase
      .from("finance_income")
      .select("amount")
      .eq("user_id", userId);

    if (incomeError && incomeError.code !== "PGRST116") throw incomeError;

    // Get all expenses (outflow)
    const { data: expenses, error: expenseError } = await supabase
      .from("finance_expenses")
      .select("amount")
      .eq("user_id", userId);

    if (expenseError && expenseError.code !== "PGRST116") throw expenseError;

    // Get all paid payroll (outflow)
    const { data: payroll, error: payrollError } = await supabase
      .from("hr_payroll")
      .select("net_pay, gross_pay")
      .eq("user_id", userId)
      .eq("status", "paid");

    if (payrollError && payrollError.code !== "PGRST116") throw payrollError;

    // Calculate totals
    const invoiceTotal = invoices?.reduce((sum, inv) => sum + Number(inv.amount || 0), 0) || 0;
    const salesTotal = salesQuotes?.reduce((sum, q) => sum + Number(q.value || 0), 0) || 0;
    const incomeTotal = income?.reduce((sum, inc) => sum + Number(inc.amount || 0), 0) || 0;
    const expenseTotal = expenses?.reduce((sum, exp) => sum + Number(exp.amount || 0), 0) || 0;
    const payrollTotal = payroll?.reduce((sum, pay) => sum + Number(pay.net_pay || pay.gross_pay || 0), 0) || 0;

    // Cash balance = Inflows - Outflows
    const cashBalance = invoiceTotal + salesTotal + incomeTotal - expenseTotal - payrollTotal;

    return Math.max(0, cashBalance); // Don't go negative
  } catch (error) {
    console.error("Error calculating cash balance:", error);
    return 0;
  }
}

/**
 * Sync runway data (cash balance + burn rate)
 * Only updates if calculated value is non-zero, preserving manual entries
 */
export async function syncRunway(userId: string, preserveManualValues: boolean = true): Promise<void> {
  try {
    const calculatedCashBalance = await calculateCashBalance(userId);
    const calculatedBurnRate = await calculateMonthlyBurnRate(userId);

    // Check if runway exists
    const { data: existing } = await supabase
      .from("finance_runway")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      // If preserving manual values, only update if:
      // 1. Calculated value is > 0 AND existing value is 0 (first time sync)
      // 2. OR if preserveManualValues is false (force sync)
      const shouldUpdateCashBalance = !preserveManualValues || 
        (calculatedCashBalance > 0 && (!existing.cash_balance || Number(existing.cash_balance) === 0));
      
      const shouldUpdateBurnRate = !preserveManualValues || 
        (calculatedBurnRate > 0 && (!existing.monthly_burn_rate || Number(existing.monthly_burn_rate) === 0));

      if (shouldUpdateCashBalance || shouldUpdateBurnRate) {
        const updateData: any = {};
        if (shouldUpdateCashBalance) updateData.cash_balance = calculatedCashBalance;
        if (shouldUpdateBurnRate) updateData.monthly_burn_rate = calculatedBurnRate;

        const { error } = await supabase
          .from("finance_runway")
          .update(updateData)
          .eq("id", existing.id);

        if (error) throw error;
      }
    } else {
      // Create new only if we have calculated values
      if (calculatedCashBalance > 0 || calculatedBurnRate > 0) {
        const { error } = await supabase
          .from("finance_runway")
          .insert({
            user_id: userId,
            cash_balance: calculatedCashBalance || 0,
            monthly_burn_rate: calculatedBurnRate || 0,
          });

        if (error) throw error;
      }
    }
  } catch (error) {
    console.error("Error syncing runway:", error);
    throw error;
  }
}

/**
 * Complete finance data sync - updates runway, cash flow, and all related metrics
 */
export async function syncAllFinanceData(userId: string): Promise<void> {
  try {
    // 1. Sync runway (cash balance + burn rate)
    await syncRunway(userId);

    // 2. Sync cash flow
    await syncCashFlow(userId, 6);

    // Invalidate queries will be handled by the components
  } catch (error) {
    console.error("Error syncing all finance data:", error);
    throw error;
  }
}

/**
 * Sync when invoice status changes to 'paid'
 */
export async function syncOnInvoicePaid(userId: string): Promise<void> {
  await syncAllFinanceData(userId);
}

/**
 * Sync when income/grant is added
 */
export async function syncOnIncomeAdded(userId: string): Promise<void> {
  await syncAllFinanceData(userId);
}

/**
 * Sync when expense is added
 */
export async function syncOnExpenseAdded(userId: string): Promise<void> {
  await syncAllFinanceData(userId);
}

/**
 * Sync when payroll is paid
 */
export async function syncOnPayrollPaid(userId: string): Promise<void> {
  await syncAllFinanceData(userId);
}

