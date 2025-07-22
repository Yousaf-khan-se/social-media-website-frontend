import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
    subscribeToPushNotifications
} from '@/store/slices/notificationsSlice';
import { sendTestNotification } from '@/services/firebase-messaging';
import {
    Bell,
    Heart,
    MessageCircle,
    UserPlus,
    Crown,
    CheckCircle,
    AlertTriangle,
    TestTube
} from 'lucide-react';

const NotificationTestPanel = () => {
    const dispatch = useDispatch();
    const { toast } = useToast();
    const { pushSupported, pushEnabled, fcmToken } = useSelector(state => state.notifications);
    const [testing, setTesting] = useState(false);

    const testNotifications = [
        {
            title: "Like Notification",
            body: "Sarah Wilson liked your post",
            type: "like",
            icon: Heart,
            color: "text-red-500"
        },
        {
            title: "Comment Notification",
            body: "Alex Smith commented on your post",
            type: "comment",
            icon: MessageCircle,
            color: "text-blue-500"
        },
        {
            title: "Follow Notification",
            body: "Mike Johnson started following you",
            type: "follow",
            icon: UserPlus,
            color: "text-green-500"
        },
        {
            title: "Message Notification",
            body: "You have a new message",
            type: "message",
            icon: MessageCircle,
            color: "text-indigo-500"
        },
        {
            title: "Admin Notification",
            body: "System maintenance scheduled for tonight",
            type: "admin",
            icon: Crown,
            color: "text-purple-500"
        }
    ];

    const handleSendTestNotification = async (testNotification) => {
        try {
            await sendTestNotification(testNotification.title, testNotification.body)
            toast({
                title: "Test Notification Sent",
                description: `${testNotification.title} test notification has been sent`,
                icon: <CheckCircle className="h-4 w-4" />
            })
        } catch (error) {
            toast({
                title: "Error",
                description: error?.message || "Failed to send test notification",
                variant: "destructive"
            })
        }
    };

    const handleSendAllTests = async () => {
        setTesting(true);
        try {
            for (const testNotification of testNotifications) {
                await sendTestNotification(testNotification.title, testNotification.body);
                // Add delay between notifications
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            toast({
                title: "All Test Notifications Sent",
                description: "All 5 test notifications have been sent successfully",
                icon: <CheckCircle className="h-4 w-4" />
            });
        } catch {
            toast({
                title: "Error",
                description: "Failed to send some test notifications",
                variant: "destructive"
            });
        } finally {
            setTesting(false);
        }
    };

    const handleEnablePush = async () => {
        try {
            await dispatch(subscribeToPushNotifications()).unwrap();
            toast({
                title: "Push Notifications Enabled",
                description: "You can now receive push notifications",
                icon: <CheckCircle className="h-4 w-4" />
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error?.message || "Failed to enable push notifications",
                variant: "destructive"
            });
        }
    };

    const getSystemStatus = () => {
        if (!pushSupported) {
            return {
                status: "unsupported",
                message: "Browser doesn't support push notifications",
                color: "destructive",
                icon: AlertTriangle
            };
        }

        if (!pushEnabled) {
            return {
                status: "disabled",
                message: "Push notifications are disabled",
                color: "secondary",
                icon: Bell
            };
        }

        return {
            status: "enabled",
            message: "Push notifications are enabled",
            color: "default",
            icon: CheckCircle
        };
    };

    const systemStatus = getSystemStatus();

    return (
        <div className="space-y-6">
            {/* System Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TestTube className="h-5 w-5" />
                        Notification System Test Panel
                    </CardTitle>
                    <CardDescription>
                        Test and verify push notification functionality
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">System Status</span>
                                <Badge variant={systemStatus.color} className="flex items-center gap-1">
                                    <systemStatus.icon className="h-3 w-3" />
                                    {systemStatus.status}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {systemStatus.message}
                            </p>
                        </div>
                        {!pushEnabled && pushSupported && (
                            <Button onClick={handleEnablePush}>
                                Enable Push Notifications
                            </Button>
                        )}
                    </div>

                    {fcmToken && (
                        <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">FCM Token (First 50 chars):</p>
                            <code className="text-xs bg-background p-1 rounded">
                                {fcmToken.substring(0, 50)}...
                            </code>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Test Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle>Test Notifications</CardTitle>
                    <CardDescription>
                        Send test notifications to verify the system is working
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Individual test buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {testNotifications.map((testNotification, index) => (
                            <Button
                                key={index}
                                variant="outline"
                                onClick={() => handleSendTestNotification(testNotification)}
                                disabled={!pushSupported || !pushEnabled}
                                className="flex items-center gap-2 justify-start"
                            >
                                <testNotification.icon className={`h-4 w-4 ${testNotification.color}`} />
                                <div className="text-left">
                                    <div className="font-medium">{testNotification.type}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {testNotification.title}
                                    </div>
                                </div>
                            </Button>
                        ))}
                    </div>

                    {/* Send all tests button */}
                    <div className="flex justify-center pt-4 border-t">
                        <Button
                            onClick={handleSendAllTests}
                            disabled={!pushSupported || !pushEnabled || testing}
                            className="min-w-[200px]"
                        >
                            {testing ? "Sending Tests..." : "Send All Test Notifications"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Requirements Check */}
            <Card>
                <CardHeader>
                    <CardTitle>System Requirements</CardTitle>
                    <CardDescription>
                        Verify that all requirements are met for push notifications
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            {typeof window !== 'undefined' && 'Notification' in window ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm">Notification API Support</span>
                        </div>

                        <div className="flex items-center gap-2">
                            {typeof window !== 'undefined' && 'serviceWorker' in navigator ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm">Service Worker Support</span>
                        </div>

                        <div className="flex items-center gap-2">
                            {typeof window !== 'undefined' && 'PushManager' in window ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm">Push Manager Support</span>
                        </div>

                        <div className="flex items-center gap-2">
                            {typeof window !== 'undefined' && window.location.protocol === 'https:' ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : window.location.hostname === 'localhost' ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm">HTTPS Connection (or localhost)</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default NotificationTestPanel;
