import { supabase } from "@/integrations/supabase/client";
import type {
  CompanyInfo,
  CompanyType,
  ComplianceRequirement,
  ComplianceTask,
  ComplianceTaskPriority,
} from "@/hooks/useFinanceData";
import { format, addMonths, addDays, startOfMonth, getDaysInMonth } from "date-fns";

/**
 * Calculate next due date based on due_date_rule
 * Example: {"day": 10, "month_offset": 1} = 10th of next month
 */
function calculateNextDueDate(
  rule: { day: number; month_offset: number },
  frequency: "monthly" | "quarterly" | "annual" | "one_time" | "event_based"
): Date {
  const today = new Date();
  let nextDue: Date;

  if (frequency === "monthly") {
    // Next month's rule.day
    nextDue = addMonths(startOfMonth(today), rule.month_offset);
    nextDue.setDate(rule.day);
  } else if (frequency === "quarterly") {
    // Current quarter end + rule.month_offset, then rule.day
    const currentQuarter = Math.floor(today.getMonth() / 3);
    const quarterStartMonth = currentQuarter * 3;
    const quarterStart = new Date(today.getFullYear(), quarterStartMonth, 1);
    nextDue = addMonths(quarterStart, 3 + rule.month_offset); // End of quarter
    nextDue.setDate(rule.day);
  } else if (frequency === "annual") {
    // Same month next year (or rule.month_offset months from FY start)
    // For annual, month_offset typically indicates months from FY start
    const currentYear = today.getFullYear();
    const fyStartMonth = 4; // Assuming April as FY start (can be customized)
    const fyStart = new Date(currentYear, fyStartMonth - 1, 1);
    nextDue = addMonths(fyStart, rule.month_offset);
    nextDue.setDate(rule.day);

    // If date has passed this year, use next year
    if (nextDue < today) {
      nextDue = addMonths(nextDue, 12);
    }
  } else if (frequency === "one_time") {
    // One-time tasks: due date is calculated from registration date or event date
    // For now, set to a future date
    nextDue = addDays(today, 30);
  } else {
    // event_based: Use current date + some days
    nextDue = addDays(today, 30);
  }

  // Ensure day is valid for the month (e.g., Feb 30 -> Feb 28)
  const daysInMonth = getDaysInMonth(nextDue);
  if (rule.day > daysInMonth) {
    nextDue.setDate(daysInMonth);
  }

  return nextDue;
}

/**
 * Calculate priority based on days until due date
 */
function calculatePriority(daysUntilDue: number): ComplianceTaskPriority {
  if (daysUntilDue < 7) return "urgent";
  if (daysUntilDue < 15) return "high";
  if (daysUntilDue < 30) return "medium";
  return "low";
}

/**
 * Generate compliance tasks for a user based on company info and applicable requirements
 */
