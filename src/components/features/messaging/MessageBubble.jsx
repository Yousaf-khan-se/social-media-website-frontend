import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Download, Eye } from 'lucide-react'
import { useUnderDevelopment } from '@/hooks/useUnderDevelopment'

const MessageBubble = ({ message, isOwn, showAvatar = true }) => {
    const { showUnderDevelopmentMessage } = useUnderDevelopment()

    const formatTime = (timestamp) => {
        const date = new Date(timestamp)
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const handleDownload = (url, filename) => {
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const renderMessageContent = () => {
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
                        >
                            <Download className="h-4 w-4" />
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

                    <div className={`relative rounded-lg px-3 py-2 ${isOwn
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                        }`}>
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

                        {/* Message actions */}
                        <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => showUnderDevelopmentMessage('Message actions')}
                        >
                            <MoreHorizontal className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MessageBubble
