import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "./Message";
import { EmptyState } from "./EmptyState";
import { SkeletonLoader } from "./SkeletonLoader";
import type { BotType } from "@/lib/bots/types";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date | string;
  streaming?: boolean;
  isEdited?: boolean;
  editedAt?: Date | string;
}

interface MessageListProps {
  messages: ChatMessage[];
  botType: BotType;
  loading?: boolean;
  onPromptSelect: (prompt: string) => void;
  onMessageCopy?: (messageId: string) => void;
  onMessageRegenerate?: (messageId: string) => void;
  onMessageEdit?: (messageId: string, newContent: string) => void;
  onMessageDelete?: (messageId: string) => void;
}

const GROUP_TIME_THRESHOLD = 5 * 60 * 1000; // 5 minutes

export function MessageList({
  messages,
  botType,
  loading = false,
  onPromptSelect,
  onMessageCopy,
  onMessageRegenerate,
  onMessageEdit,
  onMessageDelete,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Group messages by time proximity
  const groupedMessages = messages.reduce<Array<ChatMessage[]>>((groups, message, index) => {
    if (index === 0) {
      return [[message]];
    }

    const prevMessage = messages[index - 1];
    const prevTime = typeof prevMessage.timestamp === "string" 
      ? new Date(prevMessage.timestamp).getTime() 
      : prevMessage.timestamp.getTime();
    const currentTime = typeof message.timestamp === "string"
      ? new Date(message.timestamp).getTime()
      : message.timestamp.getTime();

    const timeDiff = currentTime - prevTime;

    if (timeDiff < GROUP_TIME_THRESHOLD && prevMessage.role === message.role) {
      groups[groups.length - 1].push(message);
    } else {
      groups.push([message]);
    }

    return groups;
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  if (loading && messages.length === 0) {
    return (
      <ScrollArea className="h-full w-full px-4">
        <div className="space-y-4 py-8 pb-4 max-w-4xl mx-auto">
          {[1, 2, 3].map((i) => (
            <SkeletonLoader key={i} variant="message" />
          ))}
        </div>
      </ScrollArea>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="h-full w-full overflow-y-auto pb-4">
        <div className="max-w-4xl mx-auto">
          <EmptyState botType={botType} onPromptSelect={onPromptSelect} />
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full w-full" ref={scrollRef}>
      <div className="px-4 py-8 space-y-6 pb-4 max-w-4xl mx-auto">
        {groupedMessages.map((group, groupIndex) => {
          const isLastGroup = groupIndex === groupedMessages.length - 1;
          const lastMessageInGroup = group[group.length - 1];

          return (
            <div key={groupIndex} className="space-y-2">
              {group.map((message, messageIndex) => {
                const isLastInGroup = messageIndex === group.length - 1;
                const showTimestamp = isLastInGroup && isLastGroup;

                return (
                  <Message
                    key={message.id}
                    message={message}
                    showTimestamp={showTimestamp}
                    onCopy={() => onMessageCopy?.(message.id)}
                    onRegenerate={() => onMessageRegenerate?.(message.id)}
                    onEdit={(newContent) => onMessageEdit?.(message.id, newContent)}
                    onDelete={() => onMessageDelete?.(message.id)}
                  />
                );
              })}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}

