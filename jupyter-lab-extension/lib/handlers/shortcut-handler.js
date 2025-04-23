"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupShortcuts = setupShortcuts;
exports.removeShortcuts = removeShortcuts;
const notebook_integration_1 = require("../utils/notebook-integration");
let _handleKeyDown = null;
/**
 * Sets up global keyboard shortcuts for the extension.
 *
 * @param inputHandler Instance of InputHandler to interact with input state/methods.
 * @param popupMenuManager Instance of PopupMenuManager.
 * @param callbacks Object containing callback functions for UI interactions.
 */
function setupShortcuts(inputHandler, // Pass InputHandler instance directly
popupMenuManager, callbacks) {
    if (_handleKeyDown) {
        console.warn('Shortcuts already set up. Removing previous listener.');
        removeShortcuts();
    }
    _handleKeyDown = (event) => {
        const { showIndicator, appendToInput, showWidget, focusInput } = callbacks;
        // Check for @ key
        if (event.key === '@') {
            // Prevent default browser behavior
            event.preventDefault();
            event.stopPropagation();
            // Check if the input field is the active element
            // We rely on InputHandler potentially managing focus or assume it is handled elsewhere
            const inputField = document.activeElement; // A bit fragile
            if (inputField && inputField.tagName === 'TEXTAREA' && inputField.classList.contains('jp-llm-ext-input-field')) {
                // Get cursor position
                const cursorPosition = inputField.selectionStart || 0;
                const textBeforeCursor = inputField.value.substring(0, cursorPosition);
                // Calculate position to show menu (simplified example)
                const inputRect = inputField.getBoundingClientRect();
                const lineHeight = parseInt(window.getComputedStyle(inputField).lineHeight) || 20;
                const linesBeforeCursor = (textBeforeCursor.match(/\n/g) || []).length;
                const cursorTop = inputRect.top + (linesBeforeCursor * lineHeight);
                const left = inputRect.left + 10; // Simplified horizontal position
                // Insert @ symbol at cursor position
                const newValue = inputField.value.substring(0, cursorPosition) +
                    '@' +
                    inputField.value.substring(cursorPosition);
                inputField.value = newValue;
                // Update has @ symbol flag via InputHandler
                inputHandler.setHasAtSymbol(true);
                // Move cursor after the @ symbol
                inputField.selectionStart = cursorPosition + 1;
                inputField.selectionEnd = cursorPosition + 1;
                // Show the popup menu
                popupMenuManager.showPopupMenu(left + 60, cursorTop - 20); // Adjust positioning as needed
                showIndicator('Browse cells, code, files, and more');
            }
        }
        // Check for Ctrl+L (insert selection or cell)
        else if (event.ctrlKey && event.key.toLowerCase() === 'l') {
            event.preventDefault();
            event.stopPropagation();
            const selected = (0, notebook_integration_1.getSelectedText)();
            if (selected) {
                appendToInput(`@code ${selected}`); // Use callback
                showIndicator('Selected code inserted');
            }
            else {
                const cellContent = (0, notebook_integration_1.getCurrentCellContent)();
                if (cellContent) {
                    appendToInput(`@cell ${cellContent}`); // Use callback
                    showIndicator('Cell content inserted');
                }
            }
            // Ensure the sidebar is visible and input is focused
            showWidget(); // Use callback
            focusInput(); // Use callback
        }
    };
    // Add the event listener to the document
    document.addEventListener('keydown', _handleKeyDown);
}
/**
 * Removes the global keyboard shortcut listener.
 */
function removeShortcuts() {
    if (_handleKeyDown) {
        document.removeEventListener('keydown', _handleKeyDown);
        _handleKeyDown = null;
        console.log('Removed keyboard shortcuts.');
    }
    else {
        console.warn('Attempted to remove shortcuts, but none were active.');
    }
}
