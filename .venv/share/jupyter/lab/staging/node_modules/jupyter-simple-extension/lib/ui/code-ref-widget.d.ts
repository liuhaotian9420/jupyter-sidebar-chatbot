/**
 * Data associated with a code reference widget.
 */
export interface CodeRefData {
    refId: string;
    code: string;
    codeRef: string;
}
/**
 * Creates the HTML element for a collapsible code reference widget.
 *
 * @param data - The data for the code reference.
 * @returns The HTMLElement representing the code reference widget.
 */
export declare function createCodeRefWidgetHTML(data: CodeRefData): HTMLSpanElement;
/**
 * Attaches event listeners (specifically click for toggle) to a code ref widget.
 *
 * @param element - The code ref widget HTMLElement.
 * @param toggleCallback - A function to call when the toggle button is clicked.
 */
export declare function attachCodeRefEventListeners(element: HTMLElement, toggleCallback: (targetButton: HTMLButtonElement, contentElement: HTMLElement) => void): void;
/**
 * Default logic for toggling the visibility of the code ref content.
 * This can be passed as the callback to attachCodeRefEventListeners.
 *
 * @param toggleButton - The button element that was clicked.
 * @param contentElement - The content element to toggle.
 */
export declare function defaultCodeRefToggleLogic(toggleButton: HTMLButtonElement, contentElement: HTMLElement): void;
/**
 * Creates a textual placeholder for a code reference.
 *
 * @param refId - The unique identifier for the reference (e.g., "ref-1").
 * @param notebookName - The name of the notebook (optional, for future display enhancements).
 * @param lineNumber - The starting line number of the code (optional, for future display enhancements).
 * @returns A string placeholder like "[ref-1]".
 */
export declare function createCodeRefPlaceholder(refId: string, notebookName?: string, // Keep optional for now
lineNumber?: number): string;
