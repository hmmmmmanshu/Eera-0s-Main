import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useComplianceTasks,
  useComplianceRequirements,
  useUpdateComplianceTask,
  useCreateComplianceTask,
  type ComplianceTaskStatus,
  type ComplianceTask,
} from "@/hooks/useFinanceData";
import { useCompanyInfo } from "@/hooks/useFinanceData";
import {
  Shield,
  AlertCircle,
  CheckCircle2,
  Clock,
  Calendar,
  FileText,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { toast } from "sonner";
import { generateComplianceTasks, checkOverdueTasks } from "@/lib/virtualCFO";
import { supabase } from "@/integrations/supabase/client";
import { generateComplianceReminder } from "@/lib/gemini";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ComplianceManager() {
  const { data: companyInfo } = useCompanyInfo();
  const { data: tasks = [], isLoading } = useComplianceTasks();
  const { data: requirements } = useComplianceRequirements(companyInfo?.company_type);
  const updateMutation = useUpdateComplianceTask();
  const createMutation = useCreateComplianceTask();
  const [generating, setGenerating] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ComplianceTask | null>(null);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [reminderText, setReminderText] = useState("");
  const [filter, setFilter] = useState<ComplianceTaskStatus | "all">("all");

  // Check overdue tasks on mount
  useEffect(() => {
    const checkOverdue = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      try {
        const result = await checkOverdueTasks(user.id);
        if (result.updatedCount > 0) {
          toast.info(`${result.updatedCount} task(s) marked as overdue`);
        }
      } catch (error) {
        console.error("Error checking overdue tasks:", error);
      }
    };

    checkOverdue();
  }, []);

  const handleGenerateTasks = async () => {
    if (!companyInfo) {
      toast.error("Please complete company setup first");
      return;
    }

    try {
      setGenerating(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const createdTasks = await generateComplianceTasks(user.id, companyInfo);
      toast.success(`Generated ${createdTasks.length} compliance tasks`);
    } catch (error: any) {
      toast.error(`Failed to generate tasks: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkComplete = async (task: ComplianceTask) => {
    await updateMutation.mutateAsync({
      id: task.id,
      updates: {
        status: "completed",
        completed_date: format(new Date(), "yyyy-MM-dd"),
      },
    });
  };

  const handleShowReminder = async (task: ComplianceTask) => {
    try {
      const daysUntilDue = differenceInDays(new Date(task.due_date), new Date());
      const reminder = await generateComplianceReminder(
        {
          title: task.title,
          description: task.description,
          dueDate: task.due_date,
          priority: task.priority,
        },
        daysUntilDue
      );
      setReminderText(reminder);
      setSelectedTask(task);
      setShowReminderDialog(true);
    } catch (error: any) {
      toast.error(`Failed to generate reminder: ${error.message}`);
    }
  };

  const filteredTasks =
    filter === "all"
      ? tasks
      : tasks.filter((task) => task.status === filter);

  const tasksByPriority = {
    urgent: filteredTasks.filter((t) => t.priority === "urgent"),
    high: filteredTasks.filter((t) => t.priority === "high"),
    medium: filteredTasks.filter((t) => t.priority === "medium"),
    low: filteredTasks.filter((t) => t.priority === "low"),
  };

  const getStatusIcon = (status: ComplianceTaskStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      urgent: "destructive",
      high: "default",
      medium: "secondary",
      low: "outline",
    };
    return variants[priority] || "secondary";
  };

  const stats = {
    total: tasks.length,
    upcoming: tasks.filter((t) => t.status === "upcoming").length,
    overdue: tasks.filter((t) => t.status === "overdue").length,
    completed: tasks.filter((t) => t.status === "completed").length,
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-accent" />
                Virtual CFO - Compliance Dashboard
              </CardTitle>
              <CardDescription>
                Automated compliance task tracking based on your company type
              </CardDescription>
            </div>
            <Button
              onClick={handleGenerateTasks}
              disabled={generating || !companyInfo}
              className="gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Tasks
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-accent/10 rounded-lg">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Tasks</p>
            </div>
            <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
              <p className="text-2xl font-bold text-yellow-500">{stats.upcoming}</p>
              <p className="text-xs text-muted-foreground">Upcoming</p>
            </div>
            <div className="text-center p-4 bg-red-500/10 rounded-lg">
              <p className="text-2xl font-bold text-red-500">{stats.overdue}</p>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </div>
            <div className="text-center p-4 bg-green-500/10 rounded-lg">
              <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <Tabs value={filter} onValueChange={(v) => setFilter(v as ComplianceTaskStatus | "all")}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="mt-6">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No compliance tasks found</p>
                  {!companyInfo && (
                    <p className="text-sm mt-2">
                      Complete company setup to generate compliance tasks
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Group by Priority */}
                  {["urgent", "high", "medium", "low"].map((priority) => {
                    const priorityTasks = tasksByPriority[priority as keyof typeof tasksByPriority];
                    if (priorityTasks.length === 0) return null;

                    return (
                      <div key={priority} className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground capitalize">
                          {priority} Priority ({priorityTasks.length})
                        </h3>
                        {priorityTasks.map((task) => {
                          const daysUntilDue = differenceInDays(
                            new Date(task.due_date),
                            new Date()
                          );
                          const isOverdue = daysUntilDue < 0;

                          return (
                            <Card
                              key={task.id}
                              className={`border-l-4 ${
                                task.status === "overdue"
                                  ? "border-l-red-500"
                                  : task.status === "completed"
                                  ? "border-l-green-500"
                                  : task.priority === "urgent"
                                  ? "border-l-orange-500"
                                  : "border-l-blue-500"
                              }`}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                      {getStatusIcon(task.status)}
                                      <h4 className="font-semibold">{task.title}</h4>
                                      <Badge variant={getPriorityBadge(task.priority)}>
                                        {task.priority}
                                      </Badge>
                                      {task.status === "overdue" && (
                                        <Badge variant="destructive">Overdue</Badge>
                                      )}
                                    </div>

                                    {task.description && (
                                      <p className="text-sm text-muted-foreground">
                                        {task.description}
                                      </p>
                                    )}

                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Due: {format(new Date(task.due_date), "MMM dd, yyyy")}
                                      </div>
                                      {!task.completed_date && (
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          {isOverdue
                                            ? `${Math.abs(daysUntilDue)} days overdue`
                                            : `${daysUntilDue} days remaining`}
                                        </div>
                                      )}
                                      {task.compliance_requirement && (
                                        <Badge variant="outline" className="text-xs">
                                          {task.compliance_requirement.compliance_type}
                                        </Badge>
                                      )}
                                    </div>

                                    {task.notes && (
                                      <div className="mt-2 p-2 bg-accent/10 rounded text-xs">
                                        <p className="font-semibold mb-1">Notes:</p>
                                        <p>{task.notes}</p>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex gap-2 ml-4">
                                    {task.status !== "completed" && (
                                      <>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleShowReminder(task)}
                                        >
                                          <FileText className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="default"
                                          size="sm"
                                          onClick={() => handleMarkComplete(task)}
                                          disabled={updateMutation.isPending}
                                        >
                                          Mark Complete
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Reminder Dialog */}
      <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compliance Reminder</DialogTitle>
            <DialogDescription>
              AI-generated reminder for {selectedTask?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reminder Text</Label>
              <Textarea
                value={reminderText}
                onChange={(e) => setReminderText(e.target.value)}
                rows={5}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  // Copy to clipboard
                  navigator.clipboard.writeText(reminderText);
                  toast.success("Reminder copied to clipboard");
                }}
              >
                Copy
              </Button>
              <Button
                onClick={() => {
                  if (selectedTask) {
                    updateMutation.mutate({
                      id: selectedTask.id,
                      updates: { ai_reminder_sent: true },
                    });
                    setShowReminderDialog(false);
                  }
                }}
              >
                Mark as Sent
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
