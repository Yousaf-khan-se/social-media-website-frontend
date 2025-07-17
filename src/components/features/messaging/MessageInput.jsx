import React, { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { uploadChatMedia } from '@/store/slices/chatSlice'
import { useUnderDevelopment } from '@/hooks/useUnderDevelopment'
import { Send, Paperclip, Image, Smile, Mic } from 'lucide-react'
import socketService from '@/services/socketService'

const MessageInput = ({ roomId }) => {
    const dispatch = useDispatch()
    const { showUnderDevelopmentMessage } = useUnderDevelopment()
    const { loading } = useSelector(state => state.chats)
    const [message, setMessage] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState([])
    const [isRecording] = useState(false)

    const fileInputRef = useRef(null)
    const imageInputRef = useRef(null)
    const textareaRef = useRef(null)
    const typingTimeoutRef = useRef(null)

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current)
            }
        }
    }, [])

    const handleTyping = () => {
        if (!isTyping) {
            setIsTyping(true)
            socketService.sendTyping(roomId, true)
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
        }

        // Set new timeout
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false)
            socketService.sendTyping(roomId, false)
        }, 1000)
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()

        if ((!message.trim() && selectedFiles.length === 0) || loading.uploading) return

        let mediaUrls = []

        // Upload files if any
        if (selectedFiles.length > 0) {
            try {
                const result = await dispatch(uploadChatMedia({
                    roomId,
                    mediaFiles: selectedFiles
                })).unwrap()
                mediaUrls = result.mediaUrls
            } catch (error) {
                console.error('Failed to upload media:', error)
                return
            }
        }
        // Send text message
        else if (message.trim()) {
            socketService.sendMessage({
                roomId,
                content: message.trim(),
                messageType: 'text'
            })
        }

        // Send media messages
        mediaUrls.forEach(media => {
            const messageType = media.resource_type === 'image' ? 'image' :
                media.resource_type === 'video' ? 'video' : 'file'

            socketService.sendMessage({
                roomId,
                content: media.secure_url,
                messageType,
                caption: messageType !== 'text' ? message.trim() : ''
            })
        })

        // Clear form
        setMessage('')
        setSelectedFiles([])
        setIsTyping(false)
        socketService.sendTyping(roomId, false)

        if (textareaRef.current) {
            textareaRef.current.focus()
        }
    }

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files)
        setSelectedFiles(prev => [...prev, ...files])
    }

    const handleRemoveFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage(e)
        } else if (e.key !== 'Enter') {
            handleTyping()
        }
    }

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const getFilePreview = (file) => {
        if (file.type.startsWith('image/')) {
            return URL.createObjectURL(file)
        }
        return null
    }

    return (
        <div className="border-t bg-white p-4 mb-8 md:m-0">
            {/* File previews */}
            {selectedFiles.length > 0 && (
                <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                        {selectedFiles.map((file, index) => (
                            <div key={index} className="relative">
                                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2">
                                    {getFilePreview(file) ? (
                                        <img
                                            src={getFilePreview(file)}
                                            alt={file.name}
                                            className="w-12 h-12 object-cover rounded"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 bg-gray-300 rounded flex items-center justify-center">
                                            <Paperclip className="h-6 w-6 text-gray-600" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate">{file.name}</div>
                                        <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleRemoveFile(index)}
                                        className="h-6 w-6 p-0"
                                    >
                                        ×
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Message input */}
            <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
                <div className="flex space-x-1">
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="*/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <input
                        ref={imageInputRef}
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading.uploading}
                    >
                        <Paperclip className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={loading.uploading}
                    >
                        <Image className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => showUnderDevelopmentMessage('Emoji picker')}
                    >
                        <Smile className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex-1">
                    <Input
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        disabled={loading.uploading}
                        className="resize-none"
                    />
                </div>

                <div className="flex space-x-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => showUnderDevelopmentMessage('Voice recording')}
                        className={isRecording ? 'text-red-500' : ''}
                    >
                        <Mic className="h-4 w-4" />
                    </Button>

                    <Button
                        type="submit"
                        size="sm"
                        disabled={(!message.trim() && selectedFiles.length === 0) || loading.uploading}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </form>

            {loading.uploading && (
                <div className="mt-2 text-sm text-gray-500">
                    Uploading files...
                </div>
            )}
        </div>
    )
}

export default MessageInput
