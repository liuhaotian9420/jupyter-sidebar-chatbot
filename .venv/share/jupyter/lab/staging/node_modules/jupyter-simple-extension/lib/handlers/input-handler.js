"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputHandler = void 0;
const content_editable_utils_1 = require("../utils/content-editable-utils"); // Helper needed
const globals_1 = require("../core/globals"); // Import globals
const message_renderer_1 = require("../ui/message-renderer");
/**
 * Handles events and logic related to the chat input field.
 */
class InputHandler {
    constructor(chatInput, callbacks
    // uiManager: UIManager // Removed unused parameter
    ) {
        // private uiManager: UIManager; // Removed unused member
        // --- Code Reference State ---
        this.codeRefMap = new Map();
        this.nextRefId = 1;
        // ---------------------------
        this.hasAtSymbol = false;
        this.isMarkdownMode = false; // Internal state, potentially synced with UIManager
        this.isInputExpanded = false; // Internal state, potentially synced with UIManager
        // NEW Click handler for widget interactions (e.g., expand)
        this._handleClick = (event) => {
            const target = event.target;
            const widget = target.closest('.jp-llm-ext-ref-widget');
            if (widget && widget.isContentEditable) {
                // Don't trigger preview if clicking inside the main editable div itself
                // Only trigger if clicking directly on a non-editable widget span
                if (widget === this.chatInput)
                    return; // Ignore clicks on the main div background
            }
            if (widget && !widget.isContentEditable) { // Ensure it's our non-editable widget span
                const type = widget.dataset.type;
                const content = widget.dataset.content;
                const refId = widget.dataset.refId;
                const path = widget.dataset.path;
                console.log(`Widget clicked: Type=${type}, RefID=${refId}, Path=${path}`);
                if ((type === 'code' || type === 'cell') && content) {
                    event.preventDefault(); // Prevent potential text selection issues
                    event.stopPropagation(); // Stop event from bubbling further
                    this.showWidgetPreview(widget, content);
                }
                else {
                    // Handle click on file/dir or widget without content? Maybe do nothing.
                    // Or potentially remove existing preview if any
                    this.removeWidgetPreview();
                }
            }
            else {
                // Click was not on a widget, remove any existing preview
                this.removeWidgetPreview();
            }
        };
        // --- Widget Preview Logic ---
        this.activePreviewElement = null;
        // --- Private Event Handlers ---
        this._handleKeyPress = (event) => {
            // Handle Enter key press (send message)
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault(); // Prevent default newline insertion
                // NEW: Use serialization method to get the raw message with placeholders
                let message = this._serializeInputContent();
                message = message.trim(); // Trim whitespace
                if (message) {
                    // Resolve code references with proper formatting based on markdown mode
                    const resolvedMessage = this.resolveCodeReferences(message, this.isMarkdownMode);
                    // Pass resolved message with current markdown state
                    this.callbacks.handleSendMessage(resolvedMessage, this.isMarkdownMode);
                }
            }
            // --- Handle Tab/Escape/Arrows for popup interaction ---
            // Check if popup is visible (needs a way to know, maybe via callbacks or direct reference?)
            // Assuming popupMenuManager reference is available or state is tracked
            // else if (this.popupMenuManager.isPopupMenuVisible()) { // Pseudo-code
            //    if (event.key === 'Tab' || event.key === 'Escape' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            //        // Prevent default input field behavior
            //        event.preventDefault();
            //        // Let the PopupMenuManager's document handler manage the event
            //    }
            // }
            // --- End Popup Interaction Handling ---
        };
        this._handleInput = () => {
            // Use textContent for div
            const currentText = this.chatInput.textContent || '';
            // --- Update Code Ref Placeholders --- 
            // Optional: If we want visual placeholders to update live
            // This could involve complex DOM manipulation or using a library.
            // For now, we resolve refs only on send.
            // --- At Symbol Detection for Popup --- 
            // This logic was moved to UIManager.handleInputForReference
            // because UIManager needs to coordinate showing the popup.
            // InputHandler might still need to know *if* an @ was typed recently
            // to adjust behavior (e.g., how Enter works), but UIManager handles the popup trigger.
            // Simple check if text contains '@' for potential state management
            this.hasAtSymbol = currentText.includes('@');
            // Adjust input height dynamically based on content?
            // Can be complex with contenteditable divs. Requires careful calculation.
            // this.adjustInputHeight(); 
        };
        // NEW Keydown handler for widget deletion etc.
        this._handleKeyDown = (event) => {
            var _a, _b;
            const selection = window.getSelection();
            if (!selection || !selection.rangeCount || !selection.isCollapsed) {
                // Only handle single cursor position, not range selection
                return;
            }
            const range = selection.getRangeAt(0);
            const container = range.startContainer;
            const offset = range.startOffset;
            const key = event.key;
            let widgetToDelete = null;
            let nodeToCheck = null;
            if (key === 'Backspace') {
                if (offset > 0 && container.nodeType === Node.TEXT_NODE) {
                    // Cursor is within a text node, check the node *before* this text node
                    // But only if the cursor is at the *start* of the text node (offset === 0? No, check previousSibling always?)
                    // Let's check the node directly preceding the container
                    nodeToCheck = container.previousSibling;
                }
                else if (offset > 0 && container === this.chatInput) {
                    // Cursor is between nodes in the main input div
                    nodeToCheck = container.childNodes[offset - 1];
                }
                else if (offset === 0 && container !== this.chatInput) {
                    // Cursor is at the beginning of a non-div node (e.g., start of a text node after a widget)
                    // Need to check the node before the container
                    nodeToCheck = container.previousSibling;
                }
                // Check if the node to check is a ZWS or space node, if so, check the node before that
                if (nodeToCheck && nodeToCheck.nodeType === Node.TEXT_NODE && (nodeToCheck.textContent === '\u200B' || nodeToCheck.textContent === ' ')) {
                    nodeToCheck = nodeToCheck.previousSibling;
                }
            }
            else if (key === 'Delete') {
                if (container.nodeType === Node.TEXT_NODE && offset < container.length) {
                    // Cursor is within a text node, check the node *after* this text node
                    nodeToCheck = container.nextSibling;
                }
                else if (container === this.chatInput && offset < container.childNodes.length) {
                    // Cursor is between nodes in the main input div
                    nodeToCheck = container.childNodes[offset];
                }
                else if (container !== this.chatInput && offset === (((_a = container.textContent) === null || _a === void 0 ? void 0 : _a.length) || 0)) {
                    // Cursor is at the end of a non-div node (e.g., end of a text node before a widget)
                    // Need to check the node after the container
                    nodeToCheck = container.nextSibling;
                }
                // Check if the node to check is a ZWS or space node, if so, check the node after that
                if (nodeToCheck && nodeToCheck.nodeType === Node.TEXT_NODE && (nodeToCheck.textContent === '\u200B' || nodeToCheck.textContent === ' ')) {
                    nodeToCheck = nodeToCheck.nextSibling;
                }
            }
            // Check if the final nodeToCheck is a widget
            if (nodeToCheck && nodeToCheck.nodeType === Node.ELEMENT_NODE && ((_b = nodeToCheck.classList) === null || _b === void 0 ? void 0 : _b.contains('jp-llm-ext-ref-widget'))) {
                widgetToDelete = nodeToCheck;
                console.log(`${key} pressed adjacent to widget:`, widgetToDelete);
            }
            if (widgetToDelete) {
                event.preventDefault();
                const parent = widgetToDelete.parentNode;
                if (parent) {
                    // Define nodes to remove: widget itself, potentially space before, potentially ZWS after
                    const nodesToRemove = [widgetToDelete];
                    const spaceBefore = widgetToDelete.previousSibling;
                    const zwsAfter = widgetToDelete.nextSibling;
                    if (spaceBefore && spaceBefore.nodeType === Node.TEXT_NODE && spaceBefore.textContent === ' ') {
                        nodesToRemove.unshift(spaceBefore); // Add space to beginning of removal list
                    }
                    if (zwsAfter && zwsAfter.nodeType === Node.TEXT_NODE && zwsAfter.textContent === '\u200B') {
                        nodesToRemove.push(zwsAfter); // Add ZWS to end of removal list
                    }
                    // Remove all identified nodes
                    nodesToRemove.forEach(node => parent.removeChild(node));
                    // Optional: Remove ref from map if it was a code/cell ref
                    const refId = widgetToDelete.dataset.refId;
                    if (refId && this.codeRefMap.has(refId)) {
                        this.codeRefMap.delete(refId);
                        console.log('Removed reference from map:', refId);
                    }
                    // Trigger input event manually after deletion
                    this.chatInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                }
            }
        };
        this.chatInput = chatInput;
        this.callbacks = callbacks;
        // this.uiManager = uiManager; // Removed unused assignment
        // Bind event listeners
        this.chatInput.addEventListener('keypress', this._handleKeyPress);
        this.chatInput.addEventListener('input', this._handleInput);
        this.chatInput.addEventListener('keydown', this._handleKeyDown);
        this.chatInput.addEventListener('click', this._handleClick); // ADDED Click Listener
        // Note: Actual markdown toggle and expand buttons are likely managed by UIManager,
        // which would then call methods like `setMarkdownMode` or `toggleExpansion` on this handler.
    }
    /**
     * Removes event listeners.
     */
    dispose() {
        this.chatInput.removeEventListener('keypress', this._handleKeyPress);
        this.chatInput.removeEventListener('input', this._handleInput);
        this.chatInput.removeEventListener('keydown', this._handleKeyDown);
        this.chatInput.removeEventListener('click', this._handleClick); // ADDED
    }
    /**
     * Appends text to the input field, potentially replacing a preceding '@' symbol.
     */
    appendToInput(text) {
        try {
            this.chatInput.focus(); // Ensure focus first
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) {
                console.error('Cannot append to input: No selection found.');
                // Fallback: append to end
                this.chatInput.textContent = (this.chatInput.textContent || '') + text;
                return;
            }
            const range = selection.getRangeAt(0);
            const { startContainer, startOffset } = range;
            let currentTextContent = this.chatInput.textContent || ''; // Use textContent
            let insertPos = (0, content_editable_utils_1.getCaretPosition)(this.chatInput); // Get linear position
            // Simple check: if the character before the linear caret position is '@'
            if (insertPos > 0 && currentTextContent[insertPos - 1] === '@') {
                // Replace the '@' - more complex with DOM manipulation,
                // For simplicity, we'll replace in textContent and reset
                const before = currentTextContent.slice(0, insertPos - 1);
                const after = currentTextContent.slice(insertPos);
                this.chatInput.textContent = before + text + after;
                // Set cursor position after the inserted text
                (0, content_editable_utils_1.setCaretPosition)(this.chatInput, (insertPos - 1) + text.length);
            }
            else {
                // Standard insertion - more complex with DOM manipulation
                // For simplicity, we'll insert in textContent and reset
                const before = currentTextContent.slice(0, insertPos);
                const after = currentTextContent.slice(insertPos);
                this.chatInput.textContent = before + text + after;
                // Set cursor position after the inserted text
                (0, content_editable_utils_1.setCaretPosition)(this.chatInput, insertPos + text.length);
            }
            // Trigger input event manually since we're changing textContent directly
            this.chatInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        }
        catch (error) {
            console.error('Error appending to input:', error);
        }
    }
    /**
     * Clears the input field and resets associated state after sending.
     */
    clearInput() {
        // Use textContent for div
        this.chatInput.textContent = '';
        // Directly reset internal state instead of relying on callback
        this.resetCodeReferences();
        // Remove rows manipulation
        // this.chatInput.rows = 1;
        this.chatInput.style.height = ''; // Reset height
        this.hasAtSymbol = false; // Reset @ state
        // Reset expand button state if it was expanded
        if (this.isInputExpanded) {
            this.toggleInputExpansion(false); // Collapse input
        }
        // Trigger input event manually after clearing
        this.chatInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    }
    /**
     * Sets the markdown mode state and updates the placeholder.
     */
    setMarkdownMode(isMarkdown) {
        this.isMarkdownMode = isMarkdown;
        this.callbacks.updatePlaceholder(this.isMarkdownMode);
        // Update placeholder directly (alternative to callback)
        // this.chatInput.placeholder = this.isMarkdownMode ? 
        //   'Write markdown here...' : 
        //   'Ask me anything...';
    }
    /**
     * Toggles the input expansion state and updates UI.
     */
    toggleInputExpansion(forceState) {
        this.isInputExpanded = forceState !== undefined ? forceState : !this.isInputExpanded;
        if (this.isInputExpanded) {
            // Use max-height or height for div
            this.chatInput.style.height = '200px'; // Example height
            // Allow vertical resizing if desired, or keep as 'none'
            this.chatInput.style.resize = 'vertical';
            this.chatInput.style.overflowY = 'auto'; // Ensure scrollbar appears if needed
        }
        else {
            this.chatInput.style.height = ''; // Reset height
            this.chatInput.style.resize = 'none';
            // Remove rows manipulation
            // this.chatInput.rows = 1; // Ensure it collapses back to 1 row height
            this.chatInput.style.overflowY = 'hidden'; // Hide scrollbar when collapsed
        }
        // Notify UIManager/LayoutBuilder to update button appearance
        this.callbacks.toggleInputExpansionUI(this.isInputExpanded);
    }
    // --- Code Reference Methods ---
    /**
     * Adds a code reference to the internal map and returns its ID.
     * @param codeContent The actual code content.
     * @param notebookName The name of the notebook the code is from.
     * @param cellIndex The index of the cell the code is from (0-based).
     * @param lineNumber The starting line number of the code within the cell (1-based).
     * @param lineEndNumber The ending line number of the code within the cell (1-based).
     * @returns The generated reference ID (e.g., "ref-1").
     */
    addCodeReference(codeContent, // Renamed parameter
    notebookName, cellIndex, lineNumber, // Start line
    lineEndNumber // End line
    ) {
        const refId = `ref-${this.nextRefId++}`;
        // Store type and use 'content' field
        const refData = {
            type: 'code',
            content: codeContent, // Use content field
            notebookName,
            cellIndex,
            lineNumber,
            lineEndNumber
        };
        this.codeRefMap.set(refId, refData);
        console.log('Added code reference:', refId, '->', `(${notebookName}, Cell ${cellIndex + 1}, Line ${lineNumber}${lineNumber !== lineEndNumber ? '_' + lineEndNumber : ''}) ` +
            codeContent.substring(0, 30) + '...' // Use codeContent
        );
        return refId;
    }
    /**
     * Returns the current map of code references.
     */
    getCodeReferenceMap() {
        return this.codeRefMap;
    }
    /**
     * Clears the code reference map and resets the ID counter.
     */
    resetCodeReferences() {
        // --- DEBUG LOG --- 
        console.log('[InputHandler] resetCodeReferences called!', new Error().stack); // Log call stack
        // --- END DEBUG LOG --- 
        this.codeRefMap.clear();
        this.nextRefId = 1;
        console.log('Code references reset.'); // Debug log
    }
    /**
     * Replaces code reference placeholders (e.g., "[ref-1]") in a message string
     * with the actual code from the map.
     * @param message The message string potentially containing placeholders.
     * @param isMarkdown Whether the message should be formatted for markdown
     * @returns The message string with placeholders resolved.
     */
    resolveCodeReferences(message, isMarkdown = false) {
        if (this.codeRefMap.size === 0) {
            return message; // No references to resolve
        }
        // Regex to find placeholders like [ref-1], [ref-12], etc.
        // Adjusted regex slightly to be non-greedy if needed, though current format is fine.
        const placeholderRegex = /@(?:code|Cell)\[(ref-\d+)\]|@code\((?:[^)]+)\)\[(ref-\d+)\]|\[(ref-\d+)\]/g;
        let resolvedMessage = message.replace(placeholderRegex, (match, refId1, refId2, refId3) => {
            const refId = refId1 || refId2 || refId3; // Get the captured refId
            if (!refId)
                return match; // If somehow no refId captured, return original match
            const refData = this.codeRefMap.get(refId);
            if (refData) {
                console.log(`Resolving ${refData.type} reference:`, refId); // Debug log type
                // Use refData.content (renamed from refData.code)
                // Add context based on type?
                let prefix, suffix;
                if (isMarkdown) {
                    // Format for markdown with code block
                    const lang = refData.type === 'code' ? 'python' : ''; // Default to python for code, blank for cell
                    prefix = refData.type === 'cell' ?
                        `\n\`\`\`${lang} # Cell ${refData.cellIndex + 1} (${refData.notebookName})\n` :
                        `\n\`\`\`${lang} # Code (${refData.notebookName}:Cell ${refData.cellIndex + 1}:L${refData.lineNumber}-${refData.lineEndNumber})\n`;
                    suffix = `\n\`\`\``;
                }
                else {
                    // Plain text format
                    prefix = refData.type === 'cell' ?
                        `\n--- Start Cell ${refData.cellIndex + 1} (${refData.notebookName}) ---\n` :
                        `\n--- Start Code (${refData.notebookName}:Cell ${refData.cellIndex + 1}:L${refData.lineNumber}-${refData.lineEndNumber}) ---\n`;
                    suffix = refData.type === 'cell' ?
                        `\n--- End Cell ${refData.cellIndex + 1} ---` :
                        `\n--- End Code ---`;
                }
                return `${prefix}${refData.content}${suffix}`;
            }
            else {
                console.warn('Could not find data for reference:', refId); // Warn if ref ID not found
                return match; // Keep the placeholder if not found
            }
        });
        return resolvedMessage;
    }
    // NEW method specifically for Ctrl+L shortcut
    handleInsertCodeReferenceFromShortcut(selectedText) {
        var _a, _b, _c;
        const currentNotebookWidget = (_a = globals_1.globals.notebookTracker) === null || _a === void 0 ? void 0 : _a.currentWidget;
        const activeCell = (_b = globals_1.globals.notebookTracker) === null || _b === void 0 ? void 0 : _b.activeCell;
        const editor = activeCell === null || activeCell === void 0 ? void 0 : activeCell.editor;
        const cmEditor = editor ? editor.editor : null; // CodeMirror view
        if (!currentNotebookWidget || !activeCell || !editor || !cmEditor || !cmEditor.state) {
            console.error('Cannot insert code reference: Missing notebook, cell, or editor context.');
            // Optionally show an indicator via callbacks?
            return;
        }
        try {
            // 1. Gather Context
            const notebookPath = currentNotebookWidget.context.path;
            const notebookName = ((_c = notebookPath.split('/').pop()) === null || _c === void 0 ? void 0 : _c.split('.')[0]) || 'notebook';
            const cellIndex = currentNotebookWidget.content.activeCellIndex;
            const state = cmEditor.state;
            const selection = state.selection.main;
            const startLine = state.doc.lineAt(selection.from).number; // 1-based
            const endLine = state.doc.lineAt(selection.to).number; // 1-based
            if (cellIndex === undefined || cellIndex === null) {
                console.error('Cannot insert code reference: Could not determine active cell index.');
                return;
            }
            // 2. Create Ref Data (but don't necessarily add to map yet? Or do?)
            // Let's add it now for consistency.
            const refData = {
                type: 'code',
                content: selectedText,
                notebookName,
                cellIndex,
                lineNumber: startLine,
                lineEndNumber: endLine
            };
            const refId = `ref-${this.nextRefId++}`;
            this.codeRefMap.set(refId, refData);
            console.log(`Added code reference via shortcut: ${refId}`);
            // ADDED: Construct placeholder
            const placeholder = `@code[${refId}]`;
            // 3. Insert RENDERED WIDGET Representation into Input Field
            this.chatInput.focus(); // Ensure focus
            const winSelection = window.getSelection();
            if (!winSelection || winSelection.rangeCount === 0) {
                console.error('Cannot insert reference widget: No window selection found.');
                // Fallback might be complex, maybe just log error for now
                return;
            }
            const range = winSelection.getRangeAt(0);
            // Render the widget - Pass placeholder
            const widgetElement = (0, message_renderer_1.renderReferenceWidgetInline)('code', refData, placeholder, refId);
            // Create a zero-width space text node for cursor positioning
            const zeroWidthSpace = document.createTextNode('\u200B');
            // Add a normal space for separation
            const spaceNode = document.createTextNode(' ');
            range.deleteContents(); // Clear any existing selection in the input field
            range.insertNode(spaceNode); // Insert space first
            range.insertNode(widgetElement); // Insert the widget element
            range.insertNode(zeroWidthSpace); // Insert ZWS after widget
            // Move cursor after the zero-width space (effectively after the widget + space)
            range.setStartAfter(zeroWidthSpace);
            range.setEndAfter(zeroWidthSpace);
            winSelection.removeAllRanges();
            winSelection.addRange(range);
            // --- End Insertion Logic ---
            // Trigger input event manually
            this.chatInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        }
        catch (error) {
            console.error('Error handling insert code reference from shortcut:', error);
        }
    }
    // NEW: Method to add a cell reference
    addCellReference(notebookName, cellIndex) {
        var _a;
        const notebookPanel = (_a = globals_1.globals.notebookTracker) === null || _a === void 0 ? void 0 : _a.currentWidget;
        if (!notebookPanel || !notebookPanel.content.model || !notebookPanel.content.model.cells) {
            console.error('Cannot add cell reference: Notebook or cells not found.');
            return null;
        }
        const model = notebookPanel.content.model;
        if (cellIndex < 0 || cellIndex >= model.cells.length) {
            console.error(`Cannot add cell reference: Invalid cell index ${cellIndex}`);
            return null;
        }
        const cell = model.cells.get(cellIndex);
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
                cellContent = source.join('\n'); // Corrected: Use actual newline
            }
        }
        const refId = `ref-${this.nextRefId++}`;
        const refData = {
            type: 'cell',
            content: cellContent,
            notebookName,
            cellIndex
            // lineNumber/lineEndNumber are omitted
        };
        this.codeRefMap.set(refId, refData);
        // Combine console.log into one line
        console.log(`Added cell reference: ${refId} -> (${notebookName}, Cell ${cellIndex + 1}) ${cellContent.substring(0, 30)}...`);
        return refId;
    }
    // NEW method specifically for Ctrl+L shortcut (Cell)
    handleInsertCellReferenceFromShortcut() {
        var _a, _b, _c;
        const currentNotebookWidget = (_a = globals_1.globals.notebookTracker) === null || _a === void 0 ? void 0 : _a.currentWidget;
        const activeCell = (_b = globals_1.globals.notebookTracker) === null || _b === void 0 ? void 0 : _b.activeCell;
        if (!currentNotebookWidget || !activeCell) {
            console.error('Cannot insert cell reference: Missing notebook or cell context.');
            return;
        }
        try {
            // 1. Gather Context
            const notebookPath = currentNotebookWidget.context.path;
            const notebookName = ((_c = notebookPath.split('/').pop()) === null || _c === void 0 ? void 0 : _c.split('.')[0]) || 'notebook';
            const cellIndex = currentNotebookWidget.content.activeCellIndex;
            if (cellIndex === undefined || cellIndex === null) {
                console.error('Cannot insert cell reference: Could not determine active cell index.');
                return;
            }
            // 2. Add Cell Reference to Map and get data
            const refId = this.addCellReference(notebookName, cellIndex);
            if (!refId) {
                console.error('Failed to add cell reference to map.');
                return; // Stop if we couldn't create the reference data
            }
            const refData = this.codeRefMap.get(refId);
            if (!refData) {
                console.error(`Failed to retrieve data for cell reference ${refId}.`);
                return;
            }
            // ADDED: Construct placeholder
            const placeholder = `@Cell[${cellIndex + 1}]`;
            // 3. Insert RENDERED WIDGET Representation into Input Field
            this.chatInput.focus(); // Ensure focus
            const winSelection = window.getSelection();
            if (!winSelection || winSelection.rangeCount === 0) {
                console.error('Cannot insert reference widget: No window selection found.');
                return;
            }
            const range = winSelection.getRangeAt(0);
            // Render the widget - Pass placeholder
            const widgetElement = (0, message_renderer_1.renderReferenceWidgetInline)('cell', refData, placeholder, refId);
            // Create a zero-width space text node for cursor positioning
            const zeroWidthSpace = document.createTextNode('\u200B');
            // Add a normal space for separation
            const spaceNode = document.createTextNode(' ');
            range.deleteContents(); // Clear any existing selection in the input field
            range.insertNode(spaceNode); // Insert space first
            range.insertNode(widgetElement); // Insert the widget element
            range.insertNode(zeroWidthSpace); // Insert ZWS after widget
            // Move cursor after the zero-width space
            range.setStartAfter(zeroWidthSpace);
            range.setEndAfter(zeroWidthSpace);
            winSelection.removeAllRanges();
            winSelection.addRange(range);
            // Trigger input event manually
            this.chatInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        }
        catch (error) {
            console.error('Error handling insert cell reference from shortcut:', error);
        }
    }
    // NEW method for inserting File widgets from Popup
    handleInsertFileWidget(filePath) {
        var _a;
        try {
            this.chatInput.focus(); // Ensure focus
            const winSelection = window.getSelection();
            if (!winSelection || winSelection.rangeCount === 0) {
                console.error('Cannot insert file widget: No window selection found.');
                return;
            }
            // Get the current selection range
            const range = winSelection.getRangeAt(0);
            // Construct placeholder
            const placeholder = `@file[${filePath}]`;
            // Render the widget - Pass placeholder (no refId needed)
            const widgetElement = (0, message_renderer_1.renderReferenceWidgetInline)('file', filePath, placeholder);
            // Create a zero-width space text node for cursor positioning
            const zeroWidthSpace = document.createTextNode('\u200B');
            // Add a normal space for separation
            const spaceNode = document.createTextNode(' ');
            // Check if the character before the cursor is '@' and replace it
            let replacedAtSymbol = false;
            if (range.startOffset > 0 && range.startContainer.nodeType === Node.TEXT_NODE) {
                const textBefore = (_a = range.startContainer.textContent) === null || _a === void 0 ? void 0 : _a.substring(0, range.startOffset);
                if (textBefore === null || textBefore === void 0 ? void 0 : textBefore.endsWith('@')) {
                    // Modify the range to include the '@'
                    range.setStart(range.startContainer, range.startOffset - 1);
                    replacedAtSymbol = true;
                    console.log("Replacing @ symbol before inserting file widget."); // Debug log
                }
            }
            // Wrap the widget and additional nodes in a fragment for cleaner insertion
            const fragment = document.createDocumentFragment();
            fragment.appendChild(widgetElement);
            fragment.appendChild(zeroWidthSpace);
            fragment.appendChild(spaceNode);
            // Delete any selected content (including @ if found)
            range.deleteContents();
            // Insert the fragment with all elements
            range.insertNode(fragment);
            // Explicitly move cursor after the inserted space node
            const newRange = document.createRange();
            newRange.setStartAfter(spaceNode);
            newRange.setEndAfter(spaceNode);
            winSelection.removeAllRanges();
            winSelection.addRange(newRange);
            // Trigger input event manually
            this.chatInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        }
        catch (error) {
            console.error('Error handling insert file widget:', error);
        }
    }
    // NEW method for inserting Directory widgets from Popup
    handleInsertDirWidget(dirPath) {
        var _a;
        try {
            this.chatInput.focus(); // Ensure focus
            const winSelection = window.getSelection();
            if (!winSelection || winSelection.rangeCount === 0) {
                console.error('Cannot insert directory widget: No window selection found.');
                return;
            }
            const range = winSelection.getRangeAt(0);
            // Construct placeholder
            const placeholder = `@dir[${dirPath}]`;
            // Render the widget - Pass placeholder (no refId needed)
            const widgetElement = (0, message_renderer_1.renderReferenceWidgetInline)('dir', dirPath, placeholder);
            // Create a zero-width space text node for cursor positioning
            const zeroWidthSpace = document.createTextNode('\u200B');
            // Add a normal space for separation
            const spaceNode = document.createTextNode(' ');
            // Check if the character before the cursor is '@' and replace it
            let replacedAtSymbol = false;
            if (range.startOffset > 0 && range.startContainer.nodeType === Node.TEXT_NODE) {
                const textBefore = (_a = range.startContainer.textContent) === null || _a === void 0 ? void 0 : _a.substring(0, range.startOffset);
                if (textBefore === null || textBefore === void 0 ? void 0 : textBefore.endsWith('@')) {
                    // Modify the range to include the '@'
                    range.setStart(range.startContainer, range.startOffset - 1);
                    replacedAtSymbol = true;
                    console.log("Replacing @ symbol before inserting dir widget."); // Debug log
                }
            }
            // Wrap the widget and additional nodes in a fragment for cleaner insertion
            const fragment = document.createDocumentFragment();
            fragment.appendChild(widgetElement);
            fragment.appendChild(zeroWidthSpace);
            fragment.appendChild(spaceNode);
            // Delete any selected content (including @ if found)
            range.deleteContents();
            // Insert the fragment with all elements
            range.insertNode(fragment);
            // Explicitly move cursor after the inserted space node
            const newRange = document.createRange();
            newRange.setStartAfter(spaceNode);
            newRange.setEndAfter(spaceNode);
            winSelection.removeAllRanges();
            winSelection.addRange(newRange);
            // Trigger input event manually
            this.chatInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        }
        catch (error) {
            console.error('Error handling insert directory widget:', error);
        }
    }
    // NEW method for inserting Cell widgets from Popup
    handleInsertCellWidgetFromPopup(cellIndex) {
        var _a, _b, _c;
        const currentNotebookWidget = (_a = globals_1.globals.notebookTracker) === null || _a === void 0 ? void 0 : _a.currentWidget;
        if (!currentNotebookWidget) {
            console.error('Cannot insert cell widget: Missing notebook context.');
            return;
        }
        try {
            // 1. Gather Context (Notebook Name)
            const notebookPath = currentNotebookWidget.context.path;
            const notebookName = ((_b = notebookPath.split('/').pop()) === null || _b === void 0 ? void 0 : _b.split('.')[0]) || 'notebook';
            // Provided cellIndex is 0-based already
            if (cellIndex === undefined || cellIndex === null || cellIndex < 0) {
                console.error(`Cannot insert cell widget: Invalid cell index ${cellIndex}.`);
                return;
            }
            // 2. Add Cell Reference to Map and get data
            const refId = this.addCellReference(notebookName, cellIndex);
            if (!refId) {
                console.error('Failed to add cell reference to map for index:', cellIndex);
                return; // Stop if we couldn't create the reference data
            }
            const refData = this.codeRefMap.get(refId);
            if (!refData) {
                console.error(`Failed to retrieve data for cell reference ${refId}.`);
                return;
            }
            // ADDED: Construct placeholder
            const placeholder = `@Cell[${cellIndex + 1}]`;
            // 3. Insert RENDERED WIDGET Representation into Input Field
            this.chatInput.focus(); // Ensure focus
            const winSelection = window.getSelection();
            if (!winSelection || winSelection.rangeCount === 0) {
                console.error('Cannot insert cell widget: No window selection found.');
                return;
            }
            const range = winSelection.getRangeAt(0);
            // Render the widget - Pass placeholder
            const widgetElement = (0, message_renderer_1.renderReferenceWidgetInline)('cell', refData, placeholder, refId);
            const zeroWidthSpace = document.createTextNode('\u200B');
            const spaceNode = document.createTextNode(' ');
            // Check if the character before the cursor is '@' and replace it
            let replacedAtSymbol = false;
            if (range.startOffset > 0 && range.startContainer.nodeType === Node.TEXT_NODE) {
                const textBefore = (_c = range.startContainer.textContent) === null || _c === void 0 ? void 0 : _c.substring(0, range.startOffset);
                if (textBefore === null || textBefore === void 0 ? void 0 : textBefore.endsWith('@')) {
                    range.setStart(range.startContainer, range.startOffset - 1);
                    replacedAtSymbol = true;
                    console.log("Replacing @ symbol before inserting cell widget.");
                }
            }
            // Create a fragment to hold our nodes in the correct order
            const fragment = document.createDocumentFragment();
            fragment.appendChild(widgetElement);
            fragment.appendChild(zeroWidthSpace);
            fragment.appendChild(spaceNode);
            // Delete any selected content (including @ if found)
            range.deleteContents();
            // Insert all elements at once in the correct order
            range.insertNode(fragment);
            // Move cursor after the zero-width space
            range.setStartAfter(spaceNode);
            range.setEndAfter(spaceNode);
            winSelection.removeAllRanges();
            winSelection.addRange(range);
            // Trigger input event manually
            this.chatInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        }
        catch (error) {
            console.error('Error handling insert cell widget from popup:', error);
        }
    }
    // NEW method for inserting Code widgets from Popup (via insertCollapsedCodeRef callback)
    handleInsertCodeWidgetFromPopup(codeContent, notebookName, cellIndex, lineNumber // Assumes start line = end line from popup callback
    ) {
        var _a;
        try {
            // 1. Create Ref Data (assume start=end line)
            const lineEndNumber = lineNumber;
            const refData = {
                type: 'code',
                content: codeContent,
                notebookName,
                cellIndex,
                lineNumber,
                lineEndNumber
            };
            const refId = `ref-${this.nextRefId++}`;
            this.codeRefMap.set(refId, refData);
            console.log(`Added code reference via popup: ${refId}`);
            // ADDED: Construct placeholder
            const placeholder = `@code[${refId}]`;
            // 2. Insert RENDERED WIDGET Representation into Input Field
            this.chatInput.focus(); // Ensure focus
            const winSelection = window.getSelection();
            if (!winSelection || winSelection.rangeCount === 0) {
                console.error('Cannot insert code widget: No window selection found.');
                return;
            }
            const range = winSelection.getRangeAt(0);
            // Render the widget - Pass placeholder
            const widgetElement = (0, message_renderer_1.renderReferenceWidgetInline)('code', refData, placeholder, refId);
            const zeroWidthSpace = document.createTextNode('\u200B');
            const spaceNode = document.createTextNode(' ');
            // Check if the character before the cursor is '@' and replace it
            let replacedAtSymbol = false;
            if (range.startOffset > 0 && range.startContainer.nodeType === Node.TEXT_NODE) {
                const textBefore = (_a = range.startContainer.textContent) === null || _a === void 0 ? void 0 : _a.substring(0, range.startOffset);
                if (textBefore === null || textBefore === void 0 ? void 0 : textBefore.endsWith('@')) {
                    range.setStart(range.startContainer, range.startOffset - 1);
                    replacedAtSymbol = true;
                    console.log("Replacing @ symbol before inserting code widget.");
                }
            }
            // Create a fragment to hold our nodes in the correct order
            const fragment = document.createDocumentFragment();
            fragment.appendChild(widgetElement);
            fragment.appendChild(zeroWidthSpace);
            fragment.appendChild(spaceNode);
            // Delete any selected content (including @ if found)
            range.deleteContents();
            // Insert all elements at once in the correct order
            range.insertNode(fragment);
            // Move cursor after the zero-width space
            range.setStartAfter(spaceNode);
            range.setEndAfter(spaceNode);
            winSelection.removeAllRanges();
            winSelection.addRange(range);
            // Trigger input event manually
            this.chatInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        }
        catch (error) {
            console.error('Error handling insert code widget from popup:', error);
        }
    }
    // NEW method to serialize input content, converting widgets back to placeholders
    _serializeInputContent() {
        let serialized = '';
        const nodes = this.chatInput.childNodes;
        nodes.forEach(node => {
            var _a;
            if (node.nodeType === Node.TEXT_NODE) {
                // Append text content directly
                serialized += node.textContent || '';
            }
            else if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node;
                // Check if it's our widget span
                if ((_a = element.classList) === null || _a === void 0 ? void 0 : _a.contains('jp-llm-ext-ref-widget')) {
                    // Append the stored placeholder text
                    const placeholder = element.dataset.placeholder;
                    if (placeholder) {
                        serialized += placeholder;
                    }
                    else {
                        // Fallback: append the visible text if placeholder is missing (shouldn't happen)
                        console.warn('Widget found without data-placeholder:', element);
                        serialized += element.textContent || '';
                    }
                }
                else if (element.tagName === 'BR') {
                    // Handle <br> as newline
                    serialized += '\n';
                }
                else if (element.tagName === 'DIV') {
                    // Handle <div> elements, potentially introduced by pasting or Shift+Enter
                    // Recursively serialize or just add newline?
                    // Add newline before and serialize inner content recursively?
                    // For now, let's treat div boundaries as potential newlines, similar to <br>
                    // We might need a more robust HTML -> text conversion later
                    serialized += '\n'; // Simplified handling
                }
                else {
                    // Append text content of other unknown elements?
                    serialized += element.textContent || '';
                }
            }
        });
        // Trim potentially leading/trailing whitespace introduced during serialization
        // or by the structure of the contenteditable div
        return serialized.trim();
    }
    showWidgetPreview(widgetElement, content) {
        // Remove existing preview first
        this.removeWidgetPreview();
        console.log('Showing preview for widget:', widgetElement);
        const firstThreeLines = content.split('\n').slice(0, 3).join('\n');
        const preview = document.createElement('div');
        preview.className = 'jp-llm-ext-widget-preview';
        // Basic styling (move to CSS later)
        preview.style.position = 'absolute';
        preview.style.border = '1px solid var(--jp-border-color1)';
        preview.style.background = 'var(--jp-layout-color0)';
        preview.style.padding = '5px';
        preview.style.fontSize = '0.9em';
        preview.style.maxWidth = '400px';
        preview.style.maxHeight = '100px';
        preview.style.overflow = 'hidden';
        preview.style.whiteSpace = 'pre-wrap'; // Preserve whitespace and newlines
        preview.style.fontFamily = 'monospace';
        preview.style.zIndex = '10000'; // Ensure it's on top
        preview.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        preview.textContent = firstThreeLines + (content.split('\n').length > 3 ? '\n...' : '');
        // Position near the widget
        const widgetRect = widgetElement.getBoundingClientRect();
        // Position above the widget for now
        preview.style.bottom = `${window.innerHeight - widgetRect.top + 5}px`;
        preview.style.left = `${widgetRect.left}px`;
        document.body.appendChild(preview); // Append to body to avoid layout issues
        this.activePreviewElement = preview;
    }
    removeWidgetPreview() {
        if (this.activePreviewElement) {
            console.log('Removing active preview');
            this.activePreviewElement.remove();
            this.activePreviewElement = null;
        }
    }
    /**
      // Handle @ symbol removal to hide popup using selection API
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;
  
      const range = selection.getRangeAt(0);
      // Check if the input field contains the start of the range
      if (!this.chatInput.contains(range.startContainer)) return;
  
      const cursorPosition = getCaretPosition(this.chatInput); // Use helper
      if (cursorPosition === null) return;
  
      const textContent = this.chatInput.textContent || '';
      const textBeforeCursor = textContent.slice(0, cursorPosition);
  
      // Check if the character immediately before the cursor is '@'
      // and if it's preceded by whitespace or is at the start of the input.
      const isAtSymbolContext = textBeforeCursor.endsWith('@') &&
                             (cursorPosition === 1 ||
                              cursorPosition > 1 && /\s/.test(textBeforeCursor[cursorPosition - 2]));
  
      if (this.hasAtSymbol && !isAtSymbolContext) {
        // @ symbol context was present but now it's gone, hide the popup
        this.callbacks.hidePopupMenu();
      }
      // Update the state *after* checking the previous state
      this.hasAtSymbol = isAtSymbolContext;
  
      // --- Auto-resize logic (optional) ---
      // Simple auto-resize based on scroll height (might need refinement)
      if (!this.isInputExpanded) { // Only auto-resize if not manually expanded
          this.chatInput.style.height = 'auto'; // Temporarily shrink to content
          const scrollHeight = this.chatInput.scrollHeight;
          // Set a max height to prevent infinite growth, e.g., 150px
          const maxHeight = 150;
          const newHeight = Math.min(scrollHeight, maxHeight);
           // Only update height if it actually changes to avoid flicker
          if (this.chatInput.offsetHeight < newHeight) {
               this.chatInput.style.height = `${newHeight}px`;
               this.chatInput.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
          } else if (scrollHeight <= this.chatInput.clientHeight) {
              // Shrink if content height is less than current height
              this.chatInput.style.height = `${scrollHeight}px`;
              this.chatInput.style.overflowY = 'hidden';
          }
      }
      // -----------------------------------
    };
    
    /**
     * Explicitly sets the hasAtSymbol flag. Called by shortcut handler.
     */
    setHasAtSymbol(value) {
        this.hasAtSymbol = value;
    }
    /**
     * Gets the current value of the hasAtSymbol flag. Called by shortcut handler.
     */
    getHasAtSymbol() {
        return this.hasAtSymbol;
    }
}
exports.InputHandler = InputHandler;
