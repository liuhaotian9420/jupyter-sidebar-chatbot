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
  // Handle code blocks first
  let inCodeBlock = false;
  const lines = text.split('\n');
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
    
    // Outside code blocks, handle list items
    return line.replace(/([^\n\s])-\s/g, '$1\n- ');
  });
  
  return processedLines.join('\n');
}
