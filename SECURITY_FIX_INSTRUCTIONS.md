# 🚨 CRITICAL SECURITY BREACH - API KEY EXPOSED

## ⚠️ Issue Detected

GitGuardian has detected your **Google Gemini API Key** was exposed in your GitHub repository:
- Repository: `hmmmmmanshu/Eera-0s-Main`
- Commits: `af9f3c8` and `be4d912` 
- Exposed: `.env` file with `VITE_GEMINI_API_KEY`
- Date: October 30, 2025

---

## ✅ IMMEDIATE ACTIONS REQUIRED (Do These NOW)

### Step 1: Revoke the Exposed API Key (URGENT)

1. **Go to Google AI Studio:**
   - Visit: https://makersuite.google.com/app/apikey
   - Log in with your Google account

2. **Find the Exposed Key:**
   - Look for the key that starts with `AIza...`
   - It should match the key that was in your `.env` file

3. **DELETE the Key:**
   - Click the trash/delete icon next to the key
   - Confirm deletion
   - **This key is now permanently disabled**

4. **Create a New Key:**
   - Click "Create API Key"
   - Select your project
   - Copy the NEW key immediately (you won't see it again)

### Step 2: Update Your Local Environment

1. **Create `.env.local` (This is gitignored by default):**
```bash
# In your project root
VITE_GEMINI_API_KEY=YOUR_NEW_KEY_HERE
```

2. **NEVER use `.env` for secrets again - Use `.env.local` instead**

---

## 🧹 CLEANUP: Remove .env from Git History

The `.env` file is in your git history (commits `af9f3c8` and `be4d912`). You need to remove it completely.

### Option 1: BFG Repo-Cleaner (RECOMMENDED - Easier)

1. **Download BFG:**
   - Visit: https://rtyley.github.io/bfg-repo-cleaner/
   - Download `bfg-1.14.0.jar`

2. **Backup your repo:**
```powershell
cd C:\Users\DELL\Desktop
cp -r acharya-founder-os-main acharya-founder-os-main-BACKUP
```

3. **Run BFG:**
```powershell
cd C:\Users\DELL\Desktop\acharya-founder-os-main
java -jar path\to\bfg-1.14.0.jar --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

4. **Force push to GitHub:**
```powershell
git push --force origin main
```

---

### Option 2: git filter-repo (More Control)

1. **Install git-filter-repo:**
```powershell
pip install git-filter-repo
```

2. **Remove .env from history:**
```powershell
git filter-repo --path .env --invert-paths --force
```

3. **Force push:**
```powershell
git push --force origin main
```

---

### Option 3: Manual (If above don't work)

**⚠️ WARNING: This rewrites git history. Coordinate with team first!**

```powershell
# Remove .env from all commits
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push
git push --force --all origin
```

---

## 🔒 SECURITY BEST PRACTICES (Prevent Future Leaks)

### 1. Always Use `.env.local` for Secrets

✅ **CORRECT:**
```
.env.local         # API keys, secrets (gitignored)
.env.development   # Non-secret dev configs (can commit)
.env.production    # Non-secret prod configs (can commit)
```

❌ **WRONG:**
```
.env               # Too generic, people accidentally commit it
```

### 2. Update Your `.gitignore`

Add these lines to `.gitignore` (already done, but verify):
```gitignore
# Environment variables
.env
.env.local
.env.*.local
.env.development.local
.env.test.local
.env.production.local

# Never commit these
**/*.env
```

### 3. Create `.env.example` Template

Create a safe template for team members:

```bash
# .env.example (safe to commit)
VITE_GEMINI_API_KEY=your_gemini_key_here
VITE_OPENAI_API_KEY=your_openai_key_here
VITE_STABILITY_API_KEY=your_stability_key_here
VITE_LEONARDO_API_KEY=your_leonardo_key_here
```

Commit this so teammates know what keys they need.

### 4. Use Git Pre-Commit Hooks

Install `gitleaks` to scan for secrets before commits:

```powershell
# Using pre-commit framework
pip install pre-commit

# Create .pre-commit-config.yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.0
    hooks:
      - id: gitleaks

# Install hooks
pre-commit install
```

### 5. Set Up GitHub Secret Scanning

1. Go to your repo settings
2. Security → Code security and analysis
3. Enable "Secret scanning"
4. Enable "Push protection" (prevents pushes with secrets)

---

## 📋 VERIFICATION CHECKLIST

After completing the steps above, verify:

- [ ] Old API key is deleted from Google AI Studio
- [ ] New API key is in `.env.local` (NOT `.env`)
- [ ] App still works with new key (`npm run dev`)
- [ ] `.env` is removed from git history (use `git log -- .env`)
- [ ] `.env` is NOT in latest commit (`git show HEAD:.env` should fail)
- [ ] Forced pushed to GitHub
- [ ] GitGuardian alert is resolved (check email)
- [ ] `.env.example` exists (safe template for team)
- [ ] `.gitignore` includes `.env.local`

---

## 🚀 SAFE COMMIT NOW

After fixing everything:

```powershell
# Verify .env is NOT staged
git status

# Should see:
# Changes not staged for commit:
#   modified:   .env

# DO NOT git add .env
# Instead, commit only the safe files:

git add MARKETING_AI_SETUP.md MARKETING_HUB_PROMPT2.md src/ supabase/
git commit -m "feat(marketing): Implement AI content generation with multi-model support

- Extended Gemini for text generation (captions, hashtags)
- Added multi-model image generation (Gemini, DALL-E 3, SDXL, Leonardo)
- Refactored CreatePostModal with full AI integration
- Applied Supabase Storage migration for marketing images
- Added comprehensive setup documentation

Prompt #2 complete"

git push origin main
```

---

## 📞 NEED HELP?

If you're stuck:
1. Check GitGuardian email for more details
2. Contact GitHub support to mark incident as resolved
3. Review: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository

---

## 🎯 SUMMARY

**Immediate (NOW):**
1. ✅ Revoke old Gemini API key
2. ✅ Create new key
3. ✅ Add to `.env.local` (NOT `.env`)
4. ✅ Test app works

**Next (Within 1 hour):**
5. ⏳ Remove `.env` from git history (BFG/filter-repo)
6. ⏳ Force push to GitHub
7. ⏳ Verify GitGuardian alert resolved

**Long-term:**
8. ⏳ Set up pre-commit hooks
9. ⏳ Enable GitHub secret scanning
10. ⏳ Educate team on secret management

---

**DO NOT PROCEED with any git commits until you've revoked the old API key and removed it from history!**

