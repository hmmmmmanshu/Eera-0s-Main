# 🚀 Deploying EERA OS to Vercel

## Required Environment Variables

Add these environment variables to your Vercel project:

### 1. **VITE_SUPABASE_URL**
```
https://pqnjcombcbdruhixbabf.supabase.co
```
- **Description**: Your Supabase project URL
- **Required**: Yes
- **Public**: Safe to expose (used in frontend)

### 2. **VITE_SUPABASE_PUBLISHABLE_KEY**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxbmpjb21iY2JkcnVoaXhiYWJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MDAyMjYsImV4cCI6MjA3NzI3NjIyNn0.JwwtQfZYCbuHGPzNwlUwc2cU9K1mG4UsCEaxWHMA9-I
```
- **Description**: Your Supabase anonymous/public API key
- **Required**: Yes
- **Public**: Safe to expose (used in frontend)

---

## 📋 Step-by-Step Vercel Deployment

### Option 1: Via Vercel Dashboard (Recommended)

1. **Go to your Vercel Dashboard**
   - Visit: https://vercel.com/dashboard

2. **Import Your GitHub Repository**
   - Click "Add New..." → "Project"
   - Select your repository: `hmmmmmanshu/Eera-0s-Main`

3. **Configure Build Settings**
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Add Environment Variables**
   - In the "Environment Variables" section, add:
   
   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | `https://pqnjcombcbdruhixbabf.supabase.co` |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (full key above) |

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (~2-3 minutes)

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# When prompted, add environment variables:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_PUBLISHABLE_KEY
```

---

## 🔧 Additional Configuration (Optional)

### Redirect Rules (vercel.json)

Create a `vercel.json` file in your project root for proper SPA routing:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures that all routes (like `/dashboard`, `/auth`, etc.) work correctly.

---

## ✅ Post-Deployment Checklist

After deploying, verify:

- [ ] **Authentication Works**
  - Test Sign Up at `https://your-app.vercel.app/auth?mode=signup`
  - Test Sign In at `https://your-app.vercel.app/auth?mode=login`

- [ ] **Database Connection**
  - Check browser console for any Supabase errors
  - Verify data loads on dashboard

- [ ] **Supabase Configuration**
  - Add your Vercel domain to Supabase Auth → URL Configuration
  - Go to: https://supabase.com/dashboard/project/pqnjcombcbdruhixbabf/auth/url-configuration
  - Add to "Site URL": `https://your-app.vercel.app`
  - Add to "Redirect URLs": `https://your-app.vercel.app/**`

- [ ] **RLS Policies**
  - Test that users can only access their own data
  - Verify all security policies are working

---

## 🔐 Security Notes

- ✅ **Safe to commit**: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
- ❌ **NEVER commit**: Service role keys, database passwords, or private API keys
- ✅ **Protected by RLS**: All database tables have Row Level Security enabled
- ✅ **Type-safe**: TypeScript types are generated and up-to-date

---

## 🐛 Troubleshooting

### Issue: "Invalid API Key" error
**Solution**: Double-check that environment variables are set correctly in Vercel dashboard

### Issue: Authentication redirect fails
**Solution**: Add your Vercel domain to Supabase Auth URL Configuration (see checklist above)

### Issue: Database queries fail
**Solution**: 
1. Check RLS policies are enabled
2. Verify user is authenticated
3. Check browser console for detailed error messages

### Issue: Build fails on Vercel
**Solution**: 
1. Check that all dependencies are in `package.json`
2. Verify `vite.config.ts` is correct
3. Check build logs for specific error messages

---

## 📞 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **GitHub Issues**: https://github.com/hmmmmmanshu/Eera-0s-Main/issues

---

## 🎉 Your EERA OS is Ready!

Once deployed, your app will be live at:
- **Production URL**: `https://eera-os-main.vercel.app` (or your custom domain)
- **Auto-deploys**: Every push to `main` branch triggers a new deployment
- **Preview URLs**: Every PR gets its own preview deployment

Happy deploying! 🚀

