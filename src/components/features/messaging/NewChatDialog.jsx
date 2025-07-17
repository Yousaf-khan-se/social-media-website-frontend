import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { createChat } from '@/store/slices/chatSlice'
import { fetchAuthUserFollowers, fetchAuthUserFollowings, searchUsers } from '@/store/slices/profileListSlice'
import { Search, X, Users, MessageCircle } from 'lucide-react'

const NewChatDialog = ({ isOpen, onClose }) => {
    const dispatch = useDispatch()
    const { profiles } = useSelector(state => state.profileList)
    const { user } = useSelector(state => state.auth)
    const { loading } = useSelector(state => state.chats)

    const [searchQuery, setSearchQuery] = useState('')
    const [selectedUsers, setSelectedUsers] = useState([])
    const [groupName, setGroupName] = useState('')
    const [step, setStep] = useState(1) // 1: select users, 2: group details

    useEffect(() => {
        (async () => {
            if (isOpen) {
                // Fetch all the followers and followings if there is are no queries
                // dispatch(searchUsers({ query: '', limit: 50 }))
                await dispatch(fetchAuthUserFollowings({ query: '', limit: 50 })).unwrap()
                await dispatch(fetchAuthUserFollowers({ query: '', limit: 50 })).unwrap()
            }
        })();

    }, [isOpen, dispatch])

    const filteredProfiles = profiles.filter(profile => {
        const query = searchQuery.toLowerCase()
        const fullName = `${profile.firstName} ${profile.lastName}`.toLowerCase()
        return (
            profile._id !== user.id &&
            (profile.username.toLowerCase().includes(query) ||
                fullName.includes(query) ||
                profile.email.toLowerCase().includes(query))
        )
    })

    const handleUserSelect = (profile) => {
        setSelectedUsers(prev => {
            const isSelected = prev.find(u => u._id === profile._id)
            if (isSelected) {
                return prev.filter(u => u._id !== profile._id)
            } else {
                return [...prev, profile]
            }
        })
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
                isGroup: false
            })).unwrap()
            handleClose()
        } catch (error) {
            console.error('Failed to create chat:', error)
        }
    }

    const createGroupChat = async () => {
        if (!groupName.trim()) {
            alert('Please enter a group name')
            return
        }

        try {
            await dispatch(createChat({
                participants: selectedUsers.map(u => u._id),
                isGroup: true,
                name: groupName.trim()
            })).unwrap()
            handleClose()
        } catch (error) {
            console.error('Failed to create group chat:', error)
        }
    }

    const handleClose = () => {
        setSearchQuery('')
        setSelectedUsers([])
        setGroupName('')
        setStep(1)
        onClose()
    }

    const handleBack = () => {
        setStep(1)
        setGroupName('')
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
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
                        <div className="p-4 border-b">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search people..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Selected Users */}
                        {selectedUsers.length > 0 && (
                            <div className="p-4 border-b">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="text-sm font-medium">Selected:</span>
                                    <Badge variant="secondary">
                                        {selectedUsers.length} {selectedUsers.length === 1 ? 'person' : 'people'}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedUsers.map(user => (
                                        <div
                                            key={user._id}
                                            className="flex items-center space-x-2 bg-blue-100 rounded-full px-3 py-1"
                                        >
                                            <Avatar className="h-5 w-5">
                                                <AvatarImage src={user.profilePicture} />
                                                <AvatarFallback className="text-xs">
                                                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">{user.firstName}</span>
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

                        {/* User List */}
                        <ScrollArea className="flex-1">
                            <div className="p-4">
                                {filteredProfiles.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        {searchQuery ? 'No users found' : 'No users available'}
                                    </div>
                                ) : (
                                    filteredProfiles.map(profile => (
                                        <div
                                            key={profile._id}
                                            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${selectedUsers.find(u => u._id === profile._id) ? 'bg-blue-50' : ''
                                                }`}
                                            onClick={() => handleUserSelect(profile)}
                                        >
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={profile.profilePicture} />
                                                <AvatarFallback>
                                                    {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="font-medium">
                                                    {profile.firstName} {profile.lastName}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    @{profile.username}
                                                </div>
                                            </div>
                                            {selectedUsers.find(u => u._id === profile._id) && (
                                                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-white rounded-full" />
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>

                        {/* Footer */}
                        <div className="p-4 border-t">
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
                        <div className="p-4">
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
                                        {selectedUsers.map(user => (
                                            <div key={user._id} className="flex items-center space-x-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={user.profilePicture} />
                                                    <AvatarFallback className="text-xs">
                                                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="font-medium text-sm">
                                                        {user.firstName} {user.lastName}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        @{user.username}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t">
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
