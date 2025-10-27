-- Add comprehensive profile fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS startup_name TEXT,
ADD COLUMN IF NOT EXISTS founder_name TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS tagline TEXT,
ADD COLUMN IF NOT EXISTS about TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS key_offerings TEXT,
ADD COLUMN IF NOT EXISTS company_stage TEXT,
ADD COLUMN IF NOT EXISTS design_philosophy TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT,
ADD COLUMN IF NOT EXISTS posting_hours JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS primary_metrics TEXT[],
ADD COLUMN IF NOT EXISTS marketing_goal TEXT,
ADD COLUMN IF NOT EXISTS tone_personality TEXT[],
ADD COLUMN IF NOT EXISTS writing_style TEXT,
ADD COLUMN IF NOT EXISTS language_style TEXT,
ADD COLUMN IF NOT EXISTS brand_values TEXT[],
ADD COLUMN IF NOT EXISTS competitive_edge TEXT,
ADD COLUMN IF NOT EXISTS inspirational_brands TEXT,
ADD COLUMN IF NOT EXISTS offlimit_topics TEXT,
ADD COLUMN IF NOT EXISTS preferred_platforms TEXT[],
ADD COLUMN IF NOT EXISTS preferred_formats TEXT[],
ADD COLUMN IF NOT EXISTS content_themes TEXT[],
ADD COLUMN IF NOT EXISTS posting_frequency TEXT,
ADD COLUMN IF NOT EXISTS color_palette JSONB,
ADD COLUMN IF NOT EXISTS assistant_name TEXT,
ADD COLUMN IF NOT EXISTS assistant_style TEXT,
ADD COLUMN IF NOT EXISTS notification_frequency TEXT,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER DEFAULT 0;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON public.profiles(onboarding_completed);

-- Update existing profiles to mark as needing onboarding
UPDATE public.profiles SET onboarding_completed = FALSE WHERE onboarding_completed IS NULL;