import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { BotType } from "@/lib/bots/types";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  botType: BotType;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

const MAX_LENGTH = 5000;

export function ChatInput({
  botType,
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder,
  maxLength = MAX_LENGTH,
}: ChatInputProps) {
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount = value.length;
  const charCountPercentage = (charCount / maxLength) * 100;
  const isNearLimit = charCountPercentage >= 80;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleSubmit = () => {
    if (!value.trim() || disabled || charCount > maxLength) return;

    onSubmit(value.trim());
    if (value.trim()) {
      setInputHistory((prev) => [value.trim(), ...prev.slice(0, 9)]);
      setHistoryIndex(-1);
    }
    onChange("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "ArrowUp" && inputHistory.length > 0) {
      e.preventDefault();
      if (historyIndex === -1) {
        setHistoryIndex(0);
        onChange(inputHistory[0]);
      } else if (historyIndex < inputHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        onChange(inputHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown" && historyIndex >= 0) {
      e.preventDefault();
      if (historyIndex === 0) {
        setHistoryIndex(-1);
        onChange("");
      } else {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        onChange(inputHistory[newIndex]);
      }
    } else if (e.key === "Escape") {
      onChange("");
      setHistoryIndex(-1);
      textareaRef.current?.blur();
    }
  };

  const defaultPlaceholder =
    botType === "friend"
      ? "Share what's on your mind..."
      : botType === "mentor"
        ? "Ask me about strategy, fundraising, or growth..."
        : "What can I help you accomplish today?";

  return (
    <div className="relative w-full bg-background">
      {/* Input Container */}
      <div className="relative flex items-end gap-2 px-4 py-1 max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              if (e.target.value.length <= maxLength) {
                onChange(e.target.value);
                setHistoryIndex(-1);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || defaultPlaceholder}
            disabled={disabled}
            rows={1}
            className={cn(
              "min-h-[44px] max-h-[200px] resize-none w-full",
              "pr-12 pb-0.5",
              "text-[15px] leading-relaxed",
              "focus-visible:ring-2 focus-visible:ring-ring",
              "bg-background"
            )}
          />

          {/* Character Count */}
          {charCount > 0 && (
            <div
              className={cn(
                "absolute bottom-1 right-2 text-[11px] font-normal",
                isNearLimit ? "text-destructive" : "text-muted-foreground/60"
              )}
            >
              {charCount} / {maxLength}
            </div>
          )}
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSubmit}
          disabled={!value.trim() || disabled || charCount > maxLength}
          size="icon"
          className={cn(
            "h-[44px] w-[44px] shrink-0",
            "transition-all duration-200",
            value.trim() && !disabled && charCount <= maxLength
              ? "bg-foreground text-background hover:bg-foreground/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

