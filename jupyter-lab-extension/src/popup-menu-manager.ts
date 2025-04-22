import { IDocumentManager } from '@jupyterlab/docmanager';
import { NotebookPanel } from '@jupyterlab/notebook'; 
import { globals } from './globals'; 

/**
 * Interface for actions to be performed when a menu item is selected.
 */
interface MenuActionCallbacks {
    insertCode: (code: string) => void;
    insertCell: (content: string) => void;
    insertFilePath: (path: string) => void;
    insertDirectoryPath: (path: string) => void; 
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

    constructor(docManager: IDocumentManager, widgetNode: HTMLElement, callbacks: MenuActionCallbacks) {
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
                } else if (event.key === 'Enter') {
                    // Maybe select first item on Enter?
                    const menuItems = this.getMenuItems();
                    if (menuItems.length > 0) {
                        this.selectedMenuItemIndex = 0;
                        this.updateSelectionHighlight();
                        // Optionally activate the item:
                        // menuItems[0].click(); 
                    }
                } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
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

        if (globals.notebookTracker) {
            this.currentNotebook = globals.notebookTracker.currentWidget;
            globals.notebookTracker.currentChanged.connect((_, notebook) => {
                this.currentNotebook = notebook;
            });
        }
    }

    // Store bound function to correctly remove event listener later
    private boundHandleKeyDown: (event: KeyboardEvent) => void;

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

    async showPopupMenu(x: number, y: number): Promise<void> { 
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
        } else {
            // Reset and select the first menu item for top level
            this.selectedMenuItemIndex = -1;
             setTimeout(() => this.selectNextMenuItem(), 50);
        }
    }

    hidePopupMenu(): void {
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
                    const menuPosition = target.getBoundingClientRect();
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
                    if (!isNaN(cellIndex) && this.callbacks.insertCellByIndex) {
                        this.callbacks.insertCellByIndex(cellIndex);
                        this.hidePopupMenu();
                    } else {
                        console.error('POPUP: Invalid cell index or callback missing.');
                    }
                }
                break;
            case 'select-file':
                if (path) {
                    this.callbacks.insertFilePath(path); 
                    this.hidePopupMenu();
                } else {
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
                } else {
                    console.error('POPUP: Directory selected for navigation but path is missing.');
                }
                break;
            case 'select-directory-callback': // New action to select dir when in directory view
                if (path) {
                    this.callbacks.insertDirectoryPath(path); // Use the callback
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
                console.warn('Unknown menu action:', actionId);
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
                    setTimeout(() => this.searchInput.focus(), 0);
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
                if (fileBrowserWidget && (fileBrowserWidget as any).model?.path) {
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
        const lastSlash = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\\\'));
        if (lastSlash === -1) return ''; // No directory part, likely root or just a filename
        return path.substring(0, lastSlash);
    }

    /**
     * Handle keyboard navigation when the popup menu is shown
     */
    private handleKeyDown(event: KeyboardEvent): void {
        // Skip if menu not visible
        if (this.popupMenuContainer.style.display === 'none') {
            return;
        }

        console.log(`POPUP KeyDown: Key='${event.key}', Target='${(event.target as Element)?.tagName}', SearchFocused='${document.activeElement === this.searchInput}'`);

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
                    } else { // ArrowUp
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
                } else {
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
                 } else {
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
                 if ( (this.currentMenuLevel === 'files' || this.currentMenuLevel === 'directories') &&
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

    private updateSelectionHighlight(): void {
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
            } else {
                 if (item.classList.contains('selected')) {
                     item.classList.remove('selected');
                     console.log(`POPUP updateSelectionHighlight: Removed 'selected' from item ${index}`);
                 }
            }
        });
    }

     private deselectAllMenuItems(): void {
         const menuItems = this.getMenuItems();
         menuItems.forEach(item => item.classList.remove('selected'));
         this.selectedMenuItemIndex = -1;
     }

    private selectNextMenuItem(): void {
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


    private selectPreviousMenuItem(): void {
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
    private getMenuItems(): HTMLDivElement[] {
        const items = Array.from(this.popupMenuContainer.querySelectorAll('.jp-llm-ext-popup-menu-item')) as HTMLDivElement[];
        // Filter out non-interactive items like loading, empty, error
        return items.filter(item => {
            const actionId = item.dataset.actionId;
            return actionId !== 'loading' && actionId !== 'empty' && actionId !== 'error';
        });
    }

    /**
     * Update popup position, keeping the bottom edge fixed at the anchor point
     */
    private updatePopupPosition(): void {
        // Make sure anchor points are defined
        const anchorX = this._anchorX ?? 0;
        const anchorY = this._anchorY ?? 0;
        
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

    // Add other necessary methods related to the popup menu here...
}
