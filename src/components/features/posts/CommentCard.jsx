import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addComment, deleteComment } from '@/store/slices/postsSlice'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Trash2, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AddCommentReplyForm, CommentReplyCard } from './CommentReplyCard'

export const CommentCard = ({ comment, postId }) => {
    const dispatch = useDispatch()
    const { user } = useSelector(state => state.auth)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showReplies, setShowReplies] = useState(false)

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            setIsDeleting(true)
            try {
                await dispatch(deleteComment({ postId, commentId: comment._id || comment.id }))
            } finally {
                setIsDeleting(false)
            }
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInSeconds = Math.floor((now - date) / 1000)

        if (diffInSeconds < 60) return 'now'
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
        return `${Math.floor(diffInSeconds / 86400)}d`
    }

    const formatEngagementCount = (count) => {
        if (count >= 1000000) {
            return `${(count / 1000000).toFixed(1)}M`
        } else if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}K`
        }
        return count.toString()
    }

    const repliesCount = comment.replies?.length || 0

    return (
        <div className="flex space-x-3 p-3 border-b border-border">
            <Avatar className="h-8 w-8">
                <AvatarImage src={comment.user?.profilePicture} alt={`${comment.user?.firstName} ${comment.user?.lastName}`} />
                <AvatarFallback className="text-xs">{comment.user?.firstName?.charAt(0)}{comment.user?.lastName?.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-sm">{comment.user?.firstName} {comment.user?.lastName}</span>
                    <span className="text-muted-foreground text-sm">@{comment.user?.username}</span>
                    <span className="text-muted-foreground text-sm">·</span>
                    <span className="text-muted-foreground text-sm">{formatDate(comment.createdAt)}</span>
                    <div className="flex-1" />
                    {user && (user._id === comment.user?._id || user.id === comment.user?.id) && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    )}
                </div>

                <p className="text-sm leading-relaxed whitespace-pre-wrap mb-2">
                    {comment.content}
                </p>

                {/* Reply button */}
                <div className="flex items-center">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 gap-1 text-muted-foreground hover:text-blue-500"
                        onClick={() => setShowReplies(!showReplies)}
                        aria-label="Toggle replies"
                    >
                        <MessageCircle className={cn("h-4 w-4", showReplies ? "text-blue-500" : "")} />
                        {repliesCount > 0 && (
                            <span className="text-xs">{formatEngagementCount(repliesCount)}</span>
                        )}
                        <span className="text-xs ml-1">Reply</span>
                    </Button>
                </div>

                {/* Replies Section */}
                {showReplies && (
                    <div className="mt-3 space-y-3">
                        <Separator />
                        {Array.isArray(comment.replies) && comment.replies.length > 0 && (
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {comment.replies.map((reply) => (
                                    <CommentReplyCard
                                        key={reply?._id || reply?.id}
                                        commentReply={reply}
                                        postId={postId}
                                        commentId={comment._id || comment.id}
                                    />
                                ))}
                            </div>
                        )}
                        <AddCommentReplyForm postId={postId} commentId={comment._id || comment.id} />
                    </div>
                )}
            </div>
        </div>
    )
}

export const AddCommentForm = ({ postId }) => {
    const dispatch = useDispatch()
    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!content.trim()) return

        setIsSubmitting(true)
        try {
            await dispatch(addComment({ postId, comment: { content: content.trim() } }))
            setContent('')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex space-x-3 p-3 border-b border-border">
            <div className="flex-1">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full resize-none border rounded-md p-2 text-sm"
                    rows={2}
                    disabled={isSubmitting}
                />
                <div className="flex justify-end mt-2">
                    <Button
                        type="submit"
                        size="sm"
                        disabled={!content.trim() || isSubmitting}
                    >
                        {isSubmitting ? 'Posting...' : 'Comment'}
                    </Button>
                </div>
            </div>
        </form>
    )
}
