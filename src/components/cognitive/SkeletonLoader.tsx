import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  variant?: "message" | "conversation" | "text";
  className?: string;
}

export function SkeletonLoader({ variant = "message", className }: SkeletonLoaderProps) {
  if (variant === "message") {
    return (
      <div className={cn("flex gap-3 animate-pulse", className)}>
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (variant === "conversation") {
    return (
      <div className={cn("space-y-2 animate-pulse", className)}>
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-2/3" />
      </div>
    );
  }

  if (variant === "text") {
    return (
      <div className={cn("space-y-2 animate-pulse", className)}>
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-5/6" />
        <div className="h-4 bg-muted rounded w-4/6" />
      </div>
    );
  }

  return (
    <div className={cn("animate-pulse bg-muted rounded", className)}>
      <div className="h-full w-full bg-gradient-to-r from-transparent via-muted/50 to-transparent" />
    </div>
  );
}

