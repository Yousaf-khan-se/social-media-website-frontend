import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPosts } from '@/store/slices/postsSlice'
import { PostCard } from '@/components/features/posts/PostCard'
import { CreatePostCard } from '@/components/features/posts/CreatePostCard'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

export const HomePage = () => {
    const dispatch = useDispatch()
    const { posts, isLoading, error } = useSelector(state => state.posts)

    useEffect(() => {
        dispatch(fetchPosts({ page: 1 }))
    }, [dispatch])

    return (
        <div className="flex-1 border-r border-border">
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
                <div className="px-4 py-3">
                    <h1 className="text-xl font-semibold">Home</h1>
                </div>
            </div>

            <ScrollArea className="h-[calc(100vh-60px)]">
                <div className="divide-y divide-border">
                    <div className="p-4">
                        <CreatePostCard />
                    </div>

                    <Separator />

                    <div className="divide-y divide-border">
                        {isLoading && posts.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                Loading posts...
                            </div>
                        ) : error ? (
                            <div className="p-8 text-center text-destructive">
                                {Array.isArray(error?.details?.errors)
                                    ? error.details.errors.map((err, idx) => (
                                        <div key={idx}>{err}</div>
                                    ))
                                    : error?.error || error?.message || (typeof error === 'string' ? error : 'Error loading posts')}
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                No posts yet. Start following people to see their posts!
                            </div>
                        ) : (
                            posts.map(post => (
                                <PostCard key={post._id || post.id} post={post} />
                            ))
                        )}
                    </div>
                </div>
            </ScrollArea>
        </div>
    )
}
