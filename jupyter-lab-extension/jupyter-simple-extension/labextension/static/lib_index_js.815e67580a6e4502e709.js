"use strict";
(self["webpackChunkjupyter_simple_extension"] = self["webpackChunkjupyter_simple_extension"] || []).push([["lib_index_js"],{

/***/ "./lib/cell-context-tracker.js":
/*!*************************************!*\
  !*** ./lib/cell-context-tracker.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CellContextTracker = void 0;
/**
 * Tracks cell context and cursor position within Jupyter notebooks
 */
class CellContextTracker {
    constructor(app, notebookTracker) {
        this.activeCellEditorNode = null;
        this.lastCellContext = null;
        this._isDisposed = false;
        /**
         * Handles editor events (keydown, mouseup)
         */
        this.handleEditorEvent = (event) => {
            try {
                // Get the current active cell from the tracker
                const cell = this.notebookTracker.activeCell;
                if (!cell || !cell.editor)
                    return;
                // Find the inner EditorView instance
                const editor = cell.editor;
                const view = editor.editor;
                if (!view)
                    return;
                // Get and store the cursor context
                this.lastCellContext = this.getCmContext(view);
            }
            catch (error) {
                console.error("Error in editor event handler:", error);
            }
        };
        this.notebookTracker = notebookTracker;
        this.setupTrackers();
    }
    /**
     * Whether this object has been disposed
     */
    get isDisposed() {
        return this._isDisposed;
    }
    /**
     * Sets up all the necessary event trackers
     */
    setupTrackers() {
        // Handle active cell changes
        this.notebookTracker.activeCellChanged.connect(this.setupCellListeners, this);
        // Handle notebook changes
        this.notebookTracker.currentChanged.connect(this.handleNotebookChange, this);
    }
    /**
     * Handles notebook changes
     */
    handleNotebookChange(tracker, panel) {
        this.cleanupPreviousListeners();
        if (panel && panel.content) {
            const cell = panel.content.activeCell;
            this.setupCellListeners(tracker, cell);
        }
    }
    /**
     * Sets up event listeners on the active cell
     */
    setupCellListeners(_tracker, cell) {
        if (!cell)
            return;
        this.cleanupPreviousListeners();
        if (cell.editor) {
            try {
                const cellNode = cell.node;
                const editorNode = cellNode.querySelector('.jp-Editor') ||
                    cellNode.querySelector('.jp-InputArea-editor');
                if (editorNode) {
                    this.activeCellEditorNode = editorNode;
                    // Add event listeners for key and mouse events
                    editorNode.addEventListener('keydown', this.handleEditorEvent);
                    editorNode.addEventListener('mouseup', this.handleEditorEvent);
                    // Try to capture immediate context if EditorView available
                    const view = cell.editor.editor;
                    if (view) {
                        this.lastCellContext = this.getCmContext(view);
                    }
                }
            }
            catch (error) {
                console.error("Error setting up cell listeners:", error);
            }
        }
    }
    /**
     * Cleans up event listeners from the previous active cell
     */
    cleanupPreviousListeners() {
        if (this.activeCellEditorNode) {
            this.activeCellEditorNode.removeEventListener('keydown', this.handleEditorEvent);
            this.activeCellEditorNode.removeEventListener('mouseup', this.handleEditorEvent);
            this.activeCellEditorNode = null;
        }
    }
    /**
     * Gets context information from CodeMirror EditorView
     */
    getCmContext(view) {
        const state = view.state;
        const offset = state.selection.main.head;
        const fullText = state.doc.toString();
        const line = state.doc.lineAt(offset);
        const position = {
            line: line.number - 1,
            column: offset - line.from,
            offset: offset
        };
        const contextRadius = 100;
        const start = Math.max(0, offset - contextRadius);
        const end = Math.min(fullText.length, offset + contextRadius);
        return {
            text: fullText,
            position: position,
            contextBefore: fullText.substring(start, offset),
            contextAfter: fullText.substring(offset, end)
        };
    }
    /**
     * Gets the current cell context
     */
    getCurrentCellContext() {
        return this.lastCellContext;
    }
    /**
     * Disposes all resources
     */
    dispose() {
        if (this._isDisposed) {
            return;
        }
        this._isDisposed = true;
        this.cleanupPreviousListeners();
        this.notebookTracker.activeCellChanged.disconnect(this.setupCellListeners, this);
        this.notebookTracker.currentChanged.disconnect(this.handleNotebookChange, this);
    }
}
exports.CellContextTracker = CellContextTracker;


/***/ }),

/***/ "./lib/commands.js":
/*!*************************!*\
  !*** ./lib/commands.js ***!
  \*************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.registerCommands = registerCommands;
const ui_components_1 = __webpack_require__(/*! @jupyterlab/ui-components */ "webpack/sharing/consume/default/@jupyterlab/ui-components"); // Import LabIcon if needed as placeholder
// Placeholder icon (replace if you have a specific icon)
const extensionIcon = ui_components_1.LabIcon.resolve({ icon: 'ui-components:jupyterlab' }); // Use resolve for built-in
/**
 * Registers commands for the extension
 */
function registerCommands(app, palette, launcher, sidebarWidget) {
    // Add command to toggle the sidebar
    app.commands.addCommand('simple-extension:toggle-sidebar', {
        label: 'Toggle AI Assistant Sidebar',
        icon: extensionIcon,
        execute: () => {
            if (sidebarWidget.isAttached) {
                sidebarWidget.parent = null;
            }
            else {
                app.shell.add(sidebarWidget, 'left', { rank: 9999 });
            }
        }
    });
    // Add the command to the command palette
    palette.addItem({
        command: 'simple-extension:toggle-sidebar',
        category: 'Extension'
    });
    // Add a launcher item
    launcher.add({
        command: 'simple-extension:toggle-sidebar',
        category: 'Other',
        rank: 9999
    });
}


/***/ }),

/***/ "./lib/core/api-client.js":
/*!********************************!*\
  !*** ./lib/core/api-client.js ***!
  \********************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiClient = void 0;
/**
 * API client for interacting with the backend LLM service
 */
class ApiClient {
    constructor(baseUrl = 'http://localhost:8000') {
        this.baseUrl = baseUrl;
    }
    /**
     * Stream a chat response from the mock LLM
     * @param message The user message to send
     * @param context Optional context information
     * @param onChunk Callback for each text chunk received
     * @param onComplete Callback when streaming is complete
     * @param onError Callback for errors
     */
    async streamChat(message, context = null, onChunk, onComplete, onError) {
        try {
            const response = await fetch(`${this.baseUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    context
                })
            });
            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }
            if (!response.body) {
                throw new Error('ReadableStream not supported in this browser.');
            }
            // Set up stream reading
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    const chunk = decoder.decode(value, { stream: !done });
                    onChunk(chunk);
                }
            }
            onComplete();
        }
        catch (error) {
            onError(error instanceof Error ? error : new Error(String(error)));
        }
    }
    /**
     * Simple health check for the API
     * @returns A promise that resolves to true if the API is healthy
     */
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseUrl}/health`);
            return response.ok;
        }
        catch (error) {
            console.error('API health check failed:', error);
            return false;
        }
    }
}
exports.ApiClient = ApiClient;


/***/ }),

/***/ "./lib/core/globals.js":
/*!*****************************!*\
  !*** ./lib/core/globals.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.globals = void 0;
exports.initGlobals = initGlobals;
/**
 * Global references to key components in the application
 */
exports.globals = {};
/**
 * Initialize global references
 */
function initGlobals(app, notebookTracker) {
    exports.globals.app = app;
    exports.globals.notebookTracker = notebookTracker;
}


/***/ }),

/***/ "./lib/core/icons.js":
/*!***************************!*\
  !*** ./lib/core/icons.js ***!
  \***************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.extensionIcon = void 0;
const ui_components_1 = __webpack_require__(/*! @jupyterlab/ui-components */ "webpack/sharing/consume/default/@jupyterlab/ui-components");
// ===============================
// Icon Definition
// ===============================
const iconSvgStr = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat-left-text" viewBox="0 0 16 16">' +
    '<path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>' +
    '<path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6zm0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>' +
    '</svg>';
/**
 * Icon for the AI Assistant extension
 */
exports.extensionIcon = new ui_components_1.LabIcon({
    name: 'simple:icon',
    svgstr: iconSvgStr
});


/***/ }),

/***/ "./lib/handlers/history-handler.js":
/*!*****************************************!*\
  !*** ./lib/handlers/history-handler.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HistoryHandler = void 0;
const message_renderer_1 = __webpack_require__(/*! ../ui/message-renderer */ "./lib/ui/message-renderer.js"); // Assuming renderers are needed
/**
 * Manages the display and interaction logic for the chat history view.
 */
class HistoryHandler {
    constructor(chatState, uiManager, callbacks, rendererCallbacks) {
        this.isHistoryViewActive = false;
        this.chatState = chatState;
        this.uiManager = uiManager;
        this.callbacks = callbacks;
        this.rendererCallbacks = rendererCallbacks;
        // Get the history container element from UIManager
        this.historyContainer = this.uiManager.getUIElements().historyContainer;
    }
    /**
     * Toggles between the main chat view and the history view.
     */
    toggleHistoryView() {
        this.isHistoryViewActive = !this.isHistoryViewActive;
        if (this.isHistoryViewActive) {
            // Use UIManager to hide chat, show history
            this.uiManager.showHistoryView();
            this.renderChatHistory(); // Populate the history view
        }
        else {
            // Use UIManager to show chat, hide history
            this.uiManager.showChatView();
            // Ensure the correct title is displayed when switching back
            const currentChat = this.chatState.getCurrentChat();
            if (currentChat) {
                this.callbacks.updateTitleInput(currentChat.title);
            }
        }
    }
    /**
     * Renders the list of past chats in the history container.
     */
    renderChatHistory() {
        this.historyContainer.innerHTML = ''; // Clear previous list
        const history = this.chatState.getChatHistory();
        const currentChatId = this.chatState.getCurrentChatId();
        if (history.length === 0) {
            this.historyContainer.innerHTML = '<div class="jp-llm-ext-history-empty">No chat history yet.</div>';
            return;
        }
        const list = document.createElement('ul');
        list.className = 'jp-llm-ext-history-list';
        history.forEach(chat => {
            const listItem = document.createElement('li');
            listItem.className = 'jp-llm-ext-history-item';
            if (chat.id === currentChatId) {
                listItem.classList.add('jp-llm-ext-active');
            }
            // Simple representation: Title
            // TODO: Add preview, timestamp, delete button etc.
            const titleDiv = document.createElement('div');
            titleDiv.className = 'jp-llm-ext-history-item-title';
            titleDiv.textContent = chat.title || 'Untitled Chat';
            listItem.appendChild(titleDiv);
            // Add click event to load the chat
            listItem.addEventListener('click', () => this.loadChat(chat.id));
            list.appendChild(listItem);
        });
        this.historyContainer.appendChild(list);
    }
    /**
     * Loads a specific chat session from history into the main view.
     */
    loadChat(chatId) {
        const chat = this.chatState.getChatById(chatId);
        if (!chat) {
            console.error(`Chat with ID ${chatId} not found.`);
            return;
        }
        // Set this chat as the active one in the state
        this.chatState.setCurrentChatId(chatId);
        // Update the main UI title input
        this.callbacks.updateTitleInput(chat.title);
        // Clear the current message display
        this.callbacks.clearMessageContainer();
        // Re-populate the message container with messages from the loaded chat
        // Use the renderer functions via callbacks
        chat.messages.forEach((msg) => {
            let messageElement;
            if (msg.sender === 'user') {
                messageElement = (0, message_renderer_1.renderUserMessage)(msg.text, { isMarkdown: msg.isMarkdown }, this.rendererCallbacks);
            }
            else { // 'bot'
                messageElement = (0, message_renderer_1.renderBotMessage)(msg.text, { isMarkdown: msg.isMarkdown }, this.rendererCallbacks);
            }
            // Add the rendered element to the message container via callback
            this.callbacks.addRenderedMessage(messageElement);
        });
        // Switch back to the chat view if we were in the history view
        if (this.isHistoryViewActive) {
            this.toggleHistoryView(); // This will call uiManager.showChatView()
        }
        else {
            // If already in chat view, ensure scrolling is correct
            this.uiManager.scrollToBottom();
        }
        // Optional: Re-render history list to update the active item indicator
        // Only really needed if not switching views
        // if (!this.isHistoryViewActive) { this.renderChatHistory(); }
    }
}
exports.HistoryHandler = HistoryHandler;


/***/ }),

/***/ "./lib/handlers/input-handler.js":
/*!***************************************!*\
  !*** ./lib/handlers/input-handler.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports) => {


// import { PopupMenuManager, MenuActionCallbacks } from './popup-menu-manager'; // Removed unused import
// import { UIManager } from '../ui/ui-manager'; // Removed unused import
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InputHandler = void 0;
/**
 * Handles events and logic related to the chat input field.
 */
class InputHandler {
    constructor(chatInput, callbacks
    // uiManager: UIManager // Removed unused parameter
    ) {
        // private uiManager: UIManager; // Removed unused member
        // --- Code Reference State ---
        this.codeRefMap = new Map();
        this.nextRefId = 1;
        // ---------------------------
        this.hasAtSymbol = false;
        this.isMarkdownMode = false; // Internal state, potentially synced with UIManager
        this.isInputExpanded = false; // Internal state, potentially synced with UIManager
        // -----------------------------
        // --- Private Event Handlers ---
        this._handleKeyPress = (event) => {
            // Handle Enter key (send message)
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                const rawMessage = this.chatInput.value.trim();
                if (rawMessage) {
                    // Resolve code references BEFORE sending
                    const resolvedMessage = this.resolveCodeReferences(rawMessage);
                    console.log('Sending resolved message:', resolvedMessage); // Debug log
                    this.callbacks.handleSendMessage(resolvedMessage);
                    // Clearing is handled separately (e.g., by MessageHandler calling clearInput)
                }
            }
            // Note: '@' key handling might be better in handleKeyDown if needed globally,
            // but keeping here for now as it relates directly to input field focus.
            // Or handled by shortcut-handler listening globally. Let's assume shortcut-handler handles it.
        };
        this._handleInput = () => {
            // Handle @ symbol removal to hide popup
            const cursorPosition = this.chatInput.selectionStart;
            if (cursorPosition === null)
                return; // Type guard
            const textBeforeCursor = this.chatInput.value.slice(0, cursorPosition);
            // Check if the character immediately before the cursor is '@'
            // and if it's preceded by whitespace or is at the start of the input.
            const isAtSymbolContext = textBeforeCursor.endsWith('@') &&
                (cursorPosition === 1 ||
                    /\s/.test(textBeforeCursor[cursorPosition - 2]));
            if (this.hasAtSymbol && !isAtSymbolContext) {
                // @ symbol context was present but now it's gone, hide the popup
                this.callbacks.hidePopupMenu();
            }
            // Update the state *after* checking the previous state
            this.hasAtSymbol = isAtSymbolContext;
        };
        this.chatInput = chatInput;
        this.callbacks = callbacks;
        // this.uiManager = uiManager; // Removed unused assignment
        // Bind event listeners
        this.chatInput.addEventListener('keypress', this._handleKeyPress);
        this.chatInput.addEventListener('input', this._handleInput);
        // Note: Actual markdown toggle and expand buttons are likely managed by UIManager,
        // which would then call methods like `setMarkdownMode` or `toggleExpansion` on this handler.
    }
    /**
     * Removes event listeners.
     */
    dispose() {
        this.chatInput.removeEventListener('keypress', this._handleKeyPress);
        this.chatInput.removeEventListener('input', this._handleInput);
    }
    /**
     * Appends text to the input field with proper spacing and focus.
     */
    appendToInput(text) {
        try {
            const currentValue = this.chatInput.value;
            // Get current cursor position
            const start = this.chatInput.selectionStart;
            const end = this.chatInput.selectionEnd;
            // Insert text at cursor position
            this.chatInput.value = currentValue.slice(0, start) + text + currentValue.slice(end);
            // Move cursor to end of inserted text
            const newCursorPos = start + text.length;
            this.chatInput.focus();
            this.chatInput.setSelectionRange(newCursorPos, newCursorPos);
        }
        catch (error) {
            console.error('Error appending to input:', error);
        }
    }
    /**
     * Clears the input field and resets associated state after sending.
     */
    clearInput() {
        this.chatInput.value = '';
        // Directly reset internal state instead of relying on callback
        this.resetCodeReferences();
        this.chatInput.rows = 1;
        this.chatInput.style.height = ''; // Reset height
        this.hasAtSymbol = false; // Reset @ state
        // Reset expand button state if it was expanded
        if (this.isInputExpanded) {
            this.toggleInputExpansion(false); // Collapse input
        }
    }
    /**
     * Sets the markdown mode state and updates the placeholder.
     */
    setMarkdownMode(isMarkdown) {
        this.isMarkdownMode = isMarkdown;
        this.callbacks.updatePlaceholder(this.isMarkdownMode);
        // Update placeholder directly (alternative to callback)
        // this.chatInput.placeholder = this.isMarkdownMode ? 
        //   'Write markdown here...' : 
        //   'Ask me anything...';
    }
    /**
     * Toggles the input expansion state and updates UI.
     */
    toggleInputExpansion(forceState) {
        this.isInputExpanded = forceState !== undefined ? forceState : !this.isInputExpanded;
        if (this.isInputExpanded) {
            this.chatInput.style.height = '200px'; // Example height
            this.chatInput.style.resize = 'vertical';
        }
        else {
            this.chatInput.style.height = ''; // Reset height
            this.chatInput.style.resize = 'none';
            this.chatInput.rows = 1; // Ensure it collapses back to 1 row height
        }
        // Notify UIManager/LayoutBuilder to update button appearance
        this.callbacks.toggleInputExpansionUI(this.isInputExpanded);
    }
    // --- Code Reference Methods ---
    /**
     * Adds a code reference to the internal map and returns its ID.
     * @param code The actual code content.
     * @returns The generated reference ID (e.g., "ref-1").
     */
    addCodeReference(code) {
        const refId = `ref-${this.nextRefId++}`;
        this.codeRefMap.set(refId, code);
        console.log('Added code reference:', refId, '->', code.substring(0, 50) + '...'); // Debug log
        return refId;
    }
    /**
     * Returns the current map of code references.
     */
    getCodeReferenceMap() {
        return this.codeRefMap;
    }
    /**
     * Clears the code reference map and resets the ID counter.
     */
    resetCodeReferences() {
        this.codeRefMap.clear();
        this.nextRefId = 1;
        console.log('Code references reset.'); // Debug log
    }
    /**
     * Replaces code reference placeholders (e.g., "[ref-1]") in a message string
     * with the actual code from the map.
     * @param message The message string potentially containing placeholders.
     * @returns The message string with placeholders resolved.
     */
    resolveCodeReferences(message) {
        if (this.codeRefMap.size === 0) {
            return message; // No references to resolve
        }
        // Regex to find placeholders like [ref-1], [ref-12], etc.
        const placeholderRegex = /\[(ref-\d+)\]/g;
        let resolvedMessage = message.replace(placeholderRegex, (match, refId) => {
            const code = this.codeRefMap.get(refId);
            if (code !== undefined) {
                console.log('Resolving code reference:', refId); // Debug log
                // Add context around the replaced code
                return `\n\`\`\`\n${code}\n\`\`\`\n`;
            }
            else {
                console.warn('Could not find code for reference:', refId); // Warn if ref ID not found
                return match; // Keep the placeholder if not found
            }
        });
        return resolvedMessage;
    }
    /**
     * Explicitly sets the hasAtSymbol flag. Called by shortcut handler.
     */
    setHasAtSymbol(value) {
        this.hasAtSymbol = value;
    }
    /**
     * Gets the current value of the hasAtSymbol flag. Called by shortcut handler.
     */
    getHasAtSymbol() {
        return this.hasAtSymbol;
    }
}
exports.InputHandler = InputHandler;


