# Advanced Tiptap Editor for Social Media Platform

A modern, feature-rich rich text editor built with Tiptap for creating engaging social media posts. This editor provides a comprehensive set of tools that give users complete control over their content styling and presentation.

## 🌟 Features

### ✨ Rich Text Formatting
- **Bold, Italic, Underline, Strikethrough** - Essential text formatting
- **Subscript & Superscript** - Mathematical and scientific notation
- **Text Colors** - 20+ predefined colors for text styling
- **Highlights** - 20+ background colors for text highlighting
- **Font Families** - Multiple font options for varied styling

### 📝 Content Structure
- **Headings** - H1, H2, H3 for organized content hierarchy
- **Lists** - Bullet points and numbered lists
- **Blockquotes** - Styled quote blocks for emphasis
- **Text Alignment** - Left, center, right alignment options
- **Paragraphs** - Smart paragraph handling

### 🎨 Rich Media Integration
- **Image Uploads** - Drag & drop or click to upload images
- **Video Uploads** - Support for video content with preview
- **YouTube Embedding** - Direct YouTube video integration
- **Link Management** - Easy link creation and removal
- **Media Optimization** - Automatic resizing and responsive display

### 😊 Enhanced User Experience
- **Comprehensive Emoji Picker** - 500+ emojis organized by categories
- **@Mentions** - User tagging functionality (configurable)
- **Bubble Menu** - Context-sensitive formatting toolbar
- **Floating Menu** - Quick access tools for empty lines
- **Keyboard Shortcuts** - Standard formatting shortcuts
- **Mobile Responsive** - Optimized for all screen sizes

### 🔒 Security & Safety
- **HTML Sanitization** - DOMPurify integration for XSS protection
- **Content Validation** - Input validation and length limits
- **Safe Rendering** - Secure display of user-generated content
- **Error Handling** - Graceful failure recovery

## 📁 File Structure

```
src/components/editor/
├── TiptapEditor.jsx          # Main editor component
├── EmojiPicker.jsx          # Advanced emoji picker
├── EditorDemo.jsx           # Demo and testing component
├── editor.jsx               # Legacy compatibility layer
└── README.md                # This documentation

src/utils/
└── editorUtils.js           # Utilities for content processing

src/styles/
└── editor.css               # Editor-specific styling
```

## 🚀 Quick Start

### Basic Usage

```jsx
import TiptapEditor from '@/components/editor/TiptapEditor'

const MyComponent = () => {
  const [content, setContent] = useState('<p></p>')

  return (
    <TiptapEditor
      content={content}
      onChange={setContent}
      placeholder="What's on your mind?"
    />
  )
}
```

### With Media Upload

```jsx
import TiptapEditor from '@/components/editor/TiptapEditor'

const MyComponent = () => {
  const [content, setContent] = useState('<p></p>')

  const handleImageUpload = async (file) => {
    // Your upload logic here
    const response = await uploadToCloudinary(file)
    return response.secure_url
  }

  const handleVideoUpload = async (file) => {
    // Your video upload logic here
    const response = await uploadVideo(file)
    return response.url
  }

  return (
    <TiptapEditor
      content={content}
      onChange={setContent}
      placeholder="Create an amazing post..."
      onImageUpload={handleImageUpload}
      onVideoUpload={handleVideoUpload}
      maxHeight="400px"
      minHeight="120px"
    />
  )
}
```

## 🔧 API Reference

### TiptapEditor Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | `''` | HTML content of the editor |
| `onChange` | `function` | - | Callback when content changes |
| `placeholder` | `string` | `"What's on your mind?"` | Placeholder text |
| `onImageUpload` | `function` | - | Image upload handler |
| `onVideoUpload` | `function` | - | Video upload handler |
| `className` | `string` | `''` | Additional CSS classes |
| `maxHeight` | `string` | `'300px'` | Maximum editor height |
| `minHeight` | `string` | `'120px'` | Minimum editor height |

### Editor Utils Functions

```jsx
import {
  sanitizeHtml,
  htmlToText,
  isHtmlEmpty,
  generateContentSummary,
  prepareContentForApi,
  prepareContentForDisplay,
  validateContent
} from '@/utils/editorUtils'

// Sanitize HTML for safe storage/display
const safeHtml = sanitizeHtml(userHtml)

// Convert HTML to plain text
const plainText = htmlToText(html, 200) // max 200 chars

// Check if content is empty
const isEmpty = isHtmlEmpty(html)

// Get content summary
const summary = generateContentSummary(html)
// Returns: { text, preview, images, videos, mentions, isEmpty, wordCount }

// Prepare for API submission
const apiContent = prepareContentForApi(editorHtml)

// Prepare for safe display
const displayContent = prepareContentForDisplay(storedHtml)

// Validate content
const validation = validateContent(html, {
  maxLength: 10000,
  minLength: 1,
  requireText: true
})
// Returns: { isValid, errors, summary }
```

## 🎯 Integration with Existing Components

### CreatePostCard Integration

The editor is already integrated into `CreatePostCard.jsx`:

```jsx
// In CreatePostCard.jsx
<TiptapEditor
  content={content}
  onChange={handleContentChange}
  placeholder="What's on your mind?"
  onImageUpload={handleImageUpload}
  onVideoUpload={handleVideoUpload}
  className="w-full"
  maxHeight="400px"
  minHeight="120px"
/>
```

### PostCard Display

Posts with rich content are safely rendered in `PostCard.jsx`:

```jsx
// In PostCard.jsx
<div 
  className="mt-2 text-sm break-words prose prose-sm max-w-none"
  dangerouslySetInnerHTML={{ 
    __html: prepareContentForDisplay(post.content) 
  }}
/>
```

### PostCard Editing

When editing posts, the full editor is available:

```jsx
// In edit mode
<TiptapEditor
  content={editContent}
  onChange={setEditContent}
  placeholder="What's on your mind?"
  className="w-full"
  maxHeight="300px"
  minHeight="120px"
/>
```

## 🎨 Styling & Customization

### CSS Classes

The editor uses CSS custom properties for theming:

```css
/* Editor container */
.ProseMirror {
  /* Customizable via CSS variables */
  color: hsl(var(--foreground));
  background: hsl(var(--background));
}

/* Toolbar styling */
.editor-toolbar {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
}
```

### Theme Integration

The editor automatically adapts to your application's theme using CSS variables defined in your global styles.

## 🔒 Security Considerations

### HTML Sanitization

All content is sanitized using DOMPurify before storage and display:

```jsx
// Allowed tags and attributes are strictly controlled
const config = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', ...],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', ...],
  FORBID_TAGS: ['script', 'object', 'embed', 'form', ...],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', ...]
}
```

### Content Validation

Content is validated before submission:

```jsx
const validation = validateContent(content, {
  maxLength: 10000,
  minLength: 1,
  requireText: true
})

if (!validation.isValid) {
  // Handle validation errors
  console.log(validation.errors)
}
```

## 📱 Mobile Optimization

The editor is fully responsive and optimized for mobile devices:

- Touch-friendly toolbar buttons
- Responsive emoji picker
- Mobile-optimized spacing
- Adaptive font sizes
- Gesture support for text selection

## 🧪 Testing

Use the `EditorDemo` component to test all features:

```jsx
import EditorDemo from '@/components/editor/EditorDemo'

// Add to your development routes
<Route path="/editor-demo" component={EditorDemo} />
```

## 🔧 Extensions & Customization

### Adding New Extensions

```jsx
// In TiptapEditor.jsx
import { CustomExtension } from '@tiptap/extension-custom'

const editor = useEditor({
  extensions: [
    StarterKit,
    CustomExtension.configure({
      // Configuration options
    }),
    // ... other extensions
  ]
})
```

### Custom Toolbar Buttons

```jsx
// Add new toolbar button
<ToolbarButton
  onClick={() => editor.chain().focus().yourCommand().run()}
  isActive={editor.isActive('yourCommand')}
  title="Your Command"
>
  <YourIcon className="h-4 w-4" />
</ToolbarButton>
```

## 🚀 Performance

### Optimization Features

- **Lazy loading** - Emoji picker loads categories on demand
- **Debounced updates** - Content changes are debounced
- **Efficient re-renders** - Optimized React rendering
- **Memory management** - Proper cleanup of editor instances

### Best Practices

1. Use `useMemo` for expensive computations
2. Implement proper cleanup in `useEffect`
3. Limit the number of concurrent editor instances
4. Use content validation to prevent oversized content

## 🛠️ Troubleshooting

### Common Issues

**Editor not appearing:**
- Check that all Tiptap packages are installed
- Verify CSS imports in `index.css`

**Styling issues:**
- Ensure CSS variables are defined in your theme
- Check for conflicting CSS rules

**Upload not working:**
- Verify upload functions are properly implemented
- Check network requests in browser dev tools

**Content not saving:**
- Ensure `onChange` callback is properly handled
- Check content validation and sanitization

## 📄 License

This editor implementation is part of the Social Media Platform project and follows the same licensing terms.

## 🤝 Contributing

When contributing to the editor:

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure security best practices
5. Test on multiple devices and browsers

## 📞 Support

For questions or issues related to the editor:

1. Check this documentation first
2. Review the demo component for examples
3. Check browser console for errors
4. Test with the EditorDemo component
