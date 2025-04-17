import { Widget } from '@lumino/widgets';
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
    private commandMenuContainer;
    private keyboardShortcutIndicator;
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
     * Lists the contents of the current directory
     */
    private listCurrentDirectoryContents;
    /**
     * Shows the command menu at the specified position
     */
    private showCommandMenu;
    /**
     * Hides the command menu
     */
    private hideCommandMenu;
    /**
     * Handles clicks outside the command menu
     */
    private handleClickOutside;
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
}
