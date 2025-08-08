import DOMPurify from 'dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks while preserving editor formatting
 * @param {string} html - Raw HTML content from the editor
 * @returns {string} - Sanitized HTML content
 */
export const sanitizeHtml = (html) => {
    if (!html || typeof html !== 'string') return ''

    // Configure DOMPurify to allow editor-specific elements and attributes
    const config = {
        ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 's', 'sub', 'sup',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li',
            'blockquote', 'code', 'pre',
            'a', 'img', 'video', 'source',
            'span', 'div',
            'mark' // for highlights
        ],
        ALLOWED_ATTR: [
            'href', 'target', 'rel', // for links
            'src', 'alt', 'title', 'width', 'height', // for images
            'controls', 'autoplay', 'muted', 'loop', 'poster', // for videos
            'class', 'style', // for styling
            'data-type', 'data-id', // for mentions and special content
            'data-media-placeholder', // for media placeholders
            'type' // for video sources
        ],
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
        ADD_ATTR: ['target'],
        FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'button'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
        KEEP_CONTENT: true
    }

    return DOMPurify.sanitize(html, config)
}

/**
 * Convert HTML content to plain text for preview/summary
 * @param {string} html - HTML content
 * @param {number} maxLength - Maximum length of the text
 * @returns {string} - Plain text content
 */
export const htmlToText = (html, maxLength = 200) => {
    if (!html || typeof html !== 'string') return ''

    // Create a temporary div to extract text content
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = sanitizeHtml(html)

    const text = tempDiv.textContent || tempDiv.innerText || ''

    if (maxLength && text.length > maxLength) {
        return text.substring(0, maxLength).trim() + '...'
    }

    return text.trim()
}

/**
 * Check if HTML content is empty (only contains empty tags or whitespace)
 * @param {string} html - HTML content
 * @returns {boolean} - True if content is empty
 */
export const isHtmlEmpty = (html) => {
    if (!html || typeof html !== 'string') return true

    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = sanitizeHtml(html)

    const text = tempDiv.textContent || tempDiv.innerText || ''
    return text.trim().length === 0
}

/**
 * Extract image URLs from HTML content
 * @param {string} html - HTML content
 * @returns {string[]} - Array of image URLs
 */
export const extractImages = (html) => {
    if (!html || typeof html !== 'string') return []

    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = sanitizeHtml(html)

    const images = tempDiv.querySelectorAll('img')
    return Array.from(images).map(img => img.src).filter(Boolean)
}

/**
 * Extract video URLs from HTML content
 * @param {string} html - HTML content
 * @returns {string[]} - Array of video URLs
 */
export const extractVideos = (html) => {
    if (!html || typeof html !== 'string') return []

    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = sanitizeHtml(html)

    const videos = tempDiv.querySelectorAll('video source, video')
    return Array.from(videos).map(video => video.src).filter(Boolean)
}

/**
 * Extract mentions from HTML content
 * @param {string} html - HTML content
 * @returns {string[]} - Array of mentioned usernames
 */
export const extractMentions = (html) => {
    if (!html || typeof html !== 'string') return []

    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = sanitizeHtml(html)

    const mentions = tempDiv.querySelectorAll('[data-type="mention"]')
    return Array.from(mentions).map(mention => mention.getAttribute('data-id')).filter(Boolean)
}

/**
 * Generate a summary object from HTML content
 * @param {string} html - HTML content
 * @returns {Object} - Summary object with text, images, videos, mentions
 */
export const generateContentSummary = (html) => {
    return {
        text: htmlToText(html, 300),
        preview: htmlToText(html, 100),
        images: extractImages(html),
        videos: extractVideos(html),
        mentions: extractMentions(html),
        isEmpty: isHtmlEmpty(html),
        wordCount: htmlToText(html).split(/\s+/).filter(Boolean).length
    }
}

/**
 * Prepare content for API submission (convert to string, sanitize, add media placeholders)
 * @param {string} html - HTML content from editor
 * @param {Array} mediaFiles - Array of File objects being uploaded
 * @returns {string} - Sanitized HTML string ready for storage with media placeholders
 */
