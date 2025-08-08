import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toggleLike, deletePost, updatePost, uploadPostMedia } from '@/store/slices/postsSlice'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel'
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CommentCard, AddCommentForm } from './CommentCard'
import TiptapEditor from '@/components/editor/TiptapEditor'
import {
    Heart,
    MessageCircle,
    Share,
    Bookmark,
    MoreHorizontal,
    ChevronDown,
    ChevronUp,
    MapPin,
    Calendar
} from 'lucide-react'
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils'
import {
    prepareContentForDisplay,
    isHtmlEmpty,
    generateContentSummary
} from '@/utils/editorUtils'

// Constants
const MAX_FILES = 10
const MAX_FILE_SIZE_MB = 45

// Helper functions
const isVideoFile = (url) => typeof url === 'string' && url.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i)
const isImageFile = (url) => typeof url === 'string' && url.match(/\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i)

const formatEngagementCount = (count) => {
    if (count === 0) return '0'
    if (count < 1000) return count.toString()
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`
    return `${(count / 1000000).toFixed(1)}M`
}

const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) return 'now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`
    return date.toLocaleDateString()
}

// Enhanced Post Actions Component
const PostActions = ({
    isLiked,
    isLiking,
    showComments,
    likesCount,
    commentsCount,
    onLike,
    onToggleComments,
    onShare,
    onBookmark
}) => {
    return (
        <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1">
                <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 gap-1"
                    onClick={onLike}
                    disabled={isLiking}
                    aria-label={isLiked ? "Unlike post" : "Like post"}
                >
                    <Heart className={cn("h-4 w-4", isLiked ? "text-red-500 fill-red-500" : "")} />
                    {likesCount > 0 && (
                        <span className="text-xs">{formatEngagementCount(likesCount)}</span>
                    )}
                </Button>

                <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 gap-1"
                    onClick={onToggleComments}
                    aria-label="Toggle comments"
                >
                    <MessageCircle className={cn("h-4 w-4", showComments ? "text-blue-500" : "")} />
                    {commentsCount > 0 && (
                        <span className="text-xs">{formatEngagementCount(commentsCount)}</span>
                    )}
                </Button>

                <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2"
                    onClick={onShare}
                    aria-label="Share post"
                >
                    <Share className="h-4 w-4" />
                </Button>
            </div>

            <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2"
                onClick={onBookmark}
                aria-label="Bookmark post"
            >
                <Bookmark className="h-4 w-4" />
            </Button>
        </div>
    )
}

// Enhanced Author Menu Component
const AuthorMenu = ({ isAuthor, onEdit, onDelete }) => {
    if (!isAuthor) return null

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    aria-label="More options"
                >
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                    Edit Post
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={onDelete}
                    className="text-destructive focus:text-destructive"
                >
                    Delete Post
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}



