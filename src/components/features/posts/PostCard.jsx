import React, { useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleLike, deletePost, updatePost } from '@/store/slices/postsSlice'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { CommentCard, AddCommentForm } from './CommentCard'
import {
    Heart,
    MessageCircle,
    Share,
    Bookmark,
    MoreHorizontal,
    HeartHandshake,
    ChevronDown,
    ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const PostCard = ({ post }) => {
    const dispatch = useDispatch()
    const { user } = useSelector(state => state.auth)
    const [isLiking, setIsLiking] = useState(false)
    const [showComments, setShowComments] = useState(false)
    const [showMenu, setShowMenu] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(post.content || '')
    const [showEditHistory, setShowEditHistory] = useState(false)
    const menuRef = useRef(null)

    if (!post) {
        return (
            <Card className="rounded-lg my-2 w-full">
                <CardContent className="p-2 sm:p-4 text-center text-muted-foreground">
                    Post data unavailable.
                </CardContent>
            </Card>
        )
    }

    // Helper to get author display info (handles both populated and non-populated)
    const getAuthorName = () => {
        if (typeof post.author === 'object' && post.author !== null) {
            const first = post.author.firstName || post.author.name || 'Unknown'
            const last = post.author.lastName || ''
            return `${first} ${last}`.trim()
        }
        return 'Unknown'
    }
    const getAuthorUsername = () => {
        if (typeof post.author === 'object' && post.author !== null) {
            return post.author.username || post.author.email || 'unknown'
        }
        return 'unknown'
    }
    const getAuthorAvatar = () => {
        if (typeof post.author === 'object' && post.author !== null) {
            return post.author.profilePicture || ''
        }
        return ''
    }
    const getAuthorInitials = () => {
        if (typeof post.author === 'object' && post.author !== null) {
            const first = post.author.firstName || post.author.name || ''
            const last = post.author.lastName || ''
            return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
        }
        return 'U'
    }

    const handleLike = async () => {
        if (isLiking) return
        setIsLiking(true)

        try {
            await dispatch(toggleLike(post._id || post.id))
        } finally {
            setIsLiking(false)
        }
    }

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            dispatch(deletePost(post._id || post.id))
        }
    }

    const handleEdit = async () => {
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
        }))
    }

    const formatDate = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        const now = new Date()
        const diffInSeconds = Math.floor((now - date) / 1000)

        if (diffInSeconds < 60) return 'now'
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
        return `${Math.floor(diffInSeconds / 86400)}d`
    }

    // Helper to check if user is author
    const authorId = post.author?._id || post.author?.id || post.author
    const userId = user?._id || user?.id
    const isAuthor = userId && authorId && userId.toString() === authorId.toString()

    return (
        <Card className="rounded-lg my-2 w-full">
            <CardContent className="p-2 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-4">
                    <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
                        <AvatarImage src={getAuthorAvatar()} alt={getAuthorName()} />
                        <AvatarFallback>{getAuthorInitials()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm sm:text-base truncate">{getAuthorName()}</span>
                            <span className="text-xs text-muted-foreground truncate">@{getAuthorUsername()}</span>
                            <span className="text-xs text-muted-foreground ml-auto">{formatDate(post.createdAt)}</span>
                            {post.isEdited && (
                                <span className="ml-2 text-xs text-muted-foreground italic flex items-center gap-1">
                                    (edited)
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-5 w-5 p-0"
                                        onClick={() => setShowEditHistory(v => !v)}
                                        aria-label="Show edit history"
                                    >
                                        {showEditHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </Button>
                                </span>
                            )}
                        </div>
                        {showEditHistory && Array.isArray(post.editHistory) && post.editHistory.length > 0 && (
                            <div className="bg-muted rounded p-2 my-2 text-xs max-w-md ml-auto">
                                <div className="font-semibold mb-1">Edit History:</div>
                                <ul className="space-y-1">
                                    {post.editHistory.map((edit, idx) => (
                                        <li key={idx} className="border-b last:border-b-0 pb-1 last:pb-0">
                                            <span className="block text-muted-foreground">{edit.content}</span>
                                            <span className="block text-muted-foreground">
                                                {formatDate(edit.editedAt)}{formatDate(edit.editedAt) !== 'now' ? ' ago' : ''}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {isEditing ? (
                            <div className="mt-1 flex flex-col gap-2">
                                <textarea
                                    className="w-full border rounded p-2 text-sm"
                                    value={editContent}
                                    onChange={e => setEditContent(e.target.value)}
                                    rows={3}
                                />
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={handleEdit} disabled={!editContent.trim()}>Save</Button>
                                    <Button size="sm" variant="secondary" onClick={() => { setIsEditing(false); setEditContent(post.content || '') }}>Cancel</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-1 text-sm sm:text-base break-words whitespace-pre-line">{post.content || ''}</div>
                        )}
                        <div className="flex gap-2 mt-2 flex-wrap">
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={handleLike}
                                disabled={isLiking}
                                aria-label="Like"
                            >
                                <Heart className={cn("h-5 w-5", post.isLiked ? "text-red-500 fill-red-500" : "")} />
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => setShowComments(!showComments)}
                                aria-label="Comment"
                            >
                                <MessageCircle className="h-5 w-5" />
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                aria-label="Share"
                            >
                                <Share className="h-5 w-5" />
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                aria-label="Bookmark"
                            >
                                <Bookmark className="h-5 w-5" />
                            </Button>
                            {isAuthor && (
                                <div className="relative" ref={menuRef}>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8"
                                        onClick={() => setShowMenu(v => !v)}
                                        aria-label="More"
                                    >
                                        <MoreHorizontal className="h-5 w-5" />
                                    </Button>
                                    {showMenu && (
                                        <div className="absolute right-0 z-10 mt-2 w-32 bg-popover border border-border rounded shadow-lg flex flex-col">
                                            <button
                                                className="px-4 py-2 text-left hover:bg-accent"
                                                onClick={() => { setIsEditing(true); setShowMenu(false); }}
                                            >Edit</button>
                                            <button
                                                className="px-4 py-2 text-left text-destructive hover:bg-accent"
                                                onClick={() => { setShowMenu(false); handleDelete(); }}
                                            >Delete</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {showComments && (
                            <div className="mt-2">
                                <AddCommentForm postId={post._id || post.id} />
                                {Array.isArray(post.comments) && post.comments.length > 0 && (
                                    <div className="max-h-60 overflow-y-auto">
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
        </Card>
    )
}
