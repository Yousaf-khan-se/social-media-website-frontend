/* eslint-disable no-undef */

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

// Initialize Firebase with configuration
// Note: Service workers can't access import.meta.env, so we use hardcoded config
firebase.initializeApp({
    apiKey: "AIzaSyAK64TS_voOkw2x5MF88_hFgCXrTfXlKsA",
    authDomain: "social-media-app-881bf.firebaseapp.com",
    projectId: "social-media-app-881bf",
    storageBucket: "social-media-app-881bf.firebasestorage.app",
    messagingSenderId: "282136815664",
    appId: "1:282136815664:web:525699f4b13bc8548ce5f5",
    measurementId: "G-40YXDWP7FW"
});

// Firebase Service Worker initialized

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function (payload) {
    // Background Message received

    const notificationTitle = payload.notification?.title || 'New Notification';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new notification',
        icon: payload.notification?.icon || '/vite.svg',
        badge: '/vite.svg',
        tag: payload.data?.type || 'notification',
        data: payload.data || {},
        requireInteraction: payload.data?.requireInteraction === 'true',
        silent: false,
        timestamp: Date.now(),
        // Add action buttons for different notification types
        actions: getNotificationActions(payload.data?.type)
    };

    // Show the notification
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Get appropriate actions based on notification type
function getNotificationActions(type) {
    const baseActions = [
        { action: 'view', title: 'View', icon: '/vite.svg' }
    ];

    switch (type) {
        case 'message':
        case 'chat_created':
        case 'group_created':
            return [
                { action: 'reply', title: 'Reply', icon: '/vite.svg' },
                ...baseActions
            ];
        case 'like':
        case 'comment':
        case 'share':
            return [
                { action: 'view_post', title: 'View Post', icon: '/vite.svg' },
                ...baseActions
            ];
        case 'follow':
            return [
                { action: 'view_profile', title: 'View Profile', icon: '/vite.svg' },
                ...baseActions
            ];
        default:
            return baseActions;
    }
}

// Handle notification click
self.addEventListener('notificationclick', function (event) {
    // Notification clicked

    event.notification.close();

    const action = event.action;
    const data = event.notification.data || {};
    const { type, postId, chatRoomId, senderId } = data;

    let url = '/notifications'; // Default URL

    if (action === 'reply' && (type === 'message' || type === 'chat_created' || type === 'group_created')) {
        url = chatRoomId ? `/messages?chat=${chatRoomId}` : '/messages';
    } else if (action === 'view_post' && postId) {
        url = `/post/${postId}`;
    } else if (action === 'view_profile' && senderId) {
        url = `/profile/${senderId}`;
    } else {
        // Handle default click based on notification type
        switch (type) {
            case 'message':
            case 'chat_created':
            case 'group_created':
                url = chatRoomId ? `/messages?chat=${chatRoomId}` : '/messages';
                break;
            case 'like':
            case 'comment':
            case 'share':
                url = postId ? `/post/${postId}` : '/notifications';
                break;
            case 'follow':
                url = senderId ? `/profile/${senderId}` : '/notifications';
                break;
            case 'admin':
                url = '/notifications';
                break;
            default:
                url = '/notifications';
        }
    }

    // Open the URL in a new window/tab or focus existing one
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            // Try to find an existing window
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url.includes(new URL(url, self.location.origin).pathname) && 'focus' in client) {
                    return client.focus();
                }
            }

            // If no existing window found, open a new one
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

// Handle notification close
self.addEventListener('notificationclose', function () {
    // Track notification close events (can be sent to analytics)
});

// Install event
self.addEventListener('install', function () {
    // Service Worker installing...
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', function (event) {
    // Service Worker activating...
    event.waitUntil(self.clients.claim());
});
