import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { fetchChats, clearError, updateOnlineUserStatus, fetchChatPermissionRequests, setActiveChat, addMessage, markMessageAsSeen, updateUnreadCount, setTypingUsers, clearTypingUsers } from '@/store/slices/chatSlice'
import { useAuth } from '@/hooks/useAuth'
import socketService from '@/services/socketService'
import ChatList from '@/components/features/messaging/ChatList'
import ChatWindow from '@/components/features/messaging/ChatWindow'
import NewChatDialog from '@/components/features/messaging/NewChatDialog'
import ChatPermissionRequestsDialog from '@/components/features/messaging/ChatPermissionRequestsDialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MessageCircle, Wifi, WifiOff } from 'lucide-react'

const Messaging = () => {

    const dispatch = useDispatch()
    const location = useLocation()
    const { user } = useAuth()
    const { chats, loading, error, activeChat } = useSelector(state => state.chats)
    const [showNewChat, setShowNewChat] = useState(false)
    const [showPermissionRequests, setShowPermissionRequests] = useState(false)
    const [isConnected, setIsConnected] = useState(false)
    const [showChatWindow, setShowChatWindow] = useState(false)

    // Use ref to maintain current activeChat value for socket listener
    const activeChatRef = useRef(activeChat)
    const typingTimeoutsRef = useRef(new Map()) // Track typing timeouts

    useEffect(
        () => {
            if (user) {
                console.log('User is authenticated, initializing messaging...')
                // Fetch chats
                dispatch(fetchChats())

                // Connect to socket
                const socket = socketService.connect()

                socket.on('connect', () => {
                    setIsConnected(true)
                    console.log('Connected to messaging server')
                })

                socket.on('disconnect', () => {
                    setIsConnected(false)
                    console.log('Disconnected from messaging server')
                })

                socket.on('error', (error) => {
                    console.error('Socket error:', error)
                })

                // Listen for online status events
                socket.on('userOnline', (data) => {
                    console.log('User came online:', data.user)
                    dispatch(updateOnlineUserStatus(data.user))
                })

                socket.on('userOffline', (data) => {
                    console.log('User went offline:', data.user)
                    dispatch(updateOnlineUserStatus(data.user))
                })

                return () => {
                    console.log('🧹 Cleaning up main socket listeners')
                    socket.off('connect')
                    socket.off('disconnect')
                    socket.off('error')
                    socket.off('userOnline')
                    socket.off('userOffline')
                    socketService.disconnect()
                }
            }
        }, [user, dispatch])

    useEffect(() => {
        console.log('🎯 Setting up typing event listeners...', { user: user?.firstName })
        const typingTimeouts = typingTimeoutsRef.current

        const handleUserTyping = (data) => {
            // Get the current user's ID - could be _id or id
            const currentUserId = user._id || user.id

            // Don't show typing indicator for current user
            if (data.user.id === currentUserId) {
                return
            }

            dispatch(setTypingUsers({
                roomId: data.roomId,
                userId: data.user.id, // Now we only send the ID
                isTyping: data.isTyping
            }))

            // If user started typing, set a timeout to automatically clear it
            if (data.isTyping) {
                const timeoutKey = `${data.roomId}-${data.user.id}`

                // Clear existing timeout
                if (typingTimeouts.has(timeoutKey)) {
                    clearTimeout(typingTimeouts.get(timeoutKey))
                }

                // Set new timeout to auto-clear typing after 3 seconds
                const timeoutId = setTimeout(() => {
                    dispatch(clearTypingUsers({
                        roomId: data.roomId,
                        userId: data.user.id
                    }))
                    typingTimeouts.delete(timeoutKey)
                }, 3000)

                typingTimeouts.set(timeoutKey, timeoutId)
            } else {
                // User stopped typing, clear the timeout
                const timeoutKey = `${data.roomId}-${data.user.id}`
                if (typingTimeouts.has(timeoutKey)) {
                    clearTimeout(typingTimeouts.get(timeoutKey))
                    typingTimeouts.delete(timeoutKey)
                }
            }
        }

        const handleMessageSeen = (data) => {
            dispatch(markMessageAsSeen({
                messageId: data.messageId,
                userId: data.user._id || data.user.id
            }))
        }

        // Wait for socket to be connected before setting up listeners
        const setupListeners = () => {
            if (socketService.isConnected()) {
                console.log('✅ Socket connected, setting up typing listeners')
                socketService.on('userTyping', handleUserTyping)
                socketService.on('messageSeen', handleMessageSeen)
            } else {
                console.log('⏳ Socket not connected, waiting...')
                setTimeout(setupListeners, 100)
            }
        }

        setupListeners()

        return () => {
            console.log('🧹 Cleaning up typing event listeners')
            socketService.off('userTyping', handleUserTyping)
            socketService.off('messageSeen', handleMessageSeen)

            // Clear all typing timeouts
            typingTimeouts.forEach(timeoutId => {
                clearTimeout(timeoutId)
            })
            typingTimeouts.clear()
        }
    }, [dispatch, user])

    // Separate effect to join rooms when chats are loaded and socket is connected
    useEffect(() => {
        if (chats.length > 0 && isConnected) {
            chats.forEach(chat => {
                socketService.joinRoom(chat._id)
            })
        }

        return () => {
            chats.forEach(chat => {
                socketService.leaveRoom(chat._id)
            })
        }
    }, [chats, isConnected])

    useEffect(() => {
        if (activeChat) {
            setShowChatWindow(true)
        }
    }, [activeChat])

    // Update the ref when activeChat changes
    useEffect(() => {
        const previousActiveChat = activeChatRef.current
        const typingTimeouts = typingTimeoutsRef.current

        activeChatRef.current = activeChat

        // Reset unread count when switching to a chat
        if (activeChat) {
            dispatch(updateUnreadCount({ roomId: activeChat, actionType: 'reset' }))
        }

        // Clear typing indicators for the previous chat when switching
        return () => {
            // Clear typing timeouts for the previous chat
            if (previousActiveChat) {
                const keysToDelete = []

                typingTimeouts.forEach((timeoutId, key) => {
                    if (key.startsWith(`${previousActiveChat}-`)) {
                        clearTimeout(timeoutId)
                        keysToDelete.push(key)
                    }
                })

                keysToDelete.forEach(key => typingTimeouts.delete(key))
            }
        }
    }, [activeChat, dispatch])

    useEffect(() => {
        if (!user) {
            console.log('🚀 No user, skipping socket setup')
            return
        }

        // Socket event listeners
        const handleReceiveMessage = (message) => {

            dispatch(addMessage(message))

            // Mark as seen if chat is active - use current value from ref
            if (activeChatRef.current === message.chatRoom) {
                socketService.markAsSeen(message._id)
                dispatch(markMessageAsSeen({ messageId: message._id, userId: user._id || user.id }))
            } else {
                // If message is for inactive chat and not sent by current user, increment unread count
                const isOwnMessage = message.sender._id === user._id || message.sender._id === user.id
                if (!isOwnMessage) {
                    dispatch(updateUnreadCount({ roomId: message.chatRoom, actionType: '++' }))
                }
            }
        }

        // Check if socket is connected, if not wait a bit
        const setupListener = () => {
            if (socketService.isConnected()) {
                socketService.on('receiveMessage', handleReceiveMessage)
            } else {
                console.log('🚀 Socket not connected yet, retrying in 100ms...')
                setTimeout(setupListener, 100)
            }
        }

        setupListener()

        return () => {
            socketService.off('receiveMessage', handleReceiveMessage)
        }
    }, [dispatch, user])

    // Handle URL parameters for direct navigation to permission requests
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search)
        if (urlParams.get('view') === 'requests') {
            setShowPermissionRequests(true)
            // Also ensure permission requests are fetched
            dispatch(fetchChatPermissionRequests('received'))
            dispatch(fetchChatPermissionRequests('sent'))
        }
    }, [location, dispatch])

    const handleBackToList = () => {
        setShowChatWindow(false)
        dispatch(setActiveChat(null));
    }

    const handleNewChat = () => {
        setShowNewChat(true)
    }

    const handleCloseNewChat = () => {
        setShowNewChat(false)
    }

    const handleShowPermissionRequests = () => {
        setShowPermissionRequests(true)
    }

    const handleClosePermissionRequests = () => {
        setShowPermissionRequests(false)
    }

    const clearErrorMessage = () => {
        dispatch(clearError())
    }

    if (loading.chats) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <div className="text-lg font-medium">Loading chats...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen bg-gray-50">
            {/* Connection Status */}
            <div className={`fixed top-[0.15rem] right-[0.15rem] z-50 p-[0.2rem] rounded-lg text-[0.5rem] font-medium ${isConnected
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
                }`}>
                <div className="flex items-center space-x-1">
                    {isConnected ? (
                        <Wifi className="h-2 w-2" />
                    ) : (
                        <WifiOff className="h-2 w-2" />
                    )}
                    <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="fixed top-16 right-4 z-50 bg-red-100 text-red-800 px-4 py-3 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-sm">{error.message || 'Something went wrong'}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearErrorMessage}
                            className="ml-2 h-6 w-6 p-0"
                        >
                            ×
                        </Button>
                    </div>
                </div>
            )}

            <div className="flex h-full">
                {/* Chat List - Desktop always visible, Mobile conditional */}
                <div className={`w-full lg:w-[25rem] bg-white border-r ${showChatWindow ? 'hidden lg:block' : 'block'
                    }`}>
                    <ChatList
                        onNewChat={handleNewChat}
                        onPermissionRequests={handleShowPermissionRequests}
                    />
                </div>

                {/* Chat Window - Desktop always visible, Mobile conditional */}
                <div
                    className={`flex-1 ${showChatWindow ? 'block' : 'hidden lg:block'}`}
                >
                    {
                        activeChat ?
                            (
                                <ChatWindow onBack={handleBackToList} />
                            )
                            :
                            (
                                <div className="flex items-center justify-center h-full bg-gray-50">
                                    <Card className="p-8 max-w-md text-center">
                                        <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                        <h2 className="text-xl font-semibold mb-2">Welcome to Messaging</h2>
                                        <p className="text-gray-600 mb-6">
                                            Select a conversation to start messaging, or create a new chat to connect with friends.
                                        </p>
                                        <div className="space-y-2">
                                            <Button onClick={handleNewChat} className="w-full">
                                                Start New Chat
                                            </Button>
                                            <div className="text-sm text-gray-500">
                                                {chats.length} chat{chats.length !== 1 ? 's' : ''} available
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            )}
                </div>
            </div>

            {/* New Chat Dialog */}
            <NewChatDialog
                isOpen={showNewChat}
                onClose={handleCloseNewChat}
            />

            {/* Chat Permission Requests Dialog */}
            <ChatPermissionRequestsDialog
                isOpen={showPermissionRequests}
                onClose={handleClosePermissionRequests}
            />
        </div>
    )
}

export default Messaging
