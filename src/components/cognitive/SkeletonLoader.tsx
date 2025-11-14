import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SkeletonLoaderProps {
  variant: 'message' | 'conversation' | 'tab' | 'input' | 'generic';
  align?: 'left' | 'right'; // For message variant
  count?: number; // How many skeletons to show
  className?: string;
}

export function SkeletonLoader({
  variant,
  align = 'left',
  count = 1,
  className,
}: SkeletonLoaderProps) {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      {skeletons.map((index) => (
        <SkeletonItem
          key={index}
          variant={variant}
          align={align}
          className={className}
          delay={index * 0.1}
        />
      ))}
    </>
  );
}

function SkeletonItem({
  variant,
  align,
  className,
  delay = 0,
}: {
  variant: SkeletonLoaderProps['variant'];
  align: 'left' | 'right';
  className?: string;
  delay?: number;
}) {
  switch (variant) {
    case 'message':
      return <MessageSkeleton align={align} className={className} delay={delay} />;
    case 'conversation':
      return <ConversationSkeleton className={className} delay={delay} />;
    case 'tab':
      return <TabSkeleton className={className} delay={delay} />;
    case 'input':
      return <InputSkeleton className={className} delay={delay} />;
    case 'generic':
      return <GenericSkeleton className={className} delay={delay} />;
    default:
      return <GenericSkeleton className={className} delay={delay} />;
  }
}

// Message skeleton (mimics message bubble)
function MessageSkeleton({
  align,
  className,
  delay,
}: {
  align: 'left' | 'right';
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay }}
      className={cn(
        "flex",
        align === 'right' ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] sm:max-w-[75%] px-3 py-2 rounded-lg",
          "bg-muted/50 border border-border/30",
          "relative overflow-hidden",
          align === 'right' && "bg-accent/30",
          className
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
        <div className="space-y-2 relative z-10">
          <div className="h-3 rounded w-3/4 bg-muted-foreground/10" />
          <div className="h-3 rounded w-1/2 bg-muted-foreground/10" />
        </div>
      </div>
    </motion.div>
  );
}

// Conversation skeleton (mimics conversation item)
function ConversationSkeleton({
  className,
  delay,
}: {
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay }}
      className={cn(
        "p-3 rounded-lg border border-border/30",
        "bg-muted/50 relative overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
      <div className="space-y-2 relative z-10">
        {/* Title line */}
        <div className="h-4 rounded w-3/4 bg-muted-foreground/10" />
        {/* Preview line */}
        <div className="h-3 rounded w-full bg-muted-foreground/10" />
        {/* Timestamp line */}
        <div className="h-2 rounded w-1/3 bg-muted-foreground/10" />
      </div>
    </motion.div>
  );
}

// Tab skeleton
function TabSkeleton({
  className,
  delay,
}: {
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay }}
      className={cn(
        "h-8 rounded-t-lg px-4",
        "bg-muted/50 relative overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
      <div className="h-4 rounded w-20 mt-2 bg-muted-foreground/10 relative z-10" />
    </motion.div>
  );
}

// Input skeleton
function InputSkeleton({
  className,
  delay,
}: {
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay }}
      className={cn(
        "h-9 rounded-lg",
        "bg-muted/50 relative overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
    </motion.div>
  );
}

// Generic skeleton
function GenericSkeleton({
  className,
  delay,
}: {
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay }}
      className={cn(
        "rounded-md",
        "bg-muted/50 relative overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
    </motion.div>
  );
}

