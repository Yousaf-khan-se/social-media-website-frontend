import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    addNotification,
    setPushSupport,
    setFcmToken,
    subscribeToPushNotifications,
    fetchNotifications
} from '@/store/slices/notificationsSlice';
import { updateNotificationSettings } from '@/store/slices/settingsSlice';
import notificationService from '@/services/notificationService';
import { onMessageListener, getStoredToken } from '@/services/firebase-messaging';
import { useToast } from '@/hooks/use-toast';
// import { duration } from 'zod/v4/classic/iso.cjs';

const NotificationManager = ({ children }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useSelector(state => state.auth);
    const { pushNotifications } = useSelector(state => state.settings?.settings?.notifications || {});
    // const authState = useSelector(state => state.auth);
    // const settingsState = useSelector(state => state.settings);
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
                        dispatch(updateNotificationSettings({ pushNotifications: true }));

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
                                dispatch(updateNotificationSettings({ pushNotifications: true }));
                            }
                        } catch (error) {
                            console.error('Error subscribing to push notifications:', error);
                        }
                    }

                }

                isInitialized.current = true;
            } catch (error) {
                console.error('Error initializing notifications:', error);
            }
        };

        initializeNotifications();
    }, [user, dispatch]);

    useEffect(() => {


        // Only run if user is authenticated and push notifications are explicitly enabled
        if (!user || pushNotifications !== true) return;



        // Set up foreground message listener
        let cleanup;

        const setupListener = async () => {
            try {
                const messagePromise = onMessageListener();

                messagePromise.then((payload) => {

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

                        // Refresh notifications list to get updated data from server
                        try {
                            dispatch(fetchNotifications({ page: 1, limit: 20 }));
                        } catch (refreshError) {
                            console.error('Error refreshing notifications:', refreshError);
                        }
                    }

                    // Show toast notification if notifications are enabled
                    if (pushNotifications) {
                        const handleToastClick = () => {
                            if (!payload.data) return;

                            const { type, postId, chatRoomId, senderId } = payload.data;

                            switch (type) {
                                case 'message':
                                case 'chat_created':
                                case 'group_created':
                                case 'group_added':
                                    navigate(chatRoomId ? `/messages?chat=${chatRoomId}` : '/messages');
                                    break;
                                case 'chat_permission_request':
                                    navigate('/messages?view=requests');
                                    break;
                                case 'like':
                                case 'comment':
                                case 'share':
                                    if (postId) {
                                        navigate(`/post/${postId}`);
                                    } else {
                                        navigate('/notifications');
                                    }
                                    break;
                                case 'follow':
                                    if (senderId) {
                                        navigate(`/user/${senderId}`);
                                    } else {
                                        navigate('/notifications');
                                    }
                                    break;
                                default:
                                    navigate('/notifications');
                            }
                        };

                        toast({
                            title: payload.notification?.title || 'New Notification',
                            description: payload.notification?.body,
                            action: (
                                <button
                                    onClick={handleToastClick}
                                    className="text-sm font-medium text-primary hover:underline"
                                >
                                    View
                                </button>
                            ),
                            duration: 5000,
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
    }, [user, pushNotifications, dispatch, toast, navigate]);

    return <>{children}</>;
};

export default NotificationManager;