/**
 * Handles rendering and managing chat messages
 */

import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { preprocessMarkdown } from '../markdown-config';
import { ChatMessage } from './types';

/**
 * Handles rendering and managing chat messages in the UI
 */
export class MessageRenderer {
  private messageContainer: HTMLDivElement;
  private onCopyMessage: (text: string) => void;
  private onAddToCell: (text: string) => void;

  constructor(
    messageContainer: HTMLDivElement,
    onCopyMessage: (text: string) => void,
    onAddToCell: (text: string) => void
  ) {
    this.messageContainer = messageContainer;
    this.onCopyMessage = onCopyMessage;
    this.onAddToCell = onAddToCell;
  }

  /**
   * Renders a message in the UI
   * @param text The text content of the message
   * @param sender The sender of the message ('user' or 'bot')
   * @param isMarkdown Whether the message is in Markdown format
   * @returns The created message element
   */
  public renderMessage(text: string, sender: 'user' | 'bot', isMarkdown = false): HTMLDivElement {
    console.log('Rendering message:', { sender, isMarkdown }); // Debug log
    
    // Create message container
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${sender}-message`;
    
    // Create message header with sender info
    const messageHeader = document.createElement('div');
    messageHeader.className = 'message-header';
    messageHeader.textContent = sender === 'user' ? 'You' : 'AI';
    messageElement.appendChild(messageHeader);
    
    // Create message content
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // Process and render the message content
    if (isMarkdown) {
      try {
        // Preprocess markdown to handle special syntax
        const processedMarkdown = preprocessMarkdown(text);
        
        // Convert markdown to HTML
        const rawHtml = marked.parse(processedMarkdown);
        
        // Sanitize HTML (cast to string to fix type issue)
        const sanitizedHtml = DOMPurify.sanitize(rawHtml as string);
        
        // Set the HTML content
        messageContent.innerHTML = sanitizedHtml;
        
        // Add syntax highlighting to code blocks
        const codeBlocks = messageContent.querySelectorAll('pre code');
        codeBlocks.forEach((block) => {
          // Add a class for styling
          block.parentElement?.classList.add('highlighted-code');
          
          // Add copy button to code blocks
          const copyButton = document.createElement('button');
          copyButton.className = 'code-copy-button';
          copyButton.textContent = 'Copy';
          copyButton.addEventListener('click', () => {
            const codeText = (block as HTMLElement).innerText;
            this.onCopyMessage(codeText);
            copyButton.textContent = 'Copied!';
            setTimeout(() => {
              copyButton.textContent = 'Copy';
            }, 2000);
          });
          
          // Add the copy button to the pre element
          block.parentElement?.appendChild(copyButton);
        });
      } catch (error) {
        console.error('Error rendering markdown:', error);
        messageContent.textContent = text;
      }
    } else {
      // Plain text rendering
      messageContent.textContent = text;
    }
    
    messageElement.appendChild(messageContent);
    
    // Create message actions
    const messageActions = document.createElement('div');
    messageActions.className = 'message-actions';
    
    // Add copy button
    const copyButton = document.createElement('button');
    copyButton.className = 'message-action-button';
    copyButton.textContent = 'Copy';
    copyButton.title = 'Copy to clipboard';
    copyButton.addEventListener('click', () => {
      this.onCopyMessage(text);
      copyButton.textContent = 'Copied!';
      setTimeout(() => {
        copyButton.textContent = 'Copy';
      }, 2000);
    });
    messageActions.appendChild(copyButton);
    
    // Add "Add to Cell" button
    const addToCellButton = document.createElement('button');
    addToCellButton.className = 'message-action-button';
    addToCellButton.textContent = 'Add to Cell';
    addToCellButton.title = 'Add to current cell';
    addToCellButton.addEventListener('click', () => {
      this.onAddToCell(text);
      addToCellButton.textContent = 'Added!';
      setTimeout(() => {
        addToCellButton.textContent = 'Add to Cell';
      }, 2000);
    });
    messageActions.appendChild(addToCellButton);
    
    messageElement.appendChild(messageActions);
    
    // Add to message container
    this.messageContainer.appendChild(messageElement);
    
    // Scroll to the bottom
    this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    
    return messageElement;
  }

  /**
   * Clears all messages from the container
   */
  public clearMessages(): void {
    this.messageContainer.innerHTML = '';
  }

  /**
   * Renders a list of messages
   * @param messages The messages to render
   */
  public renderMessages(messages: ChatMessage[]): void {
    this.clearMessages();
    messages.forEach(message => {
      this.renderMessage(message.text, message.sender, message.isMarkdown);
    });
  }
}
