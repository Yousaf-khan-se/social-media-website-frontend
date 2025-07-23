import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    addNotification,
    setPushSupport,
    setPushEnabled,
    setFcmToken,
    fetchNotificationSettings,
    subscribeToPushNotifications
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

                        // Ensure token is registered with backend
                        try {
                            await notificationService.sendTokenToServer(storedToken);
                        } catch (error) {
                            console.error('Error registering existing token with backend:', error);
                        }
                    } else {
                        // Subscribe to push notifications (this will generate token and register with backend)
                        try {
                            const result = await dispatch(subscribeToPushNotifications()).unwrap();
                            if (result.success) {
                                dispatch(setFcmToken(result.token));
                                dispatch(setPushEnabled(true));
                            }
                        } catch (error) {
                            console.error('Error subscribing to push notifications:', error);
                        }
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

        console.log('🔥 Setting up foreground message listener for user:', user._id);

        // Set up foreground message listener
        let cleanup;

        const setupListener = async () => {
            try {
                const messagePromise = onMessageListener();

                messagePromise.then((payload) => {
                    console.log('🔔 New foreground message received:', payload);
                    // Add to notification list
                    if (payload.data) {
                        const newNotification = {
                            _id: payload.fcmMessageId || Date.now().toString(),
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
                        };

                        dispatch(addNotification(newNotification));
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
                    console.error('Error in foreground message listener:', error);
                });

                cleanup = () => {
                    // Note: onMessageListener returns a promise, not an unsubscribe function
                };
            } catch (error) {
                console.error('Error setting up foreground listener:', error);
            }
        };

        setupListener();

        return cleanup;
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
