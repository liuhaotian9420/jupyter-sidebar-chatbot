/**
 * Handles rendering and managing chat messages
 */
import { ChatMessage } from './types';
/**
 * Handles rendering and managing chat messages in the UI
 */
export declare class MessageRenderer {
    private messageContainer;
    private onCopyMessage;
    private onAddToCell;
    constructor(messageContainer: HTMLDivElement, onCopyMessage: (text: string) => void, onAddToCell: (text: string) => void);
    /**
     * Renders a message in the UI
     * @param text The text content of the message
     * @param sender The sender of the message ('user' or 'bot')
     * @param isMarkdown Whether the message is in Markdown format
     * @returns The created message element
     */
    renderMessage(text: string, sender: 'user' | 'bot', isMarkdown?: boolean): HTMLDivElement;
    /**
     * Clears all messages from the container
     */
    clearMessages(): void;
    /**
     * Renders a list of messages
     * @param messages The messages to render
     */
    renderMessages(messages: ChatMessage[]): void;
}
