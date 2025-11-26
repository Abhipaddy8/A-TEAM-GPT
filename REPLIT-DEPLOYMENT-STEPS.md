# Replit Deployment - Step-by-Step Instructions

## Quick Reference

**TLDR - Deploy in 5 Steps:**
1. `git pull origin main`
2. `node test-diagnostic-flow.js` ← **Must pass!**
3. `npm run build`
4. Test on Replit
5. If issues: Run `DIAGNOSTIC-DEPLOYMENT-GUIDE.md` troubleshooting

---

## Pre-Deployment Checklist (Local Machine)

### Step 1: Pull Latest Changes
```bash
cd /Users/equipp/A-TEAM-GPT
git pull origin main
```

**Expected output:**
```
Already up to date.
OR
Fast-forward
 client/src/components/diagnostic-chat.tsx | XX +++
 server/routes.ts | YY +++
```

### Step 2: Verify Code is Correct
```bash
# Check that hardcoded scores were removed
grep -n "extractedScore: 5\|\"score\": 5" server/routes.ts | grep -v "YOUR_SCORE\|[NUMBER_1_TO_10]"
```

**Expected output:** *(empty - no matches)*

### Step 3: Start Dev Server
```bash
npm run dev
```

**Expected output:**
```
> rest-express@1.0.0 dev
> NODE_ENV=development tsx server/index.ts

[dotenv@17.2.3] injecting env (5) from .env
10:23:37 AM [express] serving on port 5000
```

### Step 4: Run Diagnostic Test (In Another Terminal)
```bash
# In new terminal window
cd /Users/equipp/A-TEAM-GPT
export API_BASE=http://localhost:5000
node test-diagnostic-flow.js
```

**Expected output:**
```
✅ Diagnostic flow is working correctly!
✅ Scores are dynamically generated from user answers.
```

**If test FAILS:**
- Stop here! Do NOT deploy to Replit
- Run `DIAGNOSTIC-DEPLOYMENT-GUIDE.md` troubleshooting section
- Fix issues locally first

### Step 5: Run End-to-End Test (Optional but Recommended)
```bash
export API_BASE=http://localhost:5000
node test-end-to-end.js
```

**Expected output:**
```
✅ Passed: 5/5
✅ 🎉 All tests passed! Diagnostic system is working correctly.
```

---

## Deployment to Replit

### Step 6: Push to GitHub
```bash
git push origin main
```

**Expected output:**
```
To https://github.com/Abhipaddy8/A-TEAM-GPT.git
   abc1234..def5678  main -> main
```

### Step 7: Pull on Replit
1. Go to https://replit.com/
2. Open your A-TEAM-GPT project
3. Open terminal in Replit
4. Run:
   ```bash
   git pull origin main
   ```

**Expected output:**
```
Fast-forward (or Already up to date)
 ...
```

### Step 8: Clear Replit Cache & Rebuild
```bash
# Kill any running processes
pkill -f "node"

# Clear build cache
rm -rf node_modules dist .vite

# Reinstall
npm install

# Build
npm run build
```

### Step 9: Start Replit Server
```bash
npm run dev
```

**Expected output:**
```
[express] serving on port 3000
```

### Step 10: Test on Replit
1. Open browser to your Replit preview URL
2. Click "Start diagnostic"
3. Answer questions with varied responses
4. Verify each answer gets a DIFFERENT score (not all 5s)
5. Check that final report shows varied scores

---

## Post-Deployment Verification

### Check 1: Scores Vary
- Run diagnostic
- Answer questions differently
- ✅ Scores should range from 1-10, not all 5s
- ✅ Weak answers (low effort) should give low scores
- ✅ Strong answers (good situation) should give high scores

### Check 2: Report Accuracy
- Complete diagnostic
- Submit email
- Check that report email has varied scores
- ✅ Overall score should match the situation (not always 50)

### Check 3: Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Refresh page
4. Complete diagnostic
5. Look for: `[Scores] Calculated scores:` messages
6. ✅ Should show varied numbers, not all 5s

---

## If Something Goes Wrong

### Symptom: Scores Still All 5s

**Step 1: Check Git Status**
```bash
git status
```

Should show "Your branch is up to date with 'origin/main'"

**Step 2: Force Update**
```bash
git fetch origin
git reset --hard origin/main
```

**Step 3: Clear Cache & Rebuild**
```bash
pkill -f "node"
rm -rf node_modules dist .vite
npm install
npm run build
npm run dev
```

**Step 4: Test Again**
```bash
node test-diagnostic-flow.js
```

### Symptom: Diagnostic Not Running

**Check Logs:**
```bash
# Look for error messages
tail -f replit.nix
# or
journalctl -f -u node
```

**Common Issues:**
- Missing .env file → Copy from backup or add to Replit Secrets
- Port in use → Kill: `pkill -f "node"`
- Dependencies → Run: `npm install`

### Symptom: Email Not Sending

This is NOT related to the diagnostic scoring fix, but for reference:
- Check GHL API key in .env
- Check email address is valid
- Check GoHighLevel service status

**Related file:** `DIAGNOSTIC-DEPLOYMENT-GUIDE.md`

---

## Cross-Deployment (Replit → Claude Code)

If working on both Replit and Claude Code:

### Push from Replit to GitHub
```bash
git add -A
git commit -m "Your message"
git push origin main
```

### Pull on Claude Code Machine
```bash
cd /Users/equipp/A-TEAM-GPT
git pull origin main
npm install
node test-diagnostic-flow.js  # Verify it works
```

### Important Notes
- Always test locally before pushing
- Run `test-diagnostic-flow.js` on both machines
- Use this **exact same deployment process** on both platforms

---

## Rollback (If Needed)

If you accidentally broke something:

```bash
# See recent commits
git log --oneline -5

# Revert to previous working version
git reset --hard <commit-hash>

# For example:
git reset --hard 4fc3fef

# Force push (only if necessary)
git push origin main --force
```

---

## Quick Commands Reference

| Task | Command |
|------|---------|
| Test diagnostic | `node test-diagnostic-flow.js` |
| Test end-to-end | `node test-end-to-end.js` |
| Check hardcoding | `grep "score: 5" server/routes.ts` |
| Pull changes | `git pull origin main` |
| Rebuild | `rm -rf node_modules dist && npm install` |
| Clear cache | `rm -rf .vite .cache node_modules` |
| Start server | `npm run dev` |
| Kill server | `pkill -f "node"` |
| Check git status | `git status` |
| View recent commits | `git log --oneline -5` |

---

## Testing Checklist

Before considering deployment successful:

- [ ] Local test passes: `node test-diagnostic-flow.js`
- [ ] End-to-end test passes: `node test-end-to-end.js`
- [ ] Replit server starts: `npm run dev`
- [ ] Can run diagnostic on Replit preview
- [ ] Scores vary (not all 5s)
- [ ] Report email shows correct scores
- [ ] Browser console shows debug logs (no errors)
- [ ] No hardcoded `"score": 5` in code

---

## Support

**For detailed troubleshooting:**
- See: `DIAGNOSTIC-DEPLOYMENT-GUIDE.md`

**For overall fix summary:**
- See: `HARDCODING-FIX-SUMMARY.md`

**For local development:**
- See: `README.md`

---

**Last Updated:** 2025-11-26
**Status:** ✅ All Tests Passing
**Confidence Level:** Very High
