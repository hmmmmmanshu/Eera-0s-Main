import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  PlusCircle, 
  BarChart3, 
  Calendar, 
  FileText, 
  FolderOpen, 
  Lightbulb, 
  Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketingHubSidebarProps {
  activeView: "analytics" | "schedule" | "drafts" | "library" | "insights";
  onViewChange: (view: "analytics" | "schedule" | "drafts" | "library" | "insights") => void;
  onCreateClick: () => void;
}

export const MarketingHubSidebar = ({ 
  activeView, 
  onViewChange,
  onCreateClick 
}: MarketingHubSidebarProps) => {
  const navItems = [
    { id: "analytics" as const, icon: BarChart3, label: "Analytics" },
    { id: "schedule" as const, icon: Calendar, label: "Schedule", badge: 3 },
    { id: "drafts" as const, icon: FileText, label: "Drafts", badge: 2 },
    { id: "library" as const, icon: FolderOpen, label: "Library" },
    { id: "insights" as const, icon: Lightbulb, label: "Ideas" },
  ];

  return (
    <aside className="w-64 border-r bg-card/50 backdrop-blur-sm flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold">Marketing</span>
        </div>

        <Button 
          onClick={onCreateClick}
          className="w-full gap-2"
          size="lg"
        >
          <PlusCircle className="w-4 h-4" />
          Create
        </Button>
      </div>

      <Separator />

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeView === item.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3",
                activeView === item.id && "bg-secondary"
              )}
              onClick={() => onViewChange(item.id)}
            >
              <Icon className="w-4 h-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </nav>

      <Separator />

      <div className="p-4">
        <Button variant="ghost" className="w-full justify-start gap-3">
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </div>
    </aside>
  );
};
