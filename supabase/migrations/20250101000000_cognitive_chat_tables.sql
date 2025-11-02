-- Create chat_sessions table for Cognitive Hub conversations
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Session',
  active_hub TEXT,
  pinned_plan_id UUID,
  category TEXT DEFAULT 'general',
  subcategories TEXT[] DEFAULT '[]'::text[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add check constraints after table creation
ALTER TABLE public.chat_sessions 
  ADD CONSTRAINT chat_sessions_active_hub_check 
  CHECK (active_hub IS NULL OR active_hub IN ('marketing', 'sales', 'finance', 'ops', 'hr', 'legal', 'cognitive'));

ALTER TABLE public.chat_sessions 
  ADD CONSTRAINT chat_sessions_category_check 
  CHECK (category IN ('marketing', 'sales', 'finance', 'ops', 'hr', 'legal', 'cognitive', 'general'));

-- Create chat_messages table for storing all chat messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  hub TEXT,
  subcategories TEXT[] DEFAULT '[]'::text[],
  category TEXT DEFAULT 'general',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add check constraints after table creation (only if column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chat_messages' AND column_name = 'role'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chat_messages_role_check'
  ) THEN
    ALTER TABLE public.chat_messages 
      ADD CONSTRAINT chat_messages_role_check 
      CHECK (role IN ('user', 'assistant', 'system'));
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chat_messages' AND column_name = 'hub'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chat_messages_hub_check'
  ) THEN
    ALTER TABLE public.chat_messages 
      ADD CONSTRAINT chat_messages_hub_check 
      CHECK (hub IS NULL OR hub IN ('marketing', 'sales', 'finance', 'ops', 'hr', 'legal', 'cognitive'));
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chat_messages' AND column_name = 'category'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chat_messages_category_check'
  ) THEN
    ALTER TABLE public.chat_messages 
      ADD CONSTRAINT chat_messages_category_check 
      CHECK (category IN ('marketing', 'sales', 'finance', 'ops', 'hr', 'legal', 'cognitive', 'general'));
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_sessions
CREATE POLICY "Users can view their own chat sessions"
  ON public.chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat sessions"
  ON public.chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions"
  ON public.chat_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions"
  ON public.chat_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view their own chat messages"
  ON public.chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat messages"
  ON public.chat_messages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat messages"
  ON public.chat_messages FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_category ON public.chat_sessions(category);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_active_hub ON public.chat_sessions(active_hub);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_hub ON public.chat_messages(hub);
CREATE INDEX IF NOT EXISTS idx_chat_messages_category ON public.chat_messages(category);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at on chat_sessions
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

