import { useState, useCallback, useRef, useEffect } from "react";
import { useCognitiveActions } from "./useCognitive";
import { supabase } from "@/integrations/supabase/client";
import type { Conversation } from "@/components/cognitive/ChatTabsBar";

export type BotType = 'friend' | 'mentor' | 'ea';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  botType: BotType;
  timestamp: Date;
  streaming?: boolean;
  isEdited?: boolean;
  editedAt?: Date;
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
  conversations: Conversation[];
  activeConversationId: string | null;
  sendMessage: (content: string) => Promise<void>;
  loadConversationHistory: (conversationId?: string) => Promise<void>;
  clearConversation: () => void;
  createNewConversation: () => Promise<string>;
  switchConversation: (conversationId: string) => Promise<void>;
  closeConversation: (conversationId: string) => Promise<void>;
  renameConversation: (conversationId: string, newTitle: string) => Promise<void>;
  loadConversations: () => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  regenerateMessage: (messageId: string) => Promise<void>;
}

export function useBotChat({ userId, botType }: UseBotChatOptions): UseBotChatReturn {
  const { sendChatWithPlanExtractStreaming, createOrGetSession, listRecentMessages, listSessions } = useCognitiveActions(userId) as any;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasCreatedInitialConversationRef = useRef<Record<BotType, boolean>>({
    friend: false,
    mentor: false,
    ea: false,
  });
  const isLoadingConversationsRef = useRef<Record<BotType, boolean>>({
    friend: false,
    mentor: false,
    ea: false,
  });

  // Map bot types to personas
  const botPersonaMap: Record<BotType, 'friend' | 'guide' | 'mentor' | 'ea'> = {
    friend: 'friend',
    mentor: 'mentor',
    ea: 'ea',
  };

  // Load conversations list for this bot type
  const loadConversations = useCallback(async () => {
    if (!userId) return [];
    
    // Prevent concurrent calls
    if (isLoadingConversationsRef.current[botType]) {
      return [];
    }

    isLoadingConversationsRef.current[botType] = true;

    try {
      const allSessions = await listSessions(50);
      // Filter sessions for this bot type - check if title starts with bot name
      const botName = botType.charAt(0).toUpperCase() + botType.slice(1);
      const botSessions = (allSessions || []).filter((s: any) => {
        if (s.active_hub !== "cognitive") return false;
        const title = (s.title || "").toLowerCase();
        return title.startsWith(botName.toLowerCase()) || title.includes(botType.toLowerCase());
      });

      // Fetch last message previews for each session
      const sessionsWithPreviews = await Promise.all(
        botSessions.map(async (s: any) => {
          try {
            const { data: messages } = await supabase
              .from("chat_messages")
              .select("content, created_at")
              .eq("session_id", s.id)
              .order("created_at", { ascending: false })
              .limit(1);

            const lastMessage = messages && messages.length > 0 ? messages[0] : null;

            return {
              ...s,
              lastMessagePreview: lastMessage?.content?.slice(0, 50) || undefined,
              lastMessageAt: lastMessage?.created_at || s.created_at,
            };
          } catch {
            return {
              ...s,
              lastMessagePreview: undefined,
              lastMessageAt: s.created_at,
            };
          }
        })
      );

      const mapped: Conversation[] = sessionsWithPreviews.map((s: any) => ({
        id: s.id,
        botType,
        title: s.title || `Chat ${s.id.slice(0, 8)}`,
        createdAt: new Date(s.created_at),
        lastMessageAt: new Date(s.lastMessageAt || s.created_at),
        messageCount: 0, // Could be enhanced to count actual messages
        isPinned: s.is_pinned || false,
        isArchived: s.is_archived || false,
        lastMessagePreview: s.lastMessagePreview,
      }));

      // Sort by last message time (most recent first)
      mapped.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());

      setConversations(mapped);

      // Set active conversation if none selected
      setActiveConversationId(prev => {
        if (!prev && mapped.length > 0) {
          return mapped[0].id;
        }
        return prev;
      });

      return mapped;
    } catch (error) {
      console.error("Error loading conversations:", error);
      setConversations([]);
      return [];
    } finally {
      isLoadingConversationsRef.current[botType] = false;
    }
  }, [userId, botType, listSessions]);

  // Load conversation history for a specific conversation
  const loadConversationHistory = useCallback(async (conversationId?: string) => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const targetId = conversationId || activeConversationId;
    if (!targetId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setSessionId(targetId);

      const recent = await listRecentMessages(targetId, 20);
      const mapped: ChatMessage[] = (recent || []).map((m: any, idx: number) => ({
        id: `msg-${targetId}-${idx}-${Date.now()}`,
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
  }, [userId, botType, listRecentMessages, activeConversationId]);

  // Create new conversation
  const createNewConversation = useCallback(async (): Promise<string> => {
    if (!userId) throw new Error("No user");

    try {
      const botName = botType.charAt(0).toUpperCase() + botType.slice(1);
      const conversationCount = conversations.length;
      const sessionTitle = `${botName} Chat ${conversationCount + 1}`;
      
      // Create a new session for this bot type
      const { data: newSession, error } = await supabase
        .from("chat_sessions")
        .insert({ 
          user_id: userId, 
          active_hub: "cognitive", 
          title: sessionTitle,
          is_pinned: false,
          is_archived: false
        })
        .select("id")
        .single();

      if (error) throw error;

      const newConversation: Conversation = {
        id: newSession.id,
        botType,
        title: sessionTitle,
        createdAt: new Date(),
        lastMessageAt: new Date(),
        messageCount: 0,
        isPinned: false,
        isArchived: false,
      };

      setConversations(prev => [newConversation, ...prev]);
      setActiveConversationId(newSession.id);
      setSessionId(newSession.id);
      setMessages([]);
      setIsLoading(false); // Ensure loading is false for new empty conversation

      return newSession.id;
    } catch (error) {
      console.error("Error creating new conversation:", error);
      throw error;
    }
  }, [userId, botType, conversations]);

  // Switch to a different conversation
  const switchConversation = useCallback(async (conversationId: string) => {
    setActiveConversationId(conversationId);
    setSessionId(conversationId);
    setMessages([]);
    await loadConversationHistory(conversationId);
  }, [loadConversationHistory]);

  // Close a conversation
  const closeConversation = useCallback(async (conversationId: string) => {
    if (conversations.length <= 1) {
      // Can't close the last conversation - create a new one first, then close the old one
      try {
        const newId = await createNewConversation();
        
        // Now delete the old one
        await supabase
          .from("chat_sessions")
          .delete()
          .eq("id", conversationId);
        
        // Remove from local state
        setConversations(prev => prev.filter(c => c.id !== conversationId));
      } catch (error) {
        console.error("Error closing last conversation:", error);
      }
      return;
    }

    try {
      // Delete session from database
      await supabase
        .from("chat_sessions")
        .delete()
        .eq("id", conversationId);

      // Remove from local state
      const remaining = conversations.filter(c => c.id !== conversationId);
      setConversations(remaining);

      // Switch to first remaining conversation
      if (activeConversationId === conversationId && remaining.length > 0) {
        await switchConversation(remaining[0].id);
      }
    } catch (error) {
      console.error("Error closing conversation:", error);
    }
  }, [conversations, activeConversationId, switchConversation, createNewConversation]);

  // Rename a conversation
  const renameConversation = useCallback(async (conversationId: string, newTitle: string) => {
    try {
      // Update in database
      await supabase
        .from("chat_sessions")
        .update({ title: newTitle })
        .eq("id", conversationId);

      // Update local state
      setConversations(prev => 
        prev.map(c => c.id === conversationId ? { ...c, title: newTitle } : c)
      );
    } catch (error) {
      console.error("Error renaming conversation:", error);
    }
  }, []);

  // Pin a conversation
  const pinConversation = useCallback(async (conversationId: string) => {
    try {
      await supabase
        .from("chat_sessions")
        .update({ is_pinned: true })
        .eq("id", conversationId);

      setConversations(prev =>
        prev.map(c => c.id === conversationId ? { ...c, isPinned: true } : c)
      );
    } catch (error) {
      console.error("Error pinning conversation:", error);
    }
  }, []);

  // Unpin a conversation
  const unpinConversation = useCallback(async (conversationId: string) => {
    try {
      await supabase
        .from("chat_sessions")
        .update({ is_pinned: false })
        .eq("id", conversationId);

      setConversations(prev =>
        prev.map(c => c.id === conversationId ? { ...c, isPinned: false } : c)
      );
    } catch (error) {
      console.error("Error unpinning conversation:", error);
    }
  }, []);

  // Archive a conversation
  const archiveConversation = useCallback(async (conversationId: string) => {
    try {
      await supabase
        .from("chat_sessions")
        .update({ is_archived: true })
        .eq("id", conversationId);

      setConversations(prev =>
        prev.map(c => c.id === conversationId ? { ...c, isArchived: true } : c)
      );
    } catch (error) {
      console.error("Error archiving conversation:", error);
    }
  }, []);

  // Unarchive a conversation
  const unarchiveConversation = useCallback(async (conversationId: string) => {
    try {
      await supabase
        .from("chat_sessions")
        .update({ is_archived: false })
        .eq("id", conversationId);

      setConversations(prev =>
        prev.map(c => c.id === conversationId ? { ...c, isArchived: false } : c)
      );
    } catch (error) {
      console.error("Error unarchiving conversation:", error);
    }
  }, []);

  // Clear conversation
  const clearConversation = useCallback(() => {
    setMessages([]);
  }, []);

  // Edit a message
  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!sessionId || !newContent.trim()) return;

    try {
      // Update in database if message exists there
      // For now, we'll just update local state
      // In a full implementation, you'd update the database record
      
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId && msg.role === 'user'
            ? {
                ...msg,
                content: newContent.trim(),
                isEdited: true,
                editedAt: new Date(),
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Error editing message:", error);
      throw error;
    }
  }, [sessionId]);

  // Delete a message
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!sessionId) return;

    try {
      // Remove from local state
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      
      // In a full implementation, you'd also delete from database
      // await supabase.from("chat_messages").delete().eq("id", messageId);
    } catch (error) {
      console.error("Error deleting message:", error);
      throw error;
    }
  }, [sessionId]);

  // Regenerate assistant response
  const regenerateMessage = useCallback(async (assistantMessageId: string) => {
    if (!sessionId || !userId || isSending) return;

    try {
      // Find the assistant message to regenerate
      const assistantIndex = messages.findIndex((m) => m.id === assistantMessageId && m.role === 'assistant');
      if (assistantIndex === -1) return;

      // Find the user message that preceded this assistant message
      const userMessage = messages[assistantIndex - 1];
      if (!userMessage || userMessage.role !== 'user') return;

      // Remove the assistant message
      setMessages((prev) => prev.filter((m) => m.id !== assistantMessageId));

      // Resend the user message (this will create a new assistant response)
      await sendMessage(userMessage.content);
    } catch (error) {
      console.error("Error regenerating message:", error);
      throw error;
    }
  }, [sessionId, userId, isSending, messages, sendMessage]);

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
            const updated = prev
              .filter((m) => m.id !== typingMessageId)
              .concat(assistantMessage);
            
            // Update conversation title from first user message if needed
            if (sessionId && updated.length === 2) { // User message + assistant response
              const firstUserMsg = updated.find(m => m.role === 'user');
              if (firstUserMsg && conversations.find(c => c.id === sessionId)?.title.startsWith(botType.charAt(0).toUpperCase() + botType.slice(1) + " Chat")) {
                const title = firstUserMsg.content.slice(0, 30).trim() || `Chat ${sessionId.slice(0, 8)}`;
                renameConversation(sessionId, title).catch(() => {
                  // Silently fail if rename doesn't work
                });
              }
            }
            
            return updated;
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
  }, [userId, sessionId, botType, isSending, sendChatWithPlanExtractStreaming, botPersonaMap, conversations, renameConversation]);

  // Load conversations when bot type changes or on mount
  useEffect(() => {
    // Clear messages when switching bots
    setMessages([]);
    setSessionId(null);
    setActiveConversationId(null);
    setConversations([]);
    hasCreatedInitialConversationRef.current[botType] = false;
    isLoadingConversationsRef.current[botType] = false;
    
    // Load conversations for this bot type
    loadConversations().then((mapped) => {
      // If no conversations exist and we haven't created one yet, create one
      if (mapped && mapped.length === 0 && userId && !hasCreatedInitialConversationRef.current[botType]) {
        hasCreatedInitialConversationRef.current[botType] = true;
        createNewConversation().catch(() => {
          hasCreatedInitialConversationRef.current[botType] = false;
        });
      }
    }).catch((error) => {
      // Silently handle errors to prevent infinite loops
      console.error("Error in loadConversations effect:", error);
      setConversations([]);
      isLoadingConversationsRef.current[botType] = false;
    });
  }, [botType, userId, loadConversations, createNewConversation]);

  // Load history when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      loadConversationHistory(activeConversationId);
    } else {
      // If no active conversation, set loading to false and clear messages
      setIsLoading(false);
      setMessages([]);
    }
  }, [activeConversationId, loadConversationHistory]);

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
    conversations,
    activeConversationId,
    sendMessage,
    loadConversationHistory,
    clearConversation,
    createNewConversation,
    switchConversation,
    closeConversation,
    renameConversation,
    pinConversation,
    unpinConversation,
    archiveConversation,
    unarchiveConversation,
    loadConversations,
    editMessage,
    deleteMessage,
    regenerateMessage,
  };
}

function sanitizeAssistant(text: string): string {
  if (!text) return text;
  // Remove markdown asterisks and hashes, compress whitespace
  let s = text.replace(/\*\*/g, "").replace(/\*/g, "").replace(/^#+\s*/gm, "");
  s = s.replace(/\n{3,}/g, "\n\n");
  return s;
}

