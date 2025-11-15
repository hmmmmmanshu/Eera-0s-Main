import { useState } from "react";
import { Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageActions } from "./MessageActions";
import { MessageTimestamp } from "./MessageTimestamp";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "./MessageList";

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

      <div className={cn("flex flex-col gap-1 max-w-[70%]", isUser ? "items-end" : "items-start")}>
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
                "relative px-4 py-3 rounded-[18px] break-words",
                "text-[15px] leading-relaxed",
                isUser
                  ? "bg-muted text-foreground"
                  : "bg-background border border-border text-foreground",
                isStreaming && "opacity-70"
              )}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
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

