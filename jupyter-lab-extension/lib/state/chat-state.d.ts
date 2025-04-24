/**
 * Interface for chat messages (user or bot)
 */
export interface ChatMessage {
    sender: 'user' | 'bot';
    content: string;
    timestamp: number;
    isMarkdown?: boolean;
}
/**
 * Interface for chat history items
 */
export interface ChatHistoryItem {
    id: string;
    title: string;
    messages: ChatMessage[];
    thread_id?: string;
}
/**
 * Manages the state of chat history and the currently active chat.
 */
export declare class ChatState {
    private chatHistory;
    private currentChatId;
    private apiClient;
    constructor(apiClient?: any);
    /**
     * Initialize the chat state with an initial chat
     * Creates a new thread and sets up the welcome chat
     */
    private initializeChat;
    /**
     * Creates a new chat session and sets it as the current chat.
     * @param title - The initial title for the new chat.
     * @param thread_id - Optional backend thread ID for the chat
     * @returns The newly created chat item.
     */
    createNewChat(title?: string, thread_id?: string): ChatHistoryItem;
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
     * Sets a backend thread ID for a specific chat.
     * @param chatId - The ID of the chat to update
     * @param threadId - The backend thread ID to set
     */
    setThreadId(chatId: string, threadId: string): void;
    /**
     * Sets a backend thread ID for the current chat.
     * @param threadId - The backend thread ID to set
     */
    setCurrentChatThreadId(threadId: string): void;
    /**
     * Gets the backend thread ID for the current chat.
     * @returns The thread ID or undefined if not set
     */
    getCurrentChatThreadId(): string | undefined;
    /**
     * Gets the backend thread ID for a specific chat.
     * @param chatId - The ID of the chat to get the thread ID for
     * @returns The thread ID or undefined if not set
     */
    getThreadId(chatId: string): string | undefined;
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