/***/ }),

/***/ "./lib/handlers/message-handler.js":
/*!*****************************************!*\
  !*** ./lib/handlers/message-handler.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MessageHandler = void 0;
const message_renderer_1 = __webpack_require__(/*! ../ui/message-renderer */ "./lib/ui/message-renderer.js");
const notebook_integration_1 = __webpack_require__(/*! ../utils/notebook-integration */ "./lib/utils/notebook-integration.js");
/**
 * Handles sending messages, interacting with the API,
 * managing streaming responses, and updating the UI and state.
 */
class MessageHandler {
    constructor(apiClient, chatState, uiManager, rendererCallbacks, inputHandler) {
        this.apiClient = apiClient;
        this.chatState = chatState;
        this.uiManager = uiManager;
        this.rendererCallbacks = rendererCallbacks;
        this.inputHandler = inputHandler;
    }
    /**
     * Processes and sends a user-initiated message.
     * Also handles adding the user message to the UI and clearing the input.
     */
    handleSendMessage(message) {
        if (!message)
            return;
        // 1. Add user message to UI and state
        // TODO: Process message for code refs (e.g., replace placeholders)
        const processedMessage = message; // Placeholder for now
        const hasCodeRefs = false; // TODO: Determine this based on processing
        this.addMessage(processedMessage, 'user', hasCodeRefs, true);
        // 2. Clear the input field (using InputHandler)
        this.inputHandler.clearInput();
        // 3. Send message to backend and handle streaming response
        this.streamAndRenderResponse(processedMessage);
    }
    /**
     * Sends an automatic message (e.g., 'confirmed', 'rejected')
     * to the backend and handles the streaming response.
     * Also adds the user's confirmation/rejection action to the UI.
     */
    handleSendAutoMessage(message) {
        if (!message.trim())
            return;
        // Add the user's action ('Confirmed' or 'Rejected') to the UI immediately
        // Use a slightly more descriptive, capitalized text for the UI display.
        const userDisplayMessage = message.charAt(0).toUpperCase() + message.slice(1);
        this.addMessage(userDisplayMessage, 'user', true, true); // Add the user message to UI and state
        // Send the technical message ('confirmed' or 'rejected') to the backend
        // and handle the streaming response from the backend.
        this.streamAndRenderResponse(message);
    }
    /**
     * Adds a message to the UI via UIManager and saves to ChatState.
     * (Helper method, potentially could live in UIManager or be part of its callback)
     */
    addMessage(text, sender, isMarkdown, saveToHistory) {
        // Note: This duplicates the logic from the old SimpleSidebarWidget.addMessage
        // It might be better to have UIManager expose a method to add a rendered message
        // and ChatState handle saving directly.
        // For now, keep it here for clarity of message flow.
        // TODO: Call actual render functions from message-renderer.ts when available
        // Instead of just adding a div directly.
        let messageElement;
        if (sender === 'user') {
            // Replace with renderUserMessage call
            messageElement = document.createElement('div');
            messageElement.className = 'jp-llm-ext-user-message'; // Example class
            messageElement.textContent = text; // Basic rendering for now
        }
        else {
            // renderBotMessage is used after streaming, this part might be redundant
            // or only needed if we add non-streaming bot messages.
            messageElement = document.createElement('div');
            messageElement.className = 'jp-llm-ext-bot-message'; // Example class
            messageElement.textContent = text; // Basic rendering for now
        }
        this.uiManager.addChatMessageElement(messageElement);
        if (saveToHistory) {
            const messageData = { text, sender, isMarkdown };
            this.chatState.addMessageToCurrentChat(messageData);
        }
    }
    /**
     * Core logic for sending a message to the API, handling the stream,
     * rendering the response, and saving the final bot message.
     */
    streamAndRenderResponse(messageToSend) {
        // --- Prepare streaming UI elements (managed by UIManager) ---
        // UIManager should provide a method to create/get these elements
        const { streamingDiv, contentDiv } = this.uiManager.createBotMessageContainer();
        let completeResponse = '';
        const cellContext = (0, notebook_integration_1.getCurrentCellContent)(); // Use utility
        // Stream response from API
        this.apiClient.streamChat(messageToSend, { cellContext }, 
        // On chunk received
        (chunk) => {
            completeResponse += chunk;
            // Update the temporary streaming div
            streamingDiv.textContent = completeResponse;
            this.uiManager.scrollToBottom();
        }, 
        // On complete
        () => {
            var _a;
            // Hide streaming div, show final content div
            streamingDiv.style.display = 'none';
            contentDiv.style.display = 'block';
            // Render the complete response using the renderer function
            const renderedContent = (0, message_renderer_1.renderBotMessage)(completeResponse, { isMarkdown: true }, this.rendererCallbacks);
            contentDiv.innerHTML = ''; // Clear placeholder/previous content
            // Append rendered nodes, skipping any potential wrapper/indicator added by renderBotMessage itself
            while (renderedContent.firstChild) {
                // Check if the node is the specific markdown indicator we might add/remove
                // Or just append everything if renderBotMessage returns the pure content
                if (!((_a = renderedContent.firstChild.classList) === null || _a === void 0 ? void 0 : _a.contains('markdown-indicator'))) {
                    contentDiv.appendChild(renderedContent.firstChild);
                }
                else {
                    // Remove the indicator if it was part of the returned fragment
                    renderedContent.removeChild(renderedContent.firstChild);
                }
            }
            // Save final bot response to history via ChatState
            const isImage = completeResponse.trim().startsWith('/images/'); // Simple check
            const botMessageData = {
                text: completeResponse,
                sender: 'bot',
                isMarkdown: !isImage // Save as markdown unless it's an image URL
            };
            this.chatState.addMessageToCurrentChat(botMessageData);
            this.uiManager.scrollToBottom();
        }, 
        // On error
        (error) => {
            // Hide streaming div, show final content div with error
            streamingDiv.style.display = 'none';
            contentDiv.style.display = 'block';
            // Use a dedicated error rendering style/component if available
            contentDiv.innerHTML = `<div class="jp-llm-ext-error-message">Error: ${error.message}</div>`;
            console.error('API Error:', error);
            this.uiManager.scrollToBottom();
        });
    }
}
exports.MessageHandler = MessageHandler;


/***/ }),

/***/ "./lib/handlers/popup-menu-manager.js":
/*!********************************************!*\
  !*** ./lib/handlers/popup-menu-manager.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PopupMenuManager = void 0;
const globals_1 = __webpack_require__(/*! ../core/globals */ "./lib/core/globals.js");
/**
 * Manages the state and interactions of the multi-level popup menu.
 */