export async function generateComplianceTasks(
  userId: string,
  companyInfo: CompanyInfo
): Promise<ComplianceTask[]> {
  try {
    // Fetch applicable compliance requirements
    const { data: requirements, error: reqError } = await supabase
      .from("compliance_requirements")
      .select("*")
      .contains("applicable_company_types", [companyInfo.company_type]);

    if (reqError) throw reqError;
    if (!requirements || requirements.length === 0) return [];

    const createdTasks: ComplianceTask[] = [];

    // Filter requirements by thresholds
    const applicableRequirements = (requirements as ComplianceRequirement[]).filter((req) => {
      // Check employee threshold
      if (req.employee_threshold !== null && req.employee_threshold !== undefined) {
        if (companyInfo.number_of_employees < req.employee_threshold) {
          return false;
        }
      }

      // Check turnover threshold (would need to fetch from finance data - for now skip if null)
      // TODO: Integrate with actual turnover data

      return true;
    });

    // Generate tasks for each applicable requirement
    for (const requirement of applicableRequirements) {
      // Skip one_time requirements that are already completed
      if (requirement.frequency === "one_time") {
        const { data: existingTask } = await supabase
          .from("compliance_tasks")
          .select("id")
          .eq("user_id", userId)
          .eq("compliance_requirement_id", requirement.id)
          .eq("status", "completed")
          .maybeSingle();

        if (existingTask) continue; // Skip if already completed
      }

      // Calculate next due date
      const dueDate = calculateNextDueDate(
        requirement.due_date_rule as { day: number; month_offset: number },
        requirement.frequency
      );

      // Check if task already exists for this period
      const periodKey = format(dueDate, "yyyy-MM");
      const { data: existingTask } = await supabase
        .from("compliance_tasks")
        .select("id")
        .eq("user_id", userId)
        .eq("compliance_requirement_id", requirement.id)
        .gte("due_date", `${periodKey}-01`)
        .lt("due_date", `${periodKey}-32`)
        .neq("status", "completed")
        .maybeSingle();

      if (existingTask) continue; // Task already exists for this period

      // Calculate priority
      const daysUntilDue = Math.ceil(
        (dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      const priority = calculatePriority(daysUntilDue);

      // Create task
      const taskTitle =
        requirement.frequency === "annual"
          ? `${requirement.compliance_name} (FY ${new Date().getFullYear()}-${new Date().getFullYear() + 1})`
          : requirement.compliance_name;

      const { data: newTask, error: taskError } = await supabase
        .from("compliance_tasks")
        .insert({
          user_id: userId,
          compliance_requirement_id: requirement.id,
          title: taskTitle,
          description: requirement.description,
          due_date: format(dueDate, "yyyy-MM-dd"),
          status: "upcoming",
          priority,
          ai_reminder_sent: false,
        })
        .select()
        .single();

      if (taskError) {
        console.error(`Error creating task for ${requirement.compliance_name}:`, taskError);
        continue;
      }

      createdTasks.push(newTask as ComplianceTask);
    }

    return createdTasks;
  } catch (error) {
    console.error("Error generating compliance tasks:", error);
    throw error;
  }
}

/**
 * Check for overdue tasks and update their status
 * Also triggers AI reminders for overdue tasks
 */
export async function checkOverdueTasks(userId: string): Promise<{
  updatedCount: number;
  overdueTasks: ComplianceTask[];
}> {
  try {
    const today = format(new Date(), "yyyy-MM-dd");

    // Find upcoming tasks that are now overdue
    const { data: overdueTasks, error: fetchError } = await supabase
      .from("compliance_tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "upcoming")
      .lt("due_date", today);

    if (fetchError) throw fetchError;

    if (!overdueTasks || overdueTasks.length === 0) {
      return { updatedCount: 0, overdueTasks: [] };
    }

    // Update status to overdue
    const taskIds = overdueTasks.map((t) => t.id);
    const { error: updateError } = await supabase
      .from("compliance_tasks")
      .update({ status: "overdue", priority: "urgent" })
      .in("id", taskIds);

    if (updateError) throw updateError;

    // Generate AI reminders for tasks that haven't been sent yet
    // (This will be called by the UI component when needed)

    return {
      updatedCount: taskIds.length,
      overdueTasks: overdueTasks as ComplianceTask[],
    };
  } catch (error) {
    console.error("Error checking overdue tasks:", error);
    throw error;
  }
}

/**
 * Sync employee count from HR Hub
 */
export async function syncEmployeeCount(userId: string): Promise<number> {
  try {
    // Count active employees from hr_employees table
    const { data: employees, error: employeeError } = await supabase
      .from("hr_employees")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active");

    if (employeeError) throw employeeError;

    let employeeCount = employees?.length || 0;

    // If no employees in hr_employees, check for hired candidates
    // (HR Hub might mark candidates as "hired" without creating employees yet)
    if (employeeCount === 0) {
      const { data: hiredCandidates, error: candidateError } = await supabase
        .from("hr_candidates")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "hired");

      if (candidateError) throw candidateError;
      
      employeeCount = hiredCandidates?.length || 0;
    }

    // Check if company_info exists
    const { data: companyInfo } = await supabase
      .from("company_info")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (companyInfo) {
      // Update existing company_info
      const { error: updateError } = await supabase
        .from("company_info")
        .update({ number_of_employees: employeeCount })
        .eq("id", companyInfo.id);

      if (updateError) throw updateError;
    } else {
      // Create company_info if it doesn't exist (with minimal required data)
      const { error: insertError } = await supabase
        .from("company_info")
        .insert({
          user_id: userId,
          number_of_employees: employeeCount,
          company_name: "Your Company",
          company_type: "private_limited",
        });

      if (insertError) throw insertError;
    }

    return employeeCount;
  } catch (error) {
    console.error("Error syncing employee count:", error);
    throw error;
  }
}

/**
 * Re-generate compliance tasks after employee count change
 * (Call this when employee count crosses thresholds)
 */
export async function regenerateTasksAfterEmployeeSync(userId: string): Promise<void> {
  try {
    // Get company info
    const { data: companyInfo, error: companyError } = await supabase
      .from("company_info")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (companyError) throw companyError;
    if (!companyInfo) return;

    // Re-generate tasks
    await generateComplianceTasks(userId, companyInfo as CompanyInfo);
  } catch (error) {
    console.error("Error regenerating tasks after employee sync:", error);
    throw error;
  }
}
