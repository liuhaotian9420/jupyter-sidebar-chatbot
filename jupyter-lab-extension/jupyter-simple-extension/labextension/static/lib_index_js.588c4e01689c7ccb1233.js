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
// Import the main CSS file
__webpack_require__(/*! ../style/index.css */ "./style/index.css");
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

/***/ "./lib/popup-menu-manager.js":
/*!***********************************!*\
  !*** ./lib/popup-menu-manager.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PopupMenuManager = void 0;
const globals_1 = __webpack_require__(/*! ./globals */ "./lib/globals.js");
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
        this.currentDirectoryItems = null; // Cache for directory items
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
        this.searchInput.addEventListener('input', () => this.updateMenuItemsUI()); // Change listener to call the targeted update function
        this.searchInput.addEventListener('keydown', (event) => {
            // Only stop specific keys needed to prevent menu interaction
            if (['ArrowUp', 'ArrowDown', 'Enter', 'Escape', 'Tab'].includes(event.key)) {
                // Stop propagation so the main handler doesn't also act on these
                console.log('POPUP (Search Input Listener): Stopping propagation for key:', event.key);
                event.stopPropagation();
                // We will handle these keys in the main handler based on target check
            }
            // Allow default behavior (like Backspace) by *not* stopping propagation for other keys
        });
        // Create a dedicated container for the menu items
        this.itemsContainer = document.createElement('div');
        this.itemsContainer.className = 'jp-llm-ext-popup-menu-items-container';
        document.addEventListener('click', this.handleDocumentClick.bind(this), true);
        // Add keyboard event listener for navigation
        document.addEventListener('keydown', this.handleKeyDown.bind(this), true);
        if (globals_1.globals.notebookTracker) {
            this.currentNotebook = globals_1.globals.notebookTracker.currentWidget;
            globals_1.globals.notebookTracker.currentChanged.connect((_, notebook) => {
                this.currentNotebook = notebook;
            });
        }
    }
    dispose() {
        document.removeEventListener('click', this.handleDocumentClick.bind(this), true);
        document.removeEventListener('keydown', this.handleKeyDown.bind(this), true);
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
        if (this.popupMenuContainer.style.display === 'none') {
            this.currentMenuLevel = 'top';
            this.currentMenuPath = '';
            this.menuHistory = [];
            this.searchInput.value = ''; // Clear search on show
            this.currentDirectoryItems = null; // Clear cache on show
            await this.setCurrentDirectoryPath();
        }
        await this.renderMenuContent();
        // Ensure it's attached to the widget node if somehow detached
        this.widgetNode.appendChild(this.popupMenuContainer);
        // Position the popup menu - place it above the trigger point
        this.popupMenuContainer.style.position = 'absolute';
        this.popupMenuContainer.style.left = `${x}px`;
        // Show the menu first so we can calculate its height
        this.popupMenuContainer.style.display = 'block';
        // Get the actual height after rendering
        const menuHeight = this.popupMenuContainer.offsetHeight;
        // Add a small gap (10px) between the bottom of the menu and the trigger point
        const gap = 10;
        // Position above the cursor/button (y - menuHeight - gap)
        this.popupMenuContainer.style.top = `${Math.max(0, y - menuHeight - gap)}px`;
        // Focus the search input if we are in file/directory view, otherwise focus the first item
        if (this.currentMenuLevel === 'files' || this.currentMenuLevel === 'directories') {
            setTimeout(() => this.searchInput.focus(), 0); // Focus search input
            this.selectedMenuItemIndex = -1; // Don't select an item if search is focused
        }
        else {
            // Reset and select the first menu item for top level
            this.selectedMenuItemIndex = -1;
            setTimeout(() => {
                this.selectNextMenuItem();
            }, 0);
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
        console.log(`POPUP: Rendering full menu content for level: ${this.currentMenuLevel}, path: ${this.currentMenuPath}`);
        this.popupMenuContainer.innerHTML = '';
        this.currentDirectoryItems = null; // Clear cache when re-rendering structure
        if (this.menuHistory.length > 0) {
            const backButton = this.createMenuItem('← Back', 'navigate-back', '', '');
            this.popupMenuContainer.appendChild(backButton);
        }
        if (this.currentMenuLevel === 'files' || this.currentMenuLevel === 'directories') {
            // Add search input
            this.popupMenuContainer.appendChild(this.searchInput);
            // Add path indicator
            const pathIndicator = document.createElement('div');
            pathIndicator.className = 'jp-llm-ext-popup-menu-path';
            pathIndicator.textContent = `Path: ${this.currentMenuPath || '/'}`;
            this.popupMenuContainer.appendChild(pathIndicator);
            // Add the container for list items
            this.popupMenuContainer.appendChild(this.itemsContainer);
            // Fetch initial items and populate the items container
            await this.fetchAndPopulateMenuItems();
        }
        else if (this.currentMenuLevel === 'top') {
            this.renderTopLevelItems();
        }
        // Re-apply selection highlight after rendering
        this.updateSelectionHighlight();
    }
    renderTopLevelItems() {
        this.itemsContainer.innerHTML = ''; // Ensure items container is clear
        const topLevelCommands = [
            { label: 'Code', description: 'Insert selected code or current cell', actionId: 'insert-code' },
            { label: 'Cell', description: 'Insert current cell content', actionId: 'insert-cell' },
            { label: 'File', description: 'Browse and insert file path', actionId: 'browse-files' },
            { label: 'Directory', description: 'Browse and insert directory path', actionId: 'browse-directories' }
        ];
        topLevelCommands.forEach(cmd => {
            const item = this.createMenuItem(cmd.label, cmd.actionId, '', cmd.description);
            this.itemsContainer.appendChild(item);
        });
    }
    /** Fetches directory contents if needed and populates the items container */
    async fetchAndPopulateMenuItems() {
        var _a, _b;
        console.log(`POPUP: Fetching/Populating items. Cached: ${!!this.currentDirectoryItems}`);
        this.itemsContainer.innerHTML = ''; // Clear previous items
        const loadingItem = this.createMenuItem('Loading...', 'loading', '', '');
        loadingItem.style.pointerEvents = 'none';
        this.itemsContainer.appendChild(loadingItem);
        try {
            // Fetch if cache is empty
            if (!this.currentDirectoryItems) {
                // Removed unused filterType declaration
                // Fetch all initially for filtering, or apply server-side filter if API supports it
                this.currentDirectoryItems = await this.listCurrentDirectoryContents(this.currentMenuPath); // Fetch all initially
                console.log(`POPUP: Fetched ${(_b = (_a = this.currentDirectoryItems) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0} items for ${this.currentMenuPath}`);
            }
            // Remove loading indicator
            if (this.itemsContainer.contains(loadingItem)) {
                this.itemsContainer.removeChild(loadingItem);
            }
            // Populate UI based on current cache and search term
            this.updateMenuItemsUI();
        }
        catch (error) {
            if (this.itemsContainer.contains(loadingItem)) {
                this.itemsContainer.removeChild(loadingItem);
            }
            const errorItem = this.createMenuItem(`Error: ${error}`, 'error', '', '');
            errorItem.style.color = 'red';
            errorItem.style.pointerEvents = 'none';
            this.itemsContainer.appendChild(errorItem); // Add error to items container
            console.error('POPUP: Error fetching directory contents:', error);
            this.currentDirectoryItems = null; // Clear cache on error
        }
        // Reset selection after fetching/re-populating
        this.selectedMenuItemIndex = -1;
        this.updateSelectionHighlight();
    }
    /** Updates only the list items in the itemsContainer based on search */
    updateMenuItemsUI() {
        const searchTerm = this.searchInput.value.toLowerCase().trim();
        console.log(`POPUP: Updating UI for search term: "${searchTerm}"`);
        // Clear only the items container
        this.itemsContainer.innerHTML = '';
        if (!this.currentDirectoryItems) {
            console.log('POPUP: No directory items cached, cannot update UI.');
            // Optionally show a message or try fetching again
            const errorItem = this.createMenuItem(`No items loaded`, 'empty', '', '');
            this.itemsContainer.appendChild(errorItem);
            return;
        }
        const currentLevelFilterType = this.currentMenuLevel === 'files' ? 'file' : 'directory'; // Use this for "No X found" message
        // Filter cached items based on search term first
        const searchFilteredContents = this.currentDirectoryItems.filter(item => {
            return item.name.toLowerCase().includes(searchTerm);
        });
        // Filter again based *strictly* on the level's primary type + directories if browsing files
        const finalFilteredContents = searchFilteredContents.filter(item => {
            if (this.currentMenuLevel === 'files') {
                // Keep files that match search, and directories that match search
                return item.type === 'file' || item.type === 'directory';
            }
            else { // 'directories'
                // Keep only directories that match search
                return item.type === 'directory';
            }
        });
        if (finalFilteredContents.length > 0) {
            finalFilteredContents.forEach(item => {
                const itemName = item.name;
                const itemType = item.type;
                const itemPath = item.path;
                const icon = itemType === 'directory' ? '📁' : '📄';
                let actionId;
                if (itemType === 'directory') {
                    // If viewing 'files', clicking dir navigates. If viewing 'dirs', clicking dir selects.
                    actionId = this.currentMenuLevel === 'files' ? 'select-directory-navigate' : 'select-directory-callback';
                }
                else { // itemType === 'file'
                    // Can only select a file if we are in 'files' mode.
                    actionId = this.currentMenuLevel === 'files' ? 'select-file' : 'invalid-action'; // Should not happen if filtering is correct
                }
                if (actionId !== 'invalid-action') {
                    const menuItem = this.createMenuItem(`${icon} ${itemName}`, actionId, itemPath);
                    this.itemsContainer.appendChild(menuItem); // Append to items container
                }
            });
        }
        else {
            // Use currentLevelFilterType for the message
            const emptyItem = this.createMenuItem(searchTerm ? 'No matches found' : `No ${currentLevelFilterType}s found`, 'empty', '', '');
            emptyItem.style.pointerEvents = 'none';
            this.itemsContainer.appendChild(emptyItem); // Append to items container
        }
        // Reset selection highlight as items changed
        this.selectedMenuItemIndex = -1;
        this.updateSelectionHighlight();
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
            labelSpan.style.fontWeight = 'bold';
            const descSpan = document.createElement('span');
            descSpan.textContent = description;
            descSpan.style.display = 'block';
            descSpan.style.fontSize = '0.8em';
            descSpan.style.color = 'var(--jp-ui-font-color2)';
            item.appendChild(descSpan);
        }
        return item;
    }
    async handleMenuClick(event) {
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
                    this.callbacks.insertCode(selectedText);
                    this.hidePopupMenu();
                }
                else {
                    const cellContent = this.callbacks.getCurrentCellContent ? this.callbacks.getCurrentCellContent() : null;
                    if (cellContent) {
                        this.callbacks.insertCode(cellContent);
                        this.hidePopupMenu();
                    }
                    else {
                        // Maybe provide feedback?
                        console.log('POPUP: No code/cell selected to insert.');
                    }
                }
                break;
            }
            case 'insert-cell': {
                const cellContent = this.callbacks.getCurrentCellContent ? this.callbacks.getCurrentCellContent() : null;
                if (cellContent) {
                    this.callbacks.insertCell(cellContent);
                    this.hidePopupMenu();
                }
                else {
                    console.log('POPUP: No cell content to insert.');
                }
                break;
            }
            case 'browse-files':
                await this.navigateMenu('files', this.currentMenuPath || '');
                // Don't clear search here, navigation handles focus/render
                break;
            case 'browse-directories':
                await this.navigateMenu('directories', this.currentMenuPath || '');
                // Don't clear search here
                break;
            case 'select-file':
                if (path && this.currentMenuLevel === 'files') { // Ensure we are in the right mode
                    this.callbacks.insertFilePath(path);
                    this.hidePopupMenu();
                }
                else {
                    console.error('POPUP: File selected but path is missing or not in file mode.');
                }
                break;
            case 'select-directory-navigate': // Navigate into dir when in file view
                if (path) {
                    await this.navigateMenu('files', path); // Navigate deeper, still looking for files
                }
                else {
                    console.error('POPUP: Directory selected for navigation but path is missing.');
                }
                break;
            case 'select-directory-callback': // Select dir when in directory view
                if (path && this.currentMenuLevel === 'directories') { // Ensure we are in the right mode
                    this.callbacks.insertDirectoryPath(path); // Use the callback
                    this.hidePopupMenu();
                }
                else {
                    console.error('POPUP: Directory selected for callback but path is missing or not in directory mode.');
                }
                break;
            case 'loading':
            case 'empty':
            case 'error':
                break;
            default:
                console.warn('Unknown or invalid menu action:', actionId);
                // this.hidePopupMenu(); // Maybe don't hide on unknown action
                break;
        }
        event.stopPropagation(); // Stop propagation after handling click
    }
    async navigateMenu(level, path) {
        console.log(`POPUP: Navigating to level: ${level}, path: ${path}`);
        // Only push history if we are actually moving to a new state
        if (this.currentMenuLevel !== level || this.currentMenuPath !== path) {
            this.menuHistory.push({ level: this.currentMenuLevel, path: this.currentMenuPath });
        }
        this.currentMenuLevel = level;
        this.currentMenuPath = path;
        this.searchInput.value = ''; // Clear search on explicit navigation
        this.currentDirectoryItems = null; // Clear cache for new directory
        // Render the new view structure (will fetch items)
        await this.renderMenuContent();
        // Focus search input after navigating to file/dir view
        if (level === 'files' || level === 'directories') {
            setTimeout(() => this.searchInput.focus(), 0);
        }
        // Selection is handled by renderMenuContent/fetchAndPopulate
    }
    navigateBackMenu() {
        const previousState = this.menuHistory.pop();
        if (previousState) {
            console.log(`POPUP: Navigating back to level: ${previousState.level}, path: ${previousState.path}`);
            this.currentMenuLevel = previousState.level;
            this.currentMenuPath = previousState.path;
            this.searchInput.value = ''; // Clear search on back navigation too? Or keep it? Let's clear.
            this.currentDirectoryItems = null; // Clear cache when going back
            this.renderMenuContent().then(() => {
                // Focus search input if going back to file/dir view
                if (this.currentMenuLevel === 'files' || this.currentMenuLevel === 'directories') {
                    setTimeout(() => this.searchInput.focus(), 0);
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
            // Don't hide here, maybe user hit backspace accidentally
            // this.hidePopupMenu();
        }
    }
    async listCurrentDirectoryContents(basePath) {
        console.log(`POPUP: Listing directory contents for path: '${basePath}'`);
        try {
            const effectivePath = basePath === '/' ? '' : basePath;
            const pathForApi = effectivePath.endsWith('/') && effectivePath.length > 1 ? effectivePath.slice(0, -1) : effectivePath;
            const contents = await this.docManager.services.contents.get(pathForApi || '');
            if (contents.type === 'directory') {
                let items = contents.content.map((item) => ({
                    name: item.name,
                    path: item.path,
                    type: item.type === 'directory' ? 'directory' : 'file'
                }));
                items = items.filter((item) => item.type === 'file' || item.type === 'directory');
                console.log(`POPUP: Raw directory items for '${basePath}':`, items.length);
                return items.sort((a, b) => {
                    if (a.type === 'directory' && b.type !== 'directory')
                        return -1;
                    if (a.type !== 'directory' && b.type === 'directory')
                        return 1;
                    return a.name.localeCompare(b.name);
                });
            }
            else {
                console.error('Path is not a directory:', basePath);
                return []; // Return empty array instead of null for consistency
            }
        }
        catch (error) {
            console.error(`POPUP: Error listing directory contents for '${basePath}':`, error);
            return []; // Return empty array on error
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
                if (fileBrowserWidget && ((_a = fileBrowserWidget.model) === null || _a === void 0 ? void 0 : _a.path)) {
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
        if (this.popupMenuContainer.style.display === 'none') {
            return; // Menu not visible
        }
        // --- Check if the event target is the search input FIRST ---
        if (event.target === this.searchInput) {
            console.log(`POPUP KeyDown (Target Search): Key='${event.key}'`);
            switch (event.key) {
                case 'Escape':
                    event.preventDefault(); // Prevent default Esc behavior (like clearing input)
                    // Stop propagation handled by input's listener, but do it again just in case
                    event.stopPropagation();
                    this.hidePopupMenu();
                    break;
                case 'Enter':
                    event.preventDefault(); // Prevent form submission
                    event.stopPropagation();
                    // Maybe select first item?
                    const menuItemsForEnter = this.getMenuItems();
                    if (menuItemsForEnter.length > 0) {
                        this.selectedMenuItemIndex = 0; // Select first
                        this.updateSelectionHighlight();
                        menuItemsForEnter[0].click(); // Activate first item
                    }
                    break;
                case 'ArrowUp':
                case 'ArrowDown':
                    event.preventDefault(); // Prevent cursor move in input
                    event.stopPropagation();
                    this.searchInput.blur(); // Move focus away
                    if (event.key === 'ArrowDown') {
                        this.selectNextMenuItem(); // Select first item
                    }
                    else {
                        this.selectPreviousMenuItem(); // Select last item
                    }
                    break;
                case 'Tab':
                    // Allow default tab behavior *or* implement custom cycle
                    event.preventDefault(); // Prevent default tab
                    event.stopPropagation();
                    // Tab moves focus to the first menu item
                    this.searchInput.blur();
                    this.selectNextMenuItem(); // Selects first
                    // Optionally focus the item visually:
                    // this.getMenuItems()[this.selectedMenuItemIndex]?.focus();
                    break;
                default:
                    // Allow Backspace, letters, etc. - DO NOTHING HERE
                    // Let the browser handle the input field editing.
                    // The 'input' event listener will handle re-filtering the list.
                    console.log(`POPUP KeyDown (Target Search): Allowing default for key '${event.key}'`);
                    // Crucially, DO NOT stopPropagation or preventDefault
                    break;
            }
            // Handled or allowed default, return from main handler
            return;
        }
        // --- If the event target is NOT the search input ---
        console.log(`POPUP KeyDown (Target Menu): Key='${event.key}'`);
        const menuItems = this.getMenuItems();
        switch (event.key) {
            case 'ArrowDown':
            case 'ArrowUp': // Consolidate arrow handling
                if (menuItems.length > 0) {
                    event.preventDefault();
                    event.stopPropagation();
                    if (event.key === 'ArrowDown')
                        this.selectNextMenuItem();
                    else
                        this.selectPreviousMenuItem();
                }
                break;
            case 'Backspace':
                if (this.menuHistory.length > 0) {
                    event.preventDefault(); // Prevent default only if navigating
                    event.stopPropagation();
                    this.navigateBackMenu();
                }
                else {
                    // At top level, DO NOTHING - allow backspace to potentially affect chat input
                    console.log('POPUP KeyDown (Target Menu): Allowing Backspace at top level.');
                }
                break;
            case 'Enter':
                if (this.selectedMenuItemIndex >= 0 && this.selectedMenuItemIndex < menuItems.length) {
                    event.preventDefault();
                    event.stopPropagation();
                    console.log(`POPUP KeyDown (Target Menu): Clicking item ${this.selectedMenuItemIndex}`);
                    menuItems[this.selectedMenuItemIndex].click();
                }
                break;
            case 'Tab':
                event.preventDefault(); // Prevent default tab
                event.stopPropagation();
                // If in file/dir view, Tab from menu moves to search input
                if (this.currentMenuLevel === 'files' || this.currentMenuLevel === 'directories') {
                    this.deselectAllMenuItems();
                    this.searchInput.focus();
                }
                else {
                    // From top-level menu, maybe close? Or cycle? Let's close.
                    this.hidePopupMenu();
                }
                break;
            case 'Escape':
                event.preventDefault();
                event.stopPropagation();
                this.hidePopupMenu();
                break;
            default:
                // If typing a character and in file/dir view, focus search
                if ((this.currentMenuLevel === 'files' || this.currentMenuLevel === 'directories') &&
                    event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.searchInput.focus();
                    // Append character and trigger input event
                    this.searchInput.value += event.key;
                    this.searchInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                }
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
     * Get all interactive menu items from the items container
     */
    getMenuItems() {
        // Query only within the specific items container
        const items = Array.from(this.itemsContainer.querySelectorAll('.jp-llm-ext-popup-menu-item'));
        return items.filter(item => {
            const actionId = item.dataset.actionId;
            // Filter out non-interactive items
            return actionId && actionId !== 'loading' && actionId !== 'empty' && actionId !== 'error';
        });
    }
}
exports.PopupMenuManager = PopupMenuManager;


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
const marked_1 = __webpack_require__(/*! marked */ "webpack/sharing/consume/default/marked/marked");
const dompurify_1 = __importDefault(__webpack_require__(/*! dompurify */ "webpack/sharing/consume/default/dompurify/dompurify"));
const icons_1 = __webpack_require__(/*! ./icons */ "./lib/icons.js");
const globals_1 = __webpack_require__(/*! ./globals */ "./lib/globals.js");
const api_client_1 = __webpack_require__(/*! ./api-client */ "./lib/api-client.js");
const markdown_config_1 = __webpack_require__(/*! ./markdown-config */ "./lib/markdown-config.js");
const popup_menu_manager_1 = __webpack_require__(/*! ./popup-menu-manager */ "./lib/popup-menu-manager.js");
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
         * Handles keyboard shortcuts
         */
        this.handleKeyDown = (event) => {
            var _a, _b;
            // Check for @ key (for context menu) - changed from Ctrl+@
            if (event.key === '@') {
                // Prevent default browser behavior
                event.preventDefault();
                event.stopPropagation();
                // Only show menu if input field is focused
                if (document.activeElement === this.inputField) {
                    // Get cursor position in input field
                    const cursorPosition = this.inputField.selectionStart || 0;
                    const textBeforeCursor = this.inputField.value.substring(0, cursorPosition);
                    // Calculate position to show menu
                    const inputRect = this.inputField.getBoundingClientRect();
                    const lineHeight = parseInt(window.getComputedStyle(this.inputField).lineHeight) || 20;
                    // Count newlines before cursor to determine vertical position
                    const linesBeforeCursor = (textBeforeCursor.match(/\n/g) || []).length;
                    // Calculate cursor position within current line
                    const lastNewline = textBeforeCursor.lastIndexOf('\n');
                    const charsInCurrentLine = lastNewline === -1 ? cursorPosition : cursorPosition - lastNewline - 1;
                    // Estimate horizontal position (using average character width)
                    const charWidth = 8; // Approximate width of a character in pixels
                    const horizontalOffset = charsInCurrentLine * charWidth;
                    // Calculate positions
                    const left = inputRect.left + horizontalOffset;
                    // Calculate the cursor's vertical position
                    const cursorTop = inputRect.top + (linesBeforeCursor * lineHeight);
                    console.log(`Showing popup at cursor position: (${left}, ${cursorTop})`);
                    // Insert @ symbol at cursor position
                    const newValue = this.inputField.value.substring(0, cursorPosition) +
                        '@' +
                        this.inputField.value.substring(cursorPosition);
                    this.inputField.value = newValue;
                    // Move cursor after the @ symbol
                    this.inputField.selectionStart = cursorPosition + 1;
                    this.inputField.selectionEnd = cursorPosition + 1;
                    // Show the popup menu above the cursor position
                    this.popupMenuManager.showPopupMenu(left + 60, cursorTop - 20);
                    this.showKeyboardShortcutIndicator('Context menu opened');
                }
            }
            // Check for Ctrl+L (for selected code)
            else if (event.ctrlKey && event.key.toLowerCase() === 'l') {
                // Prevent default browser behavior
                event.preventDefault();
                event.stopPropagation();
                // Get the current active cell
                const cell = (_a = globals_1.globals.notebookTracker) === null || _a === void 0 ? void 0 : _a.activeCell;
                if (!cell || !cell.editor) {
                    return;
                }
                try {
                    // Get the CodeMirror editor instance
                    const editor = cell.editor;
                    const view = editor.editor;
                    if (!view) {
                        return;
                    }
                    // Check if there's a selection
                    const state = view.state;
                    const selection = state.selection;
                    if (!selection.main.empty) {
                        // If there's a selection, use @code
                        const from = selection.main.from;
                        const to = selection.main.to;
                        const selectedText = state.doc.sliceString(from, to);
                        this.appendToInput(`@code ${selectedText}`);
                        this.showKeyboardShortcutIndicator('Selected code inserted');
                    }
                    else {
                        // If no selection, use @cell
                        const cellContext = (_b = globals_1.globals.cellContextTracker) === null || _b === void 0 ? void 0 : _b.getCurrentCellContext();
                        if (cellContext) {
                            this.appendToInput(`@cell ${cellContext.text}`);
                            this.showKeyboardShortcutIndicator('Cell content inserted');
                        }
                    }
                    // Ensure the sidebar is visible and focused
                    if (this.isHidden) {
                        this.show();
                    }
                    this.inputField.focus();
                }
                catch (error) {
                    console.error('Error handling keyboard shortcut:', error);
                }
            }
        };
        this.docManager = docManager;
        this.id = 'simple-sidebar';
        this.title.label = '';
        this.title.caption = 'AI Chat Interface';
        this.title.icon = icons_1.extensionIcon;
        this.title.closable = true;
        // Add the main CSS class for styling
        this.addClass('jp-llm-ext-sidebar');
        // Initialize API client
        this.apiClient = new api_client_1.ApiClient();
        // Initialize container elements before creating layout
        this.messageContainer = document.createElement('div');
        this.inputField = document.createElement('textarea');
        this.titleInput = document.createElement('input');
        this.historyContainer = document.createElement('div');
        this.keyboardShortcutIndicator = document.createElement('div');
        this.keyboardShortcutIndicator.className = 'jp-llm-ext-keyboard-shortcut-indicator';
        this.node.appendChild(this.keyboardShortcutIndicator);
        // Create settings modal
        this.settingsModalContainer = this.createSettingsModal();
        this.node.appendChild(this.settingsModalContainer);
        // Instantiate the PopupMenuManager with callbacks
        this.popupMenuManager = new popup_menu_manager_1.PopupMenuManager(this.docManager, this.node, {
            insertCode: (code) => this.appendToInput(`code ${code}`),
            insertCell: (content) => this.appendToInput(`cell ${content}`),
            insertFilePath: (path) => this.appendToInput(`file ${path}`),
            insertDirectoryPath: (path) => this.appendToInput(`directory ${path}`), // If needed
            getSelectedText: () => this.getSelectedText(),
            getCurrentCellContent: () => this.getCurrentCellContent(),
        });
        // Create a new chat on start
        this.createNewChat();
        this.node.appendChild(this.createLayout());
        // Pop-up menu will be attached to document.body when shown
        // Add keyboard shortcut listener
        document.addEventListener('keydown', this.handleKeyDown);
    }
    /**
     * Shows a visual indicator for keyboard shortcuts
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
     * Disposes all resources
     */
    dispose() {
        // Remove keyboard shortcut listener
        document.removeEventListener('keydown', this.handleKeyDown);
        // Remove keyboard shortcut indicator
        if (this.keyboardShortcutIndicator.parentNode) {
            this.keyboardShortcutIndicator.parentNode.removeChild(this.keyboardShortcutIndicator);
        }
        // Dispose the popup menu manager
        if (this.popupMenuManager) {
            this.popupMenuManager.dispose();
        }
        super.dispose();
    }
    /**
     * Creates the main layout for the sidebar
     */
    createLayout() {
        // Create the main container
        const mainContent = document.createElement('div');
        // The main class 'jp-llm-ext-sidebar' is added to this.node in the constructor
        // This container can have its own class if needed for further nesting/styling
        mainContent.className = 'jp-llm-ext-content-wrapper';
        // Create title input container
        const titleContainer = document.createElement('div');
        titleContainer.className = 'jp-llm-ext-title-container';
        // Set up title input
        this.titleInput.className = 'chat-title-input'; // Assuming this is styled correctly in CSS
        this.titleInput.type = 'text';
        this.titleInput.placeholder = 'Chat title';
        this.titleInput.value = 'New Chat';
        this.titleInput.addEventListener('change', () => this.updateCurrentChatTitle());
        titleContainer.appendChild(this.titleInput);
        // Create New Chat & History buttons
        const newChatButton = document.createElement('button');
        newChatButton.className = 'jp-Button jp-llm-ext-action-button';
        newChatButton.textContent = '+ New Chat';
        newChatButton.title = 'Start a new chat';
        newChatButton.addEventListener('click', () => this.createNewChat());
        const historyButton = document.createElement('button');
        historyButton.className = 'jp-Button jp-llm-ext-action-button';
        historyButton.textContent = 'History';
        historyButton.title = 'View chat history';
        historyButton.addEventListener('click', () => this.toggleHistoryView());
        // Configure message container
        this.messageContainer.className = 'jp-llm-ext-message-container';
        // Configure history container
        this.historyContainer.className = 'jp-llm-ext-history-container';
        this.historyContainer.style.display = 'none';
        // Configure input field (directly used later)
        this.inputField.placeholder = 'Ask me anything...';
        this.inputField.rows = 1;
        this.inputField.className = 'jp-llm-ext-input-field'; // Add class for styling
        // Add keypress listener to input field
        this.inputField.addEventListener('keypress', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                this.handleSendMessage();
            }
        });
        // Create send button container (directly used later)
        const inputActionsContainer = document.createElement('div');
        inputActionsContainer.className = 'jp-llm-ext-input-actions-container';
        // Create send button
        const sendButton = document.createElement('button');
        sendButton.className = 'jp-Button jp-llm-ext-send-button';
        sendButton.textContent = 'Send';
        sendButton.addEventListener('click', () => this.handleSendMessage());
        inputActionsContainer.appendChild(sendButton);
        // Create controls container (Markdown toggle, @, etc.) (directly used later)
        const controlsContainer = this.createControlsContainer();
        // Create the new bottom bar container with three rows
        const bottomBarContainer = document.createElement('div');
        bottomBarContainer.className = 'jp-llm-ext-bottom-bar-container';
        this.bottomBarContainer = bottomBarContainer;
        // First row: Controls (Markdown toggle and action buttons)
        const topRow = document.createElement('div');
        topRow.className = 'jp-llm-ext-bottom-bar-row jp-llm-ext-controls-row';
        topRow.appendChild(controlsContainer);
        // Second row: Input field
        const middleRow = document.createElement('div');
        middleRow.className = 'jp-llm-ext-bottom-bar-row jp-llm-ext-input-row';
        middleRow.appendChild(this.inputField);
        // Third row: Action buttons (Send, New Chat, History)
        const bottomRow = document.createElement('div');
        bottomRow.className = 'jp-llm-ext-bottom-bar-row jp-llm-ext-buttons-row';
        // Add all buttons to bottom row
        bottomRow.appendChild(sendButton);
        bottomRow.appendChild(newChatButton);
        bottomRow.appendChild(historyButton);
        // Add all rows to the bottom bar container
        bottomBarContainer.appendChild(topRow);
        bottomBarContainer.appendChild(middleRow);
        bottomBarContainer.appendChild(bottomRow);
        // Assemble all main components
        mainContent.appendChild(titleContainer);
        mainContent.appendChild(this.messageContainer);
        mainContent.appendChild(this.historyContainer);
        mainContent.appendChild(bottomBarContainer);
        return mainContent;
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
            // Show history view, hide message view and bottom bar
            this.messageContainer.style.display = 'none';
            this.historyContainer.style.display = 'block';
            this.bottomBarContainer.style.display = 'none'; // Use class property directly
            this.titleInput.style.display = 'none';
            // Populate history
            this.renderChatHistory();
        }
        else {
            // Show message view and bottom bar, hide history view
            this.messageContainer.style.display = 'block';
            this.historyContainer.style.display = 'none';
            this.bottomBarContainer.style.display = 'flex'; // Use class property directly
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
            emptyMessage.className = 'jp-llm-ext-empty-history-message';
            emptyMessage.textContent = 'No chat history yet';
            this.historyContainer.appendChild(emptyMessage);
            return;
        }
        // Create a list of chat history items
        this.chatHistory.forEach(chat => {
            const historyItem = document.createElement('div');
            historyItem.className = 'jp-llm-ext-history-item';
            if (chat.id === this.currentChatId) {
                historyItem.classList.add('jp-llm-ext-active');
            }
            // Add title
            const title = document.createElement('div');
            title.className = 'jp-llm-ext-history-title';
            title.textContent = chat.title;
            // Add message preview
            const preview = document.createElement('div');
            preview.className = 'jp-llm-ext-history-preview';
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
        controlsContainer.className = 'jp-llm-ext-controls-container';
        // Create markdown toggle container
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'jp-llm-ext-toggle-container';
        // Create markdown toggle
        const markdownToggle = document.createElement('input');
        markdownToggle.type = 'checkbox';
        markdownToggle.id = 'markdown-toggle';
        // markdownToggle.style.marginRight = '5px'; // Style via CSS
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
        // toggleLabel.style.fontSize = '12px'; // Style via CSS
        // Add toggle elements to container
        toggleContainer.appendChild(markdownToggle);
        toggleContainer.appendChild(toggleLabel);
        // Create action buttons container (@, expand, settings)
        const actionButtonsContainer = document.createElement('div');
        actionButtonsContainer.className = 'jp-llm-ext-action-buttons-container';
        // Create all action buttons
        const buttons = [
            {
                text: '@',
                title: 'Insert context (@)',
                action: (event) => {
                    // Get the button's position
                    const targetButton = event.currentTarget;
                    const rect = targetButton.getBoundingClientRect();
                    // Show the popup menu above the button's top edge
                    this.popupMenuManager.showPopupMenu(rect.left + 60, rect.top - 20);
                    event.preventDefault();
                    event.stopPropagation();
                }
            },
            { text: '⤢', title: 'Expand input', action: () => this.toggleInputExpansion(actionButtonsContainer.children[3]) },
            { text: '⚙️', title: 'Settings', action: (event) => { event.preventDefault(); event.stopPropagation(); this.showSettingsModal(); } },
        ];
        // Add all buttons to the container
        buttons.forEach(button => {
            const btn = this.createButton(button.text, button.title);
            btn.addEventListener('click', (e) => button.action(e));
            actionButtonsContainer.appendChild(btn);
        });
        // Add toggle and action buttons to the controls container
        // controlsContainer is now just for these inline controls, above the input field
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
            // Adjust height based on a class or CSS variable instead of fixed pixels if possible
            this.inputField.style.height = '200px';
            this.inputField.style.resize = 'vertical';
            button.textContent = '⤡';
            button.title = 'Collapse input';
        }
        else {
            this.inputField.style.height = ''; // Reset height
            this.inputField.style.resize = 'none';
            this.inputField.rows = 1; // Ensure it collapses back to 1 row height
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
        button.className = 'jp-Button jp-llm-ext-action-button';
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
            this.inputField.rows = 1; // Reset rows after sending
            this.inputField.style.height = ''; // Reset height after sending
            // Reset expanded state if needed after sending
            if (this.isInputExpanded) {
                // Find the expand button to reset its state if needed (this might need adjustment based on final structure)
                const expandButton = this.node.querySelector('.jp-llm-ext-action-buttons-container button[title*="Collapse"]');
                if (expandButton) {
                    this.toggleInputExpansion(expandButton); // Collapse after sending
                }
                else {
                    this.inputField.style.height = ''; // Fallback reset
                    this.inputField.rows = 1;
                }
            }
            // Create a temporary message container for the bot's streaming response
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'jp-llm-ext-bot-message';
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
                    // Add action buttons to the bot message
                    console.log('Adding action buttons to streamed bot message');
                    const actionsDiv = document.createElement('div');
                    actionsDiv.className = 'jp-llm-ext-message-actions';
                    actionsDiv.style.display = 'flex'; // Ensure display is set
                    // Copy button with icon
                    const copyButton = document.createElement('button');
                    copyButton.className = 'jp-llm-ext-message-action-button';
                    copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
                    copyButton.title = 'Copy message to clipboard';
                    copyButton.addEventListener('click', (event) => {
                        event.stopPropagation();
                        this.copyMessageToClipboard(completeResponse);
                    });
                    actionsDiv.appendChild(copyButton);
                    // Add to button with icon
                    const addToButton = document.createElement('button');
                    addToButton.className = 'jp-llm-ext-message-action-button';
                    addToButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M12 11v6"></path><path d="M9 14h6"></path></svg>';
                    addToButton.title = 'Add message to current cell';
                    addToButton.addEventListener('click', (event) => {
                        event.stopPropagation();
                        this.addMessageToCell(completeResponse);
                    });
                    actionsDiv.appendChild(addToButton);
                    // Add buttons to message
                    botMessageDiv.appendChild(actionsDiv);
                    console.log('Action buttons added to bot message:', actionsDiv);
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
        console.log('Adding message:', { sender, isMarkdown }); // Debug log
        const messageDiv = document.createElement('div');
        messageDiv.className = sender === 'user' ? 'jp-llm-ext-user-message' : 'jp-llm-ext-bot-message';
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
            // Add action buttons for bot messages
            if (sender === 'bot') {
                console.log('Adding action buttons to bot message'); // Debug log
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'jp-llm-ext-message-actions';
                // Copy button with icon
                const copyButton = document.createElement('button');
                copyButton.className = 'jp-llm-ext-message-action-button';
                copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
                copyButton.title = 'Copy message to clipboard';
                copyButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    this.copyMessageToClipboard(text);
                });
                actionsDiv.appendChild(copyButton);
                // Add to button with icon
                const addToButton = document.createElement('button');
                addToButton.className = 'jp-llm-ext-message-action-button';
                addToButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M12 11v6"></path><path d="M9 14h6"></path></svg>';
                addToButton.title = 'Add message to current cell';
                addToButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    this.addMessageToCell(text);
                });
                actionsDiv.appendChild(addToButton);
                // Add buttons to message
                messageDiv.appendChild(actionsDiv);
                console.log('Action buttons added to message:', actionsDiv); // Debug log
            }
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
     * Copies message content to clipboard
     */
    copyMessageToClipboard(text) {
        try {
            navigator.clipboard.writeText(text).then(() => {
                console.log('Content copied to clipboard');
                // Find the button element that was clicked
                const buttons = document.querySelectorAll('.jp-llm-ext-message-action-button');
                let clickedButton = null;
                for (let i = 0; i < buttons.length; i++) {
                    const button = buttons[i];
                    if (button.title === 'Copy message to clipboard' && button === document.activeElement) {
                        clickedButton = button;
                        break;
                    }
                }
                // Show visual feedback if we found the button
                if (clickedButton) {
                    const originalHTML = clickedButton.innerHTML;
                    clickedButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>';
                    setTimeout(() => {
                        clickedButton.innerHTML = originalHTML;
                    }, 2000);
                }
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        }
        catch (error) {
            console.error('Error copying to clipboard:', error);
        }
    }
    /**
     * Adds message content to the current cell
     */
    addMessageToCell(text) {
        var _a;
        const cell = (_a = globals_1.globals.notebookTracker) === null || _a === void 0 ? void 0 : _a.activeCell;
        if (!cell || !cell.editor) {
            return;
        }
        try {
            const editor = cell.editor;
            const view = editor.editor;
            if (!view) {
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
                selection: { anchor: cursorPos + text.length + 1 }
            });
            view.dispatch(transaction);
        }
        catch (error) {
            console.error('Error adding message to cell:', error);
        }
    }
    /**
     * Gets the currently selected text from the active notebook cell.
     * (Helper for PopupMenuManager callback)
     */
    getSelectedText() {
        var _a, _b, _c;
        const cell = (_a = globals_1.globals.notebookTracker) === null || _a === void 0 ? void 0 : _a.activeCell;
        if (cell === null || cell === void 0 ? void 0 : cell.editor) {
            const editor = cell.editor; // IEditor
            // Access CodeMirror editor instance if possible
            const cmEditor = editor.editor;
            if (cmEditor && cmEditor.state) {
                const state = cmEditor.state;
                const selection = state.selection.main; // Get the main selection
                if (selection.empty) {
                    return null; // No text selected
                }
                return state.doc.sliceString(selection.from, selection.to);
            }
            console.warn("Could not access CodeMirror state to get selection.");
            // Avoid using getRange as it's confirmed not to exist on IEditor
            return null;
        }
        else {
            // Attempt to get selection from document if no notebook active (e.g., text editor)
            const activeWidget = (_c = (_b = globals_1.globals.app) === null || _b === void 0 ? void 0 : _b.shell) === null || _c === void 0 ? void 0 : _c.currentWidget;
            if (activeWidget && 'content' in activeWidget && activeWidget.content.editor) {
                const editor = activeWidget.content.editor;
                const cmEditor = editor.editor;
                if (cmEditor && cmEditor.state) {
                    const state = cmEditor.state;
                    const selection = state.selection.main;
                    if (selection.empty) {
                        return null;
                    }
                    return state.doc.sliceString(selection.from, selection.to);
                }
                console.warn("Could not access CodeMirror state for non-notebook editor selection.");
                return null; // Avoid getRange
            }
        }
        return null;
    }
    /**
     * Gets the content of the currently active notebook cell.
     * (Helper for PopupMenuManager callback)
     */
    getCurrentCellContent() {
        var _a, _b, _c;
        const activeCell = (_a = globals_1.globals.notebookTracker) === null || _a === void 0 ? void 0 : _a.activeCell;
        if (activeCell === null || activeCell === void 0 ? void 0 : activeCell.model) {
            // Try using sharedModel first (more robust)
            if (activeCell.model.sharedModel && typeof activeCell.model.sharedModel.getSource === 'function') {
                return activeCell.model.sharedModel.getSource();
            }
            // Fallback: Try using toJSON().source
            const cellJson = activeCell.model.toJSON();
            if (typeof (cellJson === null || cellJson === void 0 ? void 0 : cellJson.source) === 'string') {
                return cellJson.source;
            }
            else if (Array.isArray(cellJson === null || cellJson === void 0 ? void 0 : cellJson.source)) {
                // If source is an array of strings, join them
                return cellJson.source.join('\n');
            }
            console.warn("Could not get cell content via model.value.text or toJSON().source");
            return null;
        }
        // Fallback for non-notebook editors if needed
        const activeWidget = (_c = (_b = globals_1.globals.app) === null || _b === void 0 ? void 0 : _b.shell) === null || _c === void 0 ? void 0 : _c.currentWidget;
        if (activeWidget && 'content' in activeWidget && activeWidget.content.model) {
            return activeWidget.content.model.value.text;
        }
        return null;
    }
    /**
     * Appends text to the input field with proper spacing
     */
    appendToInput(text) {
        try {
            const currentValue = this.inputField.value;
            if (currentValue) {
                // add a space between the current value and the new text
                this.inputField.value = `${currentValue}${text}`;
            }
            else {
                this.inputField.value = text;
            }
            // Focus the input field and move cursor to end
            this.inputField.focus();
            this.inputField.setSelectionRange(this.inputField.value.length, this.inputField.value.length);
        }
        catch (error) {
            console.error('Error appending to input:', error);
        }
    }
    // Settings modal methods
    createSettingsModal() {
        const modal = document.createElement('div');
        modal.className = 'jp-llm-ext-settings-modal';
        modal.style.display = 'none'; // Keep this inline style for toggling visibility
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
        providerSelect.id = 'settings-provider';
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
        apiKeyInput.id = 'settings-api-key';
        form.appendChild(apiKeyInput);
        // API URL input
        const apiUrlLabel = document.createElement('label');
        apiUrlLabel.className = 'jp-llm-ext-settings-label';
        apiUrlLabel.textContent = 'API URL (optional):';
        form.appendChild(apiUrlLabel);
        const apiUrlInput = document.createElement('input');
        apiUrlInput.className = 'jp-llm-ext-settings-input';
        apiUrlInput.type = 'text';
        apiUrlInput.id = 'settings-api-url';
        form.appendChild(apiUrlInput);
        // Rules input
        const rulesLabel = document.createElement('label');
        rulesLabel.className = 'jp-llm-ext-settings-label';
        rulesLabel.textContent = 'Custom Rules (optional):';
        form.appendChild(rulesLabel);
        const rulesInput = document.createElement('textarea');
        rulesInput.className = 'jp-llm-ext-settings-textarea';
        rulesInput.id = 'settings-rules';
        form.appendChild(rulesInput);
        // Buttons container
        const btnContainer = document.createElement('div');
        btnContainer.className = 'jp-llm-ext-settings-buttons';
        const saveBtn = document.createElement('button');
        saveBtn.className = 'jp-llm-ext-settings-button jp-llm-ext-settings-save-button';
        saveBtn.textContent = 'Save';
        saveBtn.addEventListener('click', (event) => {
            event.preventDefault(); // Add this line
            const provider = document.getElementById('settings-provider').value;
            const key = document.getElementById('settings-api-key').value;
            const url = document.getElementById('settings-api-url').value;
            const rules = document.getElementById('settings-rules').value;
            console.log('Settings saved:', { provider, key, url, rules });
            this.hideSettingsModal();
            this.popSaveSuccess();
        });
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'jp-llm-ext-settings-button jp-llm-ext-settings-cancel-button';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', (event) => {
            event.preventDefault(); // Add this line
            this.hideSettingsModal();
        });
        btnContainer.appendChild(saveBtn);
        btnContainer.appendChild(cancelBtn);
        form.appendChild(btnContainer);
        content.appendChild(form);
        modal.appendChild(content);
        return modal;
    }
    showSettingsModal() {
        this.settingsModalContainer.style.display = 'flex';
    }
    hideSettingsModal() {
        this.settingsModalContainer.style.display = 'none';
    }
    popSaveSuccess() {
        const successMessage = document.createElement('div');
        successMessage.className = 'jp-llm-ext-settings-success-message';
        successMessage.textContent = 'Settings saved successfully';
        this.settingsModalContainer.appendChild(successMessage);
        setTimeout(() => {
            successMessage.remove();
        }, 3000);
    }
}
exports.SimpleSidebarWidget = SimpleSidebarWidget;


/***/ })

}]);
//# sourceMappingURL=lib_index_js.588c4e01689c7ccb1233.js.map