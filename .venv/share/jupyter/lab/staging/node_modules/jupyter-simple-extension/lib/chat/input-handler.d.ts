/**
 * Handles input field functionality
 */
/**
 * Manages input field behavior and interactions
 */
export declare class InputHandler {
    private inputField;
    private isInputExpanded;
    private isMarkdownMode;
    private onSendMessage;
    constructor(inputField: HTMLTextAreaElement, _inputContainer: HTMLDivElement, // Prefix with underscore to indicate it's not used
    onSendMessage: () => void);
    /**
     * Sets up event listeners for the input field
     */
    private setupInputFieldEvents;
    /**
     * Toggles the expansion state of the input field
     * @param button The button element that triggered the toggle
     */
    toggleInputExpansion(button: HTMLButtonElement): void;
    /**
     * Toggles markdown mode
     * @param button The button element that triggered the toggle
     */
    toggleMarkdownMode(button: HTMLButtonElement): void;
    /**
     * Gets the current input text
     * @returns The current input text
     */
    getInputText(): string;
    /**
     * Clears the input field
     */
    clearInput(): void;
    /**
     * Appends text to the input field with proper spacing
     * @param text The text to append
     */
    appendToInput(text: string): void;
    /**
     * Checks if markdown mode is enabled
     * @returns True if markdown mode is enabled, false otherwise
     */
    isMarkdownEnabled(): boolean;
}
