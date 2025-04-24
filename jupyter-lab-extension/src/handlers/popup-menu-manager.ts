import { IDocumentManager } from '@jupyterlab/docmanager';
import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook'; 
import { globals } from '../core/globals';

/**
 * Interface for actions to be performed when a menu item is selected.
 */
export interface MenuActionCallbacks {
    insertCode: (code: string) => void;
    insertCell: (content: string) => void;
    handleInsertFileWidget: (path: string) => void;
    handleInsertDirWidget: (path: string) => void;
    getSelectedText: () => string | null;
    getCurrentCellContent: () => string | null;
    insertCellByIndex: (index: number) => void; // New callback for cell selection
    insertCollapsedCodeRef: (code: string, cellIndex: number, lineNumber: number, notebookName: string) => void; // New callback for collapsed references
}

/**
 * Manages the state and interactions of the multi-level popup menu.
 */
export class PopupMenuManager {
    private popupMenuContainer: HTMLDivElement;
    private searchInput: HTMLInputElement;
    private currentMenuLevel: 'top' | 'files' | 'directories' | 'cells' = 'top';
    private currentMenuPath: string = '';
    private menuHistory: { level: 'top' | 'files' | 'directories' | 'cells', path: string }[] = [];
    private docManager: IDocumentManager;
    private widgetNode: HTMLElement; 
    private callbacks: MenuActionCallbacks; 
    private currentNotebook: NotebookPanel | null = null;
    private selectedMenuItemIndex: number = -1; // Track currently selected menu item
    private isRenderingContent: boolean = false; // Flag to prevent recursive renders
    private lastSearchTerm: string = ''; // Track last search term to avoid unnecessary re-renders
    private _anchorX?: number;
    private _anchorY?: number;
    private allowedExtensions: string[] = ['.py', '.ipynb', '.md', '.json', '.txt', '.csv'];
    private fileCache: Map<string, {name: string; path: string; type: 'file' | 'directory'; relativePath: string}[]> = new Map();
    private boundHandleKeyDown: (event: KeyboardEvent) => void;

