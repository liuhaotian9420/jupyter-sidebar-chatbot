"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMessageToCell = addMessageToCell;
exports.getSelectedText = getSelectedText;
exports.getCurrentCellContent = getCurrentCellContent;
exports.insertCellContentByIndex = insertCellContentByIndex;
const globals_1 = require("../core/globals");
/**
 * Adds message content to the current cell in the active notebook.
 */
function addMessageToCell(text) {
    var _a;
    const cell = (_a = globals_1.globals.notebookTracker) === null || _a === void 0 ? void 0 : _a.activeCell;
    if (!cell || !cell.editor) {
        console.warn('Cannot add message: No active cell or editor found.');
        return;
    }
    try {
        const editor = cell.editor;
        // Access the underlying CodeMirror editor view (adjust if using a different editor)
        const view = editor.editor;
        if (!view) {
            console.warn('Cannot add message: CodeMirror view not accessible.');
            return;
        }
        // Get current cursor position
        const state = view.state;
        const selection = state.selection;
        const cursorPos = selection.main.head;
        // Insert newline and message content at cursor position
        const transaction = state.update({
            changes: {
                from: cursorPos,
                insert: `\n${text}`
            },
            // Optionally move cursor to end of inserted text
            selection: { anchor: cursorPos + text.length + 1 }
        });
        view.dispatch(transaction);
    }
    catch (error) {
        console.error('Error adding message to cell:', error);
    }
}
/**
 * Gets the currently selected text from the active notebook cell or text editor.
 */
function getSelectedText() {
    var _a, _b, _c;
    const cell = (_a = globals_1.globals.notebookTracker) === null || _a === void 0 ? void 0 : _a.activeCell;
    if (cell === null || cell === void 0 ? void 0 : cell.editor) {
        const editor = cell.editor;
        const cmEditor = editor.editor; // Access CodeMirror editor instance
        if (cmEditor && cmEditor.state) {
            const state = cmEditor.state;
            const selection = state.selection.main;
            return selection.empty ? null : state.doc.sliceString(selection.from, selection.to);
        }
        console.warn("Could not access CodeMirror state to get selection.");
        return null;
    }
    else {
        // Fallback for non-notebook editors (e.g., text editor)
        const activeWidget = (_c = (_b = globals_1.globals.app) === null || _b === void 0 ? void 0 : _b.shell) === null || _c === void 0 ? void 0 : _c.currentWidget;
        if (activeWidget && 'content' in activeWidget && activeWidget.content.editor) {
            const editor = activeWidget.content.editor;
            const cmEditor = editor.editor;
            if (cmEditor && cmEditor.state) {
                const state = cmEditor.state;
                const selection = state.selection.main;
                return selection.empty ? null : state.doc.sliceString(selection.from, selection.to);
            }
            console.warn("Could not access CodeMirror state for non-notebook editor selection.");
            return null;
        }
    }
    return null;
}
/**
 * Gets the content of the currently active notebook cell or text editor.
 */
function getCurrentCellContent() {
    var _a, _b, _c, _d, _e;
    const activeCell = (_a = globals_1.globals.notebookTracker) === null || _a === void 0 ? void 0 : _a.activeCell;
    if (activeCell === null || activeCell === void 0 ? void 0 : activeCell.model) {
        // Try using sharedModel first (more robust)
        if (activeCell.model.sharedModel && typeof activeCell.model.sharedModel.getSource === 'function') {
            return activeCell.model.sharedModel.getSource();
        }
        // Fallback: Try using toJSON().source
        const cellJson = activeCell.model.toJSON();
        const source = cellJson === null || cellJson === void 0 ? void 0 : cellJson.source;
        if (typeof source === 'string') {
            return source;
        }
        else if (Array.isArray(source)) {
            return source.join('\n');
        }
        console.warn("Could not get cell content via sharedModel or toJSON().source");
        return null;
    }
    // Fallback for non-notebook editors if needed
    const activeWidget = (_c = (_b = globals_1.globals.app) === null || _b === void 0 ? void 0 : _b.shell) === null || _c === void 0 ? void 0 : _c.currentWidget;
    if (activeWidget && 'content' in activeWidget && activeWidget.content.model) {
        // Assuming model.value.text for generic text editors
        return (_e = (_d = activeWidget.content.model.value) === null || _d === void 0 ? void 0 : _d.text) !== null && _e !== void 0 ? _e : null;
    }
    return null;
}
/**
 * Gets cell content by index from the current notebook and calls a callback to insert it.
 * NOTE: The original function called `this.appendToInput`. This functionality needs
 *       to be provided via the `insertCallback`.
 */
function insertCellContentByIndex(index, insertCallback) {
    try {
        if (!globals_1.globals.notebookTracker || !globals_1.globals.notebookTracker.currentWidget) {
            console.error('No active notebook found');
            return;
        }
        const notebookPanel = globals_1.globals.notebookTracker.currentWidget;
        const model = notebookPanel.content.model;
        if (!model || !model.cells || index < 0 || index >= model.cells.length) {
            console.error(`Invalid cell index: ${index}`);
            return;
        }
        const cell = model.cells.get(index);
        let cellContent = '';
        // Get cell content - handle different ways content might be stored
        if (cell.sharedModel && typeof cell.sharedModel.getSource === 'function') {
            cellContent = cell.sharedModel.getSource();
        }
        else {
            const cellJson = cell.toJSON();
            const source = cellJson === null || cellJson === void 0 ? void 0 : cellJson.source;
            if (typeof source === 'string') {
                cellContent = source;
            }
            else if (Array.isArray(source)) {
                cellContent = source.join('\n');
            }
        }
        // Insert cell reference with content using the callback
        insertCallback(`cell ${cellContent}`);
    }
    catch (error) {
        console.error('Error inserting cell by index:', error);
    }
}
