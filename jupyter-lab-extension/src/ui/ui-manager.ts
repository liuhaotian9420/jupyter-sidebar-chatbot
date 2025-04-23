import { PopupMenuManager } from '../handlers/popup-menu-manager';
import { LayoutElements } from './layout-builder';

/**
 * Callbacks for UI actions to be handled by the main widget or handlers.
 */
export interface UIManagerCallbacks {
    handleNewChat: () => void;
    handleToggleHistory: () => void;
    handleSendMessage: (message: string) => void;
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
    inputField: HTMLDivElement;
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
    private popupMenuManager: PopupMenuManager;
    private callbacks: UIManagerCallbacks;
    private layoutElements: LayoutElements;
    private notificationTimeout: number | null = null; // Timeout for the shortcut indicator
    private keyboardShortcutIndicator!: HTMLDivElement; // Add property for the indicator

    // References to managed elements
    private inputField!: HTMLDivElement;
    private messageContainer!: HTMLDivElement;
    private historyContainer!: HTMLDivElement;
    private titleInput!: HTMLInputElement;
    private bottomBarContainer!: HTMLDivElement;
    private markdownToggle!: HTMLInputElement;
    private expandButton!: HTMLButtonElement;

    // Internal UI state
    private isInputExpanded: boolean = false;
    private isMarkdownMode: boolean = false;
    // Store the range where @ was typed to handle insertion
    private activeReferenceTriggerRange: Range | null = null;

    // Add this getter method
    public getIsMarkdownMode(): boolean {
        return this.isMarkdownMode;
    }

