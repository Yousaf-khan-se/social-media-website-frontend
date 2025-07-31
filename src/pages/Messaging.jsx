import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { fetchChats, clearError, updateOnlineUserStatus, fetchChatPermissionRequests, setActiveChat, addMessage, markMessageAsSeen } from '@/store/slices/chatSlice'
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
    console.log('🔄 Messaging component mounting/re-rendering...')

    const dispatch = useDispatch()
    const location = useLocation()
    const { user } = useAuth()
    const { chats, loading, error, activeChat } = useSelector(state => state.chats)
    const sss = useSelector(state => state)
    const [showNewChat, setShowNewChat] = useState(false)
    const [showPermissionRequests, setShowPermissionRequests] = useState(false)
    const [isConnected, setIsConnected] = useState(false)
    const [showChatWindow, setShowChatWindow] = useState(false)

    // Use ref to maintain current activeChat value for socket listener
    const activeChatRef = useRef(activeChat)

    console.log("sssss", sss)
    console.log('🔄 Messaging state - user:', user ? 'exists' : 'null')
    console.log('🔄 Messaging state - chats length:', chats.length)
    console.log('🔄 Messaging state - loading:', loading)
    console.log('🔄 Messaging state - activeChat:', activeChat)

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
                    socket.off('userOnline')
                    socket.off('userOffline')
                    socketService.disconnect()
                }
            }
        }, [user, dispatch])

    // Separate effect to join rooms when chats are loaded and socket is connected
    useEffect(() => {
        if (chats.length > 0 && isConnected) {
            console.log('🚀 Joining all chat rooms after chats loaded and connected...')
            chats.forEach(chat => {
                console.log('🚀 Joining room:', chat._id)
                socketService.joinRoom(chat._id)
            })
        }

        return () => {
            chats.forEach(chat => {
                console.log('🚀 Leaving room:', chat._id)
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
        activeChatRef.current = activeChat
    }, [activeChat])

    useEffect(() => {
        console.log('🚀 ChatList useEffect #1 (socket listener) running...')
        console.log('🚀 Dependencies - dispatch:', !!dispatch, 'user:', user ? 'exists' : 'null')

        if (!user) {
            console.log('🚀 No user, skipping socket setup')
            return
        }

        // Socket event listeners
        const handleReceiveMessage = (message) => {
            console.log('📨 Received message in ChatList:', message)
            console.log('📨 Message chatRoom field:', message.chatRoom)
            console.log('📨 Current activeChat from ref:', activeChatRef.current)

            dispatch(addMessage(message))

            // Mark as seen if chat is active - use current value from ref
            if (activeChatRef.current === message.chatRoom) {
                socketService.markAsSeen(message._id)
                dispatch(markMessageAsSeen({ messageId: message._id, userId: user._id || user.id }))
            }
        }

        // Check if socket is connected, if not wait a bit
        const setupListener = () => {
            if (socketService.isConnected()) {
                console.log('🚀 Socket is connected, setting up listener for receiveMessage...')
                socketService.on('receiveMessage', handleReceiveMessage)
            } else {
                console.log('🚀 Socket not connected yet, retrying in 100ms...')
                setTimeout(setupListener, 100)
            }
        }

        setupListener()

        return () => {
            console.log('🚀 Cleaning up socket listener for receiveMessage...')
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
