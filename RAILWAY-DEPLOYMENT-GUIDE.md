# Railway Deployment + WordPress Integration Guide

Complete step-by-step process to deploy the A-Team Trades Pipeline diagnostic to Railway and embed it on your WordPress site.

## Part 1: Deploy to Railway

### Step 1: Create Railway Account

1. Go to https://railway.app
2. Sign up (GitHub recommended for easy deployment)
3. Connect your GitHub account
4. Grant access to your repositories

### Step 2: Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `A-TEAM-GPT` repository
4. Authorize Railway to access your GitHub

### Step 3: Configure Environment Variables

Once the project is created:

1. Go to **Variables** tab
2. Add the following environment variables:

```
# GoHighLevel Integration
GHL_DEVELOP_LOCATION_ID=kqwiKif2m2fvapw6tkq0
GHL_DEVELOP_PIT_ID=pit-73ea63c6-45f4-4be0-bd19-f577d3b14373

# OpenAI Integration
OPENAI_API_KEY=sk-proj-your-key-here
AI_INTEGRATIONS_OPENAI_API_KEY=sk-proj-your-key-here
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1

# Session Security
SESSION_SECRET=ateam-trades-pipeline-2025-secure-random-secret

# WordPress iframe embedding
ALLOWED_IFRAME_DOMAINS=https://yourdomain.com,https://www.yourdomain.com
```

**Important:**
- Replace `yourdomain.com` with your actual WordPress domain
- Keep API keys secure (never commit to git)
- Use Railway's secret management for sensitive values

### Step 4: Configure Build & Deploy

1. Go to **Settings** tab
2. Under "Build," verify:
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
3. Under "Port," set to `5000`

### Step 5: Connect Database (Optional but Recommended)

For persistent storage instead of in-memory:

1. Click "Add Service"
2. Select "PostgreSQL"
3. Railway will automatically create connection string
4. Update your `.env` with database URL
5. Run database migrations

### Step 6: Deploy

1. Railway automatically deploys on:
   - Every push to `main` branch
   - Manual redeploy from dashboard
2. Watch deployment logs in real-time
3. Once "Build Successful" appears, your app is live

### Step 7: Get Your Public URL

1. Go to **Deployments** tab
2. Find the successful deployment
3. Click on it to see public URL
4. Format: `https://your-app-name-production.up.railway.app`

**Keep this URL handy for WordPress embedding!**

---

## Part 2: Update Railroad Configuration

### Update Build Settings

In Railway Dashboard:

1. **Settings** → **Build**
2. Set:
   ```
   Build Command: npm run build
   Start Command: npm start
   ```

3. **Settings** → **Networking**
4. Set Port to: `5000`

### Verify Domain Whitelisting

Before embedding, ensure ALLOWED_IFRAME_DOMAINS includes your WordPress domain.

**In Railway Dashboard:**
1. Go to **Variables**
2. Update `ALLOWED_IFRAME_DOMAINS`:
   ```
   ALLOWED_IFRAME_DOMAINS=https://yourdomain.com,https://www.yourdomain.com
   ```
3. Save and redeploy

---

## Part 3: Embed on WordPress

### Step 1: Get Your Railway App URL

From Railway Dashboard:
- Deployments → Active Deployment → Copy Public URL
- Example: `https://a-team-diagnostic-production.up.railway.app`

### Step 2: Prepare WordPress Page

1. Log in to WordPress admin
2. Create new page:
   - Title: "Free Diagnostic Assessment"
   - Slug: `/diagnostic` (optional)
   - Keep as Draft for now

### Step 3: Add iframe Embed Code

**Option A: Custom HTML Block (Easiest)**

1. In WordPress editor, add a **Custom HTML** block
2. Paste this code:

```html
<!-- A-Team Trades Pipeline Diagnostic -->
<div class="ateam-diagnostic-wrapper">
  <iframe
    id="ateam-diagnostic-iframe"
    src="https://your-app-name-production.up.railway.app/?utm_source=wordpress&utm_medium=website&utm_campaign=homepage-diagnostic"
    width="100%"
    height="900px"
    frameborder="0"
    allow="payment"
    style="border: none; max-width: 1200px; margin: 0 auto; display: block; box-sizing: border-box;"
    title="A-Team Trades Pipeline Diagnostic"
  ></iframe>
</div>

<style>
  .ateam-diagnostic-wrapper {
    width: 100%;
    overflow: hidden;
    background: #f9fafb;
    padding: 30px 0;
    margin: 40px 0;
  }
</style>

<script>
  // Auto-resize iframe based on content height
  window.addEventListener('message', function(event) {
    // Security check: only accept from your app domain
    if (event.data.type === 'ateam-resize') {
      const iframe = document.getElementById('ateam-diagnostic-iframe');
      if (iframe) {
        iframe.style.height = event.data.height + 'px';
      }
    }
  });
</script>
```

