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
const message_handler_1 = require("./handlers/message-handler");
const history_handler_1 = require("./handlers/history-handler");
const settings_handler_1 = require("./handlers/settings-handler");
const ui_manager_1 = require("./ui/ui-manager");
// --- Import Utility Functions ---
const clipboard_1 = require("./utils/clipboard");
const notebook_integration_1 = require("./utils/notebook-integration");
// Import the new UI helper
const code_ref_widget_1 = require("./ui/code-ref-widget");
/**
 * Main sidebar widget for the AI chat interface - Now acts as an orchestrator.
 */
class SimpleSidebarWidget extends widgets_1.Widget {
    constructor(docManager) {
        super();
        // Placeholder for menu callbacks
        this.menuActionCallbacks = {
            insertCode: (code) => this.inputHandler.appendToInput(`\n\`\`\`\n${code}\n\`\`\`\n`),
            insertCell: (content) => { },
            insertFilePath: (path) => this.inputHandler.appendToInput(` ${path}`),
            insertDirectoryPath: (path) => this.inputHandler.appendToInput(` ${path}`),
            getSelectedText: () => { /* TODO: Implement get selected text */ return null; },
            getCurrentCellContent: () => { /* TODO: Implement get current cell */ return null; },
            insertCellByIndex: (index) => { },
            insertCollapsedCodeRef: (code, cellIndex, lineNumber, notebookName) => {
                const refId = this.inputHandler.addCodeReference(code);
                this.inputHandler.appendToInput(` [${refId}:${notebookName} cell ${cellIndex + 1} line ${lineNumber}]`);
            }
        };
        // Placeholder for handler methods used in UIManager callbacks
        this.handleNewChat = () => {
            var _a;
            console.log('Handle New Chat clicked');
            const newChat = this.chatState.createNewChat();
            (_a = this.historyHandler) === null || _a === void 0 ? void 0 : _a.loadChat(newChat.id);
        };
        this.handleToggleHistory = () => {
            console.log('Handle Toggle History clicked');
            this.historyHandler.toggleHistoryView();
        };
        this.handleSendMessage = () => {
            console.log('Handle Send Message called from UI Manager callback');
            // Trigger the InputHandler's internal logic which then calls MessageHandler
            // This feels slightly redundant - maybe InputHandler should trigger send directly?
            // Or maybe this callback shouldn't exist and UIManager calls InputHandler directly?
            // For now, simulate Enter press logic:
            const inputElement = this.layoutElements.inputField; // Get from layoutElements
            const event = new KeyboardEvent('keypress', { key: 'Enter', bubbles: true });
            inputElement.dispatchEvent(event);
        };
        this.handleShowSettings = (event) => {
            console.log('Handle Show Settings clicked');
            this.settingsHandler.showModal();
        };
        this.handleShowPopupMenu = (event, targetButton) => {
            console.log('Handle Show Popup Menu clicked');
            // Calculate position relative to the button
            const rect = targetButton.getBoundingClientRect();
            // Position below the button
            this.popupMenuManager.showPopupMenu(rect.left, rect.bottom + 5);
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
        this.settingsState = new settings_state_1.SettingsState();
        const initialSettings = this.settingsState.getSettings();
        this.apiClient = new api_client_1.ApiClient((initialSettings === null || initialSettings === void 0 ? void 0 : initialSettings.apiUrl) || undefined);
        this.chatState = new chat_state_1.ChatState();
        this.popupMenuManager = new popup_menu_manager_1.PopupMenuManager(this.docManager, this.node, {
            insertCode: (code) => { var _a; return (_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.appendToInput(`@code ${code}`); },
            insertCell: (content) => { var _a; return (_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.appendToInput(`@cell ${content}`); },
            insertFilePath: (path) => { var _a; return (_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.appendToInput(`@file ${path}`); },
            insertDirectoryPath: (path) => { var _a; return (_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.appendToInput(`@directory ${path}`); },
            getSelectedText: notebook_integration_1.getSelectedText, // Use the imported utility function
            getCurrentCellContent: notebook_integration_1.getCurrentCellContent, // Use the imported utility function
            // Use the imported utility, providing the callback to append to the input handler
            insertCellByIndex: (index) => (0, notebook_integration_1.insertCellContentByIndex)(index, (content) => { var _a; return (_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.appendToInput(`@${content}`); }),
            // Implement the callback for collapsed code references
            insertCollapsedCodeRef: (code, cellIndex, lineNumber, notebookName) => {
                if (!this.inputHandler)
                    return; // Guard
                // 1. Add code to handler's map and get ID
                const refId = this.inputHandler.addCodeReference(code);
                // 2. Create the placeholder text
                const placeholder = (0, code_ref_widget_1.createCodeRefPlaceholder)(refId, notebookName, lineNumber);
                // 3. Append placeholder to input field
                this.inputHandler.appendToInput(placeholder);
            }
        });
        // --- 2. Define Callbacks (used by buildLayout and Handlers) ---
        // Callbacks for UI actions (passed to buildLayout)
        const createNewChatCallback = () => {
            var _a;
            const newChat = this.chatState.createNewChat();
            (_a = this.historyHandler) === null || _a === void 0 ? void 0 : _a.loadChat(newChat.id); // Call handler method
        };
        const toggleHistoryCallback = () => {
            var _a;
            (_a = this.historyHandler) === null || _a === void 0 ? void 0 : _a.toggleHistoryView(); // Call handler method
        };
        const showSettingsCallback = () => {
            var _a;
            (_a = this.settingsHandler) === null || _a === void 0 ? void 0 : _a.showModal(); // Call handler method
        };
        const updateTitleCallback = (newTitle) => {
            var _a;
            this.chatState.updateCurrentChatTitle(newTitle);
            (_a = this.uiManager) === null || _a === void 0 ? void 0 : _a.showNotification('Chat title updated', 'info');
        };
        const showPopupMenuCallback = (event) => {
            const rect = event.target.getBoundingClientRect();
            this.popupMenuManager.showPopupMenu(rect.left + 60, rect.top - 20); // Adjust positioning as needed
            event.preventDefault();
            event.stopPropagation();
        };
        const sendMessageViaButtonCallback = () => {
            var _a;
            (_a = this.messageHandler) === null || _a === void 0 ? void 0 : _a.handleSendMessage(this.layoutElements.inputField.value);
        };
        const toggleMarkdownModeCallback = (isMarkdown) => {
            var _a;
            (_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.setMarkdownMode(isMarkdown);
        };
        const toggleExpandInputCallback = (button) => {
            var _a;
            (_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.toggleInputExpansion();
            // Update button text/icon based on new state (InputHandler might do this via callback)
            // Example text update, UIManager callback handles the visual state
            // button.textContent = this.inputHandler?.isInputExpanded ? 'Collapse' : 'Expand'; 
        };
        // Callbacks for Message Rendering (passed to MessageHandler -> UIManager -> renderers)
        const messageRendererCallbacks = {
            // ... (showCopyFeedback, addMessageToCell, copyToClipboard, copyImageToClipboard, copyMessageToClipboard defined as before) ...
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
                    feedbackCb(); // Signal completion
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
        // Callbacks for Settings Modal (passed to createSettingsModalElement)
        const settingsModalCallbacks = {
            handleSave: () => { var _a; (_a = this.settingsHandler) === null || _a === void 0 ? void 0 : _a.saveSettings(); },
            handleCancel: () => { var _a; (_a = this.settingsHandler) === null || _a === void 0 ? void 0 : _a.hideModal(); }
        };
        // Callbacks for History Handler
        const historyHandlerCallbacks = {
            updateTitleInput: (title) => this.uiManager.updateTitleInput(title),
            clearMessageContainer: () => this.uiManager.clearMessageContainer(),
            addRenderedMessage: (messageElement) => this.uiManager.addChatMessageElement(messageElement)
        };
        // Callbacks for Input Handler
        // const inputHandlerCallbacks: InputHandlerCallbacks = { // Removed unused variable
        //    handleSendMessage: (message: string) => this.messageHandler?.handleSendMessage(message),
        //    showPopupMenu: (left: number, top: number) => this.popupMenuManager.showPopupMenu(left, top),
        //    hidePopupMenu: () => this.popupMenuManager.hidePopupMenu(),
        //    // Example implementations - refine as needed
        //    updatePlaceholder: (isMarkdown: boolean) => {
        //        this.layoutElements.inputField.placeholder = isMarkdown ? 'Enter markdown...' : 'Ask anything...';
        //    },
        //    toggleInputExpansionUI: (isExpanded: boolean) => {
        //        // Update expand button appearance
        //        this.layoutElements.expandButton.textContent = isExpanded ? 'Collapse' : 'Expand'; // Or use icons
        //        this.layoutElements.expandButton.title = isExpanded ? 'Collapse input' : 'Expand input';
        //    },
        //    // Connect code ref map callbacks to the InputHandler methods
        //    getCodeRefMap: () => this.inputHandler?.getCodeReferenceMap() || new Map<string, string>(),
        //    resetCodeRefMap: () => this.inputHandler?.resetCodeReferences()
        // };
        // Callbacks for Shortcut Handler
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
            // Pass the correctly named callbacks from LayoutCallbacks interface
            onNewChatClick: createNewChatCallback,
            onHistoryToggleClick: toggleHistoryCallback, // Corrected name
            onSettingsClick: showSettingsCallback,
            onTitleChange: updateTitleCallback,
            onAtButtonClick: showPopupMenuCallback, // Use the specific callback
            onSendMessageClick: sendMessageViaButtonCallback, // Connect send button
            onMarkdownToggleChange: toggleMarkdownModeCallback, // Connect markdown toggle
            onExpandToggleClick: toggleExpandInputCallback, // Connect expand button
            // onInputFieldKeyPress: ... // Can be handled internally by InputHandler
            // onInputFieldValueChange: ... // Can be handled internally by InputHandler
        });
        this.settingsModalContainer = (0, settings_modal_1.createSettingsModalElement)(settingsModalCallbacks);
        // --- Initialize State Managers ---
        this.chatState = new chat_state_1.ChatState();
        this.settingsState = new settings_state_1.SettingsState();
        // --- Initialize Core Components ---
        this.apiClient = new api_client_1.ApiClient();
        // this.messageRenderer = new MessageRenderer(messageRendererCallbacks); // Fixed: Constructor takes 0 args & member removed
        // --- Initialize UI Manager (needs dependencies) ---
        // Must be initialized *after* handlers that it might need callbacks from,
        // OR pass callbacks directly here.
        const uiManagerCallbacks = {
            handleNewChat: this.handleNewChat,
            handleToggleHistory: this.handleToggleHistory,
            handleSendMessage: this.handleSendMessage,
            handleShowSettings: this.handleShowSettings,
            handleShowPopupMenu: this.handleShowPopupMenu, // Now handled by PopupMenuManager
            handleUpdateTitle: this.handleUpdateTitle
        };
        // UIManager needs: docManager, popupMenuManager, widgetNode, callbacks, layoutElements
        this.popupMenuManager = new popup_menu_manager_1.PopupMenuManager(this.docManager, this.node, this.menuActionCallbacks); // Needs docManager, widgetNode, menuActionCallbacks
        this.uiManager = new ui_manager_1.UIManager(
        // this.docManager, // Removed: not in constructor signature
        this.popupMenuManager, 
        // this.node, // Removed: not in constructor signature
        uiManagerCallbacks, this.layoutElements);
        // --- Initialize Handlers (pass dependencies) ---
        this.messageHandler = new message_handler_1.MessageHandler(this.apiClient, this.chatState, this.uiManager, messageRendererCallbacks, // Pass the refined callbacks
        this.inputHandler // Pass the initialized input handler
        );
        // History Handler: Needs state, UI manager, its callbacks, render callbacks
        this.historyHandler = new history_handler_1.HistoryHandler(this.chatState, this.uiManager, historyHandlerCallbacks, // Pass the defined callbacks object
        messageRendererCallbacks // Pass the refined callbacks
        );
        // Settings Handler: Needs state, api client, modal container, UI manager
        this.settingsHandler = new settings_handler_1.SettingsHandler(this.settingsState, this.settingsModalContainer, // Corrected: Pass modal container
        this.uiManager // Corrected: Pass uiManager instance
        );
        // --- 5. Post-Initialization Setup ---
        // Setup Shortcuts (verify signature later in Step 7)
        (0, shortcut_handler_1.setupShortcuts)(this.inputHandler, this.popupMenuManager, shortcutCallbacks // Pass the correctly defined callbacks object
        );
        // Append main UI elements to the widget node
        this.node.appendChild(this.layoutElements.mainElement);
        this.node.appendChild(this.settingsModalContainer);
        // Initialize history view? Load initial/default chat?
        // this.historyHandler.initialize(); // Check if HistoryHandler needs an init method
        const initialChat = this.chatState.getCurrentChat() || this.chatState.createNewChat();
        this.historyHandler.loadChat(initialChat.id); // Load initial chat state into view
    }
    /**
     * Disposes all resources
     */
    dispose() {
        var _a, _b;
        if (this.isDisposed) {
            return;
        }
        // Remove global listeners
        (0, shortcut_handler_1.removeShortcuts)();
        // Call dispose on handlers/managers that have it
        (_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.dispose();
        (_b = this.popupMenuManager) === null || _b === void 0 ? void 0 : _b.dispose();
        // MessageHandler, HistoryHandler, SettingsHandler, UIManager do not have dispose methods
        super.dispose();
    }
} // End of SimpleSidebarWidget class
exports.SimpleSidebarWidget = SimpleSidebarWidget;
