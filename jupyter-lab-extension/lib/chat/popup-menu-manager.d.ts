/**
 * Manages popup menu functionality
 */
import { FileBrowserManager } from './file-browser-manager';
/**
 * Manages popup menu creation, display, and interaction
 */
export declare class PopupMenuManager {
    private popupMenuContainer;
    private menuState;
    private fileBrowserManager;
    private onItemSelected;
    constructor(fileBrowserManager: FileBrowserManager, onItemSelected: (text: string) => void);
    /**
     * Shows the popup menu at the specified position
     * @param x The x-coordinate of the popup menu
     * @param y The y-coordinate of the popup menu
     */
    showPopupMenu(x: number, y: number): void;
    /**
     * Creates menu items from commands and appends them to the popup menu container
     * @param commands The array of commands to create menu items for
     */
    private createMenuItems;
    /**
     * Loads and displays directory contents in the popup menu
     * @param x The x-coordinate of the popup menu
     * @param y The y-coordinate of the popup menu
     */
    private loadDirectoryContents;
    /**
     * Positions the popup menu at the specified coordinates
     * @param x The x-coordinate
     * @param y The y-coordinate
     */
    private positionMenu;
    /**
     * Hides the popup menu
     */
    hidePopupMenu(): void;
    /**
     * Handles document click events to close the menu when clicking outside
     */
    private handleDocumentClick;
    /**
     * Handles the code command - inserts selected code
     * Placeholder for implementation in SimpleSidebarWidget
     */
    private handleCodeCommand;
    /**
     * Handles the cell command - inserts entire cell content
     * Placeholder for implementation in SimpleSidebarWidget
     */
    private handleCellCommand;
    /**
     * Cleans up resources
     */
    dispose(): void;
}
