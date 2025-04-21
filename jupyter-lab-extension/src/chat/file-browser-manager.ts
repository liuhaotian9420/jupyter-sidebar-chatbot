/**
 * Manages file and directory browsing functionality
 */

import { IDocumentManager } from '@jupyterlab/docmanager';
import { Contents } from '@jupyterlab/services';

/**
 * Manages file and directory browsing operations
 */
export class FileBrowserManager {
  private docManager: IDocumentManager;
  private currentPath = '';

  constructor(docManager: IDocumentManager) {
    this.docManager = docManager;
  }

  /**
   * Lists the contents of the current directory
   * @param filterType Optional parameter to filter results by type ('all', 'file', or 'directory')
   * @returns A promise resolving to an array of item names or null on error
   */
  public async listCurrentDirectoryContents(filterType: 'all' | 'file' | 'directory' = 'all'): Promise<string[] | null> {
    console.log('LIST DIR: Starting directory listing process...', { filterType });
    try {
      // Ensure we have a current path
      if (!this.currentPath) {
        await this.setCurrentDirectoryPath();
      }
      
      console.log('LIST DIR: Current path:', this.currentPath);
      
      // Get directory contents using the document manager
      const dirContents = await this.docManager.services.contents.get(this.currentPath, { content: true });
      
      if (!dirContents) {
        console.error('LIST DIR: Failed to get directory contents');
        return null;
      }
      
      console.log('LIST DIR: Got directory contents:', dirContents);
      
      // Filter contents based on filterType
      let filteredContents = dirContents.content || [];
      
      if (filterType === 'file') {
        filteredContents = filteredContents.filter((item: Contents.IModel) => item.type !== 'directory');
      } else if (filterType === 'directory') {
        filteredContents = filteredContents.filter((item: Contents.IModel) => item.type === 'directory');
      }
      
      // Sort directories first, then files
      filteredContents.sort((a: Contents.IModel, b: Contents.IModel) => {
        if (a.type === 'directory' && b.type !== 'directory') {
          return -1;
        }
        if (a.type !== 'directory' && b.type === 'directory') {
          return 1;
        }
        return a.name.localeCompare(b.name);
      });
      
      // Extract names
      const names = filteredContents.map((item: Contents.IModel) => {
        if (item.type === 'directory') {
          return `\ud83d\udcc1 ${item.name}`;
        } else {
          return `\ud83d\udcc4 ${item.name}`;
        }
      });
      
      console.log('LIST DIR: Filtered and sorted names:', names);
      
      return names;
    } catch (error) {
      console.error('LIST DIR: Error listing directory contents:', error);
      return null;
    }
  }

  /**
   * Sets the current directory path based on context
   */
  public async setCurrentDirectoryPath(): Promise<void> {
    // If we already have a path, keep using it
    if (this.currentPath) {
      return;
    }
    
    try {
      // Just use empty path for now as a fallback
      // In a real implementation, we would try to get the current directory from the document manager
      this.currentPath = '';
      console.log('DIR PATH: Using empty path as fallback');
    } catch (error) {
      console.error('DIR PATH: Error setting directory path:', error);
      this.currentPath = '';
    }
  }

  /**
   * Navigates to a subdirectory
   * @param dirName The name of the subdirectory to navigate to
   */
  public navigateToSubdirectory(dirName: string): void {
    // Remove the folder emoji if present
    const cleanDirName = dirName.replace('\ud83d\udcc1 ', '');
    
    // Update the current path
    if (this.currentPath) {
      this.currentPath = `${this.currentPath}/${cleanDirName}`;
    } else {
      this.currentPath = cleanDirName;
    }
    
    // Normalize the path
    this.currentPath = this.currentPath.replace(/\/+/g, '/');
    console.log('DIR NAV: Navigated to:', this.currentPath);
  }

  /**
   * Navigates to the parent directory
   * @returns True if navigation was successful, false otherwise
   */
  public navigateToParentDirectory(): boolean {
    // Check if we're already at the root
    if (!this.currentPath || this.currentPath === '') {
      return false;
    }
    
    // Get the parent path
    const parts = this.currentPath.split('/');
    parts.pop(); // Remove the last part
    this.currentPath = parts.join('/');
    
    console.log('DIR NAV: Navigated to parent:', this.currentPath);
    return true;
  }

  /**
   * Gets the current directory path
   * @returns The current directory path
   */
  public getCurrentPath(): string {
    return this.currentPath;
  }

  /**
   * Sets the current directory path
   * @param path The new path to set
   */
  public setCurrentPath(path: string): void {
    this.currentPath = path;
  }
}
