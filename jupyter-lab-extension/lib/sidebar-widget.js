"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleSidebarWidget = void 0;
const widgets_1 = require("@lumino/widgets");
const icons_1 = require("./core/icons");
const api_client_1 = require("./core/api-client");
const popup_menu_manager_1 = require("./handlers/popup-menu-manager");
const shortcut_handler_1 = require("./handlers/shortcut-handler");
const layout_builder_1 = require("./ui/layout-builder");
const settings_modal_1 = require("./ui/settings-modal");
const chat_state_1 = require("./state/chat-state");
const settings_state_1 = require("./state/settings-state");
const input_handler_1 = require("./handlers/input-handler");
const message_handler_1 = require("./handlers/message-handler");
const history_handler_1 = require("./handlers/history-handler");
const settings_handler_1 = require("./handlers/settings-handler");
const ui_manager_1 = require("./ui/ui-manager");
const ui_components_1 = require("@jupyterlab/ui-components");
const globals_1 = require("./core/globals");
const note_state_1 = require("./state/note-state");
const note_handler_1 = require("./handlers/note-handler");
// --- Import Utility Functions ---
const clipboard_1 = require("./utils/clipboard");
const notebook_integration_1 = require("./utils/notebook-integration");
/**
 * Main sidebar widget for the AI chat interface - Now acts as an orchestrator.
 */
