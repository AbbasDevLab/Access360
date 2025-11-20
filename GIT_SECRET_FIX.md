# Fix Git Secret Scanning Error

## Problem
GitHub detected an OpenAI API key in your commit history and is blocking the push.

## Solution Options

### Option 1: Use GitHub's Unblock Feature (Easiest)
1. Go to the link provided in the error:
   ```
   https://github.com/AbbasDevLab/Access360/security/secret-scanning/unblock-secret/35lGzRfTZ2XhgaLxDvCE67M6huU
   ```
2. Follow the instructions to unblock the secret for this push
3. **Then immediately create a `.env` file** (see ENV_SETUP.md)

### Option 2: Remove Secret from Git History (Recommended)
Since the API key is now moved to environment variables, you should remove it from git history:

**⚠️ Warning:** This rewrites git history. Only do this if you're the only one working on this branch.

```bash
# Install git-filter-repo if you don't have it
# pip install git-filter-repo

# Remove the secret from all commits
git filter-repo --path src/services/ocrService.ts --invert-paths
# Then re-add the file without the secret
git add src/services/ocrService.ts
git commit -m "Remove API key from code, use environment variable"

# Force push (be careful!)
git push origin main --force
```

### Option 3: Create New Branch Without History
1. Create a fresh branch from current state:
   ```bash
   git checkout --orphan main-clean
   git add .
   git commit -m "Initial commit without secrets"
   git branch -D main
   git branch -m main
   git push origin main --force
   ```

### Option 4: Use BFG Repo-Cleaner
```bash
# Download BFG Repo-Cleaner
# Then run:
bfg --replace-text passwords.txt
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin main --force
```

---

## ✅ What Was Fixed

1. ✅ Removed hardcoded API key from `src/services/ocrService.ts`
2. ✅ Updated to use `VITE_OPENAI_API_KEY` environment variable
3. ✅ Added `.env` to `.gitignore`
4. ✅ Created `.env.example` template file
5. ✅ Added error handling for missing API key

---

## Next Steps

1. **Create your `.env` file** (see ENV_SETUP.md)
2. Add your API key to `.env`:
   ```
   VITE_OPENAI_API_KEY=your_actual_api_key_here
   ```
3. Choose one of the solutions above to fix git history
4. Restart your dev server: `npm run dev`

---

## Important Notes

- The API key is now stored in `.env` which is **not** committed to git
- Always use `.env.example` as a template (without real secrets)
- Never commit `.env` file
- The secret is still in old commits - you need to remove it from history

