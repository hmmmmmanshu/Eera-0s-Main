import { CheckCircle2, Circle, Clock, MoreVertical, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";

const OpsHubMockup = () => {
  return (
    <div className="w-full h-full flex bg-background">
      {/* Sidebar */}
      <div className="w-56 border-r border-border p-4 space-y-6">
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground mb-3">WORKSPACE</div>
          <div className="space-y-0.5">
            <div className="px-3 py-2 rounded-lg bg-foreground text-background text-sm font-medium">
              All Tasks
            </div>
            <div className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground text-sm cursor-pointer">
              My Tasks
            </div>
            <div className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground text-sm cursor-pointer">
              SOPs
            </div>
            <div className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground text-sm cursor-pointer">
              Automations
            </div>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground mb-3">PROJECTS</div>
          <div className="space-y-0.5">
            <div className="px-3 py-2 rounded-lg text-foreground text-sm flex items-center justify-between">
              Product Launch
              <span className="text-xs text-muted-foreground">12</span>
            </div>
            <div className="px-3 py-2 rounded-lg text-foreground text-sm flex items-center justify-between">
              Customer Support
              <span className="text-xs text-muted-foreground">8</span>
            </div>
            <div className="px-3 py-2 rounded-lg text-foreground text-sm flex items-center justify-between">
              Infrastructure
              <span className="text-xs text-muted-foreground">5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Operations Dashboard</h3>
              <p className="text-sm text-muted-foreground">44 active tasks • 15 automated</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted">
                Filter
              </button>
              <button className="px-4 py-2 rounded-lg bg-foreground text-background text-sm flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Task
              </button>
            </div>
          </div>

          {/* Task Sections */}
          <div className="space-y-4">
            {/* In Progress */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-foreground" />
                <span className="text-sm font-medium">In Progress</span>
                <span className="text-xs text-muted-foreground">8</span>
              </div>
              <div className="space-y-2">
                {[
                  { id: "OPS-248", title: "Update product documentation", priority: "High", assignee: "Auto", progress: 75, project: "Product Launch" },
                  { id: "OPS-250", title: "Customer onboarding flow optimization", priority: "Medium", assignee: "Auto", progress: 45, project: "Customer Support" },
                  { id: "OPS-251", title: "Database backup automation", priority: "High", assignee: "Auto", progress: 90, project: "Infrastructure" },
                ].map((task, i) => (
                  <Card key={i} className="p-4 hover:border-foreground/20 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">{task.id}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-muted text-foreground">
                            {task.project}
                          </span>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            task.priority === 'High' ? 'bg-foreground' : 'bg-muted-foreground'
                          }`} />
                          <span className="text-xs text-muted-foreground">{task.priority}</span>
                        </div>
                        <div className="text-sm font-medium mb-2">{task.title}</div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-foreground transition-all"
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{task.progress}%</span>
                        </div>
                      </div>
                      <button className="p-1 hover:bg-muted rounded ml-4">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* To Do */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Circle className="h-4 w-4 text-foreground" />
                <span className="text-sm font-medium">To Do</span>
                <span className="text-xs text-muted-foreground">12</span>
              </div>
              <div className="space-y-2">
                {[
                  { id: "OPS-249", title: "Weekly report generation setup", priority: "Low", assignee: "Auto", project: "Operations" },
                  { id: "OPS-252", title: "Update security protocols", priority: "Medium", assignee: "Auto", project: "Infrastructure" },
                  { id: "OPS-253", title: "Team onboarding documentation", priority: "Medium", assignee: "Auto", project: "Customer Support" },
                ].map((task, i) => (
                  <Card key={i} className="p-4 hover:border-foreground/20 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">{task.id}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-muted text-foreground">
                            {task.project}
                          </span>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            task.priority === 'High' ? 'bg-foreground' : 'bg-muted-foreground'
                          }`} />
                          <span className="text-xs text-muted-foreground">{task.priority}</span>
                        </div>
                        <div className="text-sm font-medium">{task.title}</div>
                      </div>
                      <button className="p-1 hover:bg-muted rounded ml-4">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Completed */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-foreground" />
                <span className="text-sm font-medium">Done</span>
                <span className="text-xs text-muted-foreground">24</span>
              </div>
              <div className="space-y-2">
                {[
                  { id: "OPS-247", title: "Migrate database to new infrastructure", date: "2 days ago", project: "Infrastructure" },
                  { id: "OPS-246", title: "Set up monitoring dashboards", date: "3 days ago", project: "Operations" },
                ].map((task, i) => (
                  <Card key={i} className="p-4 hover:border-foreground/20 transition-colors cursor-pointer opacity-60">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">{task.id}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-muted text-foreground">
                            {task.project}
                          </span>
                          <span className="text-xs text-muted-foreground">{task.date}</span>
                        </div>
                        <div className="text-sm font-medium line-through">{task.title}</div>
                      </div>
                      <button className="p-1 hover:bg-muted rounded ml-4">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpsHubMockup;
