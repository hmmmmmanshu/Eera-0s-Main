# 🚀 OpenRouter Integration - Setup Guide

## ✅ **What's Been Completed:**

### **1. OpenRouter API Client** (`src/lib/openrouter.ts`)
- Unified interface for all AI models
- Text generation (Gemini 2.0 Flash FREE, GPT-4o, Claude)
- Image generation (DALL-E 3, Flux Pro/Dev, SDXL)
- Automatic brand color injection
- Fallback system (tries multiple models if one fails)
- Upload to Supabase Storage

### **2. CreatePostModal Updated**
- Replaced broken Gemini direct API
- New model selection UI with 4 image models
- Real-time cost display
- Simplified configuration (no more `aspectRatio` errors!)

### **3. Brand Identity Settings**
- Color picker UI in Marketing Hub
- Save to `profiles.color_palette` (JSON format)
- 5 main colors + unlimited custom colors
- Automatic injection into AI prompts

---

## 🔧 **Setup Instructions:**

### **Step 1: Get OpenRouter API Key** (5 minutes)

1. **Go to:** https://openrouter.ai/
2. **Sign Up:** Create a free account
3. **Navigate to:** Settings → Keys
4. **Click:** "Create New Key"
5. **Copy the key:** It starts with `sk-or-v1-...`

---

### **Step 2: Add API Key to Your Project**

