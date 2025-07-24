import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Settings as SettingsIcon,
    Shield,
    Bell,
    MessageSquare,
    Eye,
    Palette,
    Globe,
    HelpCircle,
    Download,
    Upload,
    RotateCcw,
    ChevronLeft,
    ChevronDown,
    Menu
} from 'lucide-react'

import PrivacySettings from '@/components/features/settings/PrivacySettings'
import NotificationSettings from '@/components/features/settings/NotificationSettings'
import SecuritySettings from '@/components/features/settings/SecuritySettings'
import ChatSettings from '@/components/features/settings/ChatSettings'
import ContentSettings from '@/components/features/settings/ContentSettings'
import AccessibilitySettings from '@/components/features/settings/AccessibilitySettings'
import PreferencesSettings from '@/components/features/settings/PreferencesSettings'
import BlockedContent from '@/components/features/settings/BlockedContent'
import {
    fetchSettings,
    exportSettings,
    importSettings,
    resetSettings,
    clearError,
    clearExportError,
    clearImportError,
    clearUpdateError,
    clearResetError
} from '@/store/slices/settingsSlice'

const SETTINGS_SECTIONS = [
    {
        id: 'privacy',
        title: 'Privacy & Safety',
        description: 'Control who can see your content and interact with you',
        icon: Shield,
        component: PrivacySettings
    },
    {
        id: 'notifications',
        title: 'Notifications',
        description: 'Manage how and when you receive notifications',
        icon: Bell,
        component: NotificationSettings
    },
    {
        id: 'security',
        title: 'Security',
        description: 'Secure your account with two-factor authentication',
        icon: Shield,
        component: SecuritySettings
    },
    {
        id: 'chat',
        title: 'Chat & Messaging',
        description: 'Customize your messaging experience',
        icon: MessageSquare,
        component: ChatSettings
    },
    {
        id: 'content',
        title: 'Content & Display',
        description: 'Language, region, and content preferences',
        icon: Globe,
        component: ContentSettings
    },
    {
        id: 'accessibility',
        title: 'Accessibility',
        description: 'Make the app work better for you',
        icon: Eye,
        component: AccessibilitySettings
    },
    {
        id: 'preferences',
        title: 'App Preferences',
        description: 'Theme, sounds, and other app settings',
        icon: Palette,
        component: PreferencesSettings
    },
    {
        id: 'blocked',
        title: 'Blocked Content',
        description: 'Manage blocked users and keywords',
        icon: Shield,
        component: BlockedContent
    }
]

