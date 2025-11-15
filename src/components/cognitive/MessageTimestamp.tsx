import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek } from "date-fns";

interface MessageTimestampProps {
  timestamp: Date | string;
  className?: string;
}

export function MessageTimestamp({ timestamp, className }: MessageTimestampProps) {
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;

  const formatTimestamp = (date: Date): string => {
    if (isToday(date)) {
      return format(date, "h:mm a");
    }
    if (isYesterday(date)) {
      return `Yesterday ${format(date, "h:mm a")}`;
    }
    if (isThisWeek(date)) {
      return format(date, "EEEE h:mm a");
    }
    return format(date, "MMM d, h:mm a");
  };

  return (
    <time
      dateTime={date.toISOString()}
      className={`text-[11px] text-muted-foreground/60 font-normal ${className || ""}`}
      title={format(date, "PPpp")}
    >
      {formatTimestamp(date)}
    </time>
  );
}

