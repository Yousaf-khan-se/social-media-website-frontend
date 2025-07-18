import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { getPost, clearCurrentPost } from '@/store/slices/postsSlice'
import { PostCard } from '@/components/features/posts/PostCard'
import { CommentCard, AddCommentForm } from '@/components/features/posts/CommentCard'

export const PostPage = () => {
    const { postId } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { currentPost, isLoading, error } = useSelector(state => state.posts)

    useEffect(() => {
        if (postId) {
            dispatch(getPost(postId))
        }
        return () => {
            dispatch(clearCurrentPost())
        }
    }, [dispatch, postId])

    const handleGoBack = () => {
        navigate(-1)
    }

    if (error) {
        return (
            <div className="flex-1 border-r border-border">
                <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
                    <div className="flex items-center px-4 py-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleGoBack}
                            className="mr-4"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-xl font-semibold">Post</h1>
                    </div>
                </div>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center text-destructive">
                        {Array.isArray(error?.details?.errors)
                            ? error.details.errors.map((err, idx) => (
                                <div key={idx}>{err}</div>
                            ))
                            : error?.error || error?.message || (typeof error === 'string' ? error : 'Failed to load post')}
                    </div>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="flex-1 border-r border-border">
                <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
                    <div className="flex items-center px-4 py-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleGoBack}
                            className="mr-4"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-xl font-semibold">Post</h1>
                    </div>
                </div>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center text-muted-foreground">Loading post...</div>
                </div>
            </div>
        )
    }

    if (!currentPost) {
        return (
            <div className="flex-1 border-r border-border">
                <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
                    <div className="flex items-center px-4 py-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleGoBack}
                            className="mr-4"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-xl font-semibold">Post</h1>
                    </div>
                </div>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center text-muted-foreground">Post not found</div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 border-r border-border">
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
                <div className="flex items-center px-4 py-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleGoBack}
                        className="mr-4"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-semibold">Post</h1>
                </div>
            </div>

            <ScrollArea className="h-[calc(100vh-60px)]">
                <div>
                    {/* Main Post */}
                    <PostCard post={currentPost} />

                    {/* Comments Section */}
                    <div className="border-t border-border">
                        <AddCommentForm postId={currentPost._id || currentPost.id} />

                        {currentPost.comments && currentPost.comments.length > 0 && (
                            <div className="divide-y divide-border">
                                {currentPost.comments.map((comment) => (
                                    <CommentCard
                                        key={comment._id || comment.id}
                                        comment={comment}
                                        postId={currentPost._id || currentPost.id}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </ScrollArea>
        </div>
    )
}
