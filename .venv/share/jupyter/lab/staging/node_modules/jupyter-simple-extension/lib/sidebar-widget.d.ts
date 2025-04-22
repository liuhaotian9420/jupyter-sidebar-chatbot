import { Widget } from '@lumino/widgets';
import { IDocumentManager } from '@jupyterlab/docmanager';
/**
 * Main sidebar widget for the AI chat interface
 */
export declare class SimpleSidebarWidget extends Widget {
    private messageContainer;
    private inputField;
    private isMarkdownMode;
    private isInputExpanded;
    private docManager;
    private chatHistory;
    private currentChatId;
    private titleInput;
    private isHistoryViewActive;
    private historyContainer;
    private apiClient;
    private keyboardShortcutIndicator;
    private settingsModalContainer;
    private popupMenuManager;
    private bottomBarContainer;
    private hasAtSymbol;
    constructor(docManager: IDocumentManager);
    /**
     * Shows a visual indicator for keyboard shortcuts
     */
    private showKeyboardShortcutIndicator;
    /**
     * Handles keyboard shortcuts
     */
    private handleKeyDown;
    /**
     * Disposes all resources
     */
    dispose(): void;
    /**
     * Creates the main layout for the sidebar
     */
    private createLayout;
    /**
     * Creates a new chat session
     */
    private createNewChat;
    /**
     * Toggles between chat view and history view
     */
    private toggleHistoryView;
    /**
     * Renders the chat history in the history container
     */
    private renderChatHistory;
    /**
     * Loads a chat from history
     */
    private loadChat;
    /**
     * Updates the title of the current chat
     */
    private updateCurrentChatTitle;
    /**
     * Creates the controls container with toggles and action buttons
     */
    private createControlsContainer;
    /**
     * Toggles the expansion state of the input field
     */
    private toggleInputExpansion;
    /**
     * Helper function to create a button with given text and tooltip
     */
    private createButton;
    /**
     * Handles sending a message from the input field
     */
    private handleSendMessage;
    /**
     * Handles sending an automatic message (like confirmed/rejected) from the UI
     */
    private handleSendAutoMessage;
    /**
     * Adds a message to the chat interface
     */
    private addMessage;
    /**
     * Copies message content to clipboard
     */
    private copyMessageToClipboard;
    /**
     * Adds message content to the current cell
     */
    private addMessageToCell;
    /**
     * Gets the currently selected text from the active notebook cell.
     * (Helper for PopupMenuManager callback)
     */
    private getSelectedText;
    /**
     * Gets the content of the currently active notebook cell.
     * (Helper for PopupMenuManager callback)
     */
    private getCurrentCellContent;
    /**
     * Appends text to the input field with proper spacing
     */
    private appendToInput;
    private createSettingsModal;
    private showSettingsModal;
    private loadSavedSettings;
    private hideSettingsModal;
    private popSaveSuccess;
    /**
     * Gets cell content by index from the current notebook and inserts it into the input field
     */
    private insertCellByIndex;
    /**
     * Detects the programming language from code block content
     */
    private detectLanguage;
    /**
     * Highlights code with appropriate syntax highlighting
     */
    private highlightCode;
    private copyToClipboard;
    /**
     * Copies an image to the clipboard
     */
    private copyImageToClipboard;
}
