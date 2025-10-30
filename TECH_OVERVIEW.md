# EERA OS - Complete Technical Overview

## 🏗️ **Architecture Overview**

### **Stack**
- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + ShadCN/UI Components
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **State Management:** React Query (@tanstack/react-query)
- **Routing:** React Router v6
- **Animations:** Framer Motion
- **AI APIs:** Google Gemini (text), OpenRouter (image generation)

---

## 📁 **Project Structure**

```
src/
├── components/
│   ├── dashboard/          # Dashboard-specific components
│   ├── cognitive/          # Cognitive Hub components
│   ├── finance/            # Finance Hub components
│   ├── hr/                 # HR Hub components (AI-powered)
│   ├── legal/              # Legal Hub components
│   ├── marketing/          # Marketing Hub components (AI-powered)
│   ├── ops/                # Operations Hub components
│   ├── sales/              # Sales Hub components
│   ├── settings/           # Brand Identity & Settings
│   └── ui/                 # Reusable ShadCN UI components
├── contexts/
│   └── AuthContext.tsx     # Global authentication state
├── hooks/
│   ├── useHRData.ts        # HR data fetching/mutations
│   ├── useMarketingData.ts # Marketing data fetching/mutations
│   ├── useSalesData.ts     # Sales data fetching/mutations
│   └── use-toast.ts        # Toast notifications
├── integrations/
│   └── supabase/
│       ├── client.ts       # Supabase client initialization
│       └── types.ts        # Auto-generated TypeScript types
├── lib/
│   ├── gemini.ts           # Gemini AI client (text generation)
│   ├── openrouter.ts       # OpenRouter client (text + image)
│   ├── brandContext.ts     # Brand-aware AI prompt enhancement
│   └── utils.ts            # Utility functions
├── pages/
│   ├── Auth.tsx            # Login/Signup
│   ├── Dashboard.tsx       # Main dashboard
│   ├── Onboarding.tsx      # User onboarding flow
│   ├── ProfileSettings.tsx # User profile management
│   ├── MarketingHub.tsx    # Marketing Hub main page
│   ├── HRHub.tsx           # HR Hub main page
│   ├── SalesHub.tsx        # Sales Hub main page
│   ├── FinanceHub.tsx      # Finance Hub main page
│   ├── LegalHub.tsx        # Legal Hub main page
│   ├── OpsHub.tsx          # Operations Hub main page
│   └── CognitiveHub.tsx    # Cognitive Hub main page
└── main.tsx                # App entry point

supabase/
├── migrations/             # Database schema migrations
├── functions/              # Edge Functions (Google Calendar sync)
└── config.toml             # Supabase configuration
```

---

## 🗄️ **Database Schema**

### **Core Tables**

#### **`profiles`** (User profiles with brand identity)
```sql
- id (UUID, FK to auth.users)
- email (TEXT)
- full_name (TEXT)
- company_name (TEXT)
- industry (TEXT)
- role (TEXT)
- avatar_url (TEXT)
- color_palette (JSONB)         -- Brand colors for AI generation
- tone_personality (TEXT)        -- Brand voice tone
- brand_values (TEXT[])          -- Brand values
- design_philosophy (TEXT)       -- Visual style preferences
- target_audience (TEXT)         -- Marketing target audience
- key_offerings (TEXT)           -- Company offerings
- writing_style (TEXT)           -- Brand writing style
- preferred_platforms (TEXT[])   -- Social media platforms
- offlimit_topics (TEXT)         -- Topics to avoid in AI generation
- created_at, updated_at
```

#### **`tasks`** (Task management)
```sql
- id (UUID)
- user_id (UUID, FK to profiles)
- title (TEXT)
- description (TEXT)
- status (TEXT: 'todo', 'in-progress', 'done')
- priority (TEXT: 'low', 'medium', 'high')
- due_date (TIMESTAMPTZ)
- created_at, updated_at
```

#### **`meetings`** (Calendar events)
```sql
- id (UUID)
- user_id (UUID, FK to profiles)
- title (TEXT)
- description (TEXT)
- start_time (TIMESTAMPTZ)
- end_time (TIMESTAMPTZ)
- location (TEXT)
- attendees (TEXT[])
- google_event_id (TEXT)         -- For Google Calendar sync
- created_at, updated_at
```

### **HR Hub Tables**

#### **`hr_roles`**
```sql
- id (UUID)
- user_id (UUID)
- title (TEXT)
- department (TEXT)
- description (TEXT)
- requirements (TEXT[])
- salary_range (TEXT)
- status ('draft', 'open', 'closed')
- created_at, updated_at
```

