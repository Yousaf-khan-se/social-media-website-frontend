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
        case 'group_added':
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
        case 'chat_permission_request':
            return [
                { action: 'view_requests', title: 'View Requests', icon: '/vite.svg' },
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

    if (action === 'reply' && (type === 'message' || type === 'chat_created' || type === 'group_created' || type === 'group_added')) {
        url = chatRoomId ? `/messages?chat=${chatRoomId}` : '/messages';
    } else if (action === 'view_post' && postId) {
        url = `/post/${postId}`;
    } else if (action === 'view_profile' && senderId) {
        url = `/user/${senderId}`;
    } else if (action === 'view_requests') {
        url = '/messages?view=requests';
    } else {
        // Handle default click based on notification type
        switch (type) {
            case 'message':
            case 'chat_created':
            case 'group_created':
            case 'group_added':
                url = chatRoomId ? `/messages?chat=${chatRoomId}` : '/messages';
                break;
            case 'chat_permission_request':
                url = '/messages?view=requests';
                break;
            case 'like':
            case 'comment':
            case 'share':
                url = postId ? `/post/${postId}` : '/notifications';
                break;
            case 'follow':
                url = senderId ? `/user/${senderId}` : '/notifications';
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
            // Try to find an existing window with the same origin
            const targetUrl = new URL(url, self.location.origin);

            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                const clientUrl = new URL(client.url);

                // Check if client is from the same origin
                if (clientUrl.origin === targetUrl.origin && 'focus' in client) {
                    // Navigate the existing client to the target URL
                    client.postMessage({
                        type: 'NAVIGATE',
                        url: url
                    });
                    return client.focus();
                }
            }

            // If no existing window found, open a new one
            if (clients.openWindow) {
                return clients.openWindow(targetUrl.href);
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
