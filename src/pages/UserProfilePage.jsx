import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Calendar, ArrowLeft, UserPlus, UserMinus, CheckCircle, X } from 'lucide-react'
import { getUserPosts, resetPosts } from '@/store/slices/postsSlice'
import { fetchProfile } from '@/store/slices/profileSlice'
import { followUser, unfollowUser } from '@/store/slices/authSlice'
import { PostCard } from '@/components/features/posts/PostCard'
import { useToast } from '@/hooks/use-toast'

export const UserProfilePage = () => {
    const { userId } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { toast } = useToast()

    const { user: currentUser } = useSelector(state => state.auth)
    const { currentProfile, isLoading: profileLoading, error, visibility } = useSelector(state => state.profile)
    const { posts, isLoading: postsLoading } = useSelector(state => state.posts)

    const [isFollowing, setIsFollowing] = useState(false)
    const [isFollowLoading, setIsFollowLoading] = useState(false)
    const [followersCount, setFollowersCount] = useState(0)

    // Redirect to own profile if trying to view own profile
    useEffect(() => {
        if (userId === currentUser?._id || userId === currentUser?.id) {
            navigate('/profile')
            return
        }
    }, [userId, currentUser, navigate])

    // Fetch profile and posts when component mounts or userId changes
    useEffect(() => {
        if (userId && userId !== currentUser?._id && userId !== currentUser?.id) {
            dispatch(resetPosts())
            dispatch(fetchProfile(userId))
            dispatch(getUserPosts({ userId, page: 1, limit: 10 }))
        }
    }, [dispatch, userId, currentUser])

    // Update following state when profile loads
    useEffect(() => {
        if (currentProfile && currentUser) {
            const isCurrentlyFollowing = currentProfile.followers?.some(
                follower => follower._id === currentUser._id || follower._id === currentUser.id
            ) || false
            setIsFollowing(isCurrentlyFollowing)
            setFollowersCount(currentProfile.followers?.length || 0)
        }
    }, [currentProfile, currentUser])

    const handleFollowToggle = async () => {
        if (!currentProfile || !currentUser) return

        setIsFollowLoading(true)
        try {
            if (isFollowing) {
                await dispatch(unfollowUser(currentProfile._id || currentProfile.id)).unwrap()
                setIsFollowing(false)
                setFollowersCount(prev => prev - 1)
                toast({
                    title: "Unfollowed",
                    description: `You unfollowed ${currentProfile.firstName} ${currentProfile.lastName}`,
                    icon: <X className="h-4 w-4" />,
                    duration: 3000
                })
            } else {
                await dispatch(followUser(currentProfile._id || currentProfile.id)).unwrap()
                setIsFollowing(true)
                setFollowersCount(prev => prev + 1)
                toast({
                    title: "Following",
                    description: `You are now following ${currentProfile.firstName} ${currentProfile.lastName}`,
                    duration: 5000,
                    icon: <CheckCircle className="h-4 w-4" />,
                    variant: 'success'
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error.error || "Failed to update follow status",
                variant: "destructive",
                duration: 3000,
                icon: <X className="h-4 w-4" />
            })
        } finally {
            setIsFollowLoading(false)
        }
    }

    const handleBack = () => {
        navigate(-1)
    }

    if (error) {
        return (
            <div className="flex-1 border-r border-border">
                <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
                    <div className="flex items-center px-4 py-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBack}
                            className="mr-3"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-xl font-semibold">Profile</h1>
                    </div>
                </div>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center text-destructive">
                        {error?.error || error?.message || 'Failed to load profile'}
                    </div>
                </div>
            </div>
        )
    }

    if (profileLoading || !currentProfile) {
        return (
            <div className="flex-1 border-r border-border">
                <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
                    <div className="flex items-center px-4 py-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBack}
                            className="mr-3"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-xl font-semibold">Profile</h1>
                    </div>
                </div>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="text-lg">Loading currentProfile...</div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 border-r border-border">
            {/* Header with back button */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBack}
                            className="mr-3"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-semibold">{currentProfile.firstName} {currentProfile.lastName}</h1>
                            <p className="text-sm text-muted-foreground">
                                {posts ? posts.length : 0} posts
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <ScrollArea className="h-[calc(100vh-60px)]">
                <div>
                    {/* Cover Photo */}
                    <div className="h-48 bg-gradient-to-r from-primary to-primary/80 relative">
                        <div className="absolute inset-0 bg-black/20" />
                    </div>

                    {/* Profile Info */}
                    <div className="px-4 pb-4">
                        <div className="flex items-end justify-between -mt-16 mb-4">
                            <div className="relative">
                                <Avatar className="h-32 w-32 border-4 border-background">
                                    <AvatarImage src={currentProfile.profilePicture} alt={`${currentProfile.firstName} ${currentProfile.lastName}`} />
                                    <AvatarFallback className="text-2xl">
                                        {currentProfile.firstName?.charAt(0)}{currentProfile.lastName?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                            </div>

                            {/* Follow Button */}
                            <Button
                                onClick={handleFollowToggle}
                                disabled={isFollowLoading}
                                variant={isFollowing ? "outline" : "default"}
                                className="mb-4"
                            >
                                {isFollowLoading ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                ) : isFollowing ? (
                                    <>
                                        <UserMinus className="h-4 w-4 mr-2" />
                                        Unfollow
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Follow
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <h2 className="text-2xl font-bold">{currentProfile.firstName} {currentProfile.lastName}</h2>
                                <p className="text-muted-foreground">@{currentProfile.username}</p>
                                <p className="text-sm text-muted-foreground">{visibility === 'private' ? "Private Account" : currentProfile.email}</p>
                            </div>

                            <p className="text-sm leading-relaxed">
                                {currentProfile.bio || "No bio yet"}
                            </p>

                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>Joined {new Date(currentProfile.createdAt).toLocaleDateString()}</span>
                                </div>
                                {currentProfile.isVerified && (
                                    <div className="text-blue-500">
                                        ✓ Verified
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-6 text-sm">
                                <div>
                                    <span className="font-semibold">{currentProfile.following?.length || 0}</span>
                                    <span className="text-muted-foreground ml-1">Following</span>
                                </div>
                                <div>
                                    <span className="font-semibold">{followersCount}</span>
                                    <span className="text-muted-foreground ml-1">Followers</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Posts */}
                    <div className="p-4">
                        <h3 className="text-lg font-semibold mb-4">Posts</h3>
                        {postsLoading ? (
                            <div className="text-center text-muted-foreground py-8">
                                Loading posts...
                            </div>
                        ) : posts && posts.length > 0 ? (
                            <div className="space-y-0">
                                {posts.map((post) => (
                                    <PostCard key={post._id || post.id} post={post} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground py-8">
                                No posts yet
                            </div>
                        )}
                    </div>
                </div>
            </ScrollArea>
        </div>
    )
}
