import { supabase } from "@/integrations/supabase/client";
import type { BotType } from "@/lib/bots/types";

export interface ChatSession {
  id: string;
  user_id: string;
  bot_type: BotType;
  title: string;
  is_pinned: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  last_message_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  bot_type: BotType;
  role: "user" | "assistant" | "system";
  content: string;
  is_edited: boolean;
  edited_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

/**
 * Create a new chat session
 */
export async function createChatSession(
  botType: BotType,
  title: string = "New Chat"
): Promise<ChatSession | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({
      user_id: user.id,
      bot_type: botType,
      title,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating chat session:", error);
    return null;
  }

  return data as ChatSession;
}

/**
 * Get all chat sessions for a bot type
 */
export async function getChatSessions(
  botType: BotType,
  includeArchived: boolean = false
): Promise<ChatSession[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  let query = supabase
    .from("chat_sessions")
    .select("*")
    .eq("user_id", user.id)
    .eq("bot_type", botType)
    .order("last_message_at", { ascending: false });

  if (!includeArchived) {
    query = query.eq("is_archived", false);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching chat sessions:", error);
    return [];
  }

  return (data || []) as ChatSession[];
}

/**
 * Update a chat session
 */
export async function updateChatSession(
  sessionId: string,
  updates: Partial<Pick<ChatSession, "title" | "is_pinned" | "is_archived">>
): Promise<boolean> {
  const { error } = await supabase
    .from("chat_sessions")
    .update(updates)
    .eq("id", sessionId);

  if (error) {
    console.error("Error updating chat session:", error);
    return false;
  }

  return true;
}

/**
 * Delete a chat session
 */
export async function deleteChatSession(sessionId: string): Promise<boolean> {
  const { error } = await supabase
    .from("chat_sessions")
    .delete()
    .eq("id", sessionId);

  if (error) {
    console.error("Error deleting chat session:", error);
    return false;
  }

  return true;
}

/**
 * Get messages for a chat session
 */
export async function getChatMessages(sessionId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching chat messages:", error);
    return [];
  }

  return (data || []) as ChatMessage[];
}

/**
 * Send a user message
 */
export async function sendUserMessage(
  sessionId: string,
  botType: BotType,
  content: string
): Promise<ChatMessage | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      session_id: sessionId,
      user_id: user.id,
      bot_type: botType,
      role: "user",
      content,
    })
    .select()
    .single();

  if (error) {
    console.error("Error sending user message:", error);
    return null;
  }

  return data as ChatMessage;
}

/**
 * Save an assistant message
 */
export async function saveAssistantMessage(
  sessionId: string,
  botType: BotType,
  content: string,
  metadata?: Record<string, unknown>
): Promise<ChatMessage | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      session_id: sessionId,
      user_id: user.id,
      bot_type: botType,
      role: "assistant",
      content,
      metadata: metadata || {},
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving assistant message:", error);
    return null;
  }

  return data as ChatMessage;
}

/**
 * Update a message (for editing)
 */
export async function updateMessage(
  messageId: string,
  content: string
): Promise<boolean> {
  const { error } = await supabase
    .from("chat_messages")
    .update({
      content,
      is_edited: true,
      edited_at: new Date().toISOString(),
    })
    .eq("id", messageId);

  if (error) {
    console.error("Error updating message:", error);
    return false;
  }

  return true;
}

/**
 * Delete a message
 */
export async function deleteMessage(messageId: string): Promise<boolean> {
  const { error } = await supabase
    .from("chat_messages")
    .delete()
    .eq("id", messageId);

  if (error) {
    console.error("Error deleting message:", error);
    return false;
  }

  return true;
}

/**
 * Subscribe to new messages for a session
 */
export function subscribeToMessages(
  sessionId: string,
  callback: (message: ChatMessage) => void
) {
  const channel = supabase
    .channel(`chat_messages:${sessionId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `session_id=eq.${sessionId}`,
      },
      (payload) => {
        callback(payload.new as ChatMessage);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

