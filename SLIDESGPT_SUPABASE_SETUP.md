# 🔑 How to Set SlidesGPT API Key in Supabase

## 📍 **Exact Location in Supabase Dashboard**

### **Method 1: Project Settings → Edge Functions → Secrets** (Recommended)

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Log in to your account

2. **Select Your Project:**
   - Click on your project: `pqnjcombcbdruhixbabf` (or your project name)

3. **Navigate to Edge Functions:**
   - In the left sidebar, click **"Edge Functions"** (under "Project" section)
   - Or go directly to: `https://supabase.com/dashboard/project/pqnjcombcbdruhixbabf/functions`

4. **Go to Settings:**
   - Click the **"Settings"** tab (top right, next to "Functions" tab)
   - Or click on **"Secrets"** in the Edge Functions page

5. **Add Secret:**
   - You'll see a form with "Name" and "Value" fields
   - **Name:** Enter `SLIDESGPT_API_KEY` (exact name, case-sensitive)
   - **Value:** Paste your SlidesGPT API key
   - Click **"Add Secret"** or **"Save"**

### **Method 2: Project Settings → API → Secrets**

1. **Go to Project Settings:**
   - Click **"Settings"** (gear icon) in the left sidebar
   - Or go to: `https://supabase.com/dashboard/project/pqnjcombcbdruhixbabf/settings/general`

2. **Click "Edge Functions":**
   - Scroll down or find "Edge Functions" in the settings menu
   - Click on it

3. **Secrets Section:**
   - Find the "Secrets" or "Environment Variables" section
   - Click **"Add Secret"**
   - Enter:
     - **Key:** `SLIDESGPT_API_KEY`
     - **Value:** Your SlidesGPT API key
   - Click **"Save"**

### **Method 3: Direct URL (If Available)**

Try this direct URL (replace `pqnjcombcbdruhixbabf` with your project reference ID):
```
https://supabase.com/dashboard/project/pqnjcombcbdruhixbabf/functions/settings
```

---

## 🖼️ **Visual Guide**

**Path in Dashboard:**
```
Supabase Dashboard
  └─ Your Project (pqnjcombcbdruhixbabf)
      └─ Edge Functions (left sidebar)
          └─ Settings / Secrets Tab
              └─ Add Secret Button
                  └─ Name: SLIDESGPT_API_KEY
                  └─ Value: your_api_key_here
```

---

## ✅ **Verify It's Set**

After adding the secret:

1. **Check in Dashboard:**
   - Go back to Edge Functions → Settings
   - You should see `SLIDESGPT_API_KEY` listed (value will be hidden with dots or asterisks)

2. **Test the Function:**
   - Deploy the function first (if not already):
     ```bash
     # If you have Supabase CLI installed:
     supabase functions deploy slidesgpt-generate
     ```
   - Or deploy via Dashboard: Edge Functions → slidesgpt-generate → Deploy

---

## 🚀 **After Setting the Secret**

### **Deploy the Function**

**Option A: Via Supabase Dashboard**
1. Go to **Edge Functions**
2. Find `slidesgpt-generate` function
3. Click **"Deploy"** button (if not already deployed)

**Option B: Via CLI** (if installed)
```bash
supabase functions deploy slidesgpt-generate
```

### **Test It**

1. Go to your app: Finance Hub → Pitch Analysis
2. Click "Generate Pitch Deck" tab
3. Fill in the form and generate
4. Should work without CORS errors now!

---

## 🔍 **If You Can't Find It**

**Try These:**
1. **Search in Dashboard:**
   - Use the search bar at the top
   - Type: "secrets" or "edge functions secrets"

2. **Check Project Settings:**
   - Settings → API
   - Settings → Integrations
   - Settings → Environment Variables

3. **Contact Support:**
   - Supabase has great docs: https://supabase.com/docs/guides/functions/secrets

---

## 📝 **What the Secret Does**

The `SLIDESGPT_API_KEY` secret:
- ✅ Is securely stored in Supabase (not exposed to frontend)
- ✅ Is accessible only to Edge Functions
- ✅ Avoids CORS issues by routing through Supabase
- ✅ Keeps your API key safe from browser/client access

---

## 🎯 **Quick Checklist**

- [ ] Got SlidesGPT API key from https://slidesgpt.com/
- [ ] Logged into Supabase Dashboard
- [ ] Navigated to Edge Functions → Settings/Secrets
- [ ] Added secret: `SLIDESGPT_API_KEY` = `your_key`
- [ ] Deployed `slidesgpt-generate` function
- [ ] Tested pitch deck generation in app

---

**Need Help?** The secret should be visible in Edge Functions → Settings. If you still can't find it, let me know and I can help with alternative methods!

