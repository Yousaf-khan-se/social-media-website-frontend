import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updatePreferencesSettings } from '@/store/slices/settingsSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Globe,
    Clock,
    ChevronDown,
    Moon,
    Sun,
    Monitor,
    Palette,
    Smartphone,
    Download,
    Wifi,
    Settings
} from 'lucide-react'

const PreferencesSettings = () => {
    const dispatch = useDispatch()
    const { settings } = useSelector(state => state.settings)
    const [localSettings, setLocalSettings] = useState(settings)
    const [saving, setSaving] = useState(false)

    const handleSettingChange = async (key, value) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }))
        setSaving(true)
        try {
            await dispatch(updatePreferencesSettings({ [key]: value })).unwrap()
        } catch (error) {
            console.error('Failed to update preferences:', error)
        } finally {
            setSaving(false)
        }
    }

    const languageOptions = [
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Español' },
        { value: 'fr', label: 'Français' },
        { value: 'de', label: 'Deutsch' },
        { value: 'it', label: 'Italiano' },
        { value: 'pt', label: 'Português' },
        { value: 'ru', label: 'Русский' },
        { value: 'ja', label: '日本語' },
        { value: 'ko', label: '한국어' },
        { value: 'zh', label: '中文' }
    ]

    const timezoneOptions = [
        { value: 'UTC-12', label: '(UTC-12:00) International Date Line West' },
        { value: 'UTC-11', label: '(UTC-11:00) Coordinated Universal Time-11' },
        { value: 'UTC-10', label: '(UTC-10:00) Hawaii' },
        { value: 'UTC-9', label: '(UTC-09:00) Alaska' },
        { value: 'UTC-8', label: '(UTC-08:00) Pacific Time (US & Canada)' },
        { value: 'UTC-7', label: '(UTC-07:00) Mountain Time (US & Canada)' },
        { value: 'UTC-6', label: '(UTC-06:00) Central Time (US & Canada)' },
        { value: 'UTC-5', label: '(UTC-05:00) Eastern Time (US & Canada)' },
        { value: 'UTC-4', label: '(UTC-04:00) Atlantic Time (Canada)' },
        { value: 'UTC-3', label: '(UTC-03:00) Buenos Aires, Georgetown' },
        { value: 'UTC-2', label: '(UTC-02:00) Coordinated Universal Time-02' },
        { value: 'UTC-1', label: '(UTC-01:00) Azores' },
        { value: 'UTC+0', label: '(UTC+00:00) Dublin, Edinburgh, Lisbon, London' },
        { value: 'UTC+1', label: '(UTC+01:00) Amsterdam, Berlin, Rome, Vienna' },
        { value: 'UTC+2', label: '(UTC+02:00) Athens, Bucharest, Istanbul' },
        { value: 'UTC+3', label: '(UTC+03:00) Moscow, St. Petersburg' },
        { value: 'UTC+4', label: '(UTC+04:00) Abu Dhabi, Muscat' },
        { value: 'UTC+5', label: '(UTC+05:00) Islamabad, Karachi' },
        { value: 'UTC+6', label: '(UTC+06:00) Astana, Dhaka' },
        { value: 'UTC+7', label: '(UTC+07:00) Bangkok, Hanoi, Jakarta' },
        { value: 'UTC+8', label: '(UTC+08:00) Beijing, Chongqing, Hong Kong' },
        { value: 'UTC+9', label: '(UTC+09:00) Osaka, Sapporo, Tokyo' },
        { value: 'UTC+10', label: '(UTC+10:00) Canberra, Melbourne, Sydney' },
        { value: 'UTC+11', label: '(UTC+11:00) Coordinated Universal Time+11' },
        { value: 'UTC+12', label: '(UTC+12:00) Auckland, Wellington' }
    ]

    const themeOptions = [
        { value: 'light', label: 'Light', icon: Sun },
        { value: 'dark', label: 'Dark', icon: Moon },
        { value: 'system', label: 'System', icon: Monitor }
    ]

    const dateFormatOptions = [
        { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
        { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
        { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
        { value: 'DD MMM YYYY', label: 'DD MMM YYYY' }
    ]

    const timeFormatOptions = [
        { value: '12', label: '12-hour (AM/PM)' },
        { value: '24', label: '24-hour' }
    ]

    return (
        <div className="space-y-6">
            {saving && (
                <div className="text-center">
                    <Badge variant="secondary">Saving...</Badge>
                </div>
            )}

            {/* Language & Region */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Language & Region
                    </CardTitle>
                    <CardDescription>
                        Set your language and regional preferences
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Language</Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                    {languageOptions.find(option => option.value === localSettings.language)?.label || 'English'}
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                                {languageOptions.map((option) => (
                                    <DropdownMenuItem
                                        key={option.value}
                                        onClick={() => handleSettingChange('language', option.value)}
                                    >
                                        {option.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <p className="text-xs text-muted-foreground">
                            Choose your preferred language for the interface
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Timezone</Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                    {timezoneOptions.find(option => option.value === localSettings.timezone)?.label?.substring(0, 30) + '...' || 'Select timezone'}
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                                {timezoneOptions.map((option) => (
                                    <DropdownMenuItem
                                        key={option.value}
                                        onClick={() => handleSettingChange('timezone', option.value)}
                                    >
                                        {option.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <p className="text-xs text-muted-foreground">
                            Set your local timezone for accurate timestamps
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Date Format</Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                    {dateFormatOptions.find(option => option.value === localSettings.dateFormat)?.label || 'MM/DD/YYYY'}
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-full">
                                {dateFormatOptions.map((option) => (
                                    <DropdownMenuItem
                                        key={option.value}
                                        onClick={() => handleSettingChange('dateFormat', option.value)}
                                    >
                                        {option.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <p className="text-xs text-muted-foreground">
                            Choose how dates are displayed
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Time Format</Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                    {timeFormatOptions.find(option => option.value === localSettings.timeFormat)?.label || '12-hour (AM/PM)'}
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-full">
                                {timeFormatOptions.map((option) => (
                                    <DropdownMenuItem
                                        key={option.value}
                                        onClick={() => handleSettingChange('timeFormat', option.value)}
                                    >
                                        {option.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <p className="text-xs text-muted-foreground">
                            Choose how time is displayed
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Appearance
                    </CardTitle>
                    <CardDescription>
                        Customize the look and feel of the app
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Theme</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {themeOptions.map((option) => {
                                const Icon = option.icon
                                return (
                                    <Button
                                        key={option.value}
                                        variant={localSettings.theme === option.value ? "default" : "outline"}
                                        className="flex flex-col gap-2 h-auto py-3"
                                        onClick={() => handleSettingChange('theme', option.value)}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span className="text-xs">{option.label}</span>
                                    </Button>
                                )
                            })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Choose your preferred theme
                        </p>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Compact Mode</Label>
                            <p className="text-xs text-muted-foreground">
                                Use less spacing for a more compact interface
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.compactMode === true}
                            onCheckedChange={(checked) => handleSettingChange('compactMode', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Rounded Corners</Label>
                            <p className="text-xs text-muted-foreground">
                                Use rounded corners for interface elements
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.roundedCorners !== false}
                            onCheckedChange={(checked) => handleSettingChange('roundedCorners', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Show Animations</Label>
                            <p className="text-xs text-muted-foreground">
                                Enable smooth animations and transitions
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.showAnimations !== false}
                            onCheckedChange={(checked) => handleSettingChange('showAnimations', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Startup & Behavior */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Startup & Behavior
                    </CardTitle>
                    <CardDescription>
                        Configure how the app behaves when you start it
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Auto-refresh Feed</Label>
                            <p className="text-xs text-muted-foreground">
                                Automatically refresh your feed when you return
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.autoRefreshFeed !== false}
                            onCheckedChange={(checked) => handleSettingChange('autoRefreshFeed', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Remember Last Page</Label>
                            <p className="text-xs text-muted-foreground">
                                Open to the last page you were viewing
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.rememberLastPage === true}
                            onCheckedChange={(checked) => handleSettingChange('rememberLastPage', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Auto-save Drafts</Label>
                            <p className="text-xs text-muted-foreground">
                                Automatically save your posts as drafts
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.autoSaveDrafts !== false}
                            onCheckedChange={(checked) => handleSettingChange('autoSaveDrafts', checked)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="draft-interval">Auto-save Interval (minutes)</Label>
                        <Input
                            id="draft-interval"
                            type="number"
                            min="1"
                            max="60"
                            value={localSettings.autoSaveInterval || 5}
                            onChange={(e) => handleSettingChange('autoSaveInterval', parseInt(e.target.value))}
                            className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                            How often to save drafts automatically
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Performance */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5" />
                        Performance
                    </CardTitle>
                    <CardDescription>
                        Optimize app performance for your device
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">High Performance Mode</Label>
                            <p className="text-xs text-muted-foreground">
                                Use more resources for smoother performance
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.highPerformanceMode === true}
                            onCheckedChange={(checked) => handleSettingChange('highPerformanceMode', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Prefetch Content</Label>
                            <p className="text-xs text-muted-foreground">
                                Load content in advance for faster browsing
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.prefetchContent !== false}
                            onCheckedChange={(checked) => handleSettingChange('prefetchContent', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Background Sync</Label>
                            <p className="text-xs text-muted-foreground">
                                Sync data in the background when app is closed
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.backgroundSync !== false}
                            onCheckedChange={(checked) => handleSettingChange('backgroundSync', checked)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cache-size">Cache Size (MB)</Label>
                        <Input
                            id="cache-size"
                            type="number"
                            min="50"
                            max="1000"
                            value={localSettings.cacheSize || 200}
                            onChange={(e) => handleSettingChange('cacheSize', parseInt(e.target.value))}
                            className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                            Amount of storage to use for caching content
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Network */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wifi className="h-5 w-5" />
                        Network
                    </CardTitle>
                    <CardDescription>
                        Configure network and data usage settings
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Data Saver Mode</Label>
                            <p className="text-xs text-muted-foreground">
                                Reduce data usage when not on Wi-Fi
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.dataSaverMode === true}
                            onCheckedChange={(checked) => handleSettingChange('dataSaverMode', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Download on Wi-Fi Only</Label>
                            <p className="text-xs text-muted-foreground">
                                Only download media when connected to Wi-Fi
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.wifiOnlyDownloads === true}
                            onCheckedChange={(checked) => handleSettingChange('wifiOnlyDownloads', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Auto-retry Failed Uploads</Label>
                            <p className="text-xs text-muted-foreground">
                                Automatically retry uploads that fail
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.autoRetryUploads !== false}
                            onCheckedChange={(checked) => handleSettingChange('autoRetryUploads', checked)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="connection-timeout">Connection Timeout (seconds)</Label>
                        <Input
                            id="connection-timeout"
                            type="number"
                            min="5"
                            max="60"
                            value={localSettings.connectionTimeout || 30}
                            onChange={(e) => handleSettingChange('connectionTimeout', parseInt(e.target.value))}
                            className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                            How long to wait for network requests
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default PreferencesSettings
