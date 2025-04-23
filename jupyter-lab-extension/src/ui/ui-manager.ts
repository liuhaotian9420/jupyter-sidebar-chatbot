// import { Widget } from '@lumino/widgets'; // Commented out - unused import
// import { IDocumentManager } from '@jupyterlab/docmanager'; // Commented out - unused import
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
    // Note: ToggleMarkdown and ToggleExpansion are handled internally for now
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
    // Keep references to interactive elements if needed outside
}

/**
 * Manages UI elements and transitions for the chat interface.
 * This acts as a central point for UI manipulations, simplifying dependencies for handlers.
 */
export class UIManager {
    // private docManager: IDocumentManager; // Commented out - unused
    private popupMenuManager: PopupMenuManager;
    private callbacks: UIManagerCallbacks;
    // private widgetNode: HTMLElement; // Commented out - unused
    private layoutElements: LayoutElements;
    private notificationTimeout: number | null = null; // Timeout for the shortcut indicator
    private keyboardShortcutIndicator!: HTMLDivElement; // Add property for the indicator

    // References to managed elements
    private inputField!: HTMLTextAreaElement;
    private messageContainer!: HTMLDivElement;
    private historyContainer!: HTMLDivElement;
    private titleInput!: HTMLInputElement;
    private bottomBarContainer!: HTMLDivElement;
    private markdownToggle!: HTMLInputElement;
    private expandButton!: HTMLButtonElement;

    // Internal UI state
    private isInputExpanded: boolean = false;
    private isMarkdownMode: boolean = false;

    constructor(
        // docManager: IDocumentManager, // Commented out - unused parameter
        popupMenuManager: PopupMenuManager,
        // widgetNode: HTMLElement, // Commented out - unused parameter
        callbacks: UIManagerCallbacks,
        layoutElements: LayoutElements
    ) {
        // this.docManager = docManager; // Commented out - unused assignment
        this.popupMenuManager = popupMenuManager; // Needed for '@' button action
        // this.widgetNode = widgetNode; // Commented out - unused assignment
        this.callbacks = callbacks; // Callbacks to trigger widget/handler logic
        this.layoutElements = layoutElements;

        // Initialize elements that are created outside createLayout if any
        // In this case, all core elements are created within createLayout

        // Create and append the indicator element
        this.keyboardShortcutIndicator = document.createElement('div');
        this.keyboardShortcutIndicator.className = 'jp-llm-ext-keyboard-shortcut-indicator';
        // Append it to the main element managed by the UIManager
        // Ensure mainElement exists before appending
        if (this.layoutElements.mainElement) {
             this.layoutElements.mainElement.appendChild(this.keyboardShortcutIndicator);
        } else {
            console.error('UIManager: Main layout element not found during indicator initialization.');
        }
    }

    /**
     * Returns the core layout elements.
     */
    public getUIElements(): LayoutElements {
        return this.layoutElements;
    }

