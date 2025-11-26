# WordPress iframe Embedding Guide

This guide explains how to embed the A-Team Trades Pipeline diagnostic application into your WordPress website via iframe.

## Overview

The A-Team Trades Pipeline diagnostic app is now fully compatible with iframe embedding on WordPress sites. The app automatically:
- Resizes to fit content height
- Captures marketing UTM parameters
- Tracks lead submissions via GoHighLevel

## Requirements

- WordPress site (any theme)
- A-Team Trades Pipeline app running on a server (e.g., Replit)
- CORS configured to allow your WordPress domain (already set up)

## Quick Start

### Option 1: Custom HTML Block (Easiest)

1. Create a new WordPress page or post
2. Add a **Custom HTML** block
3. Paste the following code:

```html
<div class="ateam-diagnostic-container">
  <iframe
    id="ateam-diagnostic-iframe"
    src="https://your-replit-app.replit.app/?utm_source=wordpress&utm_medium=website&utm_campaign=diagnostic-embed"
    width="100%"
    height="800px"
    frameborder="0"
    allow="payment"
    style="border: none; max-width: 1200px; margin: 0 auto; display: block; box-sizing: border-box;"
    title="A-Team Trades Pipeline Diagnostic"
  ></iframe>
</div>

<style>
  .ateam-diagnostic-container {
    width: 100%;
    overflow: hidden;
    background: #f9fafb;
    padding: 20px 0;
    margin: 0 auto;
  }
</style>

<script>
  // Auto-resize iframe based on content height
  window.addEventListener('message', function(event) {
    if (event.data.type === 'ateam-resize') {
      const iframe = document.getElementById('ateam-diagnostic-iframe');
      if (iframe) {
        iframe.style.height = event.data.height + 'px';
      }
    }
  });
</script>
```

4. Replace `https://your-replit-app.replit.app` with your actual app URL
5. Publish the page

### Option 2: WordPress Shortcode (For Reusability)

If you want to embed the diagnostic in multiple places, add this to your theme's `functions.php`:

```php
<?php
// Add shortcode for A-Team Diagnostic
function ateam_diagnostic_shortcode( $atts ) {
    $atts = shortcode_atts( array(
        'height'       => '800px',
        'utm_source'   => 'wordpress',
        'utm_medium'   => 'website',
        'utm_campaign' => 'diagnostic-embed'
    ), $atts );

    $app_url = 'https://your-replit-app.replit.app';
    $iframe_url = $app_url . '/?utm_source=' . urlencode( $atts['utm_source'] ) .
                  '&utm_medium=' . urlencode( $atts['utm_medium'] ) .
                  '&utm_campaign=' . urlencode( $atts['utm_campaign'] );

    ob_start();
    ?>
    <div class="ateam-diagnostic-container">
        <iframe
            id="ateam-diagnostic-iframe"
            src="<?php echo esc_url( $iframe_url ); ?>"
            width="100%"
            height="<?php echo esc_attr( $atts['height'] ); ?>"
            frameborder="0"
            allow="payment"
            style="border: none; max-width: 1200px; margin: 0 auto; display: block; box-sizing: border-box;"
            title="A-Team Trades Pipeline Diagnostic"
        ></iframe>
    </div>

    <style>
        .ateam-diagnostic-container {
            width: 100%;
            overflow: hidden;
            background: #f9fafb;
            padding: 20px 0;
            margin: 0 auto;
        }
    </style>

    <script>
        // Auto-resize iframe based on content height
        window.addEventListener('message', function(event) {
            if (event.data.type === 'ateam-resize') {
                const iframe = document.getElementById('ateam-diagnostic-iframe');
                if (iframe) {
                    iframe.style.height = event.data.height + 'px';
                }
            }
        });
    </script>
    <?php
    return ob_get_clean();
}
add_shortcode( 'ateam_diagnostic', 'ateam_diagnostic_shortcode' );
?>
```

**Usage in pages/posts:**
```
[ateam_diagnostic utm_campaign="homepage-2025"]
```

**With custom height:**
```
[ateam_diagnostic height="1000px" utm_campaign="specific-page"]
```

### Option 3: WordPress Plugin (Advanced)

For more control, consider using the "Advanced iFrames" plugin:

1. Install and activate [Advanced iFrames](https://wordpress.org/plugins/advanced-iframe/)
2. Create a new page
3. Add the shortcode:
```
[advanced_iframe securitykey="your_key" src="https://your-replit-app.replit.app/?utm_source=wordpress&utm_medium=website&utm_campaign=diagnostic-embed" width="100%" height="800" scrolling="yes"]
```

## Configuration

### App URL

Update the iframe `src` with your actual A-Team Trades Pipeline app URL:
- **Replit development**: `http://localhost:5000` (local testing only)
- **Replit production**: `https://your-username.replit.dev`
- **Custom domain**: `https://diagnostic.yourdomain.com`

### UTM Parameters

The default embed includes these UTM parameters for tracking:
- `utm_source=wordpress` - Identifies WordPress as the traffic source
- `utm_medium=website` - Identifies it as organic website traffic
- `utm_campaign=diagnostic-embed` - Identifies the campaign

**To customize**, edit the URL in the iframe src:
```html
src="https://your-app-url/?utm_source=facebook&utm_medium=social&utm_campaign=fb-promo"
```

### Responsive Design

The iframe automatically:
- Adjusts width to fit container (100% width)
- Resizes height based on content
- Works on mobile devices
- Maintains aspect ratio on all screen sizes

## Testing

### Before Publishing

1. **Local testing:**
   - Start the app: `npm run dev`
   - Create a test WordPress page
   - Add the iframe with `src="http://localhost:5000?utm_source=test"`
   - Test in Chrome, Safari, Firefox

2. **Check browser console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Should see: `[iframe] Height auto-resize enabled for WordPress embedding`
   - No CORS errors should appear

3. **Test full flow:**
   - Load the page
   - Start diagnostic
   - Submit email
   - Submit phone
   - Book appointment

4. **Verify GoHighLevel:**
   - Check GHL contacts
   - Verify UTM parameters are stored in custom fields
   - Confirm email was sent

### After Publishing

1. **Mobile testing:**
   - Test on iPhone, Android
   - Verify height resizing works
   - Check form inputs are accessible

2. **Performance:**
   - Check page load time
   - Monitor server logs
   - Ensure no JavaScript errors

3. **Analytics:**
   - Monitor GHL for incoming leads
   - Check UTM parameter accuracy
   - Track completion rates

## Troubleshooting

### iframe Not Loading

**Symptom:** Blank iframe or error message

**Solution:**
1. Verify correct app URL in `src` attribute
2. Check CORS headers in browser console (F12 → Network)
3. Ensure WordPress domain is in `ALLOWED_IFRAME_DOMAINS` in app .env
4. Verify HTTPS is being used (if not on localhost)

### Height Not Auto-Resizing

**Symptom:** iframe is fixed height, cuts off content

**Solution:**
1. Check browser console for `[iframe] Height auto-resize enabled` message
2. Verify postMessage script is present on page
3. Ensure no JavaScript errors in console
4. Try manually setting height to `1200px` temporarily

### UTM Parameters Not Captured

**Symptom:** Leads in GHL don't have utm_source, utm_medium, utm_campaign

**Solution:**
1. Check URL parameters are present: `?utm_source=...`
2. Look at browser Network tab → `/api/submit-email` request body
3. Verify GHL custom fields exist: `utm_source`, `utm_medium`, `utm_campaign`
4. Check app server logs for UTM parsing errors

### CORS Errors in Console

**Symptom:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
1. Add WordPress domain to `ALLOWED_IFRAME_DOMAINS` in app .env:
   ```
   ALLOWED_IFRAME_DOMAINS=https://yourdomain.com,https://www.yourdomain.com
   ```
2. Restart app server
3. Clear browser cache (Ctrl+Shift+Delete)
4. Test again

### Email Not Sending

**Symptom:** User submits email but doesn't receive report

**Solution:**
1. Check app logs for GoHighLevel errors
2. Verify GHL API key and location ID
3. Check email address is valid
4. Check GHL Conversations API is enabled
5. Test with test email address in localhost

## Advanced Configuration

### Custom Styling

Add CSS to match your WordPress theme:

```html
<style>
  .ateam-diagnostic-container {
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin: 40px 0;
    padding: 20px;
  }
</style>
```

### Conditional Display

Show iframe only to certain users:

```php
<?php
if ( is_user_logged_in() ) {
    // Show diagnostic only to logged-in users
    echo do_shortcode( '[ateam_diagnostic]' );
} else {
    echo '<p>Please log in to access the diagnostic.</p>';
}
?>
```

### Google Analytics Integration

Track diagnostic events in GA4:

```html
<script>
document.addEventListener('message', function(event) {
  if (event.data.type === 'ateam-resize') {
    // Track iframe interaction
    gtag('event', 'diagnostic_interaction', {
      'event_category': 'engagement',
      'event_label': 'iframe_height_change',
      'value': event.data.height
    });
  }
});
</script>
```

## Support

For issues or questions:

1. **Check logs:**
   - App server logs (Replit dashboard)
   - WordPress error logs (`wp-content/debug.log`)
   - Browser console errors (F12)

2. **Review:**
   - App GitHub repository
   - `DIAGNOSTIC-DEPLOYMENT-GUIDE.md` in repo
   - GoHighLevel integration docs

3. **Test:**
   - Run `node test-diagnostic-flow.js` to verify app
   - Test iframe on localhost first
   - Verify all environment variables

## Security Best Practices

1. **HTTPS Only**: Always use HTTPS in production
2. **Domain Whitelist**: Only allow your specific WordPress domain
3. **Rate Limiting**: Consider adding rate limiting to API endpoints
4. **Credentials**: Never expose API keys in iframe URL
5. **Validation**: Verify all user input on backend

## Performance Tips

1. **Lazy Load**: Load iframe only when visible (use Intersection Observer)
2. **Caching**: Cache app static assets with long TTLs
3. **CDN**: Serve app from CDN for faster delivery
4. **Monitoring**: Monitor server response times
5. **Optimize**: Minimize CSS/JS in production build

## Next Steps

After embedding:

1. **Add call-to-action:** Create marketing for the diagnostic
2. **Track results:** Monitor leads coming in via WordPress
3. **Optimize:** A/B test different UTM campaigns
4. **Promote:** Share across multiple landing pages
5. **Measure:** Track conversion rates and ROI

---

**Last Updated:** 2025-11-26
**Version:** 1.0
**Status:** Production Ready
