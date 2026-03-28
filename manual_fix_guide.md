# 🛠️ Moon Glow Craft - Manual Troubleshooting Guide

Follow these steps if you see "Failed" or "Page Not Found" on your live websites.

## 1. 🚀 Render (Backend) - Fixing "Failed" Errors
If Render says "Failed" during deploy, check these settings in your Render Dashboard:

1. **Build Command:** `npm install && npm run build`
2. **Start Command:** `node dist/index.js`
3. **Environment Variables:** Make sure you have added these:
   - `DATABASE_URL` (From Neon)
   - `EMAIL_USER` (Your Gmail)
   - `EMAIL_PASS` (Your Gmail App Password)
   - `JWT_SECRET` (Any long random string)
   - `PORT` (5000)

> [!TIP]
> **Checking Logs:** Go to the "Logs" tab in Render. If you see "dist/index.js not found", it means the build failed. I am now fixing the code to make sure the build succeeds.

## 2. 🌐 Netlify (Frontend) - Fixing "Page Not Found / 404"
If you refresh the page and see "404", follow this:

1. **Check for `_redirects` file:** I have added a file called `public/_redirects` with the text `/* /index.html 200`. 
2. **Settings in Netlify:**
   - **Build Command:** `npm run build`
   - **Publish Directory:** `customer-web/.next` (for Next.js) or `dist` (for Vite).
   - **Environment Variables:** Add `NEXT_PUBLIC_API_URL` pointing to your Render backend link.

## 3. 🛡️ Security (OTP Login)
- **Email Only:** From now on, you MUST check your email for the OTP. I have disabled the "Dev Code" for safety. Any "fake" OTP will now show an "Invalid OTP" error.

## 4. 🖼️ Images Not Showing?
- If images (Kunafa, Thread Art) are missing, clear your browser cache (Ctrl + Shift + R) or open in Incognito/Private mode. The new images are now in the `public/images` folder.

---

### Need more help?
Send me the **Logs** from Render if it still says "Failed" after my next update.
