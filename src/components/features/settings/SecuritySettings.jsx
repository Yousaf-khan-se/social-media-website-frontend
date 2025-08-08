import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import {
    Shield,
    Key,
    Smartphone,
    Eye,
    EyeOff,
    Clock,
    UserX,
    AlertTriangle,
    CheckCircle,
    X
} from 'lucide-react'
import {
    updateSecuritySettings,
    changePassword,
    logoutAllDevices,
    clearSecurityError
} from '@/store/slices/settingsSlice'

const SecuritySettings = () => {
    const dispatch = useDispatch()
    const { settings } = useSelector(state => state.settings)
    const {
        isChangingPassword,
        isLoggingOutAll,
        securityError
    } = useSelector(state => state.settings)
    const [localSettings, setLocalSettings] = useState(settings)
    const [saving, setSaving] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    useEffect(() => {
        if (securityError) {
            toast({
                title: "Error",
                description: securityError.message || securityError.error || "A security error occurred",
                variant: "destructive",
                duration: 5000,
                icon: <X className="h-4 w-4" />
            })
            dispatch(clearSecurityError())
        }
    }, [securityError, dispatch])

    const handleSettingChange = async (key, value) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }))
        setSaving(true)
        try {
            await dispatch(updateSecuritySettings({ [key]: value })).unwrap()
        } catch (error) {
            console.error('Failed to update security settings:', error)
        } finally {
            setSaving(false)
        }
    }

    const handlePasswordChange = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast({
                title: "Error",
                description: "New passwords don't match",
                variant: "destructive",
                duration: 5000,
                icon: <X className="h-4 w-4" />
            })
            return
        }

        if (passwordForm.newPassword.length < 8) {
            toast({
                title: "Error",
                description: "Password must be at least 8 characters long",
                variant: "destructive",
                duration: 5000,
                icon: <X className="h-4 w-4" />
            })
            return
        }

        try {
            await dispatch(changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            })).unwrap()

            toast({
                title: "Success",
                description: "Password changed successfully",
                duration: 5000,
                icon: <CheckCircle className="h-4 w-4" />,
                variant: 'success'
            })
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            })
        } catch {
            // Error is handled by the useEffect
        }
    }

    const handleLogoutAllDevices = async () => {
        try {
            await dispatch(logoutAllDevices()).unwrap()
            toast({
                title: "Success",
                description: "Logged out from all devices",
                duration: 5000,
                icon: <CheckCircle className="h-4 w-4" />,
                variant: 'success'
            })
        } catch {
            // Error is handled by the useEffect
        }
    }

    return (
        <div className="space-y-6">
            {saving && (
                <div className="text-center">
                    <Badge variant="secondary">Saving...</Badge>
                </div>
            )}

            {/* Password Security */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        Password Security
                    </CardTitle>
                    <CardDescription>
                        Change your password and manage security settings
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <div className="relative">
                                <Input
                                    id="current-password"
                                    type={showCurrentPassword ? "text" : "password"}
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm(prev => ({
                                        ...prev,
                                        currentPassword: e.target.value
                                    }))}
                                    placeholder="Enter current password"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                    {showCurrentPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="new-password"
                                    type={showNewPassword ? "text" : "password"}
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm(prev => ({
                                        ...prev,
                                        newPassword: e.target.value
                                    }))}
                                    placeholder="Enter new password"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm(prev => ({
                                    ...prev,
                                    confirmPassword: e.target.value
                                }))}
                                placeholder="Confirm new password"
                            />
                        </div>

                        <Button
                            onClick={handlePasswordChange}
                            disabled={isChangingPassword || !passwordForm.currentPassword || !passwordForm.newPassword}
                            className="w-full"
                        >
                            {isChangingPassword ? "Changing Password..." : "Change Password"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Two-Factor Authentication */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Two-Factor Authentication
                    </CardTitle>
                    <CardDescription>
                        Add an extra layer of security to your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Enable 2FA</Label>
                            <p className="text-xs text-muted-foreground">
                                Require a verification code when logging in
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.twoFactorAuth === true}
                            onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                        />
                    </div>

                    {localSettings.twoFactorAuth && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-green-800">
                                    Two-factor authentication is enabled
                                </span>
                            </div>
                            <p className="text-xs text-green-700 mt-1">
                                Your account is protected with 2FA
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Login Alerts */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Login Alerts
                    </CardTitle>
                    <CardDescription>
                        Get notified of suspicious login activity
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Email Login Alerts</Label>
                            <p className="text-xs text-muted-foreground">
                                Get email alerts for new device logins
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.loginAlerts !== false}
                            onCheckedChange={(checked) => handleSettingChange('loginAlerts', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Suspicious Activity Alerts</Label>
                            <p className="text-xs text-muted-foreground">
                                Get notified of unusual account activity
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.suspiciousActivityAlerts !== false}
                            onCheckedChange={(checked) => handleSettingChange('suspiciousActivityAlerts', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Session Management */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5" />
                        Session Management
                    </CardTitle>
                    <CardDescription>
                        Manage your active sessions and devices
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Auto-logout Inactive Sessions</Label>
                            <p className="text-xs text-muted-foreground">
                                Automatically logout after 30 days of inactivity
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.autoLogout !== false}
                            onCheckedChange={(checked) => handleSettingChange('autoLogout', checked)}
                        />
                    </div>

                    <div className="pt-2 border-t">
                        <Button
                            variant="outline"
                            onClick={handleLogoutAllDevices}
                            disabled={isLoggingOutAll}
                            className="w-full"
                        >
                            <UserX className="h-4 w-4 mr-2" />
                            {isLoggingOutAll ? "Logging Out..." : "Logout All Other Devices"}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                            This will sign you out of all devices except this one
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Account Recovery */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Account Recovery
                    </CardTitle>
                    <CardDescription>
                        Options for recovering your account if locked out
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Recovery Email</Label>
                            <p className="text-xs text-muted-foreground">
                                Use email for account recovery
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.recoveryEmail !== false}
                            onCheckedChange={(checked) => handleSettingChange('recoveryEmail', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Security Questions</Label>
                            <p className="text-xs text-muted-foreground">
                                Enable security questions for recovery
                            </p>
                        </div>
                        <Switch
                            checked={localSettings.securityQuestions === true}
                            onCheckedChange={(checked) => handleSettingChange('securityQuestions', checked)}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default SecuritySettings
