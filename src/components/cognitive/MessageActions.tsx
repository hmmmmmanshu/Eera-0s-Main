import { useState } from "react";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/hooks/useBotChat";

interface MessageActionsProps {
  message: ChatMessage;
  messageIndex: number;
  onCopy: () => void;
  onRegenerate?: () => void; // Assistant only
  onEdit?: (newContent: string) => void; // User only
  onDelete: () => void;
  position?: 'left' | 'right'; // Based on message alignment
  isStreaming?: boolean;
  onEditStart?: () => void; // Called when edit mode starts
  onEditCancel?: () => void; // Called when edit is cancelled
}

export function MessageActions({
  message,
  messageIndex,
  onCopy,
  onRegenerate,
  onEdit,
  onDelete,
  position = 'right',
  isStreaming = false,
  onEditStart,
  onEditCancel,
}: MessageActionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast.success("Copied to clipboard");
      onCopy();
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy message");
    }
  };

  const handleEdit = () => {
    if (message.role === 'user' && onEdit) {
      setIsEditing(true);
      setEditValue(message.content);
      onEditStart?.();
    }
  };

  const handleSaveEdit = () => {
    if (onEdit && editValue.trim() && editValue !== message.content) {
      onEdit(editValue.trim());
    }
    setIsEditing(false);
    onEditCancel?.();
  };

  const handleCancelEdit = () => {
    setEditValue(message.content);
    setIsEditing(false);
    onEditCancel?.();
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      onDelete();
      toast.success("Message deleted");
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Failed to delete message");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRegenerate = async () => {
    if (onRegenerate) {
      try {
        await onRegenerate();
        toast.success("Regenerating response...");
      } catch (error) {
        console.error("Failed to regenerate:", error);
        toast.error("Failed to regenerate response");
      }
    }
  };

  // Don't show actions while streaming
  if (isStreaming) {
    return null;
  }

  // Edit mode for user messages
  if (isEditing && message.role === 'user') {
    return (
      <div className={cn(
        "flex items-start gap-2 p-2 rounded-lg border bg-background",
        position === 'right' ? "ml-auto max-w-[85%] sm:max-w-[75%]" : "mr-auto max-w-[85%] sm:max-w-[75%]"
      )}>
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSaveEdit();
            } else if (e.key === 'Escape') {
              handleCancelEdit();
            }
          }}
          className="flex-1 text-[14px]"
          autoFocus
        />
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSaveEdit}
            className="h-8 w-8 p-0"
            disabled={!editValue.trim() || editValue === message.content}
          >
            <DynamicIcon name="Check" className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancelEdit}
            className="h-8 w-8 p-0"
          >
            <DynamicIcon name="X" className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
            "hover:bg-muted/50 rounded-md",
            position === 'right' ? "ml-1" : "mr-1"
          )}
          aria-label="Message actions"
        >
          <DynamicIcon name="MoreVertical" className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={position === 'right' ? 'end' : 'start'}
        side="bottom"
        className="min-w-[160px]"
      >
        <DropdownMenuItem onClick={handleCopy} className="cursor-pointer">
          <DynamicIcon name="Copy" className="mr-2 h-3.5 w-3.5" />
          Copy
        </DropdownMenuItem>

        {message.role === 'assistant' && onRegenerate && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleRegenerate} className="cursor-pointer">
              <DynamicIcon name="RotateCcw" className="mr-2 h-3.5 w-3.5" />
              Regenerate
            </DropdownMenuItem>
          </>
        )}

        {message.role === 'user' && onEdit && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
              <DynamicIcon name="Edit" className="mr-2 h-3.5 w-3.5" />
              Edit
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          className="cursor-pointer text-destructive focus:text-destructive"
          disabled={isDeleting}
        >
          <DynamicIcon name="Trash2" className="mr-2 h-3.5 w-3.5" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

