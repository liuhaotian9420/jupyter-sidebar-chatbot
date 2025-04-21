import { Widget } from '@lumino/widgets';
import { Message } from '@lumino/messaging';
import { IDocumentManager } from '@jupyterlab/docmanager';
/**
 * Main sidebar widget for the AI chat interface
 */
export declare class SimpleSidebarWidget extends Widget {
    private messageContainer;
    private inputField;
    private isMarkdownMode;
    private inputContainer;
    private isInputExpanded;
    private docManager;
    private chatHistory;
    private currentChatId;
    private titleInput;
    private isHistoryViewActive;
    private historyContainer;
    private apiClient;
    private popupMenuContainer;
    private keyboardShortcutIndicator;
    private settingsModalContainer;
    private currentNotebook;
    private currentMenuLevel;
    private currentMenuPath;
    private menuHistory;
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
     * Lists the contents of the current directory
     * @param filterType Optional parameter to filter results by type ('all', 'file', or 'directory')
     */
    listCurrentDirectoryContents(filterType?: 'all' | 'file' | 'directory'): Promise<string[] | null>;
    /**
     * Handles clicks outside the popup menu to close it.
     */
    private handleClickOutside;
    /**
     * Shows the popup menu at the specified position
     */
    private showPopupMenu;
    /**
     * Creates menu items from commands and appends them to the popup menu container
     */
    private createMenuItems;
    /**
     * Loads and displays directory contents in the popup menu
     */
    private loadDirectoryContents;
    /**
     * Sets the current directory path based on context
     */
    private setCurrentDirectoryPath;
    /**
     * Hides the popup menu
     */
    private hidePopupMenu;
    /**
     * Handle widget detachment.
     */
    protected onBeforeDetach(msg: Message): void;
    /**
     * Handles the code command - inserts selected code
     */
    private handleCodeCommand;
    /**
     * Handles the cell command - inserts entire cell content
     */
    private handleCellCommand;
    /**
     * Appends text to the input field with proper spacing
     */
    private appendToInput;
    /**
     * Gets the selected text from cell context
     */
    private getSelectedText;
    private createSettingsModal;
    private showSettingsModal;
    private hideSettingsModal;
}
