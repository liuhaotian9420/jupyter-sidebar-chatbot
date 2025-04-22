import { Widget } from '@lumino/widgets';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { extensionIcon } from './core/icons';
import { ApiClient } from './core/api-client';
import { PopupMenuManager } from './handlers/popup-menu-manager';
import { setupShortcuts, removeShortcuts } from './handlers/shortcut-handler';
import { buildLayout, LayoutElements } from './ui/layout-builder';
import { createSettingsModalElement, SettingsModalCallbacks } from './ui/settings-modal';
import {
  renderUserMessage,
  renderBotMessage,
  MessageRendererCallbacks
} from './ui/message-renderer';
import { ChatState, ChatHistoryItem, ChatMessage } from './state/chat-state';
import { SettingsState, AppSettings } from './state/settings-state';
import { InputHandler } from './handlers/input-handler';
import { MessageHandler } from './handlers/message-handler';
import { HistoryHandler } from './handlers/history-handler';
import { SettingsHandler } from './handlers/settings-handler';

/**
 * Main sidebar widget for the AI chat interface - Now acts as an orchestrator.
 */
export class SimpleSidebarWidget extends Widget {
  // --- NEW Properties: Handlers, State Managers, UI Elements ---
  private apiClient: ApiClient;
  private chatState: ChatState;
  private settingsState: SettingsState;
  private popupMenuManager: PopupMenuManager;
  private inputHandler!: InputHandler;
  private messageHandler!: MessageHandler;
  private historyHandler!: HistoryHandler;
  private settingsHandler!: SettingsHandler;
  private layoutElements!: LayoutElements;
  private settingsModalContainer!: HTMLDivElement;

  // Dependencies (JupyterLab services)
  private docManager: IDocumentManager;
  private keyboardShortcutIndicator: HTMLDivElement;

