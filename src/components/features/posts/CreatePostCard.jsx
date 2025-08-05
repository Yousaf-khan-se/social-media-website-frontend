import React, { useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createPost, uploadPostMedia } from '@/store/slices/postsSlice'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { useForm, FormProvider } from 'react-hook-form'
import { useToast } from '@/hooks/use-toast'

export const CreatePostCard = () => {
    const dispatch = useDispatch()
    const { user } = useSelector(state => state.auth)
    const { isLoading } = useSelector(state => state.posts)
    const [content, setContent] = useState('')
    const [mediaFiles, setMediaFiles] = useState([])
    const [isUploading, setIsUploading] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")
    const MAX_FILES = 10
    const MAX_FILE_SIZE_MB = 15

    const { toast } = useToast();

    const inputRef = useRef(null)
    const methods = useForm()

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files)
        const totalFiles = mediaFiles.length + newFiles.length

        let validFiles = []
        let errors = []

        if (totalFiles > MAX_FILES) {
            const errorMessage = `You can only upload up to ${MAX_FILES} files.`;
            setErrorMsg(errorMessage);
            toast({
                title: "Too Many Files",
                description: errorMessage,
                variant: "destructive",
                duration: 4000,
            });
            inputRef.current.value = "" // reset input
            return
        }

        newFiles.forEach(file => {
            if (file.size <= MAX_FILE_SIZE_MB * 1024 * 1024) {
                validFiles.push(file)
            } else {
                errors.push(`${file.name} exceeds 15MB`)
            }
        })

        if (errors.length > 0) {
            const errorMessage = errors.join("\n");
            setErrorMsg(errorMessage);
            toast({
                title: "File Size Error",
                description: `Some files exceed the ${MAX_FILE_SIZE_MB}MB limit and were not added.`,
                variant: "destructive",
                duration: 4000,
            });
        } else {
            setErrorMsg("")
        }

        setMediaFiles(prev => {
            const updated = [...prev, ...validFiles];
            // Show success toast for added files
            if (validFiles.length > 0) {
                toast({
                    title: "Files Added",
                    description: `${validFiles.length} file${validFiles.length > 1 ? 's' : ''} added successfully.`,
                    duration: 2000,
                });
            }
            return updated;
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg(""); // Clear previous errors

        if (content.trim()) {
            let postUploadFailed = false;
            let mediaUploadFailed = false;

            // Try to create the post
            try {
                const resultAction = await dispatch(createPost({ content }));
                const post = resultAction.payload?.post || resultAction.payload?.data;

                if (!post) {
                    const errorMessage = "Failed to create post. Please try again.";
                    setErrorMsg(errorMessage);
                    toast({
                        title: "Post Creation Failed",
                        description: errorMessage,
                        variant: "destructive",
                        duration: 4000,
                    });
                    postUploadFailed = true;
                } else {
                    // Show success message for post creation
                    const successMessage = mediaFiles.length > 0 ? "Post created! Uploading media..." : "Post created successfully!";
                    toast({
                        title: "Success",
                        description: successMessage,
                        duration: 3000,
                    });

                    // If post created, try to upload media
                    if (mediaFiles.length > 0) {
                        setIsUploading(true);
                        try {
                            const formData = new FormData();
                            mediaFiles.forEach(file => formData.append('media', file));
                            const mediaResult = await dispatch(uploadPostMedia({ id: post._id || post.id, media: formData })).unwrap();
                            setIsUploading(false);

                            if (!mediaResult.success) {
                                const errorMessage = "Post created, but media upload failed. Please try uploading media again.";
                                setErrorMsg(errorMessage);
                                toast({
                                    title: "Media Upload Failed",
                                    description: errorMessage,
                                    variant: "destructive",
                                    duration: 5000,
                                });
                                mediaUploadFailed = true;
                            } else {
                                // Show success message for media upload
                                toast({
                                    title: "Media Uploaded",
                                    description: "Your post with media has been published successfully!",
                                    duration: 3000,
                                });
                            }
                        } catch (error) {
                            setIsUploading(false);
                            console.error('Media upload failed:', error);
                            const errorMessage = "Post created, but media upload failed. Please try uploading media again.";
                            setErrorMsg(errorMessage);
                            toast({
                                title: "Media Upload Failed",
                                description: errorMessage,
                                variant: "destructive",
                                duration: 5000,
                            });
                            mediaUploadFailed = true;
                        }
                    }
                }
            } catch (error) {
                console.error('Post creation failed:', error);
                const errorMessage = "Failed to create post. Please try again.";
                setErrorMsg(errorMessage);
                toast({
                    title: "Post Creation Failed",
                    description: errorMessage,
                    variant: "destructive",
                    duration: 4000,
                });
                postUploadFailed = true;
            }

            // Reset form only if both succeeded
            if (!postUploadFailed && !mediaUploadFailed) {
                setContent('');
                setMediaFiles([]);
                setErrorMsg('');
                if (inputRef.current) inputRef.current.value = '';
            }
        } else {
            // Show toast for empty post
            toast({
                title: "Empty Post",
                description: "Please write something before posting.",
                variant: "destructive",
                duration: 3000,
            });
        }
    }

    if (!user) return null

    return (
        <Card>
            <CardContent className="p-2 sm:p-4">
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit} className="space-y-2">
                        <div className="flex items-start gap-3 sm:gap-4">
                            <Avatar className="h-9 w-9 sm:h-10 sm:w-10 mt-1">
                                <AvatarImage src={user.profilePicture} alt={user.name} />
                                <AvatarFallback>{user.firstName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 flex flex-col gap-2">
                                <Input
                                    as="textarea"
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    placeholder="What's happening?"
                                    className="min-h-[60px] sm:min-h-[120px] text-base sm:text-lg resize-none border-0 outline-none bg-transparent placeholder:text-muted-foreground"
                                    disabled={isLoading || isUploading}
                                />

                                <FormField
                                    name="media-upload"
                                    control={methods.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="file"
                                                    accept="image/*,video/*"
                                                    multiple
                                                    onChange={handleFileChange}
                                                    disabled={isUploading}
                                                    ref={inputRef}
                                                    className="w-auto text-sm file:mr-2 file:rounded file:border-none file:bg-accent file:text-accent-foreground"
                                                />
                                            </FormControl>
                                            {errorMsg && <FormMessage>{errorMsg}</FormMessage>}
                                        </FormItem>
                                    )}
                                />

                                {mediaFiles.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {mediaFiles.map((file, idx) => (
                                            <Badge key={idx} variant="secondary" className="truncate max-w-fit flex items-center gap-2">
                                                {file.name}
                                                <button
                                                    type="button"
                                                    className="ml-2 text-xs text-red-500 hover:text-red-700"
                                                    onClick={() => {
                                                        // Remove file from state
                                                        setMediaFiles(prev => {
                                                            const updated = prev.filter((_, i) => i !== idx);
                                                            // Update input field's FileList
                                                            if (inputRef.current) {
                                                                const dt = new window.DataTransfer();
                                                                updated.forEach(f => dt.items.add(f));
                                                                inputRef.current.files = dt.files;
                                                            }
                                                            return updated;
                                                        });
                                                    }}
                                                    aria-label={`Remove ${file.name}`}
                                                >
                                                    &times;
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end mt-2">
                            <Button type="submit" size="sm" className="w-full sm:w-auto" disabled={isUploading}>
                                {isUploading ? 'Uploading...' : isLoading ? 'Posting...' : 'Post'}
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </CardContent>
        </Card>
    )
}
