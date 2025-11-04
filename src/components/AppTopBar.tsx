import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useState } from "react";
import { FeatureRequestDialog } from "@/components/FeatureRequestDialog";

interface AppTopBarProps {
  title: string;
}

export function AppTopBar({ title }: AppTopBarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-6">
        <Link to="/dashboard" className="flex items-center gap-2">
          <img src="/Logo.png" alt="Logo" className="h-11 w-11 object-contain" />
        </Link>
        <Link to="/dashboard" className="text-xl font-semibold text-foreground hover:text-accent transition-colors">
          {title}
        </Link>
        
        <div className="ml-auto flex items-center gap-4">
          <div className="relative w-64 hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full bg-background pl-8"
            />
          </div>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setShowNotifications((v) => !v)}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-accent" />
            </Button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 rounded-md border border-border bg-popover shadow-lg">
                <div className="p-3 border-b border-border font-medium">Notifications</div>
                <div className="p-4 text-sm text-muted-foreground">Nothing here yet.</div>
                <div className="p-3 border-t border-border text-right">
                  <Link to="/profile-settings" className="text-xs text-muted-foreground hover:text-foreground">Manage preferences</Link>
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:block">
            <Button variant="outline" size="sm" onClick={() => setRequestOpen(true)}>Request a feature</Button>
          </div>
          
          <Link to="/profile-settings">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
      <FeatureRequestDialog open={requestOpen} onOpenChange={setRequestOpen} />
    </header>
  );
}
