import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { getSuggestedPrompts, type SuggestedPrompt } from "@/lib/bots/suggestedPrompts";
import type { BotType } from "@/lib/bots/types";

interface ChatInputProps {
  botType: BotType;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (message: string) => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
  maxLength?: number; // Default: 5000
  showCharacterCount?: boolean;
  showSuggestedPrompts?: boolean;
  hasMessages?: boolean;
  lastMessage?: string;
  inputRef?: React.RefObject<HTMLInputElement>;
  onHistoryUp?: () => void;
  onHistoryDown?: () => void;
}

// Lazy initialization to avoid module-level initialization issues
// Use plain object type instead of Record<BotType, ...>
const getBotPlaceholder = (botType: BotType): string => {
  const placeholders: { friend: string; mentor: string; ea: string } = {
    friend: "Share what's on your mind...",
    mentor: "What strategic challenge are you facing?",
    ea: "What can I help you accomplish?",
  };
  return placeholders[botType];
};

export function ChatInput({
  botType,
  value,
  onChange,
  onSubmit,
  disabled = false,
  loading = false,
  placeholder,
  maxLength = 5000,
  showCharacterCount = true,
  showSuggestedPrompts = true,
  hasMessages = false,
  lastMessage,
  inputRef: externalInputRef,
  onHistoryUp,
  onHistoryDown,
}: ChatInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<SuggestedPrompt[]>([]);
  const internalInputRef = useRef<HTMLInputElement>(null);
  const inputRef = externalInputRef || internalInputRef;
  const historyIndexRef = useRef<number>(-1);
  const currentValueRef = useRef<string>("");

  // Update suggested prompts when focus or messages change
  useEffect(() => {
    if (isFocused && showSuggestedPrompts && !value.trim()) {
      const prompts = getSuggestedPrompts(botType, hasMessages, lastMessage);
      setSuggestedPrompts(prompts);
    } else {
      setSuggestedPrompts([]);
    }
  }, [isFocused, showSuggestedPrompts, value, botType, hasMessages, lastMessage]);

  // Store current value for history navigation
  useEffect(() => {
    if (value && historyIndexRef.current === -1) {
      currentValueRef.current = value;
    }
  }, [value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle history navigation (only when input is empty or at start)
    if (e.key === 'ArrowUp' && onHistoryUp && (value === '' || inputRef.current?.selectionStart === 0)) {
      e.preventDefault();
      onHistoryUp();
      return;
    }

    if (e.key === 'ArrowDown' && onHistoryDown) {
      e.preventDefault();
      onHistoryDown();
      return;
    }

    // Handle Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled && !loading) {
        onSubmit(value.trim());
      }
      return;
    }

    // Handle Escape
    if (e.key === 'Escape') {
      if (value) {
        onChange('');
        historyIndexRef.current = -1;
      }
      inputRef.current?.blur();
      return;
    }
  }, [value, disabled, loading, onSubmit, onChange, onHistoryUp, onHistoryDown, inputRef]);

  const handlePromptClick = (prompt: SuggestedPrompt) => {
    onChange(prompt.prompt);
    inputRef.current?.focus();
    // Don't auto-submit, just fill the input
  };

  const characterCount = value.length;
  const characterPercentage = (characterCount / maxLength) * 100;
  const showCount = showCharacterCount && characterCount > 0;
  
  const getCharacterCountColor = () => {
    if (characterPercentage >= 100) return "text-destructive";
    if (characterPercentage >= 80) return "text-yellow-600";
    return "text-muted-foreground";
  };

  const displayPlaceholder = placeholder || getBotPlaceholder(botType);

  return (
    <div className="relative">
      {/* Suggested Prompts Dropdown */}
      <AnimatePresence>
        {isFocused && suggestedPrompts.length > 0 && showSuggestedPrompts && !value.trim() && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-0 right-0 mb-2 bg-popover border border-border rounded-lg shadow-lg p-2 z-10"
          >
            <div className="space-y-1">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handlePromptClick(prompt)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-[13px]",
                    "hover:bg-accent hover:text-accent-foreground",
                    "transition-colors duration-150",
                    "flex items-center gap-2"
                  )}
                >
                  <span className="flex-1">{prompt.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Container */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            placeholder={displayPlaceholder}
            value={value}
            onChange={(e) => {
              const newValue = e.target.value;
              if (newValue.length <= maxLength) {
                onChange(newValue);
                historyIndexRef.current = -1; // Reset history index when typing
              }
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              // Delay blur to allow prompt clicks
              setTimeout(() => setIsFocused(false), 200);
            }}
            disabled={disabled || loading}
            maxLength={maxLength}
            className={cn(
              "flex-1 h-9 rounded-lg border-border/60",
              "bg-background/80 backdrop-blur-sm",
              "text-[13px] placeholder:text-muted-foreground/60",
              "transition-all duration-300 ease-out",
              "focus:border-amber-300/50 focus:ring-2 focus:ring-amber-200/30",
              "focus:bg-background focus:shadow-md",
              "hover:border-border/80",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "pr-12" // Make room for character count
            )}
            aria-label="Message input"
          />
          
          {/* Character Count */}
          {showCount && (
            <div
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 text-[10px]",
                getCharacterCountColor()
              )}
            >
              {characterCount} / {maxLength}
            </div>
          )}
        </div>

        {/* Send Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            onClick={() => {
              if (value.trim() && !disabled && !loading) {
                onSubmit(value.trim());
              }
            }}
            disabled={!value.trim() || disabled || loading}
            size="icon"
            className={cn(
              "shrink-0 h-9 w-9 rounded-lg",
              "bg-gradient-to-br from-amber-500 to-orange-500",
              "text-white hover:from-amber-600 hover:to-orange-600",
              "shadow-md hover:shadow-lg",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-all duration-300"
            )}
            aria-label="Send message"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ArrowRight className="h-3.5 w-3.5" />
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