    constructor(docManager: IDocumentManager, widgetNode: HTMLElement, callbacks: MenuActionCallbacks) {
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
                } else if (event.key === 'Enter') {
                    // Select first item on Enter
                    const menuItems = this.getMenuItems();
                    if (menuItems.length > 0) {
                        // If we already have a selection, click it
                        if (this.selectedMenuItemIndex >= 0 && this.selectedMenuItemIndex < menuItems.length) {
                            menuItems[this.selectedMenuItemIndex].click();
                        } else { 
                            // Otherwise, select and click the first item
                            this.selectedMenuItemIndex = 0;
                            this.updateSelectionHighlight();
                            menuItems[0].click(); 
                        }
                    }
                } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                    const menuItems = this.getMenuItems();
                    if (menuItems.length > 0) {
                        const direction = event.key === 'ArrowDown' ? 1 : -1;
                        
                        // If no selection yet, select first or last based on direction
                        if (this.selectedMenuItemIndex < 0) {
                            this.selectedMenuItemIndex = direction > 0 ? 0 : menuItems.length - 1;
                        } else {
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

        if (globals.notebookTracker) {
            this.currentNotebook = globals.notebookTracker.currentWidget;
            globals.notebookTracker.currentChanged.connect((sender: INotebookTracker, notebook: NotebookPanel | null) => {
                this.currentNotebook = notebook;
            });
        }
    }

    dispose(): void {
        document.removeEventListener('click', this.handleDocumentClick.bind(this), true);
        // Remove using the exact same bound function
        document.removeEventListener('keydown', this.boundHandleKeyDown, true);
        // Remove from widgetNode if attached
        if (this.popupMenuContainer.parentNode === this.widgetNode) {
            this.popupMenuContainer.parentNode.removeChild(this.popupMenuContainer);
        }
    }

    private handleDocumentClick(event: MouseEvent): void {
        if (this.popupMenuContainer.style.display !== 'none' && !this.popupMenuContainer.contains(event.target as Node)) {
            const atButton = this.widgetNode.querySelector('#jp-llm-ext-at-button'); 
            if (atButton && atButton.contains(event.target as Node)) {
                console.log('POPUP: Click was on the @ button, not hiding.');
                return; 
            }

            console.log('POPUP: Click detected outside the menu.');
            this.hidePopupMenu();
        }
    }

    async showPopupMenu(trigger: { x: number; y: number } | HTMLElement): Promise<void> { 
        let anchorX: number;
        let anchorY: number;

        if (trigger instanceof HTMLElement) {
            const rect = trigger.getBoundingClientRect();
            anchorX = rect.left; // Use button's top-left for anchor
            anchorY = rect.top;
            console.log(`POPUP: Showing menu triggered by element at (${anchorX}, ${anchorY})`);
        } else {
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
            } catch (error) {
                 console.error("POPUP: Error during deferred updatePopupPosition:", error);
            }
             
             // Focus the search input *after* positioning if in file/dir view
             // Otherwise, focus first menu item
            if (this.currentMenuLevel === 'files' || this.currentMenuLevel === 'directories') {
                 this.searchInput.focus();
                 console.log('POPUP: Focused search input after deferred positioning.');
                 this.selectedMenuItemIndex = -1; // Don't select an item if search is focused
            } else { // Top level or cells
                this.selectedMenuItemIndex = -1;
                 this.selectNextMenuItem(); // Select first item
                 console.log('POPUP: Selected first menu item');
            }
        }, 0); // 0ms delay is usually sufficient
    }

    hidePopupMenu(): void {
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

    private async renderMenuContent(): Promise<void> {
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
            } catch (err) {
                console.error("POPUP: Error calling updatePopupPosition after render:", err);
            }
        } catch (error) {
            console.error('POPUP: Error rendering menu content', error);
        } finally {
            this.isRenderingContent = false;
        }
    }

    private renderTopLevelItems(): void {
        const topLevelCommands: { label: string; description: string; actionId: string }[] = [
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

    private async renderDirectoryBrowserItems(): Promise<void> { 
        // Get search term
        const searchTerm = this.searchInput.value.toLowerCase().trim();

        const loadingItem = this.createMenuItem('Loading...', 'loading', '', '');
        loadingItem.style.pointerEvents = 'none'; 
        // Temporarily add loading item below search/path
        const insertionPoint = this.popupMenuContainer.querySelector('.jp-llm-ext-popup-menu-path')?.nextSibling;
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
                        
                        let actionId: string;
                        if (itemType === 'directory') {
                            actionId = this.currentMenuLevel === 'files' ? 'select-directory-navigate' : 'select-directory-callback';
                        } else { // itemType === 'file'
                            actionId = 'select-file';
                        }

                        const menuItem = this.createMenuItem(
                            `${icon} ${itemName}`, 
                            actionId, 
                            itemPath, 
                            relativePath !== '.' ? relativePath : ''
                        );
                        this.popupMenuContainer.appendChild(menuItem);
                    });
                } else {
                    const emptyItem = this.createMenuItem(searchTerm ? 'No matches found' : `No ${filterType}s found`, 'empty', '', '');
                    emptyItem.style.pointerEvents = 'none';
                    this.popupMenuContainer.appendChild(emptyItem);
                }
            } else {
                const emptyItem = this.createMenuItem(`No items found in this directory`, 'empty', '', '');
                emptyItem.style.pointerEvents = 'none';
                this.popupMenuContainer.appendChild(emptyItem);
            }
        } catch (error) {
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
    private async renderCellItems(): Promise<void> {
        // Get search term for filtering
        const searchTerm = this.searchInput.value.toLowerCase().trim();
        
        // Create a loading indicator
        const loadingItem = this.createMenuItem('Loading cells...', 'loading', '', '');
        loadingItem.style.pointerEvents = 'none';
        const insertionPoint = this.popupMenuContainer.querySelector('.jp-llm-ext-popup-menu-path')?.nextSibling;
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
                                   (cell.toJSON()?.source || '');
                
                // Use type casting to avoid TypeScript errors
                const executionCount = cellType === 'code' ? 
                                     ((cell as any).executionCount !== undefined && (cell as any).executionCount !== null ? 
                                      (cell as any).executionCount : '*') : 
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
                const cellItem = this.createMenuItem(
                    '', // Empty text, will be added as HTML
                    'select-cell',
                    i.toString() // Store cell index in path
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
            
        } catch (error) {
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

    private createMenuItem(text: string, actionId: string, path: string = '', description: string = ''): HTMLDivElement {
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

    private async handleMenuClick(event: MouseEvent): Promise<void> { 
        const target = event.currentTarget as HTMLDivElement;
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
                } else {
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
                        const notebookName = notebookPath.split('/').pop()?.split('.')[0] || 'notebook';
                        
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
                    } catch (error) {
                        console.error('Error creating collapsed code reference:', error);
                        // Fallback to inserting code directly
                        this.callbacks.insertCode(path);
                        this.hidePopupMenu();
                    }
                } else {
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
                    } else {
                        console.error('POPUP: Invalid cell index.');
                    }
                } else {
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
                } else {
                    console.error('POPUP: File selected but path is missing.');
                }
                break;
            case 'select-directory': 
                if (path) {
                    this.callbacks.handleInsertDirWidget(path); // NEW: Call widget insertion callback
                    this.hidePopupMenu();
                } else {
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
                } else {
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
                } else {
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

    async navigateMenu(level: 'files' | 'directories' | 'cells', path: string): Promise<void> { 
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
        } else {
            // Select first item if navigating back to top level
            this.selectedMenuItemIndex = -1;
             setTimeout(() => this.selectNextMenuItem(), 0);
        }
    }

    navigateBackMenu(): void {
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
                } else {
                    // Select first item if going back to top level
                    this.selectedMenuItemIndex = -1;
                     setTimeout(() => this.selectNextMenuItem(), 0);
                }
            });
        } else {
            console.log('POPUP: Already at the top level.');
            this.hidePopupMenu();
        }
    }

    async listCurrentDirectoryContents(basePath: string, filterType?: 'file' | 'directory'): Promise<{ name: string; path: string; type: 'file' | 'directory'; relativePath: string }[] | null> {
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
            let allResults: { name: string; path: string; type: 'file' | 'directory'; relativePath: string }[] = [];
            
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
                if (a.type === 'directory' && b.type !== 'directory') return -1;
                if (a.type !== 'directory' && b.type === 'directory') return 1;
                return a.name.localeCompare(b.name);
            });
            
            // Cache the results for future use
            this.fileCache.set(cacheKey, allResults);
            
            console.log(`POPUP: Found ${allResults.length} items for path '${basePath}'`);
            return allResults;
        } catch (error) {
            console.error(`POPUP: Error listing directory contents for '${basePath}':`, error);
            return null;
        }
    }

    private async setCurrentDirectoryPath(): Promise<void> {
        let dirPath: string | null = null;
        const app = globals.app;
        
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
                if (fileBrowserWidget && typeof (fileBrowserWidget as any).model?.path === 'string') {
                    dirPath = (fileBrowserWidget as any).model.path;
                    console.log(`POPUP: Path from file browser widget model: ${dirPath}`);
                } else {
                    console.log('POPUP: File browser widget path not directly accessible.');
                }
            } catch (e) {
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

    private getParentDirectory(path: string): string {
        if (!path) return ''; 
        const lastSlash = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
        if (lastSlash === -1) return ''; // No directory part, likely root or just a filename
        return path.substring(0, lastSlash);
    }

    /**
     * Handle keyboard navigation when the popup menu is shown
     */
    private handleKeyDown(event: KeyboardEvent): void {
        if (this.popupMenuContainer.style.display === 'none') return;
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
                     } else {
                         // Move selection in specified direction
                         this.selectedMenuItemIndex = 
                             (this.selectedMenuItemIndex + direction + menuItems.length) % menuItems.length;
                     }
                     
                     this.updateSelectionHighlight();
                     // Keep search input focused
                     this.searchInput.focus();
                 } else if (event.key === 'Tab') {
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
        } else {
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

    private processMenuNavigation(key: string): void {
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
                    } else {
                        console.log('POPUP: Selected index out of bounds?');
                    }
                } else {
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
                } else {
                    this.hidePopupMenu();
                }
                break;
        }
    }

    private updateSelectionHighlight(): void {
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
            } else {
                item.classList.remove('jp-llm-ext-popup-menu-item-selected');
            }
        });
    }

     private deselectAllMenuItems(): void {
        const menuItems = this.getMenuItems();
        menuItems.forEach(item => {
            item.classList.remove('jp-llm-ext-popup-menu-item-selected');
        });
        this.selectedMenuItemIndex = -1;
     }

    private selectNextMenuItem(): void {
        const menuItems = this.getMenuItems();
        if (menuItems.length === 0) return;

        this.selectedMenuItemIndex++;
        if (this.selectedMenuItemIndex >= menuItems.length) {
            this.selectedMenuItemIndex = 0; // Wrap around
        }
        this.updateSelectionHighlight();
        console.log(`POPUP: Selected item index: ${this.selectedMenuItemIndex}`);
    }

    private selectPreviousMenuItem(): void {
        const menuItems = this.getMenuItems();
        if (menuItems.length === 0) return;

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
    private getMenuItems(): HTMLDivElement[] {
        return Array.from(this.popupMenuContainer.querySelectorAll('.jp-llm-ext-popup-menu-item'));
    }

    /**
     * Updates the position of the popup menu based on the active reference range
     * or the initial anchor point. Tries to position the BOTTOM-LEFT corner of the menu
     * just AT THE TOP-LEFT corner of the range/anchor.
     */
    private updatePopupPosition(): void {
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
            } else {
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
    public isPopupMenuVisible(): boolean {
        return this.popupMenuContainer.style.display !== 'none';
    }

    /**
     * Gets the current level of the popup menu.
     */
    public getCurrentMenuLevel(): 'top' | 'files' | 'directories' | 'cells' {
        return this.currentMenuLevel;
    }
}