export const SettingsPage = () => {
    const dispatch = useDispatch()
    const {
        settings,
        isLoading,
        isExporting,
        isImporting,
        error,
        exportError,
        importError,
        updateError,
        resetError
    } = useSelector(state => state.settings)
    const [activeSection, setActiveSection] = useState('privacy')
    const { toast } = useToast()

    // Fetch all settings on mount
    useEffect(() => {
        dispatch(fetchSettings())
    }, [dispatch])

    // Handle errors with toast notifications
    useEffect(() => {
        if (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to load settings. Please try again.",
                variant: "destructive"
            })
            dispatch(clearError())
        }
    }, [error, toast, dispatch])

    useEffect(() => {
        if (exportError) {
            toast({
                title: "Export Failed",
                description: exportError.message || "Failed to export settings. Please try again.",
                variant: "destructive"
            })
            dispatch(clearExportError())
        }
    }, [exportError, toast, dispatch])

    useEffect(() => {
        if (importError) {
            toast({
                title: "Import Failed",
                description: importError.message || "Failed to import settings. Please check the file format.",
                variant: "destructive"
            })
            dispatch(clearImportError())
        }
    }, [importError, toast, dispatch])

    useEffect(() => {
        if (updateError) {
            toast({
                title: "Error",
                description: updateError.message || "Failed to update settings. Please try again.",
                variant: "destructive"
            })
            dispatch(clearUpdateError())
        }
    }, [updateError, toast, dispatch])

    useEffect(() => {
        if (resetError) {
            toast({
                title: "Reset Failed",
                description: resetError.message || "Failed to reset settings. Please try again.",
                variant: "destructive"
            })
            dispatch(clearResetError())
        }
    }, [resetError, toast, dispatch])

    const handleExportSettings = async () => {
        const result = await dispatch(exportSettings())
        if (exportSettings.fulfilled.match(result)) {
            toast({
                title: "Settings Exported",
                description: "Your settings have been downloaded as a backup file."
            })
        }
    }

    const handleImportSettings = async (file) => {
        const result = await dispatch(importSettings(file))
        if (importSettings.fulfilled.match(result)) {
            toast({
                title: "Settings Imported",
                description: "Your settings have been restored from the backup file."
            })
        }
    }

    const handleResetSection = async (section) => {
        const result = await dispatch(resetSettings(section))
        if (resetSettings.fulfilled.match(result)) {
            toast({
                title: "Settings Reset",
                description: `${section.charAt(0).toUpperCase() + section.slice(1)} settings have been reset to defaults.`
            })
        }
    }

    const handleResetAllSettings = async () => {
        const result = await dispatch(resetSettings())
        if (resetSettings.fulfilled.match(result)) {
            toast({
                title: "All Settings Reset",
                description: "All settings have been reset to their default values."
            })
        }
    }

    const currentSection = SETTINGS_SECTIONS.find(section => section.id === activeSection)
    const CurrentComponent = currentSection?.component

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <SettingsIcon className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading settings...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6 px-4">
            {/* Mobile Header with Dropdown Navigation */}
            <div className="lg:hidden mb-6">
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <SettingsIcon className="h-5 w-5" />
                                Settings
                            </CardTitle>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Menu className="h-4 w-4 mr-2" />
                                        {currentSection?.title}
                                        <ChevronDown className="h-4 w-4 ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-72">
                                    {SETTINGS_SECTIONS.map((section) => (
                                        <DropdownMenuItem
                                            key={section.id}
                                            onClick={() => setActiveSection(section.id)}
                                            className={`flex items-center gap-3 p-3 ${activeSection === section.id
                                                    ? 'bg-primary/10 text-primary'
                                                    : ''
                                                }`}
                                        >
                                            <section.icon className="h-4 w-4" />
                                            <div>
                                                <p className="font-medium">{section.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {section.description}
                                                </p>
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                    <Separator className="my-2" />
                                    <DropdownMenuItem onClick={handleExportSettings} disabled={isExporting}>
                                        <Download className="h-4 w-4 mr-2" />
                                        {isExporting ? 'Exporting...' : 'Export Settings'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <label className="flex items-center cursor-pointer">
                                            <Upload className="h-4 w-4 mr-2" />
                                            {isImporting ? 'Importing...' : 'Import Settings'}
                                            <input
                                                type="file"
                                                accept=".json"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files[0]
                                                    if (file) handleImportSettings(file)
                                                }}
                                            />
                                        </label>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleResetAllSettings}>
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Reset All
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardHeader>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Desktop Settings Navigation */}
                <div className="hidden lg:block lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <SettingsIcon className="h-5 w-5" />
                                Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <nav className="space-y-1">
                                {SETTINGS_SECTIONS.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted ${activeSection === section.id
                                            ? 'bg-primary/10 text-primary border-r-2 border-primary'
                                            : 'text-muted-foreground'
                                            }`}
                                    >
                                        <section.icon className="h-4 w-4" />
                                        <div>
                                            <p className="font-medium">{section.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {section.description}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </nav>

                            <Separator className="my-4" />

                            {/* Settings Management */}
                            <div className="p-4 space-y-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={handleExportSettings}
                                    disabled={isExporting}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    {isExporting ? 'Exporting...' : 'Export Settings'}
                                </Button>

                                <label>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        disabled={isImporting}
                                        asChild
                                    >
                                        <span>
                                            <Upload className="h-4 w-4 mr-2" />
                                            {isImporting ? 'Importing...' : 'Import Settings'}
                                        </span>
                                    </Button>
                                    <input
                                        type="file"
                                        accept=".json"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files[0]
                                            if (file) handleImportSettings(file)
                                        }}
                                    />
                                </label>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={handleResetAllSettings}
                                >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Reset All
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Settings Content */}
                <div className="col-span-1 lg:col-span-3">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <currentSection.icon className="h-5 w-5" />
                                        {currentSection.title}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {currentSection.description}
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleResetSection(activeSection)}
                                    className="hidden sm:flex"
                                >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Reset Section
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleResetSection(activeSection)}
                                    className="sm:hidden"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {settings && CurrentComponent ? (
                                <CurrentComponent />
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">Settings not available</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default SettingsPage
