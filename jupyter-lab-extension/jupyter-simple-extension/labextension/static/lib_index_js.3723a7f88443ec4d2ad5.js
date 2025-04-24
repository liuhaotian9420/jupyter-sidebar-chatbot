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
        // Normalize URL by removing trailing slashes
        this.baseUrl = baseUrl.replace(/\/+$/, '');
        // Always keep local service URL for backend operations
        this.localServiceUrl = 'http://localhost:8000';
        console.log(`ApiClient initialized with baseUrl: ${this.baseUrl}`);
        console.log(`Local service URL fixed at: ${this.localServiceUrl}`);
    }
    /**
     * Stream a chat response from the LLM
     * @param message The user message to send
     * @param context Optional context information
     * @param onChunk Callback for each text chunk received
     * @param onComplete Callback when streaming is complete
     * @param onError Callback for errors
     * @param thread_id Optional thread ID for maintaining conversation history (deprecated, use context.thread_id instead)
     */
    async streamChat(message, context = null, onChunk, onComplete, onError, thread_id) {
        try {
            // Build the request body, allowing thread_id to come from either parameter (backward compatibility)
            // or from the context object (preferred)
            const requestBody = {
                message
            };
            // Set thread_id from either source (context.thread_id takes precedence)
            const effectiveThreadId = (context === null || context === void 0 ? void 0 : context.thread_id) || thread_id;
            // Debug info
            console.log('ApiClient.streamChat - Inputs:', {
                message,
                context,
                thread_id,
                effectiveThreadId
            });
            // Add the thread_id to the request body if available
            if (effectiveThreadId) {
                requestBody.thread_id = effectiveThreadId;
            }
            // Add context if provided, but don't modify the original context object
            if (context) {
                // Make a shallow copy of the context to avoid modifying the original
                requestBody.context = Object.assign({}, context);
                // Remove thread_id from context copy to avoid duplication
                if ('thread_id' in requestBody.context) {
                    delete requestBody.context.thread_id;
                }
            }
            // Debug info - final request body
            console.log('ApiClient.streamChat - Request body:', JSON.stringify(requestBody));
            // Use local service URL for backend operations
            const response = await fetch(`${this.localServiceUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
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
     * Create a new thread for conversation history
     * @returns Promise that resolves to the created thread ID
     */
    async createThread() {
        try {
            // First check if the API is healthy
            const isHealthy = await this.healthCheck();
            if (!isHealthy) {
                console.warn('Backend API is not healthy, cannot create thread');
                throw new Error('Backend API is not healthy');
            }
            // Use local service URL for backend operations
            const threadUrl = `${this.localServiceUrl}/create-thread`;
            console.log('Creating thread using API endpoint:', threadUrl);
            try {
                const response = await fetch(threadUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                console.log(`Create thread response status: ${response.status} ${response.statusText}`);
                if (!response.ok) {
                    throw new Error(`API error: ${response.statusText}`);
                }
                const data = await response.json();
                console.log('Thread created successfully:', data.thread_id);
                return data.thread_id;
            }
            catch (fetchError) {
                console.error('Error in fetch operation:', fetchError);
                // Check for CORS errors
                if (fetchError instanceof TypeError && fetchError.message.includes('Failed to fetch')) {
                    console.error('This might be a CORS or network connectivity issue. Check backend server logs.');
                }
                throw fetchError;
            }
        }
        catch (error) {
            console.error('Error creating thread:', error);
            throw error;
        }
    }
    /**
     * List all available threads
     * @returns Promise that resolves to an array of thread IDs
     */
    async listThreads() {
        try {
            // Use local service URL for backend operations
            const response = await fetch(`${this.localServiceUrl}/threads`, {
                method: 'GET'
            });
            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }
            const data = await response.json();
            return data.threads;
        }
        catch (error) {
            console.error('Error listing threads:', error);
            throw error;
        }
    }
    /**
     * Update LLM settings on the backend
     * @param settings Settings to update
     * @returns Promise that resolves to the updated settings
     */
    async updateSettings(settings) {
        try {
            // Use local service URL for backend operations
            const response = await fetch(`${this.localServiceUrl}/settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings)
            });
            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('Error updating settings:', error);
            throw error;
        }
    }
    /**
     * Simple health check for the API
     * @returns A promise that resolves to true if the API is healthy
     */
    async healthCheck() {
        try {
            // Always use the local service URL for health check
            const healthUrl = `${this.localServiceUrl}/health`;
            console.log(`Performing health check at: ${healthUrl}`);
            const response = await fetch(healthUrl, {
                method: 'GET'
            });
            console.log(`Health check response status: ${response.status} ${response.statusText}`);
            return response.ok;
        }
        catch (error) {
            console.error('Health check failed:', error);
            // More detailed logging for network errors
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                console.error('Network error: Could not connect to the backend. Please check if the backend server is running.');
            }
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
        // Create header with back button
        const header = document.createElement('div');
        header.className = 'jp-llm-ext-history-header';
        // Create back button
        const backButton = document.createElement('button');
        backButton.className = 'jp-Button jp-llm-ext-back-button';
        backButton.innerHTML = '<span class="jp-icon3 jp-icon-selectable" role="presentation"><svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg></span>';
        backButton.title = 'Back to chat';
        backButton.addEventListener('click', () => this.hideHistoryView());
        const title = document.createElement('h2');
        title.textContent = 'Chat History';
        header.appendChild(backButton);
        header.appendChild(title);
        this.historyContainer.appendChild(header);
        if (history.length === 0) {
            this.historyContainer.innerHTML += '<div class="jp-llm-ext-history-empty">No chat history yet.</div>';
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
        // Log thread_id if available for debugging
        if (chat.thread_id) {
            console.log(`Loaded chat with thread_id: ${chat.thread_id}`);
        }
        else {
            console.log('Loaded chat does not have a thread_id');
        }
        // Update the main UI title input
        this.callbacks.updateTitleInput(chat.title);
        // Clear the current message display
        this.callbacks.clearMessageContainer();
        // Re-populate the message container with messages from the loaded chat
        // Use the renderer functions via callbacks
        chat.messages.forEach((msg) => {
            let messageElement;
            // Get message content, supporting both old (text) and new (content) message formats
            const messageContent = msg.content || msg.text || '';
            if (msg.sender === 'user') {
                messageElement = (0, message_renderer_1.renderUserMessage)(messageContent, { isMarkdown: msg.isMarkdown }, this.rendererCallbacks);
            }
            else { // 'bot'
                messageElement = (0, message_renderer_1.renderBotMessage)(messageContent, { isMarkdown: msg.isMarkdown }, this.rendererCallbacks);
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
    /**
     * Hides the history view and shows the chat view.
     */
    hideHistoryView() {
        this.isHistoryViewActive = false;
        this.uiManager.showChatView();
        // Ensure the correct title is displayed when switching back
        const currentChat = this.chatState.getCurrentChat();
        if (currentChat) {
            this.callbacks.updateTitleInput(currentChat.title);
        }
    }
}
exports.HistoryHandler = HistoryHandler;


/***/ }),

/***/ "./lib/handlers/input-handler.js":
/*!***************************************!*\
  !*** ./lib/handlers/input-handler.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InputHandler = void 0;
const content_editable_utils_1 = __webpack_require__(/*! ../utils/content-editable-utils */ "./lib/utils/content-editable-utils.js"); // Helper needed
const globals_1 = __webpack_require__(/*! ../core/globals */ "./lib/core/globals.js"); // Import globals
const message_renderer_1 = __webpack_require__(/*! ../ui/message-renderer */ "./lib/ui/message-renderer.js");
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
        // NEW Click handler for widget interactions (e.g., expand)
        this._handleClick = (event) => {
            const target = event.target;
            const widget = target.closest('.jp-llm-ext-ref-widget');
            if (widget && widget.isContentEditable) {
                // Don't trigger preview if clicking inside the main editable div itself
                // Only trigger if clicking directly on a non-editable widget span
                if (widget === this.chatInput)
                    return; // Ignore clicks on the main div background
            }
            if (widget && !widget.isContentEditable) { // Ensure it's our non-editable widget span
                const type = widget.dataset.type;
                const content = widget.dataset.content;
                const refId = widget.dataset.refId;
                const path = widget.dataset.path;
                console.log(`Widget clicked: Type=${type}, RefID=${refId}, Path=${path}`);
                if ((type === 'code' || type === 'cell') && content) {
                    event.preventDefault(); // Prevent potential text selection issues
                    event.stopPropagation(); // Stop event from bubbling further
                    this.showWidgetPreview(widget, content);
                }
                else {
                    // Handle click on file/dir or widget without content? Maybe do nothing.
                    // Or potentially remove existing preview if any
                    this.removeWidgetPreview();
                }
            }
            else {
                // Click was not on a widget, remove any existing preview
                this.removeWidgetPreview();
            }
        };
        // --- Widget Preview Logic ---
        this.activePreviewElement = null;
        // --- Private Event Handlers ---
        this._handleKeyPress = (event) => {
            // Handle Enter key press (send message)
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault(); // Prevent default newline insertion
                // NEW: Use serialization method to get the raw message with placeholders
                let message = this._serializeInputContent();
                message = message.trim(); // Trim whitespace
                if (message) {
                    // Resolve code references with proper formatting based on markdown mode
                    const resolvedMessage = this.resolveCodeReferences(message, this.isMarkdownMode);
                    // Pass resolved message with current markdown state
                    this.callbacks.handleSendMessage(resolvedMessage, this.isMarkdownMode);
                }
            }
            // --- Handle Tab/Escape/Arrows for popup interaction ---
            // Check if popup is visible (needs a way to know, maybe via callbacks or direct reference?)
            // Assuming popupMenuManager reference is available or state is tracked
            // else if (this.popupMenuManager.isPopupMenuVisible()) { // Pseudo-code
            //    if (event.key === 'Tab' || event.key === 'Escape' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            //        // Prevent default input field behavior
            //        event.preventDefault();
            //        // Let the PopupMenuManager's document handler manage the event
            //    }
            // }
            // --- End Popup Interaction Handling ---
        };
        this._handleInput = () => {
            // Use textContent for div
            const currentText = this.chatInput.textContent || '';
            // --- Update Code Ref Placeholders --- 
            // Optional: If we want visual placeholders to update live
            // This could involve complex DOM manipulation or using a library.
            // For now, we resolve refs only on send.
            // --- At Symbol Detection for Popup --- 
            // This logic was moved to UIManager.handleInputForReference
            // because UIManager needs to coordinate showing the popup.
            // InputHandler might still need to know *if* an @ was typed recently
            // to adjust behavior (e.g., how Enter works), but UIManager handles the popup trigger.
            // Simple check if text contains '@' for potential state management
            this.hasAtSymbol = currentText.includes('@');
            // Adjust input height dynamically based on content?
            // Can be complex with contenteditable divs. Requires careful calculation.
            // this.adjustInputHeight(); 
        };
        // NEW Keydown handler for widget deletion etc.
        this._handleKeyDown = (event) => {
            var _a, _b;
            const selection = window.getSelection();
            if (!selection || !selection.rangeCount || !selection.isCollapsed) {
                // Only handle single cursor position, not range selection
                return;
            }
            const range = selection.getRangeAt(0);
            const container = range.startContainer;
            const offset = range.startOffset;
            const key = event.key;
            let widgetToDelete = null;
            let nodeToCheck = null;
            if (key === 'Backspace') {
                if (offset > 0 && container.nodeType === Node.TEXT_NODE) {
                    // Cursor is within a text node, check the node *before* this text node
                    // But only if the cursor is at the *start* of the text node (offset === 0? No, check previousSibling always?)
                    // Let's check the node directly preceding the container
                    nodeToCheck = container.previousSibling;
                }
                else if (offset > 0 && container === this.chatInput) {
                    // Cursor is between nodes in the main input div
                    nodeToCheck = container.childNodes[offset - 1];
                }
                else if (offset === 0 && container !== this.chatInput) {
                    // Cursor is at the beginning of a non-div node (e.g., start of a text node after a widget)
                    // Need to check the node before the container
                    nodeToCheck = container.previousSibling;
                }
                // Check if the node to check is a ZWS or space node, if so, check the node before that
                if (nodeToCheck && nodeToCheck.nodeType === Node.TEXT_NODE && (nodeToCheck.textContent === '\u200B' || nodeToCheck.textContent === ' ')) {
                    nodeToCheck = nodeToCheck.previousSibling;
                }
            }
            else if (key === 'Delete') {
                if (container.nodeType === Node.TEXT_NODE && offset < container.length) {
                    // Cursor is within a text node, check the node *after* this text node
                    nodeToCheck = container.nextSibling;
                }
                else if (container === this.chatInput && offset < container.childNodes.length) {
                    // Cursor is between nodes in the main input div
                    nodeToCheck = container.childNodes[offset];
                }
                else if (container !== this.chatInput && offset === (((_a = container.textContent) === null || _a === void 0 ? void 0 : _a.length) || 0)) {
                    // Cursor is at the end of a non-div node (e.g., end of a text node before a widget)
                    // Need to check the node after the container
                    nodeToCheck = container.nextSibling;
                }
                // Check if the node to check is a ZWS or space node, if so, check the node after that
                if (nodeToCheck && nodeToCheck.nodeType === Node.TEXT_NODE && (nodeToCheck.textContent === '\u200B' || nodeToCheck.textContent === ' ')) {
                    nodeToCheck = nodeToCheck.nextSibling;
                }
            }
            // Check if the final nodeToCheck is a widget
            if (nodeToCheck && nodeToCheck.nodeType === Node.ELEMENT_NODE && ((_b = nodeToCheck.classList) === null || _b === void 0 ? void 0 : _b.contains('jp-llm-ext-ref-widget'))) {
                widgetToDelete = nodeToCheck;
                console.log(`${key} pressed adjacent to widget:`, widgetToDelete);
            }
            if (widgetToDelete) {
                event.preventDefault();
                const parent = widgetToDelete.parentNode;
                if (parent) {
                    // Define nodes to remove: widget itself, potentially space before, potentially ZWS after
                    const nodesToRemove = [widgetToDelete];
                    const spaceBefore = widgetToDelete.previousSibling;
                    const zwsAfter = widgetToDelete.nextSibling;
                    if (spaceBefore && spaceBefore.nodeType === Node.TEXT_NODE && spaceBefore.textContent === ' ') {
                        nodesToRemove.unshift(spaceBefore); // Add space to beginning of removal list
                    }
                    if (zwsAfter && zwsAfter.nodeType === Node.TEXT_NODE && zwsAfter.textContent === '\u200B') {
                        nodesToRemove.push(zwsAfter); // Add ZWS to end of removal list
                    }
                    // Remove all identified nodes
                    nodesToRemove.forEach(node => parent.removeChild(node));
                    // Optional: Remove ref from map if it was a code/cell ref
                    const refId = widgetToDelete.dataset.refId;
                    if (refId && this.codeRefMap.has(refId)) {
                        this.codeRefMap.delete(refId);
                        console.log('Removed reference from map:', refId);
                    }
                    // Trigger input event manually after deletion
                    this.chatInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                }
            }
        };
        this.chatInput = chatInput;
        this.callbacks = callbacks;
        // this.uiManager = uiManager; // Removed unused assignment
        // Bind event listeners
        this.chatInput.addEventListener('keypress', this._handleKeyPress);
        this.chatInput.addEventListener('input', this._handleInput);
        this.chatInput.addEventListener('keydown', this._handleKeyDown);
        this.chatInput.addEventListener('click', this._handleClick); // ADDED Click Listener
        // Note: Actual markdown toggle and expand buttons are likely managed by UIManager,
        // which would then call methods like `setMarkdownMode` or `toggleExpansion` on this handler.
    }
    /**
     * Removes event listeners.
     */
    dispose() {
        this.chatInput.removeEventListener('keypress', this._handleKeyPress);
        this.chatInput.removeEventListener('input', this._handleInput);
        this.chatInput.removeEventListener('keydown', this._handleKeyDown);
        this.chatInput.removeEventListener('click', this._handleClick); // ADDED
    }
    /**
     * Appends text to the input field, potentially replacing a preceding '@' symbol.
     */
    appendToInput(text) {
        try {
            this.chatInput.focus(); // Ensure focus first
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) {
                console.error('Cannot append to input: No selection found.');
                // Fallback: append to end
                this.chatInput.textContent = (this.chatInput.textContent || '') + text;
                return;
            }
            const range = selection.getRangeAt(0);
            const { startContainer, startOffset } = range;
            let currentTextContent = this.chatInput.textContent || ''; // Use textContent
            let insertPos = (0, content_editable_utils_1.getCaretPosition)(this.chatInput); // Get linear position
            // Simple check: if the character before the linear caret position is '@'
            if (insertPos > 0 && currentTextContent[insertPos - 1] === '@') {
                // Replace the '@' - more complex with DOM manipulation,
                // For simplicity, we'll replace in textContent and reset
                const before = currentTextContent.slice(0, insertPos - 1);
                const after = currentTextContent.slice(insertPos);
                this.chatInput.textContent = before + text + after;
                // Set cursor position after the inserted text
                (0, content_editable_utils_1.setCaretPosition)(this.chatInput, (insertPos - 1) + text.length);
            }
            else {
                // Standard insertion - more complex with DOM manipulation
                // For simplicity, we'll insert in textContent and reset
                const before = currentTextContent.slice(0, insertPos);
                const after = currentTextContent.slice(insertPos);
                this.chatInput.textContent = before + text + after;
                // Set cursor position after the inserted text
                (0, content_editable_utils_1.setCaretPosition)(this.chatInput, insertPos + text.length);
            }
            // Trigger input event manually since we're changing textContent directly
            this.chatInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        }
        catch (error) {
            console.error('Error appending to input:', error);
        }
    }
    /**
     * Clears the input field and resets associated state after sending.
     */
    clearInput() {
        // Use textContent for div
        this.chatInput.textContent = '';
        // Directly reset internal state instead of relying on callback
        this.resetCodeReferences();
        // Remove rows manipulation
        // this.chatInput.rows = 1;
        this.chatInput.style.height = ''; // Reset height
        this.hasAtSymbol = false; // Reset @ state
        // Reset expand button state if it was expanded
        if (this.isInputExpanded) {
            this.toggleInputExpansion(false); // Collapse input
        }
        // Trigger input event manually after clearing
        this.chatInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
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
            // Use max-height or height for div
            this.chatInput.style.height = '200px'; // Example height
            // Allow vertical resizing if desired, or keep as 'none'
            this.chatInput.style.resize = 'vertical';
            this.chatInput.style.overflowY = 'auto'; // Ensure scrollbar appears if needed
        }
        else {
            this.chatInput.style.height = ''; // Reset height
            this.chatInput.style.resize = 'none';
            // Remove rows manipulation
            // this.chatInput.rows = 1; // Ensure it collapses back to 1 row height
            this.chatInput.style.overflowY = 'hidden'; // Hide scrollbar when collapsed
        }
        // Notify UIManager/LayoutBuilder to update button appearance
        this.callbacks.toggleInputExpansionUI(this.isInputExpanded);
    }
    // --- Code Reference Methods ---
    /**
     * Adds a code reference to the internal map and returns its ID.
     * @param codeContent The actual code content.
     * @param notebookName The name of the notebook the code is from.
     * @param cellIndex The index of the cell the code is from (0-based).
     * @param lineNumber The starting line number of the code within the cell (1-based).
     * @param lineEndNumber The ending line number of the code within the cell (1-based).
     * @returns The generated reference ID (e.g., "ref-1").
     */
    addCodeReference(codeContent, // Renamed parameter
    notebookName, cellIndex, lineNumber, // Start line
    lineEndNumber // End line
    ) {
        const refId = `ref-${this.nextRefId++}`;
        // Store type and use 'content' field
        const refData = {
            type: 'code',
            content: codeContent, // Use content field
            notebookName,
            cellIndex,
            lineNumber,
            lineEndNumber
        };
        this.codeRefMap.set(refId, refData);
        console.log('Added code reference:', refId, '->', `(${notebookName}, Cell ${cellIndex + 1}, Line ${lineNumber}${lineNumber !== lineEndNumber ? '_' + lineEndNumber : ''}) ` +
            codeContent.substring(0, 30) + '...' // Use codeContent
        );
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
        // --- DEBUG LOG --- 
        console.log('[InputHandler] resetCodeReferences called!', new Error().stack); // Log call stack
        // --- END DEBUG LOG --- 
        this.codeRefMap.clear();
        this.nextRefId = 1;
        console.log('Code references reset.'); // Debug log
    }
    /**
     * Replaces code reference placeholders (e.g., "[ref-1]") in a message string
     * with the actual code from the map.
     * @param message The message string potentially containing placeholders.
     * @param isMarkdown Whether the message should be formatted for markdown
     * @returns The message string with placeholders resolved.
     */
    resolveCodeReferences(message, isMarkdown = false) {
        if (this.codeRefMap.size === 0) {
            return message; // No references to resolve
        }
        // Regex to find placeholders like [ref-1], [ref-12], etc.
        // Adjusted regex slightly to be non-greedy if needed, though current format is fine.
        const placeholderRegex = /@(?:code|Cell)\[(ref-\d+)\]|@code\((?:[^)]+)\)\[(ref-\d+)\]|\[(ref-\d+)\]/g;
        let resolvedMessage = message.replace(placeholderRegex, (match, refId1, refId2, refId3) => {
            const refId = refId1 || refId2 || refId3; // Get the captured refId
            if (!refId)
                return match; // If somehow no refId captured, return original match
            const refData = this.codeRefMap.get(refId);
            if (refData) {
                console.log(`Resolving ${refData.type} reference:`, refId); // Debug log type
                // Use refData.content (renamed from refData.code)
                // Add context based on type?
                let prefix, suffix;
                if (isMarkdown) {
                    // Format for markdown with code block
                    const lang = refData.type === 'code' ? 'python' : ''; // Default to python for code, blank for cell
                    prefix = refData.type === 'cell' ?
                        `\n\`\`\`${lang} # Cell ${refData.cellIndex + 1} (${refData.notebookName})\n` :
                        `\n\`\`\`${lang} # Code (${refData.notebookName}:Cell ${refData.cellIndex + 1}:L${refData.lineNumber}-${refData.lineEndNumber})\n`;
                    suffix = `\n\`\`\``;
                }
                else {
                    // Plain text format
                    prefix = refData.type === 'cell' ?
                        `\n--- Start Cell ${refData.cellIndex + 1} (${refData.notebookName}) ---\n` :
                        `\n--- Start Code (${refData.notebookName}:Cell ${refData.cellIndex + 1}:L${refData.lineNumber}-${refData.lineEndNumber}) ---\n`;
                    suffix = refData.type === 'cell' ?
                        `\n--- End Cell ${refData.cellIndex + 1} ---` :
                        `\n--- End Code ---`;
                }
                return `${prefix}${refData.content}${suffix}`;
            }
            else {
                console.warn('Could not find data for reference:', refId); // Warn if ref ID not found
                return match; // Keep the placeholder if not found
            }
        });
        return resolvedMessage;
    }
    // NEW method specifically for Ctrl+L shortcut
    handleInsertCodeReferenceFromShortcut(selectedText) {
        var _a, _b, _c;
        const currentNotebookWidget = (_a = globals_1.globals.notebookTracker) === null || _a === void 0 ? void 0 : _a.currentWidget;
        const activeCell = (_b = globals_1.globals.notebookTracker) === null || _b === void 0 ? void 0 : _b.activeCell;
        const editor = activeCell === null || activeCell === void 0 ? void 0 : activeCell.editor;
        const cmEditor = editor ? editor.editor : null; // CodeMirror view
        if (!currentNotebookWidget || !activeCell || !editor || !cmEditor || !cmEditor.state) {
            console.error('Cannot insert code reference: Missing notebook, cell, or editor context.');
            // Optionally show an indicator via callbacks?
            return;
        }
        try {
            // 1. Gather Context
            const notebookPath = currentNotebookWidget.context.path;
            const notebookName = ((_c = notebookPath.split('/').pop()) === null || _c === void 0 ? void 0 : _c.split('.')[0]) || 'notebook';
            const cellIndex = currentNotebookWidget.content.activeCellIndex;
            const state = cmEditor.state;
            const selection = state.selection.main;
            const startLine = state.doc.lineAt(selection.from).number; // 1-based
            const endLine = state.doc.lineAt(selection.to).number; // 1-based
            if (cellIndex === undefined || cellIndex === null) {
                console.error('Cannot insert code reference: Could not determine active cell index.');
                return;
            }
            // 2. Create Ref Data (but don't necessarily add to map yet? Or do?)
            // Let's add it now for consistency.
            const refData = {
                type: 'code',
                content: selectedText,
                notebookName,
                cellIndex,
                lineNumber: startLine,
                lineEndNumber: endLine
            };
            const refId = `ref-${this.nextRefId++}`;
            this.codeRefMap.set(refId, refData);
            console.log(`Added code reference via shortcut: ${refId}`);
            // ADDED: Construct placeholder
            const placeholder = `@code[${refId}]`;
            // 3. Insert RENDERED WIDGET Representation into Input Field
            this.chatInput.focus(); // Ensure focus
            const winSelection = window.getSelection();
            if (!winSelection || winSelection.rangeCount === 0) {
                console.error('Cannot insert reference widget: No window selection found.');
                // Fallback might be complex, maybe just log error for now
                return;
            }
            const range = winSelection.getRangeAt(0);
            // Render the widget - Pass placeholder
            const widgetElement = (0, message_renderer_1.renderReferenceWidgetInline)('code', refData, placeholder, refId);
            // Create a zero-width space text node for cursor positioning
            const zeroWidthSpace = document.createTextNode('\u200B');
            // Add a normal space for separation
            const spaceNode = document.createTextNode(' ');
            range.deleteContents(); // Clear any existing selection in the input field
            range.insertNode(spaceNode); // Insert space first
            range.insertNode(widgetElement); // Insert the widget element
            range.insertNode(zeroWidthSpace); // Insert ZWS after widget
            // Move cursor after the zero-width space (effectively after the widget + space)
            range.setStartAfter(zeroWidthSpace);
            range.setEndAfter(zeroWidthSpace);
            winSelection.removeAllRanges();
            winSelection.addRange(range);
            // --- End Insertion Logic ---
            // Trigger input event manually
            this.chatInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        }
        catch (error) {
            console.error('Error handling insert code reference from shortcut:', error);
        }
    }
    // NEW: Method to add a cell reference
    addCellReference(notebookName, cellIndex) {
        var _a;
        const notebookPanel = (_a = globals_1.globals.notebookTracker) === null || _a === void 0 ? void 0 : _a.currentWidget;
        if (!notebookPanel || !notebookPanel.content.model || !notebookPanel.content.model.cells) {
            console.error('Cannot add cell reference: Notebook or cells not found.');
            return null;
        }
        const model = notebookPanel.content.model;
        if (cellIndex < 0 || cellIndex >= model.cells.length) {
            console.error(`Cannot add cell reference: Invalid cell index ${cellIndex}`);
            return null;
        }
        const cell = model.cells.get(cellIndex);
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
                cellContent = source.join('\n'); // Corrected: Use actual newline
            }
        }
        const refId = `ref-${this.nextRefId++}`;
        const refData = {
            type: 'cell',
            content: cellContent,
            notebookName,
            cellIndex
            // lineNumber/lineEndNumber are omitted
        };
        this.codeRefMap.set(refId, refData);
        // Combine console.log into one line
        console.log(`Added cell reference: ${refId} -> (${notebookName}, Cell ${cellIndex + 1}) ${cellContent.substring(0, 30)}...`);
        return refId;
    }
    // NEW method specifically for Ctrl+L shortcut (Cell)
    handleInsertCellReferenceFromShortcut() {
        var _a, _b, _c;
        const currentNotebookWidget = (_a = globals_1.globals.notebookTracker) === null || _a === void 0 ? void 0 : _a.currentWidget;
        const activeCell = (_b = globals_1.globals.notebookTracker) === null || _b === void 0 ? void 0 : _b.activeCell;
        if (!currentNotebookWidget || !activeCell) {
            console.error('Cannot insert cell reference: Missing notebook or cell context.');
            return;
        }
        try {
            // 1. Gather Context
            const notebookPath = currentNotebookWidget.context.path;
            const notebookName = ((_c = notebookPath.split('/').pop()) === null || _c === void 0 ? void 0 : _c.split('.')[0]) || 'notebook';
            const cellIndex = currentNotebookWidget.content.activeCellIndex;
            if (cellIndex === undefined || cellIndex === null) {
                console.error('Cannot insert cell reference: Could not determine active cell index.');
                return;
            }
            // 2. Add Cell Reference to Map and get data
            const refId = this.addCellReference(notebookName, cellIndex);
            if (!refId) {
                console.error('Failed to add cell reference to map.');
                return; // Stop if we couldn't create the reference data
            }
            const refData = this.codeRefMap.get(refId);
            if (!refData) {
                console.error(`Failed to retrieve data for cell reference ${refId}.`);
                return;
            }
            // ADDED: Construct placeholder
            const placeholder = `@Cell[${cellIndex + 1}]`;
            // 3. Insert RENDERED WIDGET Representation into Input Field
            this.chatInput.focus(); // Ensure focus
            const winSelection = window.getSelection();
            if (!winSelection || winSelection.rangeCount === 0) {
                console.error('Cannot insert reference widget: No window selection found.');
                return;
            }
            const range = winSelection.getRangeAt(0);
            // Render the widget - Pass placeholder
            const widgetElement = (0, message_renderer_1.renderReferenceWidgetInline)('cell', refData, placeholder, refId);
            // Create a zero-width space text node for cursor positioning
            const zeroWidthSpace = document.createTextNode('\u200B');
            // Add a normal space for separation
            const spaceNode = document.createTextNode(' ');
            range.deleteContents(); // Clear any existing selection in the input field
            range.insertNode(spaceNode); // Insert space first
            range.insertNode(widgetElement); // Insert the widget element
            range.insertNode(zeroWidthSpace); // Insert ZWS after widget
            // Move cursor after the zero-width space
            range.setStartAfter(zeroWidthSpace);
            range.setEndAfter(zeroWidthSpace);
            winSelection.removeAllRanges();
            winSelection.addRange(range);
            // Trigger input event manually
            this.chatInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        }
        catch (error) {
            console.error('Error handling insert cell reference from shortcut:', error);
        }
    }
    // NEW method for inserting File widgets from Popup
    handleInsertFileWidget(filePath) {
        var _a;
        try {
            this.chatInput.focus(); // Ensure focus
            const winSelection = window.getSelection();
            if (!winSelection || winSelection.rangeCount === 0) {
                console.error('Cannot insert file widget: No window selection found.');
                return;
            }
            // Get the current selection range
            const range = winSelection.getRangeAt(0);
            // Construct placeholder
            const placeholder = `@file[${filePath}]`;
            // Render the widget - Pass placeholder (no refId needed)
            const widgetElement = (0, message_renderer_1.renderReferenceWidgetInline)('file', filePath, placeholder);
            // Create a zero-width space text node for cursor positioning
            const zeroWidthSpace = document.createTextNode('\u200B');
            // Add a normal space for separation
            const spaceNode = document.createTextNode(' ');
            // Check if the character before the cursor is '@' and replace it
            let replacedAtSymbol = false;
            if (range.startOffset > 0 && range.startContainer.nodeType === Node.TEXT_NODE) {
                const textBefore = (_a = range.startContainer.textContent) === null || _a === void 0 ? void 0 : _a.substring(0, range.startOffset);
                if (textBefore === null || textBefore === void 0 ? void 0 : textBefore.endsWith('@')) {
                    // Modify the range to include the '@'
                    range.setStart(range.startContainer, range.startOffset - 1);
                    replacedAtSymbol = true;
                    console.log("Replacing @ symbol before inserting file widget."); // Debug log
                }
            }
            // Wrap the widget and additional nodes in a fragment for cleaner insertion
            const fragment = document.createDocumentFragment();
            fragment.appendChild(widgetElement);
            fragment.appendChild(zeroWidthSpace);
            fragment.appendChild(spaceNode);
            // Delete any selected content (including @ if found)
            range.deleteContents();
            // Insert the fragment with all elements
            range.insertNode(fragment);
            // Explicitly move cursor after the inserted space node
            const newRange = document.createRange();
            newRange.setStartAfter(spaceNode);
            newRange.setEndAfter(spaceNode);
            winSelection.removeAllRanges();
            winSelection.addRange(newRange);
            // Trigger input event manually
            this.chatInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        }
        catch (error) {
            console.error('Error handling insert file widget:', error);
        }
    }
    // NEW method for inserting Directory widgets from Popup
    handleInsertDirWidget(dirPath) {
        var _a;
        try {
            this.chatInput.focus(); // Ensure focus
            const winSelection = window.getSelection();
            if (!winSelection || winSelection.rangeCount === 0) {
                console.error('Cannot insert directory widget: No window selection found.');
                return;
            }
            const range = winSelection.getRangeAt(0);
            // Construct placeholder
            const placeholder = `@dir[${dirPath}]`;
            // Render the widget - Pass placeholder (no refId needed)
            const widgetElement = (0, message_renderer_1.renderReferenceWidgetInline)('dir', dirPath, placeholder);
            // Create a zero-width space text node for cursor positioning
            const zeroWidthSpace = document.createTextNode('\u200B');
            // Add a normal space for separation
            const spaceNode = document.createTextNode(' ');
            // Check if the character before the cursor is '@' and replace it
            let replacedAtSymbol = false;
            if (range.startOffset > 0 && range.startContainer.nodeType === Node.TEXT_NODE) {
                const textBefore = (_a = range.startContainer.textContent) === null || _a === void 0 ? void 0 : _a.substring(0, range.startOffset);
                if (textBefore === null || textBefore === void 0 ? void 0 : textBefore.endsWith('@')) {
                    // Modify the range to include the '@'
                    range.setStart(range.startContainer, range.startOffset - 1);
                    replacedAtSymbol = true;
                    console.log("Replacing @ symbol before inserting dir widget."); // Debug log
                }
            }
            // Wrap the widget and additional nodes in a fragment for cleaner insertion
            const fragment = document.createDocumentFragment();
            fragment.appendChild(widgetElement);
            fragment.appendChild(zeroWidthSpace);
            fragment.appendChild(spaceNode);
            // Delete any selected content (including @ if found)
            range.deleteContents();
            // Insert the fragment with all elements
            range.insertNode(fragment);
            // Explicitly move cursor after the inserted space node
            const newRange = document.createRange();
            newRange.setStartAfter(spaceNode);
            newRange.setEndAfter(spaceNode);
            winSelection.removeAllRanges();
            winSelection.addRange(newRange);
            // Trigger input event manually
            this.chatInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        }
        catch (error) {
            console.error('Error handling insert directory widget:', error);
        }
    }
    // NEW method for inserting Cell widgets from Popup
    handleInsertCellWidgetFromPopup(cellIndex) {
        var _a, _b, _c;
        const currentNotebookWidget = (_a = globals_1.globals.notebookTracker) === null || _a === void 0 ? void 0 : _a.currentWidget;
        if (!currentNotebookWidget) {
            console.error('Cannot insert cell widget: Missing notebook context.');
            return;
        }
        try {
            // 1. Gather Context (Notebook Name)
            const notebookPath = currentNotebookWidget.context.path;
            const notebookName = ((_b = notebookPath.split('/').pop()) === null || _b === void 0 ? void 0 : _b.split('.')[0]) || 'notebook';
            // Provided cellIndex is 0-based already
            if (cellIndex === undefined || cellIndex === null || cellIndex < 0) {
                console.error(`Cannot insert cell widget: Invalid cell index ${cellIndex}.`);
                return;
            }
            // 2. Add Cell Reference to Map and get data
            const refId = this.addCellReference(notebookName, cellIndex);
            if (!refId) {
                console.error('Failed to add cell reference to map for index:', cellIndex);
                return; // Stop if we couldn't create the reference data
            }
            const refData = this.codeRefMap.get(refId);
            if (!refData) {
                console.error(`Failed to retrieve data for cell reference ${refId}.`);
                return;
            }
            // ADDED: Construct placeholder
            const placeholder = `@Cell[${cellIndex + 1}]`;
            // 3. Insert RENDERED WIDGET Representation into Input Field
            this.chatInput.focus(); // Ensure focus
            const winSelection = window.getSelection();
            if (!winSelection || winSelection.rangeCount === 0) {
                console.error('Cannot insert cell widget: No window selection found.');
                return;
            }
            const range = winSelection.getRangeAt(0);
            // Render the widget - Pass placeholder
            const widgetElement = (0, message_renderer_1.renderReferenceWidgetInline)('cell', refData, placeholder, refId);
            const zeroWidthSpace = document.createTextNode('\u200B');
            const spaceNode = document.createTextNode(' ');
            // Check if the character before the cursor is '@' and replace it
            let replacedAtSymbol = false;
            if (range.startOffset > 0 && range.startContainer.nodeType === Node.TEXT_NODE) {
                const textBefore = (_c = range.startContainer.textContent) === null || _c === void 0 ? void 0 : _c.substring(0, range.startOffset);
                if (textBefore === null || textBefore === void 0 ? void 0 : textBefore.endsWith('@')) {
                    range.setStart(range.startContainer, range.startOffset - 1);
                    replacedAtSymbol = true;
                    console.log("Replacing @ symbol before inserting cell widget.");
                }
            }
            // Create a fragment to hold our nodes in the correct order
            const fragment = document.createDocumentFragment();
            fragment.appendChild(widgetElement);
            fragment.appendChild(zeroWidthSpace);
            fragment.appendChild(spaceNode);
            // Delete any selected content (including @ if found)
            range.deleteContents();
            // Insert all elements at once in the correct order
            range.insertNode(fragment);
            // Move cursor after the zero-width space
            range.setStartAfter(spaceNode);
            range.setEndAfter(spaceNode);
            winSelection.removeAllRanges();
            winSelection.addRange(range);
            // Trigger input event manually
            this.chatInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        }
        catch (error) {
            console.error('Error handling insert cell widget from popup:', error);
        }
    }
    // NEW method for inserting Code widgets from Popup (via insertCollapsedCodeRef callback)
    handleInsertCodeWidgetFromPopup(codeContent, notebookName, cellIndex, lineNumber // Assumes start line = end line from popup callback
    ) {
        var _a;
        try {
            // 1. Create Ref Data (assume start=end line)
            const lineEndNumber = lineNumber;
            const refData = {
                type: 'code',
                content: codeContent,
                notebookName,
                cellIndex,
                lineNumber,
                lineEndNumber
            };
            const refId = `ref-${this.nextRefId++}`;
            this.codeRefMap.set(refId, refData);
            console.log(`Added code reference via popup: ${refId}`);
            // ADDED: Construct placeholder
            const placeholder = `@code[${refId}]`;
            // 2. Insert RENDERED WIDGET Representation into Input Field
            this.chatInput.focus(); // Ensure focus
            const winSelection = window.getSelection();
            if (!winSelection || winSelection.rangeCount === 0) {
                console.error('Cannot insert code widget: No window selection found.');
                return;
            }
            const range = winSelection.getRangeAt(0);
            // Render the widget - Pass placeholder
            const widgetElement = (0, message_renderer_1.renderReferenceWidgetInline)('code', refData, placeholder, refId);
            const zeroWidthSpace = document.createTextNode('\u200B');
            const spaceNode = document.createTextNode(' ');
            // Check if the character before the cursor is '@' and replace it
            let replacedAtSymbol = false;
            if (range.startOffset > 0 && range.startContainer.nodeType === Node.TEXT_NODE) {
                const textBefore = (_a = range.startContainer.textContent) === null || _a === void 0 ? void 0 : _a.substring(0, range.startOffset);
                if (textBefore === null || textBefore === void 0 ? void 0 : textBefore.endsWith('@')) {
                    range.setStart(range.startContainer, range.startOffset - 1);
                    replacedAtSymbol = true;
                    console.log("Replacing @ symbol before inserting code widget.");
                }
            }
            // Create a fragment to hold our nodes in the correct order
            const fragment = document.createDocumentFragment();
            fragment.appendChild(widgetElement);
            fragment.appendChild(zeroWidthSpace);
            fragment.appendChild(spaceNode);
            // Delete any selected content (including @ if found)
            range.deleteContents();
            // Insert all elements at once in the correct order
            range.insertNode(fragment);
            // Move cursor after the zero-width space
            range.setStartAfter(spaceNode);
            range.setEndAfter(spaceNode);
            winSelection.removeAllRanges();
            winSelection.addRange(range);
            // Trigger input event manually
            this.chatInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        }
        catch (error) {
            console.error('Error handling insert code widget from popup:', error);
        }
    }
    // NEW method to serialize input content, converting widgets back to placeholders
    _serializeInputContent() {
        let serialized = '';
        const nodes = this.chatInput.childNodes;
        nodes.forEach(node => {
            var _a;
            if (node.nodeType === Node.TEXT_NODE) {
                // Append text content directly
                serialized += node.textContent || '';
            }
            else if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node;
                // Check if it's our widget span
                if ((_a = element.classList) === null || _a === void 0 ? void 0 : _a.contains('jp-llm-ext-ref-widget')) {
                    // Append the stored placeholder text
                    const placeholder = element.dataset.placeholder;
                    if (placeholder) {
                        serialized += placeholder;
                    }
                    else {
                        // Fallback: append the visible text if placeholder is missing (shouldn't happen)
                        console.warn('Widget found without data-placeholder:', element);
                        serialized += element.textContent || '';
                    }
                }
                else if (element.tagName === 'BR') {
                    // Handle <br> as newline
                    serialized += '\n';
                }
                else if (element.tagName === 'DIV') {
                    // Handle <div> elements, potentially introduced by pasting or Shift+Enter
                    // Recursively serialize or just add newline?
                    // Add newline before and serialize inner content recursively?
                    // For now, let's treat div boundaries as potential newlines, similar to <br>
                    // We might need a more robust HTML -> text conversion later
                    serialized += '\n'; // Simplified handling
                }
                else {
                    // Append text content of other unknown elements?
                    serialized += element.textContent || '';
                }
            }
        });
        // Trim potentially leading/trailing whitespace introduced during serialization
        // or by the structure of the contenteditable div
        return serialized.trim();
    }
    showWidgetPreview(widgetElement, content) {
        // Remove existing preview first
        this.removeWidgetPreview();
        console.log('Showing preview for widget:', widgetElement);
        const firstThreeLines = content.split('\n').slice(0, 3).join('\n');
        const preview = document.createElement('div');
        preview.className = 'jp-llm-ext-widget-preview';
        // Basic styling (move to CSS later)
        preview.style.position = 'absolute';
        preview.style.border = '1px solid var(--jp-border-color1)';
        preview.style.background = 'var(--jp-layout-color0)';
        preview.style.padding = '5px';
        preview.style.fontSize = '0.9em';
        preview.style.maxWidth = '400px';
        preview.style.maxHeight = '100px';
        preview.style.overflow = 'hidden';
        preview.style.whiteSpace = 'pre-wrap'; // Preserve whitespace and newlines
        preview.style.fontFamily = 'monospace';
        preview.style.zIndex = '10000'; // Ensure it's on top
        preview.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        preview.textContent = firstThreeLines + (content.split('\n').length > 3 ? '\n...' : '');
        // Position near the widget
        const widgetRect = widgetElement.getBoundingClientRect();
        // Position above the widget for now
        preview.style.bottom = `${window.innerHeight - widgetRect.top + 5}px`;
        preview.style.left = `${widgetRect.left}px`;
        document.body.appendChild(preview); // Append to body to avoid layout issues
        this.activePreviewElement = preview;
    }
    removeWidgetPreview() {
        if (this.activePreviewElement) {
            console.log('Removing active preview');
            this.activePreviewElement.remove();
            this.activePreviewElement = null;
        }
    }
    /**
      // Handle @ symbol removal to hide popup using selection API
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;
  
      const range = selection.getRangeAt(0);
      // Check if the input field contains the start of the range
      if (!this.chatInput.contains(range.startContainer)) return;
  
      const cursorPosition = getCaretPosition(this.chatInput); // Use helper
      if (cursorPosition === null) return;
  
      const textContent = this.chatInput.textContent || '';
      const textBeforeCursor = textContent.slice(0, cursorPosition);
  
      // Check if the character immediately before the cursor is '@'
      // and if it's preceded by whitespace or is at the start of the input.
      const isAtSymbolContext = textBeforeCursor.endsWith('@') &&
                             (cursorPosition === 1 ||
                              cursorPosition > 1 && /\s/.test(textBeforeCursor[cursorPosition - 2]));
  
      if (this.hasAtSymbol && !isAtSymbolContext) {
        // @ symbol context was present but now it's gone, hide the popup
        this.callbacks.hidePopupMenu();
      }
      // Update the state *after* checking the previous state
      this.hasAtSymbol = isAtSymbolContext;
  
      // --- Auto-resize logic (optional) ---
      // Simple auto-resize based on scroll height (might need refinement)
      if (!this.isInputExpanded) { // Only auto-resize if not manually expanded
          this.chatInput.style.height = 'auto'; // Temporarily shrink to content
          const scrollHeight = this.chatInput.scrollHeight;
          // Set a max height to prevent infinite growth, e.g., 150px
          const maxHeight = 150;
          const newHeight = Math.min(scrollHeight, maxHeight);
           // Only update height if it actually changes to avoid flicker
          if (this.chatInput.offsetHeight < newHeight) {
               this.chatInput.style.height = `${newHeight}px`;
               this.chatInput.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
          } else if (scrollHeight <= this.chatInput.clientHeight) {
              // Shrink if content height is less than current height
              this.chatInput.style.height = `${scrollHeight}px`;
              this.chatInput.style.overflowY = 'hidden';
          }
      }
      // -----------------------------------
    };
    
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
     * Accepts the message text.
     */
    handleSendMessage(message, isMarkdown = false) {
        if (message.trim() === '') {
            console.log('Ignoring empty message');
            return;
        }
        // Add user message to UI
        this.addMessage({
            sender: 'user',
            content: message,
            timestamp: Date.now(),
            isMarkdown
        });
        // Clear input field
        this.inputHandler.clearInput();
        // Stream the response and handle the bot message
        this.streamAndRenderResponse(message);
    }
    /**
     * Sends an automatic message (e.g., 'confirmed', 'rejected')
     * to the backend and handles the streaming response.
     * Also adds the user's confirmation/rejection action and a separator to the UI.
     */
    handleSendAutoMessage(message) {
        if (!message || !['confirmed', 'rejected'].includes(message.toLowerCase())) {
            console.warn(`Invalid auto message: "${message}"`);
            return;
        }
        // Add user action notification (not as a regular message)
        const actionMessage = document.createElement('div');
        actionMessage.className = 'jp-llm-ext-status-message';
        actionMessage.textContent = message === 'confirmed' ?
            'You confirmed the interrupt' : 'You rejected the interrupt';
        this.uiManager.addChatMessageElement(actionMessage);
        // Add separator
        const separator = document.createElement('hr');
        separator.className = 'jp-llm-ext-chat-separator';
        this.uiManager.addChatMessageElement(separator);
        // Send auto message to API and stream the response
        this.streamAndRenderResponse(message);
    }
    /**
     * Adds a message to the UI via UIManager and saves to ChatState.
     */
    addMessage(message) {
        // Add to UI via UIManager
        const messageElement = message.sender === 'user'
            ? (0, message_renderer_1.renderUserMessage)(message.content, { isMarkdown: message.isMarkdown }, this.rendererCallbacks)
            : (0, message_renderer_1.renderBotMessage)(message.content, { isMarkdown: !!message.isMarkdown }, this.rendererCallbacks);
        // Add to the message container
        this.uiManager.addChatMessageElement(messageElement);
        this.uiManager.scrollToBottom();
        // Add to chat state
        this.chatState.addMessageToCurrentChat(message);
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
        // Get the thread_id from the current chat
        const thread_id = this.chatState.getCurrentChatThreadId();
        // Debug info
        console.log('MessageHandler.streamAndRenderResponse - Thread ID:', thread_id);
        console.log('MessageHandler.streamAndRenderResponse - Context:', { cellContext, thread_id });
        // Stream response from API
        this.apiClient.streamChat(messageToSend, { cellContext, thread_id }, 
        // On chunk received
        (chunk) => {
            completeResponse += chunk;
            // Update the temporary streaming div
            streamingDiv.textContent = completeResponse;
            this.uiManager.scrollToBottom();
        }, 
        // On complete
        () => {
            // For image responses, the contentDiv is updated directly by the renderer
            // For text/markdown, we compile and save the complete response
            // Hide streaming div, show final content div
            streamingDiv.style.display = 'none';
            contentDiv.style.display = 'block';
            // Render the complete response using the renderer function
            const renderedContent = (0, message_renderer_1.renderBotMessage)(completeResponse, { isMarkdown: true }, this.rendererCallbacks);
            contentDiv.innerHTML = ''; // Clear placeholder/previous content
            // Append rendered content
            while (renderedContent.firstChild) {
                contentDiv.appendChild(renderedContent.firstChild);
            }
            this.uiManager.scrollToBottom();
            // Save the bot message in chat state
            this.chatState.addMessageToCurrentChat({
                sender: 'bot',
                content: completeResponse,
                timestamp: Date.now(),
                isMarkdown: true // Bot responses are rendered as Markdown by default
            });
            console.log(`[MessageHandler] Response completed (${completeResponse.length} chars)`);
        }, 
        // On error
        (error) => {
            console.error('Error streaming chat response:', error);
            // We should render an error message to the user here
            contentDiv.textContent = `Error: ${error.message}`;
            streamingDiv.style.display = 'none';
            contentDiv.style.display = 'block';
            contentDiv.style.color = 'red';
        });
    }
}
exports.MessageHandler = MessageHandler;


