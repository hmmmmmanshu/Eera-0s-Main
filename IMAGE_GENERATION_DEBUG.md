# 🔍 Image Generation & Post Saving - Debug Guide

## 📊 **Investigation Summary**

### **What I Found Using MCP:**

✅ **Images ARE being generated successfully:**
- 4 images found in `storage.objects` table
- Bucket: `marketing-images`
- Sizes: 1.6MB (2 images), 27KB, 16KB
- All images are PNG format
- Public bucket configured correctly
- Example paths:
  - `ab0efa39-d675-4129-891e-80376f68e2f4/marketing/1761848515387-ai-generated-1761848514669.png`
  - `ab0efa39-d675-4129-891e-80376f68e2f4/marketing/1761848441102-ai-generated-1761848440690.png`

❌ **Posts are NOT being saved to database:**
- `marketing_posts` table is completely empty (0 rows)
- This means the `handleSaveDraft` function is failing silently

---

## 🔧 **Fixes Applied:**

### **1. Enhanced Debugging in `CreatePostModal.tsx`**

**Before:**
```typescript
const handleSaveDraft = async () => {
  if (!generatedContent) return;
  
  try {
    await createPostMutation.mutateAsync({ ... });
    toast.success("Draft saved successfully!");
  } catch (error) {
    console.error("Save failed:", error);
  }
};
```

**After:**
```typescript
const handleSaveDraft = async () => {
  if (!generatedContent) {
    toast.error("No content to save");
    return;
  }

  console.log("[Save Draft] Starting save:", {
    platform,
    contentLength: generatedContent.caption?.length,
    hasImage: !!generatedImageUrl,
    imageUrl: generatedImageUrl,
  });

  try {
    const postData = {
      platform,
      content: generatedContent.caption,
      media_urls: generatedImageUrl ? [generatedImageUrl] : [],
      status: "draft" as const,
      // ... rest of data
    };

    console.log("[Save Draft] Post data:", postData);
    const result = await createPostMutation.mutateAsync(postData);
    console.log("[Save Draft] Save successful:", result);
    
    toast.success("Draft saved successfully!");
    resetAndClose();
  } catch (error) {
    console.error("[Save Draft] Save failed:", error);
    toast.error(`Failed to save draft: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};
```

---

### **2. Enhanced Debugging in `useMarketingData.ts`**

**Added comprehensive logging:**
```typescript
export function useCreatePost() {
  return useMutation({
    mutationFn: async (post) => {
      console.log("[useCreatePost] Starting mutation:", post);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("[useCreatePost] No authenticated user");
        throw new Error("Not authenticated");
      }

      console.log("[useCreatePost] User ID:", user.id);

      const insertData = { ...post, user_id: user.id };
      console.log("[useCreatePost] Inserting data:", insertData);

      const { data, error } = await supabase
        .from("marketing_posts")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error("[useCreatePost] Supabase error:", error);
        throw error;
      }
      
      console.log("[useCreatePost] Post created successfully:", data);
      return data;
    },
    onSuccess: (data) => {
      console.log("[useCreatePost] onSuccess callback:", data);
      // ...
    },
    onError: (error) => {
      console.error("[useCreatePost] onError callback:", error);
      // ...
    },
  });
}
```

---

### **3. Enhanced Image Error Handling in `DraftsSection.tsx`**

**Added safe image loading with error handling:**
```typescript
{draft.media_urls && Array.isArray(draft.media_urls) && draft.media_urls.length > 0 ? (
  <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
    <img
      src={draft.media_urls[0] as string}
      alt="Draft preview"
      className="w-full h-full object-cover"
      onError={(e) => {
        console.error("[DraftsSection] Image load error:", draft.media_urls[0]);
        e.currentTarget.style.display = 'none';
      }}
    />
  </div>
) : (
  <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center">
    <FileText className="h-8 w-8 text-muted-foreground" />
  </div>
)}
```

---

## 🧪 **How to Debug the Issue:**

### **Step 1: Open Browser Console**
Press `F12` in your browser and go to the "Console" tab.

### **Step 2: Try Creating a Post**
1. Go to Marketing Hub
2. Click "Create Post"
3. Select LinkedIn → Image
4. Fill in Headline: "Test Post"
5. Click "Generate"
6. Wait for generation to complete
7. Click "Save Draft"

### **Step 3: Watch Console Logs**

You should see this sequence:

```
✅ [Image Gen] Model: gemini, Enhanced prompt: ...
✅ [Image Gen] Upload successful: https://...supabase.co/storage/v1/object/public/marketing-images/...
✅ [Save Draft] Starting save: { platform: "linkedin", contentLength: 250, hasImage: true, imageUrl: "https://..." }
✅ [Save Draft] Post data: { platform: "linkedin", content: "...", media_urls: ["https://..."], status: "draft", ... }
✅ [useCreatePost] Starting mutation: { ... }
✅ [useCreatePost] User ID: ab0efa39-d675-4129-891e-80376f68e2f4
✅ [useCreatePost] Inserting data: { ..., user_id: "..." }
✅ [useCreatePost] Post created successfully: { id: "...", ... }
✅ [useCreatePost] onSuccess callback: { ... }
✅ Toast: "Draft saved successfully!"
```

---

## 🚨 **Potential Error Messages:**

### **Error 1: "No authenticated user"**
```
❌ [useCreatePost] No authenticated user
❌ Error: Not authenticated
```
**Solution:** User needs to log in again.

---

### **Error 2: RLS Policy Violation**
```
❌ [useCreatePost] Supabase error: { code: "42501", message: "new row violates row-level security policy" }
```
**Solution:** Check RLS policies on `marketing_posts` table:
```sql
-- View existing policies
SELECT * FROM pg_policies WHERE tablename = 'marketing_posts';

