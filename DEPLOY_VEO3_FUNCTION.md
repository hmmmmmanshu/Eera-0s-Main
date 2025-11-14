# 🚀 Deploy VEO 3 Edge Function

## ⚠️ **The function must be deployed for video generation to work!**

The CORS error you're seeing means the function either:
1. ❌ Not deployed yet
2. ❌ Deployed but missing the `GEMINI_API_KEY` secret
3. ❌ Has an error in the code

---

## 📋 **Step-by-Step Deployment**

### **Method 1: Supabase Dashboard (Easiest)**

1. **Go to Supabase Dashboard:**
   - Visit your Supabase project dashboard
   - Navigate: **Edge Functions** → **Functions**

2. **Create the Function:**
   - Click **"Create a new function"** or **"Deploy function"**
   - Function name: `veo3-generate-video`
   - Either:
     - **Option A:** Upload the `supabase/functions/veo3-generate-video/index.ts` file
     - **Option B:** Copy-paste the code from the file into the editor

3. **Set the Secret:**
   - Go to **Settings** tab (in Edge Functions page)
   - Find **"Secrets"** section
   - Click **"Add Secret"**
   - Name: `GEMINI_API_KEY`
   - Value: Your Gemini API key (same one used for image generation)
   - Click **"Save"**

4. **Deploy:**
   - Go back to **Functions** tab
   - Find `veo3-generate-video`
   - Click **"Deploy"** button

---

### **Method 2: Supabase CLI** (If installed)

```bash
# 1. Set the secret (replace YOUR_PROJECT_REF with your actual project reference)
supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here --project-ref YOUR_PROJECT_REF

# 2. Deploy the function
supabase functions deploy veo3-generate-video --project-ref YOUR_PROJECT_REF
```

---

## ✅ **Verify Deployment**

After deploying:

1. **Check Function Status:**
   - Edge Functions → Functions tab
   - `veo3-generate-video` should show as "Active" or "Deployed"

2. **Test the Function:**
   - Click on `veo3-generate-video`
   - Use the "Invoke" button with test data:
     ```json
     {
       "prompt": "A serene landscape with mountains",
       "modelName": "veo-3.0-generate"
     }
     ```

3. **Check Logs:**
   - Edge Functions → Logs tab
   - Look for any errors when the function is called

---

## 🐛 **Common Issues**

### **Issue: Function Not Found (404)**
- **Solution:** Make sure the function is deployed and the name matches exactly: `veo3-generate-video`

### **Issue: API Key Not Configured**
- **Solution:** Set the `GEMINI_API_KEY` secret in Supabase Dashboard → Edge Functions → Settings → Secrets

### **Issue: CORS Error Still Appearing**
- **Solution:** 
  1. Verify the function is deployed
  2. Check that your frontend is calling `supabase.functions.invoke("veo3-generate-video", ...)`
  3. Ensure `VITE_SUPABASE_URL` is set in your environment variables

### **Issue: VEO 3 Model Not Found**
- **Solution:** 
  - Try `veo-3.0-generate-preview` instead of `veo-3.0-generate`
  - Verify you have access to VEO 3 in Google AI Studio
  - Check that billing is enabled (VEO 3 is paid preview)

---

## 📝 **Notes**

- **VEO 3 Pricing:** $0.75 per second of video generated
- **Generation Time:** Videos typically take 30-60 seconds to generate
- **Model Names:** 
  - `veo-3.0-generate` (standard)
  - `veo-3.0-generate-preview` (preview version)
  - `veo-3.0-fast-generate` (faster, coming soon)

---

## 🔗 **References**

- [VEO 3 Announcement](https://developers.googleblog.com/en/veo-3-now-available-gemini-api/)
- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)

