"use strict";
(self["webpackChunkjupyter_simple_extension"] = self["webpackChunkjupyter_simple_extension"] || []).push([["lib_index_js"],{

/***/ "./lib/api-client.js":
/*!***************************!*\
  !*** ./lib/api-client.js ***!
  \***************************/
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
const icons_1 = __webpack_require__(/*! ./icons */ "./lib/icons.js");
/**
 * Registers commands for the extension
 */
function registerCommands(app, palette, launcher, sidebarWidget) {
    // Add command to toggle the sidebar
    app.commands.addCommand('simple-extension:toggle-sidebar', {
        label: 'Toggle AI Assistant Sidebar',
        icon: icons_1.extensionIcon,
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

/***/ "./lib/globals.js":
/*!************************!*\
  !*** ./lib/globals.js ***!
  \************************/
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

/***/ "./lib/icons.js":
/*!**********************!*\
  !*** ./lib/icons.js ***!
  \**********************/
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
const globals_1 = __webpack_require__(/*! ./globals */ "./lib/globals.js");
const commands_1 = __webpack_require__(/*! ./commands */ "./lib/commands.js");
const cell_context_tracker_1 = __webpack_require__(/*! ./cell-context-tracker */ "./lib/cell-context-tracker.js");
// import { ApiClient } from './api-client';
// Export ApiClient for use by other components
var api_client_1 = __webpack_require__(/*! ./api-client */ "./lib/api-client.js");
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

/***/ "./lib/markdown-config.js":
/*!********************************!*\
  !*** ./lib/markdown-config.js ***!
  \********************************/
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
    // Handle code blocks first
    let inCodeBlock = false;
    const lines = text.split('\n');
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
        // Outside code blocks, handle list items
        return line.replace(/([^\n\s])-\s/g, '$1\n- ');
    });
    return processedLines.join('\n');
}


/***/ }),

/***/ "./lib/sidebar-widget.js":
/*!*******************************!*\
  !*** ./lib/sidebar-widget.js ***!
  \*******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SimpleSidebarWidget = void 0;
const widgets_1 = __webpack_require__(/*! @lumino/widgets */ "webpack/sharing/consume/default/@lumino/widgets");
const notebook_1 = __webpack_require__(/*! @jupyterlab/notebook */ "webpack/sharing/consume/default/@jupyterlab/notebook");
const marked_1 = __webpack_require__(/*! marked */ "webpack/sharing/consume/default/marked/marked");
const dompurify_1 = __importDefault(__webpack_require__(/*! dompurify */ "webpack/sharing/consume/default/dompurify/dompurify"));
const icons_1 = __webpack_require__(/*! ./icons */ "./lib/icons.js");
const globals_1 = __webpack_require__(/*! ./globals */ "./lib/globals.js");
const api_client_1 = __webpack_require__(/*! ./api-client */ "./lib/api-client.js");
const markdown_config_1 = __webpack_require__(/*! ./markdown-config */ "./lib/markdown-config.js");
// import { ICellContext } from './types';
// Configure marked with our settings
(0, markdown_config_1.configureMarked)();
/**
 * Main sidebar widget for the AI chat interface
 */