class SimpleSidebarWidget extends widgets_1.Widget {
    /**
     * Helper function to replace a text range with a non-editable widget span.
     */
    createWidgetSpan(range, refText) {
        if (!range)
            return;
        // Extract a display-friendly version (e.g., filename from path)
        let displayLabel = refText;
        if (refText.startsWith('@file ') || refText.startsWith('@dir ')) {
            const parts = refText.split(' ');
            if (parts.length > 1) {
                const pathParts = parts[1].split(/[\\/]/);
                displayLabel = pathParts[pathParts.length - 1] || parts[1]; // Use last part of path or full path
            }
        }
        else if (refText.startsWith('@Cell ')) {
            displayLabel = refText.substring(1); // Remove leading '@'
        } // Add more conditions for other types if needed
        // Create the widget span
        const span = document.createElement('span');
        span.className = 'jp-llm-ext-ref-widget'; // Class for styling
        span.setAttribute('contenteditable', 'false'); // Make it non-editable
        span.setAttribute('data-ref-text', refText); // Store original text for serialization
        span.textContent = displayLabel; // Set visible text
        // Replace the range content with the span
        range.deleteContents();
        range.insertNode(span);
        // Move cursor after the inserted span
        const selection = window.getSelection();
        if (selection) {
            const newRange = document.createRange();
            newRange.setStartAfter(span);
            newRange.setEndAfter(span);
            selection.removeAllRanges();
            selection.addRange(newRange);
        }
    }
    constructor(docManager) {
        super();
        // Placeholder for handler methods used in UIManager callbacks
        this.handleNewChat = async () => {
            var _a, _b;
            console.log('Handle New Chat clicked');
            try {
                // First, check if the API is healthy
                const isHealthy = await this.apiClient.healthCheck();
                console.log(`API health check result for new chat: ${isHealthy}`);
                let thread_id;
                // Try to create a backend thread if the API is healthy
                if (isHealthy) {
                    try {
                        thread_id = await this.apiClient.createThread();
                        console.log('Created new thread with ID:', thread_id);
                    }
                    catch (threadError) {
                        console.error('Error creating thread despite healthy API:', threadError);
                        // Generate a local thread ID as fallback
                        thread_id = `local-${Math.random().toString(36).substring(2, 15)}`;
                        console.log('Using local thread ID instead:', thread_id);
                        // Notify user in UI
                        this.uiManager.showNotification('Could not create thread on the backend. Using local thread instead.', 'info');
                    }
                }
                else {
                    // API is not healthy, use local thread ID
                    thread_id = `local-${Math.random().toString(36).substring(2, 15)}`;
                    console.log('API is not healthy, using local thread ID:', thread_id);
                    // Notify user in UI
                    this.uiManager.showNotification('Backend API is unavailable. Using local thread instead.', 'info');
                }
                // Create the chat with either the backend or local thread_id
                const newChat = this.chatState.createNewChat('New Chat', thread_id);
                (_a = this.historyHandler) === null || _a === void 0 ? void 0 : _a.loadChat(newChat.id);
            }
            catch (error) {
                console.error('Error in handleNewChat:', error);
                // Final fallback: create chat with a generated thread_id
                const fallbackThreadId = `local-${Math.random().toString(36).substring(2, 15)}`;
                console.log('Critical error in chat creation, using emergency fallback thread ID:', fallbackThreadId);
                const newChat = this.chatState.createNewChat('New Chat', fallbackThreadId);
                (_b = this.historyHandler) === null || _b === void 0 ? void 0 : _b.loadChat(newChat.id);
                // Show error notification
                this.uiManager.showNotification('Could not connect to backend service. Using local chat only.', 'error');
            }
        };
        this.handleToggleHistory = () => {
            console.log('Handle Toggle History clicked');
            this.historyHandler.toggleHistoryView();
        };
        this.handleToggleNotes = () => {
            console.log('Handle Toggle Notes clicked');
            this.noteHandler.toggleNotesView();
        };
        this.handleSendMessage = (message, isMarkdown = false) => {
            // 1. Get the current text from the input field via UIManager or LayoutElements
            // const text = this.layoutElements.inputField.value; // No longer needed, text is passed in
            if (!message.trim())
                return; // Don't send empty messages (check the passed message)
            console.log(`[Widget] handleSendMessage: Text='${message}', Markdown=${isMarkdown}`); // Debug log using passed message
            // 3. Call the MessageHandler's send method with text and state
            this.messageHandler.handleSendMessage(message, isMarkdown); // Pass the received message and markdown state
            // NOTE: Input clearing is now handled by UIManager after this callback returns.
            // Do NOT clear input here or in MessageHandler.
        };
        this.handleShowSettings = (event) => {
            console.log('Handle Show Settings clicked');
            this.settingsHandler.showModal();
        };
        this.handleShowPopupMenu = (event, targetButton) => {
            console.log('Handle Show Popup Menu clicked');
            const rect = targetButton.getBoundingClientRect();
            this.popupMenuManager.showPopupMenu({ x: rect.left, y: rect.bottom + 5 });
        };
        this.handleUpdateTitle = () => {
            var _a;
            const newTitle = ((_a = this.layoutElements.titleInput) === null || _a === void 0 ? void 0 : _a.value) || 'Chat';
            console.log('Handle Update Title called:', newTitle);
            this.chatState.updateCurrentChatTitle(newTitle);
        };
        this.docManager = docManager;
        this.id = 'simple-sidebar';
        this.title.label = '';
        this.title.caption = 'AI Chat Interface';
        this.title.icon = icons_1.extensionIcon;
        this.title.closable = true;
        this.addClass('jp-llm-ext-sidebar');
        // --- 1. Initialize Core Components & State ---
        this.apiClient = new api_client_1.ApiClient();
        this.settingsState = settings_state_1.SettingsManager.getInstance(this.apiClient);
        const initialSettings = this.settingsState.getSettings();
        // Update the API client with the correct URL from settings
        if (initialSettings === null || initialSettings === void 0 ? void 0 : initialSettings.apiUrl) {
            console.log(`Using API URL from settings: ${initialSettings.apiUrl}`);
            this.apiClient = new api_client_1.ApiClient(initialSettings.apiUrl);
            // Re-initialize settings manager with updated API client
            this.settingsState = settings_state_1.SettingsManager.getInstance(this.apiClient);
        }
        else {
            console.log(`Using default API URL: http://localhost:8000`);
        }
        // Check API health on startup
        this.apiClient.healthCheck().then(isHealthy => {
            console.log(`API health check on initialization: ${isHealthy ? 'healthy' : 'not healthy'}`);
        }).catch(error => {
            console.error('Error during initial API health check:', error);
        });
        this.chatState = new chat_state_1.ChatState(this.apiClient);
        this.noteState = new note_state_1.NoteState();
        this.popupMenuManager = new popup_menu_manager_1.PopupMenuManager(this.docManager, this.node, {
            insertCode: (code) => {
                var _a, _b, _c;
                if (!this.inputHandler || !globals_1.globals.notebookTracker)
                    return;
                const currentNotebookPanel = globals_1.globals.notebookTracker.currentWidget;
                if (!currentNotebookPanel || !currentNotebookPanel.context || !currentNotebookPanel.content) {
                    console.warn('Could not get notebook context for code reference, inserting raw code as fallback.');
                    (_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.appendToInput(code);
                    return;
                }
                const notebookPath = currentNotebookPanel.context.path;
                const notebookName = ((_b = notebookPath.split('/').pop()) === null || _b === void 0 ? void 0 : _b.split('.')[0]) || 'notebook';
                const currentCell = currentNotebookPanel.content.activeCell;
                if (!currentCell) {
                    console.warn('Could not get active cell for code reference, inserting raw code as fallback.');
                    (_c = this.inputHandler) === null || _c === void 0 ? void 0 : _c.appendToInput(code);
                    return;
                }
                const cellIndex = currentNotebookPanel.content.activeCellIndex;
                let lineNumber = 1; // Default line number
                let lineEndNumber = 1; // Default end line number
                // --- DEBUG LOG --- 
                console.log('Are we currently in a code cell?');
                // check if currentCell is in editor 
                console.log(currentCell.editor);
                // --- END DEBUG LOG ---
                if (currentCell.editor) {
                    const editor = currentCell.editor;
                    const cmEditor = editor.editor; // Access CodeMirror editor instance (EditorView)
                    if (cmEditor && cmEditor.state) {
                        const state = cmEditor.state;
                        const selection = state.selection.main;
                        if (!selection.empty) {
                            lineNumber = state.doc.lineAt(selection.from).number; // 1-based start line
                            lineEndNumber = state.doc.lineAt(selection.to).number; // 1-based end line
                        }
                        else {
                            // Fallback for cursor position if no selection
                            const cursor = editor.getCursorPosition();
                            if (cursor) {
                                lineNumber = cursor.line + 1; // 1-based line number
                                lineEndNumber = lineNumber; // Start and end are the same for cursor
                            }
                        }
                    }
                    else {
                        // Fallback if cmEditor or state is not available (should not happen often)
                        console.warn('Could not access CodeMirror state for line numbers.');
                        const cursor = editor.getCursorPosition();
                        if (cursor) {
                            lineNumber = cursor.line + 1;
                            lineEndNumber = lineNumber;
                        }
                    }
                }
                else {
                    console.warn('Could not access cell editor for line numbers.');
                    // Keep default line numbers 1, 1 if editor is not available
                }
                // --- DEBUG LOG --- 
                console.log(`[SimpleSidebarWidget.insertCode] Determined lines: Start=${lineNumber}, End=${lineEndNumber}`);
                // --- END DEBUG LOG ---
                // Pass both start and end line numbers
                const refId = this.inputHandler.addCodeReference(code, notebookName, cellIndex, lineNumber, lineEndNumber);
                const placeholder = `@code[${refId}]`;
                this.inputHandler.appendToInput(placeholder);
            },
            insertCell: (content) => { var _a; return (_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.appendToInput(`@cell ${content}`); },
            handleInsertFileWidget: (path) => { var _a; return (_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.handleInsertFileWidget(path); },
            handleInsertDirWidget: (path) => { var _a; return (_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.handleInsertDirWidget(path); },
            getSelectedText: notebook_integration_1.getSelectedText,
            getCurrentCellContent: notebook_integration_1.getCurrentCellContent,
            insertCellByIndex: (index) => {
                var _a;
                (_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.handleInsertCellWidgetFromPopup(index);
            },
            // TODO: insertCollapsedCodeRef should later be merged with insertCode
            // as we only expect one kind of behavior from the input handler.
            // this change will also involve ui changes
            insertCollapsedCodeRef: (code, cellIndex, lineNumber, notebookName) => {
                if (!this.inputHandler)
                    return;
                this.inputHandler.handleInsertCodeWidgetFromPopup(code, notebookName, cellIndex, lineNumber);
            }
        });
        // --- 2. Define Callbacks (used by buildLayout and Handlers) ---
        // Callbacks for UI actions (passed to buildLayout)
        const createNewChatCallback = () => {
            var _a;
            const newChat = this.chatState.createNewChat();
            (_a = this.historyHandler) === null || _a === void 0 ? void 0 : _a.loadChat(newChat.id);
        };
        const toggleHistoryCallback = () => {
            var _a;
            (_a = this.historyHandler) === null || _a === void 0 ? void 0 : _a.toggleHistoryView();
        };
        const toggleNotesCallback = () => {
            this.noteHandler.toggleNotesView();
        };
        const showSettingsCallback = () => {
            var _a;
            (_a = this.settingsHandler) === null || _a === void 0 ? void 0 : _a.showModal();
        };
        const showPopupMenuCallback = (event) => {
            const rect = event.target.getBoundingClientRect();
            this.popupMenuManager.showPopupMenu({ x: rect.left + 60, y: rect.top - 20 });
            event.preventDefault();
            event.stopPropagation();
        };
        const sendMessageViaButtonCallback = () => {
            const inputElement = this.layoutElements.inputField;
            const event = new KeyboardEvent('keypress', { key: 'Enter', bubbles: true });
            inputElement.dispatchEvent(event);
        };
        const toggleMarkdownModeCallback = (isMarkdown) => {
            var _a;
            (_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.setMarkdownMode(isMarkdown);
        };
        const toggleExpandInputCallback = (button) => {
            var _a;
            (_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.toggleInputExpansion();
        };
        // Callbacks for Message Rendering (passed to MessageHandler -> UIManager -> renderers)
        const messageRendererCallbacks = {
            showCopyFeedback: (button, success = true) => {
                const originalHTML = button.innerHTML;
                button.innerHTML = success ? 'Copied!' : 'Failed!';
                button.disabled = true;
                setTimeout(() => {
                    button.innerHTML = originalHTML;
                    button.disabled = false;
                }, 1000);
            },
            addMessageToCell: notebook_integration_1.addMessageToCell,
            copyToClipboard: (text, feedbackCb) => {
                navigator.clipboard.writeText(text).then(() => feedbackCb === null || feedbackCb === void 0 ? void 0 : feedbackCb()).catch(err => {
                    console.error('Failed to copy text: ', err);
                    feedbackCb === null || feedbackCb === void 0 ? void 0 : feedbackCb();
                });
            },
            copyImageToClipboard: (imageUrl, feedbackCb) => {
                (0, clipboard_1.copyImageToClipboard)(imageUrl, (success) => {
                    feedbackCb === null || feedbackCb === void 0 ? void 0 : feedbackCb();
                });
            },
            copyMessageToClipboard: (text, feedbackCb) => {
                (0, clipboard_1.copyMessageToClipboard)(text, (success) => {
                    feedbackCb();
                });
            },
            handleConfirmInterrupt: () => {
                var _a;
                (_a = this.messageHandler) === null || _a === void 0 ? void 0 : _a.handleSendAutoMessage('confirmed');
            },
            handleRejectInterrupt: () => {
                var _a;
                (_a = this.messageHandler) === null || _a === void 0 ? void 0 : _a.handleSendAutoMessage('rejected');
            }
        };
        const settingsModalCallbacks = {
            handleSave: () => { var _a; (_a = this.settingsHandler) === null || _a === void 0 ? void 0 : _a.saveSettings(); },
            handleCancel: () => { var _a; (_a = this.settingsHandler) === null || _a === void 0 ? void 0 : _a.hideModal(); }
        };
        const historyHandlerCallbacks = {
            updateTitleInput: (title) => this.uiManager.updateTitleInput(title),
            clearMessageContainer: () => this.uiManager.clearMessageContainer(),
            addRenderedMessage: (messageElement) => this.uiManager.addChatMessageElement(messageElement)
        };
        const noteHandlerCallbacks = {
            updateTitleInput: (title) => this.uiManager.updateTitleInput(title)
        };
        const inputHandlerCallbacks = {
            handleSendMessage: (message, isMarkdown) => {
                if (this.messageHandler) {
                    this.messageHandler.handleSendMessage(message, isMarkdown);
                }
                else {
                    console.error('MessageHandler not initialized when trying to send message from InputHandler');
                }
            },
            showPopupMenu: (left, top) => this.popupMenuManager.showPopupMenu({ x: left, y: top }),
            hidePopupMenu: () => this.popupMenuManager.hidePopupMenu(),
            updatePlaceholder: (isMarkdown) => {
                // Use dataset for data-placeholder attribute
                this.layoutElements.inputField.dataset.placeholder = isMarkdown ? 'Enter markdown...' : 'Ask anything...';
            },
            toggleInputExpansionUI: (isExpanded) => {
                const button = this.layoutElements.expandButton;
                // Clear existing content (text or old icon)
                while (button.firstChild) {
                    button.removeChild(button.firstChild);
                }
                // Add the appropriate icon using LabIcon.resolve
                const icon = isExpanded
                    ? ui_components_1.LabIcon.resolve({ icon: 'ui-components:caret-up' })
                    : ui_components_1.LabIcon.resolve({ icon: 'ui-components:caret-down' });
                icon.element({ container: button, tag: 'span' }); // Add icon to button
                // Update title for accessibility
                button.title = isExpanded ? 'Collapse input' : 'Expand input';
            },
            getCodeRefMap: () => { var _a; return ((_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.getCodeReferenceMap()) || new Map(); },
            resetCodeRefMap: () => { var _a; return (_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.resetCodeReferences(); }
        };
        const shortcutCallbacks = {
            showIndicator: (text) => { var _a; return (_a = this.uiManager) === null || _a === void 0 ? void 0 : _a.showIndicator(text); },
            appendToInput: (text) => { var _a; return (_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.appendToInput(text); },
            showWidget: () => { if (this.isHidden) {
                this.show();
            } },
            focusInput: () => { var _a, _b; return (_b = (_a = this.layoutElements) === null || _a === void 0 ? void 0 : _a.inputField) === null || _b === void 0 ? void 0 : _b.focus(); }
        };
        // --- 3. Build UI Layout ---
        this.layoutElements = (0, layout_builder_1.buildLayout)({
            onNewChatClick: createNewChatCallback,
            onHistoryToggleClick: toggleHistoryCallback,
            onNotesClick: toggleNotesCallback,
            onSettingsClick: showSettingsCallback,
            onTitleChange: this.handleUpdateTitle,
            onAtButtonClick: showPopupMenuCallback,
            onSendMessageClick: sendMessageViaButtonCallback,
            onMarkdownToggleChange: toggleMarkdownModeCallback,
            onExpandToggleClick: toggleExpandInputCallback,
        });
        this.settingsModalContainer = (0, settings_modal_1.createSettingsModalElement)(settingsModalCallbacks);
        // --- Initialize UI Manager (needs dependencies) ---
        const uiManagerCallbacks = {
            handleNewChat: this.handleNewChat,
            handleToggleHistory: this.handleToggleHistory,
            handleToggleNotes: this.handleToggleNotes,
            handleSendMessage: this.handleSendMessage,
            handleShowSettings: this.handleShowSettings,
            handleShowPopupMenu: this.handleShowPopupMenu,
            handleUpdateTitle: this.handleUpdateTitle
        };
        this.uiManager = new ui_manager_1.UIManager(this.popupMenuManager, uiManagerCallbacks, this.layoutElements);
        // --- 4. Initialize Handlers (using UI elements and core components) ---
        this.inputHandler = new input_handler_1.InputHandler(this.layoutElements.inputField, inputHandlerCallbacks);
        this.messageHandler = new message_handler_1.MessageHandler(this.apiClient, this.chatState, this.uiManager, messageRendererCallbacks, this.inputHandler);
        this.historyHandler = new history_handler_1.HistoryHandler(this.chatState, this.uiManager, historyHandlerCallbacks, messageRendererCallbacks);
        this.noteHandler = new note_handler_1.NoteHandler(this.noteState, this.uiManager, noteHandlerCallbacks, this.node);
        // Replace the layout's notes container with the one from NoteHandler
        const noteContainer = this.noteHandler.getContainer();
        const layoutNoteContainer = this.layoutElements.notesContainer;
        const parent = layoutNoteContainer.parentNode;
        if (parent) {
            parent.replaceChild(noteContainer, layoutNoteContainer);
            // Update the reference in layoutElements
            this.layoutElements.notesContainer = noteContainer;
        }
        this.settingsHandler = new settings_handler_1.SettingsHandler(this.settingsState, this.settingsModalContainer, this.uiManager, this.apiClient);
        // --- 5. Final Setup (Attach event listeners, connect signals, etc.) ---
        const initialChatId = this.chatState.getCurrentChatId();
        if (initialChatId) {
            this.historyHandler.loadChat(initialChatId);
        }
        else {
            const newChat = this.chatState.createNewChat();
            this.historyHandler.loadChat(newChat.id);
        }
        // Setup global keyboard shortcuts with the UIManager for proper @ key handling
        (0, shortcut_handler_1.setupShortcuts)(this.inputHandler, this.popupMenuManager, shortcutCallbacks);
        // Listen for API client updates
        window.addEventListener('api-client-updated', ((event) => {
            // Update the API client reference in this widget
            const newApiClient = event.detail.apiClient;
            if (newApiClient) {
                this.apiClient = newApiClient;
                // Update references in components that use the API client
                this.messageHandler = new message_handler_1.MessageHandler(this.apiClient, this.chatState, this.uiManager, messageRendererCallbacks, this.inputHandler);
                // Recreate the ChatState with the new API client to ensure thread_id creation works
                // Only if there are no existing chats
                if (this.chatState.getChatHistory().length === 0) {
                    this.chatState = new chat_state_1.ChatState(this.apiClient);
                }
                console.log('SimpleSidebarWidget: API client updated');
            }
        }));
        this.node.appendChild(this.layoutElements.mainElement);
        this.node.appendChild(this.settingsModalContainer);
    }
    /**
     * Disposes all resources
     */
    dispose() {
        var _a, _b;
        if (this.isDisposed) {
            return;
        }
        (0, shortcut_handler_1.removeShortcuts)();
        (_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.dispose();
        (_b = this.popupMenuManager) === null || _b === void 0 ? void 0 : _b.dispose();
        super.dispose();
    }
} // End of SimpleSidebarWidget class
exports.SimpleSidebarWidget = SimpleSidebarWidget;
