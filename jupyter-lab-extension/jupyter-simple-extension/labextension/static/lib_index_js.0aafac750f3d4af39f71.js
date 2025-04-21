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

/***/ "./lib/chat/chat-history-manager.js":
/*!******************************************!*\
  !*** ./lib/chat/chat-history-manager.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports) => {


/**
 * Manages chat history functionality
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ChatHistoryManager = void 0;
/**
 * Manages chat history storage, retrieval, and manipulation
 */
class ChatHistoryManager {
    constructor() {
        this.chatHistory = [];
        this.currentChatId = '';
    }
    /**
     * Creates a new chat session
     * @returns The ID of the newly created chat
     */
    createNewChat() {
        // Generate a unique ID for the chat
        const chatId = `chat-${Date.now()}`;
        // Create a new chat item
        const newChat = {
            id: chatId,
            title: `Chat ${this.chatHistory.length + 1}`,
            messages: []
        };
        // Add to history and set as current
        this.chatHistory.push(newChat);
        this.currentChatId = chatId;
        return chatId;
    }
    /**
     * Adds a message to the current chat
     * @param text Message text
     * @param sender Message sender
     * @param isMarkdown Whether the message is in markdown format
     */
    addMessage(text, sender, isMarkdown = false) {
        const chat = this.chatHistory.find(c => c.id === this.currentChatId);
        if (chat) {
            const message = {
                text,
                sender,
                isMarkdown
            };
            chat.messages.push(message);
        }
    }
    /**
     * Gets the current chat
     * @returns The current chat or undefined if none exists
     */
    getCurrentChat() {
        return this.chatHistory.find(c => c.id === this.currentChatId);
    }
    /**
     * Gets all chat history
     * @returns Array of all chat history items
     */
    getAllChats() {
        return [...this.chatHistory];
    }
    /**
     * Loads a chat by ID
     * @param chatId The ID of the chat to load
     * @returns The loaded chat or undefined if not found
     */
    loadChat(chatId) {
        const chat = this.chatHistory.find(c => c.id === chatId);
        if (chat) {
            this.currentChatId = chatId;
            return chat;
        }
        return undefined;
    }
    /**
     * Updates the title of the current chat
     * @param title The new title
     */
    updateCurrentChatTitle(title) {
        const chat = this.chatHistory.find(c => c.id === this.currentChatId);
        if (chat) {
            chat.title = title;
        }
    }
    /**
     * Gets the current chat ID
     * @returns The current chat ID
     */
    getCurrentChatId() {
        return this.currentChatId;
    }
}
exports.ChatHistoryManager = ChatHistoryManager;


/***/ }),

/***/ "./lib/chat/file-browser-manager.js":
/*!******************************************!*\
  !*** ./lib/chat/file-browser-manager.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports) => {


/**
 * Manages file and directory browsing functionality
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileBrowserManager = void 0;
/**
 * Manages file and directory browsing operations
 */
class FileBrowserManager {
    constructor(docManager) {
        this.currentPath = '';
        this.docManager = docManager;
    }
    /**
     * Lists the contents of the current directory
     * @param filterType Optional parameter to filter results by type ('all', 'file', or 'directory')
     * @returns A promise resolving to an array of item names or null on error
     */
    async listCurrentDirectoryContents(filterType = 'all') {
        console.log('LIST DIR: Starting directory listing process...', { filterType });
        try {
            // Ensure we have a current path
            if (!this.currentPath) {
                await this.setCurrentDirectoryPath();
            }
            console.log('LIST DIR: Current path:', this.currentPath);
            // Get directory contents using the document manager
            const dirContents = await this.docManager.services.contents.get(this.currentPath, { content: true });
            if (!dirContents) {
                console.error('LIST DIR: Failed to get directory contents');
                return null;
            }
            console.log('LIST DIR: Got directory contents:', dirContents);
            // Filter contents based on filterType
            let filteredContents = dirContents.content || [];
            if (filterType === 'file') {
                filteredContents = filteredContents.filter((item) => item.type !== 'directory');
            }
            else if (filterType === 'directory') {
                filteredContents = filteredContents.filter((item) => item.type === 'directory');
            }
            // Sort directories first, then files
            filteredContents.sort((a, b) => {
                if (a.type === 'directory' && b.type !== 'directory') {
                    return -1;
                }
                if (a.type !== 'directory' && b.type === 'directory') {
                    return 1;
                }
                return a.name.localeCompare(b.name);
            });
            // Extract names
            const names = filteredContents.map((item) => {
                if (item.type === 'directory') {
                    return `\ud83d\udcc1 ${item.name}`;
                }
                else {
                    return `\ud83d\udcc4 ${item.name}`;
                }
            });
            console.log('LIST DIR: Filtered and sorted names:', names);
            return names;
        }
        catch (error) {
            console.error('LIST DIR: Error listing directory contents:', error);
            return null;
        }
    }
    /**
     * Sets the current directory path based on context
     */
    async setCurrentDirectoryPath() {
        // If we already have a path, keep using it
        if (this.currentPath) {
            return;
        }
        try {
            // Just use empty path for now as a fallback
            // In a real implementation, we would try to get the current directory from the document manager
            this.currentPath = '';
            console.log('DIR PATH: Using empty path as fallback');
        }
        catch (error) {
            console.error('DIR PATH: Error setting directory path:', error);
            this.currentPath = '';
        }
    }
    /**
     * Navigates to a subdirectory
     * @param dirName The name of the subdirectory to navigate to
     */
    navigateToSubdirectory(dirName) {
        // Remove the folder emoji if present
        const cleanDirName = dirName.replace('\ud83d\udcc1 ', '');
        // Update the current path
        if (this.currentPath) {
            this.currentPath = `${this.currentPath}/${cleanDirName}`;
        }
        else {
            this.currentPath = cleanDirName;
        }
        // Normalize the path
        this.currentPath = this.currentPath.replace(/\/+/g, '/');
        console.log('DIR NAV: Navigated to:', this.currentPath);
    }
    /**
     * Navigates to the parent directory
     * @returns True if navigation was successful, false otherwise
     */
    navigateToParentDirectory() {
        // Check if we're already at the root
        if (!this.currentPath || this.currentPath === '') {
            return false;
        }
        // Get the parent path
        const parts = this.currentPath.split('/');
        parts.pop(); // Remove the last part
        this.currentPath = parts.join('/');
        console.log('DIR NAV: Navigated to parent:', this.currentPath);
        return true;
    }
    /**
     * Gets the current directory path
     * @returns The current directory path
     */
    getCurrentPath() {
        return this.currentPath;
    }
    /**
     * Sets the current directory path
     * @param path The new path to set
     */
    setCurrentPath(path) {
        this.currentPath = path;
    }
}
exports.FileBrowserManager = FileBrowserManager;


