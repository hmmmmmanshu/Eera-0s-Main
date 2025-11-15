import { useState, useEffect, useCallback, useRef } from "react";
import {
  createChatSession,
  getChatSessions,
  updateChatSession,
  deleteChatSession,
  getChatMessages,
  sendUserMessage,
  saveAssistantMessage,
  updateMessage,
  deleteMessage,
  type ChatSession,
  type ChatMessage as DBChatMessage,
} from "@/lib/supabase/chat";
import { generateChatResponseStreaming } from "@/lib/gemini";
import { getSystemPrompt, type FounderProfile } from "@/lib/bots/prompts";
import { getFounderProfile } from "@/lib/supabase/founderProfile";
import type { BotType } from "@/lib/bots/types";
import type { ChatMessage } from "@/components/cognitive/MessageList";
import type { Conversation } from "@/components/cognitive/ChatTabsBar";

interface UseBotChatOptions {
  botType: BotType;
  onError?: (error: Error) => void;
}

interface UseBotChatReturn {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: ChatMessage[];
  loading: boolean;
  sending: boolean;
  setActiveConversation: (id: string | null) => void;
  createNewConversation: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  closeConversation: (id: string) => Promise<void>;
  pinConversation: (id: string) => Promise<void>;
  archiveConversation: (id: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  renameConversation: (id: string, newTitle: string) => Promise<void>;
  copyMessage: (messageId: string) => Promise<void>;
  regenerateMessage: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
}

export function useBotChat({ botType, onError }: UseBotChatOptions): UseBotChatReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [founderProfile, setFounderProfile] = useState<FounderProfile | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Convert DB ChatSession to Conversation
  const sessionToConversation = useCallback(
    (session: ChatSession): Conversation => ({
      id: session.id,
      title: session.title,
      lastMessageAt: session.last_message_at,
      isPinned: session.is_pinned,
      isArchived: session.is_archived,
    }),
    []
  );

  // Convert DB ChatMessage to ChatMessage
  const dbMessageToMessage = useCallback(
    (msg: DBChatMessage): ChatMessage => ({
      id: msg.id,
      role: msg.role as "user" | "assistant",
      content: msg.content,
      timestamp: msg.created_at,
      isEdited: msg.is_edited,
      editedAt: msg.edited_at || undefined,
    }),
    []
  );

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const sessions = await getChatSessions(botType, false);
      const convs = sessions.map(sessionToConversation);
      setConversations(convs);

