import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { toggleLike, deletePost } from '@/store/slices/postsSlice'
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
    HeartHandshake
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const PostCard = ({ post }) => {
    const dispatch = useDispatch()
    const { user } = useSelector(state => state.auth)
    const [isLiking, setIsLiking] = useState(false)
    const [showComments, setShowComments] = useState(false)

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
        <Card className="border-0 border-b border-border rounded-none">
            <CardContent className="p-4">
                <div className="flex space-x-3">
                    <Link to={`/profile/${post.author._id || post.author.id}`}>
                        <Avatar>
                            <AvatarImage src={post.author.profilePicture} alt={`${post.author.firstName} ${post.author.lastName}`} />
                            <AvatarFallback>{post.author.firstName?.charAt(0)}{post.author.lastName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </Link>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                            <Link
                                to={`/profile/${post.author._id || post.author.id}`}
                                className="font-semibold hover:underline"
                            >
                                {post.author.firstName} {post.author.lastName}
                            </Link>
                            <span className="text-muted-foreground">@{post.author.username}</span>
                            <span className="text-muted-foreground">·</span>
                            <Link
                                to={`/post/${post._id || post.id}`}
                                className="text-muted-foreground hover:underline"
                            >
                                {formatDate(post.createdAt)}
                            </Link>
                            <div className="flex-1" />
                            {user && (user._id === post.author._id || user.id === post.author.id) && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={handleDelete}
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        <div className="mb-3">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {post.content}
                            </p>
                        </div>

                        {post.images && post.images.length > 0 && (
                            <div className="mb-3 rounded-lg overflow-hidden">
                                <img
                                    src={post.images[0]}
                                    alt="Post image"
                                    className="w-full h-auto max-h-96 object-cover"
                                />
                            </div>
                        )}

                        <div className="flex items-center justify-between max-w-md">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                                onClick={() => setShowComments(!showComments)}
                            >
                                <MessageCircle className="h-4 w-4 mr-1" />
                                <span className="text-sm">{post.commentsCount || 0}</span>
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-green-600 hover:bg-green-600/10"
                            >
                                <Share className="h-4 w-4 mr-1" />
                                <span className="text-sm">{post.sharesCount || 0}</span>
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLike}
                                disabled={isLiking}
                                className={cn(
                                    "text-muted-foreground hover:text-red-600 hover:bg-red-600/10",
                                    post.isLiked && "text-red-600"
                                )}
                            >
                                {post.isLiked ? (
                                    <HeartHandshake className="h-4 w-4 mr-1 fill-current" />
                                ) : (
                                    <Heart className="h-4 w-4 mr-1" />
                                )}
                                <span className="text-sm">{post.likesCount || 0}</span>
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-blue-600 hover:bg-blue-600/10"
                            >
                                <Bookmark className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Comments Section */}
                {showComments && (
                    <div className="mt-4 border-t border-border">
                        <AddCommentForm postId={post._id || post.id} />
                        {post.comments && post.comments.length > 0 && (
                            <div className="max-h-60 overflow-y-auto">
                                {post.comments.map((comment) => (
                                    <CommentCard
                                        key={comment._id || comment.id}
                                        comment={comment}
                                        postId={post._id || post.id}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
