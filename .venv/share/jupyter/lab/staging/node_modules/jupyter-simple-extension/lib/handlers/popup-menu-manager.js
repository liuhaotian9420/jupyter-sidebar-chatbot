"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PopupMenuManager = void 0;
const globals_1 = require("../core/globals");
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
                // Optionally focus the first item for immediate keyboard nav
                // const menuItems = this.getMenuItems();
                // if (menuItems.length > 0) menuItems[0].focus(); 
            }
        }, 0); // 0ms delay is usually sufficient
    }
    hidePopupMenu() {
        if (this.popupMenuContainer.style.display !== 'none') {
            console.log('POPUP: Hiding menu. Called from:', new Error().stack);
            this.popupMenuContainer.style.display = 'none';
            this.currentMenuLevel = 'top'; // Reset level
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
                    this.callbacks.insertFilePath(path); // Call the appropriate callback
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
                    // Construct the reference text (e.g., "@dir path/to/directory")
                    // const refText = `@dir ${path}`;
                    // console.log("TODO: Implement directory reference insertion: ", refText);
                    this.callbacks.insertDirectoryPath(path); // Call the appropriate callback
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
        const lastSlash = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
        if (lastSlash === -1)
            return ''; // No directory part, likely root or just a filename
        return path.substring(0, lastSlash);
    }
    /**
     * Handle keyboard navigation when the popup menu is shown
     */
    handleKeyDown(event) {
        // Only handle keys if the popup is visible
        if (!this.isPopupMenuVisible()) {
            return;
        }
        console.log(`POPUP Document KeyDown: Key='${event.key}', Target=`, event.target);
        // Allow default browser search behavior (e.g., Cmd+F)
        if (event.metaKey || event.ctrlKey) {
            return;
        }
        // If focus is inside the search input, let its handler manage navigation keys
        if (event.target === this.searchInput) {
            console.log('POPUP (Document): Key event target is search input, skipping document handler.');
            // Allow Backspace etc. to work naturally in search input
            if (['ArrowUp', 'ArrowDown', 'Enter', 'Tab', 'Escape'].includes(event.key)) {
                // Let the search input's keydown handle Escape, stop propagation
                // But let the main handler process Up/Down/Enter/Tab by blurring
                if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                    // Trigger blur to shift focus to menu items
                    this.searchInput.blur();
                    // Prevent default scrolling behavior
                    event.preventDefault();
                    // Process the key event now in the menu context
                    this.processMenuNavigation(event.key);
                }
                else if (event.key === 'Enter') {
                    this.searchInput.blur();
                    event.preventDefault();
                    this.processMenuNavigation(event.key);
                }
                else if (event.key === 'Tab') {
                    // Allow tabbing away (or maybe cycle focus?)
                    this.searchInput.blur();
                    // Don't prevent default - allow tabbing
                }
                else if (event.key === 'Escape') {
                    // Already handled by searchInput's listener, just stop propagation
                    event.stopPropagation();
                }
            }
            else {
                // Allow other keys (typing) in the search input
                return;
            }
        }
        else {
            // Focus is NOT in the search input, process normally
            this.processMenuNavigation(event.key);
            // Prevent default browser actions for these keys when menu is active
            if (['ArrowUp', 'ArrowDown', 'Enter', 'Tab', 'Escape'].includes(event.key)) {
                event.preventDefault();
                event.stopPropagation();
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
                    if (menuItems[this.selectedMenuItemIndex]) {
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
                    // If no item is selected, maybe select the first one and activate?
                    const menuItems = this.getMenuItems();
                    if (menuItems.length > 0) {
                        menuItems[0].click(); // Activate first item
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
     * or the initial anchor point. Tries to position the BOTTOM of the menu
     * just ABOVE the range/anchor.
     */
    updatePopupPosition() {
        if (!this.widgetNode)
            return;
        const widgetRect = this.widgetNode.getBoundingClientRect();
        let targetTop;
        let targetLeft;
        // Use the anchor coordinates provided (now from the reliable temp span)
        if (this._anchorX !== undefined && this._anchorY !== undefined) {
            console.log(`POPUP: Positioning based on anchor point: (${this._anchorX}, ${this._anchorY})`);
            // Target position relative to viewport
            targetTop = this._anchorY;
            targetLeft = this._anchorX;
        }
        else {
            console.warn("POPUP: Cannot update position - no anchor point provided.");
            return;
        }
        // Make sure the popup is visible and rendered to get its height
        this.popupMenuContainer.style.visibility = 'hidden'; // Keep it hidden while calculating
        this.popupMenuContainer.style.display = 'block';
        const popupHeight = this.popupMenuContainer.offsetHeight;
        const popupWidth = this.popupMenuContainer.offsetWidth;
        // Calculate desired 'top' style relative to the widgetNode
        // Position the bottom of the popup just above the target's top
        let top = (targetTop - widgetRect.top) - popupHeight;
        // Calculate desired 'left' style relative to the widgetNode
        let left = targetLeft - widgetRect.left;
        // --- Boundary checks (relative to widget) ---
        const widgetClientWidth = this.widgetNode.clientWidth; // Use clientWidth for inner width
        const widgetClientHeight = this.widgetNode.clientHeight;
        // Prevent going off the left edge of the widget
        if (left < 0) {
            left = 5; // Small padding
            console.log("POPUP Adjust: Corrected left edge");
        }
        // Prevent going off the right edge of the widget
        if (left + popupWidth > widgetClientWidth) {
            left = widgetClientWidth - popupWidth - 5; // Adjust left, add padding
            console.log("POPUP Adjust: Corrected right edge");
        }
        // Prevent going off the top edge of the widget
        if (top < 0) {
            // If it goes off the top, try positioning it *below* the target instead
            const spaceBelow = widgetClientHeight - (targetTop - widgetRect.top + 10); // Space below target
            if (spaceBelow >= popupHeight) {
                top = (targetTop - widgetRect.top) + 10; // Position below target with padding
                console.log("POPUP Adjust: Flipping below target (was off top)");
            }
            else {
                // Not enough space below either, clamp to top
                top = 5; // Small padding from top
                console.log("POPUP Adjust: Clamped to top edge (no space below)");
            }
        }
        console.log(`POPUP: Setting position - Top: ${top}px, Left: ${left}px (Relative to Widget)`);
        this.popupMenuContainer.style.top = `${top}px`;
        this.popupMenuContainer.style.left = `${left}px`;
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
