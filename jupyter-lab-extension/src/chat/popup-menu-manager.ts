/**
 * Manages popup menu functionality
 */

import { MenuCommand, MenuState } from './types';
import { FileBrowserManager } from './file-browser-manager';

/**
 * Manages popup menu creation, display, and interaction
 */
export class PopupMenuManager {
  private popupMenuContainer: HTMLDivElement;
  private menuState: MenuState;
  private fileBrowserManager: FileBrowserManager;
  private onItemSelected: (text: string) => void;

  constructor(fileBrowserManager: FileBrowserManager, onItemSelected: (text: string) => void) {
    this.fileBrowserManager = fileBrowserManager;
    this.onItemSelected = onItemSelected;
    
    // Initialize menu state
    this.menuState = {
      currentMenuLevel: 'top',
      currentMenuPath: '',
      menuHistory: []
    };
    
    // Create popup menu container
    this.popupMenuContainer = document.createElement('div');
    this.popupMenuContainer.className = 'jp-llm-ext-popup-menu-container';
    this.popupMenuContainer.style.display = 'none';
    document.body.appendChild(this.popupMenuContainer);
    
    // Add click event listener to close menu when clicking outside
    document.addEventListener('click', this.handleDocumentClick);
  }

  /**
   * Shows the popup menu at the specified position
   * @param x The x-coordinate of the popup menu
   * @param y The y-coordinate of the popup menu
   */
  public showPopupMenu(x: number, y: number): void {
    // Clear previous menu items
    this.popupMenuContainer.innerHTML = '';
    
    // Reset menu state for top level
    this.menuState.currentMenuLevel = 'top';
    this.menuState.menuHistory = [];
    
    // Create top-level menu items
    const commands: MenuCommand[] = [
      {
        label: 'Code',
        description: 'Insert selected code',
        action: () => {
          this.hidePopupMenu();
          this.handleCodeCommand();
        }
      },
      {
        label: 'Cell',
        description: 'Insert entire cell content',
        action: () => {
          this.hidePopupMenu();
          this.handleCellCommand();
        }
      },
      {
        label: 'Files',
        description: 'Browse and insert file content',
        action: () => {
          this.menuState.currentMenuLevel = 'files';
          this.menuState.menuHistory.push({ level: 'top', path: '' });
          this.loadDirectoryContents(x, y);
        }
      },
      {
        label: 'Directories',
        description: 'Browse and reference directories',
        action: () => {
          this.menuState.currentMenuLevel = 'directories';
          this.menuState.menuHistory.push({ level: 'top', path: '' });
          this.loadDirectoryContents(x, y);
        }
      }
    ];
    
    this.createMenuItems(commands);
    
    // Position and show the menu
    this.positionMenu(x, y);
  }

