# A-Team Diagnostics - Deployment & Cross-Platform Guide

## Overview

This guide prevents the **hardcoded diagnostics bug** that was recurring when deploying to Replit. This bug caused scores to always show as 5, regardless of user answers.

## Root Cause Analysis

**The Problem:** Scores were hardcoded to 5 in two places:

1. **Backend** (`server/routes.ts:386`) - AI prompt always used `"score": 5`
2. **Frontend** (`client/src/components/diagnostic-chat.tsx:452`) - Score calculation defaulted to 5 when data was missing

**Why it kept happening on Replit:**
- Changes in git weren't pulled properly
- Outdated cache or builds from older code
- Environment-specific issues with build process

## Critical Files to Monitor

### Backend Score Generation
**File:** `server/routes.ts`
**Lines:** 353-396

**What to check:**
```typescript
// ✅ CORRECT: AI is instructed to generate actual scores
extractedScore: [YOUR_SCORE_1_TO_10]
collectedData": {"area": {"score": [YOUR_SCORE_1_TO_10]...

// ❌ WRONG: Hardcoded to 5
extractedScore: 5
collectedData": {"area": {"score": 5...
```

### Frontend Score Extraction
**File:** `client/src/components/diagnostic-chat.tsx`
**Lines:** 451-506

**What to check:**
```typescript
// ✅ CORRECT: Looks for actual score values in data
if (dataPoint && dataPoint.score !== undefined && dataPoint.score !== null)

// ❌ WRONG: Returns defaultScore (5) too early
return defaultScore;  // at line 478 without proper checks
```

## Deployment Checklist (Before Each Deploy to Replit)

### 1. Git Sync Verification
```bash
# Verify latest commit is the diagnostic fix
git log --oneline -5
# Should show: "Fix hardcoded diagnostics issue..."

# Verify remote is up to date
git fetch origin
git status
# Should show: "Your branch is up to date with 'origin/main'"
```

### 2. Code Verification
Run this verification script before deploying:
```bash
# Check backend prompt for hardcoded scores
grep -n "extractedScore: 5\|\"score\": 5" server/routes.ts
# Should return: NOTHING (0 results)

# Check frontend calculation logic
grep -n "return defaultScore" client/src/components/diagnostic-chat.tsx
# Should only appear in proper validation contexts, NOT as main return
```

### 3. Build Verification
```bash
# Clean build to ensure no cached code
npm run build

# Verify bundle includes dynamic score logic
# Check that score extraction appears in built files
grep -r "extractedScore\|collectedData" dist/ | head -5
# Should show references to score extraction
```

### 4. Runtime Verification (After Deploy)

**Test the diagnostic flow:**

1. **Start the app:**
   ```bash
   npm run dev
   ```

2. **Open browser and run diagnostic:**
   - Navigate to http://localhost:3000
   - Type "start" to begin diagnostic
   - Answer questions with varied responses

3. **Check browser console for:**
   ```
   [Chat] ✅ Merged collected data: {"turnover": {"score": 7, "answer": "..."}...
   [Scores] Found score for key "turnover": 7
   [Scores] Calculated scores: {"tradingCapacity": 7, ...}
   ```

4. **Verify in report:**
   - Each section should show different scores (not all 5s)
   - Final score should vary based on answers
   - Score widget should display correct numbers

### 5. Network Tab Verification

In browser DevTools:
1. Open Network tab
2. Complete diagnostic
3. Check the `/api/chat` response:
   ```json
   {
     "diagnosticUpdate": {
       "collectedData": {
         "turnover": {"score": 7, "answer": "..."},
         "reliability": {"score": 3, "answer": "..."}
       }
     }
   }
   ```
   **Should show varied scores, not all 5s**

## Common Issues & Solutions

### Issue: Scores Always Show as 5

**Symptom:** Every section score is 5 regardless of answers

**Root Cause:** Code not updated or cache issue

**Solution:**
```bash
# 1. Force clean everything
git clean -fd
git reset --hard HEAD

# 2. Clear cache
rm -rf node_modules dist .vite

# 3. Rebuild
npm install
npm run build

# 4. Test locally
npm run dev
```

### Issue: Diagnostic Data Not Appearing

**Symptom:** Scores show but data collection failed silently

**Check server logs:**
```
[API] Processing chat message: ...
[API] ✅ AI response generated successfully, questionsAsked: 2, isComplete: false
```

**If missing:** AI isn't returning DIAGNOSTIC_DATA markers

**Solution:**
1. Check OpenAI API key is valid: `process.env.AI_INTEGRATIONS_OPENAI_API_KEY`
2. Check response in Network tab for error messages
3. Check that system prompt has DIAGNOSTIC_DATA:... tags

### Issue: Diagnostic Data Lost Between Questions

**Symptom:** Data from question 1 disappears by question 3

**Check browser console:**
```
[Chat] Response received: { totalAccumulatedData: {...} }
```

**Solution:**
- Check `accumulatedDataRef` is being updated in `diagnostic-chat.tsx:315-320`
- Verify data is merged correctly (not replaced)

## Replit-Specific Gotchas

### 1. Environment Variables Not Persisting
**Problem:** .env file changes get lost on deploy

**Solution:**
```bash
# Use Replit Secrets instead
# Settings → Secrets
# Add: AI_INTEGRATIONS_OPENAI_API_KEY=sk-...
# Add: GHL_DEVELOP_LOCATION_ID=...

# Verify in code:
echo $AI_INTEGRATIONS_OPENAI_API_KEY
```

### 2. Build Cache Issues
**Problem:** Replit caches old builds

**Solution:**
```bash
# Clear Replit cache
pkill -f "node"  # Kill running server
rm -rf node_modules .vite dist
npm install
npm run build
```

### 3. Git Pull Not Working
**Problem:** Code changes exist locally but not in git

**Solution:**
```bash
# Check uncommitted changes
git status

# If changes exist, commit them
git add -A
git commit -m "..."

# Then pull from origin
git pull origin main
```

## Continuous Verification

### Weekly Checks
- [ ] Run diagnostic flow end-to-end
- [ ] Verify scores vary based on answers
- [ ] Check browser console for debug logs
- [ ] Review server logs for errors

### Per-Deploy Checks
- [ ] Git log shows correct commit
- [ ] No hardcoded "score": 5 in codebase
- [ ] Build completes without errors
- [ ] Local test passes before pushing to Replit

## Version History

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 2025-11-26 | Initial deployment guide after hardcoding bug fix |

## Related Commits

- `efc1c59` - Fix hardcoded diagnostics issue - proper score extraction and data flow

## Support & Debugging

### Enable Debug Mode
```bash
# Add to .env
DEBUG=*
```

### Check Diagnostic Data Flow
```bash
# Backend logs
tail -f server.log | grep "DIAGNOSTIC_DATA"

# Frontend console
// In browser console
localStorage.setItem('DEBUG', 'true')
// Reload page
```

### Test with curl
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "300k turnover",
    "diagnosticState": {
      "isActive": true,
      "questionsAsked": 1,
      "collectedData": {}
    }
  }'
```

Expected response should include:
```json
{
  "diagnosticUpdate": {
    "collectedData": {
      "turnover": {
        "score": [7,8,9],  // Actual extracted score, NOT 5
        "answer": "..."
      }
    }
  }
}
```

---

**Key Takeaway:** Always verify that scores are dynamic (not hardcoded) before deploying. Use the checklist above for every Replit deployment.
