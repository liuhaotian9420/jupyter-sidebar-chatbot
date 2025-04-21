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
    private currentDirectoryItems;
    private itemsContainer;
    constructor(docManager: IDocumentManager, widgetNode: HTMLElement, callbacks: MenuActionCallbacks);
    dispose(): void;
    private handleDocumentClick;
    showPopupMenu(x: number, y: number): Promise<void>;
    hidePopupMenu(): void;
    private renderMenuContent;
    private renderTopLevelItems;
    /** Fetches directory contents if needed and populates the items container */
    private fetchAndPopulateMenuItems;
    /** Updates only the list items in the itemsContainer based on search */
    private updateMenuItemsUI;
    private createMenuItem;
    private handleMenuClick;
    navigateMenu(level: 'files' | 'directories', path: string): Promise<void>;
    navigateBackMenu(): void;
    listCurrentDirectoryContents(basePath: string): Promise<{
        name: string;
        path: string;
        type: 'file' | 'directory';
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
     * Get all interactive menu items from the items container
     */
    private getMenuItems;
}
export {};
