// Converts markdown content to plain text for preview snippets
export function formatPostContent(content: string): string {
    if (!content) return '';
    
    return content
        // Remove code blocks (fenced and indented)
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`{1,2}[^`]*`{1,2}/g, '')
        .replace(/^[ \t]*```.*\n/gm, '')
        .replace(/^[ \t]{4,}.*\n/gm, '')
        
        // Remove links but keep link text
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1')
        .replace(/!?\[[^\]]*\]\([^)]*\)/g, '') // Remove images
        
        // Remove headers
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/^(.+)\n=+$/gm, '$1')
        .replace(/^(.+)\n-+$/gm, '$1')
        
        // Remove emphasis (bold, italic, strikethrough)
        .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
        .replace(/_{1,2}([^_]+)_{1,2}/g, '$1')
        .replace(/~~([^~]+)~~/g, '$1')
        
        // Remove lists markers
        .replace(/^[ \t]*[-*+]\s+/gm, '')
        .replace(/^[ \t]*\d+\.\s+/gm, '')
        
        // Remove blockquotes
        .replace(/^[ \t]*>[ \t]*/gm, '')
        
        // Remove horizontal rules
        .replace(/^[ \t]*[-*_]{3,}[ \t]*$/gm, '')
        
        // Remove HTML tags
        .replace(/<\/?[^>]+(>|$)/g, '')
        
        // Remove table syntax
        .replace(/\|/g, ' ')
        .replace(/^[ \t]*:?-+:?[ \t]*$/gm, '')
        
        // Clean up whitespace
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]+/g, ' ')
        .trim();
}

// Additional utility for extracting just the text content without any formatting
export function stripMarkdown(content: string): string {
    return formatPostContent(content);
}

// Utility for creating preview text with character limit
export function createPreviewText(content: string, maxLength: number = 150): string {
    const cleanText = formatPostContent(content);
    if (cleanText.length <= maxLength) {
        return cleanText;
    }
    return cleanText.slice(0, maxLength).replace(/\s+\S*$/, '') + '...';
}