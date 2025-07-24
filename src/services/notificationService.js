import api from './api';
import { requestForToken, getStoredToken, clearStoredToken } from './firebase-messaging';

class NotificationService {
    constructor() {
        this.fcmToken = null;
        this.isSupported = this.checkSupport();
    }

    // Check if push notifications are supported
    checkSupport() {
        return 'Notification' in window &&
            'serviceWorker' in navigator &&
            'PushManager' in window;
    }

    // Initialize FCM and request permission
    async initialize() {
        if (!this.isSupported) {
            return false;
        }

        try {
            // Register service worker
            if ('serviceWorker' in navigator) {
                await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            }

            // Get FCM token
            const token = await requestForToken();
            if (token) {
                this.fcmToken = token;
                await this.sendTokenToServer(token);
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error('Error initializing notifications:', error);
            return false;
        }
    }

    // Send FCM token to backend
    async sendTokenToServer(token, device = 'web') {
        try {
            const response = await api.post('/notifications/fcm-token', {
                token,
                device
            });

            if (response.data.success) {
                return true;
            } else {
                console.error('Backend rejected FCM token:', response.data);
                return false;
            }
        } catch (error) {
            console.error('Error sending FCM token to server:', error);
            throw error;
        }
    }

    // Remove FCM token from backend
    async removeTokenFromServer(token) {
        try {
            const response = await api.delete('/notifications/fcm-token', {
                data: { token }
            });

            if (response.data.success) {
                console.log('FCM token removed from server successfully');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error removing FCM token from server:', error);
            throw error;
        }
    }

    // Check if FCM token is registered with backend
    async isTokenRegistered(token) {
        try {
            const response = await api.get('/notifications/fcm-token/check', {
                params: { token }
            });

            const isRegistered = response.data.success && response.data.registered;
            return isRegistered;
        } catch (error) {
            console.error('Error checking token registration:', error);
            // If endpoint doesn't exist, assume token needs to be registered
            return false;
        }
    }

    // Disable push notifications
    async disable() {
        const token = getStoredToken();
        if (token) {
            await this.removeTokenFromServer(token);
            clearStoredToken();
        }
        this.fcmToken = null;
    }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
