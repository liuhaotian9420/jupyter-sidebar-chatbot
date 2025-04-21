"use strict";
/**
 * Handles rendering and managing chat messages
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRenderer = void 0;
const marked_1 = require("marked");
const dompurify_1 = __importDefault(require("dompurify"));
const markdown_config_1 = require("../markdown-config");
/**
 * Handles rendering and managing chat messages in the UI
 */
class MessageRenderer {
    constructor(messageContainer, onCopyMessage, onAddToCell) {
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
    renderMessage(text, sender, isMarkdown = false) {
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
                const processedMarkdown = (0, markdown_config_1.preprocessMarkdown)(text);
                // Convert markdown to HTML
                const rawHtml = marked_1.marked.parse(processedMarkdown);
                // Sanitize HTML (cast to string to fix type issue)
                const sanitizedHtml = dompurify_1.default.sanitize(rawHtml);
                // Set the HTML content
                messageContent.innerHTML = sanitizedHtml;
                // Add syntax highlighting to code blocks
                const codeBlocks = messageContent.querySelectorAll('pre code');
                codeBlocks.forEach((block) => {
                    var _a, _b;
                    // Add a class for styling
                    (_a = block.parentElement) === null || _a === void 0 ? void 0 : _a.classList.add('highlighted-code');
                    // Add copy button to code blocks
                    const copyButton = document.createElement('button');
                    copyButton.className = 'code-copy-button';
                    copyButton.textContent = 'Copy';
                    copyButton.addEventListener('click', () => {
                        const codeText = block.innerText;
                        this.onCopyMessage(codeText);
                        copyButton.textContent = 'Copied!';
                        setTimeout(() => {
                            copyButton.textContent = 'Copy';
                        }, 2000);
                    });
                    // Add the copy button to the pre element
                    (_b = block.parentElement) === null || _b === void 0 ? void 0 : _b.appendChild(copyButton);
                });
            }
            catch (error) {
                console.error('Error rendering markdown:', error);
                messageContent.textContent = text;
            }
        }
        else {
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
    clearMessages() {
        this.messageContainer.innerHTML = '';
    }
    /**
     * Renders a list of messages
     * @param messages The messages to render
     */
    renderMessages(messages) {
        this.clearMessages();
        messages.forEach(message => {
            this.renderMessage(message.text, message.sender, message.isMarkdown);
        });
    }
}
exports.MessageRenderer = MessageRenderer;
