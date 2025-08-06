import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Download, Eye, Trash2, Copy, Reply, Loader2 } from 'lucide-react'
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenuSeparator
} from '@/components/ui/context-menu'
import { deleteMessage } from '@/store/slices/chatSlice'
import { useUnderDevelopment } from '@/hooks/useUnderDevelopment'
import { useLongPress } from '@/hooks/useLongPress'
import { useToast } from '@/hooks/use-toast'
// import socketService from '@/services/socketService'

const MessageBubble = ({ message, isOwn, showAvatar = true }) => {
    const dispatch = useDispatch()
    const { user } = useSelector(state => state.auth)
    const { showUnderDevelopmentMessage } = useUnderDevelopment()
    const { toast } = useToast()
    const [isDownloading, setIsDownloading] = useState(false)
    const [isCopying, setIsCopying] = useState(false)

    // Long press for mobile context menu
    const longPressProps = useLongPress(() => {
        // For mobile devices, long press will trigger context menu
        // The actual context menu will be handled by the ContextMenu component
    }, 500)

    const formatTime = (timestamp) => {
        const date = new Date(timestamp)
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const handleDeleteMessage = async () => {
        try {
            // Try socket method first (real-time)
            // socketService.deleteMessage(message._id)

            // Also call API as fallback
            await dispatch(deleteMessage(message._id)).unwrap()
        } catch (error) {
            console.error('Failed to delete message:', error)
            // You could add a toast notification here
            toast({
                title: 'Error',
                description: 'Failed to delete message. Please try again.',
                variant: 'destructive',
                duration: 4000,
            })
        }
    }

    // Utility function to get appropriate filename based on message type
    const getDownloadFilename = (url, providedFilename, messageType) => {
        if (providedFilename) return providedFilename

        try {
            const urlObj = new URL(url)
            const pathParts = urlObj.pathname.split('/')
            const filename = pathParts[pathParts.length - 1]

            if (filename && filename.includes('.')) {
                return filename
            }
        } catch (error) {
            console.error('Error parsing URL:', error)
        }

        // Fallback names based on message type
        const timestamp = new Date().getTime()
        switch (messageType) {
            case 'image':
                return `image_${timestamp}.jpg`
            case 'video':
                return `video_${timestamp}.mp4`
            case 'file':
                return `file_${timestamp}`
            default:
                return `download_${timestamp}`
        }
    }

    const handleDownload = async (url, filename) => {
        if (!url) return

        setIsDownloading(true)
        try {
            const finalFilename = getDownloadFilename(url, filename, message.messageType)

            // Use fetch to get the file as blob with proper headers
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors', // Handle CORS properly
                credentials: 'omit', // Don't send credentials for CDN requests
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`)
            }

            const blob = await response.blob()

            // Create download link
            const downloadUrl = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = downloadUrl
            link.download = finalFilename
            link.style.display = 'none'

            // Trigger download
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            // Clean up
            window.URL.revokeObjectURL(downloadUrl)

            toast({
                title: 'Download Complete',
                description: `${finalFilename} has been downloaded successfully.`,
                icon: <Download className="h-4 w-4" />,
                duration: 4000,
            })
        } catch (error) {
            console.error('Download failed:', error)

            // Fallback: try to open in new tab (for cases where CORS prevents blob download)
            try {
                window.open(url, '_blank')
                toast({
                    title: 'Download Started',
                    description: 'File opened in new tab for download.',
                    icon: <Download className="h-4 w-4" />,
                    duration: 4000,
                })
            } catch (fallbackError) {
                console.error('Fallback download also failed:', fallbackError)
                toast({
                    title: 'Download Failed',
                    description: 'Failed to download the file. Please try again or contact support.',
                    variant: 'destructive',
                    duration: 4000,
                })
            }
        } finally {
            setIsDownloading(false)
        }
    }

    const handleCopyMessage = async () => {
        setIsCopying(true)
        try {
            if (message.messageType === 'text') {
                await navigator.clipboard.writeText(message.content)
                toast({
                    title: 'Clipboard',
                    description: 'Message copied to clipboard.',
                    icon: <Copy className="h-4 w-4" />,
                    duration: 4000
                })
            } else if (message.messageType === 'image') {
                try {
                    const response = await fetch(message.content)
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`)
                    }

                    const blob = await response.blob()
                    const mimeType = blob.type

                    // Supported only in Chromium browsers, HTTPS, and user-gesture
                    if (
                        navigator.clipboard &&
                        navigator.clipboard.write &&
                        typeof ClipboardItem !== "undefined"
                    ) {
                        const clipboardItem = new ClipboardItem({
                            [mimeType]: blob
                        })

                        await navigator.clipboard.write([clipboardItem])
                        toast({
                            title: 'Clipboard',
                            description: 'Image copied to clipboard.',
                            icon: <Copy className="h-4 w-4" />,
                            duration: 4000
                        })
                    } else {
                        // Fallback: copy image URL
                        await navigator.clipboard.writeText(message.content)
                        toast({
                            title: 'Clipboard',
                            description: 'Image URL copied to clipboard.',
                            icon: <Copy className="h-4 w-4" />,
                            duration: 4000
                        })
                    }
                } catch (error) {
                    console.error('Copy failed', error)
                    toast({
                        title: 'Clipboard',
                        description: 'Failed to copy image to clipboard.',
                        icon: <Copy className="h-4 w-4" />,
                        variant: 'destructive',
                        duration: 4000
                    })
                }
            } else if (message.messageType === 'video') {
                // For videos, copy the URL as text
                await navigator.clipboard.writeText(message.content)
                toast({
                    title: 'Clipboard',
                    description: 'Video URL copied to clipboard.',
                    icon: <Copy className="h-4 w-4" />,
                    duration: 4000
                })
            }
        } catch (error) {
            console.error('Failed to copy:', error)

            // Fallback: try to copy URL as text
            try {
                await navigator.clipboard.writeText(message.content)
                toast({
                    title: 'Clipboard',
                    description: 'Content URL copied to clipboard.',
                    icon: <Copy className="h-4 w-4" />,
                    duration: 4000
                })
            } catch (fallbackError) {
                console.error('Fallback copy also failed:', fallbackError)
                toast({
                    title: 'Copy Failed',
                    description: 'Failed to copy to clipboard. Please try again.',
                    variant: 'destructive',
                    duration: 4000
                })
            }
        } finally {
            setIsCopying(false)
        }
    }

    const handleReplyToMessage = () => {
        showUnderDevelopmentMessage('Reply to message')
    }

    // Check if message is deleted for current user
    const isDeletedForUser = message.deletedFor?.includes(user?._id || user?.id)

    // Don't render if message is soft-deleted for this user
    if (isDeletedForUser) {
        return null
    }

    const renderMessageContent = () => {
        // // Handle "deleted by owner" case
        if (message.content === "deleted by owner" || message.content === "owner deleted their account.") {
            return (
                <div className="italic text-gray-400">
                    <Trash2 className="h-4 w-4 inline mr-2" />
                    {message.content}
                </div>
            )
        }

        switch (message.messageType) {
            case 'text':
                return (
                    <div className="break-words">
                        {message.content}
                    </div>
                )

            case 'image':
                return (
                    <div className="space-y-2">
                        <img
                            src={message.content}
                            alt="Shared image"
                            className="max-w-sm max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(message.content, '_blank')}
                        />
                        {message.caption && (
                            <div className="text-sm">
                                {message.caption}
                            </div>
                        )}
                    </div>
                )

            case 'video':
                return (
                    <div className="space-y-2">
                        <video
                            src={message.content}
                            controls
                            className="max-w-sm max-h-64 rounded-lg"
                        />
                        {message.caption && (
                            <div className="text-sm">
                                {message.caption}
                            </div>
                        )}
                    </div>
                )

            case 'file':
                return (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Download className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                                {message.fileName || 'File'}
                            </div>
                            <div className="text-xs text-gray-500">
                                {message.fileSize || 'Unknown size'}
                            </div>
                        </div>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownload(message.content, message.fileName)}
                            disabled={isDownloading}
                        >
                            {isDownloading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                )

            default:
                return <div>{message.content}</div>
        }
    }

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} max-w-xs lg:max-w-md`}>
                {showAvatar && !isOwn && (
                    <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={message.sender?.profilePicture} />
                        <AvatarFallback>
                            {message.sender?.firstName?.charAt(0)}
                            {message.sender?.lastName?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                )}

                <div className={`group ${isOwn ? 'mr-2' : 'ml-2'}`}>
                    {!isOwn && showAvatar && (
                        <div className="text-xs text-gray-500 mb-1">
                            {message.sender?.firstName} {message.sender?.lastName}
                        </div>
                    )}

                    <ContextMenu>
                        <ContextMenuTrigger asChild>
                            <div
                                className={`relative rounded-lg px-3 py-1 cursor-pointer ${isOwn
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-900'
                                    }`}
                                {...longPressProps}
                            >
                                {renderMessageContent()}

                                <div className={`flex items-center justify-between mt-1 text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'
                                    }`}>
                                    <span>{formatTime(message.createdAt)}</span>
                                    {isOwn && (
                                        <div className="flex items-center space-x-1 ml-2">
                                            {message.seenBy?.length > 1 && (
                                                <Eye className="h-3 w-3" />
                                            )}
                                            <span>{message.seenBy?.length > 1 ? 'Seen' : 'Sent'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </ContextMenuTrigger>

                        <ContextMenuContent className="w-52">
                            {/* Only show menu items if message is not deleted by owner */}
                            {message.content !== "deleted by owner" && message.content !== "This message was deleted" && (
                                <>
                                    {/* Copy Options */}
                                    {message.messageType === 'text' && (
                                        <ContextMenuItem onClick={handleCopyMessage} disabled={isCopying}>
                                            {isCopying ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                                <Copy className="h-4 w-4 mr-2" />
                                            )}
                                            Copy Text
                                        </ContextMenuItem>
                                    )}

                                    {message.messageType === 'image' && (
                                        <ContextMenuItem onClick={handleCopyMessage} disabled={isCopying}>
                                            {isCopying ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                                <Copy className="h-4 w-4 mr-2" />
                                            )}
                                            Copy Image
                                        </ContextMenuItem>
                                    )}

                                    {message.messageType === 'video' && (
                                        <ContextMenuItem onClick={handleCopyMessage} disabled={isCopying}>
                                            {isCopying ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                                <Copy className="h-4 w-4 mr-2" />
                                            )}
                                            Copy Video URL
                                        </ContextMenuItem>
                                    )}

                                    {/* Download Options */}
                                    {(message.messageType === 'image' || message.messageType === 'video' || message.messageType === 'file') && (
                                        <ContextMenuItem
                                            onClick={() => handleDownload(message.content, message.fileName)}
                                            disabled={isDownloading}
                                        >
                                            {isDownloading ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                                <Download className="h-4 w-4 mr-2" />
                                            )}
                                            {message.messageType === 'image' && 'Download Image'}
                                            {message.messageType === 'video' && 'Download Video'}
                                            {message.messageType === 'file' && 'Download File'}
                                        </ContextMenuItem>
                                    )}

                                    {/* Other Options */}
                                    <ContextMenuItem onClick={handleReplyToMessage}>
                                        <Reply className="h-4 w-4 mr-2" />
                                        Reply
                                    </ContextMenuItem>

                                    <ContextMenuSeparator />
                                </>
                            )}

                            {/* Delete option - always available for user's own messages */}
                            <ContextMenuItem
                                onClick={handleDeleteMessage}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Message
                            </ContextMenuItem>
                        </ContextMenuContent>
                    </ContextMenu>
                </div>
            </div>
        </div>
    )
}

export default MessageBubble
