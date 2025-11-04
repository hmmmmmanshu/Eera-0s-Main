# 🚀 Quick Deploy: SlidesGPT Edge Function

## ✅ Function Code Ready
The function code is in: `supabase/functions/slidesgpt-generate/index.ts`

## 📋 Simple Steps (2 minutes)

### **Step 1: Go to Supabase Dashboard**
```
https://supabase.com/dashboard/project/ipavaemirwcimwwfhaec/functions
```

### **Step 2: Deploy Function**
1. Click **"Deploy a new function"** or **"New function"** button
2. Choose **"Via Editor"**
3. Function name: `slidesgpt-generate`
4. **Copy the entire code from** `supabase/functions/slidesgpt-generate/index.ts`
5. Paste it into the editor
6. Click **"Deploy function"** button
7. Wait 10-30 seconds

### **Step 3: Verify Secret is Set**
1. Click **"Settings"** tab (top right)
2. Check if `SLIDESGPT_API_KEY` is in the Secrets list
3. If not, add it:
   - Name: `SLIDESGPT_API_KEY`
   - Value: Your SlidesGPT API key
   - Click "Add Secret"

### **Step 4: Test**
1. Go back to your app
2. Finance Hub → Pitch Analysis → Generate Pitch Deck
3. Should work now! ✅

---

## 📝 Function Code Location
```
supabase/functions/slidesgpt-generate/index.ts
```

Just copy-paste this entire file content into the Dashboard editor.


