/**
 * Manages chat history functionality
 */
import { ChatHistoryItem } from './types';
/**
 * Manages chat history storage, retrieval, and manipulation
 */
export declare class ChatHistoryManager {
    private chatHistory;
    private currentChatId;
    /**
     * Creates a new chat session
     * @returns The ID of the newly created chat
     */
    createNewChat(): string;
    /**
     * Adds a message to the current chat
     * @param text Message text
     * @param sender Message sender
     * @param isMarkdown Whether the message is in markdown format
     */
    addMessage(text: string, sender: 'user' | 'bot', isMarkdown?: boolean): void;
    /**
     * Gets the current chat
     * @returns The current chat or undefined if none exists
     */
    getCurrentChat(): ChatHistoryItem | undefined;
    /**
     * Gets all chat history
     * @returns Array of all chat history items
     */
    getAllChats(): ChatHistoryItem[];
    /**
     * Loads a chat by ID
     * @param chatId The ID of the chat to load
     * @returns The loaded chat or undefined if not found
     */
    loadChat(chatId: string): ChatHistoryItem | undefined;
    /**
     * Updates the title of the current chat
     * @param title The new title
     */
    updateCurrentChatTitle(title: string): void;
    /**
     * Gets the current chat ID
     * @returns The current chat ID
     */
    getCurrentChatId(): string;
}