/***/ }),

/***/ "./lib/handlers/note-handler.js":
/*!**************************************!*\
  !*** ./lib/handlers/note-handler.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NoteHandler = void 0;
const note_modal_1 = __webpack_require__(/*! ../ui/note-modal */ "./lib/ui/note-modal.js");
const markdown_1 = __webpack_require__(/*! ../utils/markdown */ "./lib/utils/markdown.js");
/**
 * Manages the notes UI and interactions.
 */
class NoteHandler {
    /**
     * Creates a new NoteHandler.
     * @param noteState The note state.
     * @param uiManager The UI manager.
     * @param callbacks Callbacks for note changes.
     * @param parentNode The parent node where the note handler will append its elements.
     */
    constructor(noteState, uiManager, callbacks, parentNode) {
        this.noteState = noteState;
        this.uiManager = uiManager;
        this.callbacks = callbacks;
        this.parentNode = parentNode;
        this.selectedNoteId = null;
        this.isNotesViewVisible = false;
        // Create main container for notes
        this.notesContainer = document.createElement('div');
        this.notesContainer.className = 'jp-llm-ext-notes-container';
        this.notesContainer.style.display = 'none';
        // Create container for the note list
        this.noteListContainer = document.createElement('div');
        this.noteListContainer.className = 'jp-llm-ext-note-list-container';
        // Create container for note content
        this.noteContentContainer = document.createElement('div');
        this.noteContentContainer.className = 'jp-llm-ext-note-content-container';
        // Create container for the note modal
        this.noteModalContainer = document.createElement('div');
        this.noteModalContainer.className = 'jp-llm-ext-note-modal-container';
        // Append the modal container to the parent node (not inside the notes container)
        // This allows the modal to appear as an overlay on the entire UI
        this.parentNode.appendChild(this.noteModalContainer);
        // Initialize the notes view
        this.initializeNotesView();
    }
    /**
     * Initializes the notes view with header, list and content sections.
     */
    initializeNotesView() {
        // Create header
        const header = document.createElement('div');
        header.className = 'jp-llm-ext-notes-header';
        // Create back button
        const backButton = document.createElement('button');
        backButton.className = 'jp-Button jp-llm-ext-back-button';
        backButton.innerHTML = '<span class="jp-icon3 jp-icon-selectable" role="presentation"><svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg></span>';
        backButton.title = 'Back to chat';
        backButton.addEventListener('click', () => this.hideNotesView());
        const title = document.createElement('h2');
        title.textContent = 'Notes';
        const addButton = document.createElement('button');
        addButton.className = 'jp-Button jp-llm-ext-add-note-button';
        addButton.textContent = 'Add Note';
        addButton.addEventListener('click', () => this.showAddNoteModal());
        header.appendChild(backButton);
        header.appendChild(title);
        header.appendChild(addButton);
        // Create flex container for list and content
        const flexContainer = document.createElement('div');
        flexContainer.className = 'jp-llm-ext-notes-flex-container';
        flexContainer.appendChild(this.noteListContainer);
        flexContainer.appendChild(this.noteContentContainer);
        // Add components to the main container
        this.notesContainer.appendChild(header);
        this.notesContainer.appendChild(flexContainer);
        // Initial render of notes
        this.renderNotes();
    }
    /**
     * Shows the add note modal.
     */
    showAddNoteModal() {
        const modalCallbacks = {
            handleSave: (title, content) => {
                this.noteState.createNewNote(title, content);
                this.renderNotes();
                this.hideNoteModal();
                this.onNoteChange();
            },
            handleCancel: () => {
                this.hideNoteModal();
            }
        };
        const modal = (0, note_modal_1.createNoteModalElement)(modalCallbacks);
        this.showModal(modal);
    }
    /**
     * Shows the edit note modal for a specific note.
     * @param note The note to edit.
     */
    showEditNoteModal(note) {
        const modalCallbacks = {
            handleSave: (title, content) => {
                this.noteState.updateNote(note.id, title, content);
                this.renderNotes();
                this.hideNoteModal();
                if (this.selectedNoteId === note.id) {
                    this.showNoteContent(note.id);
                }
                this.onNoteChange();
            },
            handleCancel: () => {
                this.hideNoteModal();
            }
        };
        const modal = (0, note_modal_1.createNoteModalElement)(modalCallbacks, note.title, note.content);
        this.showModal(modal);
    }
    /**
     * Called when a note is changed. Updates the UI title if needed.
     */
    onNoteChange() {
        // Check if a note is selected and update the title input
        const currentNote = this.noteState.getNoteById(this.selectedNoteId || '');
        if (currentNote && this.callbacks.updateTitleInput) {
            this.callbacks.updateTitleInput(currentNote.title);
        }
    }
    /**
     * Shows a modal in the note modal container.
     * @param modal The modal element to show.
     */
    showModal(modal) {
        // Clear any existing modal
        this.noteModalContainer.innerHTML = '';
        // Add the new modal
        this.noteModalContainer.appendChild(modal);
        // Show the modal container
        this.noteModalContainer.style.display = 'block';
    }
    /**
     * Hides the note modal.
     */
    hideNoteModal() {
        this.noteModalContainer.style.display = 'none';
        this.noteModalContainer.innerHTML = '';
    }
    /**
     * Renders the list of notes.
     */
    renderNotes() {
        // Clear the current list
        this.noteListContainer.innerHTML = '';
        // Get all notes
        const notes = this.noteState.getAllNotes();
        if (notes.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'jp-llm-ext-note-empty-message';
            emptyMessage.textContent = 'No notes yet. Click "Add Note" to create one.';
            this.noteListContainer.appendChild(emptyMessage);
            return;
        }
        // Create list
        const notesList = document.createElement('ul');
        notesList.className = 'jp-llm-ext-note-list';
        // Add each note to the list
        notes.forEach((note) => {
            const noteItem = document.createElement('li');
            noteItem.className = 'jp-llm-ext-note-item';
            if (this.selectedNoteId === note.id) {
                noteItem.classList.add('jp-llm-ext-note-item-selected');
            }
            // Note content (title and actions)
            const noteContent = document.createElement('div');
            noteContent.className = 'jp-llm-ext-note-item-content';
            const noteTitle = document.createElement('span');
            noteTitle.className = 'jp-llm-ext-note-item-title';
            noteTitle.textContent = note.title;
            const noteActions = document.createElement('div');
            noteActions.className = 'jp-llm-ext-note-item-actions';
            const editButton = document.createElement('button');
            editButton.className = 'jp-Button jp-llm-ext-note-edit-button';
            editButton.innerHTML = '<span class="jp-icon3 jp-icon-selectable" role="presentation"><svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg></span>';
            editButton.title = 'Edit note';
            editButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent note selection
                this.showEditNoteModal(note);
            });
            const deleteButton = document.createElement('button');
            deleteButton.className = 'jp-Button jp-llm-ext-note-delete-button';
            deleteButton.innerHTML = '<span class="jp-icon3 jp-icon-selectable" role="presentation"><svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></span>';
            deleteButton.title = 'Delete note';
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent note selection
                if (confirm(`Are you sure you want to delete the note "${note.title}"?`)) {
                    this.noteState.deleteNote(note.id);
                    // If the deleted note was selected, clear the content container
                    if (this.selectedNoteId === note.id) {
                        this.selectedNoteId = null;
                        this.noteContentContainer.innerHTML = '';
                    }
                    this.renderNotes();
                    this.onNoteChange();
                }
            });
            noteActions.appendChild(editButton);
            noteActions.appendChild(deleteButton);
            noteContent.appendChild(noteTitle);
            noteContent.appendChild(noteActions);
            noteItem.appendChild(noteContent);
            // Add click event to show the note content
            noteItem.addEventListener('click', () => {
                this.showNoteContent(note.id);
            });
            notesList.appendChild(noteItem);
        });
        this.noteListContainer.appendChild(notesList);
    }
    /**
     * Shows the content of a specific note.
     * @param noteId The ID of the note to show.
     */
    showNoteContent(noteId) {
        // Set as selected
        this.selectedNoteId = noteId;
        // Re-render notes to update selection
        this.renderNotes();
        // Clear current content
        this.noteContentContainer.innerHTML = '';
        // Get the note
        const note = this.noteState.getNoteById(noteId);
        if (!note)
            return;
        // Create content container
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'jp-llm-ext-note-content-wrapper';
        // Note title
        const title = document.createElement('h3');
        title.className = 'jp-llm-ext-note-content-title';
        title.textContent = note.title;
        contentWrapper.appendChild(title);
        // Note content
        const content = document.createElement('div');
        content.className = 'jp-llm-ext-note-content-text jp-RenderedMarkdown';
        // Render markdown content
        content.innerHTML = (0, markdown_1.renderMarkdown)(note.content);
        contentWrapper.appendChild(content);
        this.noteContentContainer.appendChild(contentWrapper);
        // Update the title in parent UI if callback exists
        if (this.callbacks.updateTitleInput) {
            this.callbacks.updateTitleInput(note.title);
        }
    }
    /**
     * Toggles visibility of the notes view.
     */
    toggleNotesView() {
        this.isNotesViewVisible = !this.isNotesViewVisible;
        if (this.isNotesViewVisible) {
            this.showNotesView();
        }
        else {
            this.hideNotesView();
        }
    }
    /**
     * Shows the notes view.
     */
    showNotesView() {
        this.notesContainer.style.display = 'flex';
        this.isNotesViewVisible = true;
        // Use UIManager to properly hide message containers and show notes view
        this.uiManager.showNotesView();
        // Find any other message containers that might be visible and hide them
        const allMessageContainers = document.querySelectorAll('.jp-llm-ext-message-container');
        allMessageContainers.forEach(container => {
            container.style.display = 'none';
        });
    }
    /**
     * Hides the notes view.
     */
    hideNotesView() {
        this.notesContainer.style.display = 'none';
        this.isNotesViewVisible = false;
        // Use UIManager to show the chat view again
        this.uiManager.showChatView();
    }
    /**
     * Returns the notes container.
     * @returns The notes container element.
     */
    getContainer() {
        return this.notesContainer;
    }
}
exports.NoteHandler = NoteHandler;


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
        this.popupMenuContainer.style.position = 'absolute'; // Crucial for positioning relative to widgetNode
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
                    // Select first item on Enter
                    const menuItems = this.getMenuItems();
                    if (menuItems.length > 0) {
                        // If we already have a selection, click it
                        if (this.selectedMenuItemIndex >= 0 && this.selectedMenuItemIndex < menuItems.length) {
                            menuItems[this.selectedMenuItemIndex].click();
                        }
                        else {
                            // Otherwise, select and click the first item
                            this.selectedMenuItemIndex = 0;
                            this.updateSelectionHighlight();
                            menuItems[0].click();
                        }
                    }
                }
                else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                    const menuItems = this.getMenuItems();
                    if (menuItems.length > 0) {
                        const direction = event.key === 'ArrowDown' ? 1 : -1;
                        // If no selection yet, select first or last based on direction
                        if (this.selectedMenuItemIndex < 0) {
                            this.selectedMenuItemIndex = direction > 0 ? 0 : menuItems.length - 1;
                        }
                        else {
                            // Otherwise move in the specified direction with wraparound
                            this.selectedMenuItemIndex = (this.selectedMenuItemIndex + direction + menuItems.length) % menuItems.length;
                        }
                        this.updateSelectionHighlight();
                        // Keep focus in search input but update selection visually
                        this.searchInput.focus();
                    }
                }
                event.preventDefault();
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
    async showPopupMenu(trigger) {
        let anchorX;
        let anchorY;
        if (trigger instanceof HTMLElement) {
            const rect = trigger.getBoundingClientRect();
            anchorX = rect.left; // Use button's top-left for anchor
            anchorY = rect.top;
            console.log(`POPUP: Showing menu triggered by element at (${anchorX}, ${anchorY})`);
        }
        else {
            anchorX = trigger.x;
            anchorY = trigger.y;
            console.log(`POPUP: Showing menu triggered by coordinates at (${anchorX}, ${anchorY})`);
        }
        // Store the calculated anchor point for positioning
        this._anchorX = anchorX;
        this._anchorY = anchorY;
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
        // Add keydown listener when showing
        document.addEventListener('keydown', this.boundHandleKeyDown, true);
        // Position the popup menu - DEFER calculation slightly
        setTimeout(() => {
            console.log("POPUP: Deferred updatePopupPosition call.");
            try {
                this.updatePopupPosition();
            }
            catch (error) {
                console.error("POPUP: Error during deferred updatePopupPosition:", error);
            }
            // Focus the search input *after* positioning if in file/dir view
            // Otherwise, focus first menu item
            if (this.currentMenuLevel === 'files' || this.currentMenuLevel === 'directories') {
                this.searchInput.focus();
                console.log('POPUP: Focused search input after deferred positioning.');
                this.selectedMenuItemIndex = -1; // Don't select an item if search is focused
            }
            else { // Top level or cells
                this.selectedMenuItemIndex = -1;
                this.selectNextMenuItem(); // Select first item
                console.log('POPUP: Selected first menu item');
            }
        }, 0); // 0ms delay is usually sufficient
    }
    hidePopupMenu() {
        if (this.popupMenuContainer.style.display !== 'none') {
            console.log('POPUP: Hiding menu. Called from:', new Error().stack);
            this.popupMenuContainer.style.display = 'none';
            this.currentMenuLevel = 'top'; // Reset level
            // Remove keydown listener when hiding
            document.removeEventListener('keydown', this.boundHandleKeyDown, true);
            console.log("POPUP: Removed keydown listener.");
            // Clear anchors
            this._anchorX = undefined;
            this._anchorY = undefined;
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
            // Only add search input if NOT at top level
            if (this.currentMenuLevel !== 'top') {
                // Add search input at the top of the menu
                this.popupMenuContainer.appendChild(this.searchInput);
                this.searchInput.value = ''; // Clear for file/dir/cell levels
                this.lastSearchTerm = '';
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
            // Update the position (might have changed due to content rendering)
            console.log("POPUP: ===> About to call updatePopupPosition after renderMenuContent");
            try {
                this.updatePopupPosition();
            }
            catch (err) {
                console.error("POPUP: Error calling updatePopupPosition after render:", err);
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
        // Add mouse events to coordinate with keyboard navigation
        item.onmouseover = () => {
            // Find index of this item
            const menuItems = this.getMenuItems();
            const index = menuItems.indexOf(item);
            if (index !== -1) {
                this.selectedMenuItemIndex = index;
                this.updateSelectionHighlight();
            }
        };
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
                    if (!isNaN(cellIndex)) {
                        // Construct the reference text (e.g., "@Cell 3")
                        // const refText = `@Cell ${cellIndex + 1}`; // Use 1-based index for display
                        // console.log("TODO: Implement cell reference insertion: ", refText);
                        this.callbacks.insertCellByIndex(cellIndex); // Call the appropriate callback
                        this.hidePopupMenu();
                    }
                    else {
                        console.error('POPUP: Invalid cell index.');
                    }
                }
                else {
                    console.error('POPUP: Cell selected but index (path) is missing.');
                }
                break;
            case 'select-file':
                if (path) {
                    // Construct the reference text (e.g., "@file path/to/file.py")
                    // const refText = `@file ${path}`;
                    // console.log("TODO: Implement file reference insertion: ", refText);
                    this.callbacks.handleInsertFileWidget(path); // NEW: Call widget insertion callback
                    this.hidePopupMenu();
                }
                else {
                    console.error('POPUP: File selected but path is missing.');
                }
                break;
            case 'select-directory':
                if (path) {
                    this.callbacks.handleInsertDirWidget(path); // NEW: Call widget insertion callback
                    this.hidePopupMenu();
                }
                else {
                    console.error('POPUP: Directory selected but path is missing.');
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
                    // Construct the reference text (e.g., "@dir path/to/directory")
                    // const refText = `@dir ${path}`;
                    // console.log("TODO: Implement directory reference insertion: ", refText);
                    this.callbacks.handleInsertDirWidget(path); // Corrected to use the new widget insertion callback
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
                console.log('POPUP: Unknown menu action:', actionId);
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
                    setTimeout(() => {
                        this.searchInput.focus();
                        // Move cursor to end of input text
                        const length = this.searchInput.value.length;
                        this.searchInput.setSelectionRange(length, length);
                    }, 0);
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
        const lastSlash = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
        if (lastSlash === -1)
            return ''; // No directory part, likely root or just a filename
        return path.substring(0, lastSlash);
    }
    /**
     * Handle keyboard navigation when the popup menu is shown
     */
    handleKeyDown(event) {
        if (this.popupMenuContainer.style.display === 'none')
            return;
        console.log(`POPUP (Document): KeyDown intercepted. Key='${event.key}'`);
        // Prioritize search input if focused
        if (document.activeElement === this.searchInput) {
            console.log('POPUP (Document): KeyDown - Search input is focused, letting it handle.');
            // Handle Tab and arrow keys specifically to move focus out of search
            if (event.key === 'Tab' || event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                console.log(`POPUP (Document): Key='${event.key}' in search input - moving focus.`);
                // Instead of blurring, let's handle arrows directly in the input
                if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                    const direction = event.key === 'ArrowDown' ? 1 : -1;
                    const menuItems = this.getMenuItems();
                    // If no items selected yet, select first/last based on direction
                    if (this.selectedMenuItemIndex < 0) {
                        this.selectedMenuItemIndex = direction > 0 ? 0 : menuItems.length - 1;
                    }
                    else {
                        // Move selection in specified direction
                        this.selectedMenuItemIndex =
                            (this.selectedMenuItemIndex + direction + menuItems.length) % menuItems.length;
                    }
                    this.updateSelectionHighlight();
                    // Keep search input focused
                    this.searchInput.focus();
                }
                else if (event.key === 'Tab') {
                    // Tab should select next item but keep search focused
                    this.selectNextMenuItem();
                    this.searchInput.focus();
                }
                event.preventDefault(); // Prevent default Tab behavior
                event.stopPropagation();
                return;
            }
            // Let other keys (like Escape, Enter) be handled by the search input's own listener
            return;
        }
        // Handle navigation if search is not focused
        if (['ArrowUp', 'ArrowDown', 'Enter', 'Tab', 'Escape'].includes(event.key)) {
            console.log('POPUP (Document): Handling navigation key:', event.key);
            event.preventDefault();
            event.stopPropagation();
            this.processMenuNavigation(event.key);
        }
        else {
            // If typing characters and NOT in search input, focus search and add the character
            if (this.currentMenuLevel === 'files' || this.currentMenuLevel === 'directories' || this.currentMenuLevel === 'cells') {
                if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
                    console.log('POPUP (Document): Focusing search input due to character typed.');
                    this.searchInput.focus();
                    // Append the typed character to search input if it's a printable character
                    if (event.key.match(/^[\w\d\s.,\-_=+;:'"\[\]{}()*&^%$#@!~`|\\/<>?]$/)) {
                        this.searchInput.value += event.key;
                        // Trigger search input's 'input' event to update filtering
                        this.searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
        }
    }
    processMenuNavigation(key) {
        switch (key) {
            case 'ArrowDown':
                console.log('POPUP: Arrow Down pressed');
                this.selectNextMenuItem();
                break;
            case 'ArrowUp':
                console.log('POPUP: Arrow Up pressed');
                this.selectPreviousMenuItem();
                break;
            case 'Enter':
            case 'Tab': // Treat Tab like Enter for selection
                console.log(`POPUP: ${key} pressed`);
                if (this.selectedMenuItemIndex >= 0) {
                    const menuItems = this.getMenuItems();
                    if (this.selectedMenuItemIndex < menuItems.length) {
                        console.log('POPUP: Simulating click on selected item:', menuItems[this.selectedMenuItemIndex].textContent);
                        // Simulate click to trigger handleMenuClick
                        menuItems[this.selectedMenuItemIndex].click();
                    }
                    else {
                        console.log('POPUP: Selected index out of bounds?');
                    }
                }
                else {
                    console.log('POPUP: Enter/Tab pressed but no item selected');
                    // If no item is selected, select the first one and activate
                    const menuItems = this.getMenuItems();
                    if (menuItems.length > 0) {
                        this.selectedMenuItemIndex = 0;
                        this.updateSelectionHighlight();
                        // With Enter, always activate the newly selected item
                        if (key === 'Enter') {
                            menuItems[0].click(); // Activate first item
                        }
                    }
                }
                break;
            case 'Escape':
                console.log('POPUP: Escape pressed');
                // If in a submenu, navigate back; otherwise, hide.
                if (this.menuHistory.length > 0) {
                    this.navigateBackMenu();
                }
                else {
                    this.hidePopupMenu();
                }
                break;
        }
    }
    updateSelectionHighlight() {
        const menuItems = this.getMenuItems();
        // Handle out-of-bounds index
        if (this.selectedMenuItemIndex >= menuItems.length) {
            this.selectedMenuItemIndex = menuItems.length - 1;
        }
        menuItems.forEach((item, index) => {
            if (index === this.selectedMenuItemIndex) {
                item.classList.add('jp-llm-ext-popup-menu-item-selected');
                // Scroll into view if necessary
                item.scrollIntoView({ block: 'nearest' });
            }
            else {
                item.classList.remove('jp-llm-ext-popup-menu-item-selected');
            }
        });
    }
    deselectAllMenuItems() {
        const menuItems = this.getMenuItems();
        menuItems.forEach(item => {
            item.classList.remove('jp-llm-ext-popup-menu-item-selected');
        });
        this.selectedMenuItemIndex = -1;
    }
    selectNextMenuItem() {
        const menuItems = this.getMenuItems();
        if (menuItems.length === 0)
            return;
        this.selectedMenuItemIndex++;
        if (this.selectedMenuItemIndex >= menuItems.length) {
            this.selectedMenuItemIndex = 0; // Wrap around
        }
        this.updateSelectionHighlight();
        console.log(`POPUP: Selected item index: ${this.selectedMenuItemIndex}`);
    }
    selectPreviousMenuItem() {
        const menuItems = this.getMenuItems();
        if (menuItems.length === 0)
            return;
        this.selectedMenuItemIndex--;
        if (this.selectedMenuItemIndex < 0) {
            this.selectedMenuItemIndex = menuItems.length - 1; // Wrap around
        }
        this.updateSelectionHighlight();
        console.log(`POPUP: Selected item index: ${this.selectedMenuItemIndex}`);
    }
    /**
     * Get all interactive menu items currently displayed
     */
    getMenuItems() {
        return Array.from(this.popupMenuContainer.querySelectorAll('.jp-llm-ext-popup-menu-item'));
    }
    /**
     * Updates the position of the popup menu based on the active reference range
     * or the initial anchor point. Tries to position the BOTTOM-LEFT corner of the menu
     * just AT THE TOP-LEFT corner of the range/anchor.
     */
    updatePopupPosition() {
        if (!this.widgetNode || this._anchorX === undefined || this._anchorY === undefined) {
            console.warn("POPUP: Cannot update position - missing widgetNode or anchor points.");
            return;
        }
        const widgetRect = this.widgetNode.getBoundingClientRect();
        // Target position is the viewport-relative anchor point
        const targetTop = this._anchorY;
        const targetLeft = this._anchorX;
        console.log(`POPUP: Positioning relative to anchor: (${targetLeft}, ${targetTop})`);
        // Make sure the popup is visible and rendered to get its dimensions
        // Use visibility to prevent flicker while measuring
        this.popupMenuContainer.style.visibility = 'hidden';
        this.popupMenuContainer.style.display = 'block';
        const popupHeight = this.popupMenuContainer.offsetHeight;
        const popupWidth = this.popupMenuContainer.offsetWidth;
        if (popupHeight === 0 || popupWidth === 0) {
            console.warn("POPUP: Cannot update position - popup dimensions are zero.");
            this.popupMenuContainer.style.display = 'none'; // Hide if dimensions are invalid
            return;
        }
        // Calculate desired viewport coordinates for popup's top-left
        // Goal: popup bottom-left = anchor top-left
        // popup top = anchor top - popup height
        // popup left = anchor left
        let desiredTop = targetTop - popupHeight;
        let desiredLeft = targetLeft;
        // --- Viewport Boundary checks ---
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        // Prevent going off the left viewport edge
        if (desiredLeft < 0) {
            desiredLeft = 5; // Small padding
            console.log("POPUP Viewport Adjust: Corrected left edge");
        }
        // Prevent going off the right viewport edge
        if (desiredLeft + popupWidth > viewportWidth) {
            desiredLeft = viewportWidth - popupWidth - 5; // Adjust left, add padding
            console.log("POPUP Viewport Adjust: Corrected right edge");
        }
        // Prevent going off the top viewport edge
        if (desiredTop < 0) {
            // If it goes off the top, try positioning it *below* the anchor instead
            // Goal: popup top-left = anchor bottom-left
            const desiredTopBelow = targetTop + 5; // Add small gap
            if (desiredTopBelow + popupHeight <= viewportHeight) {
                desiredTop = desiredTopBelow;
                console.log("POPUP Viewport Adjust: Flipping below anchor (was off top)");
            }
            else {
                // Not enough space below either, clamp to top of viewport
                desiredTop = 5; // Small padding from top
                console.log("POPUP Viewport Adjust: Clamped to top edge (no space below)");
            }
        }
        // Note: No check for bottom edge needed if we prioritize positioning above or clamping to top.
        // --- Convert viewport coordinates to style relative to widgetNode ---
        const styleTop = desiredTop - widgetRect.top;
        const styleLeft = desiredLeft - widgetRect.left;
        console.log(`POPUP: Setting position - Top: ${styleTop}px, Left: ${styleLeft}px (Relative to Widget)`);
        this.popupMenuContainer.style.top = `${styleTop}px`;
        this.popupMenuContainer.style.left = `${styleLeft}px`;
        // Make it visible again
        this.popupMenuContainer.style.display = 'block';
        this.popupMenuContainer.style.visibility = 'visible';
    }
    /**
     * Checks if the popup menu is currently visible.
     */
    isPopupMenuVisible() {
        return this.popupMenuContainer.style.display !== 'none';
    }
    /**
     * Gets the current level of the popup menu.
     */
    getCurrentMenuLevel() {
        return this.currentMenuLevel;
    }
}
exports.PopupMenuManager = PopupMenuManager;


/***/ }),

/***/ "./lib/handlers/settings-handler.js":
/*!******************************************!*\
  !*** ./lib/handlers/settings-handler.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SettingsHandler = void 0;
const api_client_1 = __webpack_require__(/*! ../core/api-client */ "./lib/core/api-client.js");
/**
 * Handles the logic related to the settings modal:
 * displaying, hiding, populating, saving, and showing feedback.
 */
class SettingsHandler {
    constructor(state, settingsModalContainer, uiManager, // Pass UIManager for notifications
    apiClient) {
        this.state = state;
        this.settingsModalContainer = settingsModalContainer;
        this.uiManager = uiManager;
        this.apiClient = apiClient;
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
                // Load model selection
                const modelSelect = this.settingsModalContainer.querySelector('#settings-model');
                if (modelSelect) {
                    // Ensure we have options for the current provider
                    const providerSelect = this.settingsModalContainer.querySelector('#settings-provider');
                    if (providerSelect) {
                        // Trigger the change event to load model options for the selected provider
                        const event = new Event('change');
                        providerSelect.dispatchEvent(event);
                        // After options are loaded, set the selected model
                        if (currentSettings.model) {
                            modelSelect.value = currentSettings.model;
                        }
                    }
                }
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
     * Updates the API client with new settings
     * This is important to ensure the API client uses the correct baseUrl
     * @param settings The new settings to apply
     */
    updateApiClient(settings) {
        // Create a new API client with the updated URL
        if (settings.apiUrl && settings.apiUrl.trim() !== '') {
            // Replace the API client instance with a new one using the updated URL
            this.apiClient = new api_client_1.ApiClient(settings.apiUrl);
            // Update the API client reference in the settings manager
            this.state.updateApiClient(this.apiClient);
            // Update API client in other components that need it
            // Publish an event that the API client has changed
            const event = new CustomEvent('api-client-updated', {
                detail: { apiClient: this.apiClient }
            });
            window.dispatchEvent(event);
            console.log('API Client updated with new baseUrl:', settings.apiUrl);
        }
        else {
            console.warn('Cannot update API client: apiUrl is empty');
        }
    }
    /**
     * Reads values from the form, saves them using SettingsState,
     * updates the ApiClient, hides the modal, and shows a success notification.
     * This method is intended to be called by the modal's save button listener.
     */
    saveSettings() {
        var _a, _b, _c, _d, _e;
        // Get values from form fields within the modal container
        const provider = (_a = this.settingsModalContainer.querySelector('#settings-provider')) === null || _a === void 0 ? void 0 : _a.value;
        const key = (_b = this.settingsModalContainer.querySelector('#settings-api-key')) === null || _b === void 0 ? void 0 : _b.value;
        const url = (_c = this.settingsModalContainer.querySelector('#settings-api-url')) === null || _c === void 0 ? void 0 : _c.value;
        const rules = (_d = this.settingsModalContainer.querySelector('#settings-rules')) === null || _d === void 0 ? void 0 : _d.value;
        const model = (_e = this.settingsModalContainer.querySelector('#settings-model')) === null || _e === void 0 ? void 0 : _e.value;
        // Basic validation
        if (provider === undefined || key === undefined || url === undefined || rules === undefined || model === undefined) {
            console.error("Could not find all settings input elements.");
            this.showNotification('Error: Could not save settings. Input elements missing.', 'error');
            return;
        }
        const settings = { provider, apiKey: key, apiUrl: url, rules, model };
        try {
            // Save settings using SettingsState
            this.state.saveSettings(settings);
            console.log('Settings saved via SettingsState:', settings);
            // Update the API client with new settings
            this.updateApiClient(settings);
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
const globals_1 = __webpack_require__(/*! ../core/globals */ "./lib/core/globals.js"); // Import globals to get cell index etc.
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
        var _a, _b, _c;
        const { showIndicator, appendToInput, showWidget, focusInput } = callbacks;
        // Check for @ key - event.key should correctly report '@' even with Shift
        // Also check for SHIFT+2 as an alternative way to trigger '@'
        if (event.key === '@' || (event.shiftKey && event.key === '2')) {
            console.log("SHORTCUT HANDLER: '@' key or SHIFT+2 detected");
            const inputField = document.activeElement;
            const isContentEditableInput = inputField &&
                inputField.getAttribute('contenteditable') === 'true' &&
                inputField.classList.contains('jp-llm-ext-input-field');
            // Handle the case where the input field is NOT the active element first
            if (isContentEditableInput) { // Only handle if NOT our input field
                console.log("SHORTCUT HANDLER: Input field is NOT active element. Handling '@' globally.");
                // If not in our input field, prevent default, show widget, focus, insert '@', and show popup.
                event.preventDefault();
                event.stopPropagation();
                showWidget();
                focusInput();
                // After focus, show popup via window.setTimeout to ensure input is ready
                window.setTimeout(() => {
                    const inputElement = document.querySelector('.jp-llm-ext-input-field');
                    if (inputElement) {
                        const selection = window.getSelection();
                        if (selection) { // Check if selection exists (even if rangeCount is 0 initially)
                            // Ensure the input field has focus *before* manipulating the range
                            if (document.activeElement !== inputElement) {
                                inputElement.focus(); // Re-focus just in case
                            }
                            // Create or get the range
                            let range;
                            if (selection.rangeCount > 0) {
                                range = selection.getRangeAt(0);
                                // Double-check if the focus is now correctly inside the input element
                                if (!inputElement.contains(range.commonAncestorContainer)) {
                                    console.log("SHORTCUT HANDLER: Range is not inside the input field after focus. Creating new range.");
                                    // If range is not inside, create a new one collapsed at the end
                                    range = document.createRange();
                                    range.selectNodeContents(inputElement);
                                    range.collapse(false); // Collapse to the end
                                    selection.removeAllRanges();
                                    selection.addRange(range);
                                }
                            }
                            else {
                                // If no range exists, create one collapsed at the end
                                console.log("SHORTCUT HANDLER: No range found after focus. Creating new range.");
                                range = document.createRange();
                                range.selectNodeContents(inputElement);
                                range.collapse(false); // Collapse to the end
                                selection.removeAllRanges();
                                selection.addRange(range);
                            }
                            // Manually insert '@' since we prevented default
                            const atNode = document.createTextNode('@');
                            range.deleteContents(); // Clear any selection just in case
                            range.insertNode(atNode);
                            // Move cursor after the inserted '@'
                            range.setStartAfter(atNode);
                            range.setEndAfter(atNode);
                            selection.removeAllRanges(); // Update selection to the new cursor position
                            selection.addRange(range);
                            // **NESTED TIMEOUT:** Give browser time to render before getting range position
                            window.setTimeout(() => {
                                console.log("SHORTCUT HANDLER: Showing popup after focusing, inserting '@', and nested timeout.");
                                // Ensure we get the most up-to-date range reference
                                const currentSelection = window.getSelection();
                                if (currentSelection && currentSelection.rangeCount > 0) {
                                    const currentRange = currentSelection.getRangeAt(0);
                                    // --- Insert temporary span to get reliable coords --- 
                                    const tempAnchorId = 'jp-llm-shortcut-popup-anchor';
                                    let tempSpan = document.getElementById(tempAnchorId);
                                    if (tempSpan)
                                        tempSpan.remove(); // Clean up previous
                                    tempSpan = document.createElement('span');
                                    tempSpan.id = tempAnchorId;
                                    tempSpan.style.visibility = 'hidden';
                                    tempSpan.style.width = '0';
                                    tempSpan.style.overflow = 'hidden';
                                    tempSpan.textContent = '\u200B'; // Zero-width space
                                    currentRange.insertNode(tempSpan); // Insert at cursor
                                    const spanRect = tempSpan.getBoundingClientRect();
                                    tempSpan.remove(); // Remove immediately
                                    // --- End temporary span logic ---
                                    if (spanRect.top === 0 && spanRect.left === 0) {
                                        console.error("SHORTCUT HANDLER: Failed to get valid coordinates from temp anchor span.");
                                    }
                                    else {
                                        console.log(`SHORTCUT HANDLER: Anchor coords from temp span: Top=${spanRect.top}, Left=${spanRect.left}`);
                                        popupMenuManager.showPopupMenu({ x: spanRect.left, y: spanRect.top });
                                        showIndicator('Browsing references...');
                                    }
                                }
                                else {
                                    console.error("SHORTCUT HANDLER: Could not get range immediately before showing popup.");
                                }
                            }, 0); // 0ms delay is often sufficient
                        }
                        else {
                            console.log("SHORTCUT HANDLER: No selection object after focus, cannot insert '@' or show popup reliably.");
                        }
                    }
                    else {
                        console.log("SHORTCUT HANDLER: Could not find input element after timeout.");
                    }
                }, 50); // Outer timeout remains 50ms
            }
            else {
                // Input field IS focused. Let default '@' insertion happen.
                // The 'input' listener in UIManager should handle the popup.
                console.log("SHORTCUT HANDLER: Input field IS active element. Letting default '@' behavior proceed.");
            }
        }
        // Check for Ctrl+L (insert selection or cell)
        else if (event.ctrlKey && event.key.toLowerCase() === 'l') {
            event.preventDefault();
            event.stopPropagation();
            const selected = (0, notebook_integration_1.getSelectedText)();
            // const cellContent = getCurrentCellContent(); // We don't need the content itself anymore
            const isCellFocused = (0, notebook_integration_1.isInNotebookCellAndEditorFocused)(); // If the cursor is in the editor mode
            const isCellSelected = (0, notebook_integration_1.isInNotebookCell)(); // If the cursor is in the notebook cell
            const activeCellIndex = (_c = (_b = (_a = globals_1.globals.notebookTracker) === null || _a === void 0 ? void 0 : _a.currentWidget) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.activeCellIndex; // Get index
            let handled = false;
            // Priority 1: Selected text in an active cell editor
            if (isCellFocused && selected) {
                // Call the new InputHandler method to create the reference and insert its representation
                inputHandler.handleInsertCodeReferenceFromShortcut(selected);
                showIndicator('Code reference inserted'); // Updated indicator message
                handled = true;
                // Priority 2: Active cell selected (not necessarily editor focus)
            }
            else if (isCellSelected && activeCellIndex !== undefined && activeCellIndex !== null) {
                // Call the new InputHandler method to create the reference and insert its representation
                inputHandler.handleInsertCellReferenceFromShortcut();
                showIndicator('Cell reference inserted'); // Message remains the same
                handled = true;
            }
            else {
                // Invalid context for the shortcut
                showIndicator('Cannot insert reference: Select code or an active cell.');
                handled = true; // Still handled the shortcut, just showed a warning
            }
            // Ensure the sidebar is visible and input is focused only if an action was taken
            if (handled) {
                showWidget(); // Use callback
                focusInput(); // Use callback
            }
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
const ui_components_1 = __webpack_require__(/*! @jupyterlab/ui-components */ "webpack/sharing/consume/default/@jupyterlab/ui-components");
const globals_1 = __webpack_require__(/*! ./core/globals */ "./lib/core/globals.js");
const note_state_1 = __webpack_require__(/*! ./state/note-state */ "./lib/state/note-state.js");
const note_handler_1 = __webpack_require__(/*! ./handlers/note-handler */ "./lib/handlers/note-handler.js");
// --- Import Utility Functions ---
const clipboard_1 = __webpack_require__(/*! ./utils/clipboard */ "./lib/utils/clipboard.js");
const notebook_integration_1 = __webpack_require__(/*! ./utils/notebook-integration */ "./lib/utils/notebook-integration.js");
/**
 * Main sidebar widget for the AI chat interface - Now acts as an orchestrator.
 */
class SimpleSidebarWidget extends widgets_1.Widget {
    /**
     * Helper function to replace a text range with a non-editable widget span.
     */
    createWidgetSpan(range, refText) {
        if (!range)
            return;
        // Extract a display-friendly version (e.g., filename from path)
        let displayLabel = refText;
        if (refText.startsWith('@file ') || refText.startsWith('@dir ')) {
            const parts = refText.split(' ');
            if (parts.length > 1) {
                const pathParts = parts[1].split(/[\\/]/);
                displayLabel = pathParts[pathParts.length - 1] || parts[1]; // Use last part of path or full path
            }
        }
        else if (refText.startsWith('@Cell ')) {
            displayLabel = refText.substring(1); // Remove leading '@'
        } // Add more conditions for other types if needed
        // Create the widget span
        const span = document.createElement('span');
        span.className = 'jp-llm-ext-ref-widget'; // Class for styling
        span.setAttribute('contenteditable', 'false'); // Make it non-editable
        span.setAttribute('data-ref-text', refText); // Store original text for serialization
        span.textContent = displayLabel; // Set visible text
        // Replace the range content with the span
        range.deleteContents();
        range.insertNode(span);
        // Move cursor after the inserted span
        const selection = window.getSelection();
        if (selection) {
            const newRange = document.createRange();
            newRange.setStartAfter(span);
            newRange.setEndAfter(span);
            selection.removeAllRanges();
            selection.addRange(newRange);
        }
    }
    constructor(docManager) {
        super();
        // Placeholder for handler methods used in UIManager callbacks
        this.handleNewChat = async () => {
            var _a, _b;
            console.log('Handle New Chat clicked');
            try {
                // First, check if the API is healthy
                const isHealthy = await this.apiClient.healthCheck();
                console.log(`API health check result for new chat: ${isHealthy}`);
                let thread_id;
                // Try to create a backend thread if the API is healthy
                if (isHealthy) {
                    try {
                        thread_id = await this.apiClient.createThread();
                        console.log('Created new thread with ID:', thread_id);
                    }
                    catch (threadError) {
                        console.error('Error creating thread despite healthy API:', threadError);
                        // Generate a local thread ID as fallback
                        thread_id = `local-${Math.random().toString(36).substring(2, 15)}`;
                        console.log('Using local thread ID instead:', thread_id);
                        // Notify user in UI
                        this.uiManager.showNotification('Could not create thread on the backend. Using local thread instead.', 'info');
                    }
                }
                else {
                    // API is not healthy, use local thread ID
                    thread_id = `local-${Math.random().toString(36).substring(2, 15)}`;
                    console.log('API is not healthy, using local thread ID:', thread_id);
                    // Notify user in UI
                    this.uiManager.showNotification('Backend API is unavailable. Using local thread instead.', 'info');
                }
                // Create the chat with either the backend or local thread_id
                const newChat = this.chatState.createNewChat('New Chat', thread_id);
                (_a = this.historyHandler) === null || _a === void 0 ? void 0 : _a.loadChat(newChat.id);
            }
            catch (error) {
                console.error('Error in handleNewChat:', error);
                // Final fallback: create chat with a generated thread_id
                const fallbackThreadId = `local-${Math.random().toString(36).substring(2, 15)}`;
                console.log('Critical error in chat creation, using emergency fallback thread ID:', fallbackThreadId);
                const newChat = this.chatState.createNewChat('New Chat', fallbackThreadId);
                (_b = this.historyHandler) === null || _b === void 0 ? void 0 : _b.loadChat(newChat.id);
                // Show error notification
                this.uiManager.showNotification('Could not connect to backend service. Using local chat only.', 'error');
            }
        };
        this.handleToggleHistory = () => {
            console.log('Handle Toggle History clicked');
            this.historyHandler.toggleHistoryView();
        };
        this.handleToggleNotes = () => {
            console.log('Handle Toggle Notes clicked');
            this.noteHandler.toggleNotesView();
        };
        this.handleSendMessage = (message, isMarkdown = false) => {
            // 1. Get the current text from the input field via UIManager or LayoutElements
            // const text = this.layoutElements.inputField.value; // No longer needed, text is passed in
            if (!message.trim())
                return; // Don't send empty messages (check the passed message)
            console.log(`[Widget] handleSendMessage: Text='${message}', Markdown=${isMarkdown}`); // Debug log using passed message
            // 3. Call the MessageHandler's send method with text and state
            this.messageHandler.handleSendMessage(message, isMarkdown); // Pass the received message and markdown state
            // NOTE: Input clearing is now handled by UIManager after this callback returns.
            // Do NOT clear input here or in MessageHandler.
        };
        this.handleShowSettings = (event) => {
            console.log('Handle Show Settings clicked');
            this.settingsHandler.showModal();
        };
        this.handleShowPopupMenu = (event, targetButton) => {
            console.log('Handle Show Popup Menu clicked');
            const rect = targetButton.getBoundingClientRect();
            this.popupMenuManager.showPopupMenu({ x: rect.left, y: rect.bottom + 5 });
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
        this.apiClient = new api_client_1.ApiClient();
        this.settingsState = settings_state_1.SettingsManager.getInstance(this.apiClient);
        const initialSettings = this.settingsState.getSettings();
        // Update the API client with the correct URL from settings
        if (initialSettings === null || initialSettings === void 0 ? void 0 : initialSettings.apiUrl) {
            console.log(`Using API URL from settings: ${initialSettings.apiUrl}`);
            this.apiClient = new api_client_1.ApiClient(initialSettings.apiUrl);
            // Re-initialize settings manager with updated API client
            this.settingsState = settings_state_1.SettingsManager.getInstance(this.apiClient);
        }
        else {
            console.log(`Using default API URL: http://localhost:8000`);
        }
        // Check API health on startup
        this.apiClient.healthCheck().then(isHealthy => {
            console.log(`API health check on initialization: ${isHealthy ? 'healthy' : 'not healthy'}`);
        }).catch(error => {
            console.error('Error during initial API health check:', error);
        });
        this.chatState = new chat_state_1.ChatState(this.apiClient);
        this.noteState = new note_state_1.NoteState();
        this.popupMenuManager = new popup_menu_manager_1.PopupMenuManager(this.docManager, this.node, {
            insertCode: (code) => {
                var _a, _b, _c;
                if (!this.inputHandler || !globals_1.globals.notebookTracker)
                    return;
                const currentNotebookPanel = globals_1.globals.notebookTracker.currentWidget;
                if (!currentNotebookPanel || !currentNotebookPanel.context || !currentNotebookPanel.content) {
                    console.warn('Could not get notebook context for code reference, inserting raw code as fallback.');
                    (_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.appendToInput(code);
                    return;
                }
                const notebookPath = currentNotebookPanel.context.path;
                const notebookName = ((_b = notebookPath.split('/').pop()) === null || _b === void 0 ? void 0 : _b.split('.')[0]) || 'notebook';
                const currentCell = currentNotebookPanel.content.activeCell;
                if (!currentCell) {
                    console.warn('Could not get active cell for code reference, inserting raw code as fallback.');
                    (_c = this.inputHandler) === null || _c === void 0 ? void 0 : _c.appendToInput(code);
                    return;
                }
                const cellIndex = currentNotebookPanel.content.activeCellIndex;
                let lineNumber = 1; // Default line number
                let lineEndNumber = 1; // Default end line number
                // --- DEBUG LOG --- 
                console.log('Are we currently in a code cell?');
                // check if currentCell is in editor 
                console.log(currentCell.editor);
                // --- END DEBUG LOG ---
                if (currentCell.editor) {
                    const editor = currentCell.editor;
                    const cmEditor = editor.editor; // Access CodeMirror editor instance (EditorView)
                    if (cmEditor && cmEditor.state) {
                        const state = cmEditor.state;
                        const selection = state.selection.main;
                        if (!selection.empty) {
                            lineNumber = state.doc.lineAt(selection.from).number; // 1-based start line
                            lineEndNumber = state.doc.lineAt(selection.to).number; // 1-based end line
                        }
                        else {
                            // Fallback for cursor position if no selection
                            const cursor = editor.getCursorPosition();
                            if (cursor) {
                                lineNumber = cursor.line + 1; // 1-based line number
                                lineEndNumber = lineNumber; // Start and end are the same for cursor
                            }
                        }
                    }
                    else {
                        // Fallback if cmEditor or state is not available (should not happen often)
                        console.warn('Could not access CodeMirror state for line numbers.');
                        const cursor = editor.getCursorPosition();
                        if (cursor) {
                            lineNumber = cursor.line + 1;
                            lineEndNumber = lineNumber;
                        }
                    }
                }
                else {
                    console.warn('Could not access cell editor for line numbers.');
                    // Keep default line numbers 1, 1 if editor is not available
                }
                // --- DEBUG LOG --- 
                console.log(`[SimpleSidebarWidget.insertCode] Determined lines: Start=${lineNumber}, End=${lineEndNumber}`);
                // --- END DEBUG LOG ---
                // Pass both start and end line numbers
                const refId = this.inputHandler.addCodeReference(code, notebookName, cellIndex, lineNumber, lineEndNumber);
                const placeholder = `@code[${refId}]`;
                this.inputHandler.appendToInput(placeholder);
            },
            insertCell: (content) => { var _a; return (_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.appendToInput(`@cell ${content}`); },
            handleInsertFileWidget: (path) => { var _a; return (_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.handleInsertFileWidget(path); },
            handleInsertDirWidget: (path) => { var _a; return (_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.handleInsertDirWidget(path); },
            getSelectedText: notebook_integration_1.getSelectedText,
            getCurrentCellContent: notebook_integration_1.getCurrentCellContent,
            insertCellByIndex: (index) => {
                var _a;
                (_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.handleInsertCellWidgetFromPopup(index);
            },
            // TODO: insertCollapsedCodeRef should later be merged with insertCode
            // as we only expect one kind of behavior from the input handler.
            // this change will also involve ui changes
            insertCollapsedCodeRef: (code, cellIndex, lineNumber, notebookName) => {
                if (!this.inputHandler)
                    return;
                this.inputHandler.handleInsertCodeWidgetFromPopup(code, notebookName, cellIndex, lineNumber);
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
        const toggleNotesCallback = () => {
            this.noteHandler.toggleNotesView();
        };
        const showSettingsCallback = () => {
            var _a;
            (_a = this.settingsHandler) === null || _a === void 0 ? void 0 : _a.showModal();
        };
        const showPopupMenuCallback = (event) => {
            const rect = event.target.getBoundingClientRect();
            this.popupMenuManager.showPopupMenu({ x: rect.left + 60, y: rect.top - 20 });
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
        const noteHandlerCallbacks = {
            updateTitleInput: (title) => this.uiManager.updateTitleInput(title)
        };
        const inputHandlerCallbacks = {
            handleSendMessage: (message, isMarkdown) => {
                if (this.messageHandler) {
                    this.messageHandler.handleSendMessage(message, isMarkdown);
                }
                else {
                    console.error('MessageHandler not initialized when trying to send message from InputHandler');
                }
            },
            showPopupMenu: (left, top) => this.popupMenuManager.showPopupMenu({ x: left, y: top }),
            hidePopupMenu: () => this.popupMenuManager.hidePopupMenu(),
            updatePlaceholder: (isMarkdown) => {
                // Use dataset for data-placeholder attribute
                this.layoutElements.inputField.dataset.placeholder = isMarkdown ? 'Enter markdown...' : 'Ask anything...';
            },
            toggleInputExpansionUI: (isExpanded) => {
                const button = this.layoutElements.expandButton;
                // Clear existing content (text or old icon)
                while (button.firstChild) {
                    button.removeChild(button.firstChild);
                }
                // Add the appropriate icon using LabIcon.resolve
                const icon = isExpanded
                    ? ui_components_1.LabIcon.resolve({ icon: 'ui-components:caret-up' })
                    : ui_components_1.LabIcon.resolve({ icon: 'ui-components:caret-down' });
                icon.element({ container: button, tag: 'span' }); // Add icon to button
                // Update title for accessibility
                button.title = isExpanded ? 'Collapse input' : 'Expand input';
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
            onNotesClick: toggleNotesCallback,
            onSettingsClick: showSettingsCallback,
            onTitleChange: this.handleUpdateTitle,
            onAtButtonClick: showPopupMenuCallback,
            onSendMessageClick: sendMessageViaButtonCallback,
            onMarkdownToggleChange: toggleMarkdownModeCallback,
            onExpandToggleClick: toggleExpandInputCallback,
        });
        this.settingsModalContainer = (0, settings_modal_1.createSettingsModalElement)(settingsModalCallbacks);
        // --- Initialize UI Manager (needs dependencies) ---
        const uiManagerCallbacks = {
            handleNewChat: this.handleNewChat,
            handleToggleHistory: this.handleToggleHistory,
            handleToggleNotes: this.handleToggleNotes,
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
        this.noteHandler = new note_handler_1.NoteHandler(this.noteState, this.uiManager, noteHandlerCallbacks, this.node);
        // Replace the layout's notes container with the one from NoteHandler
        const noteContainer = this.noteHandler.getContainer();
        const layoutNoteContainer = this.layoutElements.notesContainer;
        const parent = layoutNoteContainer.parentNode;
        if (parent) {
            parent.replaceChild(noteContainer, layoutNoteContainer);
            // Update the reference in layoutElements
            this.layoutElements.notesContainer = noteContainer;
        }
        this.settingsHandler = new settings_handler_1.SettingsHandler(this.settingsState, this.settingsModalContainer, this.uiManager, this.apiClient);
        // --- 5. Final Setup (Attach event listeners, connect signals, etc.) ---
        const initialChatId = this.chatState.getCurrentChatId();
        if (initialChatId) {
            this.historyHandler.loadChat(initialChatId);
        }
        else {
            const newChat = this.chatState.createNewChat();
            this.historyHandler.loadChat(newChat.id);
        }
        // Setup global keyboard shortcuts with the UIManager for proper @ key handling
        (0, shortcut_handler_1.setupShortcuts)(this.inputHandler, this.popupMenuManager, shortcutCallbacks);
        // Listen for API client updates
        window.addEventListener('api-client-updated', ((event) => {
            // Update the API client reference in this widget
            const newApiClient = event.detail.apiClient;
            if (newApiClient) {
                this.apiClient = newApiClient;
                // Update references in components that use the API client
                this.messageHandler = new message_handler_1.MessageHandler(this.apiClient, this.chatState, this.uiManager, messageRendererCallbacks, this.inputHandler);
                // Recreate the ChatState with the new API client to ensure thread_id creation works
                // Only if there are no existing chats
                if (this.chatState.getChatHistory().length === 0) {
                    this.chatState = new chat_state_1.ChatState(this.apiClient);
                }
                console.log('SimpleSidebarWidget: API client updated');
            }
        }));
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
    constructor(apiClient) {
        this.chatHistory = [];
        this.currentChatId = null;
        this.apiClient = null;
        this.apiClient = apiClient;
        // Initialize with an empty chat history for now
        // We'll create the initial chat in the init method, which can be async
        // Initialize the current chat ID to null
        this.currentChatId = null;
        // Defer chat creation to allow for async operations
        this.initializeChat();
    }
    /**
     * Initialize the chat state with an initial chat
     * Creates a new thread and sets up the welcome chat
     */
    async initializeChat() {
        var _a;
        // Create initial chat if none exists
        if (this.chatHistory.length === 0) {
            try {
                // Create a welcome chat first with a local thread ID
                // This ensures we always have a chat even if the API is not available
                const localThreadId = `local-${(0, uuid_1.v4)()}`;
                const welcomeChat = this.createNewChat('Welcome Chat', localThreadId);
                console.log('Created initial welcome chat with local thread_id:', localThreadId);
                // Only try to create a thread if we have an apiClient
                if (this.apiClient) {
                    try {
                        // First check if the API is healthy before trying to create a thread
                        const isHealthy = await this.apiClient.healthCheck();
                        if (!isHealthy) {
                            console.warn('API health check failed, skipping backend thread creation');
                            return; // Keep using the local thread ID
                        }
                        // Attempt to create a backend thread and update the chat with it
                        const thread_id = await this.apiClient.createThread();
                        console.log('Created backend thread for initial chat:', thread_id);
                        // Update the chat with the backend thread_id
                        this.setThreadId(welcomeChat.id, thread_id);
                    }
                    catch (apiError) {
                        console.error('Error creating backend thread for initial chat:', apiError);
                        // Already created with local thread_id, so we're good to continue
                    }
                }
                else {
                    console.log('No API client provided, using local thread_id');
                }
            }
            catch (error) {
                console.error('Error during chat initialization:', error);
                // Final fallback in case of unexpected error
                this.createNewChat('Welcome Chat', `local-${(0, uuid_1.v4)()}`);
            }
        }
        else {
            // Set current chat to the first one if we already have chats
            this.currentChatId = ((_a = this.chatHistory[0]) === null || _a === void 0 ? void 0 : _a.id) || null;
        }
    }
    /**
     * Creates a new chat session and sets it as the current chat.
     * @param title - The initial title for the new chat.
     * @param thread_id - Optional backend thread ID for the chat
     * @returns The newly created chat item.
     */
    createNewChat(title = 'New Chat', thread_id) {
        const chatId = `chat-${(0, uuid_1.v4)()}`; // Use UUID for better uniqueness
        const newChat = {
            id: chatId,
            title: title,
            messages: [],
            thread_id: thread_id, // Store the backend thread ID if provided
            // Optional: Add timestamp or other metadata if needed later
            // createdAt: Date; 
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
        // Validate chat exists first
        const chat = this.getChatById(chatId);
        if (chat) {
            this.currentChatId = chatId;
        }
        else {
            console.warn(`Cannot set current chat: Chat ID ${chatId} not found.`);
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
        return this.currentChatId ? this.getChatById(this.currentChatId) : undefined;
    }
    /**
     * Updates the title of the currently active chat.
     * @param newTitle - The new title for the chat.
     */
    updateCurrentChatTitle(newTitle) {
        const chat = this.getCurrentChat();
        if (chat) {
            chat.title = newTitle;
        }
        else {
            console.warn('Cannot update title: No current chat selected.');
        }
    }
    /**
     * Sets a backend thread ID for a specific chat.
     * @param chatId - The ID of the chat to update
     * @param threadId - The backend thread ID to set
     */
    setThreadId(chatId, threadId) {
        const chat = this.getChatById(chatId);
        if (chat) {
            chat.thread_id = threadId;
        }
        else {
            console.warn(`Cannot set thread ID: Chat ID ${chatId} not found.`);
        }
    }
    /**
     * Sets a backend thread ID for the current chat.
     * @param threadId - The backend thread ID to set
     */
    setCurrentChatThreadId(threadId) {
        const chat = this.getCurrentChat();
        if (chat) {
            chat.thread_id = threadId;
        }
        else {
            console.warn('Cannot set thread ID: No current chat selected.');
        }
    }
    /**
     * Gets the backend thread ID for the current chat.
     * @returns The thread ID or undefined if not set
     */
    getCurrentChatThreadId() {
        var _a;
        return (_a = this.getCurrentChat()) === null || _a === void 0 ? void 0 : _a.thread_id;
    }
    /**
     * Gets the backend thread ID for a specific chat.
     * @param chatId - The ID of the chat to get the thread ID for
     * @returns The thread ID or undefined if not set
     */
    getThreadId(chatId) {
        var _a;
        return (_a = this.getChatById(chatId)) === null || _a === void 0 ? void 0 : _a.thread_id;
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
        return this.chatHistory;
    }
}
exports.ChatState = ChatState;


/***/ }),

/***/ "./lib/state/note-state.js":
/*!*********************************!*\
  !*** ./lib/state/note-state.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NoteState = void 0;
const uuid_1 = __webpack_require__(/*! uuid */ "webpack/sharing/consume/default/uuid/uuid");
/**
 * Manages the state of notes and the currently selected note.
 */
class NoteState {
    constructor() {
        this.notes = [];
        this.currentNoteId = null;
        // In the future, we might load notes from persistent storage here
    }
    /**
     * Creates a new note.
     * @param title - The title for the new note.
     * @param content - The content for the new note.
     * @returns The newly created note.
     */
    createNewNote(title, content) {
        const timestamp = new Date().toISOString();
        const newNote = {
            id: (0, uuid_1.v4)(),
            title,
            content,
            createdAt: timestamp,
            updatedAt: timestamp
        };
        this.notes.push(newNote);
        this.currentNoteId = newNote.id;
        return newNote;
    }
    /**
     * Sets the currently selected note ID.
     * @param noteId - The ID of the note to set as current.
     */
    setCurrentNoteId(noteId) {
        this.currentNoteId = noteId;
    }
    /**
     * Gets the ID of the currently selected note.
     * @returns The current note ID or null if none is selected.
     */
    getCurrentNoteId() {
        return this.currentNoteId;
    }
    /**
     * Retrieves a specific note by its ID.
     * @param noteId - The ID of the note to retrieve.
     * @returns The note or undefined if not found.
     */
    getNoteById(noteId) {
        return this.notes.find(note => note.id === noteId);
    }
    /**
     * Retrieves the currently selected note.
     * @returns The current note or undefined if no note is selected or found.
     */
    getCurrentNote() {
        if (!this.currentNoteId) {
            return undefined;
        }
        return this.getNoteById(this.currentNoteId);
    }
    /**
     * Updates a note's title and content.
     * @param noteId - The ID of the note to update.
     * @param title - The new title for the note.
     * @param content - The new content for the note.
     * @returns The updated note or undefined if not found.
     */
    updateNote(noteId, title, content) {
        const noteIndex = this.notes.findIndex(note => note.id === noteId);
        if (noteIndex < 0) {
            return undefined;
        }
        this.notes[noteIndex] = Object.assign(Object.assign({}, this.notes[noteIndex]), { title,
            content, updatedAt: new Date().toISOString() });
        return this.notes[noteIndex];
    }
    /**
     * Deletes a note by its ID.
     * @param noteId - The ID of the note to delete.
     * @returns True if the note was found and deleted, false otherwise.
     */
    deleteNote(noteId) {
        const initialLength = this.notes.length;
        this.notes = this.notes.filter(note => note.id !== noteId);
        if (this.notes.length < initialLength) {
            // If the deleted note was the current one, reset current or set to the first note
            if (this.currentNoteId === noteId) {
                this.currentNoteId = this.notes.length > 0 ? this.notes[0].id : null;
            }
            return true;
        }
        return false;
    }
    /**
     * Gets all notes.
     * @returns An array of all notes.
     */
    getAllNotes() {
        return [...this.notes]; // Return a copy to prevent direct mutation
    }
}
exports.NoteState = NoteState;


/***/ }),

/***/ "./lib/state/settings-state.js":
/*!*************************************!*\
  !*** ./lib/state/settings-state.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SettingsManager = exports.DEFAULT_SETTINGS = void 0;
/**
 * Default settings values
 */
exports.DEFAULT_SETTINGS = {
    provider: 'OpenAI',
    apiKey: '',
    apiUrl: '',
    rules: '',
    model: 'gpt-4'
};
/**
 * Utility class for managing application settings
 */
class SettingsManager {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.currentSettings = Object.assign({}, exports.DEFAULT_SETTINGS);
        this.loadSettingsFromStorage();
    }
    /**
     * Get the singleton instance of SettingsManager
     * @param apiClient The API client to use
     * @returns The singleton instance
     */
    static getInstance(apiClient) {
        if (!SettingsManager.instance) {
            SettingsManager.instance = new SettingsManager(apiClient);
        }
        return SettingsManager.instance;
    }
    /**
     * Update the API client reference
     * @param apiClient The new API client to use
     */
    updateApiClient(apiClient) {
        this.apiClient = apiClient;
    }
    /**
     * Get the current settings
     * @returns The current settings
     */
    getSettings() {
        return Object.assign({}, this.currentSettings);
    }
    /**
     * Save settings to localStorage and update the backend
     * @param settings The settings to save
     * @returns A promise that resolves when the settings are saved
     */
    async saveSettings(settings) {
        // Update local settings
        this.currentSettings = Object.assign({}, settings);
        // Save to localStorage
        localStorage.setItem('jupyter-llm-ext-settings', JSON.stringify(settings));
        // Update backend
        try {
            await this.apiClient.updateSettings(settings);
            console.log('Settings saved to backend');
        }
        catch (error) {
            console.error('Failed to save settings to backend:', error);
            throw error;
        }
    }
    /**
     * Load settings from localStorage
     */
    loadSettingsFromStorage() {
        const storedSettings = localStorage.getItem('jupyter-llm-ext-settings');
        if (storedSettings) {
            try {
                const parsed = JSON.parse(storedSettings);
                this.currentSettings = Object.assign(Object.assign({}, exports.DEFAULT_SETTINGS), parsed);
            }
            catch (error) {
                console.error('Failed to parse stored settings:', error);
            }
        }
    }
}
exports.SettingsManager = SettingsManager;


/***/ }),

/***/ "./lib/ui/dom-elements.js":
/*!********************************!*\
  !*** ./lib/ui/dom-elements.js ***!
  \********************************/
/***/ ((__unused_webpack_module, exports) => {


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
    // --- Notes Container ---
    const notesContainer = (0, dom_elements_1.createDiv)({ classes: 'jp-llm-ext-notes-container', style: { display: 'none' } });
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
    const inputField = (0, dom_elements_1.createDiv)({
        classes: 'jp-llm-ext-input-field',
        attributes: {
            contenteditable: 'true',
            role: 'textbox',
            'aria-multiline': 'true',
            'data-placeholder': 'Ask me anything...'
        },
        style: { minHeight: '20px', overflowY: 'hidden' }
    });
    if (callbacks.onInputFieldKeyPress) {
        inputField.addEventListener('keypress', callbacks.onInputFieldKeyPress);
    }
    if (callbacks.onInputFieldValueChange) {
        inputField.addEventListener('input', () => callbacks.onInputFieldValueChange(inputField.textContent || ''));
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
    // Notes button
    const notesButton = (0, dom_elements_1.createButton)({
        text: 'Notes',
        attributes: { title: 'View notes' },
        classes: 'jp-Button jp-llm-ext-action-button'
    });
    if (callbacks.onNotesClick) {
        notesButton.addEventListener('click', callbacks.onNotesClick);
    }
    buttonsRow.appendChild(sendButton);
    buttonsRow.appendChild(newChatButton);
    buttonsRow.appendChild(historyButton);
    buttonsRow.appendChild(notesButton);
    // Assemble Bottom Bar
    bottomBarContainer.appendChild(controlsRow);
    bottomBarContainer.appendChild(inputRow);
    bottomBarContainer.appendChild(buttonsRow);
    // --- Assemble Main Element ---
    mainElement.appendChild(titleContainer);
    mainElement.appendChild(messageContainer);
    mainElement.appendChild(historyContainer);
    mainElement.appendChild(notesContainer);
    mainElement.appendChild(bottomBarContainer);
    return {
        mainElement,
        titleInput,
        messageContainer,
        historyContainer,
        notesContainer,
        inputField,
        bottomBarContainer,
        sendButton,
        newChatButton,
        historyButton,
        notesButton,
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
exports.renderReferenceWidgetInline = renderReferenceWidgetInline;
const marked_1 = __webpack_require__(/*! marked */ "webpack/sharing/consume/default/marked/marked");
const dompurify_1 = __importDefault(__webpack_require__(/*! dompurify */ "webpack/sharing/consume/default/dompurify/dompurify"));
// import hljs from 'highlight.js'; // Removed unused import
const dom_elements_1 = __webpack_require__(/*! ./dom-elements */ "./lib/ui/dom-elements.js");
const globals_1 = __webpack_require__(/*! ../core/globals */ "./lib/core/globals.js"); // Import globals
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
    console.log(`[renderUserMessage] Rendering with isMarkdown: ${options.isMarkdown}, text: "${text}"`);
    const messageDiv = createMessageDiv('user');
    if (options.isMarkdown) {
        // Use 'markdown-content' class for consistent styling
        const contentDiv = document.createElement('div');
        contentDiv.className = 'markdown-content';
        try {
            // Preprocess, parse, and sanitize like in bot messages
            const processedText = (0, markdown_config_1.preprocessMarkdown)(text);
            const rawHtml = marked_1.marked.parse(processedText);
            const sanitizedHtml = dompurify_1.default.sanitize(rawHtml);
            contentDiv.innerHTML = sanitizedHtml;
            // Add markdown indicator (similar to bot messages)
            const markdownIndicator = document.createElement('div');
            markdownIndicator.textContent = "MD";
            markdownIndicator.className = 'markdown-indicator';
            messageDiv.appendChild(markdownIndicator);
            // Enhance code blocks if user messages can contain them
            const codeBlocks = contentDiv.querySelectorAll('pre code');
            codeBlocks.forEach(block => {
                // Pass only relevant callbacks if needed for user code blocks
                enhanceCodeBlock(block, callbacks);
            });
        }
        catch (error) {
            console.error('Failed to render user markdown:', error);
            // Fallback to plain text if Markdown rendering fails
            contentDiv.textContent = text;
        }
        messageDiv.appendChild(contentDiv);
    }
    else {
        // Non-Markdown user message (plain text)
        // Replace simple textContent assignment with ref-aware rendering
        // messageDiv.textContent = text;
        renderMessageContentWithRefs(messageDiv, text, callbacks);
    }
    return messageDiv;
}
/**
 * NEW: Renders message content, replacing @references with widgets.
 */
function renderMessageContentWithRefs(container, text, callbacks) {
    // --- DEBUG LOG --- 
    console.log('[renderMessageContentWithRefs] Processing text:', JSON.stringify(text)); // Log exact text
    // --- END DEBUG LOG ---
    // Regex to find @file, @dir, @Cell, @code references (with optional surrounding whitespace)
    const refRegex = /\s*(@(file|dir|Cell|code)\[([^\]]+?)\])\s*/g;
    let lastIndex = 0;
    let match;
    // Reset regex state just in case
    refRegex.lastIndex = 0;
    while ((match = refRegex.exec(text)) !== null) {
        // Append text before the match
        if (match.index > lastIndex) {
            container.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
        }
        // Process the matched reference
        const fullMatchWithWhitespace = match[0]; // Includes potential whitespace
        const fullMatch = match[1]; // The actual @type[value] part
        const type = match[2];
        const value = match[3];
        try {
            const widget = createRefWidget(type, value, fullMatch, callbacks); // Pass the clean match
            container.appendChild(widget);
        }
        catch (error) {
            console.error(`Failed to create widget for reference: ${fullMatch}`, error);
            // Fallback: append the original reference text (with potential whitespace)
            container.appendChild(document.createTextNode(fullMatchWithWhitespace));
        }
        lastIndex = refRegex.lastIndex;
    }
    // Append any remaining text after the last match
    if (lastIndex < text.length) {
        container.appendChild(document.createTextNode(text.substring(lastIndex)));
    }
}
/**
 * NEW: Creates a reference widget span.
 */
function createRefWidget(type, value, originalRefText, // The full @type[value] string
callbacks) {
    const widget = document.createElement('span');
    widget.className = `jp-llm-ext-ref-widget ref-${type.toLowerCase()}`;
    widget.setAttribute('contenteditable', 'false');
    widget.dataset.refText = originalRefText; // Store the original reference
    let displayText = '';
    let titleText = originalRefText; // Default tooltip
    switch (type) {
        case 'file':
            displayText = value.split(/[\\/]/).pop() || value; // Extract filename
            titleText = `File: ${value}`;
            break;
        case 'dir':
            displayText = value.split(/[\\/]/).pop() || value || '/'; // Extract dirname, handle root
            titleText = `Directory: ${value}`;
            break;
        case 'Cell': {
            const cellIndex = parseInt(value) - 1; // Convert back to 0-based index
            const notebookContext = callbacks.getCurrentNotebookContext ? callbacks.getCurrentNotebookContext() : undefined;
            // --- DEBUG LOG --- 
            console.log(`[createRefWidget @Cell] Input Value: ${value}, Parsed Index: ${cellIndex}, Notebook Context:`, notebookContext);
            // --- END DEBUG LOG --- 
            const notebookName = (notebookContext === null || notebookContext === void 0 ? void 0 : notebookContext.name) || 'notebook';
            let cellTypeChar = '?';
            if (notebookContext && globals_1.globals.notebookTracker) {
                const currentNotebookPanel = globals_1.globals.notebookTracker.find(widget => widget.context.path === notebookContext.path);
                if (currentNotebookPanel && currentNotebookPanel.model) {
                    const cellModel = currentNotebookPanel.model.cells.get(cellIndex);
                    if (cellModel) {
                        cellTypeChar = cellModel.type === 'markdown' ? 'M' : 'C';
                    }
                }
            }
            displayText = `${notebookName}-${cellTypeChar}-${value}`; // value is 1-based index
            titleText = `Cell ${value} (${cellTypeChar === 'M' ? 'Markdown' : 'Code'}) in ${notebookName}`;
            break;
        }
        case 'code': {
            const refId = value;
            const refData = callbacks.getCodeRefData ? callbacks.getCodeRefData(refId) : undefined;
            // --- DEBUG LOG --- 
            console.log(`[createRefWidget @code] Input Value (refId): ${refId}, Ref Data Found:`, refData);
            // --- END DEBUG LOG --- 
            if (refData) {
                // Construct display text using start and end lines
                const startLine = refData.lineNumber;
                const endLine = refData.lineEndNumber;
                const linePart = startLine === endLine ? `${startLine}` : `${startLine}_${endLine}`;
                displayText = `${refData.notebookName}-${refData.cellIndex + 1}-${linePart}`;
                // Update title text as well
                const titleLinePart = startLine === endLine ? `Line ${startLine}` : `Lines ${startLine}-${endLine}`;
                titleText = `Code Reference: ${refData.notebookName}, Cell ${refData.cellIndex + 1}, ${titleLinePart}`;
            }
            else {
                displayText = `code-ref-${refId}`; // Fallback display
                titleText = `Code Reference ID: ${refId} (Data not found)`;
            }
            break;
        }
    }
    widget.textContent = displayText;
    widget.title = titleText; // Add tooltip
    return widget;
}
/**
 * NEW: Recursively finds and replaces @references within text nodes of an element.
 */
function renderRefsInElement(element, callbacks) {
    // Use the same updated regex here
    const refRegex = /\s*(@(file|dir|Cell|code)\[([^\]]+?)\])\s*/g;
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
    let node;
    const nodesToProcess = [];
    while ((node = walker.nextNode())) {
        if (node instanceof Text &&
            node.textContent &&
            !(node.parentElement && node.parentElement.closest('.jp-llm-ext-ref-widget'))) {
            // Test with the specific regex before adding
            refRegex.lastIndex = 0; // Reset before test
            if (refRegex.test(node.textContent)) {
                nodesToProcess.push(node);
            }
        }
    }
    // Now, process the collected text nodes
    nodesToProcess.forEach(textNode => {
        const parent = textNode.parentNode;
        if (!parent)
            return;
        const text = textNode.textContent || '';
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        let match;
        refRegex.lastIndex = 0; // Reset regex state for each node
        while ((match = refRegex.exec(text)) !== null) {
            // Append text before the match
            if (match.index > lastIndex) {
                fragment.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
            }
            // Process the matched reference
            const fullMatchWithWhitespace = match[0];
            const fullMatch = match[1];
            const type = match[2];
            const value = match[3];
            try {
                const widget = createRefWidget(type, value, fullMatch, callbacks);
                fragment.appendChild(widget);
            }
            catch (error) {
                console.error(`Failed to create widget for reference: ${fullMatch}`, error);
                fragment.appendChild(document.createTextNode(fullMatchWithWhitespace)); // Fallback
            }
            lastIndex = refRegex.lastIndex;
        }
        // Append any remaining text after the last match
        if (lastIndex < text.length) {
            fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
        }
        // Replace the original text node with the fragment
        parent.replaceChild(fragment, textNode);
    });
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
            // --- NEW: Render references within the sanitized HTML --- 
            renderRefsInElement(contentDiv, callbacks);
            // --- End NEW ---
            // Enhance code blocks after setting innerHTML and rendering refs
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
            // --- NEW: Render references within the sanitized HTML --- 
            renderRefsInElement(contentDiv, effectiveCallbacks);
            // --- End NEW ---
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
    // Add the actions to the header
    if (actionsDiv.hasChildNodes()) {
        codeHeader.appendChild(actionsDiv);
    }
    // Insert header before the <pre> element if it has content
    if (codeHeader.hasChildNodes()) {
        const parentElement = preElement.parentElement;
        if (parentElement) {
            parentElement.insertBefore(codeHeader, preElement);
        }
        else {
            // Fallback: Try parentNode if parentElement is null
            (_a = preElement.parentNode) === null || _a === void 0 ? void 0 : _a.insertBefore(codeHeader, preElement);
        }
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
/**
 * Renders a reference widget as an HTMLElement suitable for inline display
 * (e.g., within the input field or a message).
 *
 * @param type - The type of reference ('code', 'cell', 'file', 'dir').
 * @param data - The data associated with the reference (CodeRefData, path string, etc.).
 * @param refId - Optional reference ID (e.g., 'ref-1') to store on the element.
 * @returns An HTMLElement representing the widget.
 */
function renderReferenceWidgetInline(type, data, // string for file/dir paths
placeholder, // ADDED: The original placeholder text (e.g., @code[ref-1])
refId // Keep refId separate for map lookups if needed
) {
    const widget = document.createElement('span');
    widget.classList.add('jp-llm-ext-ref-widget', `jp-llm-ext-ref-${type}`);
    widget.contentEditable = 'false'; // Make the widget non-editable itself
    widget.style.display = 'inline-block'; // Ensure it behaves like a block for styling/selection
    widget.style.cursor = 'pointer'; // Change cursor to pointer to indicate clickability
    widget.dataset.placeholder = placeholder; // ADDED: Store the placeholder
    const displayTextSpan = document.createElement('span'); // Span for the main text
    const previewDiv = document.createElement('div'); // Div for the preview content
    previewDiv.className = 'jp-llm-ext-ref-preview';
    previewDiv.style.display = 'none'; // Initially hidden
    previewDiv.style.border = '1px solid var(--jp-border-color1)';
    previewDiv.style.padding = '4px';
    previewDiv.style.marginTop = '2px';
    previewDiv.style.fontSize = '0.9em';
    previewDiv.style.backgroundColor = 'var(--jp-layout-color0)';
    previewDiv.style.whiteSpace = 'pre-wrap'; // Preserve line breaks
    previewDiv.style.fontFamily = 'monospace';
    previewDiv.style.cursor = 'text'; // Keep text cursor for preview
    let displayText = '';
    let baseTitle = ''; // Tooltip for the main widget text, without preview
    let previewContent = '';
    switch (type) {
        case 'code':
        case 'cell': { // Combine logic for code and cell previews
            const refData = data;
            const isCode = type === 'code';
            const lines = refData.lineNumber === refData.lineEndNumber
                ? `L${refData.lineNumber}`
                : `L${refData.lineNumber}-${refData.lineEndNumber}`;
            displayText = isCode
                ? `@code (${refData.notebookName}:${lines})`
                : `@Cell (${refData.notebookName}:Cell ${refData.cellIndex + 1})`;
            baseTitle = isCode
                ? `Code: ${refData.notebookName}, Cell ${refData.cellIndex + 1}, ${lines}`
                : `Cell: ${refData.notebookName}, Index ${refData.cellIndex + 1}`;
            if (refId)
                widget.dataset.refId = refId;
            widget.dataset.notebookName = refData.notebookName;
            widget.dataset.cellIndex = String(refData.cellIndex);
            widget.dataset.content = refData.content; // Store content
            if (isCode) {
                widget.dataset.startLine = String(refData.lineNumber);
                widget.dataset.endLine = String(refData.lineEndNumber);
            }
            // Prepare preview content
            if (refData.content) {
                const contentLines = refData.content.split('\n');
                previewContent = contentLines.slice(0, 3).join('\n');
                if (contentLines.length > 3) {
                    previewContent += '\n...';
                }
            }
            break;
        }
        case 'file':
            const filePath = data;
            const fileName = filePath.split(/[\/\\]/).pop() || filePath; // Handle windows paths
            displayText = `@file (${fileName})`;
            baseTitle = `File: ${filePath}`; // Tooltip shows full path
            widget.dataset.path = filePath; // Store full path
            // No preview for files/dirs
            widget.style.cursor = 'default'; // No expansion for file/dir
            break;
        case 'dir':
            const dirPath = data;
            const dirName = dirPath.split(/[\/\\]/).pop() || dirPath || '/'; // Handle windows paths
            displayText = `@dir (${dirName})`;
            baseTitle = `Directory: ${dirPath}`; // Tooltip shows full path
            widget.dataset.path = dirPath; // Store full path
            // No preview for files/dirs
            widget.style.cursor = 'default'; // No expansion for file/dir
            break;
        default:
            displayText = '@unknown-ref';
            baseTitle = 'Unknown Reference';
            widget.style.cursor = 'default';
    }
    displayTextSpan.textContent = displayText;
    widget.title = baseTitle; // Set base tooltip for the main part
    widget.appendChild(displayTextSpan);
    // Add preview div and click listener only if there's preview content
    if (previewContent) {
        previewDiv.textContent = previewContent;
        widget.appendChild(previewDiv);
        // Add click listener to the main widget span to toggle preview
        widget.addEventListener('click', (event) => {
            // Prevent the click from propagating to the input div listener if needed
            event.stopPropagation();
            const isHidden = previewDiv.style.display === 'none';
            previewDiv.style.display = isHidden ? 'block' : 'none';
            // Optional: Change an indicator icon here
        });
        // Prevent clicks *inside* the preview div from closing it
        previewDiv.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    }
    else {
        // Ensure cursor remains default if no preview/expansion
        widget.style.cursor = 'default';
    }
    return widget;
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

/***/ "./lib/ui/note-modal.js":
/*!******************************!*\
  !*** ./lib/ui/note-modal.js ***!
  \******************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createNoteModalElement = createNoteModalElement;
/**
 * Creates a note modal element.
 * @param callbacks Callbacks for the modal actions.
 * @param initialTitle Optional initial title for editing.
 * @param initialContent Optional initial content for editing.
 * @returns The modal element.
 */
function createNoteModalElement(callbacks, initialTitle = '', initialContent = '') {
    // Create backdrop for the modal
    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'jp-llm-ext-note-modal-backdrop';
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'jp-llm-ext-note-modal';
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'jp-llm-ext-note-modal-content';
    // Create modal title
    const modalTitle = document.createElement('h3');
    modalTitle.className = 'jp-llm-ext-note-modal-title';
    modalTitle.textContent = initialTitle ? 'Edit Note' : 'Add New Note';
    modalContent.appendChild(modalTitle);
    // Create form
    const form = document.createElement('form');
    form.className = 'jp-llm-ext-note-modal-form';
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const titleInput = form.querySelector('.jp-llm-ext-note-modal-input');
        const contentTextarea = form.querySelector('.jp-llm-ext-note-modal-textarea');
        if (titleInput && contentTextarea) {
            callbacks.handleSave(titleInput.value, contentTextarea.value);
        }
    });
    // Create title input
    const titleLabel = document.createElement('label');
    titleLabel.className = 'jp-llm-ext-note-modal-label';
    titleLabel.textContent = 'Title';
    titleLabel.htmlFor = 'note-title-input';
    const titleInput = document.createElement('input');
    titleInput.className = 'jp-llm-ext-note-modal-input';
    titleInput.type = 'text';
    titleInput.id = 'note-title-input';
    titleInput.placeholder = 'Enter note title';
    titleInput.value = initialTitle;
    titleInput.required = true;
    // Create content textarea
    const contentLabel = document.createElement('label');
    contentLabel.className = 'jp-llm-ext-note-modal-label';
    contentLabel.textContent = 'Content (Markdown supported)';
    contentLabel.htmlFor = 'note-content-textarea';
    const contentTextarea = document.createElement('textarea');
    contentTextarea.className = 'jp-llm-ext-note-modal-textarea';
    contentTextarea.id = 'note-content-textarea';
    contentTextarea.placeholder = 'Enter note content (supports Markdown)';
    contentTextarea.value = initialContent;
    contentTextarea.required = true;
    contentTextarea.rows = 10;
    // Create buttons
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'jp-llm-ext-note-modal-buttons';
    const cancelButton = document.createElement('button');
    cancelButton.className = 'jp-Button jp-llm-ext-note-modal-cancel';
    cancelButton.textContent = 'Cancel';
    cancelButton.type = 'button';
    cancelButton.addEventListener('click', () => {
        callbacks.handleCancel();
    });
    const saveButton = document.createElement('button');
    saveButton.className = 'jp-Button jp-llm-ext-note-modal-save';
    saveButton.textContent = 'Save';
    saveButton.type = 'submit';
    // Add elements to form
    form.appendChild(titleLabel);
    form.appendChild(titleInput);
    form.appendChild(contentLabel);
    form.appendChild(contentTextarea);
    buttonsContainer.appendChild(cancelButton);
    buttonsContainer.appendChild(saveButton);
    form.appendChild(buttonsContainer);
    modalContent.appendChild(form);
    modal.appendChild(modalContent);
    modalBackdrop.appendChild(modal);
    // Auto-focus the title input when the modal is shown
    setTimeout(() => {
        titleInput.focus();
    }, 0);
    return modalBackdrop;
}


/***/ }),

/***/ "./lib/ui/settings-modal.js":
/*!**********************************!*\
  !*** ./lib/ui/settings-modal.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SettingsModal = void 0;
exports.createSettingsModalElement = createSettingsModalElement;
const settings_state_1 = __webpack_require__(/*! ../state/settings-state */ "./lib/state/settings-state.js");
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
    // Model selection
    const modelLabel = document.createElement('label');
    modelLabel.className = 'jp-llm-ext-settings-label';
    modelLabel.textContent = 'Model:';
    form.appendChild(modelLabel);
    const modelSelect = document.createElement('select');
    modelSelect.className = 'jp-llm-ext-settings-select';
    modelSelect.id = 'settings-model'; // Keep ID for retrieval
    // Predefined set of model names
    const modelOptions = {
        'OpenAI': ['deepseek-chat', 'gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-4o', 'gpt-4o-mini',],
        'HuggingFace': ['mistral-7b', 'llama-2-70b', 'falcon-40b', 'mixtral-8x7b'],
        'Local': ['llama2', 'mistral', 'phi-2', 'codellama', 'orca-mini']
    };
    // Initial loading of model options based on default provider
    modelOptions['OpenAI'].forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        modelSelect.appendChild(option);
    });
    // Update model options when provider changes
    providerSelect.addEventListener('change', () => {
        // Clear existing options
        modelSelect.innerHTML = '';
        // Add new options based on selected provider
        const selectedProvider = providerSelect.value;
        const providerModels = modelOptions[selectedProvider] || [];
        providerModels.forEach((opt) => {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt;
            modelSelect.appendChild(option);
        });
    });
    form.appendChild(modelSelect);
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
    rulesInput.placeholder = 'Enter custom rules or instructions for the LLM...\n\nExample:\n- Be concise and clear\n- Focus on code quality\n- Follow best practices';
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
            provider: providerSelect.value,
            model: modelSelect.value
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
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.settings = Object.assign({}, settings_state_1.DEFAULT_SETTINGS);
        // Define our callbacks
        const callbacks = {
            handleSave: this.saveSettings.bind(this),
            handleCancel: this.hideModal.bind(this)
        };
        // Create the modal element
        this.modalElement = createSettingsModalElement(callbacks);
        // Add modal to document body
        document.body.appendChild(this.modalElement);
        // Close modal when clicking outside
        this.modalElement.addEventListener('click', (event) => {
            if (event.target === this.modalElement) {
                this.hideModal();
            }
        });
    }
    /**
     * Load existing settings into the form
     */
    loadSettingsIntoForm() {
        const providerSelect = document.getElementById('settings-provider');
        const apiKeyInput = document.getElementById('settings-api-key');
        const apiUrlInput = document.getElementById('settings-api-url');
        const rulesInput = document.getElementById('settings-rules');
        const modelSelect = document.getElementById('settings-model');
        if (providerSelect && this.settings.provider) {
            providerSelect.value = this.settings.provider;
            // Update model options for the selected provider
            if (modelSelect) {
                // Clear existing options
                modelSelect.innerHTML = '';
                // Get model options for the current provider
                const modelOptions = {
                    'OpenAI': ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-4o', 'gpt-4o-mini'],
                    'HuggingFace': ['mistral-7b', 'llama-2-70b', 'falcon-40b', 'mixtral-8x7b'],
                    'Local': ['llama2', 'mistral', 'phi-2', 'codellama', 'orca-mini']
                };
                const providerModels = modelOptions[this.settings.provider] || [];
                providerModels.forEach((opt) => {
                    const option = document.createElement('option');
                    option.value = opt;
                    option.textContent = opt;
                    modelSelect.appendChild(option);
                });
                // Set the selected model if it exists
                if (this.settings.model) {
                    modelSelect.value = this.settings.model;
                }
            }
        }
        if (apiKeyInput) {
            apiKeyInput.value = this.settings.apiKey || '';
        }
        if (apiUrlInput) {
            apiUrlInput.value = this.settings.apiUrl || '';
        }
        if (rulesInput) {
            rulesInput.value = this.settings.rules || '';
        }
    }
    /**
     * Show the modal dialog and load current settings
     * @param currentSettings Current settings to pre-fill
     */
    showModal(currentSettings) {
        if (currentSettings) {
            this.settings = Object.assign({}, currentSettings);
        }
        this.loadSettingsIntoForm();
        this.modalElement.style.display = 'flex';
    }
    /**
     * Hide the modal dialog
     */
    hideModal() {
        this.modalElement.style.display = 'none';
    }
    /**
     * Save the settings and hide the modal
     * @param settings Settings to save
     */
    async saveSettings(settings) {
        this.settings = Object.assign({}, settings);
        try {
            // Save settings to backend
            await this.apiClient.updateSettings(settings);
            // Hide modal on success
            this.hideModal();
        }
        catch (error) {
            console.error('Failed to save settings:', error);
            // Show error message (could be improved)
            alert('Failed to save settings. Please try again.');
        }
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

/***/ "./lib/utils/content-editable-utils.js":
/*!*********************************************!*\
  !*** ./lib/utils/content-editable-utils.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getCaretPosition = getCaretPosition;
exports.setCaretPosition = setCaretPosition;
/**
 * Gets the caret position within a contenteditable element.
 * Returns the linear offset from the start of the element's text content.
 */
function getCaretPosition(element) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !element.contains(selection.anchorNode)) {
        // Check if selection is within the element
        return 0;
    }
    const range = selection.getRangeAt(0);
    // Create a range that spans from the beginning of the element to the caret
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    // The length of the text content within this pre-caret range is the position
    // Using toString() is generally more reliable than textContent for range length
    return preCaretRange.toString().length;
}
/**
 * Sets the caret position within a contenteditable element.
 * @param element The contenteditable element.
 * @param position The desired linear offset from the start of the text content.
 */
function setCaretPosition(element, position) {
    var _a;
    const selection = window.getSelection();
    if (!selection) {
        return;
    }
    const range = document.createRange();
    let charCount = 0;
    let foundNode = false;
    let nodeStack = [element]; // Use a stack for DFS traversal
    // Depth-first search to find the correct text node and offset
    while (nodeStack.length > 0) {
        const node = nodeStack.pop();
        if (node.nodeType === Node.TEXT_NODE) {
            const textLength = ((_a = node.textContent) === null || _a === void 0 ? void 0 : _a.length) || 0;
            if (position >= charCount && position <= charCount + textLength) {
                range.setStart(node, position - charCount);
                range.setEnd(node, position - charCount);
                foundNode = true;
                break; // Found the node, exit loop
            }
            charCount += textLength;
        }
        else if (node.nodeType === Node.ELEMENT_NODE) {
            const elementNode = node;
            if (elementNode.tagName === 'BR') {
                if (position === charCount) { // Position is right before BR
                    range.setStartBefore(node);
                    range.setEndBefore(node);
                    foundNode = true;
                    break;
                }
                charCount += 1; // Treat BR as one character
            }
            else if (elementNode.getAttribute('contenteditable') === 'false') {
                // Treat non-editable elements (like our widgets) as single characters
                if (position === charCount) {
                    // Position is right before the widget
                    range.setStartBefore(node);
                    range.setEndBefore(node);
                    foundNode = true;
                    break;
                }
                charCount += 1;
            }
            else {
                // Add child nodes to the stack in reverse order for correct DFS
                const children = node.childNodes;
                for (let i = children.length - 1; i >= 0; i--) {
                    nodeStack.push(children[i]);
                }
            }
        }
    }
    // If the position is beyond the content or wasn't found, place cursor at the end
    if (!foundNode) {
        range.selectNodeContents(element);
        range.collapse(false); // Collapse to the end
    }
    selection.removeAllRanges();
    selection.addRange(range);
    // Restore focus only if the element was previously focused or is the target
    // This avoids stealing focus unnecessarily
    if (document.activeElement !== element) {
        element.focus({ preventScroll: true }); // preventScroll helps avoid jumping
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

/***/ "./lib/utils/markdown.js":
/*!*******************************!*\
  !*** ./lib/utils/markdown.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.renderMarkdown = renderMarkdown;
/**
 * Renders markdown text to HTML.
 * @param markdownText The markdown text to render
 * @returns HTML string
 */
function renderMarkdown(markdownText) {
    // This is a simple implementation. In a real app, you would use a library like marked.js
    if (!markdownText) {
        return '';
    }
    // Basic markdown conversion
    let html = markdownText
        // Handle headers
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
        .replace(/^##### (.*$)/gm, '<h5>$1</h5>')
        .replace(/^###### (.*$)/gm, '<h6>$1</h6>')
        // Handle bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.*?)__/g, '<strong>$1</strong>')
        // Handle italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        // Handle links
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
        // Handle code blocks
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        // Handle inline code
        .replace(/`(.*?)`/g, '<code>$1</code>')
        // Handle horizontal rules
        .replace(/^---$/gm, '<hr>')
        // Handle unordered lists
        .replace(/^\* (.*$)/gm, '<ul><li>$1</li></ul>')
        .replace(/^- (.*$)/gm, '<ul><li>$1</li></ul>')
        // Handle ordered lists
        .replace(/^\d+\. (.*$)/gm, '<ol><li>$1</li></ol>')
        // Handle blockquotes
        .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
        // Handle paragraphs - ensures double newlines create p tags
        .replace(/\n\n/g, '</p><p>');
    // Wrap in paragraph if not already wrapped
    if (!html.startsWith('<')) {
        html = '<p>' + html + '</p>';
    }
    // Fix nested list items
    html = html
        .replace(/<\/ul>\s*<ul>/g, '')
        .replace(/<\/ol>\s*<ol>/g, '');
    return html;
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
exports.isInNotebookCell = isInNotebookCell;
exports.isInNotebookCellAndEditorFocused = isInNotebookCellAndEditorFocused;
exports.isCodeCell = isCodeCell;
exports.isOutputArea = isOutputArea;
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
 * Gets the currently selected text from:
 *  - the active notebook cell
 *  - the text editor
 *  - the output area of a code cell
 */
function getSelectedText() {
    var _a, _b, _c;
    // if (isOutputArea()) {
    //   // TODO: return what's selected in the output area
    //   return null;
    // }
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
 * Checks whether we are currently in a notebook cell.
*/
function isInNotebookCell() {
    var _a;
    const activeCell = (_a = globals_1.globals.notebookTracker) === null || _a === void 0 ? void 0 : _a.activeCell;
    return activeCell !== null;
}
/**
 * Checks whether we are currently in a notebook cell and the editor is focused:
 * meaning that the cursor is in the editor.
*/
function isInNotebookCellAndEditorFocused() {
    var _a;
    const activeCell = (_a = globals_1.globals.notebookTracker) === null || _a === void 0 ? void 0 : _a.activeCell;
    if (activeCell === null || activeCell === void 0 ? void 0 : activeCell.editor) {
        const editor = activeCell.editor;
        const cmEditor = editor.editor; // Access CodeMirror editor instance
        return cmEditor && cmEditor.state;
    }
    return false;
}
/**
 * Check whether the currently active cell is a code cell.
*/
function isCodeCell() {
    var _a, _b;
    const activeCell = (_a = globals_1.globals.notebookTracker) === null || _a === void 0 ? void 0 : _a.activeCell;
    return ((_b = activeCell === null || activeCell === void 0 ? void 0 : activeCell.model) === null || _b === void 0 ? void 0 : _b.type) === 'code';
}
/**
 * Check whether the cursor is in the output area of a code cell.
 * This function specifically checks if we're in a code cell's output area,
 * not just any output area.
 */
function isOutputArea() {
    var _a;
    const activeCell = (_a = globals_1.globals.notebookTracker) === null || _a === void 0 ? void 0 : _a.activeCell;
    if (!(activeCell === null || activeCell === void 0 ? void 0 : activeCell.model))
        return false;
    // First check if it's a code cell
    if (activeCell.model.type !== 'code')
        return false;
    // Then check if we're in the output area
    const editor = activeCell.editor;
    if (!editor)
        return false;
    const cmEditor = editor.editor;
    if (!(cmEditor === null || cmEditor === void 0 ? void 0 : cmEditor.state))
        return false;
    // Get the editor's DOM element
    const editorElement = cmEditor.dom;
    if (!editorElement)
        return false;
    // Check if the active element is within the output area
    const activeElement = document.activeElement;
    if (!activeElement)
        return false;
    // The output area is typically a sibling of the editor element
    const outputArea = editorElement.nextElementSibling;
    if (!outputArea)
        return false;
    return outputArea.contains(activeElement);
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
//# sourceMappingURL=lib_index_js.3723a7f88443ec4d2ad5.js.map