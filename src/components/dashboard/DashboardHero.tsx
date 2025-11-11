import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const DashboardHero = () => {
  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tight">
            Your Founder&apos;s Office - <span className="bg-gradient-to-r from-primary to-hub-marketing bg-clip-text text-transparent">Live</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            One view of your entire startup. Marketing. Finance. Ops. Hiring. Sales.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="font-mono text-sm text-muted-foreground">
            <div>{formattedDate}</div>
            <div>{formattedTime}</div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardHero;
