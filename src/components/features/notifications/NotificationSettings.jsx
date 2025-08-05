import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
    updateNotificationSettings,
    fetchNotificationSettings
} from '@/store/slices/notificationsSlice';
import {
    Bell,
    Mail,
    Smartphone,
    Heart,
    MessageCircle,
    UserPlus,
    Hash,
    Crown,
    CheckCircle,
    AlertTriangle,
    Settings,
    Trash2,
    TestTube
} from 'lucide-react';
import { duration } from 'zod/v4/classic/iso.cjs';

const NotificationSettings = () => {
    const dispatch = useDispatch();
    const { toast } = useToast();
    const {
        settings,
        settingsLoading,
        pushSupported,
        pushEnabled,
        fcmToken
    } = useSelector(state => state.notifications);

    const [localSettings, setLocalSettings] = useState(settings);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    useEffect(() => {
        dispatch(fetchNotificationSettings());
    }, [dispatch]);

    const handleToggleChange = (key, value) => {
        setLocalSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            await dispatch(updateNotificationSettings(localSettings)).unwrap();
            toast({
                title: "Settings saved",
                description: "Your notification preferences have been updated",
                icon: <CheckCircle className="h-4 w-4" />,
                duration: 5000
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error?.message || "Failed to save settings",
                variant: "destructive",
                duration: 5000
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleEnablePushNotifications = async () => {
        if (!pushSupported) {
            toast({
                title: "Not supported",
                description: "Push notifications are not supported in this browser",
                variant: "destructive",
                duration: 5000
            });
            return;
        }

        try {
            await dispatch(subscribeToPushNotifications()).unwrap();
            toast({
                title: "Push notifications enabled",
                description: "You'll now receive push notifications",
                variant: "default",
                duration: 5000
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error?.message || "Failed to enable push notifications",
                variant: "destructive",
                duration: 5000
            });
        }
    };

    const handleDisablePushNotifications = async () => {
        try {
            await dispatch(unsubscribeFromPushNotifications()).unwrap();
            toast({
                title: "Push notifications disabled",
                description: "You'll no longer receive push notifications",
                variant: "default",
                duration: 5000
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error?.message || "Failed to disable push notifications",
                variant: "destructive",
                duration: 5000
            });
        }
    };

    const settingsGroups = [
        {
            title: "Delivery Methods",
            icon: <Bell className="h-5 w-5" />,
            items: [
                {
                    key: 'inApp',
                    label: 'In-App Notifications',
                    description: 'Show notifications within the app',
                    icon: <Smartphone className="h-4 w-4 text-blue-500" />
                },
                {
                    key: 'email',
                    label: 'Email Notifications',
                    description: 'Receive notifications via email',
                    icon: <Mail className="h-4 w-4 text-green-500" />
                }
            ]
        },
        {
            title: "Content Types",
            icon: <Hash className="h-5 w-5" />,
            items: [
                {
                    key: 'likes',
                    label: 'Likes',
                    description: 'When someone likes your posts or comments',
                    icon: <Heart className="h-4 w-4 text-red-500" />
                },
                {
                    key: 'comments',
                    label: 'Comments',
                    description: 'When someone comments on your posts',
                    icon: <MessageCircle className="h-4 w-4 text-blue-500" />
                },
                {
                    key: 'follows',
                    label: 'Follows',
                    description: 'When someone follows you',
                    icon: <UserPlus className="h-4 w-4 text-green-500" />
                },
                {
                    key: 'messages',
                    label: 'Messages',
                    description: 'New direct messages and chat notifications',
                    icon: <MessageCircle className="h-4 w-4 text-indigo-500" />
                },
                {
                    key: 'posts',
                    label: 'Posts',
                    description: 'When someone shares or mentions your posts',
                    icon: <Hash className="h-4 w-4 text-purple-500" />
                },
                {
                    key: 'admin',
                    label: 'Admin & System',
                    description: 'Important updates and announcements',
                    icon: <Crown className="h-4 w-4 text-yellow-500" />
                }
            ]
        }
    ];

    return (
        <div className="space-y-6">
            {/* Push Notifications Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5" />
                        Push Notifications
                    </CardTitle>
                    <CardDescription>
                        Receive notifications even when the app is closed
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Status</span>
                                {pushSupported ? (
                                    pushEnabled ? (
                                        <Badge variant="default" className="bg-green-100 text-green-800">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Enabled
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary">
                                            Disabled
                                        </Badge>
                                    )
                                ) : (
                                    <Badge variant="destructive">
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        Not Supported
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {pushSupported
                                    ? pushEnabled
                                        ? "You'll receive push notifications"
                                        : "Click enable to start receiving push notifications"
                                    : "Your browser doesn't support push notifications"
                                }
                            </p>
                        </div>
                        {pushSupported && (
                            <Button
                                onClick={pushEnabled ? handleDisablePushNotifications : handleEnablePushNotifications}
                                variant={pushEnabled ? "outline" : "default"}
                            >
                                {pushEnabled ? "Disable" : "Enable"}
                            </Button>
                        )}
                    </div>

                    {fcmToken && (
                        <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground">
                                Device registered for push notifications
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Notification Settings */}
            {settingsGroups.map((group, groupIndex) => (
                <Card key={groupIndex}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {group.icon}
                            {group.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {group.items.map((item, itemIndex) => (
                            <div key={item.key}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {item.icon}
                                        <div className="space-y-1">
                                            <span className="font-medium">{item.label}</span>
                                            <p className="text-sm text-muted-foreground">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={localSettings[item.key]}
                                        onCheckedChange={(checked) => handleToggleChange(item.key, checked)}
                                        disabled={settingsLoading}
                                    />
                                </div>
                                {itemIndex < group.items.length - 1 && <Separator className="mt-4" />}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}

            {/* Save Button */}
            <div className="flex justify-end">
                <Button
                    onClick={handleSaveSettings}
                    disabled={isSaving || settingsLoading}
                    className="min-w-[120px]"
                >
                    {isSaving ? "Saving..." : "Save Settings"}
                </Button>
            </div>

            {/* Danger Zone */}
            <Card className="border-destructive/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Danger Zone
                    </CardTitle>
                    <CardDescription>
                        These actions cannot be undone
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="destructive" disabled>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All Notifications (Coming Soon)
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default NotificationSettings;
