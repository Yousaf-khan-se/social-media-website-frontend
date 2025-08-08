import React, { useRef, useState, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
// BubbleMenu and FloatingMenu temporarily disabled for v3 compatibility
import { StarterKit } from '@tiptap/starter-kit'
import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TextAlign } from '@tiptap/extension-text-align'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { FontFamily } from '@tiptap/extension-font-family'
import { Highlight } from '@tiptap/extension-highlight'
import { Underline } from '@tiptap/extension-underline'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { Youtube } from '@tiptap/extension-youtube'
import { Emoji } from '@tiptap/extension-emoji'
import { Mention } from '@tiptap/extension-mention'
import Video from 'tiptap-extension-video'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import EmojiPicker from './EmojiPicker'
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Code,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Palette,
    Highlighter,
    Image as ImageIcon,
    Video as VideoIcon,
    Link as LinkIcon,
    Smile,
    Type,
    Subscript as SubIcon,
    Superscript as SuperIcon,
    Plus,
    Trash2,
    Eye,
    Info
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// Emoji data - simplified for demo
const EMOJI_DATA = [
    { name: 'smile', emoji: '😊' },
    { name: 'heart', emoji: '❤️' },
    { name: 'thumbs_up', emoji: '👍' },
    { name: 'fire', emoji: '🔥' },
    { name: 'star', emoji: '⭐' },
    { name: 'party', emoji: '🎉' },
    { name: 'laugh', emoji: '😂' },
    { name: 'thinking', emoji: '🤔' },
    { name: 'cool', emoji: '😎' },
    { name: 'rocket', emoji: '🚀' }
]

// Color palette
const COLORS = [
    '#000000', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#F3F4F6',
    '#DC2626', '#EA580C', '#D97706', '#CA8A04', '#65A30D', '#16A34A',
    '#059669', '#0891B2', '#0284C7', '#2563EB', '#4F46E5', '#7C3AED',
    '#A21CAF', '#BE185D'
]

// Highlight colors
const HIGHLIGHT_COLORS = [
    '#FEF3C7', '#FDE68A', '#FCD34D', '#F59E0B', '#D97706',
    '#FECACA', '#FCA5A5', '#F87171', '#EF4444', '#DC2626',
    '#D1FAE5', '#A7F3D0', '#6EE7B7', '#34D399', '#10B981',
    '#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6'
]