class PopupMenuManager {
    constructor(docManager, widgetNode, callbacks) {
        this.currentMenuLevel = 'top';
        this.currentMenuPath = '';
        this.menuHistory = [];
        this.currentNotebook = null;
        this.selectedMenuItemIndex = -1; // Track currently selected menu item
        this.isRenderingContent = false; // Flag to prevent recursive renders
        this.lastSearchTerm = ''; // Track last search term to avoid unnecessary re-renders
        this.allowedExtensions = ['.py', '.ipynb', '.md', '.json', '.txt', '.csv'];
        this.fileCache = new Map();
        this.docManager = docManager;
        this.widgetNode = widgetNode;
        this.callbacks = callbacks;
        this.popupMenuContainer = document.createElement('div');
        this.popupMenuContainer.className = 'jp-llm-ext-popup-menu-container';
        this.popupMenuContainer.style.display = 'none';
        // Attach to the widget node instead of the body
        this.widgetNode.appendChild(this.popupMenuContainer);
        // Create search input
        this.searchInput = document.createElement('input');
        this.searchInput.type = 'text';
        this.searchInput.placeholder = 'Search...';
        this.searchInput.className = 'jp-llm-ext-popup-menu-search'; // Add class for styling
        // Use 'input' event instead of directly re-rendering on every keystroke
        this.searchInput.addEventListener('input', () => {
            // Only re-render if the search term has actually changed
            if (this.searchInput.value !== this.lastSearchTerm) {
                this.lastSearchTerm = this.searchInput.value;
                this.renderMenuContent();
            }
        });
        // Handle keydown in search input to stop propagation for navigation keys
        this.searchInput.addEventListener('keydown', (event) => {
            console.log(`POPUP Search KeyDown: Key='${event.key}'`);
            // IMPORTANT: Prevent these keys from being captured by the document handler
            if (['ArrowUp', 'ArrowDown', 'Enter', 'Tab', 'Escape'].includes(event.key)) {
                console.log('POPUP (Search Input): Stopping propagation for navigation key:', event.key);
                if (event.key === 'Escape') {
                    // Handle Escape directly here
                    this.hidePopupMenu();
                }
                else if (event.key === 'Enter') {
                    // Maybe select first item on Enter?
                    const menuItems = this.getMenuItems();
                    if (menuItems.length > 0) {
                        this.selectedMenuItemIndex = 0;
                        this.updateSelectionHighlight();
                        // Optionally activate the item:
                        // menuItems[0].click(); 
                    }
                }
                else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                    // Move to first/last menu item
                    // The blur() will be handled by main key handler
                }
                event.stopPropagation();
            }
            // CRITICAL: DO NOT stop propagation for Backspace or other text editing keys
            // This allows default behavior to work properly
        }, true); // Use capture phase
        document.addEventListener('click', this.handleDocumentClick.bind(this), true);
        // IMPORTANT: Use a separate bound function for the document keydown
        // so we can remove the exact same listener later
        this.boundHandleKeyDown = this.handleKeyDown.bind(this);
        document.addEventListener('keydown', this.boundHandleKeyDown, true);
        if (globals_1.globals.notebookTracker) {
            this.currentNotebook = globals_1.globals.notebookTracker.currentWidget;
            globals_1.globals.notebookTracker.currentChanged.connect((sender, notebook) => {
                this.currentNotebook = notebook;
            });
        }
    }
    dispose() {
        document.removeEventListener('click', this.handleDocumentClick.bind(this), true);
        // Remove using the exact same bound function
        document.removeEventListener('keydown', this.boundHandleKeyDown, true);
        // Remove from widgetNode if attached
        if (this.popupMenuContainer.parentNode === this.widgetNode) {
            this.popupMenuContainer.parentNode.removeChild(this.popupMenuContainer);
        }
    }
    handleDocumentClick(event) {
        if (this.popupMenuContainer.style.display !== 'none' && !this.popupMenuContainer.contains(event.target)) {
            const atButton = this.widgetNode.querySelector('#jp-llm-ext-at-button');
            if (atButton && atButton.contains(event.target)) {
                console.log('POPUP: Click was on the @ button, not hiding.');
                return;
            }
            console.log('POPUP: Click detected outside the menu.');
            this.hidePopupMenu();
        }
    }
    async showPopupMenu(x, y) {
        console.log(`POPUP: Showing menu at (${x}, ${y})`);
        // Store the initial anchor point for positioning
        this._anchorX = x;
        this._anchorY = y;
        if (this.popupMenuContainer.style.display === 'none') {
            this.currentMenuLevel = 'top';
            this.currentMenuPath = '';
            this.menuHistory = [];
            this.searchInput.value = ''; // Clear search on show
            this.lastSearchTerm = ''; // Reset last search term
            await this.setCurrentDirectoryPath();
        }
        await this.renderMenuContent();
        // Ensure it's attached to the widget node if somehow detached
        this.widgetNode.appendChild(this.popupMenuContainer);
        // Position the popup menu - handled in updatePopupPosition
        this.updatePopupPosition();
        // Focus the search input if we are in file/directory view, otherwise focus the first item
        if (this.currentMenuLevel === 'files' || this.currentMenuLevel === 'directories') {
            setTimeout(() => {
                // Focus after timeout to ensure DOM is ready
                this.searchInput.focus();
                console.log('POPUP: Focused search input');
            }, 50); // Slightly longer timeout
            this.selectedMenuItemIndex = -1; // Don't select an item if search is focused
        }
        else {
            // Reset and select the first menu item for top level
            this.selectedMenuItemIndex = -1;
            setTimeout(() => this.selectNextMenuItem(), 50);
        }
    }
    hidePopupMenu() {
        if (this.popupMenuContainer.style.display !== 'none') {
            console.log('POPUP: Hiding menu.');
            this.popupMenuContainer.style.display = 'none';
            // No need to explicitly remove from widgetNode unless causing issues
            // If performance becomes an issue with many menus, consider removing/re-adding
            // if (this.popupMenuContainer.parentNode === this.widgetNode) {
            //     this.widgetNode.removeChild(this.popupMenuContainer);
            // }
        }
    }
    async renderMenuContent() {
        // Prevent recursive renders
        if (this.isRenderingContent) {
            console.log('POPUP: Skipping render - already rendering');
            return;
        }
        this.isRenderingContent = true;
        try {
            // Clear existing content
            while (this.popupMenuContainer.firstChild) {
                this.popupMenuContainer.removeChild(this.popupMenuContainer.firstChild);
            }
            // If not at top level, add a search input for filtering items
            if (this.currentMenuLevel !== 'top') {
                // Add search input at the top of the menu
                this.popupMenuContainer.appendChild(this.searchInput);
                // Path display and back button removed for cleaner UI
            }
            // Render different menu content based on current level
            switch (this.currentMenuLevel) {
                case 'top':
                    this.renderTopLevelItems();
                    break;
                case 'files':
                case 'directories':
                    await this.renderDirectoryBrowserItems();
                    break;
                case 'cells':
                    await this.renderCellItems();
                    break;
            }
            // Reset selection after rendering
            this.selectedMenuItemIndex = -1;
            this.updateSelectionHighlight();
            // Update the position to maintain the fixed bottom edge
            if (this.popupMenuContainer.style.display !== 'none' && this._anchorX !== undefined && this._anchorY !== undefined) {
                this.updatePopupPosition();
            }
        }
        catch (error) {
            console.error('POPUP: Error rendering menu content', error);
        }
        finally {
            this.isRenderingContent = false;
        }
    }
    renderTopLevelItems() {
        const topLevelCommands = [
            { label: 'Code', description: '', actionId: 'insert-code' },
            { label: 'Cells', description: '', actionId: 'browse-cells' },
            { label: 'File', description: '', actionId: 'browse-files' },
            { label: 'Directory', description: '', actionId: 'browse-directories' }
        ];
        topLevelCommands.forEach(cmd => {
            const item = this.createMenuItem(cmd.label, cmd.actionId, '', cmd.description);
            this.popupMenuContainer.appendChild(item);
        });
    }
    async renderDirectoryBrowserItems() {
        var _a;
        // Get search term
        const searchTerm = this.searchInput.value.toLowerCase().trim();
        const loadingItem = this.createMenuItem('Loading...', 'loading', '', '');
        loadingItem.style.pointerEvents = 'none';
        // Temporarily add loading item below search/path
        const insertionPoint = (_a = this.popupMenuContainer.querySelector('.jp-llm-ext-popup-menu-path')) === null || _a === void 0 ? void 0 : _a.nextSibling;
        this.popupMenuContainer.insertBefore(loadingItem, insertionPoint || null);
        try {
            // If contents were already fetched recently and we're just filtering again,
            // we could potentially cache the results to avoid unnecessary API calls
            const filterType = this.currentMenuLevel === 'files' ? 'file' : 'directory';
            const contents = await this.listCurrentDirectoryContents(this.currentMenuPath, filterType);
            // Check if still in DOM before trying to remove
            if (this.popupMenuContainer.contains(loadingItem)) {
                this.popupMenuContainer.removeChild(loadingItem);
            }
            if (contents && contents.length > 0) {
                // Filter based on search term
                const filteredContents = contents.filter(item => {
                    return item.name.toLowerCase().includes(searchTerm) ||
                        item.relativePath.toLowerCase().includes(searchTerm);
                });
                if (filteredContents.length > 0) {
                    filteredContents.forEach(item => {
                        const itemName = item.name;
                        const itemType = item.type;
                        const itemPath = item.path;
                        const relativePath = item.relativePath;
                        const icon = itemType === 'directory' ? '📁' : '📄';
                        let actionId;
                        if (itemType === 'directory') {
                            actionId = this.currentMenuLevel === 'files' ? 'select-directory-navigate' : 'select-directory-callback';
                        }
                        else { // itemType === 'file'
                            actionId = 'select-file';
                        }
                        const menuItem = this.createMenuItem(`${icon} ${itemName}`, actionId, itemPath, relativePath !== '.' ? relativePath : '');
                        this.popupMenuContainer.appendChild(menuItem);
                    });
                }
                else {
                    const emptyItem = this.createMenuItem(searchTerm ? 'No matches found' : `No ${filterType}s found`, 'empty', '', '');
                    emptyItem.style.pointerEvents = 'none';
                    this.popupMenuContainer.appendChild(emptyItem);
                }
            }
            else {
                const emptyItem = this.createMenuItem(`No items found in this directory`, 'empty', '', '');
                emptyItem.style.pointerEvents = 'none';
                this.popupMenuContainer.appendChild(emptyItem);
            }
        }
        catch (error) {
            if (this.popupMenuContainer.contains(loadingItem)) {
                this.popupMenuContainer.removeChild(loadingItem);
            }
            const errorItem = this.createMenuItem(`Error: ${error}`, 'error', '', '');
            errorItem.style.color = 'red';
            errorItem.style.pointerEvents = 'none';
            this.popupMenuContainer.appendChild(errorItem);
            console.error('POPUP: Error loading/filtering directory contents:', error);
        }
    }
    /**
     * Renders all cells from the current notebook
     */
    async renderCellItems() {
        var _a, _b;
        // Get search term for filtering
        const searchTerm = this.searchInput.value.toLowerCase().trim();
        // Create a loading indicator
        const loadingItem = this.createMenuItem('Loading cells...', 'loading', '', '');
        loadingItem.style.pointerEvents = 'none';
        const insertionPoint = (_a = this.popupMenuContainer.querySelector('.jp-llm-ext-popup-menu-path')) === null || _a === void 0 ? void 0 : _a.nextSibling;
        this.popupMenuContainer.insertBefore(loadingItem, insertionPoint || null);
        try {
            // Check if we have an active notebook
            if (!this.currentNotebook || !this.currentNotebook.content || !this.currentNotebook.content.model) {
                // Remove loading item
                if (this.popupMenuContainer.contains(loadingItem)) {
                    this.popupMenuContainer.removeChild(loadingItem);
                }
                const errorItem = this.createMenuItem('No active notebook found', 'error', '', '');
                errorItem.style.color = 'red';
                errorItem.style.pointerEvents = 'none';
                this.popupMenuContainer.appendChild(errorItem);
                return;
            }
            const notebookModel = this.currentNotebook.content.model;
            const cells = notebookModel.cells;
            // Remove loading indicator
            if (this.popupMenuContainer.contains(loadingItem)) {
                this.popupMenuContainer.removeChild(loadingItem);
            }
            if (!cells || cells.length === 0) {
                const emptyItem = this.createMenuItem('No cells in notebook', 'empty', '', '');
                emptyItem.style.pointerEvents = 'none';
                this.popupMenuContainer.appendChild(emptyItem);
                return;
            }
            // Process and display each cell
            let filteredCellCount = 0;
            for (let i = 0; i < cells.length; i++) {
                const cell = cells.get(i);
                const cellType = cell.type;
                const cellContent = cell.sharedModel ? cell.sharedModel.getSource() :
                    (((_b = cell.toJSON()) === null || _b === void 0 ? void 0 : _b.source) || '');
                // Use type casting to avoid TypeScript errors
                const executionCount = cellType === 'code' ?
                    (cell.executionCount !== undefined && cell.executionCount !== null ?
                        cell.executionCount : '*') :
                    '';
                // Create a preview of the cell content (truncate if needed)
                const contentPreview = typeof cellContent === 'string' ?
                    cellContent :
                    (Array.isArray(cellContent) ? cellContent.join('\n') : '');
                const firstLine = contentPreview.split('\n')[0] || '';
                const truncatedContent = firstLine.length > 30 ?
                    firstLine.substring(0, 30) + '...' :
                    firstLine;
                // Create cell label with styled type indicator
                const typeIndicator = cellType === 'markdown' ? 'M' : 'C';
                const executionDisplay = executionCount !== '' ? `[${executionCount}]` : '';
                // Create menu item for this cell
                const cellItem = this.createMenuItem('', // Empty text, will be added as HTML
                'select-cell', i.toString() // Store cell index in path
                );
                // Create styled content with HTML elements
                const typeSpan = document.createElement('span');
                typeSpan.className = `cell-type-indicator cell-type-${cellType === 'markdown' ? 'md' : 'code'}`;
                typeSpan.textContent = typeIndicator;
                const execSpan = document.createElement('span');
                execSpan.className = 'cell-exec-count';
                execSpan.textContent = executionDisplay;
                execSpan.style.marginRight = '8px';
                const contentSpan = document.createElement('span');
                contentSpan.className = 'cell-content-preview';
                contentSpan.textContent = truncatedContent;
                // Get the label span (first child of the menu item)
                const labelSpan = cellItem.querySelector('span');
                if (labelSpan) {
                    labelSpan.textContent = ''; // Clear existing text
                    labelSpan.appendChild(typeSpan);
                    if (executionDisplay) {
                        labelSpan.appendChild(execSpan);
                    }
                    labelSpan.appendChild(contentSpan);
                }
                // Construct full searchable text
                const searchableText = `${typeIndicator} ${executionDisplay} ${truncatedContent}`.toLowerCase();
                // Filter by search term if one is provided
                if (searchTerm && !searchableText.includes(searchTerm)) {
                    continue;
                }
                this.popupMenuContainer.appendChild(cellItem);
                filteredCellCount++;
            }
            if (filteredCellCount === 0) {
                const noMatchItem = this.createMenuItem('No matching cells found', 'empty', '', '');
                noMatchItem.style.pointerEvents = 'none';
                this.popupMenuContainer.appendChild(noMatchItem);
            }
        }
        catch (error) {
            // Clean up loading indicator
            if (this.popupMenuContainer.contains(loadingItem)) {
                this.popupMenuContainer.removeChild(loadingItem);
            }
            const errorItem = this.createMenuItem(`Error: ${error}`, 'error', '', '');
            errorItem.style.color = 'red';
            errorItem.style.pointerEvents = 'none';
            this.popupMenuContainer.appendChild(errorItem);
            console.error('POPUP: Error loading notebook cells:', error);
        }
    }
    createMenuItem(text, actionId, path = '', description = '') {
        const item = document.createElement('div');
        item.className = 'jp-llm-ext-popup-menu-item';
        item.dataset.actionId = actionId;
        if (path) {
            item.dataset.path = path;
        }
        item.onclick = (event) => this.handleMenuClick(event);
        const labelSpan = document.createElement('span');
        labelSpan.textContent = text;
        item.appendChild(labelSpan);
        if (description) {
            const pathSpan = document.createElement('span');
            pathSpan.className = 'jp-llm-ext-popup-menu-path-indicator';
            pathSpan.textContent = description;
            pathSpan.style.fontSize = '0.85em';
            pathSpan.style.color = 'var(--jp-ui-font-color2)';
            pathSpan.style.marginLeft = '8px';
            pathSpan.style.opacity = '0.8';
            pathSpan.style.display = 'inline-block'; // Ensure the path is always displayed
            item.appendChild(pathSpan);
        }
        return item;
    }
    async handleMenuClick(event) {
        var _a;
        const target = event.currentTarget;
        const actionId = target.dataset.actionId;
        const path = target.dataset.path || '';
        console.log(`POPUP: Menu item clicked. Action: ${actionId}, Path: ${path}`);
        switch (actionId) {
            case 'navigate-back':
                this.navigateBackMenu();
                break;
            case 'insert-code': {
                const selectedText = this.callbacks.getSelectedText ? this.callbacks.getSelectedText() : null;
                if (selectedText) {
                    // Show submenu for code insertion options
                    const submenuItems = [
                        { label: 'Insert as plain code', actionId: 'insert-plain-code', data: selectedText },
                        { label: 'Insert as collapsed reference', actionId: 'collapse-code-ref', data: selectedText }
                    ];
                    // Replace current menu with submenu options
                    this.popupMenuContainer.innerHTML = '';
                    submenuItems.forEach(item => {
                        const menuItem = this.createMenuItem(item.label, item.actionId, item.data);
                        this.popupMenuContainer.appendChild(menuItem);
                    });
                    // Add back button
                    const backButton = this.createMenuItem('Back', 'navigate-back');
                    backButton.style.borderTop = '1px solid var(--jp-border-color1)';
                    this.popupMenuContainer.appendChild(backButton);
                    return; // Don't hide menu, wait for submenu selection
                }
                else {
                    const cellContent = this.callbacks.getCurrentCellContent ? this.callbacks.getCurrentCellContent() : null;
                    if (cellContent) {
                        this.callbacks.insertCode(cellContent);
                    }
                }
                this.hidePopupMenu();
                break;
            }
            case 'insert-plain-code': {
                if (path) {
                    this.callbacks.insertCode(path);
                    this.hidePopupMenu();
                }
                break;
            }
            case 'collapse-code-ref': {
                if (path && this.currentNotebook) {
                    try {
                        // Get notebook file name (without extension)
                        const notebookPath = this.currentNotebook.context.path;
                        const notebookName = ((_a = notebookPath.split('/').pop()) === null || _a === void 0 ? void 0 : _a.split('.')[0]) || 'notebook';
                        // Find current cell index and approximate line number
                        const currentCell = this.currentNotebook.content.activeCell;
                        if (!currentCell) {
                            throw new Error('No active cell found');
                        }
                        // Get current cell index
                        const currentCellIndex = this.currentNotebook.content.activeCellIndex;
                        // Estimate line number from cursor position
                        let lineNumber = 1; // Default to line 1
                        if (currentCell.editor) {
                            const editor = currentCell.editor;
                            const cursor = editor.getCursorPosition();
                            if (cursor) {
                                lineNumber = cursor.line + 1; // Convert to 1-indexed
                            }
                        }
                        // Invoke the callback with all the information needed
                        this.callbacks.insertCollapsedCodeRef(path, currentCellIndex, lineNumber, notebookName);
                        this.hidePopupMenu();
                    }
                    catch (error) {
                        console.error('Error creating collapsed code reference:', error);
                        // Fallback to inserting code directly
                        this.callbacks.insertCode(path);
                        this.hidePopupMenu();
                    }
                }
                else {
                    // If something went wrong or no path provided, just insert as regular code
                    if (path) {
                        this.callbacks.insertCode(path);
                    }
                    this.hidePopupMenu();
                }
                break;
            }
            case 'browse-cells':
                await this.navigateMenu('cells', '');
                this.searchInput.value = '';
                break;
            case 'browse-files':
                await this.navigateMenu('files', this.currentMenuPath || '');
                // Clear search when changing view type
                this.searchInput.value = '';
                break;
            case 'browse-directories':
                await this.navigateMenu('directories', this.currentMenuPath || '');
                // Clear search when changing view type
                this.searchInput.value = '';
                break;
            case 'select-cell':
                if (path) {
                    const cellIndex = parseInt(path);
                    if (!isNaN(cellIndex) && this.callbacks.insertCellByIndex) {
                        this.callbacks.insertCellByIndex(cellIndex);
                        this.hidePopupMenu();
                    }
                    else {
                        console.error('POPUP: Invalid cell index or callback missing.');
                    }
                }
                break;
            case 'select-file':
                if (path) {
                    this.callbacks.insertFilePath(path);
                    this.hidePopupMenu();
                }
                else {
                    console.error('POPUP: File selected but path is missing.');
                }
                break;
            case 'select-directory-navigate': // New action to navigate into dir when in file view
                if (path) {
                    // Clear the file cache for the specific directory to force a refresh
                    const cacheKey = `${path}:${this.currentMenuLevel === 'files' ? 'file' : 'directory'}`;
                    this.fileCache.delete(cacheKey);
                    // Make sure we're passing the correct level type
                    const level = (this.currentMenuLevel === 'files' || this.currentMenuLevel === 'directories') ?
                        this.currentMenuLevel : 'files';
                    await this.navigateMenu(level, path);
                    this.searchInput.value = ''; // Clear search on navigation
                }
                else {
                    console.error('POPUP: Directory selected for navigation but path is missing.');
                }
                break;
            case 'select-directory-callback': // New action to select dir when in directory view
                if (path) {
                    this.callbacks.insertDirectoryPath(path); // Use the callback
                    this.hidePopupMenu();
                }
                else {
                    console.error('POPUP: Directory selected for callback but path is missing.');
                }
                break;
            case 'placeholder-action':
                console.log('Placeholder action triggered.');
                this.hidePopupMenu();
                break;
            case 'loading':
            case 'empty':
            case 'error':
                break;
            default:
                console.warn('Unknown menu action:', actionId);
                this.hidePopupMenu();
                break;
        }
        event.stopPropagation();
    }
    async navigateMenu(level, path) {
        console.log(`POPUP: Navigating to level: ${level}, path: ${path}`);
        // Only push history if we are actually moving to a new state
        if (this.currentMenuLevel !== level || this.currentMenuPath !== path) {
            this.menuHistory.push({ level: this.currentMenuLevel, path: this.currentMenuPath });
        }
        this.currentMenuLevel = level;
        this.currentMenuPath = path;
        // Don't clear search on programmatic navigation (like back button)
        // this.searchInput.value = ''; // Maybe keep search term?
        await this.renderMenuContent();
        // Focus search input after navigating to file/dir view
        if (level === 'files' || level === 'directories') {
            setTimeout(() => this.searchInput.focus(), 0);
            this.selectedMenuItemIndex = -1; // Reset selection
        }
        else {
            // Select first item if navigating back to top level
            this.selectedMenuItemIndex = -1;
            setTimeout(() => this.selectNextMenuItem(), 0);
        }
    }
    navigateBackMenu() {
        const previousState = this.menuHistory.pop();
        if (previousState) {
            console.log(`POPUP: Navigating back to level: ${previousState.level}, path: ${previousState.path}`);
            this.currentMenuLevel = previousState.level;
            this.currentMenuPath = previousState.path;
            // Don't clear search on back navigation
            this.renderMenuContent().then(() => {
                // Focus search input if going back to file/dir view
                if (this.currentMenuLevel === 'files' || this.currentMenuLevel === 'directories') {
                    setTimeout(() => this.searchInput.focus(), 0);
                    this.selectedMenuItemIndex = -1; // Reset selection
                }
                else {
                    // Select first item if going back to top level
                    this.selectedMenuItemIndex = -1;
                    setTimeout(() => this.selectNextMenuItem(), 0);
                }
            });
        }
        else {
            console.log('POPUP: Already at the top level.');
            this.hidePopupMenu();
        }
    }
    async listCurrentDirectoryContents(basePath, filterType) {
        console.log(`POPUP: Listing directory contents for path: '${basePath}', filter: ${filterType || 'all'}`);
        // Check cache first
        const cacheKey = `${basePath}:${filterType || 'all'}`;
        if (this.fileCache.has(cacheKey)) {
            console.log('POPUP: Using cached directory contents');
            return this.fileCache.get(cacheKey) || null;
        }
        try {
            const effectivePath = basePath === '/' ? '' : basePath;
            // Ensure trailing slash removed for consistency unless it's root
            const pathForApi = effectivePath.endsWith('/') && effectivePath.length > 1 ? effectivePath.slice(0, -1) : effectivePath;
            // Result array that will hold all files and directories
            let allResults = [];
            // Get the base directory contents (non-recursive)
            const baseContents = await this.docManager.services.contents.get(pathForApi || '');
            if (baseContents.type !== 'directory') {
                console.error('Path is not a directory:', basePath);
                return null;
            }
            // Process base directory items
            for (const item of baseContents.content) {
                const itemType = item.type === 'directory' ? 'directory' : 'file';
                // Add directories if we're listing directories or both
                if (itemType === 'directory' && (filterType === 'directory' || filterType === undefined)) {
                    allResults.push({
                        name: item.name,
                        path: item.path,
                        type: 'directory',
                        relativePath: `./${item.name}`
                    });
                }
                // Add files if we're listing files and the extension is allowed
                if (itemType === 'file' && (filterType === 'file' || filterType === undefined)) {
                    const fileExt = `.${item.name.split('.').pop()}`.toLowerCase();
                    if (this.allowedExtensions.includes(fileExt)) {
                        allResults.push({
                            name: item.name,
                            path: item.path,
                            type: 'file',
                            relativePath: `./${item.name}`
                        });
                    }
                }
            }
            // Sort the results appropriately
            allResults = allResults.sort((a, b) => {
                // If listing directories only, sort alphabetically
                if (filterType === 'directory') {
                    return a.name.localeCompare(b.name);
                }
                // If listing files only, sort alphabetically
                if (filterType === 'file') {
                    return a.name.localeCompare(b.name);
                }
                // If listing both, sort directories first, then files alphabetically
                if (a.type === 'directory' && b.type !== 'directory')
                    return -1;
                if (a.type !== 'directory' && b.type === 'directory')
                    return 1;
                return a.name.localeCompare(b.name);
            });
            // Cache the results for future use
            this.fileCache.set(cacheKey, allResults);
            console.log(`POPUP: Found ${allResults.length} items for path '${basePath}'`);
            return allResults;
        }
        catch (error) {
            console.error(`POPUP: Error listing directory contents for '${basePath}':`, error);
            return null;
        }
    }
    async setCurrentDirectoryPath() {
        var _a;
        let dirPath = null;
        const app = globals_1.globals.app;
        if (!app) {
            console.error('POPUP: Application reference not available');
            this.currentMenuPath = '';
            return;
        }
        const currentShellWidget = app.shell.currentWidget;
        if (currentShellWidget) {
            const widgetContext = this.docManager.contextForWidget(currentShellWidget);
            if (widgetContext) {
                const path = widgetContext.path;
                dirPath = this.getParentDirectory(path);
                console.log(`POPUP: Path from current widget context: ${path} -> ${dirPath}`);
            }
        }
        if (dirPath === null && this.currentNotebook && this.currentNotebook.context) {
            const notebookPath = this.currentNotebook.context.path;
            if (typeof notebookPath === 'string') {
                dirPath = this.getParentDirectory(notebookPath);
                console.log(`POPUP: Path from active notebook: ${notebookPath} -> ${dirPath}`);
            }
        }
        if (dirPath === null) {
            try {
                const leftWidgets = Array.from(app.shell.widgets('left'));
                const fileBrowserWidget = leftWidgets.find(widget => widget.id === 'filebrowser');
                if (fileBrowserWidget && typeof ((_a = fileBrowserWidget.model) === null || _a === void 0 ? void 0 : _a.path) === 'string') {
                    dirPath = fileBrowserWidget.model.path;
                    console.log(`POPUP: Path from file browser widget model: ${dirPath}`);
                }
                else {
                    console.log('POPUP: File browser widget path not directly accessible.');
                }
            }
            catch (e) {
                console.warn('POPUP: Could not get path from file browser.', e);
            }
        }
        if (dirPath === null) {
            dirPath = '';
            console.log('POPUP: Falling back to server root path.');
        }
        this.currentMenuPath = dirPath;
        console.log(`POPUP: Initial current menu path set to: '${this.currentMenuPath}'`);
    }
    getParentDirectory(path) {
        if (!path)
            return '';
        const lastSlash = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\\\'));
        if (lastSlash === -1)
            return ''; // No directory part, likely root or just a filename
        return path.substring(0, lastSlash);
    }
    /**
     * Handle keyboard navigation when the popup menu is shown
     */
    handleKeyDown(event) {
        var _a;
        // Skip if menu not visible
        if (this.popupMenuContainer.style.display === 'none') {
            return;
        }
        console.log(`POPUP KeyDown: Key='${event.key}', Target='${(_a = event.target) === null || _a === void 0 ? void 0 : _a.tagName}', SearchFocused='${document.activeElement === this.searchInput}'`);
        // Special handling for when search input is focused
        if (document.activeElement === this.searchInput) {
            // The input's own keydown handler will handle most keys
            // But for certain keys like arrow keys, we may need to move focus
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                // Move selection to first/last item
                event.preventDefault();
                event.stopPropagation();
                // Delay before moving focus - this gives time for the search input's
                // own keydown handler to process the key first
                setTimeout(() => {
                    if (event.key === 'ArrowDown') {
                        this.searchInput.blur();
                        this.selectNextMenuItem();
                    }
                    else { // ArrowUp
                        this.searchInput.blur();
                        this.selectPreviousMenuItem();
                    }
                }, 0);
                return;
            }
            // IMPORTANT: For Backspace in search input, just return without handling
            // Let the default behavior happen
            if (event.key === 'Backspace') {
                // Just perform default behavior in search input
                return;
            }
            // Let all other keys be handled by the search input's own handler
            return;
        }
        // From here, search input is NOT focused
        const menuItems = this.getMenuItems();
        switch (event.key) {
            case 'ArrowDown':
                if (menuItems.length > 0) {
                    console.log('POPUP KeyDown (Menu Focused): ArrowDown');
                    event.preventDefault();
                    event.stopPropagation();
                    this.selectNextMenuItem();
                }
                break;
            case 'ArrowUp':
                if (menuItems.length > 0) {
                    console.log('POPUP KeyDown (Menu Focused): ArrowUp');
                    event.preventDefault();
                    event.stopPropagation();
                    this.selectPreviousMenuItem();
                }
                break;
            case 'Backspace':
                console.log('POPUP KeyDown (Menu Focused): Backspace');
                // Only prevent default and navigate back if we have history
                if (this.menuHistory.length > 0) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.navigateBackMenu();
                }
                else {
                    console.log('POPUP KeyDown (Menu Focused): No history, allowing Backspace default action');
                    // Allow default - don't prevent or stop propagation
                }
                break;
            case 'Enter':
                console.log('POPUP KeyDown (Menu Focused): Enter');
                // Only activate if an item is selected
                if (this.selectedMenuItemIndex >= 0 && this.selectedMenuItemIndex < menuItems.length) {
                    event.preventDefault();
                    event.stopPropagation();
                    menuItems[this.selectedMenuItemIndex].click();
                }
                break;
            case 'Tab':
                console.log('POPUP KeyDown (Menu Focused): Tab');
                // Basic Tab support: move focus between search and first/last item
                event.preventDefault();
                event.stopPropagation();
                if (this.currentMenuLevel === 'files' || this.currentMenuLevel === 'directories') {
                    this.searchInput.focus();
                    this.deselectAllMenuItems(); // Deselect items when search gets focus via Tab
                }
                else {
                    // Maybe close menu on Tab from top level? Or do nothing.
                    this.hidePopupMenu();
                }
                break;
            case 'Escape':
                console.log('POPUP KeyDown (Menu Focused): Escape');
                event.preventDefault();
                event.stopPropagation();
                this.hidePopupMenu();
                break;
            default:
                console.log(`POPUP KeyDown (Menu Focused): Default key '${event.key}'`);
                // If typing a character and in file/dir view, focus search
                if ((this.currentMenuLevel === 'files' || this.currentMenuLevel === 'directories') &&
                    event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
                    event.preventDefault(); // Prevent character appearing elsewhere
                    event.stopPropagation();
                    this.searchInput.focus();
                    // Manually append the typed character as focus happens after keydown default action
                    this.searchInput.value += event.key;
                    // Trigger input event manually to update list
                    this.searchInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                }
                // Allow other keys (e.g., modifiers) to pass through if not handled
                break;
        }
    }
    updateSelectionHighlight() {
        const menuItems = this.getMenuItems();
        console.log(`POPUP updateSelectionHighlight: Highlighting index ${this.selectedMenuItemIndex} among ${menuItems.length} items.`);
        menuItems.forEach((item, index) => {
            if (index === this.selectedMenuItemIndex) {
                if (!item.classList.contains('selected')) {
                    item.classList.add('selected');
                    console.log(`POPUP updateSelectionHighlight: Added 'selected' to item ${index}`);
                    // Ensure item is visible
                    item.scrollIntoView({ block: 'nearest' });
                }
            }
            else {
                if (item.classList.contains('selected')) {
                    item.classList.remove('selected');
                    console.log(`POPUP updateSelectionHighlight: Removed 'selected' from item ${index}`);
                }
            }
        });
    }
    deselectAllMenuItems() {
        const menuItems = this.getMenuItems();
        menuItems.forEach(item => item.classList.remove('selected'));
        this.selectedMenuItemIndex = -1;
    }
    selectNextMenuItem() {
        const menuItems = this.getMenuItems();
        if (!menuItems.length) {
            console.log('POPUP selectNext: No items to select.');
            this.selectedMenuItemIndex = -1; // Ensure index is reset
            return;
        }
        const oldIndex = this.selectedMenuItemIndex;
        // Deselect current first is handled by updateSelectionHighlight
        // Move to the next item or loop back to the first
        this.selectedMenuItemIndex = (this.selectedMenuItemIndex + 1) % menuItems.length;
        console.log(`POPUP selectNext: Index changed from ${oldIndex} to ${this.selectedMenuItemIndex}`);
        this.updateSelectionHighlight();
    }
    selectPreviousMenuItem() {
        const menuItems = this.getMenuItems();
        if (!menuItems.length) {
            console.log('POPUP selectPrevious: No items to select.');
            this.selectedMenuItemIndex = -1; // Ensure index is reset
            return;
        }
        const oldIndex = this.selectedMenuItemIndex;
        // Deselect current first is handled by updateSelectionHighlight
        // Move to the previous item or loop to the last
        this.selectedMenuItemIndex = this.selectedMenuItemIndex <= 0 ?
            menuItems.length - 1 : this.selectedMenuItemIndex - 1;
        console.log(`POPUP selectPrevious: Index changed from ${oldIndex} to ${this.selectedMenuItemIndex}`);
        this.updateSelectionHighlight();
    }
    /**
     * Get all interactive menu items
     */
    getMenuItems() {
        const items = Array.from(this.popupMenuContainer.querySelectorAll('.jp-llm-ext-popup-menu-item'));
        // Filter out non-interactive items like loading, empty, error
        return items.filter(item => {
            const actionId = item.dataset.actionId;
            return actionId !== 'loading' && actionId !== 'empty' && actionId !== 'error';
        });
    }
    /**
     * Update popup position, keeping the bottom edge fixed at the anchor point
     */
    updatePopupPosition() {
        var _a, _b;
        // Make sure anchor points are defined
        const anchorX = (_a = this._anchorX) !== null && _a !== void 0 ? _a : 0;
        const anchorY = (_b = this._anchorY) !== null && _b !== void 0 ? _b : 0;
        // Position the popup menu
        this.popupMenuContainer.style.position = 'absolute';
        this.popupMenuContainer.style.left = `${anchorX}px`;
        // Show the menu so we can calculate its height
        this.popupMenuContainer.style.display = 'block';
        // Get the actual height after rendering
        const menuHeight = this.popupMenuContainer.offsetHeight;
        // Add a small gap (10px) between the bottom of the menu and the trigger point
        const gap = 10;
        // Position above the cursor/button to keep bottom edge at the anchor point:
        // y - gap = bottom edge of popup, so popup top = y - gap - menuHeight
        this.popupMenuContainer.style.top = `${anchorY - gap - menuHeight}px`;
        console.log(`POPUP: Positioned menu at height ${menuHeight}px with bottom at ${anchorY - gap}px`);
    }
}
exports.PopupMenuManager = PopupMenuManager;


