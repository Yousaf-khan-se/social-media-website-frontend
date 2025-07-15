import React, { useState, useRef, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
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
import { useForm, FormProvider } from 'react-hook-form'

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

// Enhanced Post Stats Component
const PostStats = ({ likesCount, commentsCount, sharesCount }) => {
    if (likesCount === 0 && commentsCount === 0 && sharesCount === 0) return null

    return (
        <div className="flex items-center gap-4 text-sm text-muted-foreground py-2">
            {likesCount > 0 && (
                <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-red-500" />
                    {formatEngagementCount(likesCount)}
                </span>
            )}
            {commentsCount > 0 && (
                <span className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    {formatEngagementCount(commentsCount)}
                </span>
            )}
            {sharesCount > 0 && (
                <span className="flex items-center gap-1">
                    <Share className="h-4 w-4" />
                    {formatEngagementCount(sharesCount)}
                </span>
            )}
        </div>
    )
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
const AuthorMenu = ({ isAuthor, onEdit, onDelete, onUploadMedia }) => {
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
                <DropdownMenuItem onClick={onUploadMedia}>
                    Upload Media
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

// Enhanced Media Upload Dialog
const MediaUploadDialog = ({
    isOpen,
    onOpenChange,
    mediaFiles,
    onFileChange,
    onUpload,
    isUploading,
    errorMsg,
    inputRef,
    onRemoveFile
}) => {
    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Upload Media</AlertDialogTitle>
                    <AlertDialogDescription>
                        Select up to {MAX_FILES} files to upload for this post (max {MAX_FILE_SIZE_MB}MB each).
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4">
                    <Input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={onFileChange}
                        disabled={isUploading}
                        ref={inputRef}
                        className="file:mr-2 file:rounded file:border-none file:bg-accent file:text-accent-foreground"
                    />

                    {errorMsg && (
                        <p className="text-sm text-destructive">{errorMsg}</p>
                    )}

                    {mediaFiles.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Selected Files:</p>
                            <div className="flex flex-wrap gap-2">
                                {mediaFiles.map((file, idx) => (
                                    <Badge key={idx} variant="secondary" className="gap-2">
                                        <span className="truncate max-w-[120px]">{file.name}</span>
                                        <button
                                            type="button"
                                            className="text-xs text-destructive hover:text-destructive/80"
                                            onClick={() => onRemoveFile(idx)}
                                            aria-label={`Remove ${file.name}`}
                                        >
                                            ×
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onUpload}
                        disabled={mediaFiles.length === 0 || isUploading}
                    >
                        {isUploading ? 'Uploading...' : 'Upload'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

// Main PostCard Component
export const PostCard = ({ post }) => {
    const dispatch = useDispatch()
    const { user } = useSelector(state => state.auth)

    // State management
    const [mediaFiles, setMediaFiles] = useState([])
    const [isUploading, setIsUploading] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")
    const [isLiking, setIsLiking] = useState(false)
    const [showComments, setShowComments] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(post?.content || '')
    const [showEditHistory, setShowEditHistory] = useState(false)
    const [showMediaUpload, setShowMediaUpload] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const inputRef = useRef(null)

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

    const handleDelete = useCallback(() => {
        dispatch(deletePost(post._id || post.id))
        setShowDeleteConfirm(false)
    }, [dispatch, post._id, post.id])

    const handleFileChange = useCallback((e) => {
        const newFiles = Array.from(e.target.files)
        const totalFiles = mediaFiles.length + newFiles.length

        if (totalFiles > MAX_FILES) {
            setErrorMsg(`You can only upload up to ${MAX_FILES} files.`)
            if (inputRef.current) inputRef.current.value = ""
            return
        }

        const validFiles = []
        const errors = []

        newFiles.forEach(file => {
            if (file.size <= MAX_FILE_SIZE_MB * 1024 * 1024) {
                validFiles.push(file)
            } else {
                errors.push(`${file.name} exceeds ${MAX_FILE_SIZE_MB}MB`)
            }
        })

        if (errors.length > 0) {
            setErrorMsg(errors.join(", "))
        } else {
            setErrorMsg("")
        }

        setMediaFiles(prev => [...prev, ...validFiles])
    }, [mediaFiles.length])

    const handleMediaUpload = useCallback(async (e) => {
        e.preventDefault();
        if (mediaFiles.length === 0) return

        setErrorMsg("")
        setIsUploading(true)

        const formData = new FormData()
        mediaFiles.forEach(file => formData.append('media', file))

        try {
            await dispatch(uploadPostMedia({ id: post._id || post.id, media: formData })).unwrap();
            setMediaFiles([])
            setShowMediaUpload(false)
        } catch (err) {
            setErrorMsg("Media upload failed. Please try again.", err)
        }

        setIsUploading(false);
    }, [dispatch, mediaFiles, post._id, post.id])

    const handleRemoveFile = useCallback((index) => {
        setMediaFiles(prev => {
            const updated = prev.filter((_, i) => i !== index)
            if (inputRef.current) {
                const dt = new DataTransfer()
                updated.forEach(f => dt.items.add(f))
                inputRef.current.files = dt.files
            }
            return updated
        })
    }, [])

    const handleEdit = useCallback(async () => {
        if (!editContent.trim()) return

        setIsEditing(false)
        await dispatch(updatePost({
            id: post._id || post.id,
            postData: {
                content: editContent,
                isEdited: true,
                editHistory: [
                    ...(post.editHistory || []),
                    { content: editContent, editedAt: new Date().toISOString() }
                ]
            }
        })).unwrap();
    }, [dispatch, editContent, post._id, post.id, post.editHistory])

    const handleCancelEdit = useCallback(() => {
        setIsEditing(false)
        setEditContent(post.content || '')
    }, [post.content])

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
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={authorInfo.avatar} alt={authorInfo.name} />
                        <AvatarFallback>{authorInfo.initials}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-sm truncate">{authorInfo.name}</span>
                                <span className="text-xs text-muted-foreground truncate">
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
                                onEdit={() => setIsEditing(true)}
                                onDelete={() => setShowDeleteConfirm(true)}
                                onUploadMedia={() => setShowMediaUpload(true)}
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
                            <div className="mt-3 space-y-2">
                                <textarea
                                    className="w-full border rounded-md p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                                    value={editContent}
                                    onChange={e => setEditContent(e.target.value)}
                                    rows={3}
                                    maxLength={2000}
                                    placeholder="What's on your mind?"
                                />
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">
                                        {editContent.length}/2000
                                    </span>
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={handleEdit} disabled={!editContent.trim()}>
                                            Save
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="mt-2 text-sm break-words whitespace-pre-line">
                                    {post.content}
                                </div>

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

                                {/* Media Carousel */}
                                {Array.isArray(post.media) && post.media.length > 0 && (
                                    <div className="mt-3">
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

                        {/* Engagement Stats */}
                        <PostStats
                            likesCount={engagementCounts.likes}
                            commentsCount={engagementCounts.comments}
                            sharesCount={engagementCounts.shares}
                        />

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
                                            console.log('Rendering comment:', comment),
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

            {/* Media Upload Dialog */}
            <MediaUploadDialog
                isOpen={showMediaUpload}
                onOpenChange={setShowMediaUpload}
                mediaFiles={mediaFiles}
                onFileChange={handleFileChange}
                onUpload={handleMediaUpload}
                isUploading={isUploading}
                errorMsg={errorMsg}
                inputRef={inputRef}
                onRemoveFile={handleRemoveFile}
            />
        </Card>
    )
}
