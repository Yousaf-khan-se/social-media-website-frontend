import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../ui/alert-dialog'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { LogOut, Trash2, User } from 'lucide-react'
import { logout, deleteAccount } from '../../../store/slices/authSlice'
import { useToast } from '../../../hooks/use-toast'
// import { duration } from 'zod/v4/classic/iso.cjs'

const AccountSettings = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { toast } = useToast()
    const user = useSelector(state => state.auth.user)

    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [isDeletingAccount, setIsDeletingAccount] = useState(false)
    const [deleteConfirmText, setDeleteConfirmText] = useState('')

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true)
            await dispatch(logout()).unwrap()

            toast({
                title: "Logged out successfully",
                description: "You have been securely logged out.",
                duration: 5000
            })

            navigate('/login')
        } catch {
            toast({
                title: "Logout failed",
                description: "There was an error logging out. Please try again.",
                variant: "destructive",
                duration: 5000
            })
        } finally {
            setIsLoggingOut(false)
        }
    }

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') {
            toast({
                title: "Confirmation required",
                description: "Please type 'DELETE' to confirm account deletion.",
                variant: "destructive",
                duration: 5000
            })
            return
        }

        try {
            setIsDeletingAccount(true)

            // Call the deleteAccount thunk
            await dispatch(deleteAccount()).unwrap()

            toast({
                title: "Account deleted",
                description: "Your account has been permanently deleted.",
                duration: 5000
            })

            // Redirect to register page
            navigate('/register')
        } catch (error) {
            toast({
                title: "Delete account failed",
                description: error.error || "Failed to delete account. Please try again.",
                variant: "destructive",
                duration: 5000
            })
        } finally {
            setIsDeletingAccount(false)
            setDeleteConfirmText('')
        }
    }

    return (
        <div className="space-y-6">
            {/* Account Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Account Information
                    </CardTitle>
                    <CardDescription>
                        Basic information about your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Username</Label>
                        <div className="text-sm text-muted-foreground">
                            {user?.username || 'Not available'}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <div className="text-sm text-muted-foreground">
                            {user?.email || 'Not available'}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Member since</Label>
                        <div className="text-sm text-muted-foreground">
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Account Actions</CardTitle>
                    <CardDescription>
                        Manage your account settings and data
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Logout Button */}
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-base">Log out</Label>
                            <p className="text-sm text-muted-foreground">
                                Sign out of your account on this device
                            </p>
                        </div>
                        <Button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            {isLoggingOut ? 'Logging out...' : 'Log out'}
                        </Button>
                    </div>

                    {/* Delete Account */}
                    <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                            <Label className="text-base text-destructive">Delete account</Label>
                            <p className="text-sm text-muted-foreground">
                                Permanently delete your account and all data
                            </p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    className="flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete account
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Account</AlertDialogTitle>
                                    <AlertDialogDescription className="space-y-3">
                                        This action cannot be undone. This will permanently delete your account
                                        and remove all your data from our servers.
                                        <br />
                                        This includes:
                                        <ul className="list-disc list-inside space-y-1 text-sm">
                                            <li>Your profile and posts</li>
                                            <li>All your comments and interactions</li>
                                            <li>Your message history</li>
                                            <li>All account settings and preferences</li>
                                        </ul>
                                        <div className="mt-4">
                                            <Label htmlFor="delete-confirm">
                                                Type "DELETE" to confirm:
                                            </Label>
                                            <Input
                                                id="delete-confirm"
                                                value={deleteConfirmText}
                                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                                placeholder="Type DELETE here"
                                                className="mt-2"
                                            />
                                        </div>
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel
                                        onClick={() => setDeleteConfirmText('')}
                                    >
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDeleteAccount}
                                        disabled={isDeletingAccount || deleteConfirmText !== 'DELETE'}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default AccountSettings