      // Set first conversation as active if none selected
      setActiveConversationId((currentId) => {
        if (!currentId && convs.length > 0) {
          return convs[0].id;
        }
        return currentId;
      });
    } catch (error) {
      console.error("Error loading conversations:", error);
      onError?.(error as Error);
    } finally {
      setLoading(false);
    }
  }, [botType, sessionToConversation, onError]);

  // Load messages for active conversation
  const loadMessages = useCallback(async (sessionId: string) => {
    try {
      const dbMessages = await getChatMessages(sessionId);
      const msgs = dbMessages.map(dbMessageToMessage);
      setMessages(msgs);
    } catch (error) {
      console.error("Error loading messages:", error);
      onError?.(error as Error);
    }
  }, [dbMessageToMessage, onError]);

  // Load founder profile
  useEffect(() => {
    getFounderProfile().then((profile) => {
      setFounderProfile(profile);
    });
  }, []);

  // Initialize - only run once on mount
  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    } else {
      setMessages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId]);

  // Create new conversation
  const createNewConversation = useCallback(async () => {
    try {
      const session = await createChatSession(botType);
      if (session) {
        const conversation = sessionToConversation(session);
        setConversations((prev) => [conversation, ...prev]);
        setActiveConversationId(session.id);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      onError?.(error as Error);
    }
  }, [botType, sessionToConversation, onError]);

  // Send message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || sending) return;

      // Ensure we have an active conversation
      let sessionId = activeConversationId;
      if (!sessionId) {
        const session = await createChatSession(botType);
        if (!session) return;
        sessionId = session.id;
        const conversation = sessionToConversation(session);
        setConversations((prev) => [conversation, ...prev]);
        setActiveConversationId(sessionId);
      }

      setSending(true);

      try {
        // Save user message
        const userMessage = await sendUserMessage(sessionId, botType, content);
        if (userMessage) {
          const msg = dbMessageToMessage(userMessage);
          setMessages((prev) => [...prev, msg]);
        }

        // Get system prompt with founder context
        const systemPrompt = getSystemPrompt(botType, founderProfile);

        // Build conversation history for context
        const conversationHistory = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        // Add current user message
        conversationHistory.push({
          role: "user" as const,
          content,
        });

        // Create streaming message placeholder
        const streamingMessageId = `streaming-${Date.now()}`;
        const streamingMessage: ChatMessage = {
          id: streamingMessageId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
          streaming: true,
        };
        setMessages((prev) => [...prev, streamingMessage]);

        // Stream AI response
        let fullResponse = "";
        try {
          for await (const chunk of generateChatResponseStreaming({
            systemPrompt,
            messages: conversationHistory.slice(-10), // Last 10 messages for context
            temperature: botType === "mentor" ? 0.7 : botType === "friend" ? 0.8 : 0.6,
            maxTokens: botType === "mentor" ? 2000 : 1500,
          })) {
            fullResponse += chunk;
            // Update streaming message
            setMessages((prev) =>
              prev.map((m) =>
                m.id === streamingMessageId
                  ? { ...m, content: fullResponse, streaming: true }
                  : m
              )
            );
          }

          // Mark as complete
          setMessages((prev) =>
            prev.map((m) =>
              m.id === streamingMessageId ? { ...m, streaming: false } : m
            )
          );

          // Save final message to database
          const assistantMessage = await saveAssistantMessage(
            sessionId,
            botType,
            fullResponse
          );
          if (assistantMessage) {
            // Replace streaming message with saved message
            setMessages((prev) =>
              prev.map((m) =>
                m.id === streamingMessageId
                  ? { ...dbMessageToMessage(assistantMessage), streaming: false }
                  : m
              )
            );
          }
        } catch (streamError) {
          // Remove streaming message on error
          setMessages((prev) => prev.filter((m) => m.id !== streamingMessageId));
          throw streamError;
        }
      } catch (error) {
        console.error("Error sending message:", error);
        onError?.(error as Error);
      } finally {
        setSending(false);
      }
    },
    [
      activeConversationId,
      botType,
      sending,
      messages,
      founderProfile,
      sessionToConversation,
      dbMessageToMessage,
      onError,
    ]
  );

  // Close conversation
  const closeConversation = useCallback(async (id: string) => {
    if (conversations.length <= 1) return; // Don't close if it's the only one

    if (activeConversationId === id) {
      const otherConversation = conversations.find((c) => c.id !== id);
      setActiveConversationId(otherConversation?.id || null);
    }

    setConversations((prev) => prev.filter((c) => c.id !== id));
    await deleteChatSession(id);
  }, [activeConversationId, conversations]);

  // Pin conversation
  const pinConversation = useCallback(async (id: string) => {
    const conversation = conversations.find((c) => c.id === id);
    if (!conversation) return;

    const newPinnedState = !conversation.isPinned;
    await updateChatSession(id, { is_pinned: newPinnedState });

    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isPinned: newPinnedState } : c))
    );
  }, [conversations]);

  // Archive conversation
  const archiveConversation = useCallback(async (id: string) => {
    const conversation = conversations.find((c) => c.id === id);
    if (!conversation) return;

    const newArchivedState = !conversation.isArchived;
    await updateChatSession(id, { is_archived: newArchivedState });

    if (activeConversationId === id) {
      const otherConversation = conversations.find((c) => c.id !== id && !c.isArchived);
      setActiveConversationId(otherConversation?.id || null);
    }

    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isArchived: newArchivedState } : c))
    );
  }, [activeConversationId, conversations]);

  // Delete conversation
  const deleteConversation = useCallback(async (id: string) => {
    await deleteChatSession(id);

    if (activeConversationId === id) {
      const otherConversation = conversations.find((c) => c.id !== id);
      setActiveConversationId(otherConversation?.id || null);
    }

    setConversations((prev) => prev.filter((c) => c.id !== id));
  }, [activeConversationId, conversations]);

  // Rename conversation
  const renameConversation = useCallback(async (id: string, newTitle: string) => {
    await updateChatSession(id, { title: newTitle });

    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );
  }, []);

  // Copy message
  const copyMessage = useCallback(async (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      await navigator.clipboard.writeText(message.content);
    }
  }, [messages]);

  // Regenerate message
  const regenerateMessage = useCallback(
    async (messageId: string) => {
      const message = messages.find((m) => m.id === messageId);
      if (!message || message.role !== "assistant") return;

      // Find the user message before this assistant message
      const messageIndex = messages.findIndex((m) => m.id === messageId);
      const userMessage = messages[messageIndex - 1];

      if (userMessage && userMessage.role === "user") {
        // Delete the assistant message
        await deleteMessage(messageId);
        setMessages((prev) => prev.filter((m) => m.id !== messageId));

        // Resend the user message
        await sendMessage(userMessage.content);
      }
    },
    [messages, sendMessage]
  );

  // Edit message
  const editMessage = useCallback(
    async (messageId: string, newContent: string) => {
      await updateMessage(messageId, newContent);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, content: newContent, isEdited: true, editedAt: new Date() }
            : m
        )
      );
    },
    []
  );

  // Delete message
  const handleDeleteMessage = useCallback(async (messageId: string) => {
    await deleteMessage(messageId);
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  }, []);

  return {
    conversations,
    activeConversationId,
    messages,
    loading,
    sending,
    setActiveConversation: setActiveConversationId,
    createNewConversation,
    sendMessage,
    closeConversation,
    pinConversation,
    archiveConversation,
    deleteConversation,
    renameConversation,
    copyMessage,
    regenerateMessage,
    editMessage,
    deleteMessage: handleDeleteMessage,
  };
}

