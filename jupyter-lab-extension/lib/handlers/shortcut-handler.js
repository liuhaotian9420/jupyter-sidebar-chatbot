"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupShortcuts = setupShortcuts;
exports.removeShortcuts = removeShortcuts;
const notebook_integration_1 = require("../utils/notebook-integration");
const globals_1 = require("../core/globals"); // Import globals to get cell index etc.
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
        var _a, _b, _c;
        const { showIndicator, appendToInput, showWidget, focusInput } = callbacks;
        // Check for @ key - event.key should correctly report '@' even with Shift
        // Also check for SHIFT+2 as an alternative way to trigger '@'
        if (event.key === '@' || (event.shiftKey && event.key === '2')) {
            console.log("SHORTCUT HANDLER: '@' key or SHIFT+2 detected");
            const inputField = document.activeElement;
            const isContentEditableInput = inputField &&
                inputField.getAttribute('contenteditable') === 'true' &&
                inputField.classList.contains('jp-llm-ext-input-field');
            // Handle the case where the input field is NOT the active element first
            if (!isContentEditableInput) { // Only handle if NOT our input field
                console.log("SHORTCUT HANDLER: Input field is NOT active element. Handling '@' globally.");
                // If not in our input field, prevent default, show widget, focus, insert '@', and show popup.
                event.preventDefault();
                event.stopPropagation();
                showWidget();
                focusInput();
                // After focus, show popup via window.setTimeout to ensure input is ready
                window.setTimeout(() => {
                    const inputElement = document.querySelector('.jp-llm-ext-input-field');
                    if (inputElement) {
                        const selection = window.getSelection();
                        if (selection) { // Check if selection exists (even if rangeCount is 0 initially)
                            // Ensure the input field has focus *before* manipulating the range
                            if (document.activeElement !== inputElement) {
                                inputElement.focus(); // Re-focus just in case
                            }
                            // Create or get the range
                            let range;
                            if (selection.rangeCount > 0) {
                                range = selection.getRangeAt(0);
                                // Double-check if the focus is now correctly inside the input element
                                if (!inputElement.contains(range.commonAncestorContainer)) {
                                    console.log("SHORTCUT HANDLER: Range is not inside the input field after focus. Creating new range.");
                                    // If range is not inside, create a new one collapsed at the end
                                    range = document.createRange();
                                    range.selectNodeContents(inputElement);
                                    range.collapse(false); // Collapse to the end
                                    selection.removeAllRanges();
                                    selection.addRange(range);
                                }
                            }
                            else {
                                // If no range exists, create one collapsed at the end
                                console.log("SHORTCUT HANDLER: No range found after focus. Creating new range.");
                                range = document.createRange();
                                range.selectNodeContents(inputElement);
                                range.collapse(false); // Collapse to the end
                                selection.removeAllRanges();
                                selection.addRange(range);
                            }
                            // Manually insert '@' since we prevented default
                            const atNode = document.createTextNode('@');
                            range.deleteContents(); // Clear any selection just in case
                            range.insertNode(atNode);
                            // Move cursor after the inserted '@'
                            range.setStartAfter(atNode);
                            range.setEndAfter(atNode);
                            selection.removeAllRanges(); // Update selection to the new cursor position
                            selection.addRange(range);
                            // **NESTED TIMEOUT:** Give browser time to render before getting range position
                            window.setTimeout(() => {
                                console.log("SHORTCUT HANDLER: Showing popup after focusing, inserting '@', and nested timeout.");
                                // Ensure we get the most up-to-date range reference
                                const currentSelection = window.getSelection();
                                if (currentSelection && currentSelection.rangeCount > 0) {
                                    const currentRange = currentSelection.getRangeAt(0);
                                    // --- Insert temporary span to get reliable coords --- 
                                    const tempAnchorId = 'jp-llm-shortcut-popup-anchor';
                                    let tempSpan = document.getElementById(tempAnchorId);
                                    if (tempSpan)
                                        tempSpan.remove(); // Clean up previous
                                    tempSpan = document.createElement('span');
                                    tempSpan.id = tempAnchorId;
                                    tempSpan.style.visibility = 'hidden';
                                    tempSpan.style.width = '0';
                                    tempSpan.style.overflow = 'hidden';
                                    tempSpan.textContent = '\u200B'; // Zero-width space
                                    currentRange.insertNode(tempSpan); // Insert at cursor
                                    const spanRect = tempSpan.getBoundingClientRect();
                                    tempSpan.remove(); // Remove immediately
                                    // --- End temporary span logic ---
                                    if (spanRect.top === 0 && spanRect.left === 0) {
                                        console.error("SHORTCUT HANDLER: Failed to get valid coordinates from temp anchor span.");
                                    }
                                    else {
                                        console.log(`SHORTCUT HANDLER: Anchor coords from temp span: Top=${spanRect.top}, Left=${spanRect.left}`);
                                        popupMenuManager.showPopupMenu(spanRect.left, spanRect.top);
                                        showIndicator('Browsing references...');
                                    }
                                }
                                else {
                                    console.error("SHORTCUT HANDLER: Could not get range immediately before showing popup.");
                                }
                            }, 0); // 0ms delay is often sufficient
                        }
                        else {
                            console.log("SHORTCUT HANDLER: No selection object after focus, cannot insert '@' or show popup reliably.");
                        }
                    }
                    else {
                        console.log("SHORTCUT HANDLER: Could not find input element after timeout.");
                    }
                }, 50); // Outer timeout remains 50ms
            }
            else {
                // Input field IS focused. Let default '@' insertion happen.
                // The 'input' listener in UIManager should handle the popup.
                console.log("SHORTCUT HANDLER: Input field IS active element. Letting default '@' behavior proceed.");
            }
        }
        // Check for Ctrl+L (insert selection or cell)
        else if (event.ctrlKey && event.key.toLowerCase() === 'l') {
            event.preventDefault();
            event.stopPropagation();
            const selected = (0, notebook_integration_1.getSelectedText)();
            // const cellContent = getCurrentCellContent(); // We don't need the content itself anymore
            const isCellFocused = (0, notebook_integration_1.isInNotebookCellAndEditorFocused)(); // If the cursor is in the editor mode
            const isCellSelected = (0, notebook_integration_1.isInNotebookCell)(); // If the cursor is in the notebook cell
            const activeCellIndex = (_c = (_b = (_a = globals_1.globals.notebookTracker) === null || _a === void 0 ? void 0 : _a.currentWidget) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.activeCellIndex; // Get index
            let handled = false;
            // Priority 1: Selected text in an active cell editor
            if (isCellFocused && selected) {
                // Call the new InputHandler method to create the reference and insert its representation
                inputHandler.handleInsertCodeReferenceFromShortcut(selected);
                showIndicator('Code reference inserted'); // Updated indicator message
                handled = true;
                // Priority 2: Active cell selected (not necessarily editor focus)
            }
            else if (isCellSelected && activeCellIndex !== undefined && activeCellIndex !== null) {
                // Mimic selecting '@Cells' -> clicking a cell
                // Insert reference like "@Cell 3" (using 1-based index for display)
                appendToInput(`@Cell[${activeCellIndex + 1}]`); // Add trailing space
                showIndicator('Cell reference inserted');
                handled = true;
            }
            else {
                // Invalid context for the shortcut
                showIndicator('Cannot insert reference: Select code or an active cell.');
                handled = true; // Still handled the shortcut, just showed a warning
            }
            // Ensure the sidebar is visible and input is focused only if an action was taken
            if (handled) {
                showWidget(); // Use callback
                focusInput(); // Use callback
            }
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
