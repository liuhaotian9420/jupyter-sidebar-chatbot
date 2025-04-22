import { IDocumentManager } from '@jupyterlab/docmanager';
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
    insertCellByIndex: (index: number) => void;
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
    private updateSelectionHighlight;
    private deselectAllMenuItems;
    private selectNextMenuItem;
    private selectPreviousMenuItem;
    /**
     * Get all interactive menu items
     */
    private getMenuItems;
    /**
     * Update popup position, keeping the bottom edge fixed at the anchor point
     */
    private updatePopupPosition;
}
export {};
