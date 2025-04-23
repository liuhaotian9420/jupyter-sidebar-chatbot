export interface InputHandlerCallbacks {
    handleSendMessage: (message: string) => void;
    showPopupMenu: (left: number, top: number) => void;
    hidePopupMenu: () => void;
    updatePlaceholder: (isMarkdown: boolean) => void;
    toggleInputExpansionUI: (isExpanded: boolean) => void;
    getCodeRefMap: () => Map<string, string>;
    resetCodeRefMap: () => void;
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
    constructor(chatInput: HTMLTextAreaElement, callbacks: InputHandlerCallbacks);
    /**
     * Removes event listeners.
     */
    dispose(): void;
    /**
     * Appends text to the input field with proper spacing and focus.
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
     * @param code The actual code content.
     * @returns The generated reference ID (e.g., "ref-1").
     */
    addCodeReference(code: string): string;
    /**
     * Returns the current map of code references.
     */
    getCodeReferenceMap(): Map<string, string>;
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
    private _handleKeyPress;
    private _handleInput;
    /**
     * Explicitly sets the hasAtSymbol flag. Called by shortcut handler.
     */
    setHasAtSymbol(value: boolean): void;
    /**
     * Gets the current value of the hasAtSymbol flag. Called by shortcut handler.
     */
    getHasAtSymbol(): boolean;
}
