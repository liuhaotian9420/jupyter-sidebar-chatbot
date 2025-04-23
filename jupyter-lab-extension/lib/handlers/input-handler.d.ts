export interface InputHandlerCallbacks {
    handleSendMessage: (message: string) => void;
    showPopupMenu: (left: number, top: number) => void;
    hidePopupMenu: () => void;
    updatePlaceholder: (isMarkdown: boolean) => void;
    toggleInputExpansionUI: (isExpanded: boolean) => void;
    getCodeRefMap: () => Map<string, CodeRefData>;
    resetCodeRefMap: () => void;
}
export interface CodeRefData {
    type: 'code' | 'cell';
    content: string;
    notebookName: string;
    cellIndex: number;
    lineNumber?: number;
    lineEndNumber?: number;
}
/**
 * Handles events and logic related to the chat input field.
 */
export declare class InputHandler {
    private chatInput;
    private callbacks;
    private codeRefMap;
    private nextRefId;
    private hasAtSymbol;
    private isMarkdownMode;
    private isInputExpanded;
    constructor(chatInput: HTMLDivElement, callbacks: InputHandlerCallbacks);
    /**
     * Removes event listeners.
     */
    dispose(): void;
    /**
     * Appends text to the input field, potentially replacing a preceding '@' symbol.
     */
    appendToInput(text: string): void;
    /**
     * Clears the input field and resets associated state after sending.
     */
    clearInput(): void;
    /**
     * Sets the markdown mode state and updates the placeholder.
     */
    setMarkdownMode(isMarkdown: boolean): void;
    /**
     * Toggles the input expansion state and updates UI.
     */
    toggleInputExpansion(forceState?: boolean): void;
    /**
     * Adds a code reference to the internal map and returns its ID.
     * @param codeContent The actual code content.
     * @param notebookName The name of the notebook the code is from.
     * @param cellIndex The index of the cell the code is from (0-based).
     * @param lineNumber The starting line number of the code within the cell (1-based).
     * @param lineEndNumber The ending line number of the code within the cell (1-based).
     * @returns The generated reference ID (e.g., "ref-1").
     */
    addCodeReference(codeContent: string, // Renamed parameter
    notebookName: string, cellIndex: number, lineNumber: number, // Start line
    lineEndNumber: number): string;
    /**
     * Returns the current map of code references.
     */
    getCodeReferenceMap(): Map<string, CodeRefData>;
    /**
     * Clears the code reference map and resets the ID counter.
     */
    resetCodeReferences(): void;
    /**
     * Replaces code reference placeholders (e.g., "[ref-1]") in a message string
     * with the actual code from the map.
     * @param message The message string potentially containing placeholders.
     * @returns The message string with placeholders resolved.
     */
    private resolveCodeReferences;
    handleInsertCodeReferenceFromShortcut(selectedText: string): void;
    addCellReference(notebookName: string, cellIndex: number): string | null;
    handleInsertCellReferenceFromShortcut(): void;
    handleInsertFileWidget(filePath: string): void;
    handleInsertDirWidget(dirPath: string): void;
    handleInsertCellWidgetFromPopup(cellIndex: number): void;
    handleInsertCodeWidgetFromPopup(codeContent: string, notebookName: string, cellIndex: number, lineNumber: number): void;
    private _serializeInputContent;
    private _handleClick;
    private activePreviewElement;
    private showWidgetPreview;
    private removeWidgetPreview;
    private _handleKeyPress;
    private _handleInput;
    /**
      // Handle @ symbol removal to hide popup using selection API
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;
  
      const range = selection.getRangeAt(0);
      // Check if the input field contains the start of the range
      if (!this.chatInput.contains(range.startContainer)) return;
  
      const cursorPosition = getCaretPosition(this.chatInput); // Use helper
      if (cursorPosition === null) return;
  
      const textContent = this.chatInput.textContent || '';
      const textBeforeCursor = textContent.slice(0, cursorPosition);
  
      // Check if the character immediately before the cursor is '@'
      // and if it's preceded by whitespace or is at the start of the input.
      const isAtSymbolContext = textBeforeCursor.endsWith('@') &&
                             (cursorPosition === 1 ||
                              cursorPosition > 1 && /\s/.test(textBeforeCursor[cursorPosition - 2]));
  
      if (this.hasAtSymbol && !isAtSymbolContext) {
        // @ symbol context was present but now it's gone, hide the popup
        this.callbacks.hidePopupMenu();
      }
      // Update the state *after* checking the previous state
      this.hasAtSymbol = isAtSymbolContext;
  
      // --- Auto-resize logic (optional) ---
      // Simple auto-resize based on scroll height (might need refinement)
      if (!this.isInputExpanded) { // Only auto-resize if not manually expanded
          this.chatInput.style.height = 'auto'; // Temporarily shrink to content
          const scrollHeight = this.chatInput.scrollHeight;
          // Set a max height to prevent infinite growth, e.g., 150px
          const maxHeight = 150;
          const newHeight = Math.min(scrollHeight, maxHeight);
           // Only update height if it actually changes to avoid flicker
          if (this.chatInput.offsetHeight < newHeight) {
               this.chatInput.style.height = `${newHeight}px`;
               this.chatInput.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
          } else if (scrollHeight <= this.chatInput.clientHeight) {
              // Shrink if content height is less than current height
              this.chatInput.style.height = `${scrollHeight}px`;
              this.chatInput.style.overflowY = 'hidden';
          }
      }
      // -----------------------------------
    };
    
    /**
     * Explicitly sets the hasAtSymbol flag. Called by shortcut handler.
     */
    setHasAtSymbol(value: boolean): void;
    /**
     * Gets the current value of the hasAtSymbol flag. Called by shortcut handler.
     */
    getHasAtSymbol(): boolean;
    private _handleKeyDown;
}
