import React, { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { createChat, clearLastPermissionRequestResult } from '@/store/slices/chatSlice'
import { fetchAuthUserFollowers, fetchAuthUserFollowings, searchUsers, clearProfiles } from '@/store/slices/profileListSlice'
import { Search, X, Users, MessageCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const NewChatDialog = ({ isOpen, onClose }) => {
    const dispatch = useDispatch()
    const { toast } = useToast()
    const {
        followersProfiles = [],
        followingProfiles = [],
        otherProfiles = [],
        loadingStates = {}
    } = useSelector(state => state.profileList || {})
    const { user } = useSelector(state => state.auth || {})
    const { loading = {}, lastPermissionRequestResult } = useSelector(state => state.chats || {})

    const [searchQuery, setSearchQuery] = useState('')
    const [selectedUsers, setSelectedUsers] = useState([])
    const [groupName, setGroupName] = useState('')
    const [chatMessage, setChatMessage] = useState('') // For permission requests
    const [step, setStep] = useState(1) // 1: select users, 2: group details

    // Filter followers and following based on search query
    const filteredFollowers = (followersProfiles || []).filter(profile => {
        try {
            if (!searchQuery) return true
            const query = searchQuery.toLowerCase()
            const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.toLowerCase()
            return (
                profile._id !== user?.id &&
                (profile.username?.toLowerCase().includes(query) ||
                    fullName.includes(query) ||
                    profile.email?.toLowerCase().includes(query))
            )
        } catch (error) {
            console.error('Error filtering followers:', error)
            return false
        }
    })

    const filteredFollowing = (followingProfiles || []).filter(profile => {
        try {
            if (!searchQuery) return true
            const query = searchQuery.toLowerCase()
            const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.toLowerCase()
            return (
                profile._id !== user?.id &&
                (profile.username?.toLowerCase().includes(query) ||
                    fullName.includes(query) ||
                    profile.email?.toLowerCase().includes(query))
            )
        } catch (error) {
            console.error('Error filtering following:', error)
            return false
        }
    })

    const filteredOtherProfiles = (otherProfiles || []).filter(profile => {
        try {
            return profile._id !== user?.id
        } catch (error) {
            console.error('Error filtering other profiles:', error)
            return false
        }
    })

    const handleClose = useCallback(() => {
        setSearchQuery('')
        setSelectedUsers([])
        setGroupName('')
        setChatMessage('')
        setStep(1)
        dispatch(clearProfiles()) // Clear search results
        dispatch(clearLastPermissionRequestResult()) // Clear any pending results
        onClose()
    }, [dispatch, onClose])

    useEffect(() => {
        if (isOpen && user) {
            try {
                // Fetch followers and followings when dialog opens
                dispatch(fetchAuthUserFollowings({ query: '', limit: 50 }))
                dispatch(fetchAuthUserFollowers({ query: '', limit: 50 }))

                // Clear search results initially
                dispatch(clearProfiles())
            } catch (error) {
                console.error('Error initializing NewChatDialog:', error)
            }
        }
    }, [isOpen, dispatch, user])

    // Handle search query changes
    useEffect(() => {
        if (searchQuery.trim() && isOpen && user) {
            try {
                // Debounce search to avoid too many API calls
                const timeoutId = setTimeout(() => {
                    dispatch(searchUsers({ query: searchQuery.trim(), page: 1, limit: 20 }))
                }, 300)

                return () => clearTimeout(timeoutId)
            } catch (error) {
                console.error('Error in search useEffect:', error)
            }
        } else if (!searchQuery.trim()) {
            try {
                // Clear search results when query is empty
                dispatch(clearProfiles())
            } catch (error) {
                console.error('Error clearing profiles:', error)
            }
        }
    }, [searchQuery, dispatch, isOpen, user])

    // Handle permission request results
    useEffect(() => {
        if (lastPermissionRequestResult) {
            switch (lastPermissionRequestResult.type) {
                case 'permission_request':
                    toast({
                        title: "Permission Request Sent",
                        description: lastPermissionRequestResult.message || "The user will be notified of your chat request.",
                    })
                    // Close dialog after sending permission request
                    handleClose()
                    break
                case 'chat_created':
                    toast({
                        title: "Chat Created",
                        description: "You can now start messaging!",
                    })
                    // Navigate to chat or close dialog
                    handleClose()
                    break
                case 'error':
                    if (lastPermissionRequestResult.error?.error?.includes('does not accept messages')) {
                        toast({
                            title: "Cannot Send Message",
                            description: "This user doesn't accept messages from anyone.",
                            variant: "destructive"
                        })
                    } else {
                        toast({
                            title: "Error",
                            description: lastPermissionRequestResult.error?.error || "Failed to create chat",
                            variant: "destructive"
                        })
                    }
                    break
            }
            // Clear the result after handling
            dispatch(clearLastPermissionRequestResult())
        }
    }, [lastPermissionRequestResult, dispatch, toast, handleClose])

    // Utility function to render user profile item
    const renderUserProfile = (profile) => {
        if (!profile || !profile._id) {
            return null
        }

        try {
            return (
                <div
                    key={profile._id}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${selectedUsers.find(u => u._id === profile._id) ? 'bg-blue-50' : ''
                        }`}
                    onClick={() => handleUserSelect(profile)}
                >
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={profile.profilePicture} />
                        <AvatarFallback>
                            {profile.firstName?.charAt(0) || ''}{profile.lastName?.charAt(0) || ''}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="font-medium">
                            {profile.firstName || ''} {profile.lastName || ''}
                        </div>
                        <div className="text-sm text-gray-500">
                            @{profile.username || ''}
                        </div>
                    </div>
                    {selectedUsers.find(u => u._id === profile._id) && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                    )}
                </div>
            )
        } catch (error) {
            console.error('Error rendering user profile:', error, profile)
            return null
        }
    }

    const handleUserSelect = (profile) => {
        if (!profile || !profile._id) {
            console.error('Invalid profile passed to handleUserSelect:', profile)
            return
        }

        try {
            setSelectedUsers(prev => {
                const isSelected = prev.find(u => u._id === profile._id)
                if (isSelected) {
                    return prev.filter(u => u._id !== profile._id)
                } else {
                    return [...prev, profile]
                }
            })
        } catch (error) {
            console.error('Error in handleUserSelect:', error)
        }
    }

    const handleNext = () => {
        if (selectedUsers.length === 1) {
            // Direct chat
            createDirectChat()
        } else if (selectedUsers.length > 1) {
            // Group chat
            setStep(2)
        }
    }

    const createDirectChat = async () => {
        try {
            await dispatch(createChat({
                participants: [selectedUsers[0]._id],
                isGroup: false,
                message: chatMessage.trim() || undefined
            })).unwrap()
            // Result will be handled by the useEffect
        } catch (error) {
            console.error('Failed to create chat:', error)
        }
    }

    const createGroupChat = async () => {
        if (!groupName.trim()) {
            toast({
                title: "Group Name Required",
                description: "Please enter a group name.",
                variant: "destructive"
            })
            return
        }

        try {
            await dispatch(createChat({
                participants: selectedUsers.map(u => u._id),
                isGroup: true,
                name: groupName.trim(),
                message: chatMessage.trim() || undefined
            })).unwrap()
            // Result will be handled by the useEffect
        } catch (error) {
            console.error('Failed to create group chat:', error)
        }
    }

    const handleBack = () => {
        setStep(1)
        setGroupName('')
    }

    if (!isOpen) return null

    // Safety check to prevent rendering with invalid state
    if (!user) {
        // NewChatDialog: No user found, not rendering
        return null
    }

    // Additional safety check for required state
    if (!Array.isArray(followersProfiles) || !Array.isArray(followingProfiles) || !Array.isArray(otherProfiles)) {
        // NewChatDialog: Invalid profiles state, not rendering
        return null
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-sm h-[85vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-2 border-b flex-shrink-0">
                    <h2 className="text-lg font-semibold">
                        {step === 1 ? 'New Chat' : 'Group Details'}
                    </h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {step === 1 && (
                    <>
                        {/* Search */}
                        <div className="p-2 border-b flex-shrink-0">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search people..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                                {searchQuery && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                            {searchQuery.trim() && (
                                <div className="text-xs text-gray-500 mt-2">
                                    Search in your followers, following, and other users
                                </div>
                            )}
                        </div>

                        {/* Selected Users */}
                        {selectedUsers.length > 0 && (
                            <div className="p-2 border-b flex-shrink-0">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="text-sm font-medium">Selected:</span>
                                    <Badge variant="secondary">
                                        {selectedUsers.length} {selectedUsers.length === 1 ? 'person' : 'people'}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedUsers.filter(user => user && user._id).map(user => (
                                        <div
                                            key={user._id}
                                            className="flex items-center space-x-2 bg-blue-100 rounded-full px-3 py-1"
                                        >
                                            <Avatar className="h-5 w-5">
                                                <AvatarImage src={user.profilePicture} />
                                                <AvatarFallback className="text-xs">
                                                    {user.firstName?.charAt(0) || ''}{user.lastName?.charAt(0) || ''}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">{user.firstName || ''}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleUserSelect(user)}
                                                className="h-4 w-4 p-0 hover:bg-blue-200"
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Optional Message */}
                        {selectedUsers.length > 0 && (
                            <div className="p-2 border-b flex-shrink-0">
                                <label className="block text-sm font-medium mb-2">
                                    Message (Optional)
                                </label>
                                <Input
                                    placeholder={selectedUsers.length === 1
                                        ? "Send a message with your chat request..."
                                        : "Add a message for the group..."
                                    }
                                    value={chatMessage}
                                    onChange={(e) => setChatMessage(e.target.value)}
                                    className="text-sm"
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                    {selectedUsers.length === 1
                                        ? "This message will be sent if permission is required"
                                        : "This message will be included with the group invitation"
                                    }
                                </div>
                            </div>
                        )}

                        {/* User List */}
                        <div className="flex-1 min-h-0">
                            <ScrollArea className="h-full">
                                <div className="p-2 space-y-6">
                                    {/* Search Results */}
                                    {searchQuery.trim() && (
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="font-medium text-sm text-gray-700">
                                                    Search Results
                                                </h3>
                                            </div>
                                            {filteredOtherProfiles.length === 0 ? (
                                                <div className="text-center py-4 text-gray-500 text-sm">
                                                    {loadingStates.search ? 'Searching...' : 'No users found'}
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                    {filteredOtherProfiles.filter(profile => profile && profile._id).map(profile => renderUserProfile(profile))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Followers Section */}
                                    {filteredFollowers.length > 0 && (
                                        <div>
                                            <h3 className="font-medium text-sm text-gray-700 mb-3">
                                                Followers ({filteredFollowers.length})
                                            </h3>
                                            <div className="space-y-1">
                                                {filteredFollowers.filter(profile => profile && profile._id).map(profile => renderUserProfile(profile))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Following Section */}
                                    {filteredFollowing.length > 0 && (
                                        <div>
                                            <h3 className="font-medium text-sm text-gray-700 mb-3">
                                                Following ({filteredFollowing.length})
                                            </h3>
                                            <div className="space-y-1">
                                                {filteredFollowing.filter(profile => profile && profile._id).map(profile => renderUserProfile(profile))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Empty State */}
                                    {!searchQuery.trim() && filteredFollowers.length === 0 && filteredFollowing.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            {loadingStates.followers || loadingStates.following
                                                ? 'Loading your connections...'
                                                : 'No connections available'}
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Footer */}
                        <div className="p-2 border-t flex-shrink-0">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-500">
                                    {selectedUsers.length === 1 && (
                                        <div className="flex items-center space-x-1">
                                            <MessageCircle className="h-4 w-4" />
                                            <span>Direct Message</span>
                                        </div>
                                    )}
                                    {selectedUsers.length > 1 && (
                                        <div className="flex items-center space-x-1">
                                            <Users className="h-4 w-4" />
                                            <span>Group Chat</span>
                                        </div>
                                    )}
                                </div>
                                <Button
                                    onClick={handleNext}
                                    disabled={selectedUsers.length === 0 || loading.creating}
                                >
                                    {loading.creating ? 'Creating...' : 'Next'}
                                </Button>
                            </div>
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        {/* Group Details */}
                        <div className="flex-1 min-h-0 overflow-y-auto">
                            <div className="p-2">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Group Name
                                        </label>
                                        <Input
                                            placeholder="Enter group name..."
                                            value={groupName}
                                            onChange={(e) => setGroupName(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Members ({selectedUsers.length})
                                        </label>
                                        <div className="space-y-2">
                                            {selectedUsers.filter(user => user && user._id).map(user => (
                                                <div key={user._id} className="flex items-center space-x-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={user.profilePicture} />
                                                        <AvatarFallback className="text-xs">
                                                            {user.firstName?.charAt(0) || ''}{user.lastName?.charAt(0) || ''}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <div className="font-medium text-sm">
                                                            {user.firstName || ''} {user.lastName || ''}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            @{user.username || ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-2 border-t flex-shrink-0">
                            <div className="flex justify-between">
                                <Button
                                    variant="outline"
                                    onClick={handleBack}
                                    disabled={loading.creating}
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={createGroupChat}
                                    disabled={!groupName.trim() || loading.creating}
                                >
                                    {loading.creating ? 'Creating...' : 'Create Group'}
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </Card>
        </div>
    )
}

export default NewChatDialog
