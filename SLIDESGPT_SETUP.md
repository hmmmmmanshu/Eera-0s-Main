# SlidesGPT Pitch Deck Generation - Setup Guide

## ✅ What's Been Implemented

### **1. SlidesGPT API Client** (`src/lib/slidesgpt.ts`)
- Unified interface for SlidesGPT API
- Presentation generation with customizable prompts
- Theme selection (default, modern, professional, creative, minimal)
- Slide count configuration
- Embed and download URL handling

### **2. Enhanced PitchDeckAnalyzer Component**
- **Two tabs:** Generate Pitch Deck & Analyze Existing
- **Generate Tab Features:**
  - Auto-filled company context (company name, cash balance, runway, burn rate)
  - User input collection:
    - Pitch topic/theme (required)
    - Key points (dynamic list)
    - Target audience
    - Funding ask
    - Use of funds
    - Additional context
  - Theme and slide count customization
  - Embedded presentation preview
  - Download PowerPoint button
  - Open in new tab option

### **3. Smart Prompt Builder**
- Automatically combines:
  - Company context from `company_info` table
  - Financial data from `finance_runway` table
  - User-provided inputs
  - Creates comprehensive pitch deck prompts

---

## 🔧 Setup Instructions

### **Step 1: Get SlidesGPT API Key** (5 minutes)

1. **Go to:** https://slidesgpt.com/
2. **Sign Up / Log In:** Create an account or log in
3. **Navigate to:** API Keys section (usually in Settings or Dashboard)
4. **Generate API Key:** Click "Create New Key" or "Generate API Key"
5. **Copy the key:** Save it securely (format may vary)

**Note:** Check SlidesGPT documentation for current API key location:
- https://slidesgpt.com/docs/getting-started/authentication

---

### **Step 2: Add API Key to Your Project**

1. **Create/Update `.env.local` file** in project root:
```bash
# In your terminal:
touch .env.local
```

2. **Add SlidesGPT API key:**
```bash
# SlidesGPT API Key (REQUIRED for pitch deck generation)
VITE_SLIDESGPT_API_KEY=your_slidesgpt_api_key_here

# Your existing keys (keep these)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
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

### **Step 3: Verify Setup**

#### **Test 1: Check Environment Variable** ✅
```bash
# In browser console (after app loads):
console.log(import.meta.env.VITE_SLIDESGPT_API_KEY)
# Should show your key (in production, use proper security practices)
```

#### **Test 2: Generate Pitch Deck** ✅
1. Go to **Finance Hub** → **Pitch Analysis** tab
2. Click **"Generate Pitch Deck"** tab
3. Fill in the form:
   - **Topic:** "Seed funding round" (required)
   - **Key Points:** Add 2-3 points
   - **Target Audience:** "Seed-stage VCs"
   - **Funding Ask:** "$2M seed round"
   - **Use of Funds:** "40% product, 30% marketing, 20% team, 10% ops"
4. Click **"Generate Pitch Deck"**
5. Wait for generation (usually 30-60 seconds)
6. View embedded presentation
7. Click **"Download PowerPoint"** to download

---

## 📝 API Endpoint Details

### **Generate Presentation**
```
POST https://api.slidesgpt.com/v1/presentations/generate
Authorization: Bearer {VITE_SLIDESGPT_API_KEY}
Content-Type: application/json

Body:
{
  "prompt": "Your comprehensive pitch deck prompt...",
  "theme": "professional", // default | modern | professional | creative | minimal
  "slides": 10 // 5-30
}
```

### **Response Format**
```json
{
  "presentation": {
    "id": "pres_abc123",
    "embed_url": "https://slidesgpt.com/embed/pres_abc123",
    "download_url": "https://slidesgpt.com/download/pres_abc123",
    "title": "Generated Pitch Deck",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "message": "Presentation generated successfully"
}
```

---

## 🎨 How It Works

### **1. Company Context Auto-Fill**
When you open the Generate tab, the system automatically pulls:
- Company name from `company_info` table
- Cash balance from `finance_runway` table
- Runway (months) from `finance_runway` table
- Monthly burn rate from `finance_runway` table

### **2. User Inputs**
The form collects:
- **Topic** (required): Main focus of the pitch
- **Key Points**: Dynamic list of highlights (growth metrics, milestones, etc.)
- **Target Audience**: Who you're pitching to
- **Funding Ask**: How much you're raising
- **Use of Funds**: Breakdown of fund allocation
- **Additional Context**: Any extra information

### **3. Prompt Building**
The `buildPitchDeckPrompt()` function combines all inputs into a comprehensive prompt that includes:
- Company overview
- Financial highlights
- Key points
- Target audience
- Funding ask and use of funds
- Standard pitch deck sections (Problem, Solution, Market, Traction, Team, Ask, Vision)

### **4. Generation**
- Sends request to SlidesGPT API
- Shows loading state during generation
- Displays embedded presentation when ready
- Provides download and open-in-tab options

---

## 💰 Pricing & Limits

**Check SlidesGPT website for current pricing:**
- https://slidesgpt.com/pricing
- Free tier usually includes limited generations
- Paid plans for production use

---

## 🔒 Security Notes

1. **Never commit `.env.local`** to Git
2. **API Key Security:**
   - Keep keys secure
   - Rotate keys if exposed
   - Use environment variables in production (not hardcoded)

3. **Production Deployment:**
   - Set `VITE_SLIDESGPT_API_KEY` as environment variable in hosting platform
   - Vercel: Project Settings → Environment Variables
   - Netlify: Site Settings → Environment Variables
   - Other platforms: Follow their environment variable setup

---

## 🐛 Troubleshooting

### **Error: "SlidesGPT API key not configured"**
- ✅ Check `.env.local` file exists
- ✅ Verify key is named `VITE_SLIDESGPT_API_KEY`
- ✅ Restart dev server after adding key
- ✅ Check browser console for import errors

### **Error: "Failed to generate presentation: 401 Unauthorized"**
- ✅ Verify API key is correct
- ✅ Check if key has expired or been revoked
- ✅ Regenerate key from SlidesGPT dashboard

### **Error: "Failed to generate presentation: 429 Too Many Requests"**
- ✅ You've hit rate limits
- ✅ Wait a few minutes and try again
- ✅ Consider upgrading plan if consistently hitting limits

### **Generated deck doesn't appear**
- ✅ Check browser console for errors
- ✅ Verify embed_url is valid
- ✅ Try opening in new tab to test

---

## 🚀 Next Steps

1. **Get your API key** from SlidesGPT
2. **Add to `.env.local`**
3. **Restart dev server**
4. **Test generation** in Finance Hub
5. **Customize themes and slide counts** as needed

---

## 📚 Additional Resources

- **SlidesGPT Documentation:** https://slidesgpt.com/docs/getting-started/introduction
- **API Reference:** https://slidesgpt.com/docs/api-reference
- **Authentication Guide:** https://slidesgpt.com/docs/getting-started/authentication

---

**Need Help?** Check the troubleshooting section or refer to SlidesGPT documentation for API-specific issues.

