import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { setActiveChat, setSearchQuery, deleteChat } from '@/store/slices/chatSlice'
import { Search, Users, MessageCircle, Plus, MoreVertical, Trash2, Settings } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const ChatList = ({ onNewChat, onPermissionRequests }) => {

    const dispatch = useDispatch()
    const { filteredChats, searchQuery, activeChat, unreadCounts } = useSelector(state => state.chats)
    const { user } = useSelector(state => state.auth)
    const [activeTab, setActiveTab] = useState('all')
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [filteredByTab, setFilteredByTab] = useState(filteredChats.filter(chat => {
        if (activeTab === 'all') return true
        if (activeTab === 'direct') return !chat.isGroup
        if (activeTab === 'groups') return chat.isGroup
        return true
    }))

    useEffect(() => {
        setFilteredByTab(
            filteredChats.filter(chat => {
                if (activeTab === 'all') return true
                if (activeTab === 'direct') return !chat.isGroup
                if (activeTab === 'groups') return chat.isGroup
                return true
            })
        )

    }, [filteredChats, activeTab])


    const handleChatSelect = (chat) => {
        dispatch(setActiveChat(chat._id))
    }

    const handleSearchChange = (e) => {
        dispatch(setSearchQuery(e.target.value))
    }

    const handleDeleteChat = async (chatId, e) => {
        e.stopPropagation()
        try {
            await dispatch(deleteChat(chatId)).unwrap()
        } catch (error) {
            console.error('Failed to delete chat:', error)
        }
    }

    const formatLastMessage = (message) => {

        if (!message) return 'No messages yet'

        if (message.messageType === 'text') {
            return message.content
        } else if (message.messageType === 'image') {
            return '📷 Image'
        } else if (message.messageType === 'video') {
            return '🎥 Video'
        } else if (message.messageType === 'file') {
            return '📄 File'
        }
        return message.content
    }

    const formatTime = (timestamp) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diff = now - date

        if (diff < 60000) return 'now'
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`

        return date.toLocaleDateString()
    }

    const getOtherParticipant = (chat) => {
        if (chat.isGroup) return null
        return chat.participants.find(p => p._id !== user._id && p._id !== user.id)
    }

    const getDisplayName = (chat) => {
        if (chat.isGroup) {
            return chat.name || 'Group Chat'
        }
        const otherUser = getOtherParticipant(chat)
        return otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown User'
    }

    const getDisplayAvatar = (chat) => {
        if (chat.isGroup) {
            return chat.avatar || null
        }
        const otherUser = getOtherParticipant(chat)
        return otherUser?.profilePicture || null
    }

    const getAvatarFallback = (chat) => {
        if (chat.isGroup) {
            return chat.name?.charAt(0)?.toUpperCase() || 'G'
        }
        const otherUser = getOtherParticipant(chat)
        return otherUser ? `${otherUser.firstName?.charAt(0)}${otherUser.lastName?.charAt(0)}` : 'U'
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Chats</h2>
                    <div className="flex space-x-2">
                        {onPermissionRequests && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={onPermissionRequests}
                                className="h-8 w-8 p-0"
                                title="Permission Requests"
                            >
                                <Settings className="h-4 w-4" />
                            </Button>
                        )}
                        <Button
                            size="sm"
                            onClick={onNewChat}
                            className="h-8 w-8 p-0"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search chats..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="pl-10"
                    />
                </div>

                {/* Tabs */}
                <div className="flex mt-4 space-x-1">
                    <Button
                        variant={activeTab === 'all' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('all')}
                        className="flex-1"
                    >
                        All
                    </Button>
                    <Button
                        variant={activeTab === 'direct' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('direct')}
                        className="flex-1"
                    >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Direct
                    </Button>
                    <Button
                        variant={activeTab === 'groups' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('groups')}
                        className="flex-1"
                    >
                        <Users className="h-4 w-4 mr-1" />
                        Groups
                    </Button>
                </div>
            </div>

            {/* Chat List */}
            <ScrollArea className="flex-1">
                <div className="p-2">
                    {filteredByTab.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            {searchQuery ? 'No chats found' : 'No chats yet'}
                        </div>
                    ) : (
                        filteredByTab.map((chat) => (
                            <Card
                                key={chat._id}
                                className={`mb-2 cursor-pointer transition-colors hover:bg-gray-50 group ${activeChat === chat._id ? 'bg-blue-50 border-blue-200' : ''
                                    }`}
                                onClick={() => handleChatSelect(chat)}
                            >
                                <div className="p-3">
                                    <div className="flex items-start space-x-3">
                                        <div className="relative">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={getDisplayAvatar(chat)} />
                                                <AvatarFallback>{getAvatarFallback(chat)}</AvatarFallback>
                                            </Avatar>
                                            {unreadCounts[chat._id] > 0 && (
                                                <Badge className="absolute -bottom-1 -right-1 rounded-full">
                                                    {unreadCounts[chat._id]}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-medium text-sm truncate">
                                                    {getDisplayName(chat)}
                                                </h3>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xs text-gray-500">
                                                        {formatTime(chat.updatedAt)}
                                                    </span>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <MoreVertical className="h-3 w-3" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={
                                                                    (e) => {
                                                                        e.preventDefault();
                                                                        setShowDeleteConfirm(true);
                                                                    }
                                                                }
                                                                className="text-red-600 focus:text-red-600"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Delete Chat
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>

                                                    {/* Delete Confirmation Dialog */}
                                                    <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Chat</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete this chat? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={
                                                                        (e) => {
                                                                            handleDeleteChat(chat._id, e);
                                                                        }
                                                                    }
                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>

                                            <p className="text-sm text-gray-600 truncate mt-1 max-w-72">
                                                {chat.lastMessage?.sender?._id === user._id || chat.lastMessage?.sender?._id === user.id ? 'You: ' : ''}
                                                {formatLastMessage(chat.lastMessage)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}

export default ChatList