// Main PostCard Component
export const PostCard = ({ post }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user } = useSelector(state => state.auth)

    // State management
    const [isLiking, setIsLiking] = useState(false)
    const [showComments, setShowComments] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(post?.content || '')
    const [showEditHistory, setShowEditHistory] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    // Edit mode media handling (similar to CreatePostCard)
    const [editMediaFiles, setEditMediaFiles] = useState([])
    const [editMediaUrlToFileMap, setEditMediaUrlToFileMap] = useState(new Map())
    const [isEditUploading, setIsEditUploading] = useState(false)
    const [editErrorMsg, setEditErrorMsg] = useState("")

    // Cleanup edit media URLs on unmount
    useEffect(() => {
        return () => {
            editMediaUrlToFileMap.forEach((file, url) => {
                URL.revokeObjectURL(url)
            })
        }
    }, [editMediaUrlToFileMap])

    // Memoized computed values
    const authorInfo = useMemo(() => {
        if (typeof post.author === 'object' && post.author !== null) {
            const first = post.author.firstName || post.author.name || 'Unknown'
            const last = post.author.lastName || ''
            return {
                name: `${first} ${last}`.trim(),
                username: post.author.username || post.author.email || 'unknown',
                avatar: post.author.profilePicture || '',
                initials: `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || 'U'
            }
        }
        return {
            name: 'Unknown',
            username: 'unknown',
            avatar: '',
            initials: 'U'
        }
    }, [post.author])

    const engagementCounts = useMemo(() => ({
        likes: Array.isArray(post.likes) ? post.likes.length : 0,
        comments: Array.isArray(post.comments) ? post.comments.length : 0,
        shares: Array.isArray(post.shares) ? post.shares.length : 0
    }), [post.likes, post.comments, post.shares])

    const isLiked = useMemo(() => {
        if (!user || !Array.isArray(post.likes)) return false
        return post.likes.some(like =>
            (like.user?._id || like.user?.id || like.user)?.toString() ===
            (user._id || user.id)?.toString()
        )
    }, [post.likes, user])

    const isAuthor = useMemo(() => {
        if (!user) return false
        const authorId = post.author?._id || post.author?.id || post.author
        const userId = user._id || user.id
        return userId && authorId && userId.toString() === authorId.toString()
    }, [post.author, user])

    // Event handlers
    const handleLike = useCallback(async () => {
        if (isLiking) return
        setIsLiking(true)
        try {
            await dispatch(toggleLike(post._id || post.id))
        } finally {
            setIsLiking(false)
        }
    }, [dispatch, post._id, post.id, isLiking])

    const handleDelete = useCallback(async () => {
        try {
            const postId = post._id || post.id
            if (!postId) {
                console.error('No post ID found for deletion')
                return
            }

            console.log('Deleting post with ID:', postId)
            await dispatch(deletePost(postId)).unwrap()
            setShowDeleteConfirm(false)

            // Optional: Show success toast
            // toast({
            //     title: "Post Deleted",
            //     description: "Your post has been deleted successfully.",
            //     duration: 2000,
            // })
        } catch (error) {
            console.error('Failed to delete post:', error)
            setShowDeleteConfirm(false)

            // Optional: Show error toast
            // toast({
            //     title: "Delete Failed",
            //     description: "Failed to delete post. Please try again.",
            //     variant: "destructive",
            //     duration: 4000,
            // })
        }
    }, [dispatch, post._id, post.id])

    const handleProfileClick = useCallback(() => {
        const authorId = post.author?._id || post.author?.id || post.author
        const userId = user._id || user.id

        if (authorId && userId && authorId.toString() === userId.toString()) {
            // Navigate to own profile
            navigate('/profile')
        } else if (authorId) {
            // Navigate to user profile
            navigate(`/user/${authorId}`)
        }
    }, [post.author, user, navigate])

    // Edit mode content change handler (similar to CreatePostCard)
    const handleEditContentChange = useCallback((newContent) => {
        setEditContent(newContent)
        setEditErrorMsg("") // Clear any previous errors

        // Check if any media was removed from the editor content
        if (editMediaUrlToFileMap.size > 0) {
            const currentUrls = new Set()

            // Extract all blob URLs from the new content
            const imgMatches = newContent.match(/src="blob:[^"]*"/g) || []
            const videoMatches = newContent.match(/<video[^>]*src="blob:[^"]*"/g) || []

            imgMatches.forEach(match => {
                const url = match.match(/src="(blob:[^"]*)"/)?.[1]
                if (url) currentUrls.add(url)
            })

            videoMatches.forEach(match => {
                const url = match.match(/src="(blob:[^"]*)"/)?.[1]
                if (url) currentUrls.add(url)
            })

            // Find URLs that were removed
            const removedUrls = []
            for (const url of editMediaUrlToFileMap.keys()) {
                if (!currentUrls.has(url)) {
                    removedUrls.push(url)
                }
            }

            // Remove corresponding files from mediaFiles array
            if (removedUrls.length > 0) {
                setEditMediaFiles(prev => {
                    const filesToRemove = removedUrls.map(url => editMediaUrlToFileMap.get(url)).filter(Boolean)
                    return prev.filter(file => !filesToRemove.includes(file))
                })

                // Clean up URL mappings
                setEditMediaUrlToFileMap(prev => {
                    const newMap = new Map(prev)
                    removedUrls.forEach(url => {
                        URL.revokeObjectURL(url) // Clean up blob URL
                        newMap.delete(url)
                    })
                    return newMap
                })
            }
        }
    }, [editMediaUrlToFileMap])

    // Edit mode image upload handler
    const handleEditImageUpload = useCallback(async (file) => {
        if (!file) return null

        const MAX_FILE_SIZE_MB = 15
        const MAX_FILES = 10

        // Validate file size
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            // You can add toast notification here if needed
            throw new Error('File too large')
        }

        // Check if we're at the limit
        if (editMediaFiles.length >= MAX_FILES) {
            throw new Error('Too many files')
        }

        try {
            // Create a local URL for preview
            const imageUrl = URL.createObjectURL(file)

            // Add file to our media files array
            setEditMediaFiles(prev => [...prev, file])

            // Track URL to file mapping
            setEditMediaUrlToFileMap(prev => {
                const newMap = new Map(prev)
                newMap.set(imageUrl, file)
                return newMap
            })

            return imageUrl

        } catch (error) {
            console.error('Image handling failed:', error)
            throw error
        }
    }, [editMediaFiles.length])

    // Edit mode video upload handler
    const handleEditVideoUpload = useCallback(async (file) => {
        if (!file) return null

        const MAX_FILES = 10
        const maxVideoSize = 50 * 1024 * 1024 // 50MB for videos

        // Validate file size
        if (file.size > maxVideoSize) {
            throw new Error('File too large')
        }

        // Check if we're at the limit
        if (editMediaFiles.length >= MAX_FILES) {
            throw new Error('Too many files')
        }

        try {
            // Create a local URL for preview
            const videoUrl = URL.createObjectURL(file)

            // Add file to our media files array
            setEditMediaFiles(prev => [...prev, file])

            // Track URL to file mapping
            setEditMediaUrlToFileMap(prev => {
                const newMap = new Map(prev)
                newMap.set(videoUrl, file)
                return newMap
            })

            return videoUrl

        } catch (error) {
            console.error('Video handling failed:', error)
            throw error
        }
    }, [editMediaFiles.length])

    const handleEdit = useCallback(async () => {
        // Check if content is empty and no media files
        if (isHtmlEmpty(editContent) && editMediaFiles.length === 0) {
            setEditErrorMsg("Please write something or add media before saving.")
            return
        }

        let postUpdated = false
        let mediaUploaded = false

        try {
            setIsEditUploading(true)

            // For editing, we need to handle the content differently
            // The editContent contains actual media URLs (from existing media) and blob URLs (from new media)
            // We need to convert back to the stored format with placeholders for existing media
            // and add new placeholders for new media files

            let contentToSave = editContent

            // First, convert existing media URLs back to placeholders
            if (Array.isArray(post.media) && post.media.length > 0) {
                post.media.forEach((mediaObj, index) => {
                    if (mediaObj && mediaObj.secure_url) {
                        const urlRegex = new RegExp(`src="${mediaObj.secure_url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'gi')
                        contentToSave = contentToSave.replace(urlRegex, `data-media-placeholder="${index}"`)
                        // Also remove src attribute to avoid duplication
                        contentToSave = contentToSave.replace(new RegExp(`<(img|video)([^>]*?)data-media-placeholder="${index}"([^>]*?)src="[^"]*"([^>]*?)>`, 'gi'),
                            `<$1$2data-media-placeholder="${index}"$3$4>`)
                    }
                })
            }

            // Then, if there are new media files (with blob URLs), replace them with placeholders
            if (editMediaFiles.length > 0) {
                // Process the content to replace blob URLs with placeholders starting after existing media count
                const existingMediaCount = Array.isArray(post.media) ? post.media.length : 0
                let newMediaIndex = existingMediaCount

                contentToSave = contentToSave.replace(
                    /<(img|video)([^>]*?)src="blob:[^"]*"([^>]*?)>/gi,
                    (match, tagName, beforeSrc, afterSrc) => {
                        const placeholder = `data-media-placeholder="${newMediaIndex}"`
                        newMediaIndex++
                        const cleanBeforeSrc = beforeSrc.replace(/\s*src="[^"]*"\s*/g, ' ')
                        const cleanAfterSrc = afterSrc.replace(/\s*src="[^"]*"\s*/g, ' ')
                        return `<${tagName}${cleanBeforeSrc}${placeholder}${cleanAfterSrc}>`
                    }
                )
            }

            // Step 1: Update the post content
            await dispatch(updatePost({
                id: post._id || post.id,
                postData: {
                    content: contentToSave,
                    isEdited: true,
                    editHistory: [
                        ...(post.editHistory || []),
                        { content: contentToSave, editedAt: new Date().toISOString() }
                    ]
                }
            })).unwrap()

            postUpdated = true

            // Step 2: Upload new media files if any
            if (editMediaFiles.length > 0) {
                const formData = new FormData()
                editMediaFiles.forEach(file => {
                    formData.append('media', file)
                })

                await dispatch(uploadPostMedia({
                    id: post._id || post.id,
                    media: formData
                })).unwrap()

                mediaUploaded = true
            }

            // Reset edit state on success
            setIsEditing(false)
            setEditContent(post.content || '')
            setEditMediaFiles([])
            setEditErrorMsg('')

            // Clean up all blob URLs and mappings
            editMediaUrlToFileMap.forEach((file, url) => {
                URL.revokeObjectURL(url)
            })
            setEditMediaUrlToFileMap(new Map())

        } catch (error) {
            console.error('Post update/upload failed:', error)

            let errorMessage = "Failed to update post. Please try again."

            if (postUpdated && !mediaUploaded && editMediaFiles.length > 0) {
                errorMessage = "Post updated but new media upload failed. Please try uploading media separately."
            } else if (!postUpdated) {
                errorMessage = "Failed to update post. Please try again."
            }

            setEditErrorMsg(errorMessage)
        } finally {
            setIsEditUploading(false)
        }
    }, [dispatch, editContent, editMediaFiles, editMediaUrlToFileMap, post._id, post.id, post.editHistory, post.content, post.media])

    // Initialize edit mode with proper content including existing media
    const initializeEditMode = useCallback(() => {
        setIsEditing(true)
        // Use the display version of content which includes the actual media URLs
        const displayContent = prepareContentForDisplay(post.content, post.media)
        setEditContent(displayContent)
        setEditMediaFiles([])
        setEditErrorMsg('')
        setEditMediaUrlToFileMap(new Map())
    }, [post.content, post.media])

    const handleCancelEdit = useCallback(() => {
        setIsEditing(false)
        setEditContent(post.content || '')
        setEditMediaFiles([])
        setEditErrorMsg('')

        // Clean up all blob URLs and mappings
        editMediaUrlToFileMap.forEach((file, url) => {
            URL.revokeObjectURL(url)
        })
        setEditMediaUrlToFileMap(new Map())
    }, [post.content, editMediaUrlToFileMap])

    // Early return for invalid post
    if (!post) {
        return (
            <Card className="rounded-lg my-2 w-full">
                <CardContent className="p-4 text-center text-muted-foreground">
                    Post data unavailable.
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="rounded-lg my-2 w-full">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <Avatar
                        className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={handleProfileClick}
                    >
                        <AvatarImage src={authorInfo.avatar} alt={authorInfo.name} />
                        <AvatarFallback>{authorInfo.initials}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span
                                    className="font-semibold text-sm truncate cursor-pointer hover:underline"
                                    onClick={handleProfileClick}
                                >
                                    {authorInfo.name}
                                </span>
                                <span
                                    className="text-xs text-muted-foreground truncate cursor-pointer hover:underline"
                                    onClick={handleProfileClick}
                                >
                                    @{authorInfo.username}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {formatDate(post.createdAt)}
                                </span>
                                {post.isEdited && (
                                    <button
                                        onClick={() => setShowEditHistory(v => !v)}
                                        className="text-xs text-muted-foreground italic hover:text-foreground flex items-center gap-1"
                                    >
                                        (edited)
                                        {showEditHistory ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                    </button>
                                )}
                            </div>
                            <AuthorMenu
                                isAuthor={isAuthor}
                                onEdit={initializeEditMode}
                                onDelete={() => setShowDeleteConfirm(true)}
                            />
                        </div>

                        {/* Edit History */}
                        {showEditHistory && Array.isArray(post.editHistory) && post.editHistory.length > 0 && (
                            <div className="bg-muted rounded-md p-3 mt-2 text-xs">
                                <div className="font-medium mb-2">Edit History:</div>
                                <div className="space-y-2">
                                    {post.editHistory.map((edit, idx) => (
                                        <div key={idx} className="pb-2 border-b last:border-b-0">
                                            <p className="text-muted-foreground">{edit.content}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatDate(edit.editedAt)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Content */}
                        {isEditing ? (
                            <div className="mt-3 space-y-4">
                                <TiptapEditor
                                    content={editContent}
                                    onChange={handleEditContentChange}
                                    placeholder="What's on your mind?"
                                    onImageUpload={handleEditImageUpload}
                                    onVideoUpload={handleEditVideoUpload}
                                    className="w-full"
                                    maxHeight="300px"
                                    minHeight="120px"
                                />

                                {/* Error Message */}
                                {editErrorMsg && (
                                    <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
                                        {editErrorMsg}
                                    </div>
                                )}

                                {/* Media Files Display */}
                                {editMediaFiles.length > 0 && (
                                    <div className="bg-muted/50 p-3 rounded-md">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">Media Files ({editMediaFiles.length}/10)</span>
                                            <span className="text-xs text-muted-foreground">Select and delete in editor to remove</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {editMediaFiles.map((file, index) => (
                                                <div key={index} className="flex items-center gap-2 bg-background border rounded-md p-2">
                                                    <span className="text-xs">
                                                        {file.type.startsWith('image/') ? '🖼️' : '🎥'}
                                                    </span>
                                                    <span className="text-xs font-medium truncate max-w-[100px]">
                                                        {file.name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        ({(file.size / (1024 * 1024)).toFixed(1)}MB)
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">
                                            {generateContentSummary(editContent).wordCount} words
                                            {editMediaFiles.length > 0 && `, ${editMediaFiles.length} media file${editMediaFiles.length > 1 ? 's' : ''}`}
                                        </span>
                                        {isEditUploading && (
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <span>Uploading...</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={handleEdit}
                                            disabled={isEditUploading || (isHtmlEmpty(editContent) && editMediaFiles.length === 0)}
                                        >
                                            {isEditUploading ? 'Saving...' : 'Save'}
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={handleCancelEdit} disabled={isEditUploading}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div
                                    className="mt-2 text-sm break-words prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{
                                        __html: prepareContentForDisplay(post.content, post.media)
                                    }}
                                />

                                {/* Location */}
                                {post.location && (
                                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                        <MapPin className="h-3 w-3" />
                                        {post.location}
                                    </div>
                                )}

                                {/* Tags */}
                                {Array.isArray(post.tags) && post.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {post.tags.map((tag, idx) => (
                                            <Badge key={idx} variant="secondary" className="text-xs">
                                                #{tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {/* Media is now rendered inline within the content above */}
                                {/* Fallback: Show media carousel only if no inline media detected */}
                                {Array.isArray(post.media) && post.media.length > 0 &&
                                    !post.content?.includes('data-media-placeholder') &&
                                    !post.content?.includes('<img') &&
                                    !post.content?.includes('<video') && (
                                        <div className="mt-3">
                                            <div className="text-xs text-muted-foreground mb-2">Attached Media:</div>
                                            <Carousel className="w-full max-w-md mx-auto">
                                                <CarouselContent>
                                                    {post.media.map((mediaObj, idx) => {
                                                        const url = mediaObj.secure_url
                                                        return (
                                                            <CarouselItem key={idx}>
                                                                <div className="p-1">
                                                                    <Card className="border-0 shadow-none">
                                                                        <CardContent className="flex aspect-square items-center justify-center p-2">
                                                                            {isVideoFile(url) ? (
                                                                                <video
                                                                                    src={url}
                                                                                    controls
                                                                                    className="object-cover w-full h-full rounded-md"
                                                                                    style={{ maxHeight: '320px' }}
                                                                                    preload="metadata"
                                                                                />
                                                                            ) : isImageFile(url) ? (
                                                                                <img
                                                                                    src={url}
                                                                                    alt={`Post media ${idx + 1}`}
                                                                                    className="object-cover w-full h-full rounded-md"
                                                                                    style={{ maxHeight: '320px' }}
                                                                                    loading="lazy"
                                                                                />
                                                                            ) : (
                                                                                <div className="flex items-center justify-center w-full h-full bg-muted rounded-md">
                                                                                    <span className="text-muted-foreground text-sm">
                                                                                        Unsupported media type
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </CardContent>
                                                                    </Card>
                                                                </div>
                                                            </CarouselItem>
                                                        )
                                                    })}
                                                </CarouselContent>
                                                {post.media.length > 1 && (
                                                    <>
                                                        <CarouselPrevious />
                                                        <CarouselNext />
                                                    </>
                                                )}
                                            </Carousel>
                                        </div>
                                    )}
                            </>
                        )}

                        {/* Separator */}
                        {(engagementCounts.likes > 0 || engagementCounts.comments > 0 || engagementCounts.shares > 0) && (
                            <Separator className="my-2" />
                        )}

                        {/* Actions */}
                        <PostActions
                            isLiked={isLiked}
                            isLiking={isLiking}
                            showComments={showComments}
                            likesCount={engagementCounts.likes}
                            commentsCount={engagementCounts.comments}
                            onLike={handleLike}
                            onToggleComments={() => setShowComments(!showComments)}
                            onShare={() => {/* TODO: Implement share functionality */ }}
                            onBookmark={() => {/* TODO: Implement bookmark functionality */ }}
                        />

                        {/* Comments Section */}
                        {showComments && (
                            <div className="mt-3 space-y-3">
                                <Separator />
                                <AddCommentForm postId={post._id || post.id} />
                                {Array.isArray(post.comments) && post.comments.length > 0 && (
                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                        {post.comments.map((comment) => (
                                            <CommentCard
                                                key={comment?._id || comment?.id}
                                                comment={comment}
                                                postId={post._id || post.id}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Post</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this post? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


        </Card>
    )
}
