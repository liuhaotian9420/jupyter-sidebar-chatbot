"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatState = void 0;
const uuid_1 = require("uuid");
/**
 * Manages the state of chat history and the currently active chat.
 */
class ChatState {
    constructor() {
        var _a;
        this.chatHistory = [];
        this.currentChatId = null;
        // Potential: Load initial state from storage if persistence is added later
        if (this.chatHistory.length === 0) {
            this.createNewChat('Welcome Chat'); // Create an initial chat if none exists
        }
        else {
            this.currentChatId = ((_a = this.chatHistory[0]) === null || _a === void 0 ? void 0 : _a.id) || null; // Set current chat to the first one
        }
    }
    /**
     * Creates a new chat session and sets it as the current chat.
     * @param title - The initial title for the new chat.
     * @returns The newly created chat item.
     */
    createNewChat(title = 'New Chat') {
        const chatId = `chat-${(0, uuid_1.v4)()}`; // Use UUID for better uniqueness
        const newChat = {
            id: chatId,
            title: title,
            messages: []
            // createdAt: new Date() 
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
        if (this.chatHistory.some(chat => chat.id === chatId)) {
            this.currentChatId = chatId;
        }
        else {
            console.warn(`Chat ID ${chatId} not found in history.`);
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
        if (!this.currentChatId) {
            return undefined;
        }
        return this.getChatById(this.currentChatId);
    }
    /**
     * Updates the title of the currently active chat.
     * @param newTitle - The new title for the chat.
     */
    updateCurrentChatTitle(newTitle) {
        const currentChat = this.getCurrentChat();
        if (currentChat) {
            currentChat.title = newTitle;
            console.log(`Updated title for chat ${this.currentChatId} to "${newTitle}"`);
        }
        else {
            console.warn('Cannot update title: No current chat selected.');
        }
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
        return [...this.chatHistory]; // Return a copy to prevent direct modification
    }
}
exports.ChatState = ChatState;