    constructor(
        popupMenuManager: PopupMenuManager,
        callbacks: UIManagerCallbacks,
        layoutElements: LayoutElements
    ) {
        this.popupMenuManager = popupMenuManager;
        this.callbacks = callbacks;
        this.layoutElements = layoutElements; // Store the layout elements

        // Ensure DOM elements are created before trying to access them
        const uiElements = this.createLayout();

        // Assign created elements to class properties
        this.inputField = uiElements.inputField;
        this.messageContainer = uiElements.messageContainer;
        this.historyContainer = uiElements.historyContainer;
        this.titleInput = uiElements.titleInput;
        this.bottomBarContainer = uiElements.bottomBarContainer;

        // Append the main layout to the provided layout container
        this.layoutElements.container.appendChild(uiElements.mainLayout);

        // Initialize and append the keyboard shortcut indicator
        this.keyboardShortcutIndicator = document.createElement('div');
        this.keyboardShortcutIndicator.className = 'jp-llm-ext-shortcut-indicator';
        this.keyboardShortcutIndicator.style.display = 'none'; // Hidden by default

        // Append the indicator to the main layout or another appropriate place
        // Ensure mainLayout exists before appending
        if (uiElements.mainLayout) {
             // Prepend within the main content wrapper, before other elements
             // Or append to bottom bar, depending on desired position
             this.bottomBarContainer.insertAdjacentElement('afterend', this.keyboardShortcutIndicator);
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
        this.inputField = document.createElement('div');
        this.inputField.setAttribute('contenteditable', 'true');
        this.inputField.setAttribute('role', 'textbox');
        this.inputField.setAttribute('aria-multiline', 'true');
        this.inputField.setAttribute('data-placeholder', 'Ask me anything...');
        this.inputField.className = 'jp-llm-ext-input-field';

        // --- Input Event Listener for @ detection ---
        this.inputField.addEventListener('input', (event: Event) => {
            this.handleInputForReference();
        });
        // --- End Input Event Listener ---

        this.inputField.addEventListener('keydown', (event: KeyboardEvent) => {
            const selection = window.getSelection();

            // --- Backspace handling for widgets ---
            if (event.key === 'Backspace' && selection && selection.isCollapsed) {
                const range = selection.getRangeAt(0);
                const nodeBefore = range.startContainer.childNodes[range.startOffset - 1] || range.startContainer.previousSibling; 
                
                // Check nodeBefore more carefully
                 let potentialWidget: Node | null = null;
                 if (range.startOffset > 0 && range.startContainer.childNodes.length >= range.startOffset) {
                     potentialWidget = range.startContainer.childNodes[range.startOffset - 1];
                 } else if (range.startOffset === 0 && range.startContainer.previousSibling) {
                     potentialWidget = range.startContainer.previousSibling;
                 } else if (range.startContainer !== this.inputField && range.startContainer.parentNode === this.inputField && range.startOffset === 0) {
                     // Cursor might be at the start of a text node following a widget
                     potentialWidget = range.startContainer.previousSibling;
                 }

                if (
                    potentialWidget && 
                    potentialWidget.nodeType === Node.ELEMENT_NODE && 
                    (potentialWidget as HTMLElement).classList.contains('jp-llm-ext-ref-widget')
                ) {
                    event.preventDefault(); // Stop default backspace
                    potentialWidget.remove(); // Remove the entire widget node
                    // Manually trigger input event for consistency?
                    this.inputField.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                    return; // Stop further processing for this keydown
                }
            }
            // --- End Backspace handling ---

            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault(); // Prevent default newline insertion
                const message = this.getSerializedInput();
                if (message.trim()) {
                    this.callbacks.handleSendMessage(message);
                    this.clearInputField();
                }
            }
            // --- New: Handle Tab/Escape for popup interaction ---
            else if (this.popupMenuManager.isPopupMenuVisible()) {
                if (event.key === 'Tab' || event.key === 'Escape' || event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Enter') {
                    // Let the PopupMenuManager's document keydown handler manage these
                    // We just need to prevent the default input field behavior
                     if (event.key !== 'Enter') { // Allow Enter to potentially work if menu doesn't handle it
                        event.preventDefault();
                        // We don't stop propagation here; let the document handler in PopupMenuManager receive it.
                    }
                }
            }
            // --- End New ---
        });

        // --- Copy/Paste Event Listeners ---
        this.inputField.addEventListener('copy', (event: ClipboardEvent) => {
            this.handleCopy(event);
        });
        this.inputField.addEventListener('paste', (event: ClipboardEvent) => {
            this.handlePaste(event);
        });
        // --- End Copy/Paste ---

        middleRow.appendChild(this.inputField);

        // Buttons Row (Send, New Chat, History)
        const bottomRow = document.createElement('div');
        bottomRow.className = 'jp-llm-ext-bottom-bar-row jp-llm-ext-buttons-row';
        const sendButton = this.createButton('Send', 'Send message');
        sendButton.classList.add('jp-llm-ext-send-button'); // Specific class for send
        sendButton.addEventListener('click', () => {
            const message = this.getSerializedInput();
            if (message.trim()) {
                 this.callbacks.handleSendMessage(message);
                 this.clearInputField();
            }
        });
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
            const placeholderText = this.isMarkdownMode
                ? 'Write markdown here...\\n\\n# Example heading\\n- List item\\n\\n```code block```'
                : 'Ask me anything...';
            this.inputField.setAttribute('data-placeholder', placeholderText);
            this.inputField.blur();
            this.inputField.focus();
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
            this.inputField.style.height = '200px'; // Keep for now, consider CSS classes
            this.inputField.style.resize = 'vertical'; // Works on divs too (if overflow visible/auto)
            this.expandButton.textContent = '⤡';
            this.expandButton.title = 'Collapse input';
        } else {
            this.inputField.style.height = ''; // Reset height
            this.inputField.style.resize = 'none';
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

    /**
     * Serializes the content of the contenteditable input field.
     * Converts divs/brs used for line breaks into newline characters.
     * In the future, this will handle custom ref-text widgets.
     * @returns The serialized string content.
     */
    public getSerializedInput(): string {
        if (!this.inputField) {
            return '';
        }

        let content = '';
        const nodes = this.inputField.childNodes;

        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];

            if (node.nodeType === Node.TEXT_NODE) {
                content += node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as HTMLElement;
                // Handle line breaks: Treat divs and brs as newlines
                if (element.tagName === 'DIV' || element.tagName === 'BR') {
                    // Add newline only if the previous content didn't end with one
                    // or if it's the very first element
                    if (i > 0 && !content.endsWith('\n')) {
                         content += '\n';
                    }
                    // Recursively serialize content within divs (handles nested structures)
                    if (element.tagName === 'DIV') {
                        content += this.serializeNodeChildren(element); // Use helper for children
                    }
                } else if (element.hasAttribute('data-ref-text')) { // Future widget handling
                     // Check for our custom widget attribute
                    content += element.getAttribute('data-ref-text') || '';
                } else {
                    // For other inline elements (like span from formatting), get their text content
                    content += element.textContent;
                }
            }
        }
        // Trim leading/trailing whitespace and normalize multiple newlines
        return content.trim().replace(/\n{2,}/g, '\n\n');
    }

    /**
     * Helper function to recursively serialize child nodes of an element.
     * Used by getSerializedInput to handle nested structures like divs.
     */
    private serializeNodeChildren(parentNode: Node): string {
        let childContent = '';
        const nodes = parentNode.childNodes;
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (node.nodeType === Node.TEXT_NODE) {
                childContent += node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as HTMLElement;
                if (element.tagName === 'DIV' || element.tagName === 'BR') {
                    if (i > 0 && !childContent.endsWith('\n')) {
                         childContent += '\n';
                    }
                    if (element.tagName === 'DIV') {
                         childContent += this.serializeNodeChildren(element);
                    }
                } else if (element.hasAttribute('data-ref-text')) {
                    childContent += element.getAttribute('data-ref-text') || '';
                } else {
                    childContent += element.textContent;
                }
            }
        }
        return childContent;
    }

    /**
     * Clears the content of the input field.
     */
    public clearInputField(): void {
        if (this.inputField) {
            this.inputField.innerHTML = '';
            // Reset reference state as well
            this.activeReferenceTriggerRange = null;
            this.popupMenuManager.hidePopupMenu(); // Hide if open
            // Optional: Reset any expansion state if needed
            if (this.isInputExpanded) {
                 // Maybe toggle expansion off or just reset height?
                 // For now, just clearing content.
            }
            // Re-focus might be desired
            this.inputField.focus();
        }
    }

    /**
     * Handles the input event to detect potential references starting with '@'.
     * This will be used to trigger the reference popup in a later step.
     */
    private handleInputForReference(): void {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || !this.inputField) {
            return;
        }

        const range = selection.getRangeAt(0);
        const textNode = range.startContainer;
        const offset = range.startOffset;

        // Flag to track if we should close the popup
        let shouldClosePopup = true;

        // Ensure we are dealing with a text node inside the input field
        if (!textNode || textNode.nodeType !== Node.TEXT_NODE || !this.inputField.contains(textNode)) {
            // Might be at the boundary or in an empty div, ignore for now
            // TODO: Handle cases where '@' is typed at the very beginning or after a widget
            console.debug("Reference detection skipped: Not in a text node or outside input field.");
            // Close popup if cursor moves out of a valid reference-starting context
            if (this.popupMenuManager.isPopupMenuVisible()) {
                this.popupMenuManager.hidePopupMenu();
                this.activeReferenceTriggerRange = null; // Clear stored range
            }
            return;
        }

        const textContent = textNode.textContent || '';

        // Find the last '@' before the cursor
        const lastAtPos = textContent.lastIndexOf('@', offset - 1);

        if (lastAtPos !== -1) {
            // Check if the '@' is preceded by whitespace or is at the beginning of the node
            const isStartOfRef = lastAtPos === 0 || /\s/.test(textContent[lastAtPos - 1]);

            if (isStartOfRef) {
                // Extract potential reference text after '@' up to the cursor
                const potentialRef = textContent.substring(lastAtPos + 1, offset);

                // Basic validation: Allow alphanumeric, underscores, dots, slashes for paths
                // Allow empty query initially to show popup right after typing '@'
                if (/^[a-zA-Z0-9_\.\-\/]*$/.test(potentialRef)) {
                    console.log('UIManager: Potential reference detected:', potentialRef);
                    // Store the range where the trigger occurred
                    this.activeReferenceTriggerRange = range;
                    // Show the suggestions popup
                    this.popupMenuManager.showReferenceSuggestions(potentialRef, range);
                    shouldClosePopup = false; // Keep popup open
                } else {
                     // Text after @ is not a valid start, or just '@' typed
                     console.debug("Reference detection: Invalid characters after @ or empty ref.");
                     // shouldClosePopup remains true
                }
            } else {
                console.debug("Reference detection: '@' not preceded by whitespace.");
                // shouldClosePopup remains true
            }
        } else {
            console.debug("Reference detection: No '@' found before cursor in current text node.");
            // shouldClosePopup remains true
        }

        // Close the popup if no valid reference start was detected in this input event
        if (shouldClosePopup && this.popupMenuManager.isPopupMenuVisible()) {
            console.log('UIManager: Closing reference popup due to invalid context.')
            this.popupMenuManager.hidePopupMenu();
            this.activeReferenceTriggerRange = null; // Clear stored range
        }
    }

    /**
     * Serializes the content of a DOM Range, handling widgets correctly.
     * @param range The Range object to serialize.
     * @returns The serialized plain text content.
     */
    private serializeRangeContent(range: Range): string {
        if (!range) {
            return '';
        }

        const fragment = range.cloneContents(); // Get a document fragment of the selection
        let content = '';

        const serializeNode = (node: Node): void => {
            if (node.nodeType === Node.TEXT_NODE) {
                content += node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as HTMLElement;
                if (element.tagName === 'DIV' || element.tagName === 'BR') {
                    if (!content.endsWith('\n')) {
                        content += '\n';
                    }
                    // Serialize children if it's a DIV
                    if (element.tagName === 'DIV') {
                        element.childNodes.forEach(serializeNode);
                    }
                } else if (element.classList.contains('jp-llm-ext-ref-widget') && element.hasAttribute('data-ref-text')) {
                    // Use data-ref-text for widgets
                    content += element.getAttribute('data-ref-text') || '';
                } else {
                    // Recursively serialize children of other elements
                    element.childNodes.forEach(serializeNode);
                }
            }
            // Ignore other node types (comments, etc.)
        };

        fragment.childNodes.forEach(serializeNode);

        // Basic normalization (might need refinement based on how ranges/fragments handle line breaks)
        return content.replace(/\n{2,}/g, '\n\n');
    }

    /**
     * Handles the 'copy' event to put serialized plain text onto the clipboard.
     */
    private handleCopy(event: ClipboardEvent): void {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || !event.clipboardData) {
            return; // No selection or clipboard access
        }

        const range = selection.getRangeAt(0);
        if (range.collapsed) {
            return; // Nothing selected to copy
        }

        // Serialize the selected range
        const selectedText = this.serializeRangeContent(range);

        // Set plain text data on the clipboard
        event.clipboardData.setData('text/plain', selectedText);

        // Prevent the browser's default copy behavior (which might copy HTML)
        event.preventDefault();
        console.log('UIManager: Copied serialized selection to clipboard:', selectedText);
    }

    /**
     * Handles the 'paste' event to insert plain text content.
     */
    private handlePaste(event: ClipboardEvent): void {
        if (!event.clipboardData) {
            return; // No clipboard data available
        }

        // Get plain text from clipboard
        const pastedText = event.clipboardData.getData('text/plain');

        if (pastedText) {
            // Prevent the browser's default paste behavior (avoids pasting HTML)
            event.preventDefault();

            // Insert the plain text using execCommand
            // This handles replacing selected content or inserting at the cursor
            document.execCommand('insertText', false, pastedText);

            console.log('UIManager: Pasted plain text from clipboard:', pastedText);

            // Ensure the input field is scrolled into view if necessary after paste
            this.inputField.scrollIntoView({ block: 'nearest' }); 
        } else {
            // If no plain text, let the default behavior happen (might handle files etc.)
            console.log('UIManager: No plain text found on clipboard for paste.');
        }
    }

    // --- Methods for updating UI elements will be added later ---
    // e.g., updateMessageContainer(html: string), showHistoryView(), showChatView()

    // --- Potentially add methods to get element references if needed externally ---
    // public getInputField(): HTMLTextAreaElement { return this.inputField; }
    // etc.
} 