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
        console.log('🔥 Requesting FCM token...');

        // Check if browser supports notifications
        if (!('Notification' in window)) {
            console.log('❌ This browser does not support notifications');
            return null;
        }

        // Check current permission status
        let permission = Notification.permission;
        console.log('🔐 Current notification permission:', permission);

        // If permission is default, request it
        if (permission === 'default') {
            console.log('📝 Requesting notification permission...');
            permission = await Notification.requestPermission();
            console.log('🔐 New notification permission:', permission);
        }

        // If permission is denied, return null
        if (permission === 'denied') {
            console.log('❌ Notification permission denied');
            return null;
        }

        console.log('🔑 Getting FCM token with VAPID key...');

        // Get FCM token
        const token = await getToken(messaging, {
            vapidKey: VAPID_KEY
        });

        if (token) {
            console.log("✅ FCM Token obtained:", token);

            // Store token in localStorage for persistence
            localStorage.setItem('fcm_token', token);

            return token;
        } else {
            console.log("❌ No registration token available.");
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
        console.log('👂 Setting up onMessage listener...');

        onMessage(messaging, (payload) => {
            console.log("🔔 Foreground message received in firebase-messaging.js:", payload);
            resolve(payload);
        });
    });

// Handle notification click (for background notifications)
export const handleNotificationClick = (notification) => {
    console.log("Notification clicked:", notification);

    // Close the notification
    notification.close();

    // Focus the window if it's already open
    if (window.focus) {
        window.focus();
    }

    // Handle different notification types
    if (notification.data) {
        const { type, postId, chatId, userId } = notification.data;

        switch (type) {
            case 'message':
            case 'chat_created':
            case 'group_created':
                // Navigate to messages page with specific chat if available
                if (chatId) {
                    window.location.href = `/messages?chat=${chatId}`;
                } else {
                    window.location.href = '/messages';
                }
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
                // Navigate to profile
                if (userId) {
                    window.location.href = `/profile/${userId}`;
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
        console.log('🔄 Force registering service worker...');

        // Unregister existing service workers first
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
            console.log('🗑️ Unregistering existing service worker:', registration.scope);
            await registration.unregister();
        }

        // Register new service worker
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('✅ Service Worker registered:', registration.scope);

        // Wait for it to be ready
        await navigator.serviceWorker.ready;
        console.log('✅ Service Worker ready');

        return true;
    } catch (error) {
        console.error('❌ Error registering service worker:', error);
        return false;
    }
};
