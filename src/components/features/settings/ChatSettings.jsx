import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateChatSettings } from '@/store/slices/settingsSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    MessageCircle,
    Clock,
    Eye,
    Bell,
    Download,
    Trash2,
    ChevronDown,
    Users,
    Shield,
    Volume2
} from 'lucide-react'

const ChatSettings = () => {
    const dispatch = useDispatch()
    const { settings } = useSelector(state => state.settings)
    const [localSettings, setLocalSettings] = useState(settings?.chat || {})
    const [saving, setSaving] = useState(false)

    const handleSettingChange = async (key, value) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }))
        setSaving(true)
        try {
            await dispatch(updateChatSettings({ [key]: value })).unwrap()
        } catch (error) {
            console.error('Failed to update chat settings:', error)
        } finally {
            setSaving(false)
        }
    }

    const retentionOptions = [
        { value: '7', label: '7 days' },
        { value: '30', label: '30 days' },
        { value: '90', label: '3 months' },
        { value: '365', label: '1 year' },
        { value: 'forever', label: 'Forever' }
    ]

    const autoDeleteOptions = [
        { value: 'never', label: 'Never' },
        { value: '24h', label: '24 hours' },
        { value: '7d', label: '7 days' },
        { value: '30d', label: '30 days' }
    ]

    const groupSizeOptions = [
        { value: '50', label: '50 members' },
        { value: '100', label: '100 members' },
        { value: '250', label: '250 members' },
        { value: '500', label: '500 members' }
    ]

    return (
        <div className="space-y-6">
            {saving && (
                <div className="text-center">
                    <Badge variant="secondary">Saving...</Badge>
                </div>
            )}

            {/* Message Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Message Settings
                    </CardTitle>
                    <CardDescription>
                        Configure how messages are displayed and behave
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Read Receipts</Label>
                            <p className="text-xs text-muted-foreground">
                                Let others know when you've read their messages
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.readReceipts !== false}
                            onCheckedChange={(checked) => handleSettingChange('readReceipts', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Typing Indicators</Label>
                            <p className="text-xs text-muted-foreground">
                                Show when you're typing to others
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.typingIndicators !== false}
                            onCheckedChange={(checked) => handleSettingChange('typingIndicators', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Online Status</Label>
                            <p className="text-xs text-muted-foreground">
                                Show your online status to others
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.onlineStatus !== false}
                            onCheckedChange={(checked) => handleSettingChange('onlineStatus', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Last Seen</Label>
                            <p className="text-xs text-muted-foreground">
                                Show when you were last active
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.lastSeen !== false}
                            onCheckedChange={(checked) => handleSettingChange('lastSeen', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Chat Privacy
                    </CardTitle>
                    <CardDescription>
                        Control who can message you and how
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Message Requests</Label>
                            <p className="text-xs text-muted-foreground">
                                Require approval for messages from strangers
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.messageRequests !== false}
                            onCheckedChange={(checked) => handleSettingChange('messageRequests', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Block Screenshots</Label>
                            <p className="text-xs text-muted-foreground">
                                Prevent screenshots in disappearing messages
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.blockScreenshots === true}
                            onCheckedChange={(checked) => handleSettingChange('blockScreenshots', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Forward Protection</Label>
                            <p className="text-xs text-muted-foreground">
                                Restrict forwarding of your messages
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.forwardProtection === true}
                            onCheckedChange={(checked) => handleSettingChange('forwardProtection', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Media & Files */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5" />
                        Media & Files
                    </CardTitle>
                    <CardDescription>
                        Configure automatic downloads and storage
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Auto-download Images</Label>
                            <p className="text-xs text-muted-foreground">
                                Automatically download images in chats
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.autoDownloadImages !== false}
                            onCheckedChange={(checked) => handleSettingChange('autoDownloadImages', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Auto-download Videos</Label>
                            <p className="text-xs text-muted-foreground">
                                Automatically download videos in chats
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.autoDownloadVideos === true}
                            onCheckedChange={(checked) => handleSettingChange('autoDownloadVideos', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Auto-download Documents</Label>
                            <p className="text-xs text-muted-foreground">
                                Automatically download documents in chats
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.autoDownloadDocuments === true}
                            onCheckedChange={(checked) => handleSettingChange('autoDownloadDocuments', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Compress Images</Label>
                            <p className="text-xs text-muted-foreground">
                                Automatically compress images before sending
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.compressImages !== false}
                            onCheckedChange={(checked) => handleSettingChange('compressImages', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Message History */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Message History
                    </CardTitle>
                    <CardDescription>
                        Control how long messages are kept
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Message Retention</Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                    {retentionOptions.find(option => option.value === localSettings.messageRetention)?.label || 'Forever'}
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-full">
                                {retentionOptions.map((option) => (
                                    <DropdownMenuItem
                                        key={option.value}
                                        onClick={() => handleSettingChange('messageRetention', option.value)}
                                    >
                                        {option.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <p className="text-xs text-muted-foreground">
                            How long to keep your message history
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Auto-delete Messages</Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                    {autoDeleteOptions.find(option => option.value === localSettings.autoDeleteMessages)?.label || 'Never'}
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-full">
                                {autoDeleteOptions.map((option) => (
                                    <DropdownMenuItem
                                        key={option.value}
                                        onClick={() => handleSettingChange('autoDeleteMessages', option.value)}
                                    >
                                        {option.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <p className="text-xs text-muted-foreground">
                            Automatically delete messages after this time
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Group Chat Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Group Chat Settings
                    </CardTitle>
                    <CardDescription>
                        Configure settings for group conversations
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Maximum Group Size</Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                    {groupSizeOptions.find(option => option.value === localSettings.maxGroupSize)?.label || '100 members'}
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-full">
                                {groupSizeOptions.map((option) => (
                                    <DropdownMenuItem
                                        key={option.value}
                                        onClick={() => handleSettingChange('maxGroupSize', option.value)}
                                    >
                                        {option.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <p className="text-xs text-muted-foreground">
                            Maximum number of members in your groups
                        </p>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Admin Approval for Groups</Label>
                            <p className="text-xs text-muted-foreground">
                                Require approval to add you to groups
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.groupAdminApproval !== false}
                            onCheckedChange={(checked) => handleSettingChange('groupAdminApproval', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Group Notifications</Label>
                            <p className="text-xs text-muted-foreground">
                                Receive notifications for group messages
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.groupNotifications !== false}
                            onCheckedChange={(checked) => handleSettingChange('groupNotifications', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Sound & Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Volume2 className="h-5 w-5" />
                        Sound & Notifications
                    </CardTitle>
                    <CardDescription>
                        Configure chat sounds and notification behavior
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Message Sounds</Label>
                            <p className="text-xs text-muted-foreground">
                                Play sound when receiving messages
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.messageSounds !== false}
                            onCheckedChange={(checked) => handleSettingChange('messageSounds', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">In-Chat Sounds</Label>
                            <p className="text-xs text-muted-foreground">
                                Play sounds while chatting
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.inChatSounds === true}
                            onCheckedChange={(checked) => handleSettingChange('inChatSounds', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Vibrate on Messages</Label>
                            <p className="text-xs text-muted-foreground">
                                Vibrate when receiving messages (mobile)
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.vibrateOnMessages !== false}
                            onCheckedChange={(checked) => handleSettingChange('vibrateOnMessages', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Preview in Notifications</Label>
                            <p className="text-xs text-muted-foreground">
                                Show message preview in notifications
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.previewInNotifications !== false}
                            onCheckedChange={(checked) => handleSettingChange('previewInNotifications', checked)}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ChatSettings
