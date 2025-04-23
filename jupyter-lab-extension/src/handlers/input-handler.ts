import { getCaretPosition, setCaretPosition } from '../utils/content-editable-utils'; // Helper needed
import { globals } from '../core/globals'; // Import globals

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
  getCodeRefMap: () => Map<string, CodeRefData>;
  resetCodeRefMap: () => void;
}

// NEW Interface for storing code reference metadata
export interface CodeRefData {
  type: 'code' | 'cell'; // Add type
  content: string;       // Rename 'code' to 'content'
  notebookName: string;
  cellIndex: number;
  lineNumber?: number; // Make optional for cell refs (Represents START, 1-based)
  lineEndNumber?: number; // Make optional for cell refs (Represents END, 1-based)
}

/**
 * Handles events and logic related to the chat input field.
 */
export class InputHandler {
  private chatInput: HTMLDivElement;
  private callbacks: InputHandlerCallbacks;
  // private uiManager: UIManager; // Removed unused member

  // --- Code Reference State ---
  private codeRefMap: Map<string, CodeRefData> = new Map();
  private nextRefId = 1;
  // ---------------------------

  private hasAtSymbol: boolean = false;
  private isMarkdownMode: boolean = false; // Internal state, potentially synced with UIManager
  private isInputExpanded: boolean = false; // Internal state, potentially synced with UIManager

  constructor(
    chatInput: HTMLDivElement,
    callbacks: InputHandlerCallbacks
    // uiManager: UIManager // Removed unused parameter
  ) {
    this.chatInput = chatInput;
    this.callbacks = callbacks;
    // this.uiManager = uiManager; // Removed unused assignment

    // Bind event listeners
    this.chatInput.addEventListener('keypress', this._handleKeyPress);
    this.chatInput.addEventListener('input', this._handleInput);
    // Note: Actual markdown toggle and expand buttons are likely managed by UIManager,
    // which would then call methods like `setMarkdownMode` or `toggleExpansion` on this handler.
  }

  /**
   * Removes event listeners.
   */
  dispose(): void {
    this.chatInput.removeEventListener('keypress', this._handleKeyPress);
    this.chatInput.removeEventListener('input', this._handleInput);
  }

