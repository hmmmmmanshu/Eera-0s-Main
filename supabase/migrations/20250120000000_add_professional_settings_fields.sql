-- Migration: Add professional enhancement settings fields to marketing_posts table
-- Purpose: Store professional enhancement settings for posts to enable analytics and learning
-- Date: 2025-01-20

-- Add professional_settings: JSONB column to store professional settings object
-- Structure: { qualityLevel, photographyStyle, designSophistication, platformStandard, industryAesthetic, colorGrading }
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'marketing_posts' 
    AND column_name = 'professional_settings'
  ) THEN
    ALTER TABLE marketing_posts 
    ADD COLUMN professional_settings JSONB;
  END IF;
END $$;

-- Add professional_enhanced: BOOLEAN flag indicating if professional settings were used
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'marketing_posts' 
    AND column_name = 'professional_enhanced'
  ) THEN
    ALTER TABLE marketing_posts 
    ADD COLUMN professional_enhanced BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- Add professional_settings_applied_at: TIMESTAMP for when professional settings were applied
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'marketing_posts' 
    AND column_name = 'professional_settings_applied_at'
  ) THEN
    ALTER TABLE marketing_posts 
    ADD COLUMN professional_settings_applied_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Create index on professional_enhanced for analytics queries
CREATE INDEX IF NOT EXISTS idx_marketing_posts_professional_enhanced 
ON marketing_posts(professional_enhanced);

-- Create index on professional_settings_applied_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_marketing_posts_professional_settings_applied_at 
ON marketing_posts(professional_settings_applied_at);

-- Update existing posts: Set professional_enhanced = false and professional_settings = null
UPDATE marketing_posts 
SET 
  professional_enhanced = false,
  professional_settings = NULL,
  professional_settings_applied_at = NULL
WHERE professional_enhanced IS NULL OR professional_settings IS NULL;

-- Add comment to columns for documentation
COMMENT ON COLUMN marketing_posts.professional_settings IS 'JSONB object storing professional enhancement settings: { qualityLevel, photographyStyle, designSophistication, platformStandard, industryAesthetic, colorGrading }';
COMMENT ON COLUMN marketing_posts.professional_enhanced IS 'Boolean flag indicating if professional enhancement settings were applied to this post';
COMMENT ON COLUMN marketing_posts.professional_settings_applied_at IS 'Timestamp when professional enhancement settings were applied to this post';

