# Marketing Hub AI - Setup Guide

## 🔑 Required API Keys

To enable AI content generation in Marketing Hub, you need to set up the following API keys:

### 1. **Google Gemini AI** (PRIMARY - Required)
**Purpose:** Text generation (captions, hashtags) + Image generation (Imagen 3)

**Get Your Key:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Get API Key"
3. Create a new project or select existing
4. Copy your API key

**Pricing:**
- Text generation: ~$0.001 per request (negligible)
- Image generation: $0.02-0.04 per image
- Free tier: Generous limits for testing

**Add to `.env.local`:**
```bash
VITE_GEMINI_API_KEY=your_gemini_key_here
```

---

### 2. **OpenAI (DALL-E 3)** (Optional - High Quality)
**Purpose:** Image generation with excellent text rendering

**Get Your Key:**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create account if needed
3. Navigate to API Keys → Create new secret key
4. Copy and save (you won't see it again!)

**Pricing:**
- Standard: $0.04 per 1024×1024 image
- HD: $0.08 per 1024×1024 image
- $5 minimum credit purchase

**Add to `.env.local`:**
```bash
VITE_OPENAI_API_KEY=sk-...your_openai_key
```

---

### 3. **Stability AI (SDXL)** (Optional - Flexible)
**Purpose:** Reproducible image generation with maximum control

**Get Your Key:**
1. Go to [Stability AI Platform](https://platform.stability.ai/)
2. Sign up / Log in
3. Navigate to Account → API Keys
4. Generate new API key

**Pricing:**
- Credit-based: $10 = ~200 images
- ~$0.03-0.065 per image
- Free trial credits available

**Add to `.env.local`:**
```bash
VITE_STABILITY_API_KEY=sk-...your_stability_key
```

---

### 4. **Leonardo AI** (Optional - Artistic)
**Purpose:** Diverse styles (photorealistic + creative)

**Get Your Key:**
1. Go to [Leonardo AI](https://leonardo.ai/)
2. Sign up / Log in
3. Settings → API Access
4. Generate API key

**Pricing:**
- Free tier: ~100 credits/day
- Paid plans: $12-48/month
- ~$0.05 per image

**Add to `.env.local`:**
```bash
VITE_LEONARDO_API_KEY=your_leonardo_key
```

---

## 📝 Environment Variables Template

Create/update `.env.local` in your project root:

```bash
# ==============================================
# MARKETING HUB - AI CONTENT GENERATION
# ==============================================

# PRIMARY (Required for all features)
VITE_GEMINI_API_KEY=your_gemini_key_here

# OPTIONAL (Choose based on your needs)
VITE_OPENAI_API_KEY=sk-...your_openai_key
VITE_STABILITY_API_KEY=sk-...your_stability_key
VITE_LEONARDO_API_KEY=your_leonardo_key

# Model preferences (optional)
VITE_DEFAULT_IMAGE_MODEL=gemini  # gemini|dalle3|sdxl|leonardo
VITE_GEMINI_MODEL=gemini-2.5-flash  # Override Gemini model
```

---

## 🗄️ Database Setup

### Supabase Storage Bucket

Run this migration to create the storage bucket:

```bash
# If using Supabase CLI
supabase db push

# Or apply manually in Supabase Dashboard → SQL Editor
```

The migration creates:
- ✅ `marketing-images` bucket (public, 10MB limit)
- ✅ RLS policies for user-specific access
- ✅ Support for PNG, JPEG, WebP, GIF

---

## ✅ Verification

### Test Your Setup:

1. **Check Environment Variables:**
```bash
# In your terminal
echo $VITE_GEMINI_API_KEY
```

2. **Test in App:**
- Go to Marketing Hub → "Create Post"
- Select platform → content type
- Try generating content
- Check browser console for any API errors

3. **Verify Storage:**
- Go to Supabase Dashboard → Storage
- Check if `marketing-images` bucket exists
- Permissions should show "Public" and "Protected"

---

## 💰 Cost Management

### Recommended Approach:

**Phase 1 - Testing (Start Here):**
- ✅ **Only Gemini** ($0 to start with free tier)
- Test text generation extensively
- Test image generation with Gemini placeholders

**Phase 2 - Production (High Quality):**
- ✅ **Gemini + DALL-E 3**
- Use Gemini for captions/hashtags (~$0.001/post)
- Use DALL-E 3 for professional images (~$0.08/image)
- Estimated cost: ~$10-20/month for 200-300 posts

**Phase 3 - Advanced (Maximum Control):**
- ✅ **All 4 Models**
- Let users choose based on use case
- Gemini: Quick iterations
- DALL-E: Professional ads
- SDXL: Brand templates (reproducible)
- Leonardo: Artistic exploration

### Cost Calculator:
```
Example: 50 posts/month
- Text generation (Gemini): 50 × $0.001 = $0.05
- Image generation (DALL-E 3): 50 × $0.08 = $4.00
- Total: ~$4.05/month

Example: 200 posts/month (heavy user)
- Text: 200 × $0.001 = $0.20
- Images (mix): 
  - 100 × $0.03 (Gemini) = $3.00
  - 100 × $0.08 (DALL-E) = $8.00
- Total: ~$11.20/month
```

---

## 🔒 Security Best Practices

### Environment Variables:
- ✅ Never commit `.env.local` to Git
- ✅ Add to `.gitignore`:
```gitignore
.env.local
.env*.local
```

### API Key Management:
- ✅ Set spending limits in each provider's dashboard
- ✅ Rotate keys monthly
- ✅ Use separate keys for dev/prod
- ✅ Monitor usage regularly

### Supabase Security:
- ✅ RLS policies are enabled (users can only access their own images)
- ✅ File size limits prevent abuse (10MB max)
- ✅ MIME type restrictions (images only)

---

## 🐛 Troubleshooting

### Issue: "Gemini API key not found"
**Fix:** 
1. Ensure `.env.local` exists in project root
2. Restart dev server: `npm run dev`
3. Check console: `import.meta.env.VITE_GEMINI_API_KEY`

### Issue: "DALL-E 3 error: 401 Unauthorized"
**Fix:**
1. Verify key starts with `sk-`
2. Check if key is active in OpenAI dashboard
3. Ensure billing is set up

### Issue: "Storage bucket not found"
**Fix:**
1. Run migration: `supabase/migrations/20251030_marketing_images_storage.sql`
2. Or create manually in Supabase Dashboard → Storage
3. Verify RLS policies are enabled

### Issue: Generated images not showing
**Fix:**
1. Check browser console for CORS errors
2. Verify bucket is set to "Public"
3. Check if image URL is accessible directly

### Issue: "Model not found" (Gemini)
**Fix:**
1. Try fallback model: Set `VITE_GEMINI_MODEL=gemini-2.0-flash`
2. Check [Google AI Studio](https://makersuite.google.com/) for model availability
3. Verify your API key has access to Imagen models

---

## 📊 Model Comparison

| Feature | Gemini | DALL-E 3 | SDXL | Leonardo |
|---------|--------|----------|------|----------|
| **Speed** | ⚡⚡⚡ 2-4s | ⚡⚡ 5-10s | ⚡⚡ 4-8s | ⚡ 5-12s |
| **Quality** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Cost** | $ $0.03 | $$$ $0.08 | $$ $0.05 | $$ $0.05 |
| **Text in Images** | Good | Excellent | Fair | Fair |
| **Reproducibility** | No | No | Yes (seed) | Partial |
| **Style Variety** | Medium | High | High | Very High |
| **Free Tier** | Yes | No | Trial | Yes (limited) |

**Recommendation:**
- **Start with Gemini** (free tier, fast, good enough)
- **Add DALL-E 3** when you need professional quality
- **Add SDXL** if you need reproducible brand templates
- **Add Leonardo** for artistic exploration

---

## 🚀 Next Steps

After setup:
1. ✅ Test text generation (captions/hashtags)
2. ✅ Test each image model
3. ✅ Complete your brand profile (for better AI output)
4. ✅ Create your first post end-to-end
5. ✅ Monitor costs in provider dashboards

---

## 📚 Additional Resources

- [Google Gemini Docs](https://ai.google.dev/docs)
- [DALL-E 3 API Docs](https://platform.openai.com/docs/guides/images)
- [Stability AI Docs](https://platform.stability.ai/docs/api-reference)
- [Leonardo AI Docs](https://docs.leonardo.ai/)
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)

---

## ✨ Pro Tips

1. **Brand Profile First:** Complete your brand profile before generating content - AI will match your voice automatically
2. **Test Prompts:** Start with simple prompts, iterate based on results
3. **Save Seeds:** For SDXL, save successful seeds for reproducible results
4. **Mix Models:** Use Gemini for quick iterations, DALL-E for final output
5. **Batch Generation:** Generate multiple options and pick the best one
6. **Monitor Costs:** Set up billing alerts in each provider dashboard

---

**Questions?** Check the troubleshooting section or review the code comments in:
- `src/lib/gemini.ts` - Text generation
- `src/lib/imageGeneration.ts` - Image generation
- `src/hooks/useMarketingData.ts` - Data management