    /**
     * Creates the main layout structure for the sidebar.
     * @returns References to key DOM elements.
     */
    public createLayout(): UIElements {
        // Create the main container
        const mainContent = document.createElement('div');
        mainContent.className = 'jp-llm-ext-content-wrapper';

        // --- Title Container ---
        const titleContainer = document.createElement('div');
        titleContainer.className = 'jp-llm-ext-title-container';
        this.titleInput = document.createElement('input');
        this.titleInput.className = 'chat-title-input';
        this.titleInput.type = 'text';
        this.titleInput.placeholder = 'Chat title';
        this.titleInput.value = 'New Chat'; // Default value, widget might update later
        this.titleInput.addEventListener('change', this.callbacks.handleUpdateTitle);
        titleContainer.appendChild(this.titleInput);

        // --- Message & History Containers ---
        this.messageContainer = document.createElement('div');
        this.messageContainer.className = 'jp-llm-ext-message-container';
        this.historyContainer = document.createElement('div');
        this.historyContainer.className = 'jp-llm-ext-history-container';
        this.historyContainer.style.display = 'none'; // Initially hidden

        // --- Bottom Bar ---
        this.bottomBarContainer = document.createElement('div');
        this.bottomBarContainer.className = 'jp-llm-ext-bottom-bar-container';

        // Controls Row (Markdown Toggle, Action Buttons)
        const topRow = document.createElement('div');
        topRow.className = 'jp-llm-ext-bottom-bar-row jp-llm-ext-controls-row';
        const controlsContainer = this.createControlsContainer(); // Creates markdown toggle, @, expand, settings
        topRow.appendChild(controlsContainer);

        // Input Row
        const middleRow = document.createElement('div');
        middleRow.className = 'jp-llm-ext-bottom-bar-row jp-llm-ext-input-row';
        this.inputField = document.createElement('textarea');
        this.inputField.placeholder = 'Ask me anything...';
        this.inputField.rows = 1;
        this.inputField.className = 'jp-llm-ext-input-field';
        // Send on Enter (handled by callbacks.handleSendMessage)
        this.inputField.addEventListener('keypress', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                this.callbacks.handleSendMessage();
            }
        });
        // Input listener (e.g., for hiding '@' popup - might move to InputHandler later)
        this.inputField.addEventListener('input', () => {
             // Basic logic for hiding popup if @ removed - refine later
            const cursorPosition = this.inputField.selectionStart;
            const textBeforeCursor = this.inputField.value.slice(0, cursorPosition);
            const hasAtNow = textBeforeCursor.endsWith('@') &&
                             (cursorPosition === 1 ||
                              !!textBeforeCursor[cursorPosition - 2]?.match(/\s/));
            // This needs the widget's `hasAtSymbol` state or similar
            // For now, this logic might be incomplete or moved.
             if (!hasAtNow) {
                 this.popupMenuManager.hidePopupMenu();
             }
        });
        middleRow.appendChild(this.inputField);

        // Buttons Row (Send, New Chat, History)
        const bottomRow = document.createElement('div');
        bottomRow.className = 'jp-llm-ext-bottom-bar-row jp-llm-ext-buttons-row';
        const sendButton = this.createButton('Send', 'Send message');
        sendButton.classList.add('jp-llm-ext-send-button'); // Specific class for send
        sendButton.addEventListener('click', this.callbacks.handleSendMessage);
        const newChatButton = this.createButton('+ New Chat', 'Start a new chat');
        newChatButton.addEventListener('click', this.callbacks.handleNewChat);
        const historyButton = this.createButton('History', 'View chat history');
        historyButton.addEventListener('click', this.callbacks.handleToggleHistory);
        bottomRow.appendChild(sendButton);
        bottomRow.appendChild(newChatButton);
        bottomRow.appendChild(historyButton);

        // Assemble Bottom Bar
        this.bottomBarContainer.appendChild(topRow);
        this.bottomBarContainer.appendChild(middleRow);
        this.bottomBarContainer.appendChild(bottomRow);

        // --- Assemble Main Content ---
        mainContent.appendChild(titleContainer);
        mainContent.appendChild(this.messageContainer);
        mainContent.appendChild(this.historyContainer);
        mainContent.appendChild(this.bottomBarContainer);

        // Return references to key elements
        return {
            mainLayout: mainContent,
            messageContainer: this.messageContainer,
            inputField: this.inputField,
            titleInput: this.titleInput,
            historyContainer: this.historyContainer,
            bottomBarContainer: this.bottomBarContainer,
        };
    }

    /**
     * Creates the controls container with toggles and action buttons.
     */
    private createControlsContainer(): HTMLElement {
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'jp-llm-ext-controls-container';

        // --- Markdown Toggle ---
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'jp-llm-ext-toggle-container';
        this.markdownToggle = document.createElement('input');
        this.markdownToggle.type = 'checkbox';
        this.markdownToggle.id = 'markdown-toggle'; // Ensure unique ID or handle differently
        this.markdownToggle.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            this.isMarkdownMode = target.checked;
            // Update placeholder based on mode
            this.inputField.placeholder = this.isMarkdownMode
                ? 'Write markdown here...\\n\\n# Example heading\\n- List item\\n\\n```code block```'
                : 'Ask me anything...';
            // Future: Notify widget/handler if needed: this.callbacks.handleToggleMarkdown(this.isMarkdownMode);
        });
        const toggleLabel = document.createElement('label');
        toggleLabel.htmlFor = 'markdown-toggle';
        toggleLabel.textContent = 'Markdown mode';
        toggleContainer.appendChild(this.markdownToggle);
        toggleContainer.appendChild(toggleLabel);

        // --- Action Buttons (@, Expand, Settings) ---
        const actionButtonsContainer = document.createElement('div');
        actionButtonsContainer.className = 'jp-llm-ext-action-buttons-container';

        // '@' Button
        const atButton = this.createButton('@', 'Browse cells, code, files, and more');
        atButton.addEventListener('click', (event: MouseEvent) => {
            // Pass event and button to the callback for positioning
             this.callbacks.handleShowPopupMenu(event, event.currentTarget as HTMLElement);
        });

        // Expand Button (store reference)
        this.expandButton = this.createButton('⤢', 'Expand input');
        this.expandButton.addEventListener('click', () => this.toggleInputExpansion());

        // Settings Button
        const settingsButton = this.createButton('⚙️', 'Settings');
        settingsButton.addEventListener('click', this.callbacks.handleShowSettings);

        // Add buttons to container
        actionButtonsContainer.appendChild(atButton);
        actionButtonsContainer.appendChild(this.expandButton);
        actionButtonsContainer.appendChild(settingsButton);

        // Assemble Controls Container
        controlsContainer.appendChild(toggleContainer);
        controlsContainer.appendChild(actionButtonsContainer);

        return controlsContainer;
    }

    /**
     * Toggles the expansion state of the input field.
     */
    private toggleInputExpansion(): void {
        if (!this.inputField || !this.expandButton) return; // Ensure elements exist

        this.isInputExpanded = !this.isInputExpanded;
        if (this.isInputExpanded) {
            this.inputField.style.height = '200px'; // Use CSS classes ideally
            this.inputField.style.resize = 'vertical';
            this.expandButton.textContent = '⤡';
            this.expandButton.title = 'Collapse input';
        } else {
            this.inputField.style.height = ''; // Reset height
            this.inputField.style.resize = 'none';
            this.inputField.rows = 1; // Ensure collapse
            this.expandButton.textContent = '⤢';
            this.expandButton.title = 'Expand input';
        }
        // Future: Notify widget/handler if needed: this.callbacks.handleToggleExpansion(this.isInputExpanded);
    }

    /**
     * Helper function to create a styled button.
     */
    private createButton(text: string, tooltip: string): HTMLButtonElement {
        const button = document.createElement('button');
        button.textContent = text;
        button.title = tooltip;
        // Apply base JupyterLab button class and our specific class
        button.className = 'jp-Button jp-llm-ext-action-button';
        return button;
    }

    /**
     * Appends a new chat message element to the message container and scrolls down.
     * @param element The message element (user or bot) to add.
     */
    public addChatMessageElement(element: HTMLElement): void {
        if (this.messageContainer) {
            this.messageContainer.appendChild(element);
            this.scrollToBottom(); // Scroll after adding the new element
        } else {
            console.error('Message container not initialized in UIManager.');
        }
    }

    /**
     * Scrolls the message container to the bottom.
     */
    public scrollToBottom(): void {
        if (this.messageContainer) {
            this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
        } else {
            console.error('Message container not initialized in UIManager.');
        }
    }

    /**
     * Switches the view to show the chat history.
     */
    public showHistoryView(): void {
        this.layoutElements.messageContainer.style.display = 'none';
        this.layoutElements.historyContainer.style.display = 'block';
        this.layoutElements.bottomBarContainer.style.display = 'none';
        // Optionally update header/title elements if needed
    }

    /**
     * Switches the view to show the main chat interface.
     */
    public showChatView(): void {
        this.layoutElements.historyContainer.style.display = 'none';
        this.layoutElements.messageContainer.style.display = 'block';
        this.layoutElements.bottomBarContainer.style.display = 'flex'; // Assuming flex display
        this.scrollToBottom(); // Scroll down when showing chat
    }

    /**
     * Clears all messages from the message container.
     */
    public clearMessageContainer(): void {
        this.layoutElements.messageContainer.innerHTML = '';
    }

    /**
     * Updates the value of the title input field.
     */
    public updateTitleInput(title: string): void {
        if (this.layoutElements.titleInput) {
            this.layoutElements.titleInput.value = title;
        }
    }

    /**
     * Creates and returns a container structure for a bot message,
     * including elements for streaming text and final rendered content.
     * This helps manage the transition from streaming to final message display.
     */
    public createBotMessageContainer(): {
        botMessageDiv: HTMLDivElement;
        streamingDiv: HTMLDivElement;
        contentDiv: HTMLDivElement;
    } {
        const botMessageDiv = document.createElement('div');
        botMessageDiv.className = 'jp-llm-ext-bot-message'; // Base class

        // Div for streaming content (initially visible)
        const streamingDiv = document.createElement('div');
        streamingDiv.className = 'jp-llm-ext-streaming-content';
        streamingDiv.style.display = 'block'; // Show streaming initially

        // Div for final rendered content (initially hidden)
        const contentDiv = document.createElement('div');
        contentDiv.className = 'jp-llm-ext-rendered-content';
        contentDiv.style.display = 'none'; // Hide final content initially

        botMessageDiv.appendChild(streamingDiv);
        botMessageDiv.appendChild(contentDiv);

        // Add the whole container to the message list *before* streaming starts
        this.addChatMessageElement(botMessageDiv);

        return { botMessageDiv, streamingDiv, contentDiv };
    }

    /**
     * Displays a temporary notification message.
     * TODO: Implement a more robust notification system (e.g., toast).
     */
    public showNotification(message: string, type: 'success' | 'error' | 'info', duration: number = 3000): void {
        console.log(`Notification (${type}): ${message}`);

        // Basic temporary implementation using the existing indicator element
        const indicator = this.layoutElements.mainElement.querySelector('.jp-llm-ext-keyboard-shortcut-indicator') as HTMLDivElement;
        if (indicator) {
             if (this.notificationTimeout) {
                clearTimeout(this.notificationTimeout); // Clear previous timeout
            }
            indicator.textContent = message;
            indicator.className = `jp-llm-ext-keyboard-shortcut-indicator visible jp-llm-ext-notification-${type}`; // Add type class
            
            this.notificationTimeout = window.setTimeout(() => {
                indicator.classList.remove('visible');
                 this.notificationTimeout = null;
            }, duration);
        } else {
            console.warn('Notification indicator element not found for UIManager.');
        }
    }

    /**
     * Shows a visual indicator for keyboard shortcuts.
     * @param text The text to display in the indicator.
     */
    public showIndicator(text: string): void {
        if (!this.keyboardShortcutIndicator) return; // Guard

        this.keyboardShortcutIndicator.textContent = text;
        this.keyboardShortcutIndicator.classList.add('visible');

        // Clear any existing timeout to prevent multiple timeouts running
        if (this.notificationTimeout) {
            clearTimeout(this.notificationTimeout);
        }

        // Set new timeout to hide the indicator
        this.notificationTimeout = window.setTimeout(() => {
            if (this.keyboardShortcutIndicator) { // Check if element still exists
                this.keyboardShortcutIndicator.classList.remove('visible');
            }
            this.notificationTimeout = null;
        }, 1000); // Hide after 1 second
    }

    /**
     * Clears the indicator immediately and cancels any pending hide timeout.
     * Useful if the widget is hidden while the indicator is shown.
     */
    public clearIndicator(): void {
         if (!this.keyboardShortcutIndicator) return;
         this.keyboardShortcutIndicator.classList.remove('visible');
         this.keyboardShortcutIndicator.textContent = '';
         if (this.notificationTimeout) {
            clearTimeout(this.notificationTimeout);
            this.notificationTimeout = null;
        }
    }

    // --- Methods for updating UI elements will be added later ---
    // e.g., updateMessageContainer(html: string), showHistoryView(), showChatView()

    // --- Potentially add methods to get element references if needed externally ---
    // public getInputField(): HTMLTextAreaElement { return this.inputField; }
    // etc.
} 