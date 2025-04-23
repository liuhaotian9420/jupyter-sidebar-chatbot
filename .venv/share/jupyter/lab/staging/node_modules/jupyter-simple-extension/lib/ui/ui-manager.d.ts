import { PopupMenuManager } from '../handlers/popup-menu-manager';
import { LayoutElements } from './layout-builder';
/**
 * Callbacks for UI actions to be handled by the main widget or handlers.
 */
export interface UIManagerCallbacks {
    handleNewChat: () => void;
    handleToggleHistory: () => void;
    handleSendMessage: () => void;
    handleShowSettings: (event: MouseEvent) => void;
    handleShowPopupMenu: (event: MouseEvent, targetButton: HTMLElement) => void;
    handleUpdateTitle: () => void;
}
/**
 * References to key DOM elements created by the UIManager.
 */
export interface UIElements {
    mainLayout: HTMLElement;
    messageContainer: HTMLDivElement;
    inputField: HTMLTextAreaElement;
    titleInput: HTMLInputElement;
    historyContainer: HTMLDivElement;
    bottomBarContainer: HTMLDivElement;
}
/**
 * Manages UI elements and transitions for the chat interface.
 * This acts as a central point for UI manipulations, simplifying dependencies for handlers.
 */
export declare class UIManager {
    private popupMenuManager;
    private callbacks;
    private layoutElements;
    private notificationTimeout;
    private keyboardShortcutIndicator;
    private inputField;
    private messageContainer;
    private historyContainer;
    private titleInput;
    private bottomBarContainer;
    private markdownToggle;
    private expandButton;
    private isInputExpanded;
    private isMarkdownMode;
    getIsMarkdownMode(): boolean;
    constructor(popupMenuManager: PopupMenuManager, callbacks: UIManagerCallbacks, layoutElements: LayoutElements);
    /**
     * Returns the core layout elements.
     */
    getUIElements(): LayoutElements;
    /**
     * Creates the main layout structure for the sidebar.
     * @returns References to key DOM elements.
     */
    createLayout(): UIElements;
    /**
     * Creates the controls container with toggles and action buttons.
     */
    private createControlsContainer;
    /**
     * Toggles the expansion state of the input field.
     */
    private toggleInputExpansion;
    /**
     * Helper function to create a styled button.
     */
    private createButton;
    /**
     * Appends a new chat message element to the message container and scrolls down.
     * @param element The message element (user or bot) to add.
     */
    addChatMessageElement(element: HTMLElement): void;
    /**
     * Scrolls the message container to the bottom.
     */
    scrollToBottom(): void;
    /**
     * Switches the view to show the chat history.
     */
    showHistoryView(): void;
    /**
     * Switches the view to show the main chat interface.
     */
    showChatView(): void;
    /**
     * Clears all messages from the message container.
     */
    clearMessageContainer(): void;
    /**
     * Updates the value of the title input field.
     */
    updateTitleInput(title: string): void;
    /**
     * Creates and returns a container structure for a bot message,
     * including elements for streaming text and final rendered content.
     * This helps manage the transition from streaming to final message display.
     */
    createBotMessageContainer(): {
        botMessageDiv: HTMLDivElement;
        streamingDiv: HTMLDivElement;
        contentDiv: HTMLDivElement;
    };
    /**
     * Displays a temporary notification message.
     * TODO: Implement a more robust notification system (e.g., toast).
     */
    showNotification(message: string, type: 'success' | 'error' | 'info', duration?: number): void;
    /**
     * Shows a visual indicator for keyboard shortcuts.
     * @param text The text to display in the indicator.
     */
    showIndicator(text: string): void;
    /**
     * Clears the indicator immediately and cancels any pending hide timeout.
     * Useful if the widget is hidden while the indicator is shown.
     */
    clearIndicator(): void;
}
