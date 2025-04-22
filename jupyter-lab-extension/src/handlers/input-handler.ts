import { PopupMenuManager } from './popup-menu-manager';

// Interface for callbacks provided to the InputHandler
export interface InputHandlerCallbacks {
  handleSendMessage: (message: string) => void;
  showPopupMenu: (left: number, top: number) => void;
  hidePopupMenu: () => void;
  // Placeholder for markdown toggle effect on placeholder
  updatePlaceholder: (isMarkdown: boolean) => void; 
  // Placeholder for expand/collapse effects
  toggleInputExpansionUI: (isExpanded: boolean) => void; 
  // For code ref map management (might move later)
  getCodeRefMap: () => Map<string, string>;
  resetCodeRefMap: () => void;
}

/**
 * Handles events and logic related to the chat input field.
 */
export class InputHandler {
  private inputField: HTMLTextAreaElement;
  private popupMenuManager: PopupMenuManager;
  private callbacks: InputHandlerCallbacks;

  private hasAtSymbol: boolean = false;
  private isMarkdownMode: boolean = false; // Internal state, potentially synced with UIManager
  private isInputExpanded: boolean = false; // Internal state, potentially synced with UIManager

  constructor(
    inputField: HTMLTextAreaElement,
    popupMenuManager: PopupMenuManager,
    callbacks: InputHandlerCallbacks
  ) {
    this.inputField = inputField;
    this.popupMenuManager = popupMenuManager;
    this.callbacks = callbacks;

    // Bind event listeners
    this.inputField.addEventListener('keypress', this._handleKeyPress);
    this.inputField.addEventListener('input', this._handleInput);
    // Note: Actual markdown toggle and expand buttons are likely managed by UIManager,
    // which would then call methods like `setMarkdownMode` or `toggleExpansion` on this handler.
  }

  /**
   * Removes event listeners.
   */
  dispose(): void {
    this.inputField.removeEventListener('keypress', this._handleKeyPress);
    this.inputField.removeEventListener('input', this._handleInput);
  }

  /**
   * Appends text to the input field with proper spacing and focus.
   */
  public appendToInput(text: string): void {
    try {
      const currentValue = this.inputField.value;
      this.inputField.value = currentValue ? `${currentValue}${text}` : text;

      // Focus the input field and move cursor to end
      this.inputField.focus();
      this.inputField.setSelectionRange(
        this.inputField.value.length,
        this.inputField.value.length
      );
    } catch (error) {
      console.error('Error appending to input:', error);
    }
  }

  /**
   * Clears the input field and resets associated state after sending.
   */
  public clearInput(): void {
     this.inputField.value = '';
     this.callbacks.resetCodeRefMap(); // Reset code references map
     this.inputField.rows = 1;
     this.inputField.style.height = ''; // Reset height
     this.hasAtSymbol = false; // Reset @ state
      
     // Reset expand button state if it was expanded
     if (this.isInputExpanded) {
         this.toggleInputExpansion(false); // Collapse input
     }
  }

  /**
   * Sets the markdown mode state and updates the placeholder.
   */
  public setMarkdownMode(isMarkdown: boolean): void {
    this.isMarkdownMode = isMarkdown;
    this.callbacks.updatePlaceholder(this.isMarkdownMode);
    // Update placeholder directly (alternative to callback)
    // this.inputField.placeholder = this.isMarkdownMode ? 
    //   'Write markdown here...' : 
    //   'Ask me anything...';
  }

  /**
   * Toggles the input expansion state and updates UI.
   */
  public toggleInputExpansion(forceState?: boolean): void {
    this.isInputExpanded = forceState !== undefined ? forceState : !this.isInputExpanded;
    if (this.isInputExpanded) {
      this.inputField.style.height = '200px'; // Example height
      this.inputField.style.resize = 'vertical';
    } else {
      this.inputField.style.height = ''; // Reset height
      this.inputField.style.resize = 'none';
      this.inputField.rows = 1; // Ensure it collapses back to 1 row height
    }
    // Notify UIManager/LayoutBuilder to update button appearance
    this.callbacks.toggleInputExpansionUI(this.isInputExpanded);
  }

  // --- Private Event Handlers ---

  private _handleKeyPress = (event: KeyboardEvent): void => {
    // Handle Enter key (send message)
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const message = this.inputField.value.trim();
      if (message) {
          this.callbacks.handleSendMessage(message);
          // Clearing is handled separately after message send is confirmed successful
      }
    }
    // Note: '@' key handling might be better in handleKeyDown if needed globally,
    // but keeping here for now as it relates directly to input field focus.
    // Or handled by shortcut-handler listening globally. Let's assume shortcut-handler handles it.
  };

  private _handleInput = (): void => {
    // Handle @ symbol removal to hide popup
    const cursorPosition = this.inputField.selectionStart;
    if (cursorPosition === null) return; // Type guard

    const textBeforeCursor = this.inputField.value.slice(0, cursorPosition);
    // Check if the character immediately before the cursor is '@'
    // and if it's preceded by whitespace or is at the start of the input.
    const isAtSymbolContext = textBeforeCursor.endsWith('@') &&
                           (cursorPosition === 1 || 
                            /\s/.test(textBeforeCursor[cursorPosition - 2]));

    if (this.hasAtSymbol && !isAtSymbolContext) {
      // @ symbol context was present but now it's gone, hide the popup
      this.callbacks.hidePopupMenu();
    }
    // Update the state *after* checking the previous state
    this.hasAtSymbol = isAtSymbolContext; 
  };
  
  /**
   * Explicitly sets the hasAtSymbol flag. Called by shortcut handler.
   */
  public setHasAtSymbol(value: boolean): void {
      this.hasAtSymbol = value;
  }

  /**
   * Gets the current value of the hasAtSymbol flag. Called by shortcut handler.
   */
  public getHasAtSymbol(): boolean {
      return this.hasAtSymbol;
  }
} 