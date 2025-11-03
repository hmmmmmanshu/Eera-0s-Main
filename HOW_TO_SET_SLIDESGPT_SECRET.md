# 🔑 Step-by-Step: Set SlidesGPT API Key in Supabase

## 🎯 **The Exact Path You Need**

### **Quick Method (Copy-Paste URL):**

Replace `YOUR_PROJECT_REF` with your Supabase project reference ID (found in `supabase/config.toml`):

```
https://supabase.com/dashboard/project/YOUR_PROJECT_REF/functions
```

Then click **"Settings"** tab → **"Secrets"** section → **"Add Secret"**

---

## 📋 **Detailed Steps with Screenshots Description**

### **Step 1: Log into Supabase Dashboard**
1. Go to: https://supabase.com/dashboard
2. Sign in with your account
3. You'll see your projects list

### **Step 2: Open Your Project**
1. Click on your project (likely named something like "Eera OS" or has the ref ID `ipavaemirwcimwwfhaec`)
2. You'll land on the project dashboard

### **Step 3: Navigate to Edge Functions**
**Option A: Left Sidebar Navigation**
- Look at the **left sidebar menu**
- Scroll down to find **"Edge Functions"** (it might be under "Project" or "Development")
- Click on **"Edge Functions"**

**Option B: Direct URL**
- Use this URL pattern (replace with your project ref):
```
https://supabase.com/dashboard/project/ipavaemirwcimwwfhaec/functions
```

### **Step 4: Go to Settings/Secrets**
Once on the Edge Functions page:
1. Look for tabs at the top: **"Functions"** | **"Settings"** | **"Logs"**
2. Click on **"Settings"** tab
3. You'll see a section called **"Secrets"** or **"Environment Variables"**

### **Step 5: Add the Secret**
In the Secrets section:
1. You'll see a form with two fields:
   - **Name/Key:** Type `SLIDESGPT_API_KEY` (exact, case-sensitive)
   - **Value:** Paste your SlidesGPT API key
2. Click **"Add Secret"** or **"Save"** button
3. You should see it appear in the list below (value will be hidden as dots/asterisks)

---

## 🔍 **Alternative Locations (If Not Found Above)**

### **Location 1: Project Settings → API**
1. Click **"Settings"** (gear icon) in left sidebar
2. Click **"API"** section
3. Look for **"Edge Functions"** submenu
4. Find **"Secrets"** or **"Environment Variables"**

### **Location 2: Project Settings → General**
1. Settings → General
2. Scroll to find **"Edge Functions"** section
3. Click to expand
4. Look for **"Secrets"** option

### **Location 3: Functions → Individual Function**
1. Edge Functions → Click on `slidesgpt-generate` function
2. Look for **"Settings"** or **"Configuration"** in the function details
3. Find **"Secrets"** section

---

## 🖥️ **What You're Looking For**

The Secrets section should look like this:

```
┌─────────────────────────────────────────┐
│  Edge Functions Secrets                  │
├─────────────────────────────────────────┤
│  Name              Value                 │
│  ─────────────────────────────────────  │
│  SLIDESGPT_API_KEY •••••••••••••••••    │
│                                          │
│  [Add Secret] Button                    │
│  Name: [_____________]                   │
│  Value: [_____________]                  │
│         [Add]                            │
└─────────────────────────────────────────┘
```

---

## ✅ **Verification Steps**

After adding the secret:

1. **Check It Exists:**
   - Go back to Edge Functions → Settings
   - You should see `SLIDESGPT_API_KEY` in the list

2. **Deploy Function (if not done):**
   - Go to Edge Functions → Functions tab
   - Find `slidesgpt-generate`
   - Click **"Deploy"** button (or check if already deployed)

3. **Test:**
   - Go to your app: Finance Hub → Pitch Analysis
   - Generate a pitch deck
   - Should work now! ✅

---

## 📞 **If You Still Can't Find It**

**Try this:**
1. In Supabase Dashboard, use the **search bar** (top right)
2. Type: `secrets` or `edge functions secrets`
3. Or contact Supabase support via chat in dashboard

**Or use CLI** (if you install Supabase CLI later):
```bash
supabase secrets set SLIDESGPT_API_KEY=your_key_here --project-ref ipavaemirwcimwwfhaec
```

---

## 🎯 **Your Project Info**

From your `supabase/config.toml`:
- **Project ID:** `ipavaemirwcimwwfhaec`
- **Direct URL to try:**
  ```
  https://supabase.com/dashboard/project/ipavaemirwcimwwfhaec/functions
  ```

**Good luck! The secrets section should be right there in Edge Functions → Settings tab.** 🚀

