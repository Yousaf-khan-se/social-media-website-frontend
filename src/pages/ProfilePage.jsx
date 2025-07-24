import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Calendar, Edit, Camera } from 'lucide-react'
import { getUserPosts, getMyPosts, resetPosts } from '@/store/slices/postsSlice'
import { PostCard } from '@/components/features/posts/PostCard'
import { updateProfile, uploadProfilePicture } from '@/store/slices/authSlice'

export const ProfilePage = () => {
    const { userId } = useParams()
    const { user, error } = useSelector(state => state.auth)
    const { posts, isLoading: postsLoading } = useSelector(state => state.posts)
    const dispatch = useDispatch()
    const [editOpen, setEditOpen] = useState(false)
    const [form, setForm] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        username: user?.username || '',
        email: user?.email || '',
        bio: user?.bio || ''
    })
    const [formError, setFormError] = useState(null)
    const [formLoading, setFormLoading] = useState(false)
    const [uploadingProfilePicture, setUploadingProfilePicture] = useState(false)

    // Determine if viewing own profile or another user's profile
    const isOwnProfile = !userId || userId === user?._id || userId === user?.id

    React.useEffect(() => {
        if (user) {
            setForm({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                username: user.username || '',
                email: user.email || '',
                bio: user.bio || '',
            })
        }
    }, [user])

    // Fetch posts when component mounts or userId changes
    useEffect(() => {
        dispatch(resetPosts());
        if (isOwnProfile) {
            dispatch(getMyPosts({ page: 1, limit: 10 }))
        } else if (userId) {
            dispatch(getUserPosts({ userId, page: 1, limit: 10 }))
        }
    }, [dispatch, userId, isOwnProfile])

    const handleEditOpen = () => {
        setEditOpen(true)
        setFormError(null)
    }
    const handleEditClose = () => {
        setEditOpen(false)
        setFormError(null)
    }
    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }
    const handleSubmit = async e => {
        e.preventDefault()
        setFormLoading(true)
        setFormError(null)
        try {
            const resultAction = await dispatch(updateProfile(form))
            if (updateProfile.fulfilled.match(resultAction)) {
                setEditOpen(false)
            } else {
                setFormError(resultAction.payload?.error || resultAction.error?.message || 'Update failed')
            }
        } catch (err) {
            setFormError(err.message || 'Update failed')
        } finally {
            setFormLoading(false)
        }
    }

    const handleProfilePictureUpload = async (event) => {
        const file = event.target.files[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file')
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB')
            return
        }

        setUploadingProfilePicture(true)
        try {
            const formData = new FormData()
            formData.append('profilePicture', file)

            const resultAction = await dispatch(uploadProfilePicture(formData))
            if (uploadProfilePicture.fulfilled.match(resultAction)) {
                // Success - the Redux state will be updated automatically
            } else {
                alert(resultAction.payload?.error || 'Failed to upload profile picture')
            }
        } catch {
            alert('Failed to upload profile picture')
        } finally {
            setUploadingProfilePicture(false)
        }
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center text-destructive">
                    {Array.isArray(error?.details?.errors)
                        ? error.details.errors.map((err, idx) => (
                            <div key={idx}>{err}</div>
                        ))
                        : error?.error || error?.message || (typeof error === 'string' ? error : 'Failed to load profile')}
                </div>
            </div>
        )
    }

    if (!user) {
        return <div>Loading...</div>
    }

    return (
        <div className="flex-1 border-r border-border">
            {/* Edit Profile Modal (custom implementation) */}
            {editOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6 relative">
                        <h2 className="text-lg font-semibold mb-4">Edit Profile</h2>
                        <button
                            className="absolute top-2 right-2 text-xl text-muted-foreground hover:text-destructive"
                            onClick={handleEditClose}
                            aria-label="Close"
                            type="button"
                        >
                            ×
                        </button>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
                            <input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
                            <input name="username" placeholder="Username" value={form.username} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
                            <input name="email" placeholder="Email" type="email" value={form.email} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
                            <textarea name="bio" placeholder="Bio (max 500 characters)" value={form.bio} onChange={handleChange} maxLength={500} className="w-full border rounded px-3 py-2" />
                            {formError && <div className="text-destructive text-sm">{Array.isArray(formError) ? formError.map((err, i) => <div key={i}>{err}</div>) : formError}</div>}
                            <div className="flex justify-end gap-2 mt-2">
                                <button type="button" className="px-4 py-2 border rounded" onClick={handleEditClose} disabled={formLoading}>Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded" disabled={formLoading}>{formLoading ? 'Saving...' : 'Save'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
                <div className="flex items-center justify-between px-4 py-3">
                    <div>
                        <h1 className="text-xl font-semibold">{user.firstName} {user.lastName}</h1>
                        <p className="text-sm text-muted-foreground">
                            {posts ? posts.length : 0} posts
                        </p>
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
                                    <AvatarImage src={user.profilePicture} alt={`${user.firstName} ${user.lastName}`} />
                                    <AvatarFallback className="text-2xl">{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                {isOwnProfile && (
                                    <div className="absolute bottom-2 right-2">
                                        <label className="cursor-pointer">
                                            <div className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-2 shadow-lg transition-colors">
                                                <Camera className="h-4 w-4" />
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleProfilePictureUpload}
                                                className="hidden"
                                                disabled={uploadingProfilePicture}
                                            />
                                        </label>
                                        {uploadingProfilePicture && (
                                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                                <div className="text-white text-xs">Uploading...</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {isOwnProfile && (
                                <Button variant="outline" className="mb-4" onClick={handleEditOpen}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Profile
                                </Button>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div>
                                <h2 className="text-2xl font-bold">{user.firstName} {user.lastName}</h2>
                                <p className="text-muted-foreground">@{user.username}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>

                            <p className="text-sm leading-relaxed">
                                {user.bio || "No bio yet"}
                            </p>

                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                                </div>
                                {user.isVerified && (
                                    <div className="text-blue-500">
                                        ✓ Verified
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-6 text-sm">
                                <div>
                                    <span className="font-semibold">{user.following?.length || 0}</span>
                                    <span className="text-muted-foreground ml-1">Following</span>
                                </div>
                                <div>
                                    <span className="font-semibold">{user.followers?.length || 0}</span>
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
                                {isOwnProfile ? "You haven't posted anything yet" : "No posts yet"}
                            </div>
                        )}
                    </div>
                </div>
            </ScrollArea>
        </div>
    )
}
