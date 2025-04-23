/**
 * Interface for a single message within a chat.
 */
export interface ChatMessage {
    text: string;
    sender: 'user' | 'bot';
    isMarkdown: boolean;
}
/**
 * Interface for a chat session.
 */
export interface ChatHistoryItem {
    id: string;
    title: string;
    messages: ChatMessage[];
}
/**
 * Manages the state of chat history and the currently active chat.
 */
export declare class ChatState {
    private chatHistory;
    private currentChatId;
    constructor();
    /**
     * Creates a new chat session and sets it as the current chat.
     * @param title - The initial title for the new chat.
     * @returns The newly created chat item.
     */
    createNewChat(title?: string): ChatHistoryItem;
    /**
     * Sets the currently active chat ID.
     * @param chatId - The ID of the chat to set as current.
     */
    setCurrentChatId(chatId: string): void;
    /**
     * Gets the ID of the currently active chat.
     * @returns The current chat ID or null if none is active.
     */
    getCurrentChatId(): string | null;
    /**
     * Retrieves a specific chat by its ID.
     * @param chatId - The ID of the chat to retrieve.
     * @returns The chat item or undefined if not found.
     */
    getChatById(chatId: string): ChatHistoryItem | undefined;
    /**
     * Retrieves the currently active chat item.
     * @returns The current chat item or undefined if no chat is active or found.
     */
    getCurrentChat(): ChatHistoryItem | undefined;
    /**
     * Updates the title of the currently active chat.
     * @param newTitle - The new title for the chat.
     */
    updateCurrentChatTitle(newTitle: string): void;
    /**
     * Adds a message to the currently active chat.
     * @param message - The message object to add.
     */
    addMessageToCurrentChat(message: ChatMessage): void;
    /**
     * Gets all messages from the currently active chat.
     * @returns An array of messages or an empty array if no chat is active.
     */
    getCurrentChatMessages(): ChatMessage[];
    /**
     * Gets the entire chat history.
     * @returns An array of all chat history items.
     */
    getChatHistory(): ChatHistoryItem[];
}
