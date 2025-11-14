import { useState, useCallback, useRef, useEffect } from "react";
import { useCognitiveActions } from "./useCognitive";
import { supabase } from "@/integrations/supabase/client";

export type BotType = 'friend' | 'mentor' | 'ea';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  botType: BotType;
  timestamp: Date;
  streaming?: boolean;
}

interface UseBotChatOptions {
  userId?: string | null;
  botType: BotType;
}

interface UseBotChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  sessionId: string | null;
  sendMessage: (content: string) => Promise<void>;
  loadConversationHistory: () => Promise<void>;
  clearConversation: () => void;
  createNewChat: () => Promise<void>;
}

export function useBotChat({ userId, botType }: UseBotChatOptions): UseBotChatReturn {
  const { sendChatWithPlanExtractStreaming, createOrGetSession, listRecentMessages } = useCognitiveActions(userId) as any;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Map bot types to personas
  const botPersonaMap: Record<BotType, 'friend' | 'guide' | 'mentor' | 'ea'> = {
    friend: 'friend',
    mentor: 'mentor',
    ea: 'ea',
  };

  // Load conversation history
  const loadConversationHistory = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const sid = await createOrGetSession("cognitive");
      setSessionId(sid);

      const recent = await listRecentMessages(sid, 20);
      const mapped: ChatMessage[] = (recent || []).map((m: any, idx: number) => ({
        id: `msg-${sid}-${idx}-${Date.now()}`,
        role: m.role as 'user' | 'assistant',
        content: m.content as string,
        botType,
        timestamp: new Date(m.created_at || Date.now()),
        streaming: false,
      }));

      setMessages(mapped);
    } catch (error) {
      console.error("Error loading conversation history:", error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, botType, createOrGetSession, listRecentMessages]);

  // Create new chat session
  const createNewChat = useCallback(async () => {
    if (!userId) return;

    try {
      // Create a new session
      const { data: newSession, error } = await supabase
        .from("chat_sessions")
        .insert({ user_id: userId, active_hub: "cognitive", title: `${botType} Chat` })
        .select("id")
        .single();

      if (error) throw error;

      setSessionId(newSession.id);
      setMessages([]);
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  }, [userId, botType]);

  // Clear conversation
  const clearConversation = useCallback(() => {
    setMessages([]);
  }, []);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !userId || !sessionId || isSending) return;

    const trimmedContent = content.trim();
    
    // Validate message length
    if (trimmedContent.length > 5000) {
      throw new Error("Message is too long. Please keep it under 5000 characters.");
    }

    setIsSending(true);
    abortControllerRef.current = new AbortController();

    // Generate unique ID for user message
    const userMessageId = `user-${Date.now()}-${Math.random()}`;
    const userMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: trimmedContent,
      botType,
      timestamp: new Date(),
      streaming: false,
    };

    // Optimistic UI: Add user message immediately
    setMessages((prev) => [...prev, userMessage]);

    // Add typing indicator
    const typingMessageId = `typing-${Date.now()}`;
    const typingMessage: ChatMessage = {
      id: typingMessageId,
      role: 'assistant',
      content: '',
      botType,
      timestamp: new Date(),
      streaming: true,
    };
    setMessages((prev) => [...prev, typingMessage]);

    try {
      const persona = botPersonaMap[botType];
      let fullReply = "";

      const stream = sendChatWithPlanExtractStreaming(trimmedContent, sessionId, persona);

      for await (const item of stream) {
        // Check if aborted
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }

        if (item.chunk) {
          fullReply += item.chunk;
          // Update typing message with streaming content
          setMessages((prev) => {
            const newMessages = [...prev];
            const typingMsg = newMessages.find((m) => m.id === typingMessageId);
            if (typingMsg) {
              typingMsg.content = sanitizeAssistant(fullReply);
              typingMsg.streaming = true;
            }
            return newMessages;
          });
        }

        if (item.complete) {
          // Finalize the message
          const assistantMessage: ChatMessage = {
            id: `assistant-${Date.now()}-${Math.random()}`,
            role: 'assistant',
            content: sanitizeAssistant(item.complete.reply),
            botType,
            timestamp: new Date(),
            streaming: false,
          };

          setMessages((prev) => {
            // Remove typing message and add final message
            return prev
              .filter((m) => m.id !== typingMessageId)
              .concat(assistantMessage);
          });
          break;
        }
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      
      // Remove typing indicator on error
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== typingMessageId);
        // Add error message
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: "I'm having trouble processing that right now. Could you try again?",
          botType,
          timestamp: new Date(),
          streaming: false,
        };
        return filtered.concat(errorMessage);
      });
    } finally {
      setIsSending(false);
      abortControllerRef.current = null;
    }
  }, [userId, sessionId, botType, isSending, sendChatWithPlanExtractStreaming, botPersonaMap]);

  // Load history when bot type changes or on mount
  useEffect(() => {
    loadConversationHistory();
  }, [loadConversationHistory]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    messages,
    isLoading,
    isSending,
    sessionId,
    sendMessage,
    loadConversationHistory,
    clearConversation,
    createNewChat,
  };
}

function sanitizeAssistant(text: string): string {
  if (!text) return text;
  // Remove markdown asterisks and hashes, compress whitespace
  let s = text.replace(/\*\*/g, "").replace(/\*/g, "").replace(/^#+\s*/gm, "");
  s = s.replace(/\n{3,}/g, "\n\n");
  return s;
}

