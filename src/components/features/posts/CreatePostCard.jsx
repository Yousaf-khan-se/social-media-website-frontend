import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createPost } from '@/store/slices/postsSlice'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Image, Smile, MapPin } from 'lucide-react'

export const CreatePostCard = () => {
    const dispatch = useDispatch()
    const { user } = useSelector(state => state.auth)
    const { isLoading } = useSelector(state => state.posts)
    const [content, setContent] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        if (content.trim()) {
            dispatch(createPost({ content }))
            setContent('')
        }
    }

    if (!user) return null

    return (
        <Card>
            <CardContent className="p-4">
                <form onSubmit={handleSubmit}>
                    <div className="flex space-x-4">
                        <Avatar>
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="What's happening?"
                                className="w-full min-h-[120px] p-3 text-lg resize-none border-0 outline-none bg-transparent placeholder:text-muted-foreground"
                                disabled={isLoading}
                            />
                            <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center space-x-4">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-primary hover:bg-primary/10"
                                    >
                                        <Image className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-primary hover:bg-primary/10"
                                    >
                                        <Smile className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-primary hover:bg-primary/10"
                                    >
                                        <MapPin className="h-5 w-5" />
                                    </Button>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm text-muted-foreground">
                                        {280 - content.length}
                                    </span>
                                    <Button
                                        type="submit"
                                        disabled={!content.trim() || isLoading || content.length > 280}
                                        className="rounded-full"
                                    >
                                        {isLoading ? 'Posting...' : 'Post'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
