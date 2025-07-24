import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateNotificationSettings } from '@/store/slices/settingsSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Bell,
    Heart,
    MessageCircle,
    UserPlus,
    Share,
    Mail,
    Clock,
    Smartphone,
    Volume2
} from 'lucide-react'

const NotificationSettings = () => {
    const dispatch = useDispatch()
    const { settings } = useSelector(state => state.settings)
    const [localSettings, setLocalSettings] = useState(settings?.notifications || {})
    const [saving, setSaving] = useState(false)

    const handleSettingChange = async (key, value) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }))
        setSaving(true)
        try {
            await dispatch(updateNotificationSettings({ [key]: value })).unwrap()
        } catch (error) {
            console.error('Failed to update notification settings:', error)
        } finally {
            setSaving(false)
        }
    }

    const handleQuietHoursChange = async (field, value) => {
        const newQuietHours = {
            ...localSettings.quietHours,
            [field]: value
        }
        setLocalSettings(prev => ({
            ...prev,
            quietHours: newQuietHours
        }))
        setSaving(true)
        try {
            await dispatch(updateNotificationSettings({ quietHours: newQuietHours })).unwrap()
        } catch (error) {
            console.error('Failed to update quiet hours:', error)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            {saving && (
                <div className="text-center">
                    <Badge variant="secondary">Saving...</Badge>
                </div>
            )}

            {/* Master Control */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Push Notifications
                    </CardTitle>
                    <CardDescription>
                        Master control for all push notifications
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Enable Push Notifications</Label>
                            <p className="text-xs text-muted-foreground">
                                Receive notifications on this device
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.pushNotifications !== false}
                            onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Activity Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5" />
                        Activity Notifications
                    </CardTitle>
                    <CardDescription>
                        Get notified about interactions with your content
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Heart className="h-4 w-4" />
                            <div>
                                <Label className="text-sm font-medium">Likes</Label>
                                <p className="text-xs text-muted-foreground">
                                    When someone likes your posts
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={localSettings.likes !== false}
                            onCheckedChange={(checked) => handleSettingChange('likes', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <MessageCircle className="h-4 w-4" />
                            <div>
                                <Label className="text-sm font-medium">Comments</Label>
                                <p className="text-xs text-muted-foreground">
                                    When someone comments on your posts
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={localSettings.comments !== false}
                            onCheckedChange={(checked) => handleSettingChange('comments', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Share className="h-4 w-4" />
                            <div>
                                <Label className="text-sm font-medium">Shares</Label>
                                <p className="text-xs text-muted-foreground">
                                    When someone shares your posts
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={localSettings.shares !== false}
                            onCheckedChange={(checked) => handleSettingChange('shares', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Social Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Social Notifications
                    </CardTitle>
                    <CardDescription>
                        Get notified about new connections and followers
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <UserPlus className="h-4 w-4" />
                            <div>
                                <Label className="text-sm font-medium">New Followers</Label>
                                <p className="text-xs text-muted-foreground">
                                    When someone follows you
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={localSettings.follows !== false}
                            onCheckedChange={(checked) => handleSettingChange('follows', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <UserPlus className="h-4 w-4" />
                            <div>
                                <Label className="text-sm font-medium">Follow Requests</Label>
                                <p className="text-xs text-muted-foreground">
                                    When someone requests to follow you
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={localSettings.followerRequests !== false}
                            onCheckedChange={(checked) => handleSettingChange('followerRequests', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Message Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Message Notifications
                    </CardTitle>
                    <CardDescription>
                        Get notified about messages and chats
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <MessageCircle className="h-4 w-4" />
                            <div>
                                <Label className="text-sm font-medium">Direct Messages</Label>
                                <p className="text-xs text-muted-foreground">
                                    When you receive a direct message
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={localSettings.messages !== false}
                            onCheckedChange={(checked) => handleSettingChange('messages', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <MessageCircle className="h-4 w-4" />
                            <div>
                                <Label className="text-sm font-medium">Group Chats</Label>
                                <p className="text-xs text-muted-foreground">
                                    When you receive a group message
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={localSettings.groupChats !== false}
                            onCheckedChange={(checked) => handleSettingChange('groupChats', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Volume2 className="h-4 w-4" />
                            <div>
                                <Label className="text-sm font-medium">Message Preview</Label>
                                <p className="text-xs text-muted-foreground">
                                    Show message content in notifications
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={localSettings.messagePreview !== false}
                            onCheckedChange={(checked) => handleSettingChange('messagePreview', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Email Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Email Notifications
                    </CardTitle>
                    <CardDescription>
                        Receive notifications via email
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Email Notifications</Label>
                            <p className="text-xs text-muted-foreground">
                                Receive important notifications via email
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.emailNotifications === true}
                            onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Weekly Digest</Label>
                            <p className="text-xs text-muted-foreground">
                                Weekly summary of your activity
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.weeklyDigest === true}
                            onCheckedChange={(checked) => handleSettingChange('weeklyDigest', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Quiet Hours */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Quiet Hours
                    </CardTitle>
                    <CardDescription>
                        Silence notifications during specific hours
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Enable Quiet Hours</Label>
                            <p className="text-xs text-muted-foreground">
                                Automatically silence notifications during set hours
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.quietHours?.enabled === true}
                            onCheckedChange={(checked) => handleQuietHoursChange('enabled', checked)}
                        />
                    </div>

                    {localSettings.quietHours?.enabled && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start-time">Start Time</Label>
                                <Input
                                    id="start-time"
                                    type="time"
                                    value={localSettings.quietHours?.startTime || '22:00'}
                                    onChange={(e) => handleQuietHoursChange('startTime', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end-time">End Time</Label>
                                <Input
                                    id="end-time"
                                    type="time"
                                    value={localSettings.quietHours?.endTime || '08:00'}
                                    onChange={(e) => handleQuietHoursChange('endTime', e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default NotificationSettings
