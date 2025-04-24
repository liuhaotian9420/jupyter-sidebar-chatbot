"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderMarkdown = renderMarkdown;
/**
 * Renders markdown text to HTML.
 * @param markdownText The markdown text to render
 * @returns HTML string
 */
function renderMarkdown(markdownText) {
    // This is a simple implementation. In a real app, you would use a library like marked.js
    if (!markdownText) {
        return '';
    }
    // Basic markdown conversion
    let html = markdownText
        // Handle headers
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
        .replace(/^##### (.*$)/gm, '<h5>$1</h5>')
        .replace(/^###### (.*$)/gm, '<h6>$1</h6>')
        // Handle bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.*?)__/g, '<strong>$1</strong>')
        // Handle italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        // Handle links
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
        // Handle code blocks
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        // Handle inline code
        .replace(/`(.*?)`/g, '<code>$1</code>')
        // Handle horizontal rules
        .replace(/^---$/gm, '<hr>')
        // Handle unordered lists
        .replace(/^\* (.*$)/gm, '<ul><li>$1</li></ul>')
        .replace(/^- (.*$)/gm, '<ul><li>$1</li></ul>')
        // Handle ordered lists
        .replace(/^\d+\. (.*$)/gm, '<ol><li>$1</li></ol>')
        // Handle blockquotes
        .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
        // Handle paragraphs - ensures double newlines create p tags
        .replace(/\n\n/g, '</p><p>');
    // Wrap in paragraph if not already wrapped
    if (!html.startsWith('<')) {
        html = '<p>' + html + '</p>';
    }
    // Fix nested list items
    html = html
        .replace(/<\/ul>\s*<ul>/g, '')
        .replace(/<\/ol>\s*<ol>/g, '');
    return html;
}