/***/ }),

/***/ "./lib/handlers/settings-handler.js":
/*!******************************************!*\
  !*** ./lib/handlers/settings-handler.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SettingsHandler = void 0;
// import { SettingsModal } from '../ui/settings-modal'; // Commented out - unused import
/**
 * Handles the logic related to the settings modal:
 * displaying, hiding, populating, saving, and showing feedback.
 */
class SettingsHandler {
    constructor(state, 
    // successCallback: (message: string) => void, // Commented out - unused parameter
    settingsModalContainer, uiManager // Pass UIManager for notifications
    ) {
        this.state = state;
        // this.apiClient = apiClient; // Removed: unused variable
        // this.successCallback = successCallback; // Commented out - unused assignment
        this.settingsModalContainer = settingsModalContainer;
        this.uiManager = uiManager;
        // Attach internal listeners if the modal has its own save/cancel buttons
        // This assumes the modal element was created with listeners calling these methods.
        // If createSettingsModalElement in ui/settings-modal.ts attaches listeners that 
        // call callbacks passed during creation, then this handler doesn't need 
        // to attach listeners directly, just provide the callbacks (e.g., this.saveSettings.bind(this)).
        // For now, let's assume the callbacks passed to createSettingsModalElement handle this.
    }
    /**
     * Populates the settings form with current values and displays the modal.
     */
    showModal() {
        const currentSettings = this.state.getSettings();
        if (currentSettings) {
            try {
                // Query elements within the modal container
                this.settingsModalContainer.querySelector('#settings-provider').value = currentSettings.provider;
                this.settingsModalContainer.querySelector('#settings-api-key').value = currentSettings.apiKey;
                this.settingsModalContainer.querySelector('#settings-api-url').value = currentSettings.apiUrl;
                this.settingsModalContainer.querySelector('#settings-rules').value = currentSettings.rules;
            }
            catch (error) {
                console.error('Error populating settings form:', error);
                // Optionally show an error to the user
            }
        }
        this.settingsModalContainer.style.display = 'flex';
    }
    /**
     * Hides the settings modal.
     */
    hideModal() {
        this.settingsModalContainer.style.display = 'none';
    }
    /**
     * Reads values from the form, saves them using SettingsState,
     * updates the ApiClient, hides the modal, and shows a success notification.
     * This method is intended to be called by the modal's save button listener.
     */
    saveSettings() {
        var _a, _b, _c, _d;
        // Get values from form fields within the modal container
        const provider = (_a = this.settingsModalContainer.querySelector('#settings-provider')) === null || _a === void 0 ? void 0 : _a.value;
        const key = (_b = this.settingsModalContainer.querySelector('#settings-api-key')) === null || _b === void 0 ? void 0 : _b.value;
        const url = (_c = this.settingsModalContainer.querySelector('#settings-api-url')) === null || _c === void 0 ? void 0 : _c.value;
        const rules = (_d = this.settingsModalContainer.querySelector('#settings-rules')) === null || _d === void 0 ? void 0 : _d.value;
        // Basic validation
        if (provider === undefined || key === undefined || url === undefined || rules === undefined) {
            console.error("Could not find all settings input elements.");
            this.showNotification('Error: Could not save settings. Input elements missing.', 'error');
            return;
        }
        const settings = { provider, apiKey: key, apiUrl: url, rules };
        try {
            // Save settings using SettingsState
            this.state.saveSettings(settings);
            console.log('Settings saved via SettingsState:', settings);
            // Reconfigure ApiClient instance
            // TODO: The ApiClient should ideally observe the SettingsState 
            // or have a dedicated update method instead of creating a new instance.
            // For now, we assume the main widget will recreate/update the ApiClient 
            // or pass an update callback.
            // Example: this.apiClient.updateConfig(settings.apiUrl || undefined);
            console.log('API Client needs reconfiguration with new settings.');
            this.hideModal();
            this.showNotification('Settings saved successfully', 'success');
        }
        catch (error) {
            console.error('Error saving settings:', error);
            this.showNotification(`Error saving settings: ${error}`, 'error');
        }
    }
    /**
     * Displays a temporary notification message.
     * Relies on UIManager to provide the actual notification mechanism.
     */
    showNotification(message, type) {
        // Delegate notification display to UIManager or a dedicated notification service
        if (this.uiManager && typeof this.uiManager.showNotification === 'function') {
            this.uiManager.showNotification(message, type);
        }
        else {
            // Fallback or log if UIManager doesn't support notifications yet
            console.log(`Notification (${type}): ${message}`);
            // The old popSaveSuccess logic requires direct access to the widget node,
            // which this handler shouldn't have. This needs to be handled by the UI layer.
        }
    }
}
exports.SettingsHandler = SettingsHandler;


/***/ }),

/***/ "./lib/handlers/shortcut-handler.js":
/*!******************************************!*\
  !*** ./lib/handlers/shortcut-handler.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.setupShortcuts = setupShortcuts;
exports.removeShortcuts = removeShortcuts;
const notebook_integration_1 = __webpack_require__(/*! ../utils/notebook-integration */ "./lib/utils/notebook-integration.js");
let _handleKeyDown = null;
/**
 * Sets up global keyboard shortcuts for the extension.
 *
 * @param inputHandler Instance of InputHandler to interact with input state/methods.
 * @param popupMenuManager Instance of PopupMenuManager.
 * @param callbacks Object containing callback functions for UI interactions.
 */
function setupShortcuts(inputHandler, // Pass InputHandler instance directly
popupMenuManager, callbacks) {
    if (_handleKeyDown) {
        console.warn('Shortcuts already set up. Removing previous listener.');
        removeShortcuts();
    }
    _handleKeyDown = (event) => {
        const { showIndicator, appendToInput, showWidget, focusInput } = callbacks;
        // Check for @ key
        if (event.key === '@') {
            // Prevent default browser behavior
            event.preventDefault();
            event.stopPropagation();
            // Check if the input field is the active element
            // We rely on InputHandler potentially managing focus or assume it is handled elsewhere
            const inputField = document.activeElement; // A bit fragile
            if (inputField && inputField.tagName === 'TEXTAREA' && inputField.classList.contains('jp-llm-ext-input-field')) {
                // Get cursor position
                const cursorPosition = inputField.selectionStart || 0;
                const textBeforeCursor = inputField.value.substring(0, cursorPosition);
                // Calculate position to show menu (simplified example)
                const inputRect = inputField.getBoundingClientRect();
                const lineHeight = parseInt(window.getComputedStyle(inputField).lineHeight) || 20;
                const linesBeforeCursor = (textBeforeCursor.match(/\n/g) || []).length;
                const cursorTop = inputRect.top + (linesBeforeCursor * lineHeight);
                const left = inputRect.left + 10; // Simplified horizontal position
                // Insert @ symbol at cursor position
                const newValue = inputField.value.substring(0, cursorPosition) +
                    '@' +
                    inputField.value.substring(cursorPosition);
                inputField.value = newValue;
                // Update has @ symbol flag via InputHandler
                inputHandler.setHasAtSymbol(true);
                // Move cursor after the @ symbol
                inputField.selectionStart = cursorPosition + 1;
                inputField.selectionEnd = cursorPosition + 1;
                // Show the popup menu
                popupMenuManager.showPopupMenu(left + 60, cursorTop - 20); // Adjust positioning as needed
                showIndicator('Browse cells, code, files, and more');
            }
        }
        // Check for Ctrl+L (insert selection or cell)
        else if (event.ctrlKey && event.key.toLowerCase() === 'l') {
            event.preventDefault();
            event.stopPropagation();
            const selected = (0, notebook_integration_1.getSelectedText)();
            if (selected) {
                appendToInput(`@code ${selected}`); // Use callback
                showIndicator('Selected code inserted');
            }
            else {
                const cellContent = (0, notebook_integration_1.getCurrentCellContent)();
                if (cellContent) {
                    appendToInput(`@cell ${cellContent}`); // Use callback
                    showIndicator('Cell content inserted');
                }
            }
            // Ensure the sidebar is visible and input is focused
            showWidget(); // Use callback
            focusInput(); // Use callback
        }
    };
    // Add the event listener to the document
    document.addEventListener('keydown', _handleKeyDown);
}
/**
 * Removes the global keyboard shortcut listener.
 */
function removeShortcuts() {
    if (_handleKeyDown) {
        document.removeEventListener('keydown', _handleKeyDown);
        _handleKeyDown = null;
        console.log('Removed keyboard shortcuts.');
    }
    else {
        console.warn('Attempted to remove shortcuts, but none were active.');
    }
}


/***/ }),

/***/ "./lib/index.js":
/*!**********************!*\
  !*** ./lib/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiClient = void 0;
const launcher_1 = __webpack_require__(/*! @jupyterlab/launcher */ "webpack/sharing/consume/default/@jupyterlab/launcher");
const apputils_1 = __webpack_require__(/*! @jupyterlab/apputils */ "webpack/sharing/consume/default/@jupyterlab/apputils");
const notebook_1 = __webpack_require__(/*! @jupyterlab/notebook */ "webpack/sharing/consume/default/@jupyterlab/notebook");
const docmanager_1 = __webpack_require__(/*! @jupyterlab/docmanager */ "webpack/sharing/consume/default/@jupyterlab/docmanager");
const sidebar_widget_1 = __webpack_require__(/*! ./sidebar-widget */ "./lib/sidebar-widget.js");
const globals_1 = __webpack_require__(/*! ./core/globals */ "./lib/core/globals.js");
const commands_1 = __webpack_require__(/*! ./commands */ "./lib/commands.js");
const cell_context_tracker_1 = __webpack_require__(/*! ./cell-context-tracker */ "./lib/cell-context-tracker.js");
// import { ApiClient } from './api-client';
// Import the main CSS file
__webpack_require__(/*! ../style/index.css */ "./style/index.css");
// Export ApiClient for use by other components
var api_client_1 = __webpack_require__(/*! ./core/api-client */ "./lib/core/api-client.js");
Object.defineProperty(exports, "ApiClient", ({ enumerable: true, get: function () { return api_client_1.ApiClient; } }));
/**
 * Initialization data for the jupyter-simple-extension extension.
 */
