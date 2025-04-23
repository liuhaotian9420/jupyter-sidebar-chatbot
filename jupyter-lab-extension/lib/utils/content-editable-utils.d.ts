/**
 * Gets the caret position within a contenteditable element.
 * Returns the linear offset from the start of the element's text content.
 */
export declare function getCaretPosition(element: HTMLElement): number;
/**
 * Sets the caret position within a contenteditable element.
 * @param element The contenteditable element.
 * @param position The desired linear offset from the start of the text content.
 */
export declare function setCaretPosition(element: HTMLElement, position: number): void;