  /**
   * Creates menu items from commands and appends them to the popup menu container
   * @param commands The array of commands to create menu items for
   */
  private createMenuItems(commands: MenuCommand[]): void {
    commands.forEach(command => {
      const item = document.createElement('div');
      item.className = 'jp-llm-ext-popup-menu-item';
      
      const label = document.createElement('div');
      label.className = 'jp-llm-ext-popup-menu-item-label';
      label.textContent = command.label;
      
      const description = document.createElement('div');
      description.className = 'jp-llm-ext-popup-menu-item-description';
      description.textContent = command.description;
      
      item.appendChild(label);
      item.appendChild(description);
      
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        command.action();
      });
      
      this.popupMenuContainer.appendChild(item);
    });
  }

  /**
   * Loads and displays directory contents in the popup menu
   * @param x The x-coordinate of the popup menu
   * @param y The y-coordinate of the popup menu
   */
  private async loadDirectoryContents(x: number, y: number): Promise<void> {
    // Show loading indicator
    this.popupMenuContainer.innerHTML = '<div class="jp-llm-ext-popup-menu-loading">Loading...</div>';
    
    // Determine filter type based on menu level
    const filterType = this.menuState.currentMenuLevel === 'files' ? 'file' : 'directory';
    
    // Get directory contents
    const contents = await this.fileBrowserManager.listCurrentDirectoryContents(filterType);
    
    // Clear the menu
    this.popupMenuContainer.innerHTML = '';
    
    // Add back button if we have history
    if (this.menuState.menuHistory.length > 0) {
      const backCommand: MenuCommand = {
        label: '⬅️ Back',
        description: 'Go back to previous menu',
        action: () => {
          // Pop the last item from history
          const previous = this.menuState.menuHistory.pop();
          if (previous) {
            // Restore previous state
            this.menuState.currentMenuLevel = previous.level;
            
            // If going back to top level
            if (previous.level === 'top') {
              this.showPopupMenu(x, y);
            } else {
              // If going back to a directory level, we need to go up one directory
              this.fileBrowserManager.navigateToParentDirectory();
              this.loadDirectoryContents(x, y);
            }
          }
        }
      };
      
      this.createMenuItems([backCommand]);
      
      // Add current path indicator
      const pathIndicator = document.createElement('div');
      pathIndicator.className = 'jp-llm-ext-popup-menu-path';
      pathIndicator.textContent = `Path: ${this.fileBrowserManager.getCurrentPath() || '/'}`;
      this.popupMenuContainer.appendChild(pathIndicator);
    }
    
    // If no contents or error
    if (!contents || contents.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'jp-llm-ext-popup-menu-empty';
      emptyMessage.textContent = 'No items found';
      this.popupMenuContainer.appendChild(emptyMessage);
    } else {
      // Create commands for each item
      const commands: MenuCommand[] = contents.map(item => {
        return {
          label: item,
          description: '',
          action: () => {
            // Handle directory navigation
            if (item.startsWith('📁') && this.menuState.currentMenuLevel === 'directories') {
              // Navigate to subdirectory
              this.fileBrowserManager.navigateToSubdirectory(item);
              this.menuState.menuHistory.push({ 
                level: this.menuState.currentMenuLevel, 
                path: this.fileBrowserManager.getCurrentPath() 
              });
              this.loadDirectoryContents(x, y);
            } else {
              // Handle file selection
              this.hidePopupMenu();
              this.onItemSelected(item);
            }
          }
        };
      });
      
      this.createMenuItems(commands);
    }
    
    // Reposition the menu
    this.positionMenu(x, y);
  }

  /**
   * Positions the popup menu at the specified coordinates
   * @param x The x-coordinate
   * @param y The y-coordinate
   */
  private positionMenu(x: number, y: number): void {
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Get menu dimensions
    const menuWidth = this.popupMenuContainer.offsetWidth;
    const menuHeight = this.popupMenuContainer.offsetHeight;
    
    // Adjust position to ensure menu stays within viewport
    let adjustedX = x;
    let adjustedY = y;
    
    if (x + menuWidth > viewportWidth) {
      adjustedX = viewportWidth - menuWidth - 10;
    }
    
    if (y + menuHeight > viewportHeight) {
      adjustedY = viewportHeight - menuHeight - 10;
    }
    
    // Set position
    this.popupMenuContainer.style.left = `${adjustedX}px`;
    this.popupMenuContainer.style.top = `${adjustedY}px`;
    this.popupMenuContainer.style.display = 'block';
  }

  /**
   * Hides the popup menu
   */
  public hidePopupMenu(): void {
    // Only act if the menu is currently displayed
    if (this.popupMenuContainer.style.display !== 'none') {
      this.popupMenuContainer.style.display = 'none';
      this.popupMenuContainer.innerHTML = '';
    }
  }

  /**
   * Handles document click events to close the menu when clicking outside
   */
  private handleDocumentClick = (event: MouseEvent): void => {
    // Check if the click is outside the popup menu container
    if (this.popupMenuContainer.style.display !== 'none' && 
        !this.popupMenuContainer.contains(event.target as Node)) {
      this.hidePopupMenu();
    }
  };

  /**
   * Handles the code command - inserts selected code
   * Placeholder for implementation in SimpleSidebarWidget
   */
  private handleCodeCommand(): void {
    // This will be implemented by the SimpleSidebarWidget
    console.log('Code command selected');
  }

  /**
   * Handles the cell command - inserts entire cell content
   * Placeholder for implementation in SimpleSidebarWidget
   */
  private handleCellCommand(): void {
    // This will be implemented by the SimpleSidebarWidget
    console.log('Cell command selected');
  }

  /**
   * Cleans up resources
   */
  public dispose(): void {
    document.removeEventListener('click', this.handleDocumentClick);
    if (this.popupMenuContainer.parentNode) {
      this.popupMenuContainer.parentNode.removeChild(this.popupMenuContainer);
    }
  }
}
