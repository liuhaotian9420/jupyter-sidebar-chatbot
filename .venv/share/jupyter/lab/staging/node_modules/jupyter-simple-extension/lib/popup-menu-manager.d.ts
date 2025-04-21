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
    private currentMenuLevel;
    private currentMenuPath;
    private menuHistory;
    private docManager;
    private widgetNode;
    private callbacks;
    private currentNotebook;
    constructor(docManager: IDocumentManager, widgetNode: HTMLElement, callbacks: MenuActionCallbacks);
    dispose(): void;
    private handleDocumentClick;
    showPopupMenu(x: number, y: number): Promise<void>;
    hidePopupMenu(): void;
    private renderMenuContent;
    private renderTopLevelItems;
    private renderDirectoryBrowserItems;
    private createMenuItem;
    private handleMenuClick;
    navigateMenu(level: 'files' | 'directories', path: string): Promise<void>;
    navigateBackMenu(): void;
    listCurrentDirectoryContents(basePath: string, filterType?: 'file' | 'directory'): Promise<{
        name: string;
        path: string;
        type: 'file' | 'directory';
    }[] | null>;
    private setCurrentDirectoryPath;
    private getParentDirectory;
}
export {};
