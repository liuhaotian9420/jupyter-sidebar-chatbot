"use strict";
/**
 * Manages chat history functionality
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatHistoryManager = void 0;
/**
 * Manages chat history storage, retrieval, and manipulation
 */
class ChatHistoryManager {
    constructor() {
        this.chatHistory = [];
        this.currentChatId = '';
    }
    /**
     * Creates a new chat session
     * @returns The ID of the newly created chat
     */
    createNewChat() {
        // Generate a unique ID for the chat
        const chatId = `chat-${Date.now()}`;
        // Create a new chat item
        const newChat = {
            id: chatId,
            title: `Chat ${this.chatHistory.length + 1}`,
            messages: []
        };
        // Add to history and set as current
        this.chatHistory.push(newChat);
        this.currentChatId = chatId;
        return chatId;
    }
    /**
     * Adds a message to the current chat
     * @param text Message text
     * @param sender Message sender
     * @param isMarkdown Whether the message is in markdown format
     */
    addMessage(text, sender, isMarkdown = false) {
        const chat = this.chatHistory.find(c => c.id === this.currentChatId);
        if (chat) {
            const message = {
                text,
                sender,
                isMarkdown
            };
            chat.messages.push(message);
        }
    }
    /**
     * Gets the current chat
     * @returns The current chat or undefined if none exists
     */
    getCurrentChat() {
        return this.chatHistory.find(c => c.id === this.currentChatId);
    }
    /**
     * Gets all chat history
     * @returns Array of all chat history items
     */
    getAllChats() {
        return [...this.chatHistory];
    }
    /**
     * Loads a chat by ID
     * @param chatId The ID of the chat to load
     * @returns The loaded chat or undefined if not found
     */
    loadChat(chatId) {
        const chat = this.chatHistory.find(c => c.id === chatId);
        if (chat) {
            this.currentChatId = chatId;
            return chat;
        }
        return undefined;
    }
    /**
     * Updates the title of the current chat
     * @param title The new title
     */
    updateCurrentChatTitle(title) {
        const chat = this.chatHistory.find(c => c.id === this.currentChatId);
        if (chat) {
            chat.title = title;
        }
    }
    /**
     * Gets the current chat ID
     * @returns The current chat ID
     */
    getCurrentChatId() {
        return this.currentChatId;
    }
}
exports.ChatHistoryManager = ChatHistoryManager;