1. **Create `.env.local` file** in project root (if it doesn't exist):
```bash
# In your terminal:
touch .env.local
```

2. **Add this to `.env.local`:**
```bash
# OpenRouter API Key (REQUIRED)
VITE_OPENROUTER_API_KEY=sk-or-v1-paste_your_actual_key_here

# Your existing Supabase keys (keep these)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Keep your Gemini key for text generation
VITE_GEMINI_API_KEY=your_gemini_key
```

3. **Save the file**

4. **Restart dev server:**
```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

---

### **Step 3: Test the Integration**

#### **Test 1: Brand Colors** ✅
1. Go to **Marketing Hub**
2. Click **"Brand"** button (top right, next to "Create Post")
3. Set your colors:
   - Primary: `#0A66FF` (blue)
   - Secondary: `#6B46C1` (purple)
   - Accent: `#2ECC71` (green)
4. Click **"Save Brand Colors"**
5. Should see: ✅ "Brand colors saved successfully!"

#### **Test 2: Text Generation** ✅
1. Click **"Create Post"**
2. Select **LinkedIn** → **Text Only**
3. Headline: "Launching our new feature"
4. Key Points: "AI-powered, saves time, increases productivity"
5. Click **"Generate"**
6. Should see:
   - ✓ Analyzing brand voice & colors
   - ✓ Generating copy & hashtags
   - ⚡ Optimizing for engagement
   - ✅ "Content generated successfully!"
   - Cost: **$0.000** (Gemini 2.0 Flash is FREE!)

#### **Test 3: Image Generation** 🎨
1. Click **"Create Post"**
2. Select **Instagram** → **Image**
3. Headline: "Behind the scenes of building"
4. Key Points: "Team collaboration, innovation, modern workspace"
5. Click **"Continue"**
6. **Choose Model:**
   - **DALL-E 3** ($0.040) - Best for professional layouts
   - **Flux Dev** ($0.025) - Balanced quality/cost ⭐ Recommended
   - **SDXL** ($0.003) - Ultra-cheap for testing
   - **Flux Pro** ($0.055) - Premium quality
7. Click **"Generate with [Model Name]"**
8. Watch console for:
   ```
   ✅ [OpenRouter Image] Starting generation...
   ✅ [OpenRouter Image] Image downloaded, size: 123456
   ✅ [OpenRouter Image] Upload successful: https://...
   ✅ [CreatePostModal] Image generation complete
   ```
9. **Verify:** Image should include your brand colors automatically!

#### **Test 4: Save Draft** 💾
1. After generation completes
2. Click **"Preview & Edit"**
3. Review the content and image
4. Click **"Save Draft"**
5. Should see: ✅ "Draft saved successfully!"
6. Close modal
7. **Check "Drafts" section** - Your post should appear there!

---

## 💰 **Pricing Breakdown:**

### **Text Generation:**
| Model | Cost per 1K tokens | Best For |
|-------|-------------------|----------|
| **Gemini 2.0 Flash** | **$0.00 (FREE!)** | All captions & content |
| GPT-4o | $0.0025 | Premium long-form |
| Claude 3.5 | $0.003 | Nuanced brand voice |

**Recommendation:** Always use Gemini 2.0 Flash (it's FREE and excellent!)

### **Image Generation:**
| Model | Cost per Image | Quality | Speed | Best For |
|-------|---------------|---------|-------|----------|
| **SDXL** | **$0.003** | Good | Fast ⚡ | Testing, high-volume |
| **Flux Dev** | **$0.025** | Great | Fast ⚡ | **Default choice** ⭐ |
| **DALL-E 3** | **$0.040** | Excellent | Medium | Text in images, layouts |
| **Flux Pro** | **$0.055** | Premium | Slow | High-end campaigns |

**Recommendation:** Default to **Flux Dev** ($0.025), fallback to SDXL ($0.003)

### **Monthly Cost Estimate:**
- **100 posts** (text + image, Flux Dev): **$2.50**
- **500 posts** (text + image, Flux Dev): **$12.50**
- **1000 posts** (text + image, SDXL fallback): **$3.00** (ultra-cheap!)

---

## 🔍 **Troubleshooting:**

### **Issue 1: "VITE_OPENROUTER_API_KEY not found"**
**Solution:**
1. Verify `.env.local` exists in project root
2. Check the key name is exactly: `VITE_OPENROUTER_API_KEY`
3. No spaces around `=`
4. Restart dev server

---

### **Issue 2: "API key not valid" (403 Error)**
**Solution:**
1. Go to https://openrouter.ai/keys
2. Check if key is active
3. Regenerate key if needed
4. Update `.env.local` with new key
5. Restart dev server

---

### **Issue 3: Image not showing brand colors**
**Check:**
1. Brand colors are saved in Brand Settings
2. Open browser console, look for:
   ```
   [OpenRouter Image] Enhanced prompt: ...brand colors #0A66FF and #6B46C1...
   ```
3. If not showing, refresh page and try again

---

### **Issue 4: "Failed to download image"**
**Solution:**
1. Check Supabase Storage bucket `marketing-images` exists
2. Verify bucket is public
3. Check RLS policies allow uploads
4. Use MCP to verify:
```sql
SELECT * FROM storage.buckets WHERE id = 'marketing-images';
```

---

### **Issue 5: Draft not appearing in Drafts section**
**Check Console for:**
```
[Save Draft] Starting save: { ... }
[useCreatePost] Starting mutation: { ... }
[useCreatePost] Post created successfully: { id: "..." }
```

**If errors appear:**
1. Check RLS policies (already confirmed via MCP)
2. Verify user is authenticated
3. Check `media_urls` is array format

---

## 📊 **What to Expect:**

### **Console Logs (Successful Flow):**
```
✅ [Gemini Image] Starting generation...
✅ [OpenRouter Image] Starting generation with OpenRouter
✅ [OpenRouter Image] Enhanced prompt: ...brand colors #0A66FF and #6B46C1...
✅ [OpenRouter Image] Temporary URL: https://openrouter.ai/...
✅ [OpenRouter Image] Downloading image from: https://...
✅ [OpenRouter Image] Image downloaded, size: 1234567
✅ [OpenRouter] Upload successful: https://...supabase.co/storage/...
✅ [CreatePostModal] Image generation complete: {
    url: "https://...supabase.co/storage/...",
    model: "black-forest-labs/flux-dev",
    cost: 0.025,
    time: 5234
}
✅ [Save Draft] Starting save: { platform: "instagram", ... }
✅ [useCreatePost] Starting mutation: { ... }
✅ [useCreatePost] User ID: ab0efa39-d675-4129-891e-80376f68e2f4
✅ [useCreatePost] Inserting data: { ... }
✅ [useCreatePost] Post created successfully: { id: "...", ... }
✅ Toast: "Draft saved successfully!"
```

---

## 🎯 **Next Steps:**

### **Immediate:**
1. ✅ Set up OpenRouter API key
2. ✅ Test brand colors
3. ✅ Generate first post with image
4. ✅ Verify draft saving

### **Optional Enhancements:**
1. **Docker Setup** - Containerize for team deployment
2. **Cost Tracking** - Dashboard for monthly AI spend
3. **Video Generation** - Integrate RunwayML or Luma
4. **Batch Generation** - Generate 10 posts at once
5. **A/B Testing** - Generate 3 variations per post

---

## 📋 **File Changes Summary:**

| File | Status | Changes |
|------|--------|---------|
| `src/lib/openrouter.ts` | ✅ New | Complete OpenRouter client (450 lines) |
| `src/components/settings/BrandIdentitySettings.tsx` | ✅ New | Color picker UI (350 lines) |
| `src/components/marketing/CreatePostModal.tsx` | ✅ Updated | Uses OpenRouter, new model UI |
| `src/pages/MarketingHub.tsx` | ✅ Updated | Added Brand button + modal |
| `src/lib/gemini.ts` | ✅ Fixed | Syntax error resolved |
| `src/lib/imageGeneration.ts` | ⚠️ Deprecated | Can be deleted (replaced by OpenRouter) |

---

## ✅ **Success Criteria:**

**You'll know everything is working when:**
- ✅ Brand colors save without errors
- ✅ Text generation works (FREE with Gemini)
- ✅ Images generate with brand colors visible
- ✅ Drafts appear in Drafts section
- ✅ Console shows detailed logs
- ✅ Costs are tracked accurately

---

**🎉 OpenRouter integration is COMPLETE and ready to test!**

**All code is written, no errors, no commits yet. Start testing whenever you're ready!**

