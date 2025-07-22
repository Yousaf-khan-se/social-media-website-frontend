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
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "BPOlrclvoiNscNmITWyp2AaH48GjcYa8l_HQvqOMQj93yzgnGSHIZoKxGNYMw6OYiwYNXwOceBdPPF2eCmZx3Fw";

// Request FCM token and handle registration
export const requestForToken = async () => {
    try {
        // Check if browser supports notifications
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return null;
        }

        // Check current permission status
        let permission = Notification.permission;

        // If permission is default, request it
        if (permission === 'default') {
            permission = await Notification.requestPermission();
        }

        // If permission is denied, return null
        if (permission === 'denied') {
            console.log('Notification permission denied');
            return null;
        }

        // Get FCM token
        const token = await getToken(messaging, {
            vapidKey: VAPID_KEY
        });

        if (token) {
            console.log("FCM Token obtained:", token);

            // Store token in localStorage for persistence
            localStorage.setItem('fcm_token', token);

            return token;
        } else {
            console.log("No registration token available.");
            return null;
        }
    } catch (error) {
        console.error("An error occurred while retrieving token:", error);
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
        onMessage(messaging, (payload) => {
            console.log("Foreground message received:", payload);
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

// Test notification (for development)
export const sendTestNotification = async (title = "Test Notification", body = "This is a test notification") => {
    try {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return;
        }

        if (Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body,
                icon: '/vite.svg', // You can replace with your app icon
                badge: '/vite.svg',
                tag: 'test-notification',
                requireInteraction: false,
                silent: false
            });

            notification.onclick = () => handleNotificationClick(notification);

            // Auto close after 5 seconds
            setTimeout(() => {
                notification.close();
            }, 5000);

        } else {
            console.log('Notification permission not granted');
        }
    } catch (error) {
        console.error('Error sending test notification:', error);
    }
};

export default messaging;
