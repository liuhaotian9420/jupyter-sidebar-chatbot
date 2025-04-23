/**
 * Adds message content to the current cell in the active notebook.
 */
export declare function addMessageToCell(text: string): void;
/**
 * Gets the currently selected text from the active notebook cell or text editor.
 */
export declare function getSelectedText(): string | null;
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
