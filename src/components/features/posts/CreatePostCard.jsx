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
            <CardContent className="p-2 sm:p-4">
                <form onSubmit={handleSubmit}>
                    <div className="flex space-x-2 sm:space-x-4">
                        <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="What's happening?"
                                className="w-full min-h-[60px] sm:min-h-[120px] p-2 sm:p-3 text-base sm:text-lg resize-none border-0 outline-none bg-transparent placeholder:text-muted-foreground"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end mt-2">
                        <Button type="submit" size="sm" className="w-full sm:w-auto">
                            {isLoading ? 'Posting...' : 'Post'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
