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
        this.docManager = docManager;
        this.widgetNode = widgetNode;
        this.callbacks = callbacks;
        this.popupMenuContainer = document.createElement('div');
        this.popupMenuContainer.className = 'jp-llm-ext-popup-menu-container';
        this.popupMenuContainer.style.display = 'none';
        // Attach to the widget node instead of the body
        this.widgetNode.appendChild(this.popupMenuContainer);
        document.addEventListener('click', this.handleDocumentClick.bind(this), true);
        if (globals_1.globals.notebookTracker) {
            this.currentNotebook = globals_1.globals.notebookTracker.currentWidget;
            globals_1.globals.notebookTracker.currentChanged.connect((_, notebook) => {
                this.currentNotebook = notebook;
            });
        }
    }
    dispose() {
        document.removeEventListener('click', this.handleDocumentClick.bind(this), true);
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
            await this.setCurrentDirectoryPath();
        }
        await this.renderMenuContent();
        // Ensure it's attached to the widget node if somehow detached
        this.widgetNode.appendChild(this.popupMenuContainer);
        // Positioning might need adjustment relative to the widgetNode now
        this.popupMenuContainer.style.position = 'absolute';
        this.popupMenuContainer.style.left = `${x}px`;
        this.popupMenuContainer.style.top = `${y}px`;
        this.popupMenuContainer.style.display = 'block';
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
        console.log(`POPUP: Rendering content for level: ${this.currentMenuLevel}, path: ${this.currentMenuPath}`);
        this.popupMenuContainer.innerHTML = '';
        if (this.menuHistory.length > 0) {
            const backButton = this.createMenuItem('← Back', 'navigate-back', '', 'Return to previous menu');
            this.popupMenuContainer.appendChild(backButton);
        }
        if (this.currentMenuLevel === 'files' || this.currentMenuLevel === 'directories') {
            const pathIndicator = document.createElement('div');
            pathIndicator.className = 'jp-llm-ext-popup-menu-path';
            pathIndicator.textContent = `Path: ${this.currentMenuPath || '/'}`;
            this.popupMenuContainer.appendChild(pathIndicator);
        }
        if (this.currentMenuLevel === 'top') {
            this.renderTopLevelItems();
        }
        else if (this.currentMenuLevel === 'files' || this.currentMenuLevel === 'directories') {
            await this.renderDirectoryBrowserItems();
        }
    }
    renderTopLevelItems() {
        const topLevelCommands = [
            { label: 'Code', description: 'Insert selected code', actionId: 'insert-code' },
            { label: 'Cell', description: 'Insert entire cell content', actionId: 'insert-cell' },
            { label: 'File', description: 'Browse and select a file', actionId: 'browse-files' },
            { label: 'Directory', description: 'Browse and select a directory', actionId: 'browse-directories' }
        ];
        topLevelCommands.forEach(cmd => {
            const item = this.createMenuItem(cmd.label, cmd.actionId, '', cmd.description);
            this.popupMenuContainer.appendChild(item);
        });
    }
    async renderDirectoryBrowserItems() {
        const loadingItem = this.createMenuItem('Loading...', 'loading', '', '');
        loadingItem.style.pointerEvents = 'none';
        this.popupMenuContainer.appendChild(loadingItem);
        try {
            const filterType = this.currentMenuLevel === 'files' ? 'file' : 'directory';
            const contents = await this.listCurrentDirectoryContents(this.currentMenuPath, filterType);
            this.popupMenuContainer.removeChild(loadingItem);
            if (contents && contents.length > 0) {
                contents.forEach(item => {
                    const itemName = item.name;
                    const itemType = item.type;
                    const itemPath = item.path;
                    const icon = itemType === 'directory' ? '📁' : '📄';
                    const actionId = itemType === 'directory' ? 'select-directory' : 'select-file';
                    const menuItem = this.createMenuItem(`${icon} ${itemName}`, actionId, itemPath);
                    this.popupMenuContainer.appendChild(menuItem);
                });
            }
            else {
                const emptyItem = this.createMenuItem(`No ${filterType}s found`, 'empty', '', '');
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
            console.error('POPUP: Error loading directory contents:', error);
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
            case 'insert-cell': {
                const cellContent = this.callbacks.getCurrentCellContent ? this.callbacks.getCurrentCellContent() : null;
                if (cellContent) {
                    this.callbacks.insertCell(cellContent);
                }
                this.hidePopupMenu();
                break;
            }
            case 'browse-files':
                await this.navigateMenu('files', this.currentMenuPath || '');
                break;
            case 'browse-directories':
                await this.navigateMenu('directories', this.currentMenuPath || '');
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
            case 'select-directory':
                if (path) {
                    await this.navigateMenu('files', path);
                }
                else {
                    console.error('POPUP: Directory selected but path is missing.');
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
        this.menuHistory.push({ level: this.currentMenuLevel, path: this.currentMenuPath });
        this.currentMenuLevel = level;
        this.currentMenuPath = path;
        await this.renderMenuContent();
    }
    navigateBackMenu() {
        const previousState = this.menuHistory.pop();
        if (previousState) {
            console.log(`POPUP: Navigating back to level: ${previousState.level}, path: ${previousState.path}`);
            this.currentMenuLevel = previousState.level;
            this.currentMenuPath = previousState.path;
            this.renderMenuContent();
        }
        else {
            console.log('POPUP: Already at the top level.');
            this.hidePopupMenu();
        }
    }
    async listCurrentDirectoryContents(basePath, filterType) {
        console.log(`POPUP: Listing directory contents for path: '${basePath}', filter: ${filterType || 'all'}`);
        try {
            const effectivePath = basePath === '/' ? '' : basePath;
            const contents = await this.docManager.services.contents.get(effectivePath);
            if (contents.type === 'directory') {
                let items = contents.content.map((item) => ({
                    name: item.name,
                    path: item.path,
                    type: item.type
                }));
                items = items.filter((item) => item.type === 'file' || item.type === 'directory');
                if (filterType) {
                    items = items.filter((item) => item.type === filterType);
                }
                console.log('Directory items:', items);
                return items.sort((a, b) => a.name.localeCompare(b.name));
            }
            else {
                console.error('Path is not a directory:', basePath);
                return null;
            }
        }
        catch (error) {
            console.error('Error listing directory contents:', error);
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
}
exports.PopupMenuManager = PopupMenuManager;
