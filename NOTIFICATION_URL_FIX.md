# Notification URL Fix

## Problem
Notification clicks were redirecting to wrong links because they were using relative URLs which weren't resolving correctly, especially for background notifications.

## Solution
Updated all notification handlers to use absolute URLs with your domain: `https://hash-by-m-yousaf.vercel.app`

## Files Modified

### 1. `firebase-messaging-sw.js`
- Added `WEBSITE_DOMAIN` constant
- Updated notification click handler to use absolute URLs
- Fixed URL construction for both action clicks and default clicks

### 2. `firebase-messaging.js` 
- Added `WEBSITE_DOMAIN` constant with environment variable support
- Updated `handleNotificationClick` function to use absolute URLs
- Improved error handling for missing notification data

### 3. `.env.example`
- Added `VITE_WEBSITE_DOMAIN` for better configuration management

## How It Works Now

### Background Notifications (Service Worker)
1. User clicks notification → Service Worker handles click
2. Constructs absolute URL: `https://hash-by-m-yousaf.vercel.app/messages`
3. Opens URL in browser or focuses existing tab

### Foreground Notifications (NotificationManager)
1. User clicks toast notification → React Router handles navigation
2. Uses relative paths within the app: `/messages`
3. React Router navigates within the SPA

## Testing
1. **Foreground**: Click on toast notifications while app is open
2. **Background**: Click on system notifications when app is closed/minimized
3. **Different types**: Test message, like, comment, follow notifications

## Environment Configuration
Add to your `.env` file:
```
VITE_WEBSITE_DOMAIN=https://hash-by-m-yousaf.vercel.app
```

**Note**: Service workers can't access VITE_ environment variables, so you need to manually update the domain in `firebase-messaging-sw.js` when deploying to different environments.

## Future Improvements
Consider creating a build script that automatically updates the service worker domain based on the deployment environment.