const plugin = {
    id: 'jupyter-simple-extension:plugin',
    autoStart: true,
    requires: [launcher_1.ILauncher, apputils_1.ICommandPalette, notebook_1.INotebookTracker, docmanager_1.IDocumentManager],
    activate: (jupyterApp, launcher, palette, tracker, docManager) => {
        console.log('JupyterLab extension jupyter-simple-extension is activated!');
        // Initialize global references
        (0, globals_1.initGlobals)(jupyterApp, tracker);
        // Initialize cell context tracker
        globals_1.globals.cellContextTracker = new cell_context_tracker_1.CellContextTracker(jupyterApp, tracker);
        // Create and add sidebar widget
        const sidebarWidget = new sidebar_widget_1.SimpleSidebarWidget(docManager);
        jupyterApp.shell.add(sidebarWidget, 'left', { rank: 9999 });
        // Register commands
        (0, commands_1.registerCommands)(jupyterApp, palette, launcher, sidebarWidget);
    }
};
exports["default"] = plugin;


/***/ }),

/***/ "./lib/sidebar-widget.js":
/*!*******************************!*\
  !*** ./lib/sidebar-widget.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SimpleSidebarWidget = void 0;
const widgets_1 = __webpack_require__(/*! @lumino/widgets */ "webpack/sharing/consume/default/@lumino/widgets");
const icons_1 = __webpack_require__(/*! ./core/icons */ "./lib/core/icons.js");
const api_client_1 = __webpack_require__(/*! ./core/api-client */ "./lib/core/api-client.js");
const popup_menu_manager_1 = __webpack_require__(/*! ./handlers/popup-menu-manager */ "./lib/handlers/popup-menu-manager.js");
const shortcut_handler_1 = __webpack_require__(/*! ./handlers/shortcut-handler */ "./lib/handlers/shortcut-handler.js");
const layout_builder_1 = __webpack_require__(/*! ./ui/layout-builder */ "./lib/ui/layout-builder.js");
const settings_modal_1 = __webpack_require__(/*! ./ui/settings-modal */ "./lib/ui/settings-modal.js");
const chat_state_1 = __webpack_require__(/*! ./state/chat-state */ "./lib/state/chat-state.js");
const settings_state_1 = __webpack_require__(/*! ./state/settings-state */ "./lib/state/settings-state.js");
const input_handler_1 = __webpack_require__(/*! ./handlers/input-handler */ "./lib/handlers/input-handler.js");
const message_handler_1 = __webpack_require__(/*! ./handlers/message-handler */ "./lib/handlers/message-handler.js");
const history_handler_1 = __webpack_require__(/*! ./handlers/history-handler */ "./lib/handlers/history-handler.js");
const settings_handler_1 = __webpack_require__(/*! ./handlers/settings-handler */ "./lib/handlers/settings-handler.js");
const ui_manager_1 = __webpack_require__(/*! ./ui/ui-manager */ "./lib/ui/ui-manager.js");
// --- Import Utility Functions ---
const clipboard_1 = __webpack_require__(/*! ./utils/clipboard */ "./lib/utils/clipboard.js");
const notebook_integration_1 = __webpack_require__(/*! ./utils/notebook-integration */ "./lib/utils/notebook-integration.js");
const code_ref_widget_1 = __webpack_require__(/*! ./ui/code-ref-widget */ "./lib/ui/code-ref-widget.js");
/**
 * Main sidebar widget for the AI chat interface - Now acts as an orchestrator.
 */
class SimpleSidebarWidget extends widgets_1.Widget {
    constructor(docManager) {
        super();
        // Placeholder for handler methods used in UIManager callbacks
        this.handleNewChat = () => {
            var _a;
            console.log('Handle New Chat clicked');
            const newChat = this.chatState.createNewChat();
            (_a = this.historyHandler) === null || _a === void 0 ? void 0 : _a.loadChat(newChat.id);
        };
        this.handleToggleHistory = () => {
            console.log('Handle Toggle History clicked');
            this.historyHandler.toggleHistoryView();
        };
        this.handleSendMessage = () => {
            console.log('Handle Send Message called from UI Manager callback');
            const inputElement = this.layoutElements.inputField;
            const event = new KeyboardEvent('keypress', { key: 'Enter', bubbles: true });
            inputElement.dispatchEvent(event);
        };
        this.handleShowSettings = (event) => {
            console.log('Handle Show Settings clicked');
            this.settingsHandler.showModal();
        };
        this.handleShowPopupMenu = (event, targetButton) => {
            console.log('Handle Show Popup Menu clicked');
            const rect = targetButton.getBoundingClientRect();
            this.popupMenuManager.showPopupMenu(rect.left, rect.bottom + 5);
        };
        this.handleUpdateTitle = () => {
            var _a;
            const newTitle = ((_a = this.layoutElements.titleInput) === null || _a === void 0 ? void 0 : _a.value) || 'Chat';
            console.log('Handle Update Title called:', newTitle);
            this.chatState.updateCurrentChatTitle(newTitle);
        };
        this.docManager = docManager;
        this.id = 'simple-sidebar';
        this.title.label = '';
        this.title.caption = 'AI Chat Interface';
        this.title.icon = icons_1.extensionIcon;
        this.title.closable = true;
        this.addClass('jp-llm-ext-sidebar');
        // --- 1. Initialize Core Components & State ---
        this.settingsState = new settings_state_1.SettingsState();
        const initialSettings = this.settingsState.getSettings();
        this.apiClient = new api_client_1.ApiClient((initialSettings === null || initialSettings === void 0 ? void 0 : initialSettings.apiUrl) || undefined);
        this.chatState = new chat_state_1.ChatState();
        this.popupMenuManager = new popup_menu_manager_1.PopupMenuManager(this.docManager, this.node, {
            insertCode: (code) => { var _a; return (_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.appendToInput(`@code ${code}`); },
            insertCell: (content) => { var _a; return (_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.appendToInput(`@cell ${content}`); },
            insertFilePath: (path) => { var _a; return (_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.appendToInput(`@file ${path}`); },
            insertDirectoryPath: (path) => { var _a; return (_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.appendToInput(`@directory ${path}`); },
            getSelectedText: notebook_integration_1.getSelectedText,
            getCurrentCellContent: notebook_integration_1.getCurrentCellContent,
            insertCellByIndex: (index) => (0, notebook_integration_1.insertCellContentByIndex)(index, (content) => { var _a; return (_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.appendToInput(`@${content}`); }),
            insertCollapsedCodeRef: (code, cellIndex, lineNumber, notebookName) => {
                if (!this.inputHandler)
                    return;
                const refId = this.inputHandler.addCodeReference(code);
                const placeholder = (0, code_ref_widget_1.createCodeRefPlaceholder)(refId, notebookName, lineNumber);
                this.inputHandler.appendToInput(placeholder);
            }
        });
        // --- 2. Define Callbacks (used by buildLayout and Handlers) ---
        // Callbacks for UI actions (passed to buildLayout)
        const createNewChatCallback = () => {
            var _a;
            const newChat = this.chatState.createNewChat();
            (_a = this.historyHandler) === null || _a === void 0 ? void 0 : _a.loadChat(newChat.id);
        };
        const toggleHistoryCallback = () => {
            var _a;
            (_a = this.historyHandler) === null || _a === void 0 ? void 0 : _a.toggleHistoryView();
        };
        const showSettingsCallback = () => {
            var _a;
            (_a = this.settingsHandler) === null || _a === void 0 ? void 0 : _a.showModal();
        };
        const updateTitleCallback = (newTitle) => {
            var _a;
            this.chatState.updateCurrentChatTitle(newTitle);
            (_a = this.uiManager) === null || _a === void 0 ? void 0 : _a.showNotification('Chat title updated', 'info');
        };
        const showPopupMenuCallback = (event) => {
            const rect = event.target.getBoundingClientRect();
            this.popupMenuManager.showPopupMenu(rect.left + 60, rect.top - 20);
            event.preventDefault();
            event.stopPropagation();
        };
        const sendMessageViaButtonCallback = () => {
            const inputElement = this.layoutElements.inputField;
            const event = new KeyboardEvent('keypress', { key: 'Enter', bubbles: true });
            inputElement.dispatchEvent(event);
        };
        const toggleMarkdownModeCallback = (isMarkdown) => {
            var _a;
            (_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.setMarkdownMode(isMarkdown);
        };
        const toggleExpandInputCallback = (button) => {
            var _a;
            (_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.toggleInputExpansion();
        };
        // Callbacks for Message Rendering (passed to MessageHandler -> UIManager -> renderers)
        const messageRendererCallbacks = {
            showCopyFeedback: (button, success = true) => {
                const originalHTML = button.innerHTML;
                button.innerHTML = success ? 'Copied!' : 'Failed!';
                button.disabled = true;
                setTimeout(() => {
                    button.innerHTML = originalHTML;
                    button.disabled = false;
                }, 1000);
            },
            addMessageToCell: notebook_integration_1.addMessageToCell,
            copyToClipboard: (text, feedbackCb) => {
                navigator.clipboard.writeText(text).then(() => feedbackCb === null || feedbackCb === void 0 ? void 0 : feedbackCb()).catch(err => {
                    console.error('Failed to copy text: ', err);
                    feedbackCb === null || feedbackCb === void 0 ? void 0 : feedbackCb();
                });
            },
            copyImageToClipboard: (imageUrl, feedbackCb) => {
                (0, clipboard_1.copyImageToClipboard)(imageUrl, (success) => {
                    feedbackCb === null || feedbackCb === void 0 ? void 0 : feedbackCb();
                });
            },
            copyMessageToClipboard: (text, feedbackCb) => {
                (0, clipboard_1.copyMessageToClipboard)(text, (success) => {
                    feedbackCb();
                });
            },
            handleConfirmInterrupt: () => {
                var _a;
                (_a = this.messageHandler) === null || _a === void 0 ? void 0 : _a.handleSendAutoMessage('confirmed');
            },
            handleRejectInterrupt: () => {
                var _a;
                (_a = this.messageHandler) === null || _a === void 0 ? void 0 : _a.handleSendAutoMessage('rejected');
            }
        };
        const settingsModalCallbacks = {
            handleSave: () => { var _a; (_a = this.settingsHandler) === null || _a === void 0 ? void 0 : _a.saveSettings(); },
            handleCancel: () => { var _a; (_a = this.settingsHandler) === null || _a === void 0 ? void 0 : _a.hideModal(); }
        };
        const historyHandlerCallbacks = {
            updateTitleInput: (title) => this.uiManager.updateTitleInput(title),
            clearMessageContainer: () => this.uiManager.clearMessageContainer(),
            addRenderedMessage: (messageElement) => this.uiManager.addChatMessageElement(messageElement)
        };
        const inputHandlerCallbacks = {
            handleSendMessage: (message) => {
                if (this.messageHandler) {
                    this.messageHandler.handleSendMessage(message);
                }
                else {
                    console.error('MessageHandler not initialized when trying to send message from InputHandler');
                }
            },
            showPopupMenu: (left, top) => this.popupMenuManager.showPopupMenu(left, top),
            hidePopupMenu: () => this.popupMenuManager.hidePopupMenu(),
            updatePlaceholder: (isMarkdown) => {
                this.layoutElements.inputField.placeholder = isMarkdown ? 'Enter markdown...' : 'Ask anything...';
            },
            toggleInputExpansionUI: (isExpanded) => {
                this.layoutElements.expandButton.textContent = isExpanded ? 'Collapse' : 'Expand';
                this.layoutElements.expandButton.title = isExpanded ? 'Collapse input' : 'Expand input';
            },
            getCodeRefMap: () => { var _a; return ((_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.getCodeReferenceMap()) || new Map(); },
            resetCodeRefMap: () => { var _a; return (_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.resetCodeReferences(); }
        };
        const shortcutCallbacks = {
            showIndicator: (text) => { var _a; return (_a = this.uiManager) === null || _a === void 0 ? void 0 : _a.showIndicator(text); },
            appendToInput: (text) => { var _a; return (_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.appendToInput(text); },
            showWidget: () => { if (this.isHidden) {
                this.show();
            } },
            focusInput: () => { var _a, _b; return (_b = (_a = this.layoutElements) === null || _a === void 0 ? void 0 : _a.inputField) === null || _b === void 0 ? void 0 : _b.focus(); }
        };
        // --- 3. Build UI Layout ---
        this.layoutElements = (0, layout_builder_1.buildLayout)({
            onNewChatClick: createNewChatCallback,
            onHistoryToggleClick: toggleHistoryCallback,
            onSettingsClick: showSettingsCallback,
            onTitleChange: updateTitleCallback,
            onAtButtonClick: showPopupMenuCallback,
            onSendMessageClick: sendMessageViaButtonCallback,
            onMarkdownToggleChange: toggleMarkdownModeCallback,
            onExpandToggleClick: toggleExpandInputCallback,
        });
        this.settingsModalContainer = (0, settings_modal_1.createSettingsModalElement)(settingsModalCallbacks);
        // --- Initialize State Managers ---
        this.chatState = new chat_state_1.ChatState();
        this.settingsState = new settings_state_1.SettingsState();
        // --- Initialize Core Components ---
        this.apiClient = new api_client_1.ApiClient();
        // --- Initialize UI Manager (needs dependencies) ---
        const uiManagerCallbacks = {
            handleNewChat: this.handleNewChat,
            handleToggleHistory: this.handleToggleHistory,
            handleSendMessage: this.handleSendMessage,
            handleShowSettings: this.handleShowSettings,
            handleShowPopupMenu: this.handleShowPopupMenu,
            handleUpdateTitle: this.handleUpdateTitle
        };
        this.uiManager = new ui_manager_1.UIManager(this.popupMenuManager, uiManagerCallbacks, this.layoutElements);
        // --- 4. Initialize Handlers (using UI elements and core components) ---
        this.inputHandler = new input_handler_1.InputHandler(this.layoutElements.inputField, inputHandlerCallbacks);
        this.messageHandler = new message_handler_1.MessageHandler(this.apiClient, this.chatState, this.uiManager, messageRendererCallbacks, this.inputHandler);
        this.historyHandler = new history_handler_1.HistoryHandler(this.chatState, this.uiManager, historyHandlerCallbacks, messageRendererCallbacks);
        this.settingsHandler = new settings_handler_1.SettingsHandler(this.settingsState, this.settingsModalContainer, this.uiManager);
        // --- 5. Final Setup (Attach event listeners, connect signals, etc.) ---
        const initialChatId = this.chatState.getCurrentChatId();
        if (initialChatId) {
            this.historyHandler.loadChat(initialChatId);
        }
        else {
            const newChat = this.chatState.createNewChat();
            this.historyHandler.loadChat(newChat.id);
        }
        (0, shortcut_handler_1.setupShortcuts)(this.inputHandler, this.popupMenuManager, shortcutCallbacks);
        this.node.appendChild(this.layoutElements.mainElement);
        this.node.appendChild(this.settingsModalContainer);
    }
    /**
     * Disposes all resources
     */
    dispose() {
        var _a, _b;
        if (this.isDisposed) {
            return;
        }
        (0, shortcut_handler_1.removeShortcuts)();
        (_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.dispose();
        (_b = this.popupMenuManager) === null || _b === void 0 ? void 0 : _b.dispose();
        super.dispose();
    }
} // End of SimpleSidebarWidget class
exports.SimpleSidebarWidget = SimpleSidebarWidget;


/***/ }),

/***/ "./lib/state/chat-state.js":
/*!*********************************!*\
  !*** ./lib/state/chat-state.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ChatState = void 0;
const uuid_1 = __webpack_require__(/*! uuid */ "webpack/sharing/consume/default/uuid/uuid");
/**
 * Manages the state of chat history and the currently active chat.
 */
class ChatState {
    constructor() {
        var _a;
        this.chatHistory = [];
        this.currentChatId = null;
        // Potential: Load initial state from storage if persistence is added later
        if (this.chatHistory.length === 0) {
            this.createNewChat('Welcome Chat'); // Create an initial chat if none exists
        }
        else {
            this.currentChatId = ((_a = this.chatHistory[0]) === null || _a === void 0 ? void 0 : _a.id) || null; // Set current chat to the first one
        }
    }
    /**
     * Creates a new chat session and sets it as the current chat.
     * @param title - The initial title for the new chat.
     * @returns The newly created chat item.
     */
    createNewChat(title = 'New Chat') {
        const chatId = `chat-${(0, uuid_1.v4)()}`; // Use UUID for better uniqueness
        const newChat = {
            id: chatId,
            title: title,
            messages: []
            // createdAt: new Date() 
        };
        this.chatHistory.push(newChat);
        this.currentChatId = chatId;
        console.log('Created new chat:', newChat);
        return newChat;
    }
    /**
     * Sets the currently active chat ID.
     * @param chatId - The ID of the chat to set as current.
     */
    setCurrentChatId(chatId) {
        if (this.chatHistory.some(chat => chat.id === chatId)) {
            this.currentChatId = chatId;
        }
        else {
            console.warn(`Chat ID ${chatId} not found in history.`);
        }
    }
    /**
     * Gets the ID of the currently active chat.
     * @returns The current chat ID or null if none is active.
     */
    getCurrentChatId() {
        return this.currentChatId;
    }
    /**
     * Retrieves a specific chat by its ID.
     * @param chatId - The ID of the chat to retrieve.
     * @returns The chat item or undefined if not found.
     */
    getChatById(chatId) {
        return this.chatHistory.find(chat => chat.id === chatId);
    }
    /**
     * Retrieves the currently active chat item.
     * @returns The current chat item or undefined if no chat is active or found.
     */
    getCurrentChat() {
        if (!this.currentChatId) {
            return undefined;
        }
        return this.getChatById(this.currentChatId);
    }
    /**
     * Updates the title of the currently active chat.
     * @param newTitle - The new title for the chat.
     */
    updateCurrentChatTitle(newTitle) {
        const currentChat = this.getCurrentChat();
        if (currentChat) {
            currentChat.title = newTitle;
            console.log(`Updated title for chat ${this.currentChatId} to "${newTitle}"`);
        }
        else {
            console.warn('Cannot update title: No current chat selected.');
        }
    }
    /**
     * Adds a message to the currently active chat.
     * @param message - The message object to add.
     */
    addMessageToCurrentChat(message) {
        const currentChat = this.getCurrentChat();
        if (currentChat) {
            currentChat.messages.push(message);
        }
        else {
            console.warn('Cannot add message: No current chat selected.');
        }
    }
    /**
     * Gets all messages from the currently active chat.
     * @returns An array of messages or an empty array if no chat is active.
     */
    getCurrentChatMessages() {
        const currentChat = this.getCurrentChat();
        return currentChat ? currentChat.messages : [];
    }
    /**
     * Gets the entire chat history.
     * @returns An array of all chat history items.
     */
    getChatHistory() {
        return [...this.chatHistory]; // Return a copy to prevent direct modification
    }
}
exports.ChatState = ChatState;


/***/ }),

/***/ "./lib/state/settings-state.js":
/*!*************************************!*\
  !*** ./lib/state/settings-state.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SettingsState = void 0;
const SETTINGS_STORAGE_KEY = 'jp-llm-ext-settings';
/**
 * Manages loading and saving application settings to localStorage.
 */
class SettingsState {
    constructor() {
        this.currentSettings = null;
        this.currentSettings = this.loadSettings();
    }
    /**
     * Loads settings from localStorage.
     * @returns The loaded settings or null if none are saved or an error occurs.
     */
    loadSettings() {
        const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                // Basic validation (can be expanded)
                if (settings && settings.provider) {
                    this.currentSettings = settings;
                    console.log('Loaded settings:', this.currentSettings);
                    return this.currentSettings;
                }
            }
            catch (error) {
                console.error('Error loading saved settings:', error);
                localStorage.removeItem(SETTINGS_STORAGE_KEY); // Clear corrupted data
            }
        }
        console.log('No valid settings found in localStorage.');
        return null;
    }
    /**
     * Saves the provided settings to localStorage.
     * @param settings - The settings object to save.
     */
    saveSettings(settings) {
        try {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
            this.currentSettings = Object.assign({}, settings); // Update internal state
            console.log('Settings saved:', this.currentSettings);
        }
        catch (error) {
            console.error('Error saving settings:', error);
            // Optional: Notify user of save failure
        }
    }
    /**
     * Gets the currently loaded settings.
     * @returns The current settings object or null if not loaded.
     */
    getSettings() {
        return this.currentSettings ? Object.assign({}, this.currentSettings) : null; // Return a copy
    }
    /**
     * Gets a specific setting value.
     * @param key - The key of the setting to retrieve.
     * @returns The value of the setting or undefined if not found.
     */
    getSetting(key) {
        return this.currentSettings ? this.currentSettings[key] : undefined;
    }
}
exports.SettingsState = SettingsState;


/***/ }),

/***/ "./lib/ui/code-ref-widget.js":
/*!***********************************!*\
  !*** ./lib/ui/code-ref-widget.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createCodeRefWidgetHTML = createCodeRefWidgetHTML;
exports.attachCodeRefEventListeners = attachCodeRefEventListeners;
exports.defaultCodeRefToggleLogic = defaultCodeRefToggleLogic;
exports.createCodeRefPlaceholder = createCodeRefPlaceholder;
const dom_elements_1 = __webpack_require__(/*! ./dom-elements */ "./lib/ui/dom-elements.js");
/**
 * Creates the HTML element for a collapsible code reference widget.
 *
 * @param data - The data for the code reference.
 * @returns The HTMLElement representing the code reference widget.
 */
function createCodeRefWidgetHTML(data) {
    const widget = (0, dom_elements_1.createSpan)({
        classes: 'jp-llm-ext-code-ref-widget',
        attributes: {
            'data-ref-id': data.refId,
            'data-code': encodeURIComponent(data.code), // Store original code safely
            'data-ref': data.codeRef
        }
    });
    const label = (0, dom_elements_1.createSpan)({
        classes: 'jp-llm-ext-code-ref-label',
        text: data.codeRef
    });
    const toggleButton = (0, dom_elements_1.createButton)({
        classes: 'jp-llm-ext-code-ref-toggle',
        text: '⯈', // Right-pointing triangle initially
        attributes: { title: 'Expand/collapse code' }
    });
    const content = (0, dom_elements_1.createSpan)({
        classes: 'jp-llm-ext-code-ref-content',
        text: data.code, // Display the raw code for now
        style: { display: 'none' } // Hidden initially
    });
    // Assemble the widget
    widget.appendChild(label);
    widget.appendChild(toggleButton);
    widget.appendChild(content);
    return widget;
}
/**
 * Attaches event listeners (specifically click for toggle) to a code ref widget.
 *
 * @param element - The code ref widget HTMLElement.
 * @param toggleCallback - A function to call when the toggle button is clicked.
 */
function attachCodeRefEventListeners(element, toggleCallback) {
    const toggleButton = element.querySelector('.jp-llm-ext-code-ref-toggle');
    const contentElement = element.querySelector('.jp-llm-ext-code-ref-content');
    if (toggleButton && contentElement) {
        toggleButton.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleCallback(toggleButton, contentElement);
        });
    }
}
/**
 * Default logic for toggling the visibility of the code ref content.
 * This can be passed as the callback to attachCodeRefEventListeners.
 *
 * @param toggleButton - The button element that was clicked.
 * @param contentElement - The content element to toggle.
 */
