import { ChatState } from '../state/chat-state';
import { UIManager } from '../ui/ui-manager';
import { MessageRendererCallbacks } from '../ui/message-renderer';
export interface HistoryHandlerCallbacks {
    updateTitleInput: (title: string) => void;
    clearMessageContainer: () => void;
    addRenderedMessage: (messageElement: HTMLElement) => void;
}
/**
 * Manages the display and interaction logic for the chat history view.
 */
export declare class HistoryHandler {
    private chatState;
    private uiManager;
    private callbacks;
    private rendererCallbacks;
    private isHistoryViewActive;
    private historyContainer;
    constructor(chatState: ChatState, uiManager: UIManager, callbacks: HistoryHandlerCallbacks, rendererCallbacks: MessageRendererCallbacks);
    /**
     * Toggles between the main chat view and the history view.
     */
    toggleHistoryView(): void;
    /**
     * Renders the list of past chats in the history container.
     */
    private renderChatHistory;
    /**
     * Loads a specific chat session from history into the main view.
     */
    loadChat(chatId: string): void;
    /**
     * Hides the history view and shows the chat view.
     */
    hideHistoryView(): void;
}
