import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    fetchChatPermissionRequests,
    respondToChatPermissionRequest
} from '@/store/slices/chatSlice'
import { Check, X, Clock, MessageSquare, Users } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
// import { duration } from 'zod/v4/classic/iso.cjs'

const ChatPermissionRequestsDialog = ({ isOpen, onClose }) => {
    const dispatch = useDispatch()
    const { toast } = useToast()
    const {
        permissionRequests,
        loading
    } = useSelector(state => state.chats)

    const [activeTab, setActiveTab] = useState('received') // 'received' or 'sent'

    useEffect(() => {
        if (isOpen) {
            // Fetch both received and sent requests
            dispatch(fetchChatPermissionRequests('received'))
            dispatch(fetchChatPermissionRequests('sent'))
        }
    }, [isOpen, dispatch])

    const handleApprove = async (requestId) => {
        try {
            await dispatch(respondToChatPermissionRequest({
                requestId,
                response: 'approved'
            })).unwrap()

            toast({
                title: "Request Approved",
                description: "Chat has been created successfully!",
                duration: 5000,
            })
        } catch (err) {
            console.error('Failed to approve request:', err)
            toast({
                title: "Error",
                description: "Failed to approve request",
                variant: "destructive",
                duration: 5000,
            })
        }
    }

    const handleDeny = async (requestId) => {
        try {
            await dispatch(respondToChatPermissionRequest({
                requestId,
                response: 'denied'
            })).unwrap()

            toast({
                title: "Request Denied",
                description: "The request has been declined.",
                duration: 5000,
            })
        } catch (err) {
            console.error('Failed to deny request:', err)
            toast({
                title: "Error",
                description: "Failed to deny request",
                variant: "destructive",
                duration: 5000
            })
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffTime = now - date
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 0) {
            return 'Today'
        } else if (diffDays === 1) {
            return 'Yesterday'
        } else if (diffDays < 7) {
            return `${diffDays} days ago`
        } else {
            return date.toLocaleDateString()
        }
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary" className="text-orange-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
            case 'approved':
                return <Badge variant="default" className="text-green-600 bg-green-100"><Check className="h-3 w-3 mr-1" />Approved</Badge>
            case 'denied':
                return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Denied</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    const renderRequestCard = (request, isReceived = false) => {
        const otherUser = isReceived ? request.requester : request.recipient
        const isPending = request.status === 'pending'

        return (
            <Card key={request._id} className="mb-3">
                <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={otherUser.profilePicture} />
                            <AvatarFallback>
                                {otherUser.firstName?.charAt(0)}{otherUser.lastName?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <h4 className="font-medium text-sm">
                                        {otherUser.firstName} {otherUser.lastName}
                                    </h4>
                                    <p className="text-xs text-gray-500">@{otherUser.username}</p>
                                </div>
                                {getStatusBadge(request.status)}
                            </div>

                            <div className="flex items-center text-xs text-gray-500 mb-2">
                                {request.chatData?.isGroup ? (
                                    <><Users className="h-3 w-3 mr-1" />Group Chat</>
                                ) : (
                                    <><MessageSquare className="h-3 w-3 mr-1" />Direct Message</>
                                )}
                                <span className="mx-2">•</span>
                                {formatDate(request.createdAt)}
                            </div>

                            {request.message && (
                                <p className="text-sm text-gray-700 mb-3 p-2 bg-gray-50 rounded">
                                    "{request.message}"
                                </p>
                            )}

                            {request.chatData?.name && (
                                <p className="text-sm font-medium mb-2">
                                    Group: {request.chatData.name}
                                </p>
                            )}

                            {isReceived && isPending && (
                                <div className="flex space-x-2">
                                    <Button
                                        size="sm"
                                        onClick={() => handleApprove(request._id)}
                                        disabled={loading.respondingToRequest}
                                        className="text-xs"
                                    >
                                        <Check className="h-3 w-3 mr-1" />
                                        Approve
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDeny(request._id)}
                                        disabled={loading.respondingToRequest}
                                        className="text-xs"
                                    >
                                        <X className="h-3 w-3 mr-1" />
                                        Deny
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!isOpen) return null

    const receivedRequests = permissionRequests.received || []
    const sentRequests = permissionRequests.sent || []

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-lg h-[80vh] flex flex-col">
                <CardHeader className="flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <CardTitle>Chat Requests</CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                        <Button
                            variant={activeTab === 'received' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab('received')}
                            className="flex-1 text-xs"
                        >
                            Received ({receivedRequests.length})
                        </Button>
                        <Button
                            variant={activeTab === 'sent' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab('sent')}
                            className="flex-1 text-xs"
                        >
                            Sent ({sentRequests.length})
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 min-h-0 p-0">
                    <ScrollArea className="h-full">
                        <div className="p-4">
                            {loading.permissionRequests ? (
                                <div className="text-center py-8 text-gray-500">
                                    Loading requests...
                                </div>
                            ) : (
                                <>
                                    {activeTab === 'received' && (
                                        <>
                                            {receivedRequests.length === 0 ? (
                                                <div className="text-center py-8 text-gray-500">
                                                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                                    <p>No chat requests received</p>
                                                </div>
                                            ) : (
                                                receivedRequests.map(request =>
                                                    renderRequestCard(request, true)
                                                )
                                            )}
                                        </>
                                    )}

                                    {activeTab === 'sent' && (
                                        <>
                                            {sentRequests.length === 0 ? (
                                                <div className="text-center py-8 text-gray-500">
                                                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                                    <p>No chat requests sent</p>
                                                </div>
                                            ) : (
                                                sentRequests.map(request =>
                                                    renderRequestCard(request, false)
                                                )
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    )
}

export default ChatPermissionRequestsDialog
