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
// --- Import Utility Functions ---
const clipboard_1 = require("./utils/clipboard");
const notebook_integration_1 = require("./utils/notebook-integration");
const code_ref_widget_1 = require("./ui/code-ref-widget");
/**
 * Main sidebar widget for the AI chat interface - Now acts as an orchestrator.
 */
class SimpleSidebarWidget extends widgets_1.Widget {
    constructor(docManager) {
        super();
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
            // 1. Get the current text from the input field via UIManager or LayoutElements
            const text = this.layoutElements.inputField.value;
            if (!text.trim())
                return; // Don't send empty messages
            // 2. Get the markdown state from UIManager
            const isMarkdown = this.uiManager.getIsMarkdownMode();
            console.log(`[Widget] handleSendMessage: Text='${text}', Markdown=${isMarkdown}`); // Debug log
            // 3. Call the MessageHandler's send method with text and state
            this.messageHandler.handleSendMessage(text, isMarkdown);
            // NOTE: No need to dispatch event anymore. 
            // The input clearing is handled inside messageHandler.handleSendMessage now.
        };
        this.handleShowSettings = (event) => {
            console.log('Handle Show Settings clicked');
            this.settingsHandler.showModal();
        };
        this.handleShowPopupMenu = (event, targetButton) => {
            console.log('Handle Show Popup Menu clicked');
            const rect = targetButton.getBoundingClientRect();
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
            insertDirectoryPath: (path) => { var _a; return (_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.appendToInput(`@dir ${path}`); },
            getSelectedText: notebook_integration_1.getSelectedText,
            getCurrentCellContent: notebook_integration_1.getCurrentCellContent,
            insertCellByIndex: (index) => (0, notebook_integration_1.insertCellContentByIndex)(index, (content) => { var _a; return (_a = this.inputHandler) === null || _a === void 0 ? void 0 : _a.appendToInput(`@${content}`); }),
            insertCollapsedCodeRef: (code, cellIndex, lineNumber, notebookName) => {
                if (!this.inputHandler)
                    return;
                const refId = this.inputHandler.addCodeReference(code);
                const placeholder = (0, code_ref_widget_1.createCodeRefPlaceholder)(refId, notebookName, lineNumber);
                this.inputHandler.appendToInput(placeholder);
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
        const showSettingsCallback = () => {
            var _a;
            (_a = this.settingsHandler) === null || _a === void 0 ? void 0 : _a.showModal();
        };
        const updateTitleCallback = (newTitle) => {
            var _a;
            this.chatState.updateCurrentChatTitle(newTitle);
            (_a = this.uiManager) === null || _a === void 0 ? void 0 : _a.showNotification('Chat title updated', 'info');
        };
        const showPopupMenuCallback = (event) => {
            const rect = event.target.getBoundingClientRect();
            this.popupMenuManager.showPopupMenu(rect.left + 60, rect.top - 20);
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
        const inputHandlerCallbacks = {
            handleSendMessage: (message, isMarkdown) => {
                if (this.messageHandler) {
                    this.messageHandler.handleSendMessage(message, isMarkdown);
                }
                else {
                    console.error('MessageHandler not initialized when trying to send message from InputHandler');
                }
            },
            showPopupMenu: (left, top) => this.popupMenuManager.showPopupMenu(left, top),
            hidePopupMenu: () => this.popupMenuManager.hidePopupMenu(),
            updatePlaceholder: (isMarkdown) => {
                this.layoutElements.inputField.placeholder = isMarkdown ? 'Enter markdown...' : 'Ask anything...';
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
            onSettingsClick: showSettingsCallback,
            onTitleChange: updateTitleCallback,
            onAtButtonClick: showPopupMenuCallback,
            onSendMessageClick: sendMessageViaButtonCallback,
            onMarkdownToggleChange: toggleMarkdownModeCallback,
            onExpandToggleClick: toggleExpandInputCallback,
        });
        this.settingsModalContainer = (0, settings_modal_1.createSettingsModalElement)(settingsModalCallbacks);
        // --- Initialize State Managers ---
        this.chatState = new chat_state_1.ChatState();
        this.settingsState = new settings_state_1.SettingsState();
        // --- Initialize Core Components ---
        this.apiClient = new api_client_1.ApiClient();
        // --- Initialize UI Manager (needs dependencies) ---
        const uiManagerCallbacks = {
            handleNewChat: this.handleNewChat,
            handleToggleHistory: this.handleToggleHistory,
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
        this.settingsHandler = new settings_handler_1.SettingsHandler(this.settingsState, this.settingsModalContainer, this.uiManager);
        // --- 5. Final Setup (Attach event listeners, connect signals, etc.) ---
        const initialChatId = this.chatState.getCurrentChatId();
        if (initialChatId) {
            this.historyHandler.loadChat(initialChatId);
        }
        else {
            const newChat = this.chatState.createNewChat();
            this.historyHandler.loadChat(newChat.id);
        }
        (0, shortcut_handler_1.setupShortcuts)(this.inputHandler, this.popupMenuManager, shortcutCallbacks);
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