#### **`hr_candidates`**
```sql
- id (UUID)
- user_id (UUID)
- role_id (UUID, FK to hr_roles)
- name (TEXT)
- email (TEXT)
- phone (TEXT)
- resume_url (TEXT)
- ai_score (NUMERIC)             -- AI-generated resume score
- status ('applied', 'screening', 'interview', 'offer', 'rejected')
- notes (TEXT)
- created_at, updated_at
```

### **Marketing Hub Tables**

#### **`marketing_posts`**
```sql
- id (UUID)
- user_id (UUID)
- platform ('linkedin', 'instagram', 'twitter', 'all')
- content_type ('text', 'image', 'carousel', 'video')
- caption (TEXT)
- hashtags (TEXT[])
- media_urls (TEXT[])            -- Supabase Storage URLs
- status ('draft', 'scheduled', 'published')
- scheduled_time (TIMESTAMPTZ)
- published_time (TIMESTAMPTZ)
- ai_generated (BOOLEAN)
- ai_model (TEXT)                -- 'gemini-2.0-flash', etc.
- generation_cost (NUMERIC)
- views, likes, comments, shares (INTEGER)
- created_at, updated_at
```

#### **`marketing_metrics`**
```sql
- id (UUID)
- user_id (UUID)
- platform ('linkedin', 'instagram', 'twitter')
- date (DATE)
- impressions (INTEGER)
- reach (INTEGER)
- engagement_rate (NUMERIC)
- clicks (INTEGER)
- conversions (INTEGER)
- created_at
```

#### **`marketing_targets`**
```sql
- id (UUID)
- user_id (UUID)
- metric ('followers', 'engagement', 'posts', 'reach')
- platform ('linkedin', 'instagram', 'twitter', 'all')
- target_value (INTEGER)
- current_value (INTEGER)
- deadline (DATE)
- created_at, updated_at
```

### **Sales Hub Tables**

#### **`sales_leads`**
```sql
- id (UUID)
- user_id (UUID)
- name (TEXT)
- email (TEXT)
- company (TEXT)
- title (TEXT)
- source ('linkedin', 'website', 'referral', 'cold-outreach')
- status ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost')
- estimated_value (NUMERIC)
- ai_qualification_score (NUMERIC) -- AI-generated lead score
- next_action (TEXT)
- created_at, updated_at
```

#### **`sales_quotes`**
```sql
- id (UUID)
- user_id (UUID)
- lead_id (UUID, FK to sales_leads)
- quote_number (TEXT)
- items (JSONB)
- total_amount (NUMERIC)
- status ('draft', 'sent', 'accepted', 'rejected')
- created_at, updated_at
```

### **Finance Hub Tables**

#### **`finance_expenses`**
```sql
- id (UUID)
- user_id (UUID)
- category (TEXT)
- amount (NUMERIC)
- date (DATE)
- description (TEXT)
- status ('pending', 'approved', 'rejected')
- receipt_url (TEXT)
- created_at, updated_at
```

#### **`finance_invoices`**
```sql
- id (UUID)
- user_id (UUID)
- invoice_number (TEXT)
- client_name (TEXT)
- amount (NUMERIC)
- status ('draft', 'sent', 'paid', 'overdue')
- due_date (DATE)
- paid_date (DATE)
- created_at, updated_at
```

---

## 🔒 **Security (Row Level Security)**

All tables have RLS policies:
```sql
-- Users can only access their own data
CREATE POLICY "Users can view own data"
  ON table_name FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data"
  ON table_name FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
  ON table_name FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own data"
  ON table_name FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 🤖 **AI Integration**

### **1. Gemini AI (Text Generation)**

**File:** `src/lib/gemini.ts`

**Features:**
- ✅ Job description generation
- ✅ Resume scoring
- ✅ Offer letter generation
- ✅ Sales email generation
- ✅ Lead qualification
- ✅ Marketing caption generation
- ✅ Hashtag suggestions

**Model:** `gemini-2.5-flash` (auto-resolves to working model)

**Usage:**
```typescript
import { generateJobDescription } from '@/lib/gemini';

const jd = await generateJobDescription({
  role: "Senior React Developer",
  department: "Engineering",
  requirements: ["5+ years React", "TypeScript expert"]
});
```

### **2. OpenRouter (Multi-Model AI)**

**File:** `src/lib/openrouter.ts`

**Features:**
- ✅ Text generation (Gemini, GPT-4, Claude)
- ✅ Image generation (Gemini Imagen 2.0/2.5)
- ✅ Brand-aware prompt enhancement
- ✅ Automatic model fallback

**Available Text Models:**
- `google/gemini-2.0-flash-exp:free` (FREE)
- `openai/gpt-4o` ($0.0025/1k tokens)
- `anthropic/claude-3.5-sonnet` ($0.003/1k tokens)

**Available Image Models:**
- `google/gemini-2.0-flash-exp-image:free` (FREE)
- `google/gemini-2.5-flash-image-preview` ($0.0000625/image)

**Usage:**
```typescript
import { generateText, generateImage } from '@/lib/openrouter';

