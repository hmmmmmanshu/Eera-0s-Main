-- Create storage bucket for marketing images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'marketing-images',
  'marketing-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for marketing-images bucket
CREATE POLICY "Users can upload their own marketing images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'marketing-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can read their own marketing images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'marketing-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Public can read marketing images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'marketing-images');

CREATE POLICY "Users can update their own marketing images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'marketing-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own marketing images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'marketing-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