-- Create INSERT policy if missing
CREATE POLICY "Users can insert their own posts"
ON marketing_posts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

---

### **Error 3: Invalid JSON for media_urls**
```
❌ [useCreatePost] Supabase error: { code: "22P02", message: "invalid input syntax for type json" }
```
**Solution:** Ensure `media_urls` is an array:
```typescript
media_urls: generatedImageUrl ? [generatedImageUrl] : [],  // ✅ Correct
media_urls: generatedImageUrl,  // ❌ Wrong
```

---

### **Error 4: Image URL not accessible**
```
❌ [DraftsSection] Image load error: https://...supabase.co/storage/v1/object/public/marketing-images/...
```
**Solution:** Check bucket RLS policies:
```sql
-- View storage policies
SELECT * FROM storage.policies WHERE bucket_id = 'marketing-images';

-- Create SELECT policy if missing
CREATE POLICY "Public images are accessible to all"
ON storage.objects
FOR SELECT
USING (bucket_id = 'marketing-images');
```

---

## 📋 **MCP Investigation Queries**

### **Check if posts are being saved:**
```sql
SELECT 
  id,
  platform,
  content,
  media_urls,
  status,
  created_at
FROM marketing_posts
ORDER BY created_at DESC
LIMIT 10;
```

### **Check uploaded images:**
```sql
SELECT 
  name,
  metadata->>'mimetype' as mimetype,
  metadata->>'size' as size_bytes,
  created_at
FROM storage.objects 
WHERE bucket_id = 'marketing-images'
ORDER BY created_at DESC
LIMIT 10;
```

### **Check bucket configuration:**
```sql
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'marketing-images';
```

### **Check RLS policies:**
```sql
-- Marketing posts policies
SELECT * FROM pg_policies WHERE tablename = 'marketing_posts';

-- Storage bucket policies
SELECT * FROM storage.policies WHERE bucket_id = 'marketing-images';
```

---

## ✅ **Expected Behavior After Fix:**

1. **Image Generation:**
   - ✅ User fills form and clicks "Generate"
   - ✅ Image is generated (DALL-E 3 fallback or canvas placeholder)
   - ✅ Image is uploaded to Supabase Storage
   - ✅ Console shows: `[Image Gen] Upload successful: https://...`

2. **Saving Draft:**
   - ✅ User clicks "Save Draft"
   - ✅ Post data (content + image URL) is saved to `marketing_posts`
   - ✅ Console shows: `[useCreatePost] Post created successfully: { id: ... }`
   - ✅ Toast notification: "Draft saved successfully!"
   - ✅ Modal closes

3. **Viewing Drafts:**
   - ✅ Drafts section appears in Marketing Hub
   - ✅ Draft cards show thumbnail images
   - ✅ Images load without errors
   - ✅ User can preview, publish, or delete drafts

---

## 🔑 **Key Technical Details:**

### **Database Schema:**
- **Table:** `marketing_posts`
- **Column:** `media_urls` (type: `jsonb`, default: `'[]'::jsonb`)
- **Important:** This column stores an **array of strings**, not a single string

### **Storage:**
- **Bucket:** `marketing-images`
- **Public:** `true`
- **File size limit:** 10MB
- **Allowed types:** `image/png`, `image/jpeg`, `image/webp`, `image/gif`

### **Image URL Format:**
```
https://[PROJECT_REF].supabase.co/storage/v1/object/public/marketing-images/[USER_ID]/marketing/[TIMESTAMP]-[FILENAME].png
```

---

## 🎯 **Next Steps:**

1. **Run the app** with browser console open
2. **Try creating a post** with image generation
3. **Copy all console logs** if there's an error
4. **Share the logs** for further debugging

The comprehensive logging will pinpoint exactly where the issue is occurring!