// Text generation
const caption = await generateText({
  model: "google/gemini-2.0-flash-exp:free",
  prompt: "Write a LinkedIn post about...",
  brandContext: brandData
});

// Image generation (correct endpoint: /chat/completions with modalities)
const image = await generateImage({
  model: "google/gemini-2.0-flash-exp-image:free",
  prompt: "Modern SaaS dashboard UI",
  aspectRatio: "16:9",
  brandContext: brandData
});
```

### **3. Brand Context Integration**

**File:** `src/lib/brandContext.ts`

**Automatically injects brand identity into all AI prompts:**
- Brand colors (primary, secondary, accent)
- Visual style (minimalist, modern, etc.)
- Tone & voice (professional, quirky, etc.)
- Target audience
- Industry context
- Key offerings
- Off-limit topics

**Example Enhanced Prompt:**
```
User Input: "Create a product launch image"

Enhanced Prompt:
"Create a product launch image, minimalist aesthetic, brand colors #0A66FF and #6B46C1, 
professional mood, SaaS industry context, high quality, professional, clean composition, 
avoid: politics, religion, controversial topics"
```

---

## 🎨 **Brand Identity System**

**Component:** `src/components/settings/BrandIdentitySettings.tsx`

**Features:**
- ✅ Define core brand colors (primary, secondary, accent, background, text)
- ✅ Add unlimited custom colors (hex input + color picker)
- ✅ Live palette preview
- ✅ Auto-saves to `profiles.color_palette` (JSONB)
- ✅ Used by AI for image generation

**Stored in Database:**
```json
{
  "primary": "#0A66FF",
  "secondary": "#6B46C1",
  "accent": "#2ECC71",
  "background": "#FFFFFF",
  "text": "#1A1A1A",
  "custom": ["#FF5733", "#33FF57", "#3357FF"]
}
```

---

## 📦 **State Management**

### **React Query (Data Fetching)**

**Configuration:** `src/main.tsx`
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 minutes
      cacheTime: 10 * 60 * 1000,   // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});
```

**Custom Hooks Pattern:**
```typescript
export function useMarketingPosts(platform?: Platform) {
  return useQuery({
    queryKey: ["marketing-posts", platform],
    queryFn: async () => {
      let query = supabase
        .from("marketing_posts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (platform && platform !== "all") {
        query = query.eq("platform", platform);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}
```

### **Context API (Global State)**

**`src/contexts/AuthContext.tsx`:**
- User authentication state
- Profile data
- Login/logout functions
- Protected route logic

---

## 🖼️ **File Storage (Supabase Storage)**

### **Bucket: `marketing-images`**

**RLS Policies:**
```sql
-- Users can upload to their own folder
CREATE POLICY "Users can upload own images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'marketing-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Anyone can view images (for sharing)
CREATE POLICY "Public can view images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'marketing-images');
```

**Upload Pattern:**
```typescript
const { data, error } = await supabase.storage
  .from("marketing-images")
  .upload(`${userId}/marketing/${timestamp}-${filename}`, blob, {
    contentType: "image/png",
    upsert: false,
  });

const { data: { publicUrl } } = supabase.storage
  .from("marketing-images")
  .getPublicUrl(data.path);
```

---

## 🔑 **Environment Variables**

**Required in `.env.local`:**
```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# AI APIs
VITE_GEMINI_API_KEY=your_gemini_key           # For Gemini text generation
VITE_OPENROUTER_API_KEY=sk-or-v1-your-key    # For OpenRouter (text + image)

# App
VITE_APP_URL=https://www.eera-os.com          # For OpenRouter analytics
```

---

## 🧪 **Testing Checklist**

### **Marketing Hub - Image Generation**
1. ✅ Set `VITE_OPENROUTER_API_KEY` in `.env.local`
2. ✅ Ensure Supabase Storage bucket `marketing-images` exists
3. ✅ Go to Marketing Hub → "Create Post"
4. ✅ Select "Image" content type
5. ✅ Enter headline and key points
6. ✅ Click "Next" → Model selection
7. ✅ Choose "Gemini 2.0 Flash Image (FREE)"
8. ✅ Select aspect ratio (1:1 for testing)
9. ✅ Click "Generate"
10. ✅ Wait 5-10 seconds
11. ✅ Check console for: `[OpenRouter Image] Generation complete`
12. ✅ Verify image appears in preview
13. ✅ Save to drafts
14. ✅ Check "Drafts" section for saved post
15. ✅ Verify image loads in drafts