function defaultCodeRefToggleLogic(toggleButton, contentElement) {
    const isVisible = contentElement.style.display !== 'none';
    contentElement.style.display = isVisible ? 'none' : 'block'; // Or 'inline-block'/'inline' depending on desired layout
    toggleButton.textContent = isVisible ? '⯈' : '⯆'; // Update triangle direction
}
/**
 * Creates a textual placeholder for a code reference.
 *
 * @param refId - The unique identifier for the reference (e.g., "ref-1").
 * @param notebookName - The name of the notebook (optional, for future display enhancements).
 * @param lineNumber - The starting line number of the code (optional, for future display enhancements).
 * @returns A string placeholder like "[ref-1]".
 */
function createCodeRefPlaceholder(refId, notebookName, // Keep optional for now
lineNumber // Keep optional for now
) {
    // Keep it simple for now, just the ID.
    // Display details like notebook/line could be added later if needed.
    return `[${refId}]`;
}


/***/ }),

/***/ "./lib/ui/dom-elements.js":
/*!********************************!*\
  !*** ./lib/ui/dom-elements.js ***!
  \********************************/
/***/ ((__unused_webpack_module, exports) => {


// import { ReadonlyPartialJSONObject } from '@lumino/coreutils';
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createDiv = createDiv;
exports.createButton = createButton;
exports.createSpan = createSpan;
exports.createTextArea = createTextArea;
exports.createInputElement = createInputElement;
exports.createImageElement = createImageElement;
exports.createAnchorElement = createAnchorElement;
exports.createLabelElement = createLabelElement;
exports.createFormElement = createFormElement;
/**
 * Generic function to create an HTMLElement.
 *
 * @param tagName - The HTML tag name (e.g., 'div', 'button').
 * @param options - Optional configuration for the element.
 * @returns The created HTMLElement.
 */
function createElement(tagName, options = {}) {
    const element = document.createElement(tagName);
    if (options.id) {
        element.id = options.id;
    }
    if (options.classes) {
        const classesToAdd = Array.isArray(options.classes)
            ? options.classes
            : options.classes.split(' ').filter(c => c);
        element.classList.add(...classesToAdd);
    }
    if (options.text) {
        element.textContent = options.text;
    }
    else if (options.html) {
        element.innerHTML = options.html; // Be cautious with HTML injection
    }
    if (options.attributes) {
        for (const key in options.attributes) {
            if (options.attributes.hasOwnProperty(key)) {
                element.setAttribute(key, options.attributes[key]);
            }
        }
    }
    if (options.style) {
        for (const key in options.style) {
            if (options.style.hasOwnProperty(key)) {
                element.style[key] = options.style[key];
            }
        }
    }
    if (options.children) {
        options.children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            }
            else {
                element.appendChild(child);
            }
        });
    }
    return element;
}
/** Creates a <div> element. */
function createDiv(options = {}) {
    return createElement('div', options);
}
/** Creates a <button> element. */
function createButton(options = {}) {
    return createElement('button', options);
}
/** Creates a <span> element. */
function createSpan(options = {}) {
    return createElement('span', options);
}
/** Creates a <textarea> element. */
function createTextArea(options = {}) {
    return createElement('textarea', options);
}
/** Creates an <input> element. */
function createInputElement(options = {}) {
    var _a;
    // Ensure type is set if provided in attributes, otherwise default or leave unset
    if ((_a = options.attributes) === null || _a === void 0 ? void 0 : _a.type) {
        // Type is already set in attributes, do nothing extra
    }
    else if (!options.attributes) {
        options.attributes = { type: 'text' }; // Default to text if no attributes specified
    }
    else if (!options.attributes.type) {
        options.attributes.type = 'text'; // Default to text if type is not in attributes
    }
    return createElement('input', options);
}
/** Creates an <img> element. */
function createImageElement(options) {
    const imgOptions = Object.assign({}, options);
    imgOptions.attributes = Object.assign(Object.assign({}, options.attributes), { src: options.src });
    if (options.alt) {
        imgOptions.attributes.alt = options.alt;
    }
    return createElement('img', imgOptions);
}
/** Creates an <a> element. */
function createAnchorElement(options) {
    const anchorOptions = Object.assign({}, options);
    anchorOptions.attributes = Object.assign(Object.assign({}, options.attributes), { href: options.href });
    return createElement('a', anchorOptions);
}
/** Creates a <label> element. */
function createLabelElement(options) {
    const labelOptions = Object.assign({}, options);
    if (options.htmlFor) {
        labelOptions.attributes = Object.assign(Object.assign({}, options.attributes), { for: options.htmlFor });
    }
    return createElement('label', labelOptions);
}
/** Creates a <form> element. */
function createFormElement(options = {}) {
    return createElement('form', options);
}


/***/ }),

/***/ "./lib/ui/layout-builder.js":
/*!**********************************!*\
  !*** ./lib/ui/layout-builder.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.buildLayout = buildLayout;
const dom_elements_1 = __webpack_require__(/*! ./dom-elements */ "./lib/ui/dom-elements.js");
/**
 * Builds the main HTML structure for the sidebar widget.
 *
 * @param callbacks - An object containing callback functions for various UI interactions.
 * @returns An object containing the main widget HTMLElement and references to key interactive elements.
 */
function buildLayout(callbacks = {}) {
    // --- Main Content Wrapper ---
    const mainElement = (0, dom_elements_1.createDiv)({
        classes: 'jp-llm-ext-content-wrapper'
    });
    // --- Title Bar ---
    const titleContainer = (0, dom_elements_1.createDiv)({ classes: 'jp-llm-ext-title-container' });
    const titleInput = (0, dom_elements_1.createInputElement)({
        id: 'chat-title-input',
        classes: 'chat-title-input',
        attributes: { type: 'text', placeholder: 'Chat title', value: 'New Chat' }
    });
    if (callbacks.onTitleChange) {
        titleInput.addEventListener('change', () => callbacks.onTitleChange(titleInput.value));
    }
    titleContainer.appendChild(titleInput);
    // --- Message & History Containers ---
    const messageContainer = (0, dom_elements_1.createDiv)({ classes: 'jp-llm-ext-message-container' });
    const historyContainer = (0, dom_elements_1.createDiv)({
        classes: 'jp-llm-ext-history-container',
        style: { display: 'none' } // Hidden by default
    });
    // --- Bottom Bar Area ---
    const bottomBarContainer = (0, dom_elements_1.createDiv)({ classes: 'jp-llm-ext-bottom-bar-container' });
    // Row 1: Controls (Markdown Toggle, @, Expand, Settings)
    const controlsRow = (0, dom_elements_1.createDiv)({ classes: 'jp-llm-ext-bottom-bar-row jp-llm-ext-controls-row' });
    const controlsContainer = (0, dom_elements_1.createDiv)({ classes: 'jp-llm-ext-controls-container' });
    // Markdown Toggle
    const toggleContainer = (0, dom_elements_1.createDiv)({ classes: 'jp-llm-ext-toggle-container' });
    const markdownToggleButton = (0, dom_elements_1.createInputElement)({
        id: 'markdown-toggle',
        attributes: { type: 'checkbox' }
    });
    const toggleLabel = (0, dom_elements_1.createLabelElement)({
        text: 'Markdown mode',
        htmlFor: 'markdown-toggle'
    });
    if (callbacks.onMarkdownToggleChange) {
        markdownToggleButton.addEventListener('change', () => {
            callbacks.onMarkdownToggleChange(markdownToggleButton.checked);
        });
    }
    toggleContainer.appendChild(markdownToggleButton);
    toggleContainer.appendChild(toggleLabel);
    // Action Buttons (@, Expand, Settings)
    const actionButtonsContainer = (0, dom_elements_1.createDiv)({ classes: 'jp-llm-ext-action-buttons-container' });
    const atButton = (0, dom_elements_1.createButton)({ text: '@', attributes: { title: 'Browse cells, code, files, and more' }, classes: 'jp-Button jp-llm-ext-action-button' });
    if (callbacks.onAtButtonClick) {
        atButton.addEventListener('click', callbacks.onAtButtonClick);
    }
    const expandButton = (0, dom_elements_1.createButton)({ text: '⤢', attributes: { title: 'Expand input' }, classes: 'jp-Button jp-llm-ext-action-button' });
    if (callbacks.onExpandToggleClick) {
        expandButton.addEventListener('click', () => callbacks.onExpandToggleClick(expandButton));
    }
    const settingsButton = (0, dom_elements_1.createButton)({ text: '⚙️', attributes: { title: 'Settings' }, classes: 'jp-Button jp-llm-ext-action-button' });
    if (callbacks.onSettingsClick) {
        settingsButton.addEventListener('click', callbacks.onSettingsClick);
    }
    actionButtonsContainer.appendChild(atButton);
    actionButtonsContainer.appendChild(expandButton);
    actionButtonsContainer.appendChild(settingsButton);
    controlsContainer.appendChild(toggleContainer);
    controlsContainer.appendChild(actionButtonsContainer);
    controlsRow.appendChild(controlsContainer);
    // Row 2: Input Field
    const inputRow = (0, dom_elements_1.createDiv)({ classes: 'jp-llm-ext-bottom-bar-row jp-llm-ext-input-row' });
    const inputField = (0, dom_elements_1.createTextArea)({
        classes: 'jp-llm-ext-input-field',
        attributes: { placeholder: 'Ask me anything...', rows: '1' }
    });
    if (callbacks.onInputFieldKeyPress) {
        inputField.addEventListener('keypress', callbacks.onInputFieldKeyPress);
    }
    if (callbacks.onInputFieldValueChange) {
        inputField.addEventListener('input', () => callbacks.onInputFieldValueChange(inputField.value));
    }
    inputRow.appendChild(inputField);
    // Row 3: Main Buttons (Send, New Chat, History)
    const buttonsRow = (0, dom_elements_1.createDiv)({ classes: 'jp-llm-ext-bottom-bar-row jp-llm-ext-buttons-row' });
    const sendButton = (0, dom_elements_1.createButton)({
        text: 'Send',
        classes: 'jp-Button jp-llm-ext-send-button'
    });
    if (callbacks.onSendMessageClick) {
        sendButton.addEventListener('click', callbacks.onSendMessageClick);
    }
    const newChatButton = (0, dom_elements_1.createButton)({
        text: '+ New Chat',
        attributes: { title: 'Start a new chat' },
        classes: 'jp-Button jp-llm-ext-action-button'
    });
    if (callbacks.onNewChatClick) {
        newChatButton.addEventListener('click', callbacks.onNewChatClick);
    }
    const historyButton = (0, dom_elements_1.createButton)({
        text: 'History',
        attributes: { title: 'View chat history' },
        classes: 'jp-Button jp-llm-ext-action-button'
    });
    if (callbacks.onHistoryToggleClick) {
        historyButton.addEventListener('click', callbacks.onHistoryToggleClick);
    }
    buttonsRow.appendChild(sendButton);
    buttonsRow.appendChild(newChatButton);
    buttonsRow.appendChild(historyButton);
    // Assemble Bottom Bar
    bottomBarContainer.appendChild(controlsRow);
    bottomBarContainer.appendChild(inputRow);
    bottomBarContainer.appendChild(buttonsRow);
    // --- Assemble Main Element ---
    mainElement.appendChild(titleContainer);
    mainElement.appendChild(messageContainer);
    mainElement.appendChild(historyContainer);
    mainElement.appendChild(bottomBarContainer);
    return {
        mainElement,
        titleInput,
        messageContainer,
        historyContainer,
        inputField,
        bottomBarContainer,
        sendButton,
        newChatButton,
        historyButton,
        markdownToggleButton,
        expandButton,
        atButton,
        settingsButton
    };
}


/***/ }),

/***/ "./lib/ui/message-renderer.js":
/*!************************************!*\
  !*** ./lib/ui/message-renderer.js ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MessageRenderer = void 0;
exports.renderUserMessage = renderUserMessage;
exports.renderBotMessage = renderBotMessage;
exports.renderBotMessageStreamingStart = renderBotMessageStreamingStart;
exports.renderBotMessageStreamingUpdate = renderBotMessageStreamingUpdate;
exports.renderBotMessageFinal = renderBotMessageFinal;
const marked_1 = __webpack_require__(/*! marked */ "webpack/sharing/consume/default/marked/marked");
const dompurify_1 = __importDefault(__webpack_require__(/*! dompurify */ "webpack/sharing/consume/default/dompurify/dompurify"));
// import hljs from 'highlight.js'; // Removed unused import
const dom_elements_1 = __webpack_require__(/*! ./dom-elements */ "./lib/ui/dom-elements.js");
// Removed unused import block for code-ref-widget
// import {
//   CodeRefData,
//   createCodeRefWidgetHTML,
//   attachCodeRefEventListeners,
//   defaultCodeRefToggleLogic
// } from './code-ref-widget';
// Removed unused import block for clipboard utils (used via callbacks)
// import { copyToClipboard, copyImageToClipboard, copyMessageToClipboard } from '../utils/clipboard';
// Removed unused import (used via callbacks)
// import { addMessageToCell } from '../utils/notebook-integration';
const highlighting_1 = __webpack_require__(/*! ../utils/highlighting */ "./lib/utils/highlighting.js");
const markdown_config_1 = __webpack_require__(/*! ../utils/markdown-config */ "./lib/utils/markdown-config.js");
/**
 * Base function to create a message container div.
 */