const TiptapEditor = ({
    content = '',
    onChange,
    placeholder = "What's on your mind?",
    onImageUpload,
    onVideoUpload,
    className = '',
    maxHeight = '300px',
    minHeight = '120px'
}) => {
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
    const [isHighlightPickerOpen, setIsHighlightPickerOpen] = useState(false)
    const [linkUrl, setLinkUrl] = useState('')
    const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
    // const [youtubeUrl, setYoutubeUrl] = useState('') // Future feature
    // const [isYoutubeDialogOpen, setIsYoutubeDialogOpen] = useState(false) // Future feature
    const fileInputRef = useRef(null)
    const videoInputRef = useRef(null)
    const { toast } = useToast()

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3]
                }
            }),

            Image.configure({
                inline: true,
                allowBase64: true,
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full h-auto my-2'
                }
            }),
            Video.configure({
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full h-auto my-2',
                    controls: true,
                    style: 'max-height: 400px;'
                }
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-500 hover:text-blue-700 underline cursor-pointer'
                }
            }),
            Placeholder.configure({
                placeholder
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph']
            }),
            TextStyle,
            Color,
            FontFamily.configure({
                types: ['textStyle']
            }),
            Highlight.configure({
                multicolor: true
            }),
            Underline,
            Subscript,
            Superscript,
            Youtube.configure({
                controls: false,
                nocookie: true,
                HTMLAttributes: {
                    class: 'rounded-lg my-2'
                }
            }),
            Emoji.configure({
                enableEmoticons: true
            }),
            Mention.configure({
                HTMLAttributes: {
                    class: 'mention bg-blue-100 text-blue-800 px-1 rounded'
                },
                suggestion: {
                    items: ({ query }) => {
                        // This would typically fetch from your user API
                        return ['john_doe', 'jane_smith', 'bob_wilson']
                            .filter(item => item.toLowerCase().includes(query.toLowerCase()))
                            .slice(0, 5)
                    }
                }
            })
        ],
        content,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML()
            onChange?.(html)
        },
        editorProps: {
            attributes: {
                class: cn(
                    'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
                    'min-h-[120px] max-w-none w-full px-3 py-2',
                    'prose-headings:my-2 prose-p:my-1 prose-li:my-0',
                    '[&_*]:max-w-full [&_img]:h-auto [&_video]:w-full'
                ),
                style: `min-height: ${minHeight}; max-height: ${maxHeight}; overflow-y: auto;`
            }
        }
    })

    // Handle image upload
    const handleImageUpload = useCallback(async (file) => {
        if (onImageUpload && editor) {
            try {
                const imageUrl = await onImageUpload(file)
                editor.chain().focus().setImage({ src: imageUrl }).run()
            } catch (error) {
                console.error('Image upload failed:', error)
            }
        }
    }, [editor, onImageUpload])

    // Handle video upload
    const handleVideoUpload = useCallback(async (file) => {
        if (onVideoUpload && editor) {
            try {
                const videoUrl = await onVideoUpload(file)
                // Insert video using tiptap-extension-video
                editor.chain().focus().setVideo({
                    src: videoUrl,
                    HTMLAttributes: {
                        "controls": true,
                        "class": "rounded-lg my-2 max-w-full",
                        "style": "max-height: 400px;"
                    }
                }).run();

            } catch (error) {
                console.error('Video upload failed:', error)
            }
        }
    }, [editor, onVideoUpload])

    // File input handlers
    const handleFileSelect = (e, type) => {
        const file = e.target.files?.[0]
        if (file) {
            if (type === 'image') {
                handleImageUpload(file)
            } else if (type === 'video') {
                handleVideoUpload(file)
            }
        }
    }

    // Insert emoji
    const insertEmoji = (emoji) => {
        editor?.chain().focus().insertContent(emoji).run()
        setIsEmojiPickerOpen(false)
    }

    // Set text color
    const setTextColor = (color) => {
        editor?.chain().focus().setColor(color).run()
        setIsColorPickerOpen(false)
    }

    // Set highlight color
    const setHighlightColor = (color) => {
        editor?.chain().focus().setHighlight({ color }).run()
        setIsHighlightPickerOpen(false)
    }

    // Add link
    const addLink = () => {
        if (linkUrl) {
            // Ensure URL has protocol
            let formattedUrl = linkUrl
            if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
                formattedUrl = 'https://' + formattedUrl
            }

            const { from, to } = editor.state.selection
            const selectedText = editor.state.doc.textBetween(from, to)

            if (selectedText) {
                // If text is selected, convert it to a link
                editor?.chain().focus().setLink({ href: formattedUrl }).run()
            } else {
                // If no text is selected, insert the URL as both text and link
                // Use the original linkUrl (without protocol) as display text for better readability
                const displayText = linkUrl.replace(/^https?:\/\//, '')
                editor?.chain()
                    .focus()
                    .insertContent(`<a href="${formattedUrl}">${displayText}</a>`)
                    .run()
            }

            toast({
                title: "Link Added",
                description: selectedText ?
                    (
                        <>
                            Text converted to link successfully <br /> Move cursor to right if don't want to edit the link.
                        </>
                    ) :
                    (
                        <>
                            Link inserted successfully <br /> Move cursor to right if don't want to edit the link.
                        </>
                    ),
                duration: 2500,
                icon: <Info className="h-4 w-4" />
            })

            setLinkUrl('')
            setIsLinkDialogOpen(false)
        }
    }

    // Add YouTube video - Future feature
    // const addYouTube = () => {
    //     if (youtubeUrl) {
    //         editor?.chain().focus().setYoutubeVideo({ src: youtubeUrl }).run()
    //         setYoutubeUrl('')
    //         setIsYoutubeDialogOpen(false)
    //     }
    // }

    // Remove link
    const removeLink = () => {
        editor?.chain().focus().unsetLink().run()
    }

    if (!editor) {
        return null
    }

    const ToolbarButton = ({ onClick, isActive, children, title }) => (
        <Button
            type="button"
            variant={isActive ? "default" : "ghost"}
            size="sm"
            onClick={onClick}
            className={cn(
                "h-8 w-8 p-0",
                isActive && "bg-primary text-primary-foreground"
            )}
            title={title}
        >
            {children}
        </Button>
    )

    const ToolbarSeparator = () => (
        <div className="w-px h-6 bg-border mx-1" />
    )

    return (
        <div className={cn("w-full", className)}>
            {/* Main Toolbar */}
            <Card>
                <CardContent className="p-2 border-b">
                    <div className="flex flex-wrap items-center gap-1">
                        {/* Text Formatting */}
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            isActive={editor.isActive('bold')}
                            title="Bold"
                        >
                            <Bold className="h-4 w-4" />
                        </ToolbarButton>

                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            isActive={editor.isActive('italic')}
                            title="Italic"
                        >
                            <Italic className="h-4 w-4" />
                        </ToolbarButton>

                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            isActive={editor.isActive('underline')}
                            title="Underline"
                        >
                            <UnderlineIcon className="h-4 w-4" />
                        </ToolbarButton>

                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleStrike().run()}
                            isActive={editor.isActive('strike')}
                            title="Strikethrough"
                        >
                            <Strikethrough className="h-4 w-4" />
                        </ToolbarButton>

                        <ToolbarSeparator />

                        {/* Headings */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button type="button" variant="ghost" size="sm" className="h-8 px-2">
                                    <Type className="h-4 w-4 mr-1" />
                                    <span className="text-xs">Text</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem
                                    onClick={() => editor.chain().focus().setParagraph().run()}
                                    className={editor.isActive('paragraph') ? 'bg-accent' : ''}
                                >
                                    Normal
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                                    className={editor.isActive('heading', { level: 1 }) ? 'bg-accent' : ''}
                                >
                                    <Heading1 className="h-4 w-4 mr-2" />
                                    Heading 1
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                                    className={editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''}
                                >
                                    <Heading2 className="h-4 w-4 mr-2" />
                                    Heading 2
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                                    className={editor.isActive('heading', { level: 3 }) ? 'bg-accent' : ''}
                                >
                                    <Heading3 className="h-4 w-4 mr-2" />
                                    Heading 3
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Lists */}
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            isActive={editor.isActive('bulletList')}
                            title="Bullet List"
                        >
                            <List className="h-4 w-4" />
                        </ToolbarButton>

                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                            isActive={editor.isActive('orderedList')}
                            title="Numbered List"
                        >
                            <ListOrdered className="h-4 w-4" />
                        </ToolbarButton>

                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleBlockquote().run()}
                            isActive={editor.isActive('blockquote')}
                            title="Quote"
                        >
                            <Quote className="h-4 w-4" />
                        </ToolbarButton>

                        <ToolbarSeparator />

                        {/* Alignment */}
                        <ToolbarButton
                            onClick={() => editor.chain().focus().setTextAlign('left').run()}
                            isActive={editor.isActive({ textAlign: 'left' })}
                            title="Align Left"
                        >
                            <AlignLeft className="h-4 w-4" />
                        </ToolbarButton>

                        <ToolbarButton
                            onClick={() => editor.chain().focus().setTextAlign('center').run()}
                            isActive={editor.isActive({ textAlign: 'center' })}
                            title="Align Center"
                        >
                            <AlignCenter className="h-4 w-4" />
                        </ToolbarButton>

                        <ToolbarButton
                            onClick={() => editor.chain().focus().setTextAlign('right').run()}
                            isActive={editor.isActive({ textAlign: 'right' })}
                            title="Align Right"
                        >
                            <AlignRight className="h-4 w-4" />
                        </ToolbarButton>

                        <ToolbarSeparator />

                        {/* Colors */}
                        <DropdownMenu open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
                            <DropdownMenuTrigger asChild>
                                <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Palette className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-64 p-2">
                                <div className="grid grid-cols-6 gap-1">
                                    {COLORS.map((color) => (
                                        <button
                                            key={color}
                                            className="w-8 h-8 rounded border border-gray-200 hover:scale-110 transition-transform"
                                            style={{ backgroundColor: color }}
                                            onClick={() => setTextColor(color)}
                                        />
                                    ))}
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu open={isHighlightPickerOpen} onOpenChange={setIsHighlightPickerOpen}>
                            <DropdownMenuTrigger asChild>
                                <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Highlighter className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-64 p-2">
                                <div className="grid grid-cols-5 gap-1">
                                    {HIGHLIGHT_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            className="w-8 h-8 rounded border border-gray-200 hover:scale-110 transition-transform"
                                            style={{ backgroundColor: color }}
                                            onClick={() => setHighlightColor(color)}
                                        />
                                    ))}
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <ToolbarSeparator />

                        {/* Media */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => fileInputRef.current?.click()}
                            title="Insert Image"
                        >
                            <ImageIcon className="h-4 w-4" />
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => videoInputRef.current?.click()}
                            title="Insert Video"
                        >
                            <VideoIcon className="h-4 w-4" />
                        </Button>

                        {/* Link */}
                        {editor.isActive('link') ? (
                            <ToolbarButton
                                onClick={removeLink}
                                isActive={true}
                                title="Remove Link"
                            >
                                <Trash2 className="h-4 w-4" />
                            </ToolbarButton>
                        ) : (
                            <DropdownMenu
                                open={isLinkDialogOpen}
                                onOpenChange={(open) => {
                                    setIsLinkDialogOpen(open)
                                    if (open) {
                                        // Pre-fill with existing link if text is selected and has a link
                                        const { from, to } = editor.state.selection
                                        const selectedText = editor.state.doc.textBetween(from, to)
                                        if (selectedText && editor.isActive('link')) {
                                            const linkMark = editor.getAttributes('link')
                                            if (linkMark.href) {
                                                setLinkUrl(linkMark.href)
                                            }
                                        } else {
                                            setLinkUrl('')
                                        }
                                    }
                                }}
                            >
                                <DropdownMenuTrigger asChild>
                                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <LinkIcon className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-80 p-3">
                                    <div className="space-y-2">
                                        <Input
                                            placeholder="https://example.com or google.com"
                                            value={linkUrl}
                                            onChange={(e) => setLinkUrl(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addLink()}
                                        />
                                        <div className="text-xs text-muted-foreground">
                                            {editor.state.selection.empty ?
                                                "Will insert URL as clickable link" :
                                                "Will convert selected text to link"
                                            }
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={addLink}
                                            className="w-full"
                                            disabled={!linkUrl.trim()}
                                        >
                                            Add Link
                                        </Button>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        {/* Emoji */}
                        <DropdownMenu open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
                            <DropdownMenuTrigger asChild>
                                <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Smile className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="p-0" align="start">
                                <EmojiPicker
                                    onEmojiSelect={insertEmoji}
                                    onClose={() => setIsEmojiPickerOpen(false)}
                                />
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <ToolbarSeparator />

                        {/* Subscript/Superscript */}
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleSubscript().run()}
                            isActive={editor.isActive('subscript')}
                            title="Subscript"
                        >
                            <SubIcon className="h-4 w-4" />
                        </ToolbarButton>

                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleSuperscript().run()}
                            isActive={editor.isActive('superscript')}
                            title="Superscript"
                        >
                            <SuperIcon className="h-4 w-4" />
                        </ToolbarButton>

                        <ToolbarSeparator />

                        {/* Undo/Redo */}
                        <ToolbarButton
                            onClick={() => editor.chain().focus().undo().run()}
                            title="Undo"
                        >
                            <Undo className="h-4 w-4" />
                        </ToolbarButton>

                        <ToolbarButton
                            onClick={() => editor.chain().focus().redo().run()}
                            title="Redo"
                        >
                            <Redo className="h-4 w-4" />
                        </ToolbarButton>
                    </div>
                </CardContent>

                {/* Editor Content */}
                <CardContent className="p-0">
                    {/* Bubble Menu and Floating Menu temporarily disabled for v3 compatibility */}
                    {/* Will be re-enabled once we resolve the import issues */}

                    <EditorContent editor={editor} />
                </CardContent>
            </Card>

            {/* Hidden file inputs */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, 'image')}
                className="hidden"
            />
            <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={(e) => handleFileSelect(e, 'video')}
                className="hidden"
            />
        </div>
    )
}

export default TiptapEditor
