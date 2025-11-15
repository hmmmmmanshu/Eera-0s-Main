import { useState } from "react";
import { Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageActions } from "./MessageActions";
import { MessageTimestamp } from "./MessageTimestamp";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "./MessageList";

// Format structured messages with styled headers (ChatGPT-style)
function formatStructuredMessage(content: string): React.ReactNode {
  // Remove markdown asterisks from content
  let cleanedContent = content.replace(/\*\*(.*?)\*\*/g, "$1");
  
  // Common section headers for all bots
  const sectionHeaders = [
    "Understanding",
    "Framework & Analysis",
    "Real-World Examples",
    "Action Plan",
    "Key Considerations",
    "I Hear You",
    "What This Might Mean",
    "You're Not Alone",
    "What Might Help",
    "Remember",
    "Summary",
    "Action Items",
    "Priority & Timeline",
    "Next Steps",
    "Notes",
  ];

  // Split content by lines
  const lines = cleanedContent.split("\n");
  const formatted: React.ReactNode[] = [];
  let currentSection: string[] = [];
  let currentHeader: string | null = null;

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    
    // Check if this line is a section header (exact match, case-sensitive)
    // Also check for headers with asterisks that might have been missed
    const headerMatch = sectionHeaders.find(header => 
      trimmedLine === header || 
      trimmedLine === `**${header}**` ||
      trimmedLine.startsWith(header) && trimmedLine.length === header.length
    );
    const isHeader = !!headerMatch;

    if (isHeader) {
      // Use clean header name
      const cleanHeader = headerMatch || trimmedLine.replace(/\*\*/g, "");
      // Save previous section before starting new one
      if (currentHeader && currentSection.length > 0) {
        const sectionContent = currentSection.join("\n").trim();
        if (sectionContent) {
          formatted.push(
            <div key={`section-${formatted.length}-${currentHeader}`} className="mb-5">
              <div className="font-semibold text-[16px] mb-2.5 text-foreground leading-tight">
                {currentHeader}
              </div>
              <div className="text-[15px] leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {sectionContent}
              </div>
            </div>
          );
        }
      }
      // Start new section
      currentHeader = cleanHeader;
      currentSection = [];
    } else {
      // Add to current section content
      currentSection.push(line);
    }
  });

  // Add final section
  if (currentHeader) {
    const sectionContent = currentSection.join("\n").trim();
    if (sectionContent) {
      formatted.push(
        <div key={`section-${formatted.length}-${currentHeader}`} className="mb-5">
          <div className="font-semibold text-[16px] mb-2.5 text-foreground leading-tight">
            {currentHeader}
          </div>
          <div className="text-[15px] leading-relaxed text-foreground/90 whitespace-pre-wrap">
            {sectionContent}
          </div>
        </div>
      );
    }
  }

  // If no structured sections found, return cleaned content
  if (formatted.length === 0) {
    return <div className="text-[15px] leading-relaxed whitespace-pre-wrap">{cleanedContent}</div>;
  }

  return <div>{formatted}</div>;
}

interface MessageProps {
  message: ChatMessage;
  showTimestamp?: boolean;
  onCopy?: () => void;
  onRegenerate?: () => void;
  onEdit?: (newContent: string) => void;
  onDelete?: () => void;
}

export function Message({
  message,
  showTimestamp = false,
  onCopy,
  onRegenerate,
  onEdit,
  onDelete,
}: MessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content);
  const isUser = message.role === "user";
  const isStreaming = message.streaming;
  const isEmpty = !message.content || message.content.trim() === "";

  const handleEditStart = () => {
    setEditValue(message.content);
    setIsEditing(true);
  };

  const handleEditSave = () => {
    if (editValue.trim() && editValue !== message.content && onEdit) {
      onEdit(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditValue(message.content);
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        "group flex gap-3 w-full",
        isUser ? "justify-end" : "justify-start",
        "animate-in fade-in slide-in-from-bottom-2 duration-200"
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <span className="text-xs font-medium text-muted-foreground">AI</span>
        </div>
      )}

      <div className={cn("flex flex-col gap-0.5 max-w-[70%]", isUser ? "items-end" : "items-start")}>
        {isEditing ? (
          <div className="w-full space-y-2">
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleEditSave();
                } else if (e.key === "Escape") {
                  handleEditCancel();
                }
              }}
              className="min-h-[80px] text-sm"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditCancel}
                className="h-8"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleEditSave}
                disabled={!editValue.trim() || editValue === message.content}
                className="h-8"
              >
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div
              className={cn(
                "relative px-3 py-2 rounded-2xl break-words",
                "text-[15px] leading-relaxed",
                isUser
                  ? "bg-muted text-foreground"
                  : "bg-background border border-border text-foreground",
                isStreaming && isEmpty && "min-h-[60px]"
              )}
            >
              {isEmpty && isStreaming ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                  <span className="text-sm italic">Thinking...</span>
                </div>
              ) : (
                <div className="whitespace-pre-wrap prose prose-sm max-w-none">
                  {formatStructuredMessage(message.content)}
                </div>
              )}
              {message.isEdited && (
                <span className="text-[11px] text-muted-foreground/60 ml-2">(edited)</span>
              )}
              <div className="absolute -bottom-6 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MessageActions
                  role={message.role}
                  messageId={message.id}
                  content={message.content}
                  onCopy={onCopy}
                  onRegenerate={isUser ? undefined : onRegenerate}
                  onEdit={isUser ? handleEditStart : undefined}
                  onDelete={onDelete}
                />
              </div>
            </div>

            {showTimestamp && (
              <MessageTimestamp
                timestamp={message.timestamp}
                className={cn("mt-1", isUser ? "text-right" : "text-left")}
              />
            )}
          </>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <span className="text-xs font-medium text-muted-foreground">You</span>
        </div>
      )}
    </div>
  );
}