### **HR Hub - AI Features**
1. ✅ Set `VITE_GEMINI_API_KEY` in `.env.local`
2. ✅ Go to HR Hub → "Hiring & Screening" tab
3. ✅ Test "Job Description Generator"
4. ✅ Test "Resume Screener"
5. ✅ Test "Offer Letter Generator"

---

## 🚀 **Deployment**

### **Frontend (Vercel)**
```bash
npm run build
vercel deploy --prod
```

**Environment Variables:**
- Set all `VITE_*` variables in Vercel dashboard

### **Backend (Supabase)**
- Already hosted on Supabase Cloud
- Migrations applied via Supabase CLI:
```bash
supabase db push
```

---

## 📊 **Performance Optimizations**

1. **React Query Caching:**
   - Queries cached for 5 minutes
   - Reduces redundant API calls

2. **Lazy Loading:**
   - Route-based code splitting
   - Dynamic imports for heavy components

3. **Image Optimization:**
   - Base64 images converted to blobs before upload
   - Supabase Storage CDN for fast delivery

4. **API Rate Limiting:**
   - Gemini: Free tier (15 RPM for Flash models)
   - OpenRouter: Varies by model (check dashboard)

---

## 🐛 **Common Issues & Fixes**

### **Issue: "Gemini model not found" (404)**
**Fix:** Auto-resolution in `gemini.ts` tries multiple model names
```typescript
const MODEL_PRIORITY = [
  "gemini-2.5-flash",
  "gemini-2.0-flash-exp",
  "gemini-1.5-flash",
  "gemini-pro",
];
```

### **Issue: "OpenRouter 405 Method Not Allowed"**
**Fix:** Use `/chat/completions` endpoint with `modalities: ["image", "text"]`
- See `OPENROUTER_IMAGE_GENERATION_FIX.md`

### **Issue: Images not appearing in drafts**
**Fix:** Ensure `media_urls` is stored as JSON array:
```typescript
media_urls: [publicUrl]  // Array, not string
```

### **Issue: Brand colors not applying to AI images**
**Fix:** Ensure `color_palette` is set in user profile:
```typescript
const { data: profile } = useBrandProfile();
console.log(profile?.color_palette); // Should be object
```

---

## 📚 **Key Documentation Files**

- `ONBOARDING_FIX.md` - User onboarding flow
- `SUPABASE_AUTH_SETUP.md` - Authentication setup
- `VERCEL_DEPLOYMENT.md` - Deployment instructions
- `GEMINI_AI_INTEGRATION.md` - HR Hub AI features
- `SALES_HUB_IMPLEMENTATION.md` - Sales Hub setup
- `MARKETING_AI_SETUP.md` - Marketing Hub AI setup
- `OPENROUTER_SETUP.md` - OpenRouter API setup
- `OPENROUTER_IMAGE_GENERATION_FIX.md` - Image generation fix
- `TECH_OVERVIEW.md` - This file

---

## 🎯 **Next Steps (Roadmap)**

### **Marketing Hub:**
- [ ] LinkedIn API integration (real metrics)
- [ ] Instagram API integration (real metrics)
- [ ] Buffer API for post scheduling
- [ ] Video generation (Luma/Runway/Creatomate)
- [ ] AI-powered "Run Next Action"

### **Sales Hub:**
- [ ] LinkedIn Sales Navigator integration
- [ ] Email automation (SendGrid/Postmark)
- [ ] CRM sync (HubSpot/Salesforce)

### **HR Hub:**
- [ ] Resume parsing (structured data extraction)
- [ ] Interview scheduling automation
- [ ] Offer letter e-signatures (DocuSign)

### **Finance Hub:**
- [ ] Stripe/PayPal integration
- [ ] Automated invoice generation
- [ ] Expense approval workflow

---

## 🤝 **Contributing**

### **Code Style:**
- TypeScript strict mode
- ESLint + Prettier
- Component naming: PascalCase
- File naming: kebab-case for utilities, PascalCase for components

### **Git Workflow:**
- Feature branches: `feature/marketing-hub-ai`
- Bug fixes: `fix/openrouter-405-error`
- Commit messages: Conventional Commits format
  ```
  feat(marketing): add OpenRouter image generation
  fix(openrouter): correct endpoint for image generation
  docs(tech): add comprehensive tech overview
  ```

---

## 📞 **Support**

- **Issues:** GitHub Issues
- **Docs:** `/docs` folder
- **API Docs:**
  - [Supabase Docs](https://supabase.com/docs)
  - [OpenRouter Docs](https://openrouter.ai/docs)
  - [Gemini API Docs](https://ai.google.dev/docs)

---

**Last Updated:** 2025-10-30
**Version:** 1.0.0
**Status:** ✅ Production Ready

