/**
 * Detects the programming language from code block content using highlight.js
 * and custom pattern matching for common languages.
 */
export declare function detectLanguage(code: string): string;
/**
 * Highlights code using highlight.js.
 * Falls back to auto-detection if the specified language is not supported.
 */
export declare function highlightCode(code: string, language: string): string;
