"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectLanguage = detectLanguage;
exports.highlightCode = highlightCode;
const highlight_js_1 = __importDefault(require("highlight.js"));
/**
 * Detects the programming language from code block content using highlight.js
 * and custom pattern matching for common languages.
 */
function detectLanguage(code) {
    try {
        // Try auto detection first with a limited set of common languages
        const result = highlight_js_1.default.highlightAuto(code, [
            'python', 'javascript', 'typescript', 'java',
            'html', 'css', 'cpp', 'csharp', 'sql', 'rust',
            'php', 'bash', 'json', 'xml', 'markdown'
        ]);
        // If confidence is reasonably high, use that language
        if (result.relevance > 5 && result.language) {
            return result.language;
        }
        // Fall back to basic pattern matching for better accuracy on ambiguous cases
        if (/^(?:\s*)?(?:import\s+[^;]+;|package\s+[^;]+;|public\s+class)/.test(code)) {
            return 'java';
        }
        else if (/^(?:\s*)?(import|from|def|class|if __name__)/.test(code)) {
            return 'python';
        }
        else if (/^(?:\s*)?(?:function|const|let|var|import|export|=>)/.test(code)) {
            // Broader check for JS/TS
            if (/^(?:\s*)?(?:import\s.+|export\s.+|interface|type|enum|declare|:|\s<)/.test(code)) {
                return 'typescript';
            }
            return 'javascript';
        }
        else if (/^(?:\s*)?(?:<!DOCTYPE|<html|<head|<body)/i.test(code)) {
            return 'html';
        }
        else if (/^(?:\s*)?#include/.test(code)) {
            return 'cpp';
        }
        else if (/^(?:\s*)?(?:using\s+System|namespace|public\s+static\s+void\s+Main)/.test(code)) {
            return 'csharp';
        }
        else if (/^(?:\s*)?(?:SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER)\s/i.test(code)) {
            return 'sql';
        }
        else if (/^(?:\s*)?(?:fn|let|struct|enum|trait|impl|mod)\s/.test(code)) {
            return 'rust';
        }
        else if (/^(?:\s*)?(?:<\?php|use\s+[\w\\]+;)/.test(code)) {
            return 'php';
        }
        else if (/^(?:\s*)?(?:#\s*!\/bin\/(?:bash|sh|zsh)|\$)/.test(code)) {
            return 'bash';
        }
        else if (/^\s*\{/.test(code) && /\}\s*$/.test(code)) {
            // Simple check for JSON-like structure
            return 'json';
        }
        else if (/^\s*<\?xml/.test(code) || /^\s*<\w+/.test(code)) {
            // Simple check for XML/HTML like structure
            return 'xml';
        }
        // If no specific language detected, return empty string for default handling
        return '';
    }
    catch (error) {
        console.error('Error detecting language:', error);
        return ''; // Return empty on error
    }
}
/**
 * Highlights code using highlight.js.
 * Falls back to auto-detection if the specified language is not supported.
 */
function highlightCode(code, language) {
    try {
        if (language && highlight_js_1.default.getLanguage(language)) {
            return highlight_js_1.default.highlight(code, { language, ignoreIllegals: true }).value;
        }
        else {
            // Fallback to auto-detection if language is empty or not registered
            return highlight_js_1.default.highlightAuto(code).value;
        }
    }
    catch (error) {
        console.error(`Error highlighting code (language: ${language || 'auto'}):`, error);
        // Return original code escaped for safety on error
        return code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
}
