import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import TiptapEditor from './TiptapEditor'
import { prepareContentForDisplay, generateContentSummary } from '@/utils/editorUtils'

const EditorDemo = () => {
    const [content, setContent] = useState('<p>Welcome to the advanced Tiptap editor! 🎉</p><p>Try out these features:</p><ul><li><strong>Text formatting</strong> - Bold, italic, underline, colors</li><li><strong>Lists and headings</strong> - Organized content structure</li><li><strong>Media</strong> - Images and videos (upload functionality integrated)</li><li><strong>Emojis</strong> 😊 - Rich emoji picker with categories</li><li><strong>Links</strong> - Add clickable links</li><li><strong>And much more!</strong> ⭐</li></ul><blockquote><p><em>"This editor provides a modern, social media-like posting experience!"</em></p></blockquote>')
    const [showPreview, setShowPreview] = useState(false)

    // Mock upload functions for demo
    const handleImageUpload = async (file) => {
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Return a mock URL (in real app, this would be from your upload service)
        return `https://via.placeholder.com/400x300?text=${encodeURIComponent(file.name)}`
    }

    const handleVideoUpload = async (file) => {
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Return a mock URL (in real app, this would be from your upload service)
        return `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`
    }

    const contentSummary = generateContentSummary(content)

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Advanced Tiptap Editor Demo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <TiptapEditor
                        content={content}
                        onChange={setContent}
                        placeholder="Start typing your amazing post..."
                        onImageUpload={handleImageUpload}
                        onVideoUpload={handleVideoUpload}
                        maxHeight="400px"
                        minHeight="200px"
                    />

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => setShowPreview(!showPreview)}
                            variant="outline"
                        >
                            {showPreview ? 'Hide Preview' : 'Show Preview'}
                        </Button>

                        <div className="text-sm text-muted-foreground">
                            {contentSummary.wordCount} words
                            {contentSummary.images.length > 0 && `, ${contentSummary.images.length} image${contentSummary.images.length > 1 ? 's' : ''}`}
                            {contentSummary.videos.length > 0 && `, ${contentSummary.videos.length} video${contentSummary.videos.length > 1 ? 's' : ''}`}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {showPreview && (
                <Card>
                    <CardHeader>
                        <CardTitle>Content Preview (How it appears to users)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{
                                __html: prepareContentForDisplay(content)
                            }}
                        />

                        <div className="mt-4 p-3 bg-muted rounded-md">
                            <h4 className="font-medium mb-2">Content Analysis:</h4>
                            <div className="text-sm text-muted-foreground space-y-1">
                                <div>Word count: {contentSummary.wordCount}</div>
                                <div>Character count: {content.length}</div>
                                <div>Images: {contentSummary.images.length}</div>
                                <div>Videos: {contentSummary.videos.length}</div>
                                <div>Mentions: {contentSummary.mentions.length}</div>
                                <div>Empty: {contentSummary.isEmpty ? 'Yes' : 'No'}</div>
                                {contentSummary.preview && (
                                    <div>Preview: {contentSummary.preview}</div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Editor Features</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <h4 className="font-medium mb-2">✨ Text Formatting</h4>
                            <ul className="space-y-1 text-muted-foreground">
                                <li>• Bold, italic, underline, strikethrough</li>
                                <li>• Subscript and superscript</li>
                                <li>• Text colors and highlights</li>
                                <li>• Multiple font families</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-medium mb-2">📝 Content Structure</h4>
                            <ul className="space-y-1 text-muted-foreground">
                                <li>• Headings (H1, H2, H3)</li>
                                <li>• Bullet and numbered lists</li>
                                <li>• Blockquotes</li>
                                <li>• Text alignment</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-medium mb-2">🎨 Rich Media</h4>
                            <ul className="space-y-1 text-muted-foreground">
                                <li>• Image uploads with preview</li>
                                <li>• Video uploads and embedding</li>
                                <li>• Links with custom URLs</li>
                                <li>• YouTube video embedding</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-medium mb-2">🚀 Advanced Features</h4>
                            <ul className="space-y-1 text-muted-foreground">
                                <li>• Comprehensive emoji picker</li>
                                <li>• @mentions (configurable)</li>
                                <li>• Bubble and floating menus</li>
                                <li>• Undo/redo functionality</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-medium mb-2">🔒 Security & Safety</h4>
                            <ul className="space-y-1 text-muted-foreground">
                                <li>• HTML sanitization with DOMPurify</li>
                                <li>• XSS protection</li>
                                <li>• Safe content rendering</li>
                                <li>• Content validation</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-medium mb-2">📱 User Experience</h4>
                            <ul className="space-y-1 text-muted-foreground">
                                <li>• Responsive design</li>
                                <li>• Mobile-friendly interface</li>
                                <li>• Intuitive toolbar</li>
                                <li>• Real-time content analysis</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default EditorDemo
