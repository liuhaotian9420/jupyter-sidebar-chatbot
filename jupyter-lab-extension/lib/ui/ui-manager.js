"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UIManager = void 0;
/**
 * Manages UI elements and transitions for the chat interface.
 * This acts as a central point for UI manipulations, simplifying dependencies for handlers.
 */
class UIManager {
    constructor(
    // docManager: IDocumentManager, // Commented out - unused parameter
    popupMenuManager, 
    // widgetNode: HTMLElement, // Commented out - unused parameter
    callbacks, layoutElements) {
        this.notificationTimeout = null; // Timeout for the shortcut indicator
        // Internal UI state
        this.isInputExpanded = false;
        this.isMarkdownMode = false;
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
        }
        else {
            console.error('UIManager: Main layout element not found during indicator initialization.');
        }
    }
    /**
     * Returns the core layout elements.
     */
    getUIElements() {
        return this.layoutElements;
    }
    /**
     * Toggles the expansion state of the input field.
     */
    toggleInputExpansion() {
        // Use layoutElements provided via constructor
        const inputField = this.layoutElements.inputField;
        const expandButton = this.layoutElements.expandButton;

        if (!inputField || !expandButton)
            return; // Ensure elements exist
        
        this.isInputExpanded = !this.isInputExpanded;
        if (this.isInputExpanded) {
            inputField.style.height = '200px'; // Use CSS classes ideally
            inputField.style.resize = 'vertical';
            expandButton.textContent = '⤡'; // Collapse symbol
            expandButton.title = 'Collapse input';
        }
        else {
            inputField.style.height = ''; // Reset height
            inputField.style.resize = 'none';
            inputField.rows = 1; // Ensure collapse
            expandButton.textContent = '⤢'; // Expand symbol
            expandButton.title = 'Expand input';
        }
        // Future: Notify widget/handler if needed: this.callbacks.handleToggleExpansion(this.isInputExpanded);
    }
    /**
     * Updates the appearance of the Expand/Collapse button.
     * This method is needed because InputHandler manages the state,
     * but UIManager manages the button element.
     */
    updateExpandButton(isExpanded) {
        const expandButton = this.layoutElements.expandButton;
        if (!expandButton) return;

        if (isExpanded) {
            expandButton.textContent = '⤡'; // Collapse symbol
            expandButton.title = 'Collapse input';
        }
        else {
            expandButton.textContent = '⤢'; // Expand symbol
            expandButton.title = 'Expand input';
        }
    }
    /**
     * Helper function to create a styled button.
     * NOTE: This might be redundant if buildLayout handles all button creation. Keeping for now.
     */
    createButton(text, tooltip) {
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
    addChatMessageElement(element) {
        // Use layoutElements provided via constructor
        const messageContainer = this.layoutElements.messageContainer;
        if (messageContainer) {
            messageContainer.appendChild(element);
            this.scrollToBottom(); // Scroll after adding the new element
        }
        else {
            console.error('Message container not found in UIManager layoutElements.');
        }
    }
    /**
     * Scrolls the message container to the bottom.
     */
    scrollToBottom() {
        // Use layoutElements provided via constructor
        const messageContainer = this.layoutElements.messageContainer;
        if (messageContainer) {
            messageContainer.scrollTop = messageContainer.scrollHeight;
        }
        else {
            console.error('Message container not found in UIManager layoutElements.');
        }
    }
    /**
     * Switches the view to show the chat history.
     */
    showHistoryView() {
        if (!this.layoutElements.messageContainer || !this.layoutElements.historyContainer || !this.layoutElements.bottomBarContainer) {
            console.error("UIManager: Cannot show history view, required layout elements missing.");
            return;
        }
        this.layoutElements.messageContainer.style.display = 'none';
        this.layoutElements.historyContainer.style.display = 'block';
        this.layoutElements.bottomBarContainer.style.display = 'none';
        // Optionally update header/title elements if needed
    }
    /**
     * Switches the view to show the main chat interface.
     */
    showChatView() {
        if (!this.layoutElements.messageContainer || !this.layoutElements.historyContainer || !this.layoutElements.bottomBarContainer) {
            console.error("UIManager: Cannot show chat view, required layout elements missing.");
            return;
        }
        this.layoutElements.historyContainer.style.display = 'none';
        this.layoutElements.messageContainer.style.display = 'block';
        this.layoutElements.bottomBarContainer.style.display = 'flex'; // Assuming flex display
        this.scrollToBottom(); // Scroll down when showing chat
    }
    /**
     * Clears all messages from the message container.
     */
    clearMessageContainer() {
        const messageContainer = this.layoutElements.messageContainer;
        if (messageContainer) {
            messageContainer.innerHTML = '';
        } else {
            console.error('UIManager: Cannot clear message container, element not found.');
        }
    }
    /**
     * Updates the value of the title input field.
     */
    updateTitleInput(title) {
        const titleInput = this.layoutElements.titleInput;
        if (titleInput) {
            titleInput.value = title;
        } else {
            console.error('UIManager: Cannot update title input, element not found.');
        }
    }
    /**
     * Creates and returns a container structure for a bot message,
     * including elements for streaming text and final rendered content.
     * This helps manage the transition from streaming to final message display.
     */
    createBotMessageContainer() {
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
        // Ensure addChatMessageElement uses layoutElements.messageContainer correctly
        this.addChatMessageElement(botMessageDiv);
        return { botMessageDiv, streamingDiv, contentDiv };
    }
    /**
     * Displays a temporary notification message.
     * TODO: Implement a more robust notification system (e.g., toast).
     */
    showNotification(message, type, duration = 3000) {
        console.log(`Notification (${type}): ${message}`);
        // Basic temporary implementation using the existing indicator element
        // const indicator = this.layoutElements.mainElement.querySelector('.jp-llm-ext-keyboard-shortcut-indicator');
        const indicator = this.keyboardShortcutIndicator; // Use the direct reference
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
        }
        else {
            console.warn('Notification indicator element not found for UIManager.');
        }
    }
    /**
     * Shows a visual indicator for keyboard shortcuts.
     * @param text The text to display in the indicator.
     */
    showIndicator(text) {
        if (!this.keyboardShortcutIndicator)
            return; // Guard
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
    clearIndicator() {
        if (!this.keyboardShortcutIndicator)
            return;
        this.keyboardShortcutIndicator.classList.remove('visible');
        this.keyboardShortcutIndicator.textContent = '';
        if (this.notificationTimeout) {
            clearTimeout(this.notificationTimeout);
            this.notificationTimeout = null;
        }
    }
}
exports.UIManager = UIManager;