function createMessageDiv(sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = sender === 'user' ? 'jp-llm-ext-user-message' : 'jp-llm-ext-bot-message';
    return messageDiv;
}
/**
 * Renders a user message.
 */
function renderUserMessage(text, options = {}, callbacks = {}) {
    const messageDiv = createMessageDiv('user');
    // Handle user message with code references (logic to be moved from addMessage)
    if (options.isMarkdown) {
        // Special case: User message with code references (placeholder)
        const contentDiv = document.createElement('div');
        contentDiv.className = 'user-content-with-refs';
        // TODO: Move code reference widget creation logic here
        contentDiv.textContent = `[Code Refs Placeholder] ${text}`;
        messageDiv.appendChild(contentDiv);
    }
    else {
        messageDiv.textContent = text;
    }
    return messageDiv;
}
/**
 * Renders a bot message (text, markdown, images, code blocks).
 */
function renderBotMessage(text, options = { isMarkdown: true }, callbacks = {}) {
    const messageDiv = createMessageDiv('bot');
    // Check if the message is an image URL
    const isImageUrl = text.trim().startsWith('/images/') &&
        (text.trim().endsWith('.png') ||
            text.trim().endsWith('.jpg') ||
            text.trim().endsWith('.jpeg') ||
            text.trim().endsWith('.gif'));
    if (isImageUrl) {
        // Construct full URL (TODO: Make base URL configurable)
        const fullImageUrl = `http://127.0.0.1:8000${text.trim()}`;
        // Call dedicated image rendering function
        renderImageMessage(messageDiv, fullImageUrl, callbacks);
    }
    else if (options.isMarkdown) {
        // Render as markdown (logic from addMessage)
        const markdownIndicator = document.createElement('div');
        markdownIndicator.textContent = "MD";
        markdownIndicator.className = 'markdown-indicator';
        messageDiv.appendChild(markdownIndicator);
        const contentDiv = document.createElement('div');
        contentDiv.className = 'markdown-content';
        try {
            const processedText = (0, markdown_config_1.preprocessMarkdown)(text);
            const rawHtml = marked_1.marked.parse(processedText);
            const sanitizedHtml = dompurify_1.default.sanitize(rawHtml);
            contentDiv.innerHTML = sanitizedHtml;
            // Enhance code blocks after setting innerHTML
            const codeBlocks = contentDiv.querySelectorAll('pre code');
            codeBlocks.forEach(block => {
                enhanceCodeBlock(block, callbacks);
            });
            // Check for and render interrupt buttons
            const isInterrupt = text.startsWith('**[INTERRUPT]**');
            if (isInterrupt) {
                renderInterruptButtons(contentDiv, callbacks);
            }
        }
        catch (error) {
            contentDiv.textContent = text; // Fallback to plain text
            console.error('Failed to render markdown:', error);
        }
        messageDiv.appendChild(contentDiv);
        // Add overall message action buttons AFTER content is added
        addBotMessageActions(messageDiv, text, callbacks);
    }
    else {
        // Render as plain text
        messageDiv.textContent = text;
        // Add overall message action buttons even for plain text bot messages
        addBotMessageActions(messageDiv, text, callbacks);
    }
    return messageDiv;
}
// Define createMessageWrapper based on createMessageDiv
function createMessageWrapper(sender) {
    return createMessageDiv(sender);
}
// --- More specific rendering functions or helpers can be added below ---
/**
 * Renders an image message with action buttons inside a container.
 *
 * @param container The parent HTML element to append the image message to.
 * @param imageUrl The full URL of the image to render.
 * @param callbacks Callbacks for actions like copy image, add path.
 */
function renderImageMessage(container, imageUrl, callbacks = {}) {
    // Create a container for the image that allows positioning the buttons
    const imageContainer = document.createElement('div');
    imageContainer.className = 'jp-llm-ext-image-container';
    imageContainer.style.position = 'relative';
    // Render as an image tag
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'Image from bot';
    img.style.maxWidth = '100%'; // Ensure image fits within the container
    img.style.height = 'auto';
    imageContainer.appendChild(img);
    // Add action buttons for the image
    const imgActionsDiv = document.createElement('div');
    imgActionsDiv.className = 'jp-llm-ext-image-actions';
    imgActionsDiv.style.position = 'absolute';
    imgActionsDiv.style.bottom = '10px';
    imgActionsDiv.style.right = '10px';
    imgActionsDiv.style.display = 'flex';
    imgActionsDiv.style.gap = '8px';
    imgActionsDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.6)'; // Added slight background for visibility
    imgActionsDiv.style.borderRadius = '4px';
    imgActionsDiv.style.padding = '4px';
    // Copy image button (using callback)
    if (callbacks.copyImageToClipboard && callbacks.showCopyFeedback) {
        const copyImgBtn = document.createElement('button');
        copyImgBtn.className = 'jp-llm-ext-image-action-button';
        copyImgBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
        copyImgBtn.title = 'Copy image to clipboard';
        const feedbackCb = () => callbacks.showCopyFeedback(copyImgBtn);
        copyImgBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            callbacks.copyImageToClipboard(imageUrl, feedbackCb);
        });
        imgActionsDiv.appendChild(copyImgBtn);
    }
    // Add file path button (using callback)
    if (callbacks.addMessageToCell) {
        const addPathBtn = document.createElement('button');
        addPathBtn.className = 'jp-llm-ext-image-action-button';
        addPathBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M12 11v6"></path><path d="M9 14h6"></path></svg>';
        addPathBtn.title = 'Add image path to current cell';
        addPathBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            // Pass the image URL (which is the message text in this case)
            callbacks.addMessageToCell(imageUrl);
        });
        imgActionsDiv.appendChild(addPathBtn);
    }
    // Only add the actions div if it has buttons
    if (imgActionsDiv.hasChildNodes()) {
        imageContainer.appendChild(imgActionsDiv);
    }
    // Add the image container to the main message div
    container.appendChild(imageContainer);
}
/**
 * Creates the initial structure for a bot message that will receive streaming content.
 *
 * @returns Object containing the wrapper, streaming div, and final content div.
 */
function renderBotMessageStreamingStart() {
    const wrapper = createMessageWrapper('bot');
    const markdownIndicator = (0, dom_elements_1.createDiv)({
        text: 'MD',
        classes: 'markdown-indicator'
    });
    wrapper.appendChild(markdownIndicator);
    const streamingDiv = (0, dom_elements_1.createDiv)({
        classes: 'streaming-content',
        style: {
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            fontSize: '0.9em'
        }
    });
    wrapper.appendChild(streamingDiv);
    const contentDiv = (0, dom_elements_1.createDiv)({
        classes: 'markdown-content',
        style: { display: 'none' } // Initially hidden
    });
    wrapper.appendChild(contentDiv);
    return { wrapper, streamingDiv, contentDiv };
}
/**
 * Updates the streaming div with a new chunk of text.
 *
 * @param streamingDiv - The div displaying streaming content.
 * @param chunk - The new text chunk to append.
 */
function renderBotMessageStreamingUpdate(streamingDiv, chunk) {
    // Simple append, might need refinement for complex streams
    streamingDiv.textContent += chunk;
}
/**
 * Renders the final content of a bot message after streaming is complete.
 * Handles markdown, images, code blocks, and interrupts.
 *
 * @param contentDiv - The div where the final content should be rendered.
 * @param streamingDiv - The div that was used for streaming (will be hidden).
 * @param completeResponse - The full text content from the bot.
 * @param options - Rendering options including callbacks for actions.
 * @returns The populated contentDiv.
 */
function renderBotMessageFinal(contentDiv, streamingDiv, completeResponse, options = {}, callbacks = {}) {
    // Hide streaming div, show final content div
    streamingDiv.style.display = 'none';
    contentDiv.style.display = 'block';
    // Consolidate callbacks access
    const effectiveCallbacks = Object.assign(Object.assign({}, options), callbacks);
    // --- Image Handling ---
    const isImageUrl = completeResponse.trim().startsWith('/images/') &&
        (completeResponse.trim().endsWith('.png') ||
            completeResponse.trim().endsWith('.jpg') ||
            completeResponse.trim().endsWith('.jpeg') ||
            completeResponse.trim().endsWith('.gif'));
    if (isImageUrl) {
        const fullImageUrl = `http://127.0.0.1:8000${completeResponse.trim()}`; // TODO: Make base URL configurable
        renderImageMessage(contentDiv, fullImageUrl, effectiveCallbacks);
    }
    else {
        // --- Markdown & Code Block Handling ---
        try {
            const processedText = (0, markdown_config_1.preprocessMarkdown)(completeResponse);
            const rawHtml = marked_1.marked.parse(processedText);
            const sanitizedHtml = dompurify_1.default.sanitize(rawHtml);
            contentDiv.innerHTML = sanitizedHtml;
            // --- Interrupt Handling ---
            const isInterrupt = completeResponse.startsWith('**[INTERRUPT]**');
            if (isInterrupt) {
                renderInterruptButtons(contentDiv, effectiveCallbacks);
            }
            // --- Code Block Enhancements ---
            const codeBlocks = contentDiv.querySelectorAll('pre code');
            codeBlocks.forEach(block => {
                enhanceCodeBlock(block, effectiveCallbacks);
            });
        }
        catch (error) {
            console.error('Error rendering markdown:', error);
            contentDiv.textContent = completeResponse; // Fallback to plain text
        }
    }
    return contentDiv;
}
/**
 * Enhances a code block element with highlighting and action buttons.
 *
 * @param codeBlockElement The <code> element within a <pre>.
 * @param callbacks Callbacks for actions like copy code, add to cell.
 */
function enhanceCodeBlock(codeBlockElement, callbacks = {}) {
    var _a;
    const preElement = codeBlockElement.parentElement;
    if (!preElement || preElement.tagName !== 'PRE') {
        console.warn('Code block enhancement called on element not within a <pre> tag.');
        return;
    }
    // Add standard JupyterLab classes for consistency
    codeBlockElement.classList.add('jp-RenderedText');
    preElement.classList.add('jp-RenderedHTMLCommon');
    // Get code content
    const codeContent = codeBlockElement.textContent || '';
    // Create code block header for buttons and language indicator
    const codeHeader = document.createElement('div');
    codeHeader.className = 'jp-llm-ext-code-header';
    // Add language indicator if detected
    const language = (0, highlighting_1.detectLanguage)(codeContent); // Use imported util
    if (language) {
        const langIndicator = document.createElement('span');
        langIndicator.className = 'jp-llm-ext-code-language';
        langIndicator.textContent = language;
        codeHeader.appendChild(langIndicator);
        codeBlockElement.classList.add(`language-${language}`);
    }
    // Apply syntax highlighting
    try {
        // Use imported util (handles auto-detection if language is empty)
        codeBlockElement.innerHTML = (0, highlighting_1.highlightCode)(codeContent, language);
    }
    catch (error) {
        console.error('Error applying syntax highlighting:', error);
        // codeBlockElement might contain original text or partially highlighted
    }
    // Add action buttons to the code header
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'jp-llm-ext-code-actions';
    // Copy button
    if (callbacks.copyToClipboard && callbacks.showCopyFeedback) {
        const copyButton = document.createElement('button');
        copyButton.className = 'jp-llm-ext-code-action-button';
        copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
        copyButton.title = 'Copy code to clipboard';
        const feedbackCb = () => callbacks.showCopyFeedback(copyButton);
        copyButton.addEventListener('click', (event) => {
            event.stopPropagation();
            callbacks.copyToClipboard(codeContent, feedbackCb);
        });
        actionsDiv.appendChild(copyButton);
    }
    // Add to cell button
    if (callbacks.addMessageToCell) {
        const addToButton = document.createElement('button');
        addToButton.className = 'jp-llm-ext-code-action-button';
        addToButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M12 11v6"></path><path d="M9 14h6"></path></svg>';
        addToButton.title = 'Add code to current cell';
        addToButton.addEventListener('click', (event) => {
            event.stopPropagation();
            callbacks.addMessageToCell(codeContent);
        });
        actionsDiv.appendChild(addToButton);
    }
    // Add the actions to the header, and insert header before the <pre>
    if (actionsDiv.hasChildNodes()) {
        codeHeader.appendChild(actionsDiv);
    }
    if (codeHeader.hasChildNodes()) {
        (_a = preElement.parentNode) === null || _a === void 0 ? void 0 : _a.insertBefore(codeHeader, preElement);
    }
}
/**
 * Renders Confirm/Reject buttons for an interrupt message.
 *
 * @param container The parent HTML element (message content div) to append buttons to.
 * @param callbacks Callbacks for confirm and reject actions.
 */
function renderInterruptButtons(container, callbacks = {}) {
    if (!callbacks.handleConfirmInterrupt || !callbacks.handleRejectInterrupt) {
        console.warn('Interrupt message needs confirm/reject callbacks.');
        return;
    }
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'jp-llm-ext-interrupt-buttons';
    buttonsContainer.style.marginTop = '12px';
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.gap = '8px';
    // Create confirm button
    const confirmButton = document.createElement('button');
    confirmButton.className = 'jp-llm-ext-confirm-button';
    confirmButton.textContent = 'Confirm';
    // Apply specific styling (can be moved to CSS)
    confirmButton.style.padding = '6px 12px';
    confirmButton.style.background = '#4CAF50';
    confirmButton.style.color = 'white';
    confirmButton.style.border = 'none';
    confirmButton.style.borderRadius = '4px';
    confirmButton.style.cursor = 'pointer';
    confirmButton.style.fontWeight = 'bold';
    // Create reject button
    const rejectButton = document.createElement('button');
    rejectButton.className = 'jp-llm-ext-reject-button';
    rejectButton.textContent = 'Reject';
    // Apply specific styling (can be moved to CSS)
    rejectButton.style.padding = '6px 12px';
    rejectButton.style.background = '#F44336';
    rejectButton.style.color = 'white';
    rejectButton.style.border = 'none';
    rejectButton.style.borderRadius = '4px';
    rejectButton.style.cursor = 'pointer';
    rejectButton.style.fontWeight = 'bold';
    // Add event listeners
    confirmButton.addEventListener('click', () => {
        confirmButton.disabled = true;
        rejectButton.disabled = true;
        confirmButton.style.opacity = '0.5';
        rejectButton.style.opacity = '0.5';
        callbacks.handleConfirmInterrupt();
    });
    rejectButton.addEventListener('click', () => {
        confirmButton.disabled = true;
        rejectButton.disabled = true;
        confirmButton.style.opacity = '0.5';
        rejectButton.style.opacity = '0.5';
        callbacks.handleRejectInterrupt();
    });
    // Add buttons to container and container to message
    buttonsContainer.appendChild(confirmButton);
    buttonsContainer.appendChild(rejectButton);
    container.appendChild(buttonsContainer);
}
/**
 * Adds overall action buttons (Copy, Add to Cell) to a bot message container.
 *
 * @param messageDiv The main div container for the bot message.
 * @param messageText The raw text content of the message.
 * @param callbacks Callbacks for actions like copy message, add to cell.
 */
function addBotMessageActions(messageDiv, messageText, callbacks = {}) {
    // Only add actions if corresponding callbacks are provided
    if (!callbacks.copyMessageToClipboard && !callbacks.addMessageToCell) {
        return;
    }
    console.log('Adding action buttons to bot message'); // Keep debug log for now
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'jp-llm-ext-message-actions';
    // actionsDiv.style.display = 'flex'; // Ensure display via CSS if needed
    // Copy Message button
    if (callbacks.copyMessageToClipboard && callbacks.showCopyFeedback) {
        const copyButton = document.createElement('button');
        copyButton.className = 'jp-llm-ext-message-action-button';
        copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
        copyButton.title = 'Copy message to clipboard';
        const feedbackCb = () => callbacks.showCopyFeedback(copyButton);
        copyButton.addEventListener('click', (event) => {
            event.stopPropagation();
            callbacks.copyMessageToClipboard(messageText, feedbackCb);
        });
        actionsDiv.appendChild(copyButton);
    }
    // Add to Cell button
    if (callbacks.addMessageToCell) {
        const addToButton = document.createElement('button');
        addToButton.className = 'jp-llm-ext-message-action-button';
        addToButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M12 11v6"></path><path d="M9 14h6"></path></svg>';
        addToButton.title = 'Add message to current cell';
        addToButton.addEventListener('click', (event) => {
            event.stopPropagation();
            callbacks.addMessageToCell(messageText);
        });
        actionsDiv.appendChild(addToButton);
    }
    // Append the actions container if it has any buttons
    if (actionsDiv.hasChildNodes()) {
        messageDiv.appendChild(actionsDiv);
        console.log('Action buttons added to bot message:', actionsDiv); // Keep debug log
    }
}
// Potential future additions:
// - renderErrorMessage
// - renderSystemMessage
// - A main renderMessage function that delegates based on type? 
/**
 * Handles rendering individual messages (user, bot, system) into HTML elements.
 */
class MessageRenderer {
    // private callbacks: MessageRendererCallbacks; // Removed unused member
    // private uiManager: UIManager; // Might not be needed directly if callbacks handle UI updates
    constructor( /* callbacks: MessageRendererCallbacks */ /* , uiManager: UIManager */) {
        // this.callbacks = callbacks; // Removed unused assignment
        // this.uiManager = uiManager;
    }
}
exports.MessageRenderer = MessageRenderer;


/***/ }),

/***/ "./lib/ui/settings-modal.js":
/*!**********************************!*\
  !*** ./lib/ui/settings-modal.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SettingsModal = void 0;
exports.createSettingsModalElement = createSettingsModalElement;
/**
 * Creates the HTML element for the settings modal.
 * @param callbacks Callbacks for save and cancel actions.
 * @returns The main modal HTMLElement.
 */
