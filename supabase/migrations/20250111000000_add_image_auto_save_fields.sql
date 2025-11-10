-- Migration: Add image auto-save fields to marketing_posts table
-- Purpose: Support auto-save functionality for image generation workflow
-- Date: 2025-01-11

-- Add selected_image_url: Stores the URL of the image the user selected from generated options
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'marketing_posts' 
    AND column_name = 'selected_image_url'
  ) THEN
    ALTER TABLE marketing_posts 
    ADD COLUMN selected_image_url TEXT;
  END IF;
END $$;

-- Add refined_image_url: Stores the URL of the refined image after user makes adjustments
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'marketing_posts' 
    AND column_name = 'refined_image_url'
  ) THEN
    ALTER TABLE marketing_posts 
    ADD COLUMN refined_image_url TEXT;
  END IF;
END $$;

-- Add refinement_count: Tracks how many times the user has refined the image (max 2)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'marketing_posts' 
    AND column_name = 'refinement_count'
  ) THEN
    ALTER TABLE marketing_posts 
    ADD COLUMN refinement_count INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Add generated_images: Stores an array of all generated image URLs (can be 1, 2, or 3 images)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'marketing_posts' 
    AND column_name = 'generated_images'
  ) THEN
    ALTER TABLE marketing_posts 
    ADD COLUMN generated_images JSONB NOT NULL DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add final_image_url: Stores the final image URL that will be used in the post
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'marketing_posts' 
    AND column_name = 'final_image_url'
  ) THEN
    ALTER TABLE marketing_posts 
    ADD COLUMN final_image_url TEXT;
  END IF;
END $$;

-- Add aspect_ratio: Stores the aspect ratio selected by user (values: "1:1", "4:5", "16:9", "9:16")
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'marketing_posts' 
    AND column_name = 'aspect_ratio'
  ) THEN
    ALTER TABLE marketing_posts 
    ADD COLUMN aspect_ratio TEXT;
  END IF;
END $$;

-- Add image_count: Stores how many images the user requested to generate (1, 2, or 3)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'marketing_posts' 
    AND column_name = 'image_count'
  ) THEN
    ALTER TABLE marketing_posts 
    ADD COLUMN image_count INTEGER NOT NULL DEFAULT 1;
  END IF;
END $$;

