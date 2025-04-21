"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PopupMenuManager = void 0;
const globals_1 = require("./globals");
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
