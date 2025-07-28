import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addComment, addCommentReply, deleteCommentReply } from '@/store/slices/postsSlice'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trash2 } from 'lucide-react'

export const CommentReplyCard = ({ commentReply, commentId, postId }) => {
    const dispatch = useDispatch()
    const { user } = useSelector(state => state.auth)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this comment reply reply?')) {
            setIsDeleting(true)
            try {
                dispatch(deleteCommentReply({ postId, commentId: commentId, replyId: (commentReply._id || commentReply.id) }))
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

    return (
        <div className="flex space-x-3 p-3 border-b border-border">
            <Avatar className="h-8 w-8">
                <AvatarImage src={commentReply.user?.profilePicture} alt={`${commentReply.user?.firstName} ${commentReply.user?.lastName}`} />
                <AvatarFallback className="text-xs">{commentReply.user?.firstName?.charAt(0)}{commentReply.user?.lastName?.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-sm">{commentReply.user?.firstName} {commentReply.user?.lastName}</span>
                    <span className="text-muted-foreground text-sm">@{commentReply.user?.username}</span>
                    <span className="text-muted-foreground text-sm">·</span>
                    <span className="text-muted-foreground text-sm">{formatDate(commentReply.createdAt)}</span>
                    <div className="flex-1" />
                    {user && (user._id === commentReply.user?._id || user.id === commentReply.user?.id) && (
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

                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {commentReply.content}
                </p>
            </div>
        </div>
    )
}

export const AddCommentReplyForm = ({ postId, commentId }) => {
    const dispatch = useDispatch()
    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!content.trim()) return

        setIsSubmitting(true)
        try {
            if (commentId) {
                // This is a reply to a comment
                await dispatch(addCommentReply({
                    postId,
                    commentId,
                    commentReply: { content: content.trim() }
                }))
            } else {
                // This is a regular comment
                await dispatch(addComment({ postId, comment: { content: content.trim() } }))
            }
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
                    placeholder={commentId ? "Add a reply..." : "Add a comment..."}
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
                        {isSubmitting ? 'Posting...' : (commentId ? 'Reply' : 'Comment')}
                    </Button>
                </div>
            </div>
        </form>
    )
}
