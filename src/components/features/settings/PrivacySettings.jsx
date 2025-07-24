import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updatePrivacySettings } from '@/store/slices/settingsSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Shield,
    Eye,
    MessageSquare,
    UserPlus,
    Search,
    Users,
    ChevronDown,
    Globe,
    Lock,
    EyeOff
} from 'lucide-react'

const VISIBILITY_OPTIONS = [
    { value: 'public', label: 'Public', description: 'Anyone can see', icon: Globe },
    { value: 'followers', label: 'Followers Only', description: 'Only your followers', icon: Users },
    { value: 'private', label: 'Private', description: 'Only you', icon: Lock }
]

const MESSAGE_OPTIONS = [
    { value: 'everyone', label: 'Everyone', description: 'Anyone can message you' },
    { value: 'followers', label: 'Followers Only', description: 'Only people you follow' },
    { value: 'nobody', label: 'Nobody', description: 'No one can message you' }
]

const FOLLOW_OPTIONS = [
    { value: 'everyone', label: 'Everyone', description: 'Anyone can follow you' },
    { value: 'manual_approval', label: 'Manual Approval', description: 'You approve each follow request' }
]

const PrivacySettings = () => {
    const dispatch = useDispatch()
    const { settings } = useSelector(state => state.settings)
    const [localSettings, setLocalSettings] = useState(settings?.privacy || {})
    const [saving, setSaving] = useState(false)

    const handleSettingChange = async (key, value) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }))
        setSaving(true)
        try {
            await dispatch(updatePrivacySettings({ [key]: value })).unwrap()
        } catch (error) {
            console.error('Failed to update privacy settings:', error)
        } finally {
            setSaving(false)
        }
    }

    const VisibilityDropdown = ({ label, value, options, onChange, description }) => {
        const currentOption = options.find(opt => opt.value === value)

        return (
            <div className="space-y-2">
                <Label className="text-sm font-medium">{label}</Label>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                            <div className="flex items-center gap-2">
                                {currentOption && <currentOption.icon className="h-4 w-4" />}
                                <span>{currentOption?.label || 'Select option'}</span>
                            </div>
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[300px]">
                        {options.map((option) => (
                            <DropdownMenuItem
                                key={option.value}
                                onClick={() => onChange(option.value)}
                                className="flex items-center gap-3 p-3"
                            >
                                <option.icon className="h-4 w-4" />
                                <div>
                                    <p className="font-medium">{option.label}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {option.description}
                                    </p>
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                {description && (
                    <p className="text-xs text-muted-foreground">{description}</p>
                )}
            </div>
        )
    }

    const SimpleDropdown = ({ label, value, options, onChange, description }) => {
        const currentOption = options.find(opt => opt.value === value)

        return (
            <div className="space-y-2">
                <Label className="text-sm font-medium">{label}</Label>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                            <span>{currentOption?.label || 'Select option'}</span>
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[300px]">
                        {options.map((option) => (
                            <DropdownMenuItem
                                key={option.value}
                                onClick={() => onChange(option.value)}
                                className="p-3"
                            >
                                <div>
                                    <p className="font-medium">{option.label}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {option.description}
                                    </p>
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                {description && (
                    <p className="text-xs text-muted-foreground">{description}</p>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {saving && (
                <div className="text-center">
                    <Badge variant="secondary">Saving...</Badge>
                </div>
            )}

            {/* Profile Visibility */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Profile Visibility
                    </CardTitle>
                    <CardDescription>
                        Control who can see your profile and posts
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <VisibilityDropdown
                        label="Profile Visibility"
                        value={localSettings.profileVisibility || 'public'}
                        options={VISIBILITY_OPTIONS}
                        onChange={(value) => handleSettingChange('profileVisibility', value)}
                        description="Who can see your profile information and posts"
                    />

                    <VisibilityDropdown
                        label="Default Post Visibility"
                        value={localSettings.defaultPostVisibility || 'public'}
                        options={VISIBILITY_OPTIONS}
                        onChange={(value) => handleSettingChange('defaultPostVisibility', value)}
                        description="Default privacy setting for new posts"
                    />

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Allow Post Sharing</Label>
                            <p className="text-xs text-muted-foreground">
                                Let others share your posts
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.allowPostSharing !== false}
                            onCheckedChange={(checked) => handleSettingChange('allowPostSharing', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Contact & Discovery */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Contact & Messaging
                    </CardTitle>
                    <CardDescription>
                        Control who can contact you and how
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SimpleDropdown
                        label="Who Can Message Me"
                        value={localSettings.whoCanMessageMe || 'everyone'}
                        options={MESSAGE_OPTIONS}
                        onChange={(value) => handleSettingChange('whoCanMessageMe', value)}
                        description="Control who can send you direct messages"
                    />

                    <SimpleDropdown
                        label="Who Can Follow Me"
                        value={localSettings.whoCanFollowMe || 'everyone'}
                        options={FOLLOW_OPTIONS}
                        onChange={(value) => handleSettingChange('whoCanFollowMe', value)}
                        description="Control how people can follow your account"
                    />
                </CardContent>
            </Card>

            {/* Online Status & Activity */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Online Status & Activity
                    </CardTitle>
                    <CardDescription>
                        Control what others can see about your activity
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Show Last Seen</Label>
                            <p className="text-xs text-muted-foreground">
                                Let others see when you were last active
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.showLastSeen !== false}
                            onCheckedChange={(checked) => handleSettingChange('showLastSeen', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Show Online Status</Label>
                            <p className="text-xs text-muted-foreground">
                                Let others see when you're online
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.showOnlineStatus !== false}
                            onCheckedChange={(checked) => handleSettingChange('showOnlineStatus', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Follower Visibility */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Follower & Following Lists
                    </CardTitle>
                    <CardDescription>
                        Control who can see your connections
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <VisibilityDropdown
                        label="Who Can See My Followers"
                        value={localSettings.whoCanSeeMyFollowers || 'everyone'}
                        options={VISIBILITY_OPTIONS}
                        onChange={(value) => handleSettingChange('whoCanSeeMyFollowers', value)}
                        description="Control who can see your follower list"
                    />

                    <VisibilityDropdown
                        label="Who Can See My Following"
                        value={localSettings.whoCanSeeMyFollowing || 'everyone'}
                        options={VISIBILITY_OPTIONS}
                        onChange={(value) => handleSettingChange('whoCanSeeMyFollowing', value)}
                        description="Control who can see who you follow"
                    />
                </CardContent>
            </Card>

            {/* Search & Discovery */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Search & Discovery
                    </CardTitle>
                    <CardDescription>
                        Control how others can find you
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Allow Search by Email</Label>
                            <p className="text-xs text-muted-foreground">
                                Let others find you using your email address
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.allowSearchByEmail === true}
                            onCheckedChange={(checked) => handleSettingChange('allowSearchByEmail', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Allow Search by Username</Label>
                            <p className="text-xs text-muted-foreground">
                                Let others find you using your username
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.allowSearchByUsername !== false}
                            onCheckedChange={(checked) => handleSettingChange('allowSearchByUsername', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Show in Suggestions</Label>
                            <p className="text-xs text-muted-foreground">
                                Appear in friend suggestions for others
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.showInSuggestions !== false}
                            onCheckedChange={(checked) => handleSettingChange('showInSuggestions', checked)}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default PrivacySettings
