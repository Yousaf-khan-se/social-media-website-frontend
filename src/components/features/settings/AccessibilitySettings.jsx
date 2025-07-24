import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateAccessibilitySettings } from '@/store/slices/settingsSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Eye,
    Volume2,
    Type,
    ChevronDown,
    Palette,
    Zap,
    MousePointer,
    Keyboard,
    Contrast,
    Accessibility
} from 'lucide-react'

const AccessibilitySettings = () => {
    const dispatch = useDispatch()
    const { settings } = useSelector(state => state.settings)
    const [localSettings, setLocalSettings] = useState(settings?.accessibility || {})
    const [saving, setSaving] = useState(false)

    const handleSettingChange = async (key, value) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }))
        setSaving(true)
        try {
            await dispatch(updateAccessibilitySettings({ [key]: value })).unwrap()
        } catch (error) {
            console.error('Failed to update accessibility settings:', error)
        } finally {
            setSaving(false)
        }
    }

    const fontSizeOptions = [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
        { value: 'extra-large', label: 'Extra Large' }
    ]

    const contrastOptions = [
        { value: 'normal', label: 'Normal' },
        { value: 'high', label: 'High Contrast' },
        { value: 'extra-high', label: 'Extra High Contrast' }
    ]

    const colorThemeOptions = [
        { value: 'default', label: 'Default' },
        { value: 'protanopia', label: 'Protanopia' },
        { value: 'deuteranopia', label: 'Deuteranopia' },
        { value: 'tritanopia', label: 'Tritanopia' },
        { value: 'monochrome', label: 'Monochrome' }
    ]

    const navigationOptions = [
        { value: 'default', label: 'Default' },
        { value: 'keyboard-only', label: 'Keyboard Only' },
        { value: 'voice', label: 'Voice Navigation' },
        { value: 'switch', label: 'Switch Control' }
    ]

    return (
        <div className="space-y-6">
            {saving && (
                <div className="text-center">
                    <Badge variant="secondary">Saving...</Badge>
                </div>
            )}

            {/* Visual Accessibility */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Visual Accessibility
                    </CardTitle>
                    <CardDescription>
                        Customize visual elements for better readability
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Font Size</Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                    {fontSizeOptions.find(option => option.value === localSettings.fontSize)?.label || 'Medium'}
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-full">
                                {fontSizeOptions.map((option) => (
                                    <DropdownMenuItem
                                        key={option.value}
                                        onClick={() => handleSettingChange('fontSize', option.value)}
                                    >
                                        {option.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <p className="text-xs text-muted-foreground">
                            Adjust text size throughout the app
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Contrast Level</Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                    {contrastOptions.find(option => option.value === localSettings.contrast)?.label || 'Normal'}
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-full">
                                {contrastOptions.map((option) => (
                                    <DropdownMenuItem
                                        key={option.value}
                                        onClick={() => handleSettingChange('contrast', option.value)}
                                    >
                                        {option.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <p className="text-xs text-muted-foreground">
                            Increase contrast for better visibility
                        </p>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Bold Text</Label>
                            <p className="text-xs text-muted-foreground">
                                Make all text bold for better readability
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.boldText === true}
                            onCheckedChange={(checked) => handleSettingChange('boldText', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Increase Line Spacing</Label>
                            <p className="text-xs text-muted-foreground">
                                Add more space between lines of text
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.increaseLineSpacing === true}
                            onCheckedChange={(checked) => handleSettingChange('increaseLineSpacing', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Underline Links</Label>
                            <p className="text-xs text-muted-foreground">
                                Always underline clickable links
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.underlineLinks === true}
                            onCheckedChange={(checked) => handleSettingChange('underlineLinks', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Color & Theme */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Color & Theme
                    </CardTitle>
                    <CardDescription>
                        Adjust colors for visual impairments
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Color Theme for Vision</Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                    {colorThemeOptions.find(option => option.value === localSettings.colorTheme)?.label || 'Default'}
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-full">
                                {colorThemeOptions.map((option) => (
                                    <DropdownMenuItem
                                        key={option.value}
                                        onClick={() => handleSettingChange('colorTheme', option.value)}
                                    >
                                        {option.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <p className="text-xs text-muted-foreground">
                            Optimize colors for different types of color vision
                        </p>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Dark Mode</Label>
                            <p className="text-xs text-muted-foreground">
                                Use dark colors to reduce eye strain
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.darkMode === true}
                            onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Reduce Blue Light</Label>
                            <p className="text-xs text-muted-foreground">
                                Filter blue light for comfortable viewing
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.reduceBlueLight === true}
                            onCheckedChange={(checked) => handleSettingChange('reduceBlueLight', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Invert Colors</Label>
                            <p className="text-xs text-muted-foreground">
                                Invert all colors on the screen
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.invertColors === true}
                            onCheckedChange={(checked) => handleSettingChange('invertColors', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Motion & Animation */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Motion & Animation
                    </CardTitle>
                    <CardDescription>
                        Control animations and motion effects
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Disable Parallax</Label>
                            <p className="text-xs text-muted-foreground">
                                Turn off parallax scrolling effects
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.disableParallax === true}
                            onCheckedChange={(checked) => handleSettingChange('disableParallax', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Pause Auto-playing Media</Label>
                            <p className="text-xs text-muted-foreground">
                                Prevent videos and GIFs from auto-playing
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.pauseAutoplay === true}
                            onCheckedChange={(checked) => handleSettingChange('pauseAutoplay', checked)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Animation Speed</Label>
                        <div className="px-2">
                            <Slider
                                value={[localSettings.animationSpeed || 100]}
                                onValueChange={(value) => handleSettingChange('animationSpeed', value[0])}
                                max={200}
                                min={25}
                                step={25}
                                className="w-full"
                            />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Slower</span>
                            <span>Normal</span>
                            <span>Faster</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Audio Accessibility */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Volume2 className="h-5 w-5" />
                        Audio Accessibility
                    </CardTitle>
                    <CardDescription>
                        Configure audio and sound settings
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Audio Descriptions</Label>
                            <p className="text-xs text-muted-foreground">
                                Enable audio descriptions for videos
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.audioDescriptions === true}
                            onCheckedChange={(checked) => handleSettingChange('audioDescriptions', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Captions</Label>
                            <p className="text-xs text-muted-foreground">
                                Always show captions when available
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.captions !== false}
                            onCheckedChange={(checked) => handleSettingChange('captions', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Sound Effects</Label>
                            <p className="text-xs text-muted-foreground">
                                Play sounds for interface interactions
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.soundEffects !== false}
                            onCheckedChange={(checked) => handleSettingChange('soundEffects', checked)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Volume Level</Label>
                        <div className="px-2">
                            <Slider
                                value={[localSettings.volumeLevel || 50]}
                                onValueChange={(value) => handleSettingChange('volumeLevel', value[0])}
                                max={100}
                                min={0}
                                step={5}
                                className="w-full"
                            />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Navigation */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MousePointer className="h-5 w-5" />
                        Navigation
                    </CardTitle>
                    <CardDescription>
                        Configure navigation and interaction methods
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Navigation Method</Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                    {navigationOptions.find(option => option.value === localSettings.navigationMethod)?.label || 'Default'}
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-full">
                                {navigationOptions.map((option) => (
                                    <DropdownMenuItem
                                        key={option.value}
                                        onClick={() => handleSettingChange('navigationMethod', option.value)}
                                    >
                                        {option.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <p className="text-xs text-muted-foreground">
                            Choose your preferred navigation method
                        </p>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Keyboard Navigation</Label>
                            <p className="text-xs text-muted-foreground">
                                Enable full keyboard navigation support
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.keyboardNavigation !== false}
                            onCheckedChange={(checked) => handleSettingChange('keyboardNavigation', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Focus Indicators</Label>
                            <p className="text-xs text-muted-foreground">
                                Show clear focus indicators for keyboard navigation
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.focusIndicators !== false}
                            onCheckedChange={(checked) => handleSettingChange('focusIndicators', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Skip Links</Label>
                            <p className="text-xs text-muted-foreground">
                                Show skip navigation links
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.skipLinks !== false}
                            onCheckedChange={(checked) => handleSettingChange('skipLinks', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Screen Reader */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Accessibility className="h-5 w-5" />
                        Screen Reader
                    </CardTitle>
                    <CardDescription>
                        Optimize for screen reader compatibility
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Screen Reader Support</Label>
                            <p className="text-xs text-muted-foreground">
                                Optimize interface for screen readers
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.screenReaderSupport !== false}
                            onCheckedChange={(checked) => handleSettingChange('screenReaderSupport', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Announce Changes</Label>
                            <p className="text-xs text-muted-foreground">
                                Announce dynamic content changes
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.announceChanges !== false}
                            onCheckedChange={(checked) => handleSettingChange('announceChanges', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Detailed Descriptions</Label>
                            <p className="text-xs text-muted-foreground">
                                Provide detailed descriptions for images and media
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.detailedDescriptions !== false}
                            onCheckedChange={(checked) => handleSettingChange('detailedDescriptions', checked)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Speech Rate</Label>
                        <div className="px-2">
                            <Slider
                                value={[localSettings.speechRate || 100]}
                                onValueChange={(value) => handleSettingChange('speechRate', value[0])}
                                max={200}
                                min={50}
                                step={10}
                                className="w-full"
                            />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Slower</span>
                            <span>Normal</span>
                            <span>Faster</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default AccessibilitySettings