/***/ }),

/***/ "./lib/chat/input-handler.js":
/*!***********************************!*\
  !*** ./lib/chat/input-handler.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports) => {


/**
 * Handles input field functionality
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InputHandler = void 0;
/**
 * Manages input field behavior and interactions
 */
class InputHandler {
    constructor(inputField, _inputContainer, // Prefix with underscore to indicate it's not used
    onSendMessage) {
        this.isInputExpanded = false;
        this.isMarkdownMode = false;
        this.inputField = inputField;
        this.onSendMessage = onSendMessage;
        // Set up input field event listeners
        this.setupInputFieldEvents();
    }
    /**
     * Sets up event listeners for the input field
     */
    setupInputFieldEvents() {
        // Handle Enter key to send message
        this.inputField.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                this.onSendMessage();
            }
        });
    }
    /**
     * Toggles the expansion state of the input field
     * @param button The button element that triggered the toggle
     */
    toggleInputExpansion(button) {
        this.isInputExpanded = !this.isInputExpanded;
        if (this.isInputExpanded) {
            this.inputField.style.height = '150px';
            this.inputField.style.resize = 'vertical';
            button.textContent = '\u25bc';
        }
        else {
            this.inputField.style.height = '50px';
            this.inputField.style.resize = 'none';
            button.textContent = '\u25b2';
        }
    }
    /**
     * Toggles markdown mode
     * @param button The button element that triggered the toggle
     */
    toggleMarkdownMode(button) {
        this.isMarkdownMode = !this.isMarkdownMode;
        if (this.isMarkdownMode) {
            button.textContent = 'MD';
            button.classList.add('active');
        }
        else {
            button.textContent = 'MD';
            button.classList.remove('active');
        }
    }
    /**
     * Gets the current input text
     * @returns The current input text
     */
    getInputText() {
        return this.inputField.value;
    }
    /**
     * Clears the input field
     */
    clearInput() {
        this.inputField.value = '';
    }
    /**
     * Appends text to the input field with proper spacing
     * @param text The text to append
     */
    appendToInput(text) {
        try {
            const currentText = this.inputField.value;
            const cursorPosition = this.inputField.selectionStart;
            // Check if we need to add a space before the text
            const needsLeadingSpace = cursorPosition > 0 &&
                currentText.charAt(cursorPosition - 1) !== ' ' &&
                currentText.charAt(cursorPosition - 1) !== '\n';
            // Check if we need to add a space after the text
            const needsTrailingSpace = cursorPosition < currentText.length &&
                currentText.charAt(cursorPosition) !== ' ' &&
                currentText.charAt(cursorPosition) !== '\n';
            // Build the text to insert
            let insertText = '';
            if (needsLeadingSpace)
                insertText += ' ';
            insertText += text;
            if (needsTrailingSpace)
                insertText += ' ';
            // Insert the text at the cursor position
            const newText = currentText.substring(0, cursorPosition) +
                insertText +
                currentText.substring(cursorPosition);
            this.inputField.value = newText;
            // Set focus back to the input field
            this.inputField.focus();
        }
        catch (error) {
            console.error('Error appending to input:', error);
        }
    }
    /**
     * Checks if markdown mode is enabled
     * @returns True if markdown mode is enabled, false otherwise
     */
    isMarkdownEnabled() {
        return this.isMarkdownMode;
    }
}
exports.InputHandler = InputHandler;


/***/ }),

/***/ "./lib/chat/message-renderer.js":
/*!**************************************!*\
  !*** ./lib/chat/message-renderer.js ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


/**
 * Handles rendering and managing chat messages
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MessageRenderer = void 0;
const marked_1 = __webpack_require__(/*! marked */ "webpack/sharing/consume/default/marked/marked");
const dompurify_1 = __importDefault(__webpack_require__(/*! dompurify */ "webpack/sharing/consume/default/dompurify/dompurify"));
const markdown_config_1 = __webpack_require__(/*! ../markdown-config */ "./lib/markdown-config.js");
/**
 * Handles rendering and managing chat messages in the UI
 */
