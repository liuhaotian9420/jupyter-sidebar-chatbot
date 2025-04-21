/**
 * Manages chat history functionality
 */

import { ChatHistoryItem, ChatMessage } from './types';

/**
 * Manages chat history storage, retrieval, and manipulation
 */
export class ChatHistoryManager {
  private chatHistory: ChatHistoryItem[] = [];
  private currentChatId = '';

  /**
   * Creates a new chat session
   * @returns The ID of the newly created chat
   */
  public createNewChat(): string {
    // Generate a unique ID for the chat
    const chatId = `chat-${Date.now()}`;
    
    // Create a new chat item
    const newChat: ChatHistoryItem = {
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
  public addMessage(text: string, sender: 'user' | 'bot', isMarkdown = false): void {
    const chat = this.chatHistory.find(c => c.id === this.currentChatId);
    if (chat) {
      const message: ChatMessage = {
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
  public getCurrentChat(): ChatHistoryItem | undefined {
    return this.chatHistory.find(c => c.id === this.currentChatId);
  }

  /**
   * Gets all chat history
   * @returns Array of all chat history items
   */
  public getAllChats(): ChatHistoryItem[] {
    return [...this.chatHistory];
  }

  /**
   * Loads a chat by ID
   * @param chatId The ID of the chat to load
   * @returns The loaded chat or undefined if not found
   */
  public loadChat(chatId: string): ChatHistoryItem | undefined {
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
  public updateCurrentChatTitle(title: string): void {
    const chat = this.chatHistory.find(c => c.id === this.currentChatId);
    if (chat) {
      chat.title = title;
    }
  }

  /**
   * Gets the current chat ID
   * @returns The current chat ID
   */
  public getCurrentChatId(): string {
    return this.currentChatId;
  }
}