function createSettingsModalElement(callbacks) {
    const modal = document.createElement('div');
    modal.className = 'jp-llm-ext-settings-modal';
    modal.style.display = 'none'; // Initially hidden
    const content = document.createElement('div');
    content.className = 'jp-llm-ext-settings-content';
    const title = document.createElement('h2');
    title.className = 'jp-llm-ext-settings-title';
    title.textContent = 'Settings';
    content.appendChild(title);
    const form = document.createElement('form');
    form.className = 'jp-llm-ext-settings-form';
    // Provider selection
    const providerLabel = document.createElement('label');
    providerLabel.className = 'jp-llm-ext-settings-label';
    providerLabel.textContent = 'API Provider:';
    form.appendChild(providerLabel);
    const providerSelect = document.createElement('select');
    providerSelect.className = 'jp-llm-ext-settings-select';
    providerSelect.id = 'settings-provider'; // Keep ID for retrieval
    ['OpenAI', 'HuggingFace', 'Local'].forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        providerSelect.appendChild(option);
    });
    form.appendChild(providerSelect);
    // API Key input
    const apiKeyLabel = document.createElement('label');
    apiKeyLabel.className = 'jp-llm-ext-settings-label';
    apiKeyLabel.textContent = 'API Key:';
    form.appendChild(apiKeyLabel);
    const apiKeyInput = document.createElement('input');
    apiKeyInput.className = 'jp-llm-ext-settings-input';
    apiKeyInput.type = 'password';
    apiKeyInput.id = 'settings-api-key'; // Keep ID for retrieval
    form.appendChild(apiKeyInput);
    // API URL input
    const apiUrlLabel = document.createElement('label');
    apiUrlLabel.className = 'jp-llm-ext-settings-label';
    apiUrlLabel.textContent = 'API URL (optional):';
    form.appendChild(apiUrlLabel);
    const apiUrlInput = document.createElement('input');
    apiUrlInput.className = 'jp-llm-ext-settings-input';
    apiUrlInput.type = 'text';
    apiUrlInput.id = 'settings-api-url'; // Keep ID for retrieval
    form.appendChild(apiUrlInput);
    // Rules input
    const rulesLabel = document.createElement('label');
    rulesLabel.className = 'jp-llm-ext-settings-label';
    rulesLabel.textContent = 'Custom Rules (optional):';
    form.appendChild(rulesLabel);
    const rulesInput = document.createElement('textarea');
    rulesInput.className = 'jp-llm-ext-settings-textarea';
    rulesInput.id = 'settings-rules'; // Keep ID for retrieval
    form.appendChild(rulesInput);
    // Buttons container
    const btnContainer = document.createElement('div');
    btnContainer.className = 'jp-llm-ext-settings-buttons';
    const saveBtn = document.createElement('button');
    saveBtn.className = 'jp-llm-ext-settings-button jp-llm-ext-settings-save-button';
    saveBtn.textContent = 'Save';
    saveBtn.type = 'button'; // Prevent default form submission
    saveBtn.addEventListener('click', (event) => {
        event.preventDefault();
        // The callback implementation will handle reading values and saving
        const settings = {
            apiKey: apiKeyInput.value,
            apiUrl: apiUrlInput.value,
            rules: rulesInput.value,
            provider: providerSelect.value
        };
        callbacks.handleSave(settings);
    });
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'jp-llm-ext-settings-button jp-llm-ext-settings-cancel-button';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.type = 'button'; // Prevent default form submission
    cancelBtn.addEventListener('click', (event) => {
        event.preventDefault();
        callbacks.handleCancel();
    });
    btnContainer.appendChild(saveBtn);
    btnContainer.appendChild(cancelBtn);
    form.appendChild(btnContainer);
    content.appendChild(form);
    modal.appendChild(content);
    return modal;
}
/**
 * Creates and manages the settings modal dialog.
 */
class SettingsModal {
    // private modalElement: HTMLDivElement; // Commented out - unused
    // private settings: AppSettings; // Commented out - unused
    constructor(callbacks) {
        // this.modalElement = createSettingsModalElement(callbacks); // Commented out - unused assignment
        // this.settings = { // Commented out - unused initialization
        //     provider: '', 
        //     apiKey: '', 
        //     apiUrl: '', 
        //     rules: '' 
        // }; 
    }
}
exports.SettingsModal = SettingsModal;


/***/ }),

/***/ "./lib/ui/ui-manager.js":
/*!******************************!*\
  !*** ./lib/ui/ui-manager.js ***!
  \******************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
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


/***/ }),

/***/ "./lib/utils/clipboard.js":
/*!********************************!*\
  !*** ./lib/utils/clipboard.js ***!
  \********************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.copyToClipboard = copyToClipboard;
exports.copyMessageToClipboard = copyMessageToClipboard;
exports.copyImageToClipboard = copyImageToClipboard;
/**
 * Helper function to copy text to clipboard.
 * Provides visual feedback via console logs and optionally a callback.
 */
function copyToClipboard(text, feedbackCallback) {
    try {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Content copied to clipboard');
            feedbackCallback === null || feedbackCallback === void 0 ? void 0 : feedbackCallback(); // Call optional feedback callback
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }
    catch (error) {
        console.error('Error copying text to clipboard:', error);
    }
}
/**
 * Copies message content to clipboard.
 * Provides visual feedback via console logs and optionally a callback.
 */
function copyMessageToClipboard(text, feedbackCallback) {
    try {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Message content copied to clipboard');
            feedbackCallback === null || feedbackCallback === void 0 ? void 0 : feedbackCallback(true); // Indicate success
        }).catch(err => {
            console.error('Failed to copy message text: ', err);
            feedbackCallback === null || feedbackCallback === void 0 ? void 0 : feedbackCallback(false); // Indicate failure
        });
    }
    catch (error) {
        console.error('Error copying message to clipboard:', error);
        feedbackCallback === null || feedbackCallback === void 0 ? void 0 : feedbackCallback(false); // Indicate failure
    }
}
/**
 * Copies an image to the clipboard from a given URL.
 * Provides visual feedback via console logs and optionally a callback.
 */
function copyImageToClipboard(imageUrl, feedbackCallback) {
    try {
        fetch(imageUrl)
            .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.statusText}`);
            }
            return response.blob();
        })
            .then(blob => {
            // Create a ClipboardItem with the image blob
            // Note: ClipboardItem might not be defined in all environments
            // You might need to add `"dom.iterable"` to tsconfig lib or handle appropriately.
            const item = new ClipboardItem({ [blob.type]: blob });
            navigator.clipboard.write([item]).then(() => {
                console.log('Image copied to clipboard');
                feedbackCallback === null || feedbackCallback === void 0 ? void 0 : feedbackCallback(true); // Indicate success
            })
                .catch(err => {
                console.error('Failed to copy image to clipboard: ', err);
                alert('Failed to copy image: ' + err.message); // Keep alert for critical user feedback
                feedbackCallback === null || feedbackCallback === void 0 ? void 0 : feedbackCallback(false); // Indicate failure
            });
        })
            .catch(err => {
            console.error('Failed to fetch or process image: ', err);
            alert('Failed to fetch image: ' + err.message); // Keep alert for critical user feedback
            feedbackCallback === null || feedbackCallback === void 0 ? void 0 : feedbackCallback(false); // Indicate failure
        });
    }
    catch (error) {
        console.error('Error preparing image copy:', error);
        alert('Error copying image: ' + error); // Keep alert for critical user feedback
        feedbackCallback === null || feedbackCallback === void 0 ? void 0 : feedbackCallback(false); // Indicate failure
    }
}


/***/ }),

/***/ "./lib/utils/highlighting.js":
/*!***********************************!*\
  !*** ./lib/utils/highlighting.js ***!
  \***********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.detectLanguage = detectLanguage;
exports.highlightCode = highlightCode;
const highlight_js_1 = __importDefault(__webpack_require__(/*! highlight.js */ "webpack/sharing/consume/default/highlight.js/highlight.js"));
/**
 * Detects the programming language from code block content using highlight.js
 * and custom pattern matching for common languages.
 */
function detectLanguage(code) {
    try {
        // Try auto detection first with a limited set of common languages
        const result = highlight_js_1.default.highlightAuto(code, [
            'python', 'javascript', 'typescript', 'java',
            'html', 'css', 'cpp', 'csharp', 'sql', 'rust',
            'php', 'bash', 'json', 'xml', 'markdown'
        ]);
        // If confidence is reasonably high, use that language
        if (result.relevance > 5 && result.language) {
            return result.language;
        }
        // Fall back to basic pattern matching for better accuracy on ambiguous cases
        if (/^(?:\s*)?(?:import\s+[^;]+;|package\s+[^;]+;|public\s+class)/.test(code)) {
            return 'java';
        }
        else if (/^(?:\s*)?(import|from|def|class|if __name__)/.test(code)) {
            return 'python';
        }
        else if (/^(?:\s*)?(?:function|const|let|var|import|export|=>)/.test(code)) {
            // Broader check for JS/TS
            if (/^(?:\s*)?(?:import\s.+|export\s.+|interface|type|enum|declare|:|\s<)/.test(code)) {
                return 'typescript';
            }
            return 'javascript';
        }
        else if (/^(?:\s*)?(?:<!DOCTYPE|<html|<head|<body)/i.test(code)) {
            return 'html';
        }
        else if (/^(?:\s*)?#include/.test(code)) {
            return 'cpp';
        }
        else if (/^(?:\s*)?(?:using\s+System|namespace|public\s+static\s+void\s+Main)/.test(code)) {
            return 'csharp';
        }
        else if (/^(?:\s*)?(?:SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER)\s/i.test(code)) {
            return 'sql';
        }
        else if (/^(?:\s*)?(?:fn|let|struct|enum|trait|impl|mod)\s/.test(code)) {
            return 'rust';
        }
        else if (/^(?:\s*)?(?:<\?php|use\s+[\w\\]+;)/.test(code)) {
            return 'php';
        }
        else if (/^(?:\s*)?(?:#\s*!\/bin\/(?:bash|sh|zsh)|\$)/.test(code)) {
            return 'bash';
        }
        else if (/^\s*\{/.test(code) && /\}\s*$/.test(code)) {
            // Simple check for JSON-like structure
            return 'json';
        }
        else if (/^\s*<\?xml/.test(code) || /^\s*<\w+/.test(code)) {
            // Simple check for XML/HTML like structure
            return 'xml';
        }
        // If no specific language detected, return empty string for default handling
        return '';
    }
    catch (error) {
        console.error('Error detecting language:', error);
        return ''; // Return empty on error
    }
}
/**
 * Highlights code using highlight.js.
 * Falls back to auto-detection if the specified language is not supported.
 */
function highlightCode(code, language) {
    try {
        if (language && highlight_js_1.default.getLanguage(language)) {
            return highlight_js_1.default.highlight(code, { language, ignoreIllegals: true }).value;
        }
        else {
            // Fallback to auto-detection if language is empty or not registered
            return highlight_js_1.default.highlightAuto(code).value;
        }
    }
    catch (error) {
        console.error(`Error highlighting code (language: ${language || 'auto'}):`, error);
        // Return original code escaped for safety on error
        return code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
}


/***/ }),

/***/ "./lib/utils/markdown-config.js":
/*!**************************************!*\
  !*** ./lib/utils/markdown-config.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.configureMarked = configureMarked;
exports.preprocessMarkdown = preprocessMarkdown;
const marked_1 = __webpack_require__(/*! marked */ "webpack/sharing/consume/default/marked/marked");
/**
 * Configure marked with better rendering options for code blocks
 */
function configureMarked() {
    // Configure marked options
    marked_1.marked.setOptions({
        gfm: true, // Enable GitHub Flavored Markdown
        breaks: true, // Add <br> on single line breaks
        pedantic: false, // Conform to original markdown spec
        async: false, // Disable async rendering
        silent: false // Enable error reporting
    });
}
/**
 * Pre-process markdown text to fix common issues with streaming content
 */
function preprocessMarkdown(text) {
    // Normalize line endings
    const normalizedText = text.replace(/\r\n/g, '\n');
    // Handle code blocks first
    let inCodeBlock = false;
    const lines = normalizedText.split('\n');
    const processedLines = lines.map((line, i) => {
        // Check for code block markers
        if (line.trim().startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            // Preserve language specification
            return line.trim();
        }
        // If we're in a code block, preserve the line as is
        if (inCodeBlock) {
            return line;
        }
        // Outside code blocks:
        // 1. Handle list items with proper spacing
        // 2. Trim excessive whitespace at start and end, but preserve indentation within lines
        let processed = line;
        // Handle dash list items by ensuring they have a space after the dash
        processed = processed.replace(/(\s*)-(\S)/g, '$1- $2');
        // Handle mixed space/dash issues - ensure proper newlines before list items
        processed = processed.replace(/([^\n\s])-\s/g, '$1\n- ');
        return processed;
    });
    // Join lines and ensure code blocks are properly formatted
    let result = processedLines.join('\n');
    // Handle empty code blocks (add a space so they render properly)
    result = result.replace(/```(.*)\n```/g, '```$1\n \n```');
    return result;
}


/***/ }),

/***/ "./lib/utils/notebook-integration.js":
/*!*******************************************!*\
  !*** ./lib/utils/notebook-integration.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.addMessageToCell = addMessageToCell;
exports.getSelectedText = getSelectedText;
exports.getCurrentCellContent = getCurrentCellContent;
exports.insertCellContentByIndex = insertCellContentByIndex;
const globals_1 = __webpack_require__(/*! ../core/globals */ "./lib/core/globals.js");
/**
 * Adds message content to the current cell in the active notebook.
 */
function addMessageToCell(text) {
    var _a;
    const cell = (_a = globals_1.globals.notebookTracker) === null || _a === void 0 ? void 0 : _a.activeCell;
    if (!cell || !cell.editor) {
        console.warn('Cannot add message: No active cell or editor found.');
        return;
    }
    try {
        const editor = cell.editor;
        // Access the underlying CodeMirror editor view (adjust if using a different editor)
        const view = editor.editor;
        if (!view) {
            console.warn('Cannot add message: CodeMirror view not accessible.');
            return;
        }
        // Get current cursor position
        const state = view.state;
        const selection = state.selection;
        const cursorPos = selection.main.head;
        // Insert newline and message content at cursor position
        const transaction = state.update({
            changes: {
                from: cursorPos,
                insert: `\n${text}`
            },
            // Optionally move cursor to end of inserted text
            selection: { anchor: cursorPos + text.length + 1 }
        });
        view.dispatch(transaction);
    }
    catch (error) {
        console.error('Error adding message to cell:', error);
    }
}
/**
 * Gets the currently selected text from the active notebook cell or text editor.
 */
function getSelectedText() {
    var _a, _b, _c;
    const cell = (_a = globals_1.globals.notebookTracker) === null || _a === void 0 ? void 0 : _a.activeCell;
    if (cell === null || cell === void 0 ? void 0 : cell.editor) {
        const editor = cell.editor;
        const cmEditor = editor.editor; // Access CodeMirror editor instance
        if (cmEditor && cmEditor.state) {
            const state = cmEditor.state;
            const selection = state.selection.main;
            return selection.empty ? null : state.doc.sliceString(selection.from, selection.to);
        }
        console.warn("Could not access CodeMirror state to get selection.");
        return null;
    }
    else {
        // Fallback for non-notebook editors (e.g., text editor)
        const activeWidget = (_c = (_b = globals_1.globals.app) === null || _b === void 0 ? void 0 : _b.shell) === null || _c === void 0 ? void 0 : _c.currentWidget;
        if (activeWidget && 'content' in activeWidget && activeWidget.content.editor) {
            const editor = activeWidget.content.editor;
            const cmEditor = editor.editor;
            if (cmEditor && cmEditor.state) {
                const state = cmEditor.state;
                const selection = state.selection.main;
                return selection.empty ? null : state.doc.sliceString(selection.from, selection.to);
            }
            console.warn("Could not access CodeMirror state for non-notebook editor selection.");
            return null;
        }
    }
    return null;
}
/**
 * Gets the content of the currently active notebook cell or text editor.
 */
function getCurrentCellContent() {
    var _a, _b, _c, _d, _e;
    const activeCell = (_a = globals_1.globals.notebookTracker) === null || _a === void 0 ? void 0 : _a.activeCell;
    if (activeCell === null || activeCell === void 0 ? void 0 : activeCell.model) {
        // Try using sharedModel first (more robust)
        if (activeCell.model.sharedModel && typeof activeCell.model.sharedModel.getSource === 'function') {
            return activeCell.model.sharedModel.getSource();
        }
        // Fallback: Try using toJSON().source
        const cellJson = activeCell.model.toJSON();
        const source = cellJson === null || cellJson === void 0 ? void 0 : cellJson.source;
        if (typeof source === 'string') {
            return source;
        }
        else if (Array.isArray(source)) {
            return source.join('\n');
        }
        console.warn("Could not get cell content via sharedModel or toJSON().source");
        return null;
    }
    // Fallback for non-notebook editors if needed
    const activeWidget = (_c = (_b = globals_1.globals.app) === null || _b === void 0 ? void 0 : _b.shell) === null || _c === void 0 ? void 0 : _c.currentWidget;
    if (activeWidget && 'content' in activeWidget && activeWidget.content.model) {
        // Assuming model.value.text for generic text editors
        return (_e = (_d = activeWidget.content.model.value) === null || _d === void 0 ? void 0 : _d.text) !== null && _e !== void 0 ? _e : null;
    }
    return null;
}
/**
 * Gets cell content by index from the current notebook and calls a callback to insert it.
 * NOTE: The original function called `this.appendToInput`. This functionality needs
 *       to be provided via the `insertCallback`.
 */
function insertCellContentByIndex(index, insertCallback) {
    try {
        if (!globals_1.globals.notebookTracker || !globals_1.globals.notebookTracker.currentWidget) {
            console.error('No active notebook found');
            return;
        }
        const notebookPanel = globals_1.globals.notebookTracker.currentWidget;
        const model = notebookPanel.content.model;
        if (!model || !model.cells || index < 0 || index >= model.cells.length) {
            console.error(`Invalid cell index: ${index}`);
            return;
        }
        const cell = model.cells.get(index);
        let cellContent = '';
        // Get cell content - handle different ways content might be stored
        if (cell.sharedModel && typeof cell.sharedModel.getSource === 'function') {
            cellContent = cell.sharedModel.getSource();
        }
        else {
            const cellJson = cell.toJSON();
            const source = cellJson === null || cellJson === void 0 ? void 0 : cellJson.source;
            if (typeof source === 'string') {
                cellContent = source;
            }
            else if (Array.isArray(source)) {
                cellContent = source.join('\n');
            }
        }
        // Insert cell reference with content using the callback
        insertCallback(`cell ${cellContent}`);
    }
    catch (error) {
        console.error('Error inserting cell by index:', error);
    }
}


/***/ })

}]);
//# sourceMappingURL=lib_index_js.815e67580a6e4502e709.js.map