**IMPORTANT:** Replace `https://your-app-name-production.up.railway.app` with your actual Railway URL!

### Step 4: Test Embed Locally

1. Save as Draft
2. Preview the page
3. Check:
   - iframe loads (no blank white box)
   - Content appears
   - Height auto-resizes as you scroll
   - No CORS errors (F12 → Console)

**If you see errors:**
- Check URL is correct
- Verify domain is in ALLOWED_IFRAME_DOMAINS on Railway
- Clear browser cache (Ctrl+Shift+Delete)
- Check browser console for specific error message

### Step 5: Test Full Flow

1. Start diagnostic
2. Answer a few questions
3. Submit email
4. Submit phone
5. Book appointment

**Verify in GoHighLevel:**
1. Log in to GHL
2. Check Contacts
3. Find the test contact you just created
4. Verify custom fields have:
   - `score`: Overall diagnostic score
   - `utm_source`: wordpress
   - `utm_medium`: website
   - `utm_campaign`: homepage-diagnostic

### Step 6: Publish Page

Once testing is complete:

1. Update page content as needed
2. Add call-to-action text above/below iframe
3. Publish to go live
4. Share the URL on your website

---

## Part 4: WordPress Customization

### Add Header Text

Add content above iframe in WordPress:

```html
<h2 style="text-align: center; color: #003366; margin-bottom: 30px;">
  Discover Your Labour Pipeline Score in 3 Minutes
</h2>

<p style="text-align: center; font-size: 18px; color: #666; margin-bottom: 40px;">
  Complete our FREE assessment to identify exactly where you're losing money in your labour pipeline.
  Get a personalized report with actionable insights for your business.
</p>

<!-- iframe code here -->
```

### Add Footer Text

Add content below iframe:

```html
<!-- After iframe -->

<div style="text-align: center; margin-top: 40px; padding: 20px; background: #f0f7ff; border-radius: 8px;">
  <h3>What Happens Next?</h3>
  <p>After you submit your email, you'll receive:</p>
  <ul style="display: inline-block; text-align: left;">
    <li>✅ Your personalized diagnostic report</li>
    <li>✅ Exclusive "Attract The Best" training framework</li>
    <li>✅ Free strategy call with our team</li>
    <li>✅ Actionable recommendations for your business</li>
  </ul>
</div>
```

### Customize Styling

Match your WordPress theme:

```html
<style>
  .ateam-diagnostic-wrapper {
    background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
    border-top: 4px solid #003366;
    border-bottom: 4px solid #003366;
    padding: 40px 20px;
    margin: 60px 0;
  }

  .ateam-diagnostic-wrapper iframe {
    box-shadow: 0 4px 20px rgba(0, 51, 102, 0.15);
    border-radius: 8px;
  }
</style>
```

---

## Part 5: Tracking & Monitoring

### Monitor Leads in GoHighLevel

1. **Real-time tracking:**
   - Go to GHL Contacts
   - New leads appear as they submit
   - Check UTM parameters in custom fields

2. **Verify UTM tracking:**
   - Each contact should have:
     - `utm_source`: wordpress
     - `utm_medium`: website
     - `utm_campaign`: your-campaign-name

3. **Track conversions:**
   - Contacts who book should have conversion tag
   - Monitor booking completion rate

### Monitor App Performance

**In Railway Dashboard:**

1. **Deployments** → View logs
2. **Metrics** → Check:
   - CPU usage
   - Memory usage
   - Request count
   - Error rate

3. **Alerts** → Set up notifications for:
   - High CPU usage
   - High memory usage
   - Build failures
   - Deployment failures

### Monitor Website Performance

1. **Page Load Time:**
   - Check WordPress page speed
   - iframe should not significantly impact load time
   - Use PageSpeed Insights to measure

2. **Browser Console:**
   - Check for JavaScript errors
   - Monitor network requests
   - Verify postMessage communication works

---

## Part 6: Troubleshooting

### iframe Shows Blank White Box

**Check:**
1. URL is correct (copy from Railway dashboard)
2. Domain is in ALLOWED_IFRAME_DOMAINS
3. Railway app is running (check Deployments)
4. No typos in Railway URL

**Solution:**
```bash
# Verify app is running on Railway
curl https://your-app-name-production.up.railway.app

# Check ALLOWED_IFRAME_DOMAINS in Railway Variables
# Should include your WordPress domain
```

