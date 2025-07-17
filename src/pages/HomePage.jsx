import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPosts, resetPosts } from '@/store/slices/postsSlice'
import { PostCard } from '@/components/features/posts/PostCard'
import { CreatePostCard } from '@/components/features/posts/CreatePostCard'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

export const HomePage = () => {
    const dispatch = useDispatch()
    const { posts, isLoading, error } = useSelector(state => state.posts)

    useEffect(() => {
        dispatch(resetPosts());
        dispatch(fetchPosts({ page: 1 }))
    }, [dispatch])

    return (
        <div className="flex-1 border-r border-border max-w-full w-full md:max-w-2xl mx-auto bg-background">
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
                <div className="px-3 py-2 sm:px-4 sm:py-3">
                    <h1 className="text-lg sm:text-xl font-semibold">Home</h1>
                </div>
            </div>

            <ScrollArea className="h-[calc(100vh-60px)] md:h-auto">
                <div className="divide-y divide-border">
                    <div className="p-2 sm:p-4">
                        <CreatePostCard />
                    </div>

                    <Separator />

                    <div className="divide-y divide-border">
                        {isLoading && posts.length === 0 ? (
                            <div className="p-6 sm:p-8 text-center text-muted-foreground text-base sm:text-lg">
                                Loading posts...
                            </div>
                        ) : error ? (
                            <div className="p-6 sm:p-8 text-center text-destructive text-base sm:text-lg">
                                {Array.isArray(error?.details?.errors)
                                    ? error.details.errors.map((e, i) => <div key={i}>{e.message}</div>)
                                    : error?.message || 'Failed to load posts.'}
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
