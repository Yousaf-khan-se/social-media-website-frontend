import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    addNotification,
    setPushSupport,
    setPushEnabled,
    setFcmToken,
    fetchNotificationSettings
} from '@/store/slices/notificationsSlice';
import notificationService from '@/services/notificationService';
import { onMessageListener, getStoredToken } from '@/services/firebase-messaging';
import { useToast } from '@/hooks/use-toast';

const NotificationManager = ({ children }) => {
    const dispatch = useDispatch();
    const { toast } = useToast();
    const { user } = useSelector(state => state.auth);
    const { settings, pushEnabled } = useSelector(state => state.notifications);
    const isInitialized = useRef(false);

    useEffect(() => {
        if (!user || isInitialized.current) return;

        const initializeNotifications = async () => {
            try {
                // Check support
                const isSupported = notificationService.checkSupport();
                dispatch(setPushSupport(isSupported));

                if (isSupported) {
                    // Check if already has token
                    const storedToken = getStoredToken();
                    if (storedToken) {
                        dispatch(setFcmToken(storedToken));
                        dispatch(setPushEnabled(true));
                    }

                    // Fetch notification settings
                    await dispatch(fetchNotificationSettings()).unwrap();
                }

                isInitialized.current = true;
            } catch (error) {
                console.error('Error initializing notifications:', error);
            }
        };

        initializeNotifications();
    }, [user, dispatch]);

    useEffect(() => {
        if (!user || !pushEnabled) return;

        // Set up foreground message listener
        const unsubscribe = onMessageListener().then((payload) => {
            console.log('Foreground notification received:', payload);

            // Add to notification list
            if (payload.data) {
                dispatch(addNotification({
                    _id: Date.now().toString(),
                    type: payload.data.type || 'notification',
                    title: payload.notification?.title,
                    message: payload.notification?.body,
                    data: payload.data,
                    isRead: false,
                    createdAt: new Date().toISOString(),
                    sender: {
                        _id: payload.data.senderId,
                        firstName: payload.data.senderName?.split(' ')[0] || 'Unknown',
                        lastName: payload.data.senderName?.split(' ')[1] || 'User',
                        profilePicture: payload.data.senderProfilePicture
                    }
                }));
            }

            // Show toast notification if in-app notifications are enabled
            if (settings.inApp) {
                toast({
                    title: payload.notification?.title || 'New Notification',
                    description: payload.notification?.body,
                    action: (
                        <button
                            onClick={() => handleNotificationClick(payload.data)}
                            className="text-sm font-medium text-primary hover:underline"
                        >
                            View
                        </button>
                    )
                });
            }
        }).catch((error) => {
            console.error('Error setting up foreground listener:', error);
        });

        return () => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        };
    }, [user, pushEnabled, settings.inApp, dispatch, toast]);

    const handleNotificationClick = (data) => {
        if (!data) return;

        const { type, postId, chatRoomId, senderId } = data;

        switch (type) {
            case 'message':
            case 'chat_created':
            case 'group_created':
                window.location.href = chatRoomId ? `/messages?chat=${chatRoomId}` : '/messages';
                break;
            case 'like':
            case 'comment':
            case 'share':
                window.location.href = postId ? `/post/${postId}` : '/notifications';
                break;
            case 'follow':
                window.location.href = senderId ? `/profile/${senderId}` : '/notifications';
                break;
            default:
                window.location.href = '/notifications';
        }
    };

    return <>{children}</>;
};

export default NotificationManager;
