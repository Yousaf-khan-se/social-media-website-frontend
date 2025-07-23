# 🔥 Firebase Cloud Messaging (FCM) Debugging Guide

## Current Issues & Solutions

### Issue: FCM Test Panel Works, But Backend Notifications Don't Show

This is a common issue when FCM is set up correctly for local notifications but not properly configured for backend-sent notifications. Here's a step-by-step debugging approach:

## 🔍 Step 1: Use the FCM Debug Panel

1. **Access Debug Panel**:
   - Go to Notifications page in your app
   - Click the three dots menu (⋮) in the top right
   - Select "FCM Debug"

2. **Check All Status Indicators**:
   - ✅ Push Support: Should be "Yes"
   - ✅ Push Enabled: Should be "Yes" 
   - ✅ Permission: Should be "granted"
   - ✅ FCM Token: Should be "Present"

3. **Run Debug Info**:
   - Click "Get Debug Info" button
   - Check browser console for detailed logs
   - Verify all requirements are met

## 🔧 Step 2: Verify Service Worker

The service worker is crucial for background notifications:

### Check Service Worker Registration:
```javascript
// Open browser console and run:
navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('Service Workers:', registrations);
    registrations.forEach(reg => {
        console.log('SW Scope:', reg.scope);
        console.log('SW Active:', reg.active);
    });
});
```

### Verify Firebase Service Worker File:
- Visit: `http://localhost:5173/firebase-messaging-sw.js`
- Should show the Firebase service worker code (not a 404)

### Force Service Worker Registration:
- In the FCM Debug Panel, click "Force SW Registration"
- This will unregister and re-register the service worker

## 📱 Step 3: Test Notification Flow

### Test Local Notifications First:
1. Click "Test Local Notification" in debug panel
2. Should show a browser notification immediately
3. If this fails, check notification permissions

### Test FCM Token Generation:
1. Click "Request FCM Token" 
2. Should generate and store a new token
3. Check browser console for detailed logs

### Test Backend Integration:
1. Click "Test Backend Notification"
2. This sends a request to `/api/notifications/test`
3. Check Network tab in browser dev tools
4. Look for the API request and response

## 🚨 Common Issues & Fixes

### 1. **Service Worker Not Loading**

**Symptoms**: 
- Background notifications don't work
- Only foreground notifications work

**Solutions**:
```javascript
// Check if service worker file exists
fetch('/firebase-messaging-sw.js')
  .then(response => console.log('SW File Status:', response.status))
  .catch(error => console.error('SW File Error:', error));

// Force re-register service worker
navigator.serviceWorker.getRegistrations()
  .then(registrations => {
    registrations.forEach(reg => reg.unregister());
  })
  .then(() => navigator.serviceWorker.register('/firebase-messaging-sw.js'));
```

### 2. **FCM Token Not Generated**

**Symptoms**:
- FCM Token shows as "None" 
- `requestForToken()` returns null

**Solutions**:
- Check notification permissions: `Notification.permission`
- Verify VAPID key is set in environment variables
- Check Firebase project configuration
- Try in a different browser or incognito mode

### 3. **Backend Notifications Not Received**

**Symptoms**:
- Local test notifications work
- Backend notifications don't appear
- FCM token is present

**Solutions**:
- Verify backend is actually sending notifications
- Check backend logs for FCM sending errors
- Confirm FCM token is being sent to backend correctly
- Verify Firebase Admin SDK is configured on backend

### 4. **HTTPS Required in Production**

**Symptoms**:
- Works on localhost but not in production
- Service Worker registration fails

**Solutions**:
- Deploy to HTTPS domain
- Use localhost or 127.0.0.1 for development only
- Configure proper SSL certificates

## 🔍 Debugging Console Commands

### Check FCM Setup:
```javascript
// Run these in browser console for manual debugging

// 1. Check notification support
console.log('Notification support:', 'Notification' in window);
console.log('ServiceWorker support:', 'serviceWorker' in navigator);
console.log('PushManager support:', 'PushManager' in window);

// 2. Check permissions
console.log('Notification permission:', Notification.permission);

// 3. Check stored FCM token
console.log('Stored FCM token:', localStorage.getItem('fcm_token'));

// 4. Check service worker status
navigator.serviceWorker.ready.then(registration => {
    console.log('Service Worker ready:', registration);
});
```

### Manually Send Test Notification:
```javascript
// Test browser notification API directly
if (Notification.permission === 'granted') {
    new Notification('Test Notification', {
        body: 'This is a manual test notification',
        icon: '/vite.svg'
    });
}
```

## 📊 Backend Integration Checklist

To receive notifications from backend, ensure:

### Backend Requirements:
- [ ] Firebase Admin SDK installed and configured
- [ ] Service account key properly set up
- [ ] FCM token endpoint implemented (`/api/notifications/fcm-token`)
- [ ] Notification sending endpoint implemented
- [ ] Proper error handling and logging

### Frontend Requirements:
- [ ] FCM token automatically sent to backend when generated
- [ ] Token updates handled (tokens can change)
- [ ] Proper error handling for token registration
- [ ] Service worker properly registered and active

## 🔧 Environment Variables Check

Verify these environment variables are set:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
```

## 📱 Browser-Specific Issues

### Chrome:
- Full FCM support
- Works on localhost and HTTPS
- Check chrome://settings/content/notifications

### Firefox:
- Full FCM support
- May have stricter service worker requirements
- Check about:preferences#privacy

### Safari:
- Limited FCM support (iOS 16.4+ / macOS 13+)
- Requires explicit user interaction
- May not work on older versions

### Edge:
- Same as Chrome (Chromium-based)
- Full FCM support

## 🚀 Testing Workflow

1. **Start with FCM Debug Panel**
   - Check all status indicators
   - Run debug info
   - Test local notifications

2. **Verify Service Worker**
   - Check registration
   - Force re-register if needed
   - Verify file accessibility

3. **Test Token Generation**
   - Request new token
   - Verify storage
   - Check backend integration

4. **Test Backend Integration**
   - Send test notification from backend
   - Check network requests
   - Verify API responses

5. **Check Browser Console**
   - Look for errors or warnings
   - Verify detailed logging
   - Check network activity

## 🎯 Next Steps

If notifications still don't work after following this guide:

1. **Check Backend Logs**: Verify backend is actually sending FCM messages
2. **Test with Postman**: Send FCM notifications directly to Firebase
3. **Firebase Console**: Use Firebase Console to send test messages
4. **Different Browser**: Try testing in a different browser
5. **Network Issues**: Check if firewall/proxy blocks FCM endpoints

## 📞 Support

If you continue having issues:
- Check browser console for specific error messages
- Verify all environment variables are correct
- Test in different browsers and environments
- Review Firebase project settings and quotas
