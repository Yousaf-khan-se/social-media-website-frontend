import React, { useState, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createPost, uploadPostMedia, clearUploadMediaError, clearUploadMediaSuccess } from '@/store/slices/postsSlice'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle, X, Send, Loader2, AlertCircle, Ellipsis } from 'lucide-react'
import TiptapEditor from '@/components/editor/TiptapEditor'
import {
    validateContent,
    prepareContentForApi,
    generateContentSummary,
    isHtmlEmpty
} from '@/utils/editorUtils'

export const CreatePostCard = () => {
    const dispatch = useDispatch()
    const { user } = useSelector(state => state.auth)
    const { uploadingMedia, uploadMediaError, uploadMediaSuccess } = useSelector(state => state.posts)

    const { isLoading } = useSelector(state => state.posts)
    const [content, setContent] = useState('<p></p>')
    const [isUploading, setIsUploading] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")
    const [mediaFiles, setMediaFiles] = useState([]) // Store actual files for upload
    const [mediaUrlToFileMap, setMediaUrlToFileMap] = useState(new Map()) // Track URL to file mapping

    const MAX_FILES = 10
    const MAX_FILE_SIZE_MB = 15
    const MAX_CONTENT_LENGTH = 10000

    const { toast } = useToast()

    // Cleanup blob URLs on unmount
    useEffect(() => {
        return () => {
            mediaUrlToFileMap.forEach((file, url) => {
                URL.revokeObjectURL(url)
            })
        }
    }, [mediaUrlToFileMap])

    // Handle media upload error
    useEffect(() => {
        if (uploadMediaError) {
            const errorMessage = uploadMediaError.message || uploadMediaError.error || "Media upload failed. Please try again."
            toast({
                title: "Media Upload Failed",
                description: errorMessage,
                variant: "destructive",
                duration: 5000,
                icon: <AlertCircle className="h-4 w-4" />
            })
            // Clear the error after showing it
            dispatch(clearUploadMediaError())
        }
    }, [uploadMediaError, toast, dispatch])

    // Handle media upload success
    useEffect(() => {
        if (uploadMediaSuccess) {
            toast({
                title: "Media Upload Complete",
                description: "Your media files have been uploaded successfully!",
                duration: 3000,
                icon: <CheckCircle className="h-4 w-4" />,
                variant: 'success'
            })

            // Reset form completely when media upload is successful
            setContent('<p></p>')
            setMediaFiles([])
            setErrorMsg('')

            // Clean up all blob URLs and mappings
            mediaUrlToFileMap.forEach((file, url) => {
                URL.revokeObjectURL(url)
            })
            setMediaUrlToFileMap(new Map())

            // Clear the success state after showing it
            dispatch(clearUploadMediaSuccess())
        }
    }, [uploadMediaSuccess, toast, dispatch, mediaUrlToFileMap])

    // Handle content change from editor
    const handleContentChange = useCallback((newContent) => {
        setContent(newContent)
        setErrorMsg("") // Clear any previous errors

        // Check if any media was removed from the editor content
        if (mediaUrlToFileMap.size > 0) {
            const currentUrls = new Set()

            // Extract all blob URLs from the new content
            const imgMatches = newContent.match(/src="blob:[^"]*"/g) || []
            const videoMatches = newContent.match(/<video[^>]*src="blob:[^"]*"/g) || []

            imgMatches.forEach(match => {
                const url = match.match(/src="(blob:[^"]*)"/)?.[1]
                if (url) currentUrls.add(url)
            })

            videoMatches.forEach(match => {
                const url = match.match(/src="(blob:[^"]*)"/)?.[1]
                if (url) currentUrls.add(url)
            })

            // Find URLs that were removed
            const removedUrls = []
            for (const url of mediaUrlToFileMap.keys()) {
                if (!currentUrls.has(url)) {
                    removedUrls.push(url)
                }
            }

            // Remove corresponding files from mediaFiles array
            if (removedUrls.length > 0) {
                setMediaFiles(prev => {
                    const filesToRemove = removedUrls.map(url => mediaUrlToFileMap.get(url)).filter(Boolean)
                    return prev.filter(file => !filesToRemove.includes(file))
                })

                // Clean up URL mappings
                setMediaUrlToFileMap(prev => {
                    const newMap = new Map(prev)
                    removedUrls.forEach(url => {
                        URL.revokeObjectURL(url) // Clean up blob URL
                        newMap.delete(url)
                    })
                    return newMap
                })
            }
        }
    }, [mediaUrlToFileMap])

    // Handle image upload within the editor
    const handleImageUpload = useCallback(async (file) => {
        if (!file) return null

        // Validate file size
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            toast({
                title: "File Too Large",
                description: `Image must be smaller than ${MAX_FILE_SIZE_MB}MB`,
                variant: "destructive",
                duration: 4000,
                icon: <X className="h-4 w-4" />
            })
            throw new Error('File too large')
        }

        // Check if we're at the limit
        if (mediaFiles.length >= MAX_FILES) {
            toast({
                title: "Too Many Files",
                description: `You can only upload up to ${MAX_FILES} files per post`,
                variant: "destructive",
                duration: 4000,
                icon: <X className="h-4 w-4" />
            })
            throw new Error('Too many files')
        }

        try {
            // Create a local URL for preview
            const imageUrl = URL.createObjectURL(file)

            // Add file to our media files array
            setMediaFiles(prev => [...prev, file])

            // Track URL to file mapping
            setMediaUrlToFileMap(prev => {
                const newMap = new Map(prev)
                newMap.set(imageUrl, file)
                return newMap
            })

            toast({
                title: "Image Added",
                description: "Image added to your post (will be uploaded when post is created)",
                duration: 2000,
                icon: <CheckCircle className="h-4 w-4" />,
                variant: 'success'
            })

            return imageUrl

        } catch (error) {
            console.error('Image handling failed:', error)
            toast({
                title: "Upload Failed",
                description: "Failed to add image. Please try again.",
                variant: "destructive",
                duration: 4000,
                icon: <X className="h-4 w-4" />
            })
            throw error
        }
    }, [toast, MAX_FILE_SIZE_MB, mediaFiles.length])

    // Handle video upload within the editor
    const handleVideoUpload = useCallback(async (file) => {
        if (!file) return null

        // Validate file size (videos can be larger)
        const maxVideoSize = 50 * 1024 * 1024 // 50MB for videos
        if (file.size > maxVideoSize) {
            toast({
                title: "File Too Large",
                description: "Video must be smaller than 50MB",
                variant: "destructive",
                duration: 4000,
                icon: <X className="h-4 w-4" />
            })
            throw new Error('File too large')
        }

        // Check if we're at the limit
        if (mediaFiles.length >= MAX_FILES) {
            toast({
                title: "Too Many Files",
                description: `You can only upload up to ${MAX_FILES} files per post`,
                variant: "destructive",
                duration: 4000,
                icon: <X className="h-4 w-4" />
            })
            throw new Error('Too many files')
        }

        try {
            // Create a local URL for preview
            const videoUrl = URL.createObjectURL(file)

            // Add file to our media files array
            setMediaFiles(prev => [...prev, file])

            // Track URL to file mapping
            setMediaUrlToFileMap(prev => {
                const newMap = new Map(prev)
                newMap.set(videoUrl, file)
                return newMap
            })

            toast({
                title: "Video Added",
                description: "Video added to your post (will be uploaded when post is created)",
                duration: 2000,
                icon: <CheckCircle className="h-4 w-4" />,
                variant: 'success'
            })

            return videoUrl

        } catch (error) {
            console.error('Video handling failed:', error)
            toast({
                title: "Upload Failed",
                description: "Failed to add video. Please try again.",
                variant: "destructive",
                duration: 4000,
                icon: <X className="h-4 w-4" />
            })
            throw error
        }
    }, [toast, mediaFiles.length])

    // Note: Media removal is handled directly in the editor
    // Users can select and delete media elements naturally within the editor content

    // Handle post submission
    const handleSubmit = async (e) => {
        e.preventDefault()

        // Prevent double submission
        if (isLoading || isUploading || uploadingMedia) return

        // Check if content is empty and no media files
        if (isHtmlEmpty(content) && mediaFiles.length === 0) {
            const errorMessage = "Please write something or add media before posting."
            setErrorMsg(errorMessage)
            toast({
                title: "Empty Post",
                description: errorMessage,
                variant: "destructive",
                duration: 3000,
                icon: <X className="h-4 w-4" />
            })
            return
        }

        // Validate content if it exists
        if (!isHtmlEmpty(content)) {
            const validation = validateContent(content, {
                maxLength: MAX_CONTENT_LENGTH,
                minLength: 1,
                requireText: false // Allow media-only posts
            })

            if (!validation.isValid) {
                const errorMessage = validation.errors.join(', ')
                setErrorMsg(errorMessage)
                toast({
                    title: "Invalid Content",
                    description: errorMessage,
                    variant: "destructive",
                    duration: 4000,
                    icon: <X className="h-4 w-4" />
                })
                return
            }
        }

        let postCreated = false

        try {
            setIsUploading(true)

            // Step 1: Create the post with media placeholders
            const sanitizedContent = prepareContentForApi(content, mediaFiles)
            const postResponse = await dispatch(createPost({
                content: sanitizedContent || '<p></p>' // Provide minimal content for media-only posts
            })).unwrap()

            postCreated = true
            const postId = postResponse.post._id || postResponse.post.id

            // Step 2: Upload media files if any
            if (mediaFiles.length > 0) {
                const formData = new FormData()
                mediaFiles.forEach(file => {
                    formData.append('media', file)
                })

                await dispatch(uploadPostMedia({
                    id: postId,
                    media: formData
                })).unwrap()
            }

            // Show success message
            toast({
                title: "Post Created",
                description: `Your post has been shared successfully!${mediaFiles.length > 0 ? ' Media upload in progress...' : ''}`,
                duration: 3000,
                icon: <CheckCircle className="h-4 w-4" />,
                variant: 'success'
            })

            // Only reset form if there are no media files to upload
            if (mediaFiles.length === 0) {
                setContent('<p></p>')
                setMediaFiles([])
                setErrorMsg('')
                setMediaUrlToFileMap(new Map())
            }

        } catch (error) {
            console.error('Post creation/upload failed:', error)

            let errorMessage = "Failed to create post. Please try again."

            if (postCreated && uploadMediaError && mediaFiles.length > 0) {
                errorMessage = "Post created but media upload failed. error: " + uploadMediaError;
            } else if (!postCreated) {
                errorMessage = "Failed to create post. Please try again."
            }

            setErrorMsg(errorMessage)
            toast({
                title: "Post Creation Failed",
                description: errorMessage,
                variant: "destructive",
                duration: 4000,
                icon: <X className="h-4 w-4" />
            })
        } finally {
            setIsUploading(false)
        }
    }

    if (!user) return null

    // Generate content summary for display
    const contentSummary = generateContentSummary(content)
    const isContentEmpty = isHtmlEmpty(content)
    const isFormDisabled = isLoading || isUploading || uploadingMedia
    const hasContent = !isContentEmpty || mediaFiles.length > 0

    return (
        <Card>
            <CardContent className="p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* User Avatar and Editor */}
                    <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 mt-2">
                            <AvatarImage src={user.profilePicture} alt={user.name} />
                            <AvatarFallback>{user.firstName?.charAt(0)}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                            {/* Rich Text Editor */}
                            <div className={uploadingMedia ? "opacity-50 pointer-events-none" : ""}>
                                <TiptapEditor
                                    content={content}
                                    onChange={uploadingMedia ? () => { } : handleContentChange}
                                    placeholder={uploadingMedia ? "Uploading media..." : "What's on your mind?"}
                                    onImageUpload={uploadingMedia ? () => Promise.reject() : handleImageUpload}
                                    onVideoUpload={uploadingMedia ? () => Promise.reject() : handleVideoUpload}
                                    className="w-full"
                                    maxHeight="400px"
                                    minHeight="120px"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {errorMsg && (
                        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
                            {errorMsg}
                        </div>
                    )}

                    {/* Media Files Display */}
                    {mediaFiles.length > 0 && (
                        <div className="bg-muted/50 p-3 rounded-md">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">
                                    Media Files ({mediaFiles.length}/{MAX_FILES})
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {uploadingMedia ? "Upload in progress..." : "Select and delete in editor to remove"}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {mediaFiles.map((file, index) => (
                                    <div key={index} className="flex items-center gap-2 bg-background border rounded-md p-2">
                                        <span className="text-xs">
                                            {file.type.startsWith('image/') ? '🖼️' : '🎥'}
                                        </span>
                                        <span className="text-xs font-medium truncate max-w-[100px]">
                                            {file.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            ({(file.size / (1024 * 1024)).toFixed(1)}MB)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Content Summary */}
                    {hasContent && (
                        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
                            <div className="flex items-center justify-between">
                                <span>
                                    {contentSummary.wordCount} words
                                    {mediaFiles.length > 0 && `, ${mediaFiles.length} media file${mediaFiles.length > 1 ? 's' : ''}`}
                                    {contentSummary.mentions.length > 0 && `, ${contentSummary.mentions.length} mention${contentSummary.mentions.length > 1 ? 's' : ''}`}
                                </span>
                                {content.length > MAX_CONTENT_LENGTH * 0.8 && (
                                    <span className={content.length > MAX_CONTENT_LENGTH ? 'text-destructive' : 'text-warning'}>
                                        {content.length}/{MAX_CONTENT_LENGTH}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-between items-center pt-2">
                        <div className="flex items-center gap-2">
                            {isUploading && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating post...
                                </div>
                            )}
                            {uploadingMedia && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Uploading media...
                                </div>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={isFormDisabled || !hasContent}
                            className="ml-auto"
                        >
                            {isLoading || uploadingMedia ? (
                                <>
                                    Please wait
                                    <Ellipsis className="h-4 w-4 animate-pulse" />
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Post
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

export default CreatePostCard