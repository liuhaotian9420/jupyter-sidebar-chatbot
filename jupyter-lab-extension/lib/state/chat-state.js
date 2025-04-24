"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatState = void 0;
const uuid_1 = require("uuid");
/**
 * Manages the state of chat history and the currently active chat.
 */
class ChatState {
    constructor(apiClient) {
        this.chatHistory = [];
        this.currentChatId = null;
        this.apiClient = null;
        this.apiClient = apiClient;
        // Initialize with an empty chat history for now
        // We'll create the initial chat in the init method, which can be async
        // Initialize the current chat ID to null
        this.currentChatId = null;
        // Defer chat creation to allow for async operations
        this.initializeChat();
    }
    /**
     * Initialize the chat state with an initial chat
     * Creates a new thread and sets up the welcome chat
     */
    async initializeChat() {
        var _a;
        // Create initial chat if none exists
        if (this.chatHistory.length === 0) {
            try {
                // Create a welcome chat first with a local thread ID
                // This ensures we always have a chat even if the API is not available
                const localThreadId = `local-${(0, uuid_1.v4)()}`;
                const welcomeChat = this.createNewChat('Welcome Chat', localThreadId);
                console.log('Created initial welcome chat with local thread_id:', localThreadId);
                // Only try to create a thread if we have an apiClient
                if (this.apiClient) {
                    try {
                        // First check if the API is healthy before trying to create a thread
                        const isHealthy = await this.apiClient.healthCheck();
                        if (!isHealthy) {
                            console.warn('API health check failed, skipping backend thread creation');
                            return; // Keep using the local thread ID
                        }
                        // Attempt to create a backend thread and update the chat with it
                        const thread_id = await this.apiClient.createThread();
                        console.log('Created backend thread for initial chat:', thread_id);
                        // Update the chat with the backend thread_id
                        this.setThreadId(welcomeChat.id, thread_id);
                    }
                    catch (apiError) {
                        console.error('Error creating backend thread for initial chat:', apiError);
                        // Already created with local thread_id, so we're good to continue
                    }
                }
                else {
                    console.log('No API client provided, using local thread_id');
                }
            }
            catch (error) {
                console.error('Error during chat initialization:', error);
                // Final fallback in case of unexpected error
                this.createNewChat('Welcome Chat', `local-${(0, uuid_1.v4)()}`);
            }
        }
        else {
            // Set current chat to the first one if we already have chats
            this.currentChatId = ((_a = this.chatHistory[0]) === null || _a === void 0 ? void 0 : _a.id) || null;
        }
    }
    /**
     * Creates a new chat session and sets it as the current chat.
     * @param title - The initial title for the new chat.
     * @param thread_id - Optional backend thread ID for the chat
     * @returns The newly created chat item.
     */
    createNewChat(title = 'New Chat', thread_id) {
        const chatId = `chat-${(0, uuid_1.v4)()}`; // Use UUID for better uniqueness
        const newChat = {
            id: chatId,
            title: title,
            messages: [],
            thread_id: thread_id, // Store the backend thread ID if provided
            // Optional: Add timestamp or other metadata if needed later
            // createdAt: Date; 
        };
        this.chatHistory.push(newChat);
        this.currentChatId = chatId;
        console.log('Created new chat:', newChat);
        return newChat;
    }
    /**
     * Sets the currently active chat ID.
     * @param chatId - The ID of the chat to set as current.
     */
    setCurrentChatId(chatId) {
        // Validate chat exists first
        const chat = this.getChatById(chatId);
        if (chat) {
            this.currentChatId = chatId;
        }
        else {
            console.warn(`Cannot set current chat: Chat ID ${chatId} not found.`);
        }
    }
    /**
     * Gets the ID of the currently active chat.
     * @returns The current chat ID or null if none is active.
     */
    getCurrentChatId() {
        return this.currentChatId;
    }
    /**
     * Retrieves a specific chat by its ID.
     * @param chatId - The ID of the chat to retrieve.
     * @returns The chat item or undefined if not found.
     */
    getChatById(chatId) {
        return this.chatHistory.find(chat => chat.id === chatId);
    }
    /**
     * Retrieves the currently active chat item.
     * @returns The current chat item or undefined if no chat is active or found.
     */
    getCurrentChat() {
        return this.currentChatId ? this.getChatById(this.currentChatId) : undefined;
    }
    /**
     * Updates the title of the currently active chat.
     * @param newTitle - The new title for the chat.
     */
    updateCurrentChatTitle(newTitle) {
        const chat = this.getCurrentChat();
        if (chat) {
            chat.title = newTitle;
        }
        else {
            console.warn('Cannot update title: No current chat selected.');
        }
    }
    /**
     * Sets a backend thread ID for a specific chat.
     * @param chatId - The ID of the chat to update
     * @param threadId - The backend thread ID to set
     */
    setThreadId(chatId, threadId) {
        const chat = this.getChatById(chatId);
        if (chat) {
            chat.thread_id = threadId;
        }
        else {
            console.warn(`Cannot set thread ID: Chat ID ${chatId} not found.`);
        }
    }
    /**
     * Sets a backend thread ID for the current chat.
     * @param threadId - The backend thread ID to set
     */
    setCurrentChatThreadId(threadId) {
        const chat = this.getCurrentChat();
        if (chat) {
            chat.thread_id = threadId;
        }
        else {
            console.warn('Cannot set thread ID: No current chat selected.');
        }
    }
    /**
     * Gets the backend thread ID for the current chat.
     * @returns The thread ID or undefined if not set
     */
    getCurrentChatThreadId() {
        var _a;
        return (_a = this.getCurrentChat()) === null || _a === void 0 ? void 0 : _a.thread_id;
    }
    /**
     * Gets the backend thread ID for a specific chat.
     * @param chatId - The ID of the chat to get the thread ID for
     * @returns The thread ID or undefined if not set
     */
    getThreadId(chatId) {
        var _a;
        return (_a = this.getChatById(chatId)) === null || _a === void 0 ? void 0 : _a.thread_id;
    }
    /**
     * Adds a message to the currently active chat.
     * @param message - The message object to add.
     */
    addMessageToCurrentChat(message) {
        const currentChat = this.getCurrentChat();
        if (currentChat) {
            currentChat.messages.push(message);
        }
        else {
            console.warn('Cannot add message: No current chat selected.');
        }
    }
    /**
     * Gets all messages from the currently active chat.
     * @returns An array of messages or an empty array if no chat is active.
     */
    getCurrentChatMessages() {
        const currentChat = this.getCurrentChat();
        return currentChat ? currentChat.messages : [];
    }
    /**
     * Gets the entire chat history.
     * @returns An array of all chat history items.
     */
    getChatHistory() {
        return this.chatHistory;
    }
}
exports.ChatState = ChatState;
