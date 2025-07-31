import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { fetchChatMessages, setTypingUsers, markMessageAsSeen, deleteChat } from '@/store/slices/chatSlice'
import { useUnderDevelopment } from '@/hooks/useUnderDevelopment'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import { Phone, Video, MoreVertical, ArrowLeft, Users, Trash2 } from 'lucide-react'
import socketService from '@/services/socketService'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const ChatWindow = ({ onBack }) => {
    const dispatch = useDispatch()
    const { showUnderDevelopmentMessage } = useUnderDevelopment()
    const {
        activeChat,
        chats,
        messages,
        typingUsers,
        loading,
        pagination // []
    } = useSelector(state => state.chats)
    const { user } = useSelector(state => state.auth)

    const [loadingMore, setLoadingMore] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const messagesEndRef = useRef(null)
    const messagesContainerRef = useRef(null)
    const lastMessageRef = useRef(null)

    const currentChat = chats.find(chat => chat._id === activeChat)
    const currentMessages = useMemo(() => messages[activeChat] || [], [messages, activeChat])
    const currentTypingUsers = useMemo(() => typingUsers[activeChat] || [], [typingUsers, activeChat])

    // // Debug logging for typing users
    // useEffect(() => {
    //     console.log('=== TYPING USERS STATE UPDATE ===')
    //     console.log('Full typingUsers state:', typingUsers)
    //     console.log('activeChat:', activeChat)
    //     console.log('currentTypingUsers for this chat:', currentTypingUsers)
    //     console.log('currentTypingUsers length:', currentTypingUsers.length)
    //     if (currentTypingUsers.length > 0) {
    //         console.log('First typing user:', currentTypingUsers[0])
    //     }
    //     console.log('current user from auth:', {
    //         _id: user._id,
    //         id: user.id,
    //         username: user.username,
    //         firstName: user.firstName
    //     })
    //     console.log('===========================')
    // }, [currentTypingUsers, user, typingUsers, activeChat])

    useEffect(() => {
        if (activeChat) {
            dispatch(fetchChatMessages({ roomId: activeChat }))
        }
    }, [activeChat, dispatch])

    useEffect(() => {

        const handleUserTyping = (data) => {
            // console.log('--- TYPING EVENT ---')
            // console.log('Typing user:', data.user.firstName, 'ID:', data.user.id)
            // console.log('Current user:', user.firstName, 'ID:', user._id || user.id)
            // console.log('Is typing:', data.isTyping)
            // console.log('Active chat:', activeChat)

            // Get the current user's ID - could be _id or id
            const currentUserId = user._id || user.id

            // Don't show typing indicator for current user
            if (data.user.id === currentUserId) {
                console.log('❌ Filtering out current user typing event')
                return
            }

            // console.log('✅ Dispatching typing event for:', data.user.firstName)
            dispatch(setTypingUsers({
                roomId: activeChat,
                user: data.user,
                isTyping: data.isTyping
            }))
        }

        const handleMessageSeen = (data) => {
            dispatch(markMessageAsSeen({
                messageId: data.messageId,
                userId: data.user._id || data.user.id
            }))
        }

        socketService.on('userTyping', handleUserTyping)
        socketService.on('messageSeen', handleMessageSeen)

        console.log('Active Chat last message:', activeChat?.lastMessage);


        return () => {
            socketService.off('userTyping', handleUserTyping)
            socketService.off('messageSeen', handleMessageSeen)
        }
    }, [activeChat, dispatch, user])

    useEffect(() => {
        // Scroll to bottom on new messages
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [currentMessages])

    useEffect(() => {
        // Mark messages as seen when they come into view
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const messageId = entry.target.dataset.messageId
                        if (messageId) {
                            socketService.markAsSeen(messageId)
                            dispatch(markMessageAsSeen({ messageId, userId: user._id || user.id }))
                        }
                    }
                })
            },
            { threshold: 0.5 }
        )

        // Observe all message elements
        const messageElements = document.querySelectorAll('[data-message-id]')
        messageElements.forEach(el => observer.observe(el))

        return () => observer.disconnect()
    }, [currentMessages, dispatch, user._id, user.id])

    const handleLoadMore = async () => {
        if (loadingMore || !pagination[activeChat]?.hasMore) return

        setLoadingMore(true)
        try {
            await dispatch(fetchChatMessages({
                roomId: activeChat,
                page: pagination[activeChat].currentPage + 1
            }))
        } finally {
            setLoadingMore(false)
        }
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

    const getOnlineStatus = (chat) => {
        if (chat.isGroup) {
            return `${chat.participants.length} members`
        }
        else {
            const otherUser = getOtherParticipant(chat)
            return otherUser.isOnline ? 'Online' : 'Offline';
        }
    }

    const groupMessagesByDate = (messages) => {
        const grouped = {}

        messages.forEach(message => {
            const date = new Date(message.createdAt).toDateString()
            if (!grouped[date]) {
                grouped[date] = []
            }
            grouped[date].push(message)
        })

        return grouped
    }

    const handleDeleteChat = async () => {
        try {
            await dispatch(deleteChat(activeChat)).unwrap()
            onBack()
        } catch (error) {
            console.error('Failed to delete chat:', error)
        }
    }

    const handleVoiceCall = () => {
        showUnderDevelopmentMessage('Voice calling')
    }

    const handleVideoCall = () => {
        showUnderDevelopmentMessage('Video calling')
    }

    if (!activeChat) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="text-lg font-medium text-gray-600 mb-2">
                        Select a chat to start messaging
                    </div>
                    <div className="text-sm text-gray-500">
                        Choose from your existing conversations or start a new one
                    </div>
                </div>
            </div>
        )
    }

    if (!currentChat) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-lg font-medium text-gray-600">
                        Chat not found
                    </div>
                </div>
            </div>
        )
    }

    const groupedMessages = groupMessagesByDate(currentMessages)

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b bg-white">
                <div className="flex items-center space-x-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onBack}
                        className="lg:hidden"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>

                    <div className="relative">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={getDisplayAvatar(currentChat)} />
                            <AvatarFallback>{getAvatarFallback(currentChat)}</AvatarFallback>
                        </Avatar>
                        {currentChat.isGroup && (
                            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                <Users className="h-2 w-2" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="font-medium">{getDisplayName(currentChat)}</div>
                        <div className="text-sm text-gray-500">{getOnlineStatus(currentChat)}</div>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={handleVoiceCall}>
                        <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleVideoCall}>
                        <Video className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={
                                (e) => {
                                    e.preventDefault();
                                    setShowDeleteConfirm(true);
                                }
                            }
                                className="text-red-600 focus:text-red-600">
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
                                    onClick={handleDeleteChat}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={messagesContainerRef}>
                {loading.messages && currentMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="text-gray-500">Loading messages...</div>
                    </div>
                ) : (
                    <>
                        {/* Load more button */}
                        {pagination[activeChat]?.hasMore && (
                            <div className="text-center mb-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                >
                                    {loadingMore ? 'Loading...' : 'Load more messages'}
                                </Button>
                            </div>
                        )}

                        {/* Messages grouped by date */}
                        {Object.entries(groupedMessages).map(([date, dayMessages]) => (
                            <div key={date}>
                                <div className="flex items-center justify-center my-4">
                                    <Badge variant="secondary" className="text-xs">
                                        {new Date(date).toLocaleDateString([], {
                                            month: 'short',
                                            day: 'numeric',
                                            year: new Date(date).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                                        })}
                                    </Badge>
                                </div>

                                {dayMessages.map((message, index) => {
                                    const isOwn = message.sender._id === user._id || message.sender._id === user.id
                                    const showAvatar = !isOwn && (
                                        index === 0 ||
                                        dayMessages[index - 1].sender._id !== message.sender._id
                                    )

                                    return (
                                        <div
                                            key={message._id}
                                            data-message-id={message._id}
                                            ref={index === dayMessages.length - 1 ? lastMessageRef : null}
                                        >
                                            <MessageBubble
                                                message={message}
                                                isOwn={isOwn}
                                                showAvatar={showAvatar}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        ))}

                        {/* Typing indicators */}
                        {currentTypingUsers.length > 0 && (
                            <div className="flex items-center space-x-2 mb-4">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={currentTypingUsers[0].profilePicture} />
                                    <AvatarFallback className="text-xs">
                                        {currentTypingUsers[0].firstName?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-sm text-gray-500">
                                    {currentTypingUsers.length === 1
                                        ? `${currentTypingUsers[0].firstName} is typing...`
                                        : `${currentTypingUsers.length} people are typing...`
                                    }
                                </div>
                                {/* Debug info */}
                                {/* <div className="text-xs text-red-500">
                                    (Debug: {JSON.stringify(currentTypingUsers.map(u => ({ id: u.id, name: u.firstName })))})
                                </div> */}
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </>
                )}
            </ScrollArea>

            {/* Message Input */}
            <MessageInput roomId={activeChat} />
        </div>
    )
}

export default ChatWindow
