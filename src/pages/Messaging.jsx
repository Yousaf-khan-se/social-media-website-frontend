import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchChats, clearError } from '@/store/slices/chatSlice'
import { useAuth } from '@/hooks/useAuth'
import socketService from '@/services/socketService'
import ChatList from '@/components/features/messaging/ChatList'
import ChatWindow from '@/components/features/messaging/ChatWindow'
import NewChatDialog from '@/components/features/messaging/NewChatDialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MessageCircle, Wifi, WifiOff } from 'lucide-react'

const Messaging = () => {
    const dispatch = useDispatch()
    const { user } = useAuth()
    const { chats, loading, error, activeChat } = useSelector(state => state.chats)
    const [showNewChat, setShowNewChat] = useState(false)
    const [isConnected, setIsConnected] = useState(false)
    const [showChatWindow, setShowChatWindow] = useState(false)

    useEffect(() => {
        if (user) {
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

            return () => {
                socketService.disconnect()
            }
        }
    }, [user, dispatch])

    useEffect(() => {
        if (activeChat) {
            setShowChatWindow(true)
        }
    }, [activeChat])

    const handleBackToList = () => {
        setShowChatWindow(false)
    }

    const handleNewChat = () => {
        setShowNewChat(true)
    }

    const handleCloseNewChat = () => {
        setShowNewChat(false)
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
            <div className={`fixed bottom-10 md:bottom-4 right-4 z-50 px-3 py-2 rounded-lg text-sm font-medium ${isConnected
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
                }`}>
                <div className="flex items-center space-x-2">
                    {isConnected ? (
                        <Wifi className="h-4 w-4" />
                    ) : (
                        <WifiOff className="h-4 w-4" />
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
                <div className={`w-full lg:w-80 xl:w-96 bg-white border-r ${showChatWindow ? 'hidden lg:block' : 'block'
                    }`}>
                    <ChatList onNewChat={handleNewChat} />
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
        </div>
    )
}

export default Messaging
