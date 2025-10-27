import { cn } from "@/lib/utils";
import { AnimatedList } from "@/components/ui/animated-list";

interface Item {
  name: string;
  description: string;
  icon: string;
  color: string;
  time: string;
}

let notifications = [
  {
    name: "Marketing Post Published",
    description: "LinkedIn carousel live",
    time: "2m ago",
    icon: "📊",
    color: "hsl(var(--hub-marketing))",
  },
  {
    name: "Finance Update",
    description: "Runway extended by 2 months",
    time: "5m ago",
    icon: "💰",
    color: "hsl(var(--hub-finance))",
  },
  {
    name: "Ops Automation",
    description: "Task completed successfully",
    time: "8m ago",
    icon: "⚙️",
    color: "hsl(var(--hub-ops))",
  },
  {
    name: "New Candidate",
    description: "Senior Engineer applied",
    time: "12m ago",
    icon: "👤",
    color: "hsl(var(--hub-hiring))",
  },
  {
    name: "Sales Closed",
    description: "Deal worth $25K closed",
    time: "15m ago",
    icon: "🎯",
    color: "hsl(var(--hub-sales))",
  },
];

notifications = Array.from({ length: 10 }, () => notifications).flat();

const Notification = ({ name, description, icon, color, time }: Item) => {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-xl p-4",
        "transition-all duration-200 ease-in-out hover:scale-[103%]",
        "bg-card border border-border"
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          <span>{icon}</span>
        </div>
        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center whitespace-pre text-sm font-medium">
            <span className="text-sm sm:text-base">{name}</span>
            <span className="mx-1">·</span>
            <span className="text-xs text-muted-foreground">{time}</span>
          </figcaption>
          <p className="text-sm font-normal text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </figure>
  );
};

export default function AnimatedListDemo({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex h-[400px] w-full flex-col overflow-hidden rounded-lg",
        className
      )}
    >
      <AnimatedList delay={2000}>
        {notifications.map((item, idx) => (
          <Notification {...item} key={idx} />
        ))}
      </AnimatedList>
    </div>
  );
}