### CORS Error in Console

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
1. Go to Railway Variables
2. Find ALLOWED_IFRAME_DOMAINS
3. Add your exact WordPress domain:
   ```
   ALLOWED_IFRAME_DOMAINS=https://yourdomain.com,https://www.yourdomain.com
   ```
4. Save and redeploy
5. Clear browser cache and reload

### Height Not Auto-Resizing

**Check:**
1. postMessage script is on page (look for `<script>` with `ateam-resize`)
2. No JavaScript errors in console (F12)
3. iframe ID matches: `ateam-diagnostic-iframe`

**Solution:**
- Verify entire HTML block was pasted correctly
- Check no WordPress plugins are blocking postMessage
- Test in incognito mode (disable extensions)

### Email Not Sending from Diagnostic

**Check:**
1. GHL API key is valid (in Railway Variables)
2. GHL contact was created (check GHL Contacts)
3. Email address is real

**Solution:**
- Check Railway app logs for GHL errors
- Verify GHL PIT token is not expired
- Test with test email address first

### Leads Not Appearing in GHL

**Check:**
1. Railway app is running (check Deployments)
2. User completed diagnostic flow (submitted email)
3. GHL API connection is working

**Solution:**
1. Check Railway app logs for errors
2. Verify GHL credentials in Variables
3. Test diagnostic submission in browser
4. Check browser console for API errors

---

## Part 7: Testing Checklist

### Before Going Live

- [ ] Railway app deployed successfully
- [ ] App URL is public and accessible
- [ ] WordPress page created with iframe code
- [ ] iframe loads without blank space
- [ ] Height auto-resizes when scrolling
- [ ] No CORS errors in browser console
- [ ] Diagnostic starts when iframe loads
- [ ] Can answer all 7 questions
- [ ] Can submit email address
- [ ] Email received from GHL
- [ ] UTM parameters in GHL contact
- [ ] Can submit phone number
- [ ] SMS received (if configured)
- [ ] Can book appointment
- [ ] Booking appears in calendar

### After Going Live

- [ ] Monitor incoming leads daily
- [ ] Check UTM parameters are correct
- [ ] Monitor Rails app performance
- [ ] Check for JavaScript errors
- [ ] Monitor email delivery
- [ ] Track conversion rate
- [ ] Collect user feedback
- [ ] Optimize based on results

---

## Part 8: Performance Optimization

### Railway Scaling

If you get high traffic:

1. Go to **Settings** → **Build**
2. Increase resource allocation:
   - CPU: 2GB → 4GB
   - Memory: 1GB → 2GB

### WordPress Optimization

1. **Cache plugin:** Install WP Super Cache or W3 Total Cache
2. **CDN:** Consider Cloudflare for static assets
3. **Lazy load:** Use lazy loading for images above iframe

### App Optimization

The app is already optimized, but for extra performance:

1. Enable gzip compression (Railway does this by default)
2. Minify CSS/JS (done in build process)
3. Use CDN for static assets (optional)

---

## Quick Reference URLs

**Railway Dashboard:** https://railway.app/dashboard

**Your App URL:** https://your-app-name-production.up.railway.app
*(Replace with actual Railway URL)*

**GHL Dashboard:** https://app.gohighlevel.com/

**WordPress Admin:** https://yourdomain.com/wp-admin
*(Replace with your WordPress domain)*

---

## Support & Debugging

### Check Logs in Railway

1. Dashboard → **Deployments**
2. Click on active deployment
3. Scroll down to see **Build Logs** and **Runtime Logs**
4. Search for errors or `[API]` messages

### Common Log Messages

```
[express] serving on port 5000 - ✅ App running
[API] Processing chat message - ✅ Diagnostic working
[API] ✅ Email sent successfully - ✅ GHL working
[API] Tracking booking event - ✅ Booking tracked
```

### Test with curl

```bash
# Test app is accessible
curl https://your-app-name-production.up.railway.app

# Test API endpoint
curl -X POST https://your-app-name-production.up.railway.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'
```

---

## Summary

**Deployment Process:**
1. Create Railway account
2. Connect GitHub repo
3. Set environment variables
4. Configure build settings
5. Deploy (automatic on git push)
6. Get public URL

**WordPress Integration:**
1. Copy Railway URL
2. Create WordPress page
3. Add Custom HTML block with iframe code
4. Update iframe URL
5. Test full flow
6. Publish page
7. Monitor leads in GHL

**Total Time:**
- Railway setup: 15-20 minutes
- WordPress embedding: 10-15 minutes
- Testing: 10-15 minutes
- **Total: 35-50 minutes**

---

**Last Updated:** 2025-11-26
**Status:** Production Ready
**Railway Region:** Recommended US or EU (select closest to users)
