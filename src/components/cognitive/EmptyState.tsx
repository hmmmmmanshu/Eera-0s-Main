import { MessageSquare, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getEmptyStateContentData } from "@/lib/bots/emptyStateContent";
import type { BotType } from "@/lib/bots/types";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  botType: BotType;
  onPromptSelect: (prompt: string) => void;
}

const ICON_MAP = {
  MessageSquare,
  Target,
  Zap,
} as const;

export function EmptyState({ botType, onPromptSelect }: EmptyStateProps) {
  const content = getEmptyStateContentData()[botType];

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
      <div className="max-w-md space-y-8">
        {/* Welcome Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">
            {content.welcome}
          </h2>
          {content.subtitle && (
            <p className="text-[15px] text-muted-foreground leading-relaxed">
              {content.subtitle}
            </p>
          )}
        </div>

        {/* Quick Actions */}
        {content.quickActions && content.quickActions.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground/80 mb-4">Try asking:</p>
            <div className="flex flex-col gap-2">
              {content.quickActions.map((action, index) => {
                const Icon = action.iconName ? ICON_MAP[action.iconName] : MessageSquare;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => onPromptSelect(action.prompt)}
                    className={cn(
                      "w-full justify-start gap-3 h-auto py-3 px-4",
                      "text-left text-[15px] font-normal",
                      "border-border hover:bg-muted/50 hover:border-border",
                      "transition-all duration-200"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                    <span className="flex-1">{action.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tips */}
        {content.tips && content.tips.length > 0 && (
          <div className="pt-6 border-t border-border/50">
            <ul className="space-y-2 text-left">
              {content.tips.map((tip, index) => (
                <li key={index} className="text-[13px] text-muted-foreground flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-border mt-1.5 flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

