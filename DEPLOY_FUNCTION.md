# 🚀 Deploy SlidesGPT Edge Function

## ⚠️ **The function must be deployed for it to work!**

The CORS error you're seeing means the function either:
1. ❌ Not deployed yet
2. ❌ Deployed but missing the `SLIDESGPT_API_KEY` secret
3. ❌ Has an error in the code

---

## 📋 **Step-by-Step Deployment**

### **Method 1: Supabase Dashboard (Easiest)**

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard/project/ipavaemirwcimwwfhaec/functions
   - Or navigate: Your Project → Edge Functions

2. **Upload the Function:**
   - Click **"Create a new function"** or **"Deploy function"**
   - Function name: `slidesgpt-generate`
   - Either:
     - **Option A:** Upload the `supabase/functions/slidesgpt-generate/index.ts` file
     - **Option B:** Copy-paste the code from the file into the editor

3. **Set the Secret:**
   - Go to **Settings** tab (in Edge Functions page)
   - Find **"Secrets"** section
   - Click **"Add Secret"**
   - Name: `SLIDESGPT_API_KEY`
   - Value: Your SlidesGPT API key
   - Click **"Save"**

4. **Deploy:**
   - Go back to **Functions** tab
   - Find `slidesgpt-generate`
   - Click **"Deploy"** button

---

### **Method 2: Supabase CLI** (If installed)

```bash
# 1. Set the secret
supabase secrets set SLIDESGPT_API_KEY=your_key_here --project-ref ipavaemirwcimwwfhaec

# 2. Deploy the function
supabase functions deploy slidesgpt-generate --project-ref ipavaemirwcimwwfhaec
```

---

## ✅ **Verify Deployment**

After deploying:

1. **Check Function Status:**
   - Edge Functions → Functions tab
   - `slidesgpt-generate` should show as "Active" or "Deployed"

2. **Test the Function:**
   - Click on `slidesgpt-generate`
   - Use the "Invoke" button or test it from your app

3. **Check Logs:**
   - Edge Functions → Logs tab
   - Look for any errors when the function is called

---

## 🐛 **Common Issues**

### **Issue: Function Not Found (404)**
**Solution:** Function not deployed. Deploy it via Dashboard or CLI.

### **Issue: 500 Error - API key not configured**
**Solution:** 
- Go to Edge Functions → Settings → Secrets
- Add `SLIDESGPT_API_KEY` with your key
- Redeploy the function

### **Issue: CORS Error Persists**
**Solution:**
- Make sure function is deployed and active
- Check function logs for errors
- Verify the origin `https://eera-0s-main.vercel.app` is in ALLOWED_ORIGINS

---

## 📝 **Quick Checklist**

- [ ] Function code is in `supabase/functions/slidesgpt-generate/index.ts`
- [ ] Function is deployed in Supabase Dashboard
- [ ] Secret `SLIDESGPT_API_KEY` is set in Edge Functions → Settings → Secrets
- [ ] Function shows as "Active" in Dashboard
- [ ] Tested from the app - should work now!

---

**Once deployed, the pitch deck generation should work!** 🎉

