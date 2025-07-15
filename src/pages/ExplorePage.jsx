import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, TrendingUp, Hash } from 'lucide-react'
import { getExplore, searchPosts, getTrendingTopics, getSuggestedUsers, resetPosts } from '@/store/slices/postsSlice'
import { followUser } from '@/store/slices/profileSlice'
import { PostCard } from '@/components/features/posts/PostCard'
import { clearError, clearProfiles, searchUsers } from '@/store/slices/profileListSlice'

export const ExplorePage = () => {
    const dispatch = useDispatch()
    const {
        posts,
        isLoading,
        trendingTopics,
        suggestedUsers,
        isLoadingTrending,
        isLoadingSuggested
    } = useSelector(state => state.posts)

    const {
        profiles,
        isLoadingProfiles,
        error: ProfileLoadingError
    } = useSelector(state => state.profileList)

    const [searchQuery, setSearchQuery] = useState('')
    const [suggestedUserList, setSuggestedUserList] = useState([]);

    // Load explore posts, trending topics, and suggested users on mount
    useEffect(() => {
        if (searchQuery.trim() === '') {
            dispatch(resetPosts());
            dispatch(getExplore({ page: 1, limit: 10 }));
            dispatch(getTrendingTopics());

            const fetchSuggestedUsers = async () => {
                dispatch(clearProfiles());
                dispatch(clearError());
                await dispatch(getSuggestedUsers()).unwrap();
                setSuggestedUserList(suggestedUsers);
            };

            fetchSuggestedUsers();
        }
    }, [dispatch, searchQuery, suggestedUsers]);

    useEffect(() => {
        if (!isLoadingProfiles && profiles.length > 0) {
            setSuggestedUserList(profiles);
        }
    }, [isLoadingProfiles, profiles]);


    // Handle search
    const handleSearch = async (e) => {
        e.preventDefault()
        if (!searchQuery.trim()) return

        try {
            dispatch(searchUsers({ query: searchQuery.trim(), page: 1, limit: 10 }))
            await dispatch(searchPosts({ query: searchQuery.trim(), page: 1, limit: 10 })).unwrap();
        } catch (error) {
            console.error('Search error:', error)
        }
    }

    // Handle trending topic click
    const handleTopicClick = (topic) => {
        setSearchQuery(topic)
        dispatch(searchPosts({ query: topic, page: 1, limit: 10 }))
    }

    // Handle follow user
    const handleFollowUser = async (userId) => {
        try {
            await dispatch(followUser(userId))
            // Refresh suggested users list
            dispatch(getSuggestedUsers())
        } catch (error) {
            console.error('Follow error:', error)
        }
    }

    return (
        <div className="flex-1 border-r border-border">
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
                <div className="px-4 py-3">
                    <h1 className="text-xl font-semibold">Explore</h1>
                </div>
            </div>

            <ScrollArea className="h-[calc(100vh-60px)]">
                <div className="p-4 space-y-6">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search for posts, people, or topics..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>

                    {/* Trending Topics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Trending Topics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {isLoadingTrending ? (
                                <div className="text-center text-muted-foreground py-4">Loading trends...</div>
                            ) : trendingTopics && trendingTopics.length > 0 ? (
                                trendingTopics.map((topic, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer"
                                        onClick={() => handleTopicClick(topic.tag || topic.name)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Hash className="h-4 w-4 text-primary" />
                                            <div>
                                                <p className="font-medium">{topic.tag || topic.name}</p>
                                                <p className="text-sm text-muted-foreground">{topic.posts || topic.count || 0} posts</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-muted-foreground py-4">No trending topics yet</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Suggested People */}
                    <Card>
                        <CardHeader>
                            <CardTitle>People you might know</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {isLoadingSuggested || isLoadingProfiles ? (
                                <div className="text-center text-muted-foreground py-4">Loading suggestions...</div>
                            ) : suggestedUserList && suggestedUserList.length > 0 ? (
                                suggestedUserList.map((user) => (
                                    <div key={user._id || user.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={user.profilePicture} alt={`${user.firstName} ${user.lastName}`} />
                                                <AvatarFallback>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{user.firstName} {user.lastName}</p>
                                                <p className="text-sm text-muted-foreground">@{user.username}</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleFollowUser(user._id || user.id)}
                                        >
                                            Follow
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <>
                                    {ProfileLoadingError ? (
                                        <div className="text-center text-muted-foreground py-4">{ProfileLoadingError || ProfileLoadingError.error || ProfileLoadingError.message || 'Error loading suggestions'}</div>
                                    ) : (
                                        <div className="text-center text-muted-foreground py-4">No suggestions yet</div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Posts */}
                    <div className="space-y-0">
                        {isLoading ? (
                            <div className="text-center text-muted-foreground py-8">
                                Loading posts...
                            </div>
                        ) : posts && posts.length > 0 ? (
                            posts.map((post) => (
                                <PostCard key={post._id || post.id} post={post} />
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground py-8">
                                {searchQuery ? 'No posts found for your search.' : 'No posts to explore yet.'}
                            </div>
                        )}
                    </div>
                </div>
            </ScrollArea>
        </div>
    )
}
