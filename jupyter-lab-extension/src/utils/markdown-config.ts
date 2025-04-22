import { marked } from 'marked';

/**
 * Configure marked with better rendering options for code blocks
 */
export function configureMarked(): void {
  // Configure marked options
  marked.setOptions({
    gfm: true,           // Enable GitHub Flavored Markdown
    breaks: true,        // Add <br> on single line breaks
    pedantic: false,     // Conform to original markdown spec
    async: false,        // Disable async rendering
    silent: false        // Enable error reporting
  });
}

/**
 * Pre-process markdown text to fix common issues with streaming content
 */
export function preprocessMarkdown(text: string): string {
  // Normalize line endings
  const normalizedText = text.replace(/\r\n/g, '\n');
  
  // Handle code blocks first
  let inCodeBlock = false;
  const lines = normalizedText.split('\n');
  const processedLines = lines.map((line, i) => {
    // Check for code block markers
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      // Preserve language specification
      return line.trim();
    }
    
    // If we're in a code block, preserve the line as is
    if (inCodeBlock) {
      return line;
    }
    
    // Outside code blocks:
    // 1. Handle list items with proper spacing
    // 2. Trim excessive whitespace at start and end, but preserve indentation within lines
    let processed = line;
    
    // Handle dash list items by ensuring they have a space after the dash
    processed = processed.replace(/(\s*)-(\S)/g, '$1- $2');
    
    // Handle mixed space/dash issues - ensure proper newlines before list items
    processed = processed.replace(/([^\n\s])-\s/g, '$1\n- ');
    
    return processed;
  });
  
  // Join lines and ensure code blocks are properly formatted
  let result = processedLines.join('\n');
  
  // Handle empty code blocks (add a space so they render properly)
  result = result.replace(/```(.*)\n```/g, '```$1\n \n```');
  
  return result;
}
