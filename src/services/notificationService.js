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

    // Get notification settings
    async getSettings() {
        try {
            const response = await api.get('/notifications/settings');
            return response.data;
        } catch (error) {
            console.error('Error fetching notification settings:', error);
            throw error;
        }
    }

    // Update notification settings
    async updateSettings(settings) {
        try {
            const response = await api.put('/notifications/settings', settings);
            return response.data;
        } catch (error) {
            console.error('Error updating notification settings:', error);
            throw error;
        }
    }

    // Get notifications
    async getNotifications(params = {}) {
        try {
            const { page = 1, limit = 20, type, unreadOnly } = params;
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(type && { type }),
                ...(unreadOnly !== undefined && { unreadOnly: unreadOnly.toString() })
            });

            const response = await api.get(`/notifications?${queryParams}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    }

    // Mark notification as read
    async markAsRead(notificationId) {
        try {
            const response = await api.put(`/notifications/${notificationId}/read`);
            return response.data;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    // Mark all notifications as read
    async markAllAsRead() {
        try {
            const response = await api.put('/notifications/read-all');
            return response.data;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }

    // Delete notification
    async deleteNotification(notificationId) {
        try {
            const response = await api.delete(`/notifications/${notificationId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }

    // Clear all notifications
    async clearAllNotifications() {
        try {
            const response = await api.delete('/notifications');
            return response.data;
        } catch (error) {
            console.error('Error clearing all notifications:', error);
            throw error;
        }
    }

    // Get notification statistics
    async getStats() {
        try {
            const response = await api.get('/notifications/stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching notification stats:', error);
            throw error;
        }
    }

    // Send test notification (for development)
    async sendTestNotification(title, body) {
        try {
            const response = await api.post('/notifications/test', {
                title,
                body
            });
            return response.data;
        } catch (error) {
            console.error('Error sending test notification:', error);
            throw error;
        }
    }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
