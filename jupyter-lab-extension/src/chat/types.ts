/**
 * Types and interfaces for the chat functionality
 */

/**
 * Interface for a chat history item, representing a single chat session with its metadata and messages.
 */
export interface ChatHistoryItem {
  id: string;
  title: string;
  messages: ChatMessage[];
}

/**
 * Interface for a single chat message
 */
export interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  isMarkdown: boolean;
}

/**
 * Interface for menu navigation state
 */
export interface MenuState {
  currentMenuLevel: 'top' | 'files' | 'directories';
  currentMenuPath: string;
  menuHistory: { level: 'top' | 'files' | 'directories', path: string }[];
}

/**
 * Interface for popup menu commands
 */
export interface MenuCommand {
  label: string;
  description: string;
  action: () => void;
}
