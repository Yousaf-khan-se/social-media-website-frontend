import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateContentSettings } from '@/store/slices/settingsSlice'
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
    Eye,
    EyeOff,
    Filter,
    ChevronDown,
    AlertTriangle,
    Volume2,
    Play,
    Pause,
    Image,
    Video,
    FileText
} from 'lucide-react'

const ContentSettings = () => {
    const dispatch = useDispatch()
    const { settings } = useSelector(state => state.settings)
    const [localSettings, setLocalSettings] = useState(settings?.content || {})
    const [saving, setSaving] = useState(false)

    const handleSettingChange = async (key, value) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }))
        setSaving(true)
        try {
            await dispatch(updateContentSettings({ [key]: value })).unwrap()
        } catch (error) {
            console.error('Failed to update content settings:', error)
        } finally {
            setSaving(false)
        }
    }

    const contentFilterOptions = [
        { value: 'off', label: 'Off' },
        { value: 'limited', label: 'Limited' },
        { value: 'moderate', label: 'Moderate' },
        { value: 'strict', label: 'Strict' }
    ]

    const autoplayOptions = [
        { value: 'always', label: 'Always' },
        { value: 'wifi', label: 'On Wi-Fi only' },
        { value: 'never', label: 'Never' }
    ]

    const imageQualityOptions = [
        { value: 'high', label: 'High Quality' },
        { value: 'medium', label: 'Medium Quality' },
        { value: 'low', label: 'Low Quality (Data Saver)' }
    ]

    return (
        <div className="space-y-6">
            {saving && (
                <div className="text-center">
                    <Badge variant="secondary">Saving...</Badge>
                </div>
            )}

            {/* Content Filtering */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Content Filtering
                    </CardTitle>
                    <CardDescription>
                        Control what content you see in your feed
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Sensitive Content Filter</Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                    {contentFilterOptions.find(option => option.value === localSettings.sensitiveContentFilter)?.label || 'Moderate'}
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-full">
                                {contentFilterOptions.map((option) => (
                                    <DropdownMenuItem
                                        key={option.value}
                                        onClick={() => handleSettingChange('sensitiveContentFilter', option.value)}
                                    >
                                        {option.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <p className="text-xs text-muted-foreground">
                            Filter potentially sensitive or inappropriate content
                        </p>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Hide Blocked Users' Content</Label>
                            <p className="text-xs text-muted-foreground">
                                Don't show content from blocked users in feeds
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.hideBlockedContent !== false}
                            onCheckedChange={(checked) => handleSettingChange('hideBlockedContent', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Content Warnings</Label>
                            <p className="text-xs text-muted-foreground">
                                Show warnings for potentially sensitive content
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.contentWarnings !== false}
                            onCheckedChange={(checked) => handleSettingChange('contentWarnings', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Blur Sensitive Media</Label>
                            <p className="text-xs text-muted-foreground">
                                Blur images and videos marked as sensitive
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.blurSensitiveMedia !== false}
                            onCheckedChange={(checked) => handleSettingChange('blurSensitiveMedia', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Media Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Play className="h-5 w-5" />
                        Media Playback
                    </CardTitle>
                    <CardDescription>
                        Configure how media content is displayed and played
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Video Autoplay</Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                    {autoplayOptions.find(option => option.value === localSettings.videoAutoplay)?.label || 'On Wi-Fi only'}
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-full">
                                {autoplayOptions.map((option) => (
                                    <DropdownMenuItem
                                        key={option.value}
                                        onClick={() => handleSettingChange('videoAutoplay', option.value)}
                                    >
                                        {option.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <p className="text-xs text-muted-foreground">
                            When to automatically play videos in your feed
                        </p>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Autoplay with Sound</Label>
                            <p className="text-xs text-muted-foreground">
                                Play video sound automatically
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.autoplayWithSound === true}
                            onCheckedChange={(checked) => handleSettingChange('autoplayWithSound', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">GIF Autoplay</Label>
                            <p className="text-xs text-muted-foreground">
                                Automatically play GIF animations
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.gifAutoplay !== false}
                            onCheckedChange={(checked) => handleSettingChange('gifAutoplay', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Show Media Previews</Label>
                            <p className="text-xs text-muted-foreground">
                                Show thumbnails for images and videos
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.showMediaPreviews !== false}
                            onCheckedChange={(checked) => handleSettingChange('showMediaPreviews', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Image Quality */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Image className="h-5 w-5" />
                        Image Quality
                    </CardTitle>
                    <CardDescription>
                        Control image loading and quality settings
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Image Quality</Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                    {imageQualityOptions.find(option => option.value === localSettings.imageQuality)?.label || 'High Quality'}
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-full">
                                {imageQualityOptions.map((option) => (
                                    <DropdownMenuItem
                                        key={option.value}
                                        onClick={() => handleSettingChange('imageQuality', option.value)}
                                    >
                                        {option.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <p className="text-xs text-muted-foreground">
                            Higher quality uses more data
                        </p>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Lazy Load Images</Label>
                            <p className="text-xs text-muted-foreground">
                                Load images only when needed (saves bandwidth)
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.lazyLoadImages !== false}
                            onCheckedChange={(checked) => handleSettingChange('lazyLoadImages', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Preload Images</Label>
                            <p className="text-xs text-muted-foreground">
                                Load images before they're visible
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.preloadImages === true}
                            onCheckedChange={(checked) => handleSettingChange('preloadImages', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Feed Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Feed Preferences
                    </CardTitle>
                    <CardDescription>
                        Customize what appears in your feed
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Show Reposts</Label>
                            <p className="text-xs text-muted-foreground">
                                Display content shared by people you follow
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.showReposts !== false}
                            onCheckedChange={(checked) => handleSettingChange('showReposts', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Show Sponsored Content</Label>
                            <p className="text-xs text-muted-foreground">
                                Display promoted posts and advertisements
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.showSponsoredContent !== false}
                            onCheckedChange={(checked) => handleSettingChange('showSponsoredContent', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Chronological Feed</Label>
                            <p className="text-xs text-muted-foreground">
                                Show posts in chronological order instead of algorithmic
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.chronologicalFeed === true}
                            onCheckedChange={(checked) => handleSettingChange('chronologicalFeed', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Hide Read Posts</Label>
                            <p className="text-xs text-muted-foreground">
                                Hide posts you've already seen
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.hideReadPosts === true}
                            onCheckedChange={(checked) => handleSettingChange('hideReadPosts', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Content Discovery */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Content Discovery
                    </CardTitle>
                    <CardDescription>
                        Control how your content is discovered by others
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Suggest My Posts</Label>
                            <p className="text-xs text-muted-foreground">
                                Allow your posts to be suggested to others
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.suggestPosts !== false}
                            onCheckedChange={(checked) => handleSettingChange('suggestPosts', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Include in Search</Label>
                            <p className="text-xs text-muted-foreground">
                                Allow your content to appear in search results
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.includeInSearch !== false}
                            onCheckedChange={(checked) => handleSettingChange('includeInSearch', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Trending Topics</Label>
                            <p className="text-xs text-muted-foreground">
                                Include your content in trending calculations
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.includeTrending !== false}
                            onCheckedChange={(checked) => handleSettingChange('includeTrending', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Personalized Recommendations</Label>
                            <p className="text-xs text-muted-foreground">
                                Use your activity to improve content recommendations
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.personalizedRecommendations !== false}
                            onCheckedChange={(checked) => handleSettingChange('personalizedRecommendations', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Data Usage */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Data Usage
                    </CardTitle>
                    <CardDescription>
                        Manage how much data the app uses
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Data Saver Mode</Label>
                            <p className="text-xs text-muted-foreground">
                                Reduce data usage by loading lower quality content
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.dataSaverMode === true}
                            onCheckedChange={(checked) => handleSettingChange('dataSaverMode', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Preload on Wi-Fi Only</Label>
                            <p className="text-xs text-muted-foreground">
                                Only preload content when connected to Wi-Fi
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.preloadWifiOnly !== false}
                            onCheckedChange={(checked) => handleSettingChange('preloadWifiOnly', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Reduce Motion</Label>
                            <p className="text-xs text-muted-foreground">
                                Minimize animations and transitions
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.reduceMotion === true}
                            onCheckedChange={(checked) => handleSettingChange('reduceMotion', checked)}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ContentSettings