class MessageRenderer {
    constructor(messageContainer, onCopyMessage, onAddToCell) {
        this.messageContainer = messageContainer;
        this.onCopyMessage = onCopyMessage;
        this.onAddToCell = onAddToCell;
    }
    /**
     * Renders a message in the UI
     * @param text The text content of the message
     * @param sender The sender of the message ('user' or 'bot')
     * @param isMarkdown Whether the message is in Markdown format
     * @returns The created message element
     */
    renderMessage(text, sender, isMarkdown = false) {
        console.log('Rendering message:', { sender, isMarkdown }); // Debug log
        // Create message container
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${sender}-message`;
        // Create message header with sender info
        const messageHeader = document.createElement('div');
        messageHeader.className = 'message-header';
        messageHeader.textContent = sender === 'user' ? 'You' : 'AI';
        messageElement.appendChild(messageHeader);
        // Create message content
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        // Process and render the message content
        if (isMarkdown) {
            try {
                // Preprocess markdown to handle special syntax
                const processedMarkdown = (0, markdown_config_1.preprocessMarkdown)(text);
                // Convert markdown to HTML
                const rawHtml = marked_1.marked.parse(processedMarkdown);
                // Sanitize HTML (cast to string to fix type issue)
                const sanitizedHtml = dompurify_1.default.sanitize(rawHtml);
                // Set the HTML content
                messageContent.innerHTML = sanitizedHtml;
                // Add syntax highlighting to code blocks
                const codeBlocks = messageContent.querySelectorAll('pre code');
                codeBlocks.forEach((block) => {
                    var _a, _b;
                    // Add a class for styling
                    (_a = block.parentElement) === null || _a === void 0 ? void 0 : _a.classList.add('highlighted-code');
                    // Add copy button to code blocks
                    const copyButton = document.createElement('button');
                    copyButton.className = 'code-copy-button';
                    copyButton.textContent = 'Copy';
                    copyButton.addEventListener('click', () => {
                        const codeText = block.innerText;
                        this.onCopyMessage(codeText);
                        copyButton.textContent = 'Copied!';
                        setTimeout(() => {
                            copyButton.textContent = 'Copy';
                        }, 2000);
                    });
                    // Add the copy button to the pre element
                    (_b = block.parentElement) === null || _b === void 0 ? void 0 : _b.appendChild(copyButton);
                });
            }
            catch (error) {
                console.error('Error rendering markdown:', error);
                messageContent.textContent = text;
            }
        }
        else {
            // Plain text rendering
            messageContent.textContent = text;
        }
        messageElement.appendChild(messageContent);
        // Create message actions
        const messageActions = document.createElement('div');
        messageActions.className = 'message-actions';
        // Add copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'message-action-button';
        copyButton.textContent = 'Copy';
        copyButton.title = 'Copy to clipboard';
        copyButton.addEventListener('click', () => {
            this.onCopyMessage(text);
            copyButton.textContent = 'Copied!';
            setTimeout(() => {
                copyButton.textContent = 'Copy';
            }, 2000);
        });
        messageActions.appendChild(copyButton);
        // Add "Add to Cell" button
        const addToCellButton = document.createElement('button');
        addToCellButton.className = 'message-action-button';
        addToCellButton.textContent = 'Add to Cell';
        addToCellButton.title = 'Add to current cell';
        addToCellButton.addEventListener('click', () => {
            this.onAddToCell(text);
            addToCellButton.textContent = 'Added!';
            setTimeout(() => {
                addToCellButton.textContent = 'Add to Cell';
            }, 2000);
        });
        messageActions.appendChild(addToCellButton);
        messageElement.appendChild(messageActions);
        // Add to message container
        this.messageContainer.appendChild(messageElement);
        // Scroll to the bottom
        this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
        return messageElement;
    }
    /**
     * Clears all messages from the container
     */
    clearMessages() {
        this.messageContainer.innerHTML = '';
    }
    /**
     * Renders a list of messages
     * @param messages The messages to render
     */
    renderMessages(messages) {
        this.clearMessages();
        messages.forEach(message => {
            this.renderMessage(message.text, message.sender, message.isMarkdown);
        });
    }
}
exports.MessageRenderer = MessageRenderer;


/***/ }),

/***/ "./lib/chat/popup-menu-manager.js":
/*!****************************************!*\
  !*** ./lib/chat/popup-menu-manager.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports) => {


/**
 * Manages popup menu functionality
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PopupMenuManager = void 0;
/**
 * Manages popup menu creation, display, and interaction
 */
class PopupMenuManager {
    constructor(fileBrowserManager, onItemSelected) {
        /**
         * Handles document click events to close the menu when clicking outside
         */
        this.handleDocumentClick = (event) => {
            // Check if the click is outside the popup menu container
            if (this.popupMenuContainer.style.display !== 'none' &&
                !this.popupMenuContainer.contains(event.target)) {
                this.hidePopupMenu();
            }
        };
        this.fileBrowserManager = fileBrowserManager;
        this.onItemSelected = onItemSelected;
        // Initialize menu state
        this.menuState = {
            currentMenuLevel: 'top',
            currentMenuPath: '',
            menuHistory: []
        };
        // Create popup menu container
        this.popupMenuContainer = document.createElement('div');
        this.popupMenuContainer.className = 'jp-llm-ext-popup-menu-container';
        this.popupMenuContainer.style.display = 'none';
        document.body.appendChild(this.popupMenuContainer);
        // Add click event listener to close menu when clicking outside
        document.addEventListener('click', this.handleDocumentClick);
    }
    /**
     * Shows the popup menu at the specified position
     * @param x The x-coordinate of the popup menu
     * @param y The y-coordinate of the popup menu
     */
    showPopupMenu(x, y) {
        // Clear previous menu items
        this.popupMenuContainer.innerHTML = '';
        // Reset menu state for top level
        this.menuState.currentMenuLevel = 'top';
        this.menuState.menuHistory = [];
        // Create top-level menu items
        const commands = [
            {
                label: 'Code',
                description: 'Insert selected code',
                action: () => {
                    this.hidePopupMenu();
                    this.handleCodeCommand();
                }
            },
            {
                label: 'Cell',
                description: 'Insert entire cell content',
                action: () => {
                    this.hidePopupMenu();
                    this.handleCellCommand();
                }
            },
            {
                label: 'Files',
                description: 'Browse and insert file content',
                action: () => {
                    this.menuState.currentMenuLevel = 'files';
                    this.menuState.menuHistory.push({ level: 'top', path: '' });
                    this.loadDirectoryContents(x, y);
                }
            },
            {
                label: 'Directories',
                description: 'Browse and reference directories',
                action: () => {
                    this.menuState.currentMenuLevel = 'directories';
                    this.menuState.menuHistory.push({ level: 'top', path: '' });
                    this.loadDirectoryContents(x, y);
                }
            }
        ];
        this.createMenuItems(commands);
        // Position and show the menu
        this.positionMenu(x, y);
    }
    /**
     * Creates menu items from commands and appends them to the popup menu container
     * @param commands The array of commands to create menu items for
     */
    createMenuItems(commands) {
        commands.forEach(command => {
            const item = document.createElement('div');
            item.className = 'jp-llm-ext-popup-menu-item';
            const label = document.createElement('div');
            label.className = 'jp-llm-ext-popup-menu-item-label';
            label.textContent = command.label;
            const description = document.createElement('div');
            description.className = 'jp-llm-ext-popup-menu-item-description';
            description.textContent = command.description;
            item.appendChild(label);
            item.appendChild(description);
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                command.action();
            });
            this.popupMenuContainer.appendChild(item);
        });
    }
    /**
     * Loads and displays directory contents in the popup menu
     * @param x The x-coordinate of the popup menu
     * @param y The y-coordinate of the popup menu
     */
    async loadDirectoryContents(x, y) {
        // Show loading indicator
        this.popupMenuContainer.innerHTML = '<div class="jp-llm-ext-popup-menu-loading">Loading...</div>';
        // Determine filter type based on menu level
        const filterType = this.menuState.currentMenuLevel === 'files' ? 'file' : 'directory';
        // Get directory contents
        const contents = await this.fileBrowserManager.listCurrentDirectoryContents(filterType);
        // Clear the menu
        this.popupMenuContainer.innerHTML = '';
        // Add back button if we have history
        if (this.menuState.menuHistory.length > 0) {
            const backCommand = {
                label: '⬅️ Back',
                description: 'Go back to previous menu',
                action: () => {
                    // Pop the last item from history
                    const previous = this.menuState.menuHistory.pop();
                    if (previous) {
                        // Restore previous state
                        this.menuState.currentMenuLevel = previous.level;
                        // If going back to top level
                        if (previous.level === 'top') {
                            this.showPopupMenu(x, y);
                        }
                        else {
                            // If going back to a directory level, we need to go up one directory
                            this.fileBrowserManager.navigateToParentDirectory();
                            this.loadDirectoryContents(x, y);
                        }
                    }
                }
            };
            this.createMenuItems([backCommand]);
            // Add current path indicator
            const pathIndicator = document.createElement('div');
            pathIndicator.className = 'jp-llm-ext-popup-menu-path';
            pathIndicator.textContent = `Path: ${this.fileBrowserManager.getCurrentPath() || '/'}`;
            this.popupMenuContainer.appendChild(pathIndicator);
        }
        // If no contents or error
        if (!contents || contents.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'jp-llm-ext-popup-menu-empty';
            emptyMessage.textContent = 'No items found';
            this.popupMenuContainer.appendChild(emptyMessage);
        }
        else {
            // Create commands for each item
            const commands = contents.map(item => {
                return {
                    label: item,
                    description: '',
                    action: () => {
                        // Handle directory navigation
                        if (item.startsWith('📁') && this.menuState.currentMenuLevel === 'directories') {
                            // Navigate to subdirectory
                            this.fileBrowserManager.navigateToSubdirectory(item);
                            this.menuState.menuHistory.push({
                                level: this.menuState.currentMenuLevel,
                                path: this.fileBrowserManager.getCurrentPath()
                            });
                            this.loadDirectoryContents(x, y);
                        }
                        else {
                            // Handle file selection
                            this.hidePopupMenu();
                            this.onItemSelected(item);
                        }
                    }
                };
            });
            this.createMenuItems(commands);
        }
        // Reposition the menu
        this.positionMenu(x, y);
    }
    /**
     * Positions the popup menu at the specified coordinates
     * @param x The x-coordinate
     * @param y The y-coordinate
     */
    positionMenu(x, y) {
        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        // Get menu dimensions
        const menuWidth = this.popupMenuContainer.offsetWidth;
        const menuHeight = this.popupMenuContainer.offsetHeight;
        // Adjust position to ensure menu stays within viewport
        let adjustedX = x;
        let adjustedY = y;
        if (x + menuWidth > viewportWidth) {
            adjustedX = viewportWidth - menuWidth - 10;
        }
        if (y + menuHeight > viewportHeight) {
            adjustedY = viewportHeight - menuHeight - 10;
        }
        // Set position
        this.popupMenuContainer.style.left = `${adjustedX}px`;
        this.popupMenuContainer.style.top = `${adjustedY}px`;
        this.popupMenuContainer.style.display = 'block';
    }
    /**
     * Hides the popup menu
     */
    hidePopupMenu() {
        // Only act if the menu is currently displayed
        if (this.popupMenuContainer.style.display !== 'none') {
            this.popupMenuContainer.style.display = 'none';
            this.popupMenuContainer.innerHTML = '';
        }
    }
    /**
     * Handles the code command - inserts selected code
     * Placeholder for implementation in SimpleSidebarWidget
     */
    handleCodeCommand() {
        // This will be implemented by the SimpleSidebarWidget
        console.log('Code command selected');
    }
    /**
     * Handles the cell command - inserts entire cell content
     * Placeholder for implementation in SimpleSidebarWidget
     */
    handleCellCommand() {
        // This will be implemented by the SimpleSidebarWidget
        console.log('Cell command selected');
    }
    /**
     * Cleans up resources
     */
    dispose() {
        document.removeEventListener('click', this.handleDocumentClick);
        if (this.popupMenuContainer.parentNode) {
            this.popupMenuContainer.parentNode.removeChild(this.popupMenuContainer);
        }
    }
}
exports.PopupMenuManager = PopupMenuManager;


/***/ }),

/***/ "./lib/chat/settings-manager.js":
/*!**************************************!*\
  !*** ./lib/chat/settings-manager.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports) => {


/**
 * Manages settings and configuration for the chat interface
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SettingsManager = void 0;
/**
 * Manages settings and configuration for the chat interface
 */
class SettingsManager {
    constructor() {
        this.defaultSettings = {
            provider: 'OpenAI',
            apiKey: '',
            apiBaseUrl: '',
            rules: ''
        };
        this.currentSettings = Object.assign({}, this.defaultSettings);
        this.settingsModalContainer = this.createSettingsModal();
        document.body.appendChild(this.settingsModalContainer);
    }
    /**
     * Creates the settings modal
     * @returns The created modal container
     */
    createSettingsModal() {
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.display = 'none';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        modal.style.zIndex = '1000';
        const content = document.createElement('div');
        content.style.backgroundColor = '#fff';
        content.style.padding = '20px';
        content.style.borderRadius = '5px';
        content.style.width = '400px';
        const title = document.createElement('h3');
        title.textContent = 'Settings';
        content.appendChild(title);
        const providerLabel = document.createElement('label');
        providerLabel.htmlFor = 'settings-provider';
        providerLabel.textContent = 'LLM Provider:';
        content.appendChild(providerLabel);
        const providerSelect = document.createElement('select');
        providerSelect.id = 'settings-provider';
        ['OpenAI', 'HuggingFace', 'Local'].forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt;
            providerSelect.appendChild(option);
        });
        content.appendChild(providerSelect);
        content.appendChild(document.createElement('br'));
        const keyLabel = document.createElement('label');
        keyLabel.htmlFor = 'settings-api-key';
        keyLabel.textContent = 'API Key:';
        content.appendChild(keyLabel);
        const keyInput = document.createElement('input');
        keyInput.id = 'settings-api-key';
        keyInput.type = 'text';
        keyInput.style.width = '100%';
        content.appendChild(keyInput);
        content.appendChild(document.createElement('br'));
        const urlLabel = document.createElement('label');
        urlLabel.htmlFor = 'settings-api-base-url';
        urlLabel.textContent = 'API Base URL (optional):';
        content.appendChild(urlLabel);
        const urlInput = document.createElement('input');
        urlInput.id = 'settings-api-base-url';
        urlInput.type = 'text';
        urlInput.style.width = '100%';
        content.appendChild(urlInput);
        content.appendChild(document.createElement('br'));
        const rulesLabel = document.createElement('label');
        rulesLabel.htmlFor = 'settings-rules';
        rulesLabel.textContent = 'Rules:';
        content.appendChild(rulesLabel);
        const rulesTextarea = document.createElement('textarea');
        rulesTextarea.id = 'settings-rules';
        rulesTextarea.style.width = '100%';
        rulesTextarea.style.height = '100px';
        content.appendChild(rulesTextarea);
        content.appendChild(document.createElement('br'));
        const btnContainer = document.createElement('div');
        btnContainer.style.textAlign = 'right';
        btnContainer.style.marginTop = '10px';
        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save';
        saveBtn.addEventListener('click', () => {
            const provider = document.getElementById('settings-provider').value;
            const key = document.getElementById('settings-api-key').value;
            const url = document.getElementById('settings-api-base-url').value;
            const rules = document.getElementById('settings-rules').value;
            this.currentSettings = {
                provider,
                apiKey: key,
                apiBaseUrl: url,
                rules
            };
            console.log('Settings saved:', this.currentSettings);
            this.hideSettingsModal();
        });
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.style.marginLeft = '10px';
        cancelBtn.addEventListener('click', () => this.hideSettingsModal());
        btnContainer.appendChild(saveBtn);
        btnContainer.appendChild(cancelBtn);
        content.appendChild(btnContainer);
        modal.appendChild(content);
        return modal;
    }
    /**
     * Shows the settings modal
     */
    showSettingsModal() {
        // Update form fields with current settings
        document.getElementById('settings-provider').value = this.currentSettings.provider;
        document.getElementById('settings-api-key').value = this.currentSettings.apiKey;
        document.getElementById('settings-api-base-url').value = this.currentSettings.apiBaseUrl;
        document.getElementById('settings-rules').value = this.currentSettings.rules;
        this.settingsModalContainer.style.display = 'flex';
    }
    /**
     * Hides the settings modal
     */
    hideSettingsModal() {
        this.settingsModalContainer.style.display = 'none';
    }
    /**
     * Gets the current settings
     * @returns The current settings
     */
    getSettings() {
        return Object.assign({}, this.currentSettings);
    }
    /**
     * Cleans up resources
     */
    dispose() {
        if (this.settingsModalContainer.parentNode) {
            this.settingsModalContainer.parentNode.removeChild(this.settingsModalContainer);
        }
    }
}
exports.SettingsManager = SettingsManager;


/***/ }),

/***/ "./lib/chat/sidebar-widget.js":
/*!************************************!*\
  !*** ./lib/chat/sidebar-widget.js ***!
  \************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/**
 * Main sidebar widget for the AI chat interface in JupyterLab
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SimpleSidebarWidget = void 0;
const widgets_1 = __webpack_require__(/*! @lumino/widgets */ "webpack/sharing/consume/default/@lumino/widgets");
const icons_1 = __webpack_require__(/*! ../icons */ "./lib/icons.js");
const globals_1 = __webpack_require__(/*! ../globals */ "./lib/globals.js");
__webpack_require__(/*! ../../style/index.css */ "./style/index.css"); // Add this line
// Import modular components
const chat_history_manager_1 = __webpack_require__(/*! ./chat-history-manager */ "./lib/chat/chat-history-manager.js");
const file_browser_manager_1 = __webpack_require__(/*! ./file-browser-manager */ "./lib/chat/file-browser-manager.js");
const popup_menu_manager_1 = __webpack_require__(/*! ./popup-menu-manager */ "./lib/chat/popup-menu-manager.js");
const message_renderer_1 = __webpack_require__(/*! ./message-renderer */ "./lib/chat/message-renderer.js");
const settings_manager_1 = __webpack_require__(/*! ./settings-manager */ "./lib/chat/settings-manager.js");
const input_handler_1 = __webpack_require__(/*! ./input-handler */ "./lib/chat/input-handler.js");
/**
 * Main sidebar widget for the AI chat interface in JupyterLab.
 * This widget provides a comprehensive chat-based interface for interacting with AI assistants,
 * supporting text input, Markdown rendering, file and directory browsing through a multi-level
 * pop-up menu, and chat history management. It integrates with JupyterLab's APIs to interact
 * with notebooks and manage document contexts.
 */
class SimpleSidebarWidget extends widgets_1.Widget {
    /**
     * Constructor for the SimpleSidebarWidget class.
     * Initializes the widget with the provided document manager and sets up the basic UI components.
     * @param docManager The document manager instance for interacting with JupyterLab documents.
     */
    constructor(docManager) {
        super();
        this.isHistoryViewActive = false;
        /**
         * Handles keyboard shortcuts for improved user experience.
         * Currently supports Ctrl+L for inserting selected code or cell content.
         * @param event The keyboard event triggered by the user.
         */
        this.handleKeyDown = (event) => {
            // Check for Ctrl+L (for selected code)
            if (event.ctrlKey && event.key === 'l') {
                event.preventDefault();
                this.handleCodeCommand();
                this.showKeyboardShortcutIndicator('Selected code inserted');
            }
        };
        this.docManager = docManager;
        this.id = 'simple-sidebar';
        this.title.label = '';
        this.title.caption = 'AI Chat Interface';
        this.title.icon = icons_1.extensionIcon;
        this.title.closable = true;
        // Initialize container elements before creating layout
        this.messageContainer = document.createElement('div');
        this.inputContainer = document.createElement('div');
        this.inputField = document.createElement('textarea');
        this.titleInput = document.createElement('input');
        this.historyContainer = document.createElement('div');
        // Create keyboard shortcut indicator for user feedback
        this.keyboardShortcutIndicator = document.createElement('div');
        this.keyboardShortcutIndicator.className = 'keyboard-shortcut-indicator';
        document.body.appendChild(this.keyboardShortcutIndicator);
        // Initialize modular components
        this.initializeModularComponents();
        // Create a new chat on start
        this.chatHistoryManager.createNewChat();
        this.updateCurrentChatTitle();
        // Create and add the main layout
        this.node.appendChild(this.createLayout());
        // Add keyboard shortcut listener for improved UX
        document.addEventListener('keydown', this.handleKeyDown);
    }
    /**
     * Initializes all modular components
     */
    initializeModularComponents() {
        // Initialize chat history manager
        this.chatHistoryManager = new chat_history_manager_1.ChatHistoryManager();
        // Initialize file browser manager
        this.fileBrowserManager = new file_browser_manager_1.FileBrowserManager(this.docManager);
        // Initialize message renderer
        this.messageRenderer = new message_renderer_1.MessageRenderer(this.messageContainer, this.copyMessageToClipboard.bind(this), this.addMessageToCell.bind(this));
        // Initialize input handler
        this.inputHandler = new input_handler_1.InputHandler(this.inputField, this.inputContainer, this.handleSendMessage.bind(this));
        // Initialize popup menu manager
        this.popupMenuManager = new popup_menu_manager_1.PopupMenuManager(this.fileBrowserManager, this.appendToInput.bind(this));
        // Initialize settings manager
        this.settingsManager = new settings_manager_1.SettingsManager();
    }
    /**
     * Shows a visual indicator for keyboard shortcuts.
     * @param text The text to display in the indicator.
     */
    showKeyboardShortcutIndicator(text) {
        this.keyboardShortcutIndicator.textContent = text;
        this.keyboardShortcutIndicator.classList.add('visible');
        // Hide after 1 second
        setTimeout(() => {
            this.keyboardShortcutIndicator.classList.remove('visible');
        }, 1000);
    }
    /**
     * Disposes all resources when the widget is closed.
     */
    dispose() {
        // Remove keyboard shortcut listener
        document.removeEventListener('keydown', this.handleKeyDown);
        // Remove keyboard shortcut indicator
        if (this.keyboardShortcutIndicator.parentNode) {
            this.keyboardShortcutIndicator.parentNode.removeChild(this.keyboardShortcutIndicator);
        }
        // Dispose modular components
        this.popupMenuManager.dispose();
        this.settingsManager.dispose();
        super.dispose();
    }
    /**
     * Creates the main layout for the sidebar widget.
     * Includes the title input, message container, history container, input field, and controls.
     * @returns The main content element of the widget.
     */
    createLayout() {
        // Create the main container
        const container = document.createElement('div');
        container.className = 'jp-llm-ext-container';
        // Create title input container
        const titleContainer = document.createElement('div');
        titleContainer.className = 'jp-llm-ext-title-container';
        this.titleInput.className = 'jp-llm-ext-title-input';
        this.titleInput.placeholder = 'Chat Title';
        this.titleInput.addEventListener('change', () => {
            this.chatHistoryManager.updateCurrentChatTitle(this.titleInput.value);
        });
        titleContainer.appendChild(this.titleInput);
        container.appendChild(titleContainer);
        // Configure message container
        this.messageContainer.className = 'jp-llm-ext-message-container';
        container.appendChild(this.messageContainer);
        // Configure history container
        this.historyContainer.className = 'jp-llm-ext-history-container';
        this.historyContainer.style.display = 'none'; // Initially hidden
        container.appendChild(this.historyContainer);
        // Create input area
        const inputArea = document.createElement('div');
        inputArea.className = 'jp-llm-ext-input-area';
        // Configure input container and field
        this.inputContainer.className = 'jp-llm-ext-input-container';
        this.inputField.className = 'jp-llm-ext-input-field';
        this.inputField.placeholder = 'Type your message here...';
        this.inputContainer.appendChild(this.inputField);
        inputArea.appendChild(this.inputContainer);
        // Add controls container
        inputArea.appendChild(this.createControlsContainer());
        container.appendChild(inputArea);
        return container;
    }
    /**
     * Creates the controls container with toggles and action buttons.
     * Includes the Markdown toggle, expand input button, settings button, and popup menu button.
     * @returns The controls container element.
     */
    createControlsContainer() {
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'jp-llm-ext-controls-container';
        // Create toggle buttons container
        const togglesContainer = document.createElement('div');
        togglesContainer.className = 'jp-llm-ext-toggles-container';
        // Add Markdown toggle button
        const markdownToggle = this.createButton('MD', 'Toggle Markdown mode');
        markdownToggle.addEventListener('click', () => {
            this.inputHandler.toggleMarkdownMode(markdownToggle);
        });
        togglesContainer.appendChild(markdownToggle);
        // Add expand input button
        const expandButton = this.createButton('\u25b2', 'Expand input field');
        expandButton.addEventListener('click', () => {
            this.inputHandler.toggleInputExpansion(expandButton);
        });
        togglesContainer.appendChild(expandButton);
        controlsContainer.appendChild(togglesContainer);
        // Create action buttons container
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'jp-llm-ext-actions-container';
        // Add history toggle button
        const historyButton = this.createButton('\ud83d\udcc3', 'Toggle chat history');
        historyButton.addEventListener('click', () => {
            this.toggleHistoryView();
        });
        actionsContainer.appendChild(historyButton);
        // Add settings button
        const settingsButton = this.createButton('\u2699\ufe0f', 'Settings');
        settingsButton.addEventListener('click', () => {
            this.settingsManager.showSettingsModal();
        });
        actionsContainer.appendChild(settingsButton);
        // Add send button
        const sendButton = this.createButton('\u27a4', 'Send message');
        sendButton.addEventListener('click', this.handleSendMessage.bind(this));
        actionsContainer.appendChild(sendButton);
        // Add popup menu button ("@" button)
        const popupMenuButton = this.createButton('@', 'Insert context');
        popupMenuButton.addEventListener('click', (event) => {
            // Get button position
            const rect = popupMenuButton.getBoundingClientRect();
            // Show popup menu at button position
            this.popupMenuManager.showPopupMenu(rect.left, rect.bottom);
        });
        actionsContainer.appendChild(popupMenuButton);
        controlsContainer.appendChild(actionsContainer);
        return controlsContainer;
    }
    /**
     * Helper function to create a button with given text and tooltip.
     * @param text The text to display on the button.
     * @param tooltip The tooltip text to display on hover.
     * @returns The created button element.
     */
    createButton(text, tooltip) {
        const button = document.createElement('button');
        button.textContent = text;
        button.title = tooltip;
        return button;
    }
    /**
     * Toggles between chat view and history view.
     * Updates the UI to show either the chat messages or the chat history list.
     */
    toggleHistoryView() {
        this.isHistoryViewActive = !this.isHistoryViewActive;
        if (this.isHistoryViewActive) {
            // Show history view
            this.messageContainer.style.display = 'none';
            this.historyContainer.style.display = 'block';
            this.renderChatHistory();
        }
        else {
            // Show chat view
            this.messageContainer.style.display = 'block';
            this.historyContainer.style.display = 'none';
        }
    }
    /**
     * Renders the chat history in the history container.
     * Creates a list of chat history items and populates the history container.
     */
    renderChatHistory() {
        this.historyContainer.innerHTML = '';
        const chats = this.chatHistoryManager.getAllChats();
        // Create new chat button
        const newChatButton = document.createElement('div');
        newChatButton.className = 'jp-llm-ext-history-item jp-llm-ext-new-chat';
        newChatButton.textContent = '+ New Chat';
        newChatButton.addEventListener('click', () => {
            this.createNewChat();
            this.toggleHistoryView(); // Switch back to chat view
        });
        this.historyContainer.appendChild(newChatButton);
        if (chats.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'jp-llm-ext-history-empty';
            emptyMessage.textContent = 'No chat history yet';
            this.historyContainer.appendChild(emptyMessage);
            return;
        }
        // Create a list item for each chat
        chats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = 'jp-llm-ext-history-item';
            if (chat.id === this.chatHistoryManager.getCurrentChatId()) {
                chatItem.classList.add('jp-llm-ext-history-item-active');
            }
            const chatTitle = document.createElement('div');
            chatTitle.className = 'jp-llm-ext-history-item-title';
            chatTitle.textContent = chat.title;
            chatItem.appendChild(chatTitle);
            const chatInfo = document.createElement('div');
            chatInfo.className = 'jp-llm-ext-history-item-info';
            chatInfo.textContent = `${chat.messages.length} messages`;
            chatItem.appendChild(chatInfo);
            chatItem.addEventListener('click', () => {
                this.loadChat(chat.id);
                this.toggleHistoryView(); // Switch back to chat view
            });
            this.historyContainer.appendChild(chatItem);
        });
    }
    /**
     * Creates a new chat session.
     * Generates a unique ID, creates a new chat item, adds it to history, and updates the UI.
     */
    createNewChat() {
        // Create new chat using the manager
        this.chatHistoryManager.createNewChat();
        // Update UI
        this.updateCurrentChatTitle();
        this.messageRenderer.clearMessages();
        // Add welcome message
        this.addMessage('Welcome to the AI Chat Interface. How can I help you today?', 'bot', true, false // Don't save welcome message to history
        );
    }
    /**
     * Loads a chat from history.
     * Updates the UI to show the selected chat's messages and title.
     * @param chatId The ID of the chat to load.
     */
    loadChat(chatId) {
        const chat = this.chatHistoryManager.loadChat(chatId);
        if (chat) {
            // Update UI
            this.updateCurrentChatTitle();
            this.messageRenderer.renderMessages(chat.messages);
        }
    }
    /**
     * Updates the title of the current chat.
     * Updates the title input field with the new title.
     */
    updateCurrentChatTitle() {
        const chat = this.chatHistoryManager.getCurrentChat();
        if (chat) {
            this.titleInput.value = chat.title;
        }
    }
    /**
     * Handles sending a message from the input field.
     * Sends the message to the API, updates the UI with the response, and saves the message to chat history.
     */
    handleSendMessage() {
        const message = this.inputHandler.getInputText().trim();
        if (!message)
            return;
        // Add user message to UI
        this.addMessage(message, 'user', false);
        // Clear input field
        this.inputHandler.clearInput();
        // Add temporary "thinking" message
        const thinkingMessage = this.addMessage('Thinking...', 'bot', false, false);
        // Send message to API (mock implementation for now)
        this.mockSendMessage(message)
            .then((response) => {
            // Remove thinking message
            if (thinkingMessage && thinkingMessage.parentNode) {
                thinkingMessage.parentNode.removeChild(thinkingMessage);
            }
            // Add bot response
            this.addMessage(response, 'bot', true);
        })
            .catch((error) => {
            console.error('Error sending message:', error);
            // Remove thinking message
            if (thinkingMessage && thinkingMessage.parentNode) {
                thinkingMessage.parentNode.removeChild(thinkingMessage);
            }
            // Add error message
            this.addMessage('Sorry, there was an error processing your request. Please try again.', 'bot', false);
        });
    }
    /**
     * Mock implementation of sending a message to the API
     * @param message The message to send
     * @returns A promise that resolves to the response
     */
    mockSendMessage(message) {
        return new Promise((resolve) => {
            // Simulate a delay
            setTimeout(() => {
                resolve(`I received your message: "${message}". This is a mock response.`);
            }, 1000);
        });
    }
    /**
     * Adds a message to the chat interface.
     * Creates a new message element and appends it to the message container.
     * @param text The text content of the message.
     * @param sender The sender of the message ('user' or 'bot').
     * @param isMarkdown Whether the message is in Markdown format.
     * @param saveToHistory Whether to save the message to chat history.
     * @returns The created message element.
     */
    addMessage(text, sender, isMarkdown = false, saveToHistory = true) {
        // Save to chat history if needed
        if (saveToHistory) {
            this.chatHistoryManager.addMessage(text, sender, isMarkdown);
        }
        // Render the message
        return this.messageRenderer.renderMessage(text, sender, isMarkdown);
    }
    /**
     * Copies message content to clipboard.
     * @param text The text content to copy.
     */
    copyMessageToClipboard(text) {
        try {
            navigator.clipboard.writeText(text)
                .then(() => {
                console.log('Text copied to clipboard');
            })
                .catch(err => {
                console.error('Failed to copy text: ', err);
                this.fallbackCopyToClipboard(text);
            });
        }
        catch (error) {
            console.error('Copy to clipboard error:', error);
            this.fallbackCopyToClipboard(text);
        }
    }
    /**
     * Fallback method for copying to clipboard using a temporary textarea element.
     * @param text The text to copy.
     */
    fallbackCopyToClipboard(text) {
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            console.log('Fallback: Text copied to clipboard');
        }
        catch (error) {
            console.error('Fallback: Could not copy text: ', error);
        }
    }
    /**
     * Adds message content to the current cell.
     * @param text The text content to add.
     */
    addMessageToCell(text) {
        var _a;
        const cell = (_a = globals_1.globals.notebookTracker) === null || _a === void 0 ? void 0 : _a.activeCell;
        if (!cell) {
            console.error('No active cell found');
            return;
        }
        try {
            // Get current content and cursor position
            const editor = cell.editor;
            if (!editor) {
                console.error('No editor found in cell');
                return;
            }
            const position = editor.getCursorPosition();
            const currentText = editor.model.sharedModel.getSource();
            // Insert text at cursor position
            const beforeCursor = currentText.substring(0, position.column);
            const afterCursor = currentText.substring(position.column);
            // Determine if we need to add newlines
            const needsLeadingNewline = beforeCursor.length > 0 && !beforeCursor.endsWith('\n');
            const needsTrailingNewline = afterCursor.length > 0 && !afterCursor.startsWith('\n');
            let insertText = '';
            if (needsLeadingNewline)
                insertText += '\n';
            insertText += text;
            if (needsTrailingNewline)
                insertText += '\n';
            // Set the new text
            editor.model.sharedModel.setSource(beforeCursor + insertText + afterCursor);
        }
        catch (error) {
            console.error('Error adding text to cell:', error);
        }
    }
    /**
     * Appends text to the input field with proper spacing.
     * @param text The text to append.
     */
    appendToInput(text) {
        this.inputHandler.appendToInput(text);
    }
    /**
     * Gets the selected text from cell context.
     * @returns The selected text or an empty string if no selection.
     */
    getSelectedText() {
        var _a;
        // Get the current active cell from the tracker
        const cell = (_a = globals_1.globals.notebookTracker) === null || _a === void 0 ? void 0 : _a.activeCell;
        if (!cell)
            return '';
        // Get the selected text from the editor
        const editor = cell.editor;
        if (!editor)
            return '';
        const selection = editor.getSelection();
        if (!selection)
            return '';
        // Extract the selected text
        const { start, end } = selection;
        const text = editor.model.sharedModel.getSource();
        const lines = text.split('\n');
        // If selection is within a single line
        if (start.line === end.line) {
            return lines[start.line].substring(start.column, end.column);
        }
        // If selection spans multiple lines
        let selectedText = lines[start.line].substring(start.column) + '\n';
        for (let i = start.line + 1; i < end.line; i++) {
            selectedText += lines[i] + '\n';
        }
        selectedText += lines[end.line].substring(0, end.column);
        return selectedText;
    }
    /**
     * Handles the code command - inserts selected code.
     */
    handleCodeCommand() {
        const selectedText = this.getSelectedText();
        if (selectedText) {
            this.appendToInput(selectedText);
        }
        else {
            console.log('No code selected');
        }
    }
}
exports.SimpleSidebarWidget = SimpleSidebarWidget;


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
// Import the modularized SimpleSidebarWidget from the new location
const sidebar_widget_1 = __webpack_require__(/*! ./chat/sidebar-widget */ "./lib/chat/sidebar-widget.js");
const globals_1 = __webpack_require__(/*! ./globals */ "./lib/globals.js");
const commands_1 = __webpack_require__(/*! ./commands */ "./lib/commands.js");
const cell_context_tracker_1 = __webpack_require__(/*! ./cell-context-tracker */ "./lib/cell-context-tracker.js");
// Export ApiClient for use by other components
var api_client_1 = __webpack_require__(/*! ./api-client */ "./lib/api-client.js");
Object.defineProperty(exports, "ApiClient", ({ enumerable: true, get: function () { return api_client_1.ApiClient; } }));
/**
 * Initialization data for the jupyter-simple-extension extension.
 * This plugin integrates a custom sidebar with JupyterLab for enhanced functionality.
 */
const plugin = {
    id: 'jupyter-simple-extension:plugin',
    autoStart: true,
    requires: [launcher_1.ILauncher, apputils_1.ICommandPalette, notebook_1.INotebookTracker, docmanager_1.IDocumentManager],
    activate: (jupyterApp, launcher, palette, tracker, docManager) => {
        console.log('JupyterLab extension jupyter-simple-extension is activated!');
        // Initialize global references for app and notebook tracking
        (0, globals_1.initGlobals)(jupyterApp, tracker);
        // Initialize cell context tracker to monitor active cells and contexts
        globals_1.globals.cellContextTracker = new cell_context_tracker_1.CellContextTracker(jupyterApp, tracker);
        // Create and add sidebar widget for user interaction and context insertion
        const sidebarWidget = new sidebar_widget_1.SimpleSidebarWidget(docManager);
        jupyterApp.shell.add(sidebarWidget, 'left', { rank: 9999 });
        // Register commands for interacting with the extension via command palette and launcher
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


/***/ })

}]);
//# sourceMappingURL=lib_index_js.0aafac750f3d4af39f71.js.map