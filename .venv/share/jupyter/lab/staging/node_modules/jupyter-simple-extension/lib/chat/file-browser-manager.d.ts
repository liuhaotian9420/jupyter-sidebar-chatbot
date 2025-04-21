/**
 * Manages file and directory browsing functionality
 */
import { IDocumentManager } from '@jupyterlab/docmanager';
/**
 * Manages file and directory browsing operations
 */
export declare class FileBrowserManager {
    private docManager;
    private currentPath;
    constructor(docManager: IDocumentManager);
    /**
     * Lists the contents of the current directory
     * @param filterType Optional parameter to filter results by type ('all', 'file', or 'directory')
     * @returns A promise resolving to an array of item names or null on error
     */
    listCurrentDirectoryContents(filterType?: 'all' | 'file' | 'directory'): Promise<string[] | null>;
    /**
     * Sets the current directory path based on context
     */
    setCurrentDirectoryPath(): Promise<void>;
    /**
     * Navigates to a subdirectory
     * @param dirName The name of the subdirectory to navigate to
     */
    navigateToSubdirectory(dirName: string): void;
    /**
     * Navigates to the parent directory
     * @returns True if navigation was successful, false otherwise
     */
    navigateToParentDirectory(): boolean;
    /**
     * Gets the current directory path
     * @returns The current directory path
     */
    getCurrentPath(): string;
    /**
     * Sets the current directory path
     * @param path The new path to set
     */
    setCurrentPath(path: string): void;
}
