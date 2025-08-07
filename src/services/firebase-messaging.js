// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

const messaging = getMessaging(app);

// VAPID key for push notifications
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

// Request FCM token and handle registration
export const requestForToken = async () => {
    try {
        // Requesting FCM token...

        // Check if browser supports notifications
        if (!('Notification' in window)) {
            // This browser does not support notifications
            return null;
        }

        // Check current permission status
        let permission = Notification.permission;
        // Current notification permission: ${permission}

        // If permission is default, request it
        if (permission === 'default') {
            // Requesting notification permission...
            permission = await Notification.requestPermission();
            // New notification permission: ${permission}
        }

        // If permission is denied, return null
        if (permission === 'denied') {
            // Notification permission denied
            return null;
        }

        // Getting FCM token with VAPID key...

        // Get FCM token
        const token = await getToken(messaging, {
            vapidKey: VAPID_KEY
        });

        if (token) {
            // FCM Token obtained successfully

            // Store token in localStorage for persistence
            localStorage.setItem('fcm_token', token);

            return token;
        } else {
            // No registration token available
            return null;
        }
    } catch (error) {
        console.error("❌ An error occurred while retrieving token:", error);
        return null;
    }
};

// Get stored FCM token
export const getStoredToken = () => {
    return localStorage.getItem('fcm_token');
};

// Clear stored FCM token
export const clearStoredToken = () => {
    localStorage.removeItem('fcm_token');
};

// Handle foreground messages
export const onMessageListener = () =>
    new Promise((resolve) => {
        // Setting up onMessage listener...

        onMessage(messaging, (payload) => {
            // Foreground message received
            resolve(payload);
        });
    });

// Handle notification click (for background notifications)
export const handleNotificationClick = (notification) => {
    // Notification clicked

    // Close the notification
    notification.close();

    // Focus the window if it's already open
    if (window.focus) {
        window.focus();
    }

    // Handle different notification types
    if (notification.data) {
        const { type, postId, chatId, userId, chatRoomId, senderId } = notification.data;

        switch (type) {
            case 'message':
            case 'chat_created':
            case 'group_created':
            case 'group_added':
                // Navigate to messages page with specific chat if available
                if (chatRoomId || chatId) {
                    window.location.href = `/messages?chat=${chatRoomId || chatId}`;
                } else {
                    window.location.href = '/messages';
                }
                break;
            case 'chat_permission_request':
                // Navigate to messages page with permission requests view
                window.location.href = '/messages?view=requests';
                break;
            case 'like':
            case 'comment':
            case 'share':
                // Navigate to specific post
                if (postId) {
                    window.location.href = `/post/${postId}`;
                }
                break;
            case 'follow':
                // Navigate to profile - use correct route
                if (senderId || userId) {
                    window.location.href = `/user/${senderId || userId}`;
                }
                break;
            case 'admin':
                // Navigate to notifications
                window.location.href = '/notifications';
                break;
            default:
                // Navigate to notifications page by default
                window.location.href = '/notifications';
        }
    } else {
        // Default action - navigate to notifications
        window.location.href = '/notifications';
    }
};

export default messaging;

// Force service worker registration (for debugging)
export const forceServiceWorkerRegistration = async () => {
    if (!('serviceWorker' in navigator)) {
        console.error('❌ Service Worker not supported');
        return false;
    }

    try {
        // Force registering service worker...

        // Unregister existing service workers first
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
            // Unregistering existing service worker
            await registration.unregister();
        }

        // Register new service worker
        await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        // Service Worker registered successfully

        // Wait for it to be ready
        await navigator.serviceWorker.ready;
        // Service Worker ready

        return true;
    } catch (error) {
        console.error('❌ Error registering service worker:', error);
        return false;
    }
};
