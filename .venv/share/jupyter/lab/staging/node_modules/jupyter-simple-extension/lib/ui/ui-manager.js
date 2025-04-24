"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UIManager = void 0;
/**
 * Manages UI elements and transitions for the chat interface.
 * This acts as a central point for UI manipulations, simplifying dependencies for handlers.
 */
class UIManager {
    constructor(popupMenuManager, callbacks, layoutElements) {
        this.notificationTimeout = null; // Timeout for the shortcut indicator
        // Internal UI state
        this.isInputExpanded = false;
        this.isMarkdownMode = false;
        this.popupMenuManager = popupMenuManager;
        this.callbacks = callbacks;
        this.layoutElements = layoutElements; // Store the layout elements passed in
        // Assign class properties directly from the passed layoutElements
        this.inputField = layoutElements.inputField; // Use provided input field
        this.messageContainer = layoutElements.messageContainer;
        this.historyContainer = layoutElements.historyContainer;
        this.titleInput = layoutElements.titleInput;
        this.bottomBarContainer = layoutElements.bottomBarContainer;
        this.notesContainer = layoutElements.notesContainer;
        // Initialize and append the keyboard shortcut indicator
        this.keyboardShortcutIndicator = document.createElement('div');
        this.keyboardShortcutIndicator.className = 'jp-llm-ext-shortcut-indicator';
        this.keyboardShortcutIndicator.style.display = 'none'; // Hidden by default
        // Append the indicator to the main layout or another appropriate place
        // Ensure the necessary element (e.g., bottomBarContainer) exists before appending
        if (this.bottomBarContainer) { // Check if bottomBarContainer exists from layoutElements
            // Prepend within the main content wrapper, before other elements
            // Or append to bottom bar, depending on desired position
            // Appending after bottomBarContainer seems reasonable
            this.bottomBarContainer.insertAdjacentElement('afterend', this.keyboardShortcutIndicator);
        }
        else {
            // If bottomBarContainer is not available, maybe append to mainElement? 
            // Or log an error if it's essential.
            console.error('UIManager: bottomBarContainer element not found during indicator initialization.');
        }
    }
    /**
     * Returns the core layout elements.
     */
    getUIElements() {
        return this.layoutElements;
    }
    /**
     * Creates the main layout structure for the sidebar.
     * @returns References to key DOM elements.
     */
    createLayout() {
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
        this.inputField.addEventListener('input', (event) => {
            this.handleInputForReference();
        });
        // --- End Input Event Listener ---
        this.inputField.addEventListener('keydown', (event) => {
            console.log(`UI_MANAGER KeyDown: Key='${event.key}', Shift='${event.shiftKey}', Code='${event.code}'`);
            const selection = window.getSelection();
            // --- Backspace handling for widgets ---
            if (event.key === 'Backspace' && selection && selection.isCollapsed) {
                const range = selection.getRangeAt(0);
                const nodeBefore = range.startContainer.childNodes[range.startOffset - 1] || range.startContainer.previousSibling;
                // Check nodeBefore more carefully
                let potentialWidget = null;
                if (range.startOffset > 0 && range.startContainer.childNodes.length >= range.startOffset) {
                    potentialWidget = range.startContainer.childNodes[range.startOffset - 1];
                }
                else if (range.startOffset === 0 && range.startContainer.previousSibling) {
                    potentialWidget = range.startContainer.previousSibling;
                }
                else if (range.startContainer !== this.inputField && range.startContainer.parentNode === this.inputField && range.startOffset === 0) {
                    // Cursor might be at the start of a text node following a widget
                    potentialWidget = range.startContainer.previousSibling;
                }
                if (potentialWidget &&
                    potentialWidget.nodeType === Node.ELEMENT_NODE &&
                    potentialWidget.classList.contains('jp-llm-ext-ref-widget')) {
                    event.preventDefault(); // Stop default backspace
                    potentialWidget.remove(); // Remove the entire widget node
                    // Manually trigger input event for consistency?
                    this.inputField.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                    return; // Stop further processing for this keydown
                }
            }
            // --- End Backspace handling ---
            // --- @ Key Direct Handling ---
            // REMOVED: This logic is now centralized in shortcut-handler.ts
            // --- End @ Key Direct Handling ---
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault(); // Prevent default newline insertion
                const message = this.getSerializedInput();
                if (message.trim()) {
                    console.log(`[UIManager] Sending message with markdown mode: ${this.isMarkdownMode}`);
                    this.callbacks.handleSendMessage(message, this.isMarkdownMode);
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
        this.inputField.addEventListener('copy', (event) => {
            this.handleCopy(event);
        });
        this.inputField.addEventListener('paste', (event) => {
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
                console.log(`[UIManager] Sending message from button click with markdown mode: ${this.isMarkdownMode}`);
                this.callbacks.handleSendMessage(message, this.isMarkdownMode);
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
            notesContainer: this.notesContainer,
        };
    }
    /**
     * Creates the controls container with toggles and action buttons.
     */
    createControlsContainer() {
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'jp-llm-ext-controls-container';
        // --- Markdown Toggle ---
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'jp-llm-ext-toggle-container';
        this.markdownToggle = document.createElement('input');
        this.markdownToggle.type = 'checkbox';
        this.markdownToggle.id = 'markdown-toggle'; // Ensure unique ID or handle differently
        this.markdownToggle.addEventListener('change', (e) => {
            const target = e.target;
            this.isMarkdownMode = target.checked;
            console.log(`[UIManager] Markdown mode changed to: ${this.isMarkdownMode}`);
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
        atButton.addEventListener('click', (event) => {
            this.callbacks.handleShowPopupMenu(event, event.currentTarget);
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
    toggleInputExpansion() {
        if (!this.inputField || !this.expandButton)
            return; // Ensure elements exist
        this.isInputExpanded = !this.isInputExpanded;
        if (this.isInputExpanded) {
            this.inputField.style.height = '200px'; // Keep for now, consider CSS classes
            this.inputField.style.resize = 'vertical'; // Works on divs too (if overflow visible/auto)
            this.expandButton.textContent = '⤡';
            this.expandButton.title = 'Collapse input';
        }
        else {
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
        if (this.messageContainer) {
            this.messageContainer.appendChild(element);
            this.scrollToBottom(); // Scroll after adding the new element
        }
        else {
            console.error('Message container not initialized in UIManager.');
        }
    }
    /**
     * Scrolls the message container to the bottom.
     */
    scrollToBottom() {
        if (this.messageContainer) {
            this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
        }
        else {
            console.error('Message container not initialized in UIManager.');
        }
    }
    /**
     * Switches the view to show the notes.
     */
    showNotesView() {
        this.layoutElements.messageContainer.style.display = 'none';
        this.layoutElements.historyContainer.style.display = 'none';
        this.layoutElements.notesContainer.style.display = 'block';
        this.layoutElements.bottomBarContainer.style.display = 'none';
    }
    /**
     * Switches the view to show the chat history.
     */
    showHistoryView() {
        this.layoutElements.messageContainer.style.display = 'none';
        this.layoutElements.historyContainer.style.display = 'block';
        this.layoutElements.notesContainer.style.display = 'none';
        this.layoutElements.bottomBarContainer.style.display = 'none';
        // Optionally update header/title elements if needed
    }
    /**
     * Switches the view to show the main chat interface.
     */
    showChatView() {
        this.layoutElements.historyContainer.style.display = 'none';
        this.layoutElements.notesContainer.style.display = 'none';
        this.layoutElements.messageContainer.style.display = 'block';
        this.layoutElements.bottomBarContainer.style.display = 'flex'; // Assuming flex display
        this.scrollToBottom(); // Scroll down when showing chat
    }
    /**
     * Clears all messages from the message container.
     */
    clearMessageContainer() {
        this.layoutElements.messageContainer.innerHTML = '';
    }
    /**
     * Updates the value of the title input field.
     */
    updateTitleInput(title) {
        if (this.layoutElements.titleInput) {
            this.layoutElements.titleInput.value = title;
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
        const indicator = this.layoutElements.mainElement.querySelector('.jp-llm-ext-keyboard-shortcut-indicator');
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
    /**
     * Checks the input field content and cursor position to determine if
     * the reference suggestion popup should be shown or hidden.
     * Triggered on 'input' events.
     */
    handleInputForReference() {
        var _a, _b;
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount || !selection.isCollapsed) {
            // Need a collapsed selection (cursor) inside the input field
            this.popupMenuManager.hidePopupMenu();
            return;
        }
        const range = selection.getRangeAt(0);
        const container = range.startContainer;
        const offset = range.startOffset;
        // Ensure the cursor is within the input field itself
        if (!this.inputField.contains(container)) {
            this.popupMenuManager.hidePopupMenu();
            return;
        }
        // Combine text content from preceding siblings if cursor is at the start of a text node
        let textBeforeCursor = '';
        let currentContainer = container;
        let currentOffset = offset;
        while (currentContainer) {
            if (currentContainer.nodeType === Node.TEXT_NODE) {
                textBeforeCursor = ((_a = currentContainer.textContent) === null || _a === void 0 ? void 0 : _a.substring(0, currentOffset)) + textBeforeCursor;
            }
            else if (currentContainer.nodeType === Node.ELEMENT_NODE && currentContainer.classList.contains('jp-llm-ext-ref-widget')) {
                // If we encounter a widget before the cursor, we can't be right after '@'
                textBeforeCursor = '[widget]' + textBeforeCursor; // Add placeholder to break '@' sequence
            }
            else if (currentContainer.nodeType === Node.ELEMENT_NODE && currentContainer.tagName === 'BR') {
                textBeforeCursor = '\n' + textBeforeCursor; // Treat BR as newline
            }
            // Move to the previous sibling or parent's previous sibling
            if (currentContainer.previousSibling) {
                currentContainer = currentContainer.previousSibling;
                // If moving to a new node, take its full content
                currentOffset = (currentContainer.textContent || '').length;
            }
            else {
                // Move up to parent, continue search from before the parent
                currentContainer = currentContainer.parentNode;
                if (currentContainer === this.inputField || !currentContainer) {
                    break; // Stop if we reached the input field or top
                }
                currentOffset = Array.prototype.indexOf.call(((_b = currentContainer.parentNode) === null || _b === void 0 ? void 0 : _b.childNodes) || [], currentContainer);
            }
        }
        console.log(`UI_MANAGER handleInput: Text before cursor: "${textBeforeCursor}"`);
        // --- Check for trigger conditions --- 
        const endsWithAt = textBeforeCursor.endsWith('@');
        const endsWithAtSpace = textBeforeCursor.endsWith('@ ');
        if (endsWithAt || endsWithAtSpace) {
            if (this.popupMenuManager.isPopupMenuVisible()) {
                // TODO: If visible, maybe just update the query in the popup?
                console.log('UI_MANAGER handleInput: Popup already visible, skipping show.');
            }
            else {
                // Find the start of the query (after '@' or '@ ')
                const atIndex = textBeforeCursor.lastIndexOf('@');
                let queryStartIndex = atIndex + 1;
                if (endsWithAtSpace) {
                    queryStartIndex = atIndex + 2;
                }
                const query = textBeforeCursor.substring(queryStartIndex);
                // --- Insert temporary span to get reliable coordinates --- 
                const tempAnchorId = 'jp-llm-temp-popup-anchor';
                let tempSpan = document.getElementById(tempAnchorId);
                if (tempSpan)
                    tempSpan.remove(); // Clean up previous if any
                tempSpan = document.createElement('span');
                tempSpan.id = tempAnchorId;
                // Style to be invisible and take no space
                tempSpan.style.visibility = 'hidden';
                tempSpan.style.width = '0';
                tempSpan.style.height = '0';
                tempSpan.style.overflow = 'hidden';
                tempSpan.textContent = '\u200B'; // Zero-width space might help rendering
                // Insert the span at the current cursor position
                range.insertNode(tempSpan);
                const spanRect = tempSpan.getBoundingClientRect();
                tempSpan.remove(); // Remove immediately after getting coords
                // --- End temporary span logic ---
                if (spanRect.top === 0 && spanRect.left === 0) {
                    console.error("UI_MANAGER handleInput: Failed to get valid coordinates from temp anchor span.");
                    // Fallback or alternative positioning might be needed here
                    // Maybe position relative to input field bottom-left?
                    this.popupMenuManager.hidePopupMenu(); // Don't show if coords are bad
                }
                else {
                    console.log(`UI_MANAGER handleInput: Anchor coords from temp span: Top=${spanRect.top}, Left=${spanRect.left}`);
                    // Show the TOP LEVEL suggestions using the reliable coordinates
                    // Pass the coordinates directly to showPopupMenu
                    this.popupMenuManager.showPopupMenu({ x: spanRect.left, y: spanRect.top });
                }
            }
        }
        else {
            // If text doesn't end with @ or @-space, hide the popup
            // Only hide if it was previously showing the 'top' or 'references' menu triggered by '@'
            // Avoid hiding menus triggered by the button click unnecessarily
            if (this.popupMenuManager.isPopupMenuVisible()) { // && (this.popupMenuManager.getCurrentMenuLevel() === 'references' || /* Need way to know if triggered by @ */ )) {
                console.log('UI_MANAGER handleInput: Hiding popup, trigger condition no longer met.');
                this.popupMenuManager.hidePopupMenu();
            }
        }
        // TODO: Update popup query if it's already visible and the text after @ changes
        // (Need more robust logic here, considering backspace, etc.)
    }
    /**
     * Serializes the content of the input field, converting known widgets
     * back to their reference strings (e.g., @file:path/to/file.txt).
     *
     * NOTE: This currently uses a simple text serialization. For full fidelity
     * preserving structure (like multiple paragraphs), a more complex approach
     * (e.g., HTML processing or a dedicated editor model) would be needed.
     *
     * @returns {string} The serialized plain text content of the input field.
     */
    getSerializedInput() {
        let serialized = '';
        const nodes = this.inputField.childNodes;
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (node.nodeType === Node.TEXT_NODE) {
                serialized += node.textContent;
            }
            else if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node;
                if (element.classList.contains('jp-llm-ext-ref-widget') && element.dataset.referenceText) {
                    // Append the reference text stored in the data attribute
                    serialized += element.dataset.referenceText;
                }
                else if (element.tagName === 'BR') {
                    // Convert BR tags back to newlines
                    serialized += '\n';
                }
                else if (element.tagName === 'DIV') {
                    // Handle DIV elements (might be inserted by browser on paste/enter)
                    // Add newline before if needed, then serialize children recursively?
                    if (i > 0) { // Add newline only if not the first element
                        serialized += '\n';
                    }
                    serialized += this.serializeNodeChildren(element); // Recursively serialize children
                }
                else {
                    // Include text content of other unexpected elements, but log a warning
                    console.warn('UIManager getSerializedInput: Encountered unexpected element:', element.tagName);
                    serialized += element.textContent;
                }
            } // Ignore other node types (comments, etc.)
        }
        return serialized.trim(); // Trim leading/trailing whitespace
    }
    // Helper to serialize children of a node (e.g., for DIVs)
    serializeNodeChildren(parentNode) {
        let content = '';
        const nodes = parentNode.childNodes;
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (node.nodeType === Node.TEXT_NODE) {
                content += node.textContent;
            }
            else if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node;
                if (element.classList.contains('jp-llm-ext-ref-widget') && element.dataset.referenceText) {
                    content += element.dataset.referenceText;
                }
                else if (element.tagName === 'BR') {
                    content += '\n';
                }
                else {
                    // Recursively handle nested elements if necessary, or just get text content
                    content += this.serializeNodeChildren(element);
                }
            }
        }
        return content;
    }
    clearInputField() {
        this.inputField.innerHTML = ''; // Clear all content
        // Reset expansion state if needed
        if (this.isInputExpanded) {
            this.toggleInputExpansion();
        }
        // Ensure placeholder reappears if using CSS for it
        this.inputField.dispatchEvent(new Event('input')); // Trigger event to update UI state if necessary
    }
    /**
     * Handles the 'copy' event to put serialized plain text onto the clipboard.
     */
    handleCopy(event) {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || !event.clipboardData) {
            return; // Nothing selected or no clipboard data object
        }
        const range = selection.getRangeAt(0);
        // Ensure the selection is within our input field
        if (!this.inputField.contains(range.commonAncestorContainer)) {
            return;
        }
        const selectedText = this.serializeRangeContent(range);
        event.preventDefault(); // Prevent default copy behavior
        event.clipboardData.setData('text/plain', selectedText);
        console.log('UIManager handleCopy: Copied serialized text:', selectedText);
    }
    /**
     * Handles the 'paste' event to insert plain text content.
     */
    handlePaste(event) {
        var _a;
        if (!event.clipboardData) {
            return;
        }
        const text = event.clipboardData.getData('text/plain');
        if (text) {
            event.preventDefault(); // Prevent default paste behavior
            // Insert the plain text at the current cursor position
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents(); // Delete selected content if any
                const textNode = document.createTextNode(text);
                range.insertNode(textNode);
                // Move cursor after inserted text
                range.setStartAfter(textNode);
                range.setEndAfter(textNode);
                selection.removeAllRanges();
                selection.addRange(range);
                // Ensure scroll into view and trigger input event for potential updates
                this.inputField.focus();
                (_a = textNode.parentElement) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ block: 'nearest' });
                this.inputField.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            }
            console.log('UIManager handlePaste: Pasted text:', text);
        }
    }
    // --- Methods for updating UI elements will be added later ---
    // e.g., updateMessageContainer(html: string), showHistoryView(), showChatView()
    // --- Potentially add methods to get element references if needed externally ---
    // public getInputField(): HTMLTextAreaElement { return this.inputField; }
    // etc.
    // Helper to serialize a range (needed for copy)
    serializeRangeContent(range) {
        const fragment = range.cloneContents();
        let tempDiv = document.createElement('div');
        tempDiv.appendChild(fragment);
        // Now, serialize tempDiv's content like we do for getSerializedInput
        let serialized = '';
        const nodes = tempDiv.childNodes;
        const serializeNode = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                serialized += node.textContent;
            }
            else if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node;
                if (element.classList.contains('jp-llm-ext-ref-widget') && element.dataset.referenceText) {
                    serialized += element.dataset.referenceText;
                }
                else if (element.tagName === 'BR') {
                    serialized += '\n';
                }
                else { // For other elements (like DIVs potentially in fragment), serialize children
                    const childNodes = element.childNodes;
                    for (let j = 0; j < childNodes.length; j++) {
                        serializeNode(childNodes[j]);
                    }
                }
            }
        };
        for (let i = 0; i < nodes.length; i++) {
            serializeNode(nodes[i]);
        }
        return serialized;
    }
}
exports.UIManager = UIManager;