  constructor(docManager: IDocumentManager) {
    super();
    this.docManager = docManager;
    this.id = 'simple-sidebar';
    this.title.label = '';
    this.title.caption = 'AI Chat Interface';
    this.title.icon = extensionIcon;
    this.title.closable = true;
    this.addClass('jp-llm-ext-sidebar');

    // --- 1. Initialize Core Components & State ---
    this.settingsState = new SettingsState();
    const initialSettings = this.settingsState.getSettings();
    this.apiClient = new ApiClient(initialSettings?.apiUrl || undefined);
    this.chatState = new ChatState();
    this.popupMenuManager = new PopupMenuManager(this.docManager, this.node, {
        // TODO: Verify actual callback names in PopupMenuManager and connect to InputHandler/Utils
        insertCode: (code: string) => this.inputHandler?.appendToInput(`@code ${code}`),
        insertCell: (content: string) => this.inputHandler?.appendToInput(`@cell ${content}`),
        insertFilePath: (path: string) => this.inputHandler?.appendToInput(`@file ${path}`),
        insertDirectoryPath: (path: string) => this.inputHandler?.appendToInput(`@directory ${path}`), // Added missing callback
        getSelectedText: () => { /* TODO: Call notebook-integration util */ return ''; },
        getCurrentCellContent: () => { /* TODO: Call notebook-integration util */ return ''; },
        insertCellByIndex: (index: number) => { /* TODO: Call notebook-integration util */ },
        insertCollapsedCodeRef: (code: string, cellIndex: number, lineNumber: number, notebookName: string) => {
            /* TODO: Delegate to InputHandler or code-ref-widget util */
        }
    });

    // --- 2. Define Callbacks to Connect Components ---
    const sendMessageCallback = (message: string /* removed: , isMarkdown: boolean */) => {
        this.messageHandler.handleSendMessage(message); // Assuming signature is (message: string)
    };
    const sendAutoMessageCallback = (message: string) => {
        this.messageHandler.handleSendAutoMessage(message);
    };
    const toggleHistoryCallback = () => {
        this.historyHandler.toggleHistoryView();
    };
    const loadChatCallback = (chatId: string) => {
        this.historyHandler.loadChat(chatId);
    };
    const createNewChatCallback = () => {
        const newChat = this.chatState.createNewChat();
        this.historyHandler.loadChat(newChat.id); // Assume loadChat handles switching view
    };
    const updateTitleCallback = (newTitle: string) => {
        this.chatState.updateCurrentChatTitle(newTitle);
        // TODO: Verify SettingsHandler method for notifications and signature
        // this.settingsHandler?.showNotification('Chat title updated');
    };
    const showSettingsCallback = () => {
        // TODO: Verify SettingsHandler method name
        // this.settingsHandler.showModal();
    };
    const messageRendererCallbacks: MessageRendererCallbacks = {
        showCopyFeedback: (button: HTMLButtonElement) => { /* TODO: Implement via util */ },
        addMessageToCell: (content: string) => { /* TODO: Call notebook-integration util */ },
        copyToClipboard: (text: string, feedbackCb: () => void) => { /* TODO: Call clipboard util */ },
        copyImageToClipboard: (imageUrl: string, feedbackCb: () => void) => { /* TODO: Call clipboard util */ },
        copyMessageToClipboard: (text: string, feedbackCb: () => void) => { /* TODO: Call clipboard util */ },
        handleConfirmInterrupt: () => {
            // TODO: Call public method on MessageHandler if addMessage is private
            // this.messageHandler.addMessage('confirmed', 'user', false);
            this.messageHandler.handleSendAutoMessage('confirmed');
        },
        handleRejectInterrupt: () => {
            // TODO: Call public method on MessageHandler if addMessage is private
            // this.messageHandler.addMessage('rejected', 'user', false);
            this.messageHandler.handleSendAutoMessage('rejected');
        }
    };
    const settingsModalCallbacks: SettingsModalCallbacks = {
      // TODO: Verify expected signature for createSettingsModalElement
      // handleSave: (settings: AppSettings) => this.settingsHandler.saveSettings(settings),
      handleSave: () => { /* TODO: call appropriate settingsHandler method */ },
      // TODO: Verify hide method on SettingsHandler
      // handleCancel: () => this.settingsHandler.hideSettingsModal()
      handleCancel: () => { /* TODO: call appropriate settingsHandler method */ }
    };
    const shortcutCallbacks: any = { // Using any until ShortcutCallbacks type is resolved
        showIndicator: (text: string) => this.showKeyboardShortcutIndicator(text),
        appendToInput: (text: string) => this.inputHandler?.appendToInput(text),
        focusInput: () => this.layoutElements?.inputField?.focus(),
        showSidebar: () => { if (this.isHidden) { this.show(); } },
        showPopupMenu: (x: number, y: number) => this.popupMenuManager.showPopupMenu(x, y)
    };

    // --- 3. Build UI Layout ---
    this.layoutElements = buildLayout({
        // TODO: Verify expected callbacks for buildLayout
        // handleNewChat: createNewChatCallback,
        handleToggleHistory: toggleHistoryCallback,
        handleShowSettings: showSettingsCallback,
        handleShowPopupMenu: (event: MouseEvent, targetButton: HTMLElement) => {
            const rect = targetButton.getBoundingClientRect();
            this.popupMenuManager.showPopupMenu(rect.left + 60, rect.top - 20);
            event.preventDefault();
            event.stopPropagation();
            this.showKeyboardShortcutIndicator('Browse cells, code, files, and more');
        },
        handleUpdateTitle: () => {
            const newTitle = this.layoutElements.titleInput.value;
            updateTitleCallback(newTitle);
        }
    });
    this.settingsModalContainer = createSettingsModalElement(settingsModalCallbacks);

    // --- 4. Initialize Handlers (Inject Dependencies) ---
    // TODO: Verify constructor signatures for all handlers
    const messageHandlerDeps: any = {
        apiClient: this.apiClient,
        chatState: this.chatState,
        messageContainer: this.layoutElements.messageContainer,
        renderers: { renderUserMessage, renderBotMessage },
        callbacks: messageRendererCallbacks,
        scrollToBottom: () => this.layoutElements.messageContainer.scrollTop = this.layoutElements.messageContainer.scrollHeight
    };
    // this.messageHandler = new MessageHandler(messageHandlerDeps);
    this.messageHandler = new MessageHandler(
        this.apiClient,
        this.chatState,
        this.layoutElements.messageContainer,
        { renderUserMessage, renderBotMessage },
        messageRendererCallbacks
        // Add other required args based on actual constructor
    );

    const historyHandlerDeps: any = {
        chatState: this.chatState,
        layoutElements: this.layoutElements,
        loadChatCallback: loadChatCallback,
    };
    // this.historyHandler = new HistoryHandler(historyHandlerDeps);
    this.historyHandler = new HistoryHandler(
        this.chatState,
        this.layoutElements,
        loadChatCallback
        // Add other required args based on actual constructor
    );

    // this.inputHandler = new InputHandler({
    //     inputElement: this.layoutElements.inputField,
    //     popupMenuManager: this.popupMenuManager,
    //     sendMessageCallback: sendMessageCallback,
    //     docManager: this.docManager
    // });
    this.inputHandler = new InputHandler(
        this.layoutElements.inputField,
        this.popupMenuManager,
        {
            sendMessage: sendMessageCallback,
            // Add other required callbacks
        }
        // Add docManager if needed
    );

    const settingsHandlerDeps: any = {
        settingsState: this.settingsState,
        apiClient: this.apiClient,
        settingsModalContainer: this.settingsModalContainer,
        widgetNode: this.node,
        initialSettings: initialSettings
    };
    // this.settingsHandler = new SettingsHandler(settingsHandlerDeps);
    this.settingsHandler = new SettingsHandler(
        this.settingsState,
        this.apiClient,
        this.settingsModalContainer,
        this.node
        // Pass initial settings if required by constructor
    );

    // TODO: Verify setupShortcuts signature
    setupShortcuts(
        // this.layoutElements.inputField,
        this.inputHandler, // Pass InputHandler instance? Check signature
        this.popupMenuManager,
        shortcutCallbacks
    );

    // --- 5. Initial UI State Setup ---
    // TODO: Verify LayoutElements properties
    // this.node.appendChild(this.layoutElements.contentWrapper);
    this.node.appendChild(this.settingsModalContainer);

    // TODO: Verify HistoryHandler initialization method
    // this.historyHandler.initialize();

    // Setup indicator
    this.keyboardShortcutIndicator = document.createElement('div');
    this.keyboardShortcutIndicator.className = 'jp-llm-ext-keyboard-shortcut-indicator';
    this.node.appendChild(this.keyboardShortcutIndicator);
  }

  /**
   * Shows a visual indicator for keyboard shortcuts
   * TODO: This logic might move to a dedicated UI service or ShortcutHandler
   */
  private showKeyboardShortcutIndicator(text: string): void {
    this.keyboardShortcutIndicator.textContent = text;
    this.keyboardShortcutIndicator.classList.add('visible');
    setTimeout(() => {
      this.keyboardShortcutIndicator.classList.remove('visible');
    }, 1000);
  }

  /**
   * Disposes all resources
   */
  public dispose(): void {
    if (this.isDisposed) {
      return;
    }
    removeShortcuts();

    // TODO: Verify dispose methods on handlers
    // this.inputHandler?.dispose();
    // this.messageHandler?.dispose();
    // this.historyHandler?.dispose();
    // this.settingsHandler?.dispose();
    this.popupMenuManager?.dispose();

    this.keyboardShortcutIndicator?.remove();

    super.dispose();
  }

} // End of SimpleSidebarWidget class