"use strict";
// import { PopupMenuManager, MenuActionCallbacks } from './popup-menu-manager'; // Removed unused import
// import { UIManager } from '../ui/ui-manager'; // Removed unused import
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputHandler = void 0;
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
        // -----------------------------
        // --- Private Event Handlers ---
        this._handleKeyPress = (event) => {
            // Handle Enter key (send message)
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                const rawMessage = this.chatInput.value.trim();
                if (rawMessage) {
                    // Resolve code references BEFORE sending
                    const resolvedMessage = this.resolveCodeReferences(rawMessage);
                    console.log('Sending resolved message:', resolvedMessage); // Debug log
                    this.callbacks.handleSendMessage(resolvedMessage);
                    // Clearing is handled separately (e.g., by MessageHandler calling clearInput)
                }
            }
            // Note: '@' key handling might be better in handleKeyDown if needed globally,
            // but keeping here for now as it relates directly to input field focus.
            // Or handled by shortcut-handler listening globally. Let's assume shortcut-handler handles it.
        };
        this._handleInput = () => {
            // Handle @ symbol removal to hide popup
            const cursorPosition = this.chatInput.selectionStart;
            if (cursorPosition === null)
                return; // Type guard
            const textBeforeCursor = this.chatInput.value.slice(0, cursorPosition);
            // Check if the character immediately before the cursor is '@'
            // and if it's preceded by whitespace or is at the start of the input.
            const isAtSymbolContext = textBeforeCursor.endsWith('@') &&
                (cursorPosition === 1 ||
                    /\s/.test(textBeforeCursor[cursorPosition - 2]));
            if (this.hasAtSymbol && !isAtSymbolContext) {
                // @ symbol context was present but now it's gone, hide the popup
                this.callbacks.hidePopupMenu();
            }
            // Update the state *after* checking the previous state
            this.hasAtSymbol = isAtSymbolContext;
        };
        this.chatInput = chatInput;
        this.callbacks = callbacks;
        // this.uiManager = uiManager; // Removed unused assignment
        // Bind event listeners
        this.chatInput.addEventListener('keypress', this._handleKeyPress);
        this.chatInput.addEventListener('input', this._handleInput);
        // Note: Actual markdown toggle and expand buttons are likely managed by UIManager,
        // which would then call methods like `setMarkdownMode` or `toggleExpansion` on this handler.
    }
    /**
     * Removes event listeners.
     */
    dispose() {
        this.chatInput.removeEventListener('keypress', this._handleKeyPress);
        this.chatInput.removeEventListener('input', this._handleInput);
    }
    /**
     * Appends text to the input field with proper spacing and focus.
     */
    appendToInput(text) {
        try {
            const currentValue = this.chatInput.value;
            // Get current cursor position
            const start = this.chatInput.selectionStart;
            const end = this.chatInput.selectionEnd;
            // Insert text at cursor position
            this.chatInput.value = currentValue.slice(0, start) + text + currentValue.slice(end);
            // Move cursor to end of inserted text
            const newCursorPos = start + text.length;
            this.chatInput.focus();
            this.chatInput.setSelectionRange(newCursorPos, newCursorPos);
        }
        catch (error) {
            console.error('Error appending to input:', error);
        }
    }
    /**
     * Clears the input field and resets associated state after sending.
     */
    clearInput() {
        this.chatInput.value = '';
        // Directly reset internal state instead of relying on callback
        this.resetCodeReferences();
        this.chatInput.rows = 1;
        this.chatInput.style.height = ''; // Reset height
        this.hasAtSymbol = false; // Reset @ state
        // Reset expand button state if it was expanded
        if (this.isInputExpanded) {
            this.toggleInputExpansion(false); // Collapse input
        }
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
            this.chatInput.style.height = '200px'; // Example height
            this.chatInput.style.resize = 'vertical';
        }
        else {
            this.chatInput.style.height = ''; // Reset height
            this.chatInput.style.resize = 'none';
            this.chatInput.rows = 1; // Ensure it collapses back to 1 row height
        }
        // Notify UIManager/LayoutBuilder to update button appearance
        this.callbacks.toggleInputExpansionUI(this.isInputExpanded);
    }
    // --- Code Reference Methods ---
    /**
     * Adds a code reference to the internal map and returns its ID.
     * @param code The actual code content.
     * @returns The generated reference ID (e.g., "ref-1").
     */
    addCodeReference(code) {
        const refId = `ref-${this.nextRefId++}`;
        this.codeRefMap.set(refId, code);
        console.log('Added code reference:', refId, '->', code.substring(0, 50) + '...'); // Debug log
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
        this.codeRefMap.clear();
        this.nextRefId = 1;
        console.log('Code references reset.'); // Debug log
    }
    /**
     * Replaces code reference placeholders (e.g., "[ref-1]") in a message string
     * with the actual code from the map.
     * @param message The message string potentially containing placeholders.
     * @returns The message string with placeholders resolved.
     */
    resolveCodeReferences(message) {
        if (this.codeRefMap.size === 0) {
            return message; // No references to resolve
        }
        // Regex to find placeholders like [ref-1], [ref-12], etc.
        const placeholderRegex = /\[(ref-\d+)\]/g;
        let resolvedMessage = message.replace(placeholderRegex, (match, refId) => {
            const code = this.codeRefMap.get(refId);
            if (code !== undefined) {
                console.log('Resolving code reference:', refId); // Debug log
                // Add context around the replaced code
                return `\n\`\`\`\n${code}\n\`\`\`\n`;
            }
            else {
                console.warn('Could not find code for reference:', refId); // Warn if ref ID not found
                return match; // Keep the placeholder if not found
            }
        });
        return resolvedMessage;
    }
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
