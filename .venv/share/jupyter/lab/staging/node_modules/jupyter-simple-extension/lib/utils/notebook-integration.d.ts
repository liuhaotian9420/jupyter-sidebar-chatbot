/**
 * Adds message content to the current cell in the active notebook.
 */
export declare function addMessageToCell(text: string): void;
/**
 * Gets the currently selected text from:
 *  - the active notebook cell
 *  - the text editor
 *  - the output area of a code cell
 */
export declare function getSelectedText(): string | null;
/**
 * Checks whether we are currently in a notebook cell.
*/
export declare function isInNotebookCell(): boolean;
/**
 * Checks whether we are currently in a notebook cell and the editor is focused:
 * meaning that the cursor is in the editor.
*/
export declare function isInNotebookCellAndEditorFocused(): boolean;
/**
 * Check whether the currently active cell is a code cell.
*/
export declare function isCodeCell(): boolean;
/**
 * Check whether the cursor is in the output area of a code cell.
 * This function specifically checks if we're in a code cell's output area,
 * not just any output area.
 */
export declare function isOutputArea(): boolean;
/**
 * Gets the content of the currently active notebook cell or text editor.
 */
export declare function getCurrentCellContent(): string | null;
/**
 * Gets cell content by index from the current notebook and calls a callback to insert it.
 * NOTE: The original function called `this.appendToInput`. This functionality needs
 *       to be provided via the `insertCallback`.
 */
export declare function insertCellContentByIndex(index: number, insertCallback: (content: string) => void): void;