export const prepareContentForApi = (html, mediaFiles = []) => {
    if (!html || typeof html !== 'string') return ''

    let processedHtml = html

    // Replace blob URLs with media placeholders based on file order
    if (Array.isArray(mediaFiles) && mediaFiles.length > 0) {
        let mediaIndex = 0

        // Replace img and video tags that have blob URLs
        processedHtml = processedHtml.replace(
            /<(img|video)([^>]*?)src="blob:[^"]*"([^>]*?)>/gi,
            (match, tagName, beforeSrc, afterSrc) => {
                const placeholder = `data-media-placeholder="${mediaIndex}"`
                mediaIndex++

                // Reconstruct the tag with placeholder, ensuring src is removed
                const cleanBeforeSrc = beforeSrc.replace(/\s*src="[^"]*"\s*/g, ' ')
                const cleanAfterSrc = afterSrc.replace(/\s*src="[^"]*"\s*/g, ' ')

                return `<${tagName}${cleanBeforeSrc}${placeholder}${cleanAfterSrc}>`
            }
        )
    }

    // Sanitize and return the HTML as a string
    return sanitizeHtml(processedHtml)
}

/**
 * Prepare content for display (sanitize and replace media placeholders with real URLs)
 * @param {string} storedContent - Content retrieved from API/database
 * @param {Array} mediaArray - Array of media objects from backend
 * @returns {string} - Safe HTML ready for display with real media URLs
 */
export const prepareContentForDisplay = (storedContent, mediaArray = []) => {
    if (!storedContent || typeof storedContent !== 'string') return ''

    let processedHtml = storedContent

    // Replace media placeholders with actual URLs
    if (Array.isArray(mediaArray) && mediaArray.length > 0) {
        // Replace data-media-placeholder attributes with actual src URLs
        processedHtml = processedHtml.replace(
            /<(img|video)([^>]*?)data-media-placeholder="(\d+)"([^>]*?)>/gi,
            (match, tagName, beforePlaceholder, index, afterPlaceholder) => {
                const mediaIndex = parseInt(index)
                const mediaObj = mediaArray[mediaIndex]
                if (mediaObj && mediaObj.secure_url) {
                    // Add src attribute and remove placeholder
                    return `<${tagName}${beforePlaceholder}src="${mediaObj.secure_url}"${afterPlaceholder}>`
                }
                return match // Keep placeholder if media not found
            }
        )

        // Replace any remaining blob URLs with available media
        processedHtml = processedHtml.replace(
            /src="blob:[^"]*"/g,
            (match, offset, string) => {
                // Try to extract index from nearby placeholder or use sequential assignment
                const beforeMatch = string.substring(0, offset)
                const placeholderMatch = beforeMatch.match(/data-media-placeholder="(\d+)"/g)

                if (placeholderMatch) {
                    const lastPlaceholder = placeholderMatch[placeholderMatch.length - 1]
                    const index = parseInt(lastPlaceholder.match(/\d+/)[0])
                    const mediaObj = mediaArray[index]
                    if (mediaObj && mediaObj.secure_url) {
                        return `src="${mediaObj.secure_url}"`
                    }
                }

                // Fallback: use first available media
                const firstMedia = mediaArray[0]
                if (firstMedia && firstMedia.secure_url) {
                    return `src="${firstMedia.secure_url}"`
                }

                return 'src=""' // Remove broken blob URL
            }
        )

        // Clean up any remaining placeholder attributes
        processedHtml = processedHtml.replace(/data-media-placeholder="\d+"\s*/g, '')
    } else {
        // No media available - remove all media elements or replace with placeholders
        processedHtml = processedHtml.replace(
            /<(img|video)[^>]*>/gi,
            '<div class="bg-muted p-4 rounded text-center text-muted-foreground text-sm">Media not available</div>'
        )
    }

    // Double-sanitize for extra safety
    return sanitizeHtml(processedHtml)
}

/**
 * Default content structure for empty posts
 * @returns {string} - Empty paragraph HTML
 */
export const getEmptyContent = () => {
    return '<p></p>'
}

/**
 * Validate content before submission
 * @param {string} html - HTML content
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result with isValid and errors
 */
export const validateContent = (html, options = {}) => {
    const {
        maxLength = 10000,
        minLength = 1,
        requireText = true
    } = options

    const errors = []
    const summary = generateContentSummary(html)

    if (requireText && summary.isEmpty) {
        errors.push('Content cannot be empty')
    }

    if (summary.text.length < minLength) {
        errors.push(`Content must be at least ${minLength} characters`)
    }

    if (html.length > maxLength) {
        errors.push(`Content exceeds maximum length of ${maxLength} characters`)
    }

    return {
        isValid: errors.length === 0,
        errors,
        summary
    }
}