  /**
   * Appends text to the input field, potentially replacing a preceding '@' symbol.
   */
  public appendToInput(text: string): void {
    try {
      this.chatInput.focus(); // Ensure focus first
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        console.error('Cannot append to input: No selection found.');
        // Fallback: append to end
        this.chatInput.textContent = (this.chatInput.textContent || '') + text;
        return;
      }

      const range = selection.getRangeAt(0);
      const { startContainer, startOffset } = range;

      let currentTextContent = this.chatInput.textContent || ''; // Use textContent
      let insertPos = getCaretPosition(this.chatInput); // Get linear position

      // Simple check: if the character before the linear caret position is '@'
      if (insertPos > 0 && currentTextContent[insertPos - 1] === '@') {
        // Replace the '@' - more complex with DOM manipulation,
        // For simplicity, we'll replace in textContent and reset
        const before = currentTextContent.slice(0, insertPos - 1);
        const after = currentTextContent.slice(insertPos);
        this.chatInput.textContent = before + text + after;
        // Set cursor position after the inserted text
        setCaretPosition(this.chatInput, (insertPos - 1) + text.length);
      } else {
        // Standard insertion - more complex with DOM manipulation
        // For simplicity, we'll insert in textContent and reset
        const before = currentTextContent.slice(0, insertPos);
        const after = currentTextContent.slice(insertPos);
        this.chatInput.textContent = before + text + after;
        // Set cursor position after the inserted text
        setCaretPosition(this.chatInput, insertPos + text.length);
      }

      // Trigger input event manually since we're changing textContent directly
      this.chatInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));

    } catch (error) {
      console.error('Error appending to input:', error);
    }
  }

  /**
   * Clears the input field and resets associated state after sending.
   */
  public clearInput(): void {
     // Use textContent for div
     this.chatInput.textContent = '';
     // Directly reset internal state instead of relying on callback
     this.resetCodeReferences();
     // Remove rows manipulation
     // this.chatInput.rows = 1;
     this.chatInput.style.height = ''; // Reset height
     this.hasAtSymbol = false; // Reset @ state

     // Reset expand button state if it was expanded
     if (this.isInputExpanded) {
         this.toggleInputExpansion(false); // Collapse input
     }
     // Trigger input event manually after clearing
     this.chatInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
  }

  /**
   * Sets the markdown mode state and updates the placeholder.
   */
  public setMarkdownMode(isMarkdown: boolean): void {
    this.isMarkdownMode = isMarkdown;
    this.callbacks.updatePlaceholder(this.isMarkdownMode);
    // Update placeholder directly (alternative to callback)
    // this.chatInput.placeholder = this.isMarkdownMode ? 
    //   'Write markdown here...' : 
    //   'Ask me anything...';
  }

  /**
   * Toggles the input expansion state and updates UI.
   */
  public toggleInputExpansion(forceState?: boolean): void {
    this.isInputExpanded = forceState !== undefined ? forceState : !this.isInputExpanded;
    if (this.isInputExpanded) {
      // Use max-height or height for div
      this.chatInput.style.height = '200px'; // Example height
      // Allow vertical resizing if desired, or keep as 'none'
      this.chatInput.style.resize = 'vertical';
      this.chatInput.style.overflowY = 'auto'; // Ensure scrollbar appears if needed
    } else {
      this.chatInput.style.height = ''; // Reset height
      this.chatInput.style.resize = 'none';
      // Remove rows manipulation
      // this.chatInput.rows = 1; // Ensure it collapses back to 1 row height
      this.chatInput.style.overflowY = 'hidden'; // Hide scrollbar when collapsed
    }
    // Notify UIManager/LayoutBuilder to update button appearance
    this.callbacks.toggleInputExpansionUI(this.isInputExpanded);
  }

  // --- Code Reference Methods ---
  /**
   * Adds a code reference to the internal map and returns its ID.
   * @param codeContent The actual code content.
   * @param notebookName The name of the notebook the code is from.
   * @param cellIndex The index of the cell the code is from (0-based).
   * @param lineNumber The starting line number of the code within the cell (1-based).
   * @param lineEndNumber The ending line number of the code within the cell (1-based).
   * @returns The generated reference ID (e.g., "ref-1").
   */
  public addCodeReference(
    codeContent: string, // Renamed parameter
    notebookName: string,
    cellIndex: number,
    lineNumber: number, // Start line
    lineEndNumber: number // End line
  ): string {
      const refId = `ref-${this.nextRefId++}`;
      // Store type and use 'content' field
      const refData: CodeRefData = { 
          type: 'code', 
          content: codeContent, // Use content field
          notebookName, 
          cellIndex, 
          lineNumber, 
          lineEndNumber 
      }; 
      this.codeRefMap.set(refId, refData); 
      console.log(
        'Added code reference:',
        refId, 
        '->',
        `(${notebookName}, Cell ${cellIndex + 1}, Line ${lineNumber}${lineNumber !== lineEndNumber ? '_' + lineEndNumber : ''}) ` + 
        codeContent.substring(0, 30) + '...' // Use codeContent
      ); 
      return refId;
  }

  /**
   * Returns the current map of code references.
   */
  public getCodeReferenceMap(): Map<string, CodeRefData> {
      return this.codeRefMap;
  }

  /**
   * Clears the code reference map and resets the ID counter.
   */
  public resetCodeReferences(): void {
      // --- DEBUG LOG --- 
      console.log('[InputHandler] resetCodeReferences called!', new Error().stack); // Log call stack
      // --- END DEBUG LOG --- 
      this.codeRefMap.clear();
      this.nextRefId = 1;
      console.log('Code references reset.'); // Debug log
  }
  
  /**
   * Replaces code reference placeholders (e.g., "[ref-1]") in a message string
   * with the actual code from the map.
   * @param message The message string potentially containing placeholders.
   * @returns The message string with placeholders resolved.
   */
  private resolveCodeReferences(message: string): string {
      if (this.codeRefMap.size === 0) {
          return message; // No references to resolve
      }
      
      // Regex to find placeholders like [ref-1], [ref-12], etc.
      // Adjusted regex slightly to be non-greedy if needed, though current format is fine.
      const placeholderRegex = /@(?:code|Cell)\[(ref-\d+)\]|@code\((?:[^)]+)\)\[(ref-\d+)\]|\[(ref-\d+)\]/g;
      
      let resolvedMessage = message.replace(placeholderRegex, (match, refId1, refId2, refId3) => {
          const refId = refId1 || refId2 || refId3; // Get the captured refId
          if (!refId) return match; // If somehow no refId captured, return original match

          const refData = this.codeRefMap.get(refId);
          if (refData) {
              console.log(`Resolving ${refData.type} reference:`, refId); // Debug log type
              // Use refData.content (renamed from refData.code)
              // Add context based on type?
              const prefix = refData.type === 'cell' ? 
                  `\n--- Start Cell ${refData.cellIndex + 1} (${refData.notebookName}) ---\n` : 
                  `\n--- Start Code (${refData.notebookName}:Cell ${refData.cellIndex + 1}:L${refData.lineNumber}-${refData.lineEndNumber}) ---\n`;
              const suffix = refData.type === 'cell' ? 
                  `\n--- End Cell ${refData.cellIndex + 1} ---` : 
                  `\n--- End Code ---`;

              return `${prefix}${refData.content}${suffix}`; 
          } else {
              console.warn('Could not find data for reference:', refId); // Warn if ref ID not found
              return match; // Keep the placeholder if not found
          }
      });
      
      return resolvedMessage;
  }

  // NEW method specifically for Ctrl+L shortcut
  public handleInsertCodeReferenceFromShortcut(selectedText: string): void {
    const currentNotebookWidget = globals.notebookTracker?.currentWidget;
    const activeCell = globals.notebookTracker?.activeCell;
    const editor = activeCell?.editor;
    const cmEditor = editor ? (editor as any).editor : null; // CodeMirror view

    if (!currentNotebookWidget || !activeCell || !editor || !cmEditor || !cmEditor.state) {
      console.error('Cannot insert code reference: Missing notebook, cell, or editor context.');
      // Optionally show an indicator via callbacks?
      return;
    }

    try {
      // 1. Gather Context
      const notebookPath = currentNotebookWidget.context.path;
      const notebookName = notebookPath.split('/').pop()?.split('.')[0] || 'notebook';
      const cellIndex = currentNotebookWidget.content.activeCellIndex;

      const state = cmEditor.state;
      const selection = state.selection.main;
      const startLine = state.doc.lineAt(selection.from).number; // 1-based
      const endLine = state.doc.lineAt(selection.to).number; // 1-based

      if (cellIndex === undefined || cellIndex === null) {
        console.error('Cannot insert code reference: Could not determine active cell index.');
        return;
      }

      // 2. Add Code Reference to Map
      const refId = this.addCodeReference(
        selectedText,
        notebookName,
        cellIndex,
        startLine,
        endLine
      );

      // 3. Insert Representation into Input Field
      const displayLines = startLine === endLine ? `L${startLine}` : `L${startLine}-${endLine}`;
      // Format consistent with addCodeReference log and likely widget display
      const refDisplayText = `@code(${notebookName}:Cell ${cellIndex + 1}:${displayLines})`; 

      this.chatInput.focus(); // Ensure focus
      const winSelection = window.getSelection();
      if (!winSelection || winSelection.rangeCount === 0) {
        console.error('Cannot insert reference display text: No window selection found.');
        // Fallback: append (though cursor position might be wrong)
        this.appendToInput(refDisplayText + ' '); 
        return;
      }

      const range = winSelection.getRangeAt(0);
      
      // Assuming the shortcut handler WILL NOT insert '@code ' anymore,
      // we insert the refDisplayText at the current cursor position.

      const textNode = document.createTextNode(refDisplayText + ' '); // Add trailing space
      range.deleteContents(); // Clear any existing selection in the input field
      range.insertNode(textNode);

      // Move cursor after inserted text
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      winSelection.removeAllRanges();
      winSelection.addRange(range);
      // --- End Insertion Logic ---

      // Trigger input event manually
      this.chatInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));

    } catch (error) {
      console.error('Error handling insert code reference from shortcut:', error);
    }
  }

  // NEW: Method to add a cell reference
  public addCellReference(
    notebookName: string,
    cellIndex: number
  ): string | null { // Return null if cell content cannot be fetched
    const notebookPanel = globals.notebookTracker?.currentWidget;
    if (!notebookPanel || !notebookPanel.content.model || !notebookPanel.content.model.cells) {
        console.error('Cannot add cell reference: Notebook or cells not found.');
        return null;
    }
    const model = notebookPanel.content.model;
    if (cellIndex < 0 || cellIndex >= model.cells.length) {
        console.error(`Cannot add cell reference: Invalid cell index ${cellIndex}`);
        return null;
    }
    const cell = model.cells.get(cellIndex);
    let cellContent = '';
    // Get cell content - handle different ways content might be stored
    if (cell.sharedModel && typeof cell.sharedModel.getSource === 'function') {
      cellContent = cell.sharedModel.getSource();
    } else {
      const cellJson = cell.toJSON();
      const source = cellJson?.source;
      if (typeof source === 'string') {
        cellContent = source;
      } else if (Array.isArray(source)) {
        cellContent = source.join('\n'); // Corrected: Use actual newline
      }
    }

    const refId = `ref-${this.nextRefId++}`;
    const refData: CodeRefData = { 
        type: 'cell', 
        content: cellContent, 
        notebookName, 
        cellIndex 
        // lineNumber/lineEndNumber are omitted
    };
    this.codeRefMap.set(refId, refData);
    // Combine console.log into one line
    console.log(`Added cell reference: ${refId} -> (${notebookName}, Cell ${cellIndex + 1}) ${cellContent.substring(0, 30)}...`);
    return refId;
  }

  // NEW method specifically for Ctrl+L shortcut (Cell)
  public handleInsertCellReferenceFromShortcut(): void {
    const currentNotebookWidget = globals.notebookTracker?.currentWidget;
    const activeCell = globals.notebookTracker?.activeCell;

    if (!currentNotebookWidget || !activeCell) {
      console.error('Cannot insert cell reference: Missing notebook or cell context.');
      return;
    }

    try {
        // 1. Gather Context
        const notebookPath = currentNotebookWidget.context.path;
        const notebookName = notebookPath.split('/').pop()?.split('.')[0] || 'notebook';
        const cellIndex = currentNotebookWidget.content.activeCellIndex;

        if (cellIndex === undefined || cellIndex === null) {
            console.error('Cannot insert cell reference: Could not determine active cell index.');
            return;
        }

        // 2. Add Cell Reference to Map
        const refId = this.addCellReference(notebookName, cellIndex);

        if (!refId) {
            console.error('Failed to add cell reference to map.');
            return; // Stop if we couldn't create the reference data
        }

        // 3. Insert Representation into Input Field (using user's format)
        const refDisplayText = `@Cell[${cellIndex + 1}]`; 

        this.chatInput.focus(); // Ensure focus
        const winSelection = window.getSelection();
        if (!winSelection || winSelection.rangeCount === 0) {
            console.error('Cannot insert reference display text: No window selection found.');
            this.appendToInput(refDisplayText + ' '); // Fallback
            return;
        }

        const range = winSelection.getRangeAt(0);
        const textNode = document.createTextNode(refDisplayText + ' '); // Add trailing space
        range.deleteContents(); // Clear any existing selection in the input field
        range.insertNode(textNode);

        // Move cursor after inserted text
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        winSelection.removeAllRanges();
        winSelection.addRange(range);

        // Trigger input event manually
        this.chatInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));

    } catch (error) {
        console.error('Error handling insert cell reference from shortcut:', error);
    }
  }

  // --- Private Event Handlers ---

  private _handleKeyPress = (event: KeyboardEvent): void => {
    // Handle Enter key press (send message)
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent default newline insertion
      // Use textContent for div
      let message = this.chatInput.textContent || '';
      message = message.trim(); // Just trim the raw message
      
      if (message) {
        this.callbacks.handleSendMessage(message); // Pass raw message with placeholders
      }
    }
    // --- Handle Tab/Escape/Arrows for popup interaction ---
    // Check if popup is visible (needs a way to know, maybe via callbacks or direct reference?)
    // Assuming popupMenuManager reference is available or state is tracked
    // else if (this.popupMenuManager.isPopupMenuVisible()) { // Pseudo-code
    //    if (event.key === 'Tab' || event.key === 'Escape' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    //        // Prevent default input field behavior
    //        event.preventDefault();
    //        // Let the PopupMenuManager's document handler manage the event
    //    }
    // }
    // --- End Popup Interaction Handling ---
  };

  private _handleInput = (): void => {
    // Use textContent for div
    const currentText = this.chatInput.textContent || '';
    
    // --- Update Code Ref Placeholders --- 
    // Optional: If we want visual placeholders to update live
    // This could involve complex DOM manipulation or using a library.
    // For now, we resolve refs only on send.
    
    // --- At Symbol Detection for Popup --- 
    // This logic was moved to UIManager.handleInputForReference
    // because UIManager needs to coordinate showing the popup.
    // InputHandler might still need to know *if* an @ was typed recently
    // to adjust behavior (e.g., how Enter works), but UIManager handles the popup trigger.
    
    // Simple check if text contains '@' for potential state management
    this.hasAtSymbol = currentText.includes('@'); 

    // Adjust input height dynamically based on content?
    // Can be complex with contenteditable divs. Requires careful calculation.
    // this.adjustInputHeight(); 
  };
  
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