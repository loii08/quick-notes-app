# CSP (Content Security Policy) Errors - Fixed

## What Were the Errors?

### 1. X-Frame-Options Error
```
X-Frame-Options may only be set via an HTTP header sent along with a document. 
It may not be set inside <meta>.
```

**Cause**: `X-Frame-Options` is an HTTP header, not a meta tag. It cannot be set in HTML.

**Fix**: Removed the `<meta http-equiv="X-Frame-Options">` tag. This header should be set on the server (Vercel, Firebase Hosting, etc.) if needed.

---

### 2. Inline Script Error
```
Executing inline script violates the following Content Security Policy directive 
'script-src 'self' 'wasm-unsafe-eval''. Either the 'unsafe-inline' keyword, 
a hash ('sha256-...'), or a nonce ('nonce-...') is required to enable inline execution.
```

**Cause**: The theme detection script in `<head>` was blocked by CSP.

**Fix**: Added `'unsafe-inline'` to `script-src` directive to allow inline scripts.

---

### 3. Firebase Google API Error
```
Loading the script 'https://apis.google.com/js/api.js?onload=__iframefcb631399' 
violates the following Content Security Policy directive: "script-src 'self' 'wasm-unsafe-eval'".
```

**Cause**: Firebase needs to load Google APIs for authentication, but the CSP was too restrictive.

**Fix**: Added `https://apis.google.com` to `script-src` and updated `connect-src` to allow Firebase connections.

---

### 4. Google Analytics Error
```
Loading the script 'https://www.googletagmanager.com/gtag/js?l=dataLayer&id=G-MXWXHHM94T' 
violates the following Content Security Policy directive: "script-src 'self' 'wasm-unsafe-eval'".
```

**Cause**: Google Analytics script was blocked by CSP.

**Fix**: Added `https://www.googletagmanager.com` and `https://www.google-analytics.com` to `script-src` and `connect-src`.

---

## Updated CSP Policy

```
default-src 'self'; 
script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://apis.google.com https://www.googletagmanager.com https://www.google-analytics.com; 
style-src 'self' 'unsafe-inline'; 
img-src 'self' data: https:; 
font-src 'self'; 
connect-src 'self' https://*.firebaseapp.com https://*.firebaseio.com https://*.googleapis.com https://www.google-analytics.com https://www.googletagmanager.com; 
frame-src 'self' https://accounts.google.com; 
object-src 'none'; 
base-uri 'self'; 
form-action 'self';
```

### What Each Directive Does:

- **default-src 'self'** - Only allow resources from same origin by default
- **script-src** - Allow scripts from self, inline, wasm, and Google APIs
- **style-src** - Allow styles from self and inline
- **img-src** - Allow images from self, data URIs, and HTTPS
- **font-src** - Allow fonts from self only
- **connect-src** - Allow connections to Firebase and Google services
- **frame-src** - Allow iframes from self and Google accounts
- **object-src 'none'** - Disable plugins
- **base-uri 'self'** - Restrict base URL
- **form-action 'self'** - Restrict form submissions

---

## Security Notes

For a **personal project**, this CSP is acceptable. However, for production:

1. **Remove `'unsafe-inline'`** - Use nonces or hashes for inline scripts
2. **Set X-Frame-Options via HTTP headers** - Configure on your hosting provider
3. **Use stricter CSP** - Only allow necessary external domains
4. **Monitor CSP violations** - Use CSP reporting to catch issues

---

## How to Set HTTP Headers

### Vercel
Create `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### Firebase Hosting
Create `firebase.json`:
```json
{
  "hosting": {
    "headers": [
      {
        "source": "/**",
        "headers": [
          {
            "key": "X-Frame-Options",
            "value": "SAMEORIGIN"
          }
        ]
      }
    ]
  }
}
```

---

## Testing

All errors should now be resolved. The app should:
- ✅ Load without CSP errors
- ✅ Allow Firebase authentication
- ✅ Allow Google Analytics (if configured)
- ✅ Execute inline theme detection script
- ✅ Work offline and online

If you still see errors, check the browser console for specific violations.
