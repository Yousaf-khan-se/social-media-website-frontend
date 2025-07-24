import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from '@/hooks/use-toast'
import {
    UserX,
    Search,
    Trash2,
    AlertTriangle,
    Shield,
    Eye,
    EyeOff,
    MessageCircle
} from 'lucide-react'
import {
    fetchBlockedUsers,
    unblockUser,
    fetchBlockedKeywords,
    addBlockedKeyword,
    removeBlockedKeyword,
    updateContentSettings,
    clearBlockedError
} from '@/store/slices/settingsSlice'

const BlockedContent = () => {
    const dispatch = useDispatch()
    const { settings } = useSelector(state => state.settings)
    const {
        blockedUsers = [],
        blockedKeywords = [],
        isLoadingBlocked,
        blockedError
    } = useSelector(state => state.settings)
    const [newKeyword, setNewKeyword] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        dispatch(fetchBlockedUsers())
        dispatch(fetchBlockedKeywords())
    }, [dispatch])

    useEffect(() => {
        if (blockedError) {
            toast({
                title: "Error",
                description: blockedError,
                variant: "destructive"
            })
            dispatch(clearBlockedError())
        }
    }, [blockedError, dispatch])

    const handleUnblockUser = async (userId) => {
        setSaving(true)
        try {
            await dispatch(unblockUser(userId)).unwrap()
            toast({
                title: "Success",
                description: "User unblocked successfully"
            })
        } catch (error) {
            toast({
                title: "Error",
                description: error || "Failed to unblock user",
                variant: "destructive"
            })
        } finally {
            setSaving(false)
        }
    }

    const handleAddKeyword = async () => {
        if (!newKeyword.trim()) return

        setSaving(true)
        try {
            await dispatch(addBlockedKeyword(newKeyword.trim())).unwrap()
            setNewKeyword('')
            toast({
                title: "Success",
                description: "Keyword blocked successfully"
            })
        } catch (error) {
            toast({
                title: "Error",
                description: error || "Failed to block keyword",
                variant: "destructive"
            })
        } finally {
            setSaving(false)
        }
    }

    const handleRemoveKeyword = async (keyword) => {
        setSaving(true)
        try {
            await dispatch(removeBlockedKeyword(keyword)).unwrap()
            toast({
                title: "Success",
                description: "Keyword unblocked successfully"
            })
        } catch (error) {
            toast({
                title: "Error",
                description: error || "Failed to unblock keyword",
                variant: "destructive"
            })
        } finally {
            setSaving(false)
        }
    }

    const filteredUsers = (blockedUsers || []).filter(blockedUser =>
        blockedUser.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blockedUser.user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blockedUser.user.username.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const filteredKeywords = (blockedKeywords || []).filter(keywordItem =>
        keywordItem.keyword.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (isLoadingBlocked) {
        return (
            <div className="space-y-4">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search blocked users or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Blocked Users */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserX className="h-5 w-5" />
                        Blocked Users
                    </CardTitle>
                    <CardDescription>
                        Users you've blocked won't be able to see your posts or send you messages
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredUsers.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <UserX className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No blocked users found</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredUsers.map((blockedUser) => (
                                <div
                                    key={blockedUser.user._id}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={blockedUser.user.profilePicture} />
                                            <AvatarFallback>
                                                {`${blockedUser.user.firstName} ${blockedUser.user.lastName}`.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{`${blockedUser.user.firstName} ${blockedUser.user.lastName}`}</p>
                                            <p className="text-sm text-gray-500">@{blockedUser.user.username}</p>
                                            {blockedUser.reason && (
                                                <p className="text-xs text-red-500">Reason: {blockedUser.reason}</p>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleUnblockUser(blockedUser.user._id)}
                                        disabled={saving}
                                    >
                                        Unblock
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Blocked Keywords */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Blocked Keywords
                    </CardTitle>
                    <CardDescription>
                        Posts containing these keywords will be hidden from your feed
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Add New Keyword */}
                    <div className="flex gap-2">
                        <Input
                            placeholder="Add keyword to block..."
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                        />
                        <Button
                            onClick={handleAddKeyword}
                            disabled={!newKeyword.trim() || saving}
                        >
                            Add
                        </Button>
                    </div>

                    {/* Keywords List */}
                    {filteredKeywords.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No blocked keywords</p>
                            <p className="text-sm">Add keywords to filter your content</p>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {filteredKeywords.map((keywordItem) => (
                                <Badge
                                    key={keywordItem.keyword}
                                    variant="secondary"
                                    className="flex items-center gap-2 py-1 px-3"
                                >
                                    <span>{keywordItem.keyword}</span>
                                    <button
                                        onClick={() => handleRemoveKeyword(keywordItem.keyword)}
                                        disabled={saving}
                                        className="text-gray-500 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Content Visibility Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Content Visibility
                    </CardTitle>
                    <CardDescription>
                        Control what type of content you want to see
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="font-medium">Hide sensitive content</p>
                            <p className="text-sm text-gray-500">
                                Hide posts marked as sensitive
                            </p>
                        </div>
                        <Button
                            variant={settings?.content?.hideSensitiveContent ? "default" : "outline"}
                            size="sm"
                            onClick={() => dispatch(updateContentSettings({
                                hideSensitiveContent: !settings?.content?.hideSensitiveContent
                            }))}
                        >
                            {settings?.content?.hideSensitiveContent ? (
                                <>
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Hidden
                                </>
                            ) : (
                                <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Visible
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="font-medium">Filter explicit language</p>
                            <p className="text-sm text-gray-500">
                                Hide posts with strong language
                            </p>
                        </div>
                        <Button
                            variant={settings?.content?.filterExplicitLanguage ? "default" : "outline"}
                            size="sm"
                            onClick={() => dispatch(updateContentSettings({
                                filterExplicitLanguage: !settings?.content?.filterExplicitLanguage
                            }))}
                        >
                            {settings?.content?.filterExplicitLanguage ? (
                                <>
                                    <Shield className="h-4 w-4 mr-2" />
                                    Filtered
                                </>
                            ) : (
                                <>
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Allow All
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="font-medium">Require content warnings</p>
                            <p className="text-sm text-gray-500">
                                Only show warned content when you choose to
                            </p>
                        </div>
                        <Button
                            variant={settings?.content?.requireContentWarnings ? "default" : "outline"}
                            size="sm"
                            onClick={() => dispatch(updateContentSettings({
                                requireContentWarnings: !settings?.content?.requireContentWarnings
                            }))}
                        >
                            {settings?.content?.requireContentWarnings ? (
                                <>
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    Required
                                </>
                            ) : (
                                <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Optional
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Bulk Actions */}
            {((blockedUsers || []).length > 0 || (blockedKeywords || []).length > 0) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="h-5 w-5" />
                            Bulk Actions
                        </CardTitle>
                        <CardDescription>
                            Clear all blocked content at once
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {(blockedUsers || []).length > 0 && (
                            <Button
                                variant="destructive"
                                onClick={async () => {
                                    setSaving(true)
                                    try {
                                        for (const blockedUser of blockedUsers) {
                                            await dispatch(unblockUser(blockedUser.user._id)).unwrap()
                                        }
                                        toast({
                                            title: "Success",
                                            description: "All users unblocked"
                                        })
                                    } catch {
                                        toast({
                                            title: "Error",
                                            description: "Failed to unblock some users",
                                            variant: "destructive"
                                        })
                                    } finally {
                                        setSaving(false)
                                    }
                                }}
                                disabled={saving}
                                className="w-full"
                            >
                                Unblock All Users ({(blockedUsers || []).length})
                            </Button>
                        )}

                        {(blockedKeywords || []).length > 0 && (
                            <Button
                                variant="destructive"
                                onClick={async () => {
                                    setSaving(true)
                                    try {
                                        for (const keywordItem of blockedKeywords) {
                                            await dispatch(removeBlockedKeyword(keywordItem.keyword)).unwrap()
                                        }
                                        toast({
                                            title: "Success",
                                            description: "All keywords removed"
                                        })
                                    } catch {
                                        toast({
                                            title: "Error",
                                            description: "Failed to remove some keywords",
                                            variant: "destructive"
                                        })
                                    } finally {
                                        setSaving(false)
                                    }
                                }}
                                disabled={saving}
                                className="w-full"
                            >
                                Remove All Keywords ({(blockedKeywords || []).length})
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default BlockedContent