class SimpleSidebarWidget extends widgets_1.Widget {
    constructor(docManager) {
        super();
        this.isMarkdownMode = false;
        this.isInputExpanded = false;
        this.chatHistory = [];
        this.currentChatId = '';
        this.isHistoryViewActive = false;
        /**
         * Handles clicks outside the command menu
         */
        this.handleClickOutside = (event) => {
            if (!this.commandMenuContainer.contains(event.target)) {
                this.hideCommandMenu();
            }
        };
        this.docManager = docManager;
        this.id = 'simple-sidebar';
        this.title.label = '';
        this.title.caption = 'AI Chat Interface';
        this.title.icon = icons_1.extensionIcon;
        this.title.closable = true;
        // Initialize API client
        this.apiClient = new api_client_1.ApiClient();
        // Initialize container elements before creating layout
        this.messageContainer = document.createElement('div');
        this.inputContainer = document.createElement('div');
        this.inputField = document.createElement('textarea');
        this.titleInput = document.createElement('input');
        this.historyContainer = document.createElement('div');
        this.commandMenuContainer = document.createElement('div');
        this.commandMenuContainer.className = 'command-menu-container';
        this.commandMenuContainer.style.display = 'none';
        // Create a new chat on start
        this.createNewChat();
        this.node.appendChild(this.createLayout());
        this.node.appendChild(this.commandMenuContainer);
    }
    /**
     * Creates the main layout for the sidebar
     */
    createLayout() {
        // Create the main container
        const content = document.createElement('div');
        content.className = 'simple-sidebar-content';
        // Create title input container
        const titleContainer = document.createElement('div');
        titleContainer.className = 'title-container';
        // Set up title input
        this.titleInput.className = 'chat-title-input';
        this.titleInput.type = 'text';
        this.titleInput.placeholder = 'Chat title';
        this.titleInput.value = 'New Chat';
        this.titleInput.addEventListener('change', () => this.updateCurrentChatTitle());
        titleContainer.appendChild(this.titleInput);
        // Configure top action buttons (New Chat & History)
        const topActionsContainer = document.createElement('div');
        topActionsContainer.className = 'top-actions-container';
        const newChatButton = document.createElement('button');
        newChatButton.className = 'jp-Button action-button';
        newChatButton.textContent = '+ New Chat';
        newChatButton.title = 'Start a new chat';
        newChatButton.addEventListener('click', () => this.createNewChat());
        const historyButton = document.createElement('button');
        historyButton.className = 'jp-Button action-button';
        historyButton.textContent = 'History';
        historyButton.title = 'View chat history';
        historyButton.addEventListener('click', () => this.toggleHistoryView());
        topActionsContainer.appendChild(newChatButton);
        topActionsContainer.appendChild(historyButton);
        // Configure message container
        this.messageContainer.className = 'message-container';
        // Configure history container
        this.historyContainer.className = 'history-container';
        this.historyContainer.style.display = 'none'; // Initially hidden
        // Configure input container
        this.inputContainer.className = 'input-container';
        // Create controls container
        const controlsContainer = this.createControlsContainer();
        // Configure input field
        this.inputField.placeholder = 'Ask me anything...';
        this.inputField.style.flexGrow = '1';
        this.inputField.style.padding = '5px';
        this.inputField.style.border = '1px solid #ccc';
        this.inputField.style.borderRadius = '3px';
        this.inputField.style.resize = 'none';
        this.inputField.rows = 1;
        this.inputField.style.overflowY = 'auto';
        // Add keypress listener to input field
        this.inputField.addEventListener('keypress', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                this.handleSendMessage();
            }
        });
        // Create send button container
        const inputActionsContainer = document.createElement('div');
        inputActionsContainer.className = 'input-actions-container';
        // Create send button
        const sendButton = document.createElement('button');
        sendButton.className = 'jp-Button send-button';
        sendButton.textContent = 'Send';
        sendButton.addEventListener('click', () => this.handleSendMessage());
        // Add button to actions container
        inputActionsContainer.appendChild(sendButton);
        // Assemble the input components
        this.inputContainer.appendChild(controlsContainer);
        this.inputContainer.appendChild(this.inputField);
        this.inputContainer.appendChild(inputActionsContainer);
        // Assemble all components
        content.appendChild(topActionsContainer);
        content.appendChild(titleContainer);
        content.appendChild(this.messageContainer);
        content.appendChild(this.historyContainer);
        content.appendChild(this.inputContainer);
        return content;
    }
    /**
     * Creates a new chat session
     */
    createNewChat() {
        // Generate a unique ID for the chat
        const chatId = `chat-${Date.now()}`;
        // Create a new chat item
        const newChat = {
            id: chatId,
            title: 'New Chat',
            messages: []
        };
        // Add to history
        this.chatHistory.push(newChat);
        // Set as current chat
        this.currentChatId = chatId;
        // Update title input
        this.titleInput.value = newChat.title;
        // Clear message container
        if (this.messageContainer) {
            this.messageContainer.innerHTML = '';
        }
        // Hide history if it's visible
        if (this.isHistoryViewActive) {
            this.toggleHistoryView();
        }
    }
    /**
     * Toggles between chat view and history view
     */
    toggleHistoryView() {
        this.isHistoryViewActive = !this.isHistoryViewActive;
        if (this.isHistoryViewActive) {
            // Show history view, hide message view
            this.messageContainer.style.display = 'none';
            this.historyContainer.style.display = 'block';
            this.inputContainer.style.display = 'none';
            this.titleInput.style.display = 'none';
            // Populate history
            this.renderChatHistory();
        }
        else {
            // Show message view, hide history view
            this.messageContainer.style.display = 'block';
            this.historyContainer.style.display = 'none';
            this.inputContainer.style.display = 'flex';
            this.titleInput.style.display = 'block';
        }
    }
    /**
     * Renders the chat history in the history container
     */
    renderChatHistory() {
        this.historyContainer.innerHTML = '';
        if (this.chatHistory.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-history-message';
            emptyMessage.textContent = 'No chat history yet';
            this.historyContainer.appendChild(emptyMessage);
            return;
        }
        // Create a list of chat history items
        this.chatHistory.forEach(chat => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            if (chat.id === this.currentChatId) {
                historyItem.classList.add('active');
            }
            // Add title
            const title = document.createElement('div');
            title.className = 'history-title';
            title.textContent = chat.title;
            // Add message preview
            const preview = document.createElement('div');
            preview.className = 'history-preview';
            const lastMessage = chat.messages[chat.messages.length - 1];
            preview.textContent = lastMessage
                ? `${lastMessage.text.substring(0, 40)}${lastMessage.text.length > 40 ? '...' : ''}`
                : 'Empty chat';
            // Add click event
            historyItem.addEventListener('click', () => this.loadChat(chat.id));
            historyItem.appendChild(title);
            historyItem.appendChild(preview);
            this.historyContainer.appendChild(historyItem);
        });
    }
    /**
     * Loads a chat from history
     */
    loadChat(chatId) {
        const chat = this.chatHistory.find(c => c.id === chatId);
        if (!chat)
            return;
        // Set as current chat
        this.currentChatId = chatId;
        // Update title
        this.titleInput.value = chat.title;
        // Clear and re-populate message container
        this.messageContainer.innerHTML = '';
        chat.messages.forEach(msg => {
            this.addMessage(msg.text, msg.sender, msg.isMarkdown, false);
        });
        // Switch back to chat view
        if (this.isHistoryViewActive) {
            this.toggleHistoryView();
        }
    }
    /**
     * Updates the title of the current chat
     */
    updateCurrentChatTitle() {
        const chat = this.chatHistory.find(c => c.id === this.currentChatId);
        if (chat) {
            chat.title = this.titleInput.value;
        }
    }
    /**
     * Creates the controls container with toggles and action buttons
     */
    createControlsContainer() {
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'controls-container';
        // Create markdown toggle container
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'toggle-container';
        // Create markdown toggle
        const markdownToggle = document.createElement('input');
        markdownToggle.type = 'checkbox';
        markdownToggle.id = 'markdown-toggle';
        markdownToggle.style.marginRight = '5px';
        markdownToggle.addEventListener('change', (e) => {
            const target = e.target;
            this.isMarkdownMode = target.checked;
            this.inputField.placeholder = this.isMarkdownMode ?
                'Write markdown here...\n\n# Example heading\n- List item\n\n```code block```' :
                'Ask me anything...';
        });
        // Create toggle label
        const toggleLabel = document.createElement('label');
        toggleLabel.htmlFor = 'markdown-toggle';
        toggleLabel.textContent = 'Markdown mode';
        toggleLabel.style.fontSize = '12px';
        // Add toggle elements to container
        toggleContainer.appendChild(markdownToggle);
        toggleContainer.appendChild(toggleLabel);
        // Create action buttons container
        const actionButtonsContainer = document.createElement('div');
        actionButtonsContainer.className = 'action-buttons-container';
        // Create all action buttons
        const buttons = [
            {
                text: '@',
                title: 'Command list',
                action: (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    const rect = event.currentTarget.getBoundingClientRect();
                    this.showCommandMenu(rect.left, rect.bottom);
                }
            },
            { text: '📎', title: 'Upload file', action: () => { } },
            { text: '🔍', title: 'Browse files', action: () => { } },
            {
                text: '⤢',
                title: 'Expand input',
                action: () => this.toggleInputExpansion(actionButtonsContainer.children[3])
            },
            { text: '⚙️', title: 'Settings', action: () => { } },
            { text: '📁', title: 'List Directory Contents', action: () => this.listCurrentDirectoryContents() }
        ];
        // Add all buttons to the container
        buttons.forEach(button => {
            const btn = this.createButton(button.text, button.title);
            btn.addEventListener('click', (e) => button.action(e));
            actionButtonsContainer.appendChild(btn);
        });
        // Add toggle and action buttons to the controls container
        controlsContainer.appendChild(toggleContainer);
        controlsContainer.appendChild(actionButtonsContainer);
        return controlsContainer;
    }
    /**
     * Toggles the expansion state of the input field
     */
    toggleInputExpansion(button) {
        this.isInputExpanded = !this.isInputExpanded;
        if (this.isInputExpanded) {
            this.inputField.style.height = '100px';
            this.inputField.style.resize = 'vertical';
            button.textContent = '⤡';
            button.title = 'Collapse input';
        }
        else {
            this.inputField.style.height = 'auto';
            this.inputField.style.resize = 'none';
            button.textContent = '⤢';
            button.title = 'Expand input';
        }
    }
    /**
     * Helper function to create a button with given text and tooltip
     */
    createButton(text, tooltip) {
        const button = document.createElement('button');
        button.textContent = text;
        button.title = tooltip;
        button.className = 'jp-Button action-button';
        return button;
    }
    /**
     * Handles sending a message from the input field
     */
    handleSendMessage() {
        const message = this.inputField.value.trim();
        if (message) {
            // Add user message to UI
            this.addMessage(message, 'user', this.isMarkdownMode);
            this.inputField.value = '';
            // Reset expanded state if needed after sending
            if (this.isInputExpanded) {
                this.inputField.style.height = '100px';
            }
            else {
                this.inputField.style.height = 'auto';
                this.inputField.rows = 1;
            }
            // Create a temporary message container for the bot's streaming response
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'bot-message';
            const markdownIndicator = document.createElement('div');
            markdownIndicator.textContent = "MD";
            markdownIndicator.className = 'markdown-indicator';
            botMessageDiv.appendChild(markdownIndicator);
            // Create separate divs for streaming text and final markdown
            const streamingDiv = document.createElement('div');
            streamingDiv.className = 'streaming-content';
            streamingDiv.style.whiteSpace = 'pre-wrap';
            streamingDiv.style.fontFamily = 'monospace';
            streamingDiv.style.fontSize = '0.9em';
            botMessageDiv.appendChild(streamingDiv);
            const contentDiv = document.createElement('div');
            contentDiv.className = 'markdown-content';
            contentDiv.style.display = 'none'; // Initially hidden
            botMessageDiv.appendChild(contentDiv);
            this.messageContainer.appendChild(botMessageDiv);
            // Variable to collect the complete response
            let completeResponse = '';
            // Get cell context if available
            const cellContext = globals_1.globals.cellContextTracker ?
                globals_1.globals.cellContextTracker.getCurrentCellContext() : null;
            // Stream response from API
            this.apiClient.streamChat(message, { cellContext }, 
            // On each chunk received
            (chunk) => {
                completeResponse += chunk;
                streamingDiv.textContent = completeResponse;
                this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
            }, 
            // On complete
            () => {
                // Hide streaming div, show markdown div
                streamingDiv.style.display = 'none';
                contentDiv.style.display = 'block';
                // Pre-process and render markdown
                try {
                    // Pre-process the markdown to fix any issues with code blocks
                    const processedMarkdown = (0, markdown_config_1.preprocessMarkdown)(completeResponse);
                    // Parse and sanitize
                    const rawHtml = marked_1.marked.parse(processedMarkdown);
                    const sanitizedHtml = dompurify_1.default.sanitize(rawHtml);
                    // Apply the HTML with proper code block styling
                    contentDiv.innerHTML = sanitizedHtml;
                    // Add syntax highlighting classes to code blocks
                    const codeBlocks = contentDiv.querySelectorAll('pre code');
                    codeBlocks.forEach(block => {
                        var _a;
                        block.classList.add('jp-RenderedText');
                        (_a = block.parentElement) === null || _a === void 0 ? void 0 : _a.classList.add('jp-RenderedHTMLCommon');
                    });
                }
                catch (error) {
                    contentDiv.textContent = completeResponse;
                    console.error('Failed to render markdown:', error);
                }
                // Save to chat history
                const chat = this.chatHistory.find(c => c.id === this.currentChatId);
                if (chat) {
                    chat.messages.push({
                        text: completeResponse,
                        sender: 'bot',
                        isMarkdown: true
                    });
                }
                this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
            }, 
            // On error
            (error) => {
                streamingDiv.style.display = 'none';
                contentDiv.style.display = 'block';
                contentDiv.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
                console.error('API Error:', error);
            });
        }
    }
    /**
     * Adds a message to the chat interface
     */
    addMessage(text, sender, isMarkdown = false, saveToHistory = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = sender === 'user' ? 'user-message' : 'bot-message';
        // Add message content
        if (isMarkdown || sender === 'bot') {
            // Bot messages are always rendered as markdown
            const markdownIndicator = document.createElement('div');
            markdownIndicator.textContent = "MD";
            markdownIndicator.className = 'markdown-indicator';
            messageDiv.appendChild(markdownIndicator);
            // Create a container for the rendered markdown
            const contentDiv = document.createElement('div');
            contentDiv.className = 'markdown-content';
            try {
                // Pre-process the markdown text
                const processedText = (0, markdown_config_1.preprocessMarkdown)(text);
                // Parse and render markdown
                const rawHtml = marked_1.marked.parse(processedText);
                const sanitizedHtml = dompurify_1.default.sanitize(rawHtml);
                contentDiv.innerHTML = sanitizedHtml;
                // Add syntax highlighting classes to code blocks
                const codeBlocks = contentDiv.querySelectorAll('pre code');
                codeBlocks.forEach(block => {
                    var _a;
                    block.classList.add('jp-RenderedText');
                    (_a = block.parentElement) === null || _a === void 0 ? void 0 : _a.classList.add('jp-RenderedHTMLCommon');
                });
            }
            catch (error) {
                contentDiv.textContent = text;
                console.error('Failed to render markdown:', error);
            }
            messageDiv.appendChild(contentDiv);
        }
        else {
            messageDiv.textContent = text;
        }
        this.messageContainer.appendChild(messageDiv);
        this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
        // Save to chat history
        if (saveToHistory) {
            const chat = this.chatHistory.find(c => c.id === this.currentChatId);
            if (chat) {
                chat.messages.push({
                    text,
                    sender,
                    isMarkdown: isMarkdown || sender === 'bot'
                });
            }
        }
    }
    /**
     * Lists the contents of the current directory
     */
    async listCurrentDirectoryContents() {
        let dirPath = null;
        let source = null;
        // Try to get directory path from current widget
        const app = globals_1.globals.app;
        if (!app) {
            this.addMessage('Error: Application reference not available', 'bot', false);
            return;
        }
        const currentShellWidget = app.shell.currentWidget;
        if (currentShellWidget) {
            const widgetContext = this.docManager.contextForWidget(currentShellWidget);
            if (widgetContext) {
                const path = widgetContext.path;
                const lastSlash = path.lastIndexOf('/');
                dirPath = lastSlash === -1 ? '' : path.substring(0, lastSlash);
                source = 'widget context';
            }
        }
        // Fallback to notebook tracker if no context from widget
        if (dirPath === null && globals_1.globals.notebookTracker) {
            const currentNotebookPanel = globals_1.globals.notebookTracker.currentWidget;
            if (currentNotebookPanel instanceof notebook_1.NotebookPanel) {
                const nbPath = currentNotebookPanel.context.path;
                const lastSlash = nbPath.lastIndexOf('/');
                dirPath = lastSlash === -1 ? '' : nbPath.substring(0, lastSlash);
                source = 'active notebook';
            }
        }
        // List contents if path was found
        if (dirPath !== null) {
            try {
                const contents = await this.docManager.services.contents.get(dirPath);
                if (contents.content && contents.content.length > 0) {
                    const messageContent = `Directory contents (${source}):\n${contents.content.map((item) => `- ${item.name} (${item.type})`).join('\n')}`;
                    this.addMessage(messageContent, 'bot', true);
                }
                else {
                    this.addMessage(`Directory "${dirPath || '/'}" is empty.`, 'bot', true);
                }
            }
            catch (error) {
                this.addMessage(`Error listing directory contents for "${dirPath}": ${error}`, 'bot', true);
            }
        }
        else {
            this.addMessage('Could not determine current directory context.', 'bot', true);
        }
    }
    /**
     * Shows the command menu at the specified position
     */
    showCommandMenu(x, y) {
        const commands = [
            {
                label: 'code',
                description: 'Insert selected code',
                action: () => this.handleCodeCommand()
            },
            {
                label: 'cell',
                description: 'Insert entire cell content',
                action: () => this.handleCellCommand()
            }
        ];
        // Clear existing content
        this.commandMenuContainer.innerHTML = '';
        // Create menu items
        commands.forEach(cmd => {
            const item = document.createElement('div');
            item.className = 'command-menu-item';
            const label = document.createElement('div');
            label.className = 'command-label';
            label.textContent = cmd.label;
            const desc = document.createElement('div');
            desc.className = 'command-description';
            desc.textContent = cmd.description;
            item.appendChild(label);
            item.appendChild(desc);
            item.addEventListener('click', () => {
                cmd.action();
                this.hideCommandMenu();
            });
            this.commandMenuContainer.appendChild(item);
        });
        // Position and show menu
        this.commandMenuContainer.style.position = 'absolute';
        this.commandMenuContainer.style.left = `${x}px`;
        this.commandMenuContainer.style.top = `${y}px`;
        this.commandMenuContainer.style.display = 'block';
        // Add click outside listener
        document.addEventListener('click', this.handleClickOutside);
    }
    /**
     * Hides the command menu
     */
    hideCommandMenu() {
        this.commandMenuContainer.style.display = 'none';
        document.removeEventListener('click', this.handleClickOutside);
    }
    /**
     * Handles the code command - inserts selected code
     */
    handleCodeCommand() {
        var _a;
        const selectedText = this.getSelectedText();
        if (selectedText) {
            this.inputField.value = `@code\n${selectedText}`;
        }
        else {
            // If no selection, get the entire cell content
            const cellContext = (_a = globals_1.globals.cellContextTracker) === null || _a === void 0 ? void 0 : _a.getCurrentCellContext();
            if (cellContext) {
                this.inputField.value = `@code\n${cellContext.text}`;
            }
        }
    }
    /**
     * Handles the cell command - inserts entire cell content
     */
    handleCellCommand() {
        var _a;
        const cellContext = (_a = globals_1.globals.cellContextTracker) === null || _a === void 0 ? void 0 : _a.getCurrentCellContext();
        if (cellContext) {
            this.inputField.value = `@cell\n${cellContext.text}`;
        }
    }
    /**
     * Gets the selected text from cell context
     */
    getSelectedText() {
        var _a;
        // Get the current active cell from the tracker
        const cell = (_a = globals_1.globals.notebookTracker) === null || _a === void 0 ? void 0 : _a.activeCell;
        if (!cell || !cell.editor) {
            return '';
        }
        // Get the CodeMirror editor instance
        const editor = cell.editor;
        const view = editor.editor;
        if (!view) {
            return '';
        }
        // Get the selection from CodeMirror
        const state = view.state;
        const selection = state.selection;
        // If there's no selection, return empty string
        if (selection.main.empty) {
            return '';
        }
        // Get the selected text
        const from = selection.main.from;
        const to = selection.main.to;
        return state.doc.sliceString(from, to);
    }
}
exports.SimpleSidebarWidget = SimpleSidebarWidget;


/***/ })

}]);
//# sourceMappingURL=lib_index_js.179468e47aabc3aa59a2.js.map