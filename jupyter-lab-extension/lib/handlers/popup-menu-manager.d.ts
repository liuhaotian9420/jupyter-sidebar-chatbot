import { IDocumentManager } from '@jupyterlab/docmanager';
/**
 * Interface for actions to be performed when a menu item is selected.
 */
export interface MenuActionCallbacks {
    insertCode: (code: string) => void;
    insertCell: (content: string) => void;
    insertFilePath: (path: string) => void;
    insertDirectoryPath: (path: string) => void;
    getSelectedText: () => string | null;
    getCurrentCellContent: () => string | null;
    insertCellByIndex: (index: number) => void;
    insertCollapsedCodeRef: (code: string, cellIndex: number, lineNumber: number, notebookName: string) => void;
}
/**
 * Manages the state and interactions of the multi-level popup menu.
 */
export declare class PopupMenuManager {
    private popupMenuContainer;
    private searchInput;
    private currentMenuLevel;
    private currentMenuPath;
    private menuHistory;
    private docManager;
    private widgetNode;
    private callbacks;
    private currentNotebook;
    private selectedMenuItemIndex;
    private isRenderingContent;
    private lastSearchTerm;
    private _anchorX?;
    private _anchorY?;
    private allowedExtensions;
    private fileCache;
    constructor(docManager: IDocumentManager, widgetNode: HTMLElement, callbacks: MenuActionCallbacks);
    private boundHandleKeyDown;
    dispose(): void;
    private handleDocumentClick;
    showPopupMenu(x: number, y: number): Promise<void>;
    hidePopupMenu(): void;
    private renderMenuContent;
    private renderTopLevelItems;
    private renderDirectoryBrowserItems;
    /**
     * Renders all cells from the current notebook
     */
    private renderCellItems;
    private createMenuItem;
    private handleMenuClick;
    navigateMenu(level: 'files' | 'directories' | 'cells', path: string): Promise<void>;
    navigateBackMenu(): void;
    listCurrentDirectoryContents(basePath: string, filterType?: 'file' | 'directory'): Promise<{
        name: string;
        path: string;
        type: 'file' | 'directory';
        relativePath: string;
    }[] | null>;
    private setCurrentDirectoryPath;
    private getParentDirectory;
    /**
     * Handle keyboard navigation when the popup menu is shown
     */
    private handleKeyDown;
    private processMenuNavigation;
    private updateSelectionHighlight;
    private deselectAllMenuItems;
    private selectNextMenuItem;
    private selectPreviousMenuItem;
    /**
     * Get all interactive menu items currently displayed
     */
    private getMenuItems;
    /**
     * Updates the position of the popup menu based on the active reference range
     * or the initial anchor point. Tries to position the BOTTOM of the menu
     * just ABOVE the range/anchor.
     */
    private updatePopupPosition;
    /**
     * Checks if the popup menu is currently visible.
     */
    isPopupMenuVisible(): boolean;
    /**
     * Gets the current level of the popup menu.
     */
    getCurrentMenuLevel(): 'top' | 'files' | 'directories' | 'cells';
}
