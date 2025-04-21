"use strict";
/**
 * Handles input field functionality
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputHandler = void 0;
/**
 * Manages input field behavior and interactions
 */
class InputHandler {
    constructor(inputField, _inputContainer, // Prefix with underscore to indicate it's not used
    onSendMessage) {
        this.isInputExpanded = false;
        this.isMarkdownMode = false;
        this.inputField = inputField;
        this.onSendMessage = onSendMessage;
        // Set up input field event listeners
        this.setupInputFieldEvents();
    }
    /**
     * Sets up event listeners for the input field
     */
    setupInputFieldEvents() {
        // Handle Enter key to send message
        this.inputField.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                this.onSendMessage();
            }
        });
    }
    /**
     * Toggles the expansion state of the input field
     * @param button The button element that triggered the toggle
     */
    toggleInputExpansion(button) {
        this.isInputExpanded = !this.isInputExpanded;
        if (this.isInputExpanded) {
            this.inputField.style.height = '150px';
            this.inputField.style.resize = 'vertical';
            button.textContent = '\u25bc';
        }
        else {
            this.inputField.style.height = '50px';
            this.inputField.style.resize = 'none';
            button.textContent = '\u25b2';
        }
    }
    /**
     * Toggles markdown mode
     * @param button The button element that triggered the toggle
     */
    toggleMarkdownMode(button) {
        this.isMarkdownMode = !this.isMarkdownMode;
        if (this.isMarkdownMode) {
            button.textContent = 'MD';
            button.classList.add('active');
        }
        else {
            button.textContent = 'MD';
            button.classList.remove('active');
        }
    }
    /**
     * Gets the current input text
     * @returns The current input text
     */
    getInputText() {
        return this.inputField.value;
    }
    /**
     * Clears the input field
     */
    clearInput() {
        this.inputField.value = '';
    }
    /**
     * Appends text to the input field with proper spacing
     * @param text The text to append
     */
    appendToInput(text) {
        try {
            const currentText = this.inputField.value;
            const cursorPosition = this.inputField.selectionStart;
            // Check if we need to add a space before the text
            const needsLeadingSpace = cursorPosition > 0 &&
                currentText.charAt(cursorPosition - 1) !== ' ' &&
                currentText.charAt(cursorPosition - 1) !== '\n';
            // Check if we need to add a space after the text
            const needsTrailingSpace = cursorPosition < currentText.length &&
                currentText.charAt(cursorPosition) !== ' ' &&
                currentText.charAt(cursorPosition) !== '\n';
            // Build the text to insert
            let insertText = '';
            if (needsLeadingSpace)
                insertText += ' ';
            insertText += text;
            if (needsTrailingSpace)
                insertText += ' ';
            // Insert the text at the cursor position
            const newText = currentText.substring(0, cursorPosition) +
                insertText +
                currentText.substring(cursorPosition);
            this.inputField.value = newText;
            // Set focus back to the input field
            this.inputField.focus();
        }
        catch (error) {
            console.error('Error appending to input:', error);
        }
    }
    /**
     * Checks if markdown mode is enabled
     * @returns True if markdown mode is enabled, false otherwise
     */
    isMarkdownEnabled() {
        return this.isMarkdownMode;
    }
}
exports.InputHandler = InputHandler;
