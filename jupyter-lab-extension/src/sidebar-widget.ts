import { Widget } from '@lumino/widgets';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { extensionIcon } from './core/icons';
import { ApiClient } from './core/api-client';
import { PopupMenuManager } from './handlers/popup-menu-manager';
import { setupShortcuts, removeShortcuts, ShortcutHandlerCallbacks } from './handlers/shortcut-handler';
import { buildLayout, LayoutElements } from './ui/layout-builder';
import { createSettingsModalElement, SettingsModalCallbacks } from './ui/settings-modal';
import { MessageRendererCallbacks } from './ui/message-renderer';
import { ChatState } from './state/chat-state';
import { SettingsState } from './state/settings-state';
import { InputHandler, InputHandlerCallbacks } from './handlers/input-handler';
import { MessageHandler } from './handlers/message-handler';
import { HistoryHandler, HistoryHandlerCallbacks } from './handlers/history-handler';
import { SettingsHandler } from './handlers/settings-handler';
import { UIManager, UIManagerCallbacks } from './ui/ui-manager';
import { LabIcon } from '@jupyterlab/ui-components';

// --- Import Utility Functions ---
import {
    copyImageToClipboard as utilCopyImageToClipboard,
    copyMessageToClipboard as utilCopyMessageToClipboard
} from './utils/clipboard';
import {
    addMessageToCell,
    getSelectedText,
    getCurrentCellContent,
    insertCellContentByIndex
} from './utils/notebook-integration';
import { createCodeRefPlaceholder } from './ui/code-ref-widget'; 

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
  private uiManager!: UIManager;

  // Dependencies (JupyterLab services)
  private docManager: IDocumentManager;

  // Placeholder for handler methods used in UIManager callbacks
  private handleNewChat = () => { 
      console.log('Handle New Chat clicked');
      const newChat = this.chatState.createNewChat();
      this.historyHandler?.loadChat(newChat.id);
  };
  private handleToggleHistory = () => { 
      console.log('Handle Toggle History clicked');
      this.historyHandler.toggleHistoryView(); 
  };
  private handleSendMessage = () => {
    // 1. Get the current text from the input field via UIManager or LayoutElements
    const text = this.layoutElements.inputField.value; 
    if (!text.trim()) return; // Don't send empty messages

    // 2. Get the markdown state from UIManager
    const isMarkdown = this.uiManager.getIsMarkdownMode(); 

    console.log(`[Widget] handleSendMessage: Text='${text}', Markdown=${isMarkdown}`); // Debug log

    // 3. Call the MessageHandler's send method with text and state
    this.messageHandler.handleSendMessage(text, isMarkdown); 

    // NOTE: No need to dispatch event anymore. 
    // The input clearing is handled inside messageHandler.handleSendMessage now.
  };
  private handleShowSettings = (event: MouseEvent) => { 
      console.log('Handle Show Settings clicked');
      this.settingsHandler.showModal(); 
  };
  private handleShowPopupMenu = (event: MouseEvent, targetButton: HTMLElement) => { 
      console.log('Handle Show Popup Menu clicked');
      const rect = targetButton.getBoundingClientRect();
      this.popupMenuManager.showPopupMenu(rect.left, rect.bottom + 5);
  };
  private handleUpdateTitle = () => {
      const newTitle = this.layoutElements.titleInput?.value || 'Chat';
      console.log('Handle Update Title called:', newTitle);
      this.chatState.updateCurrentChatTitle(newTitle);
  };

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
        insertCode: (code: string) => this.inputHandler?.appendToInput(`@code ${code}`),
        insertCell: (content: string) => this.inputHandler?.appendToInput(`@cell ${content}`),
        insertFilePath: (path: string) => this.inputHandler?.appendToInput(`@file ${path}`),
        insertDirectoryPath: (path: string) => this.inputHandler?.appendToInput(`@dir ${path}`),
        getSelectedText: getSelectedText,
        getCurrentCellContent: getCurrentCellContent,
        insertCellByIndex: (index: number) => insertCellContentByIndex(index, (content: string) => this.inputHandler?.appendToInput(`@${content}`)),
        insertCollapsedCodeRef: (code: string, cellIndex: number, lineNumber: number, notebookName: string) => {
            if (!this.inputHandler) return;
            const refId = this.inputHandler.addCodeReference(code);
            const placeholder = createCodeRefPlaceholder(refId, notebookName, lineNumber);
            this.inputHandler.appendToInput(placeholder);
        }
    });

    // --- 2. Define Callbacks (used by buildLayout and Handlers) ---

    // Callbacks for UI actions (passed to buildLayout)
    const createNewChatCallback = () => {
        const newChat = this.chatState.createNewChat();
        this.historyHandler?.loadChat(newChat.id);
    };
    const toggleHistoryCallback = () => {
        this.historyHandler?.toggleHistoryView();
    };
    const showSettingsCallback = () => {
        this.settingsHandler?.showModal();
    };
    const updateTitleCallback = (newTitle: string) => {
        this.chatState.updateCurrentChatTitle(newTitle);
        this.uiManager?.showNotification('Chat title updated', 'info');
    };
    const showPopupMenuCallback = (event: MouseEvent) => {
         const rect = (event.target as HTMLElement).getBoundingClientRect();
         this.popupMenuManager.showPopupMenu(rect.left + 60, rect.top - 20);
         event.preventDefault();
         event.stopPropagation();
    };
    const sendMessageViaButtonCallback = () => {
        const inputElement = this.layoutElements.inputField; 
        const event = new KeyboardEvent('keypress', { key: 'Enter', bubbles: true });
        inputElement.dispatchEvent(event); 
    };
     const toggleMarkdownModeCallback = (isMarkdown: boolean) => {
        this.inputHandler?.setMarkdownMode(isMarkdown);
     };
     const toggleExpandInputCallback = (button: HTMLButtonElement) => {
        this.inputHandler?.toggleInputExpansion();
     };

    // Callbacks for Message Rendering (passed to MessageHandler -> UIManager -> renderers)
    const messageRendererCallbacks: MessageRendererCallbacks = {
         showCopyFeedback: (button: HTMLButtonElement, success: boolean = true) => {
            const originalHTML = button.innerHTML;
            button.innerHTML = success ? 'Copied!' : 'Failed!';
            button.disabled = true;
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.disabled = false;
            }, 1000);
        },
        addMessageToCell: addMessageToCell,
        copyToClipboard: (text: string, feedbackCb?: () => void) => {
             navigator.clipboard.writeText(text).then(() => feedbackCb?.()).catch(err => {
                 console.error('Failed to copy text: ', err);
                 feedbackCb?.();
             });
        },
        copyImageToClipboard: (imageUrl: string, feedbackCb?: () => void) => {
             utilCopyImageToClipboard(imageUrl, (success) => {
                 feedbackCb?.();
             });
        },
        copyMessageToClipboard: (text: string, feedbackCb: () => void) => {
            utilCopyMessageToClipboard(text, (success) => {
                 feedbackCb();
            });
        },
         handleConfirmInterrupt: () => {
            this.messageHandler?.handleSendAutoMessage('confirmed');
         },
         handleRejectInterrupt: () => {
            this.messageHandler?.handleSendAutoMessage('rejected');
         }
     };

     const settingsModalCallbacks: SettingsModalCallbacks = {
       handleSave: () => { this.settingsHandler?.saveSettings(); },
       handleCancel: () => { this.settingsHandler?.hideModal(); }
     };

     const historyHandlerCallbacks: HistoryHandlerCallbacks = {
        updateTitleInput: (title: string) => this.uiManager.updateTitleInput(title),
        clearMessageContainer: () => this.uiManager.clearMessageContainer(),
        addRenderedMessage: (messageElement: HTMLElement) => this.uiManager.addChatMessageElement(messageElement)
     };

     const inputHandlerCallbacks: InputHandlerCallbacks = {
        handleSendMessage: (message: string, isMarkdown: boolean) => {
          if (this.messageHandler) {
            this.messageHandler.handleSendMessage(message, isMarkdown);
          } else {
            console.error('MessageHandler not initialized when trying to send message from InputHandler');
          }
        },
        showPopupMenu: (left: number, top: number) => this.popupMenuManager.showPopupMenu(left, top),
        hidePopupMenu: () => this.popupMenuManager.hidePopupMenu(),
        updatePlaceholder: (isMarkdown: boolean) => {
            this.layoutElements.inputField.placeholder = isMarkdown ? 'Enter markdown...' : 'Ask anything...';
        },
        toggleInputExpansionUI: (isExpanded: boolean) => {
            const button = this.layoutElements.expandButton;
            // Clear existing content (text or old icon)
            while (button.firstChild) {
              button.removeChild(button.firstChild);
            }
            // Add the appropriate icon using LabIcon.resolve
            const icon = isExpanded 
                ? LabIcon.resolve({ icon: 'ui-components:caret-up' }) 
                : LabIcon.resolve({ icon: 'ui-components:caret-down' });
            icon.element({ container: button, tag: 'span'}); // Add icon to button
            // Update title for accessibility
            button.title = isExpanded ? 'Collapse input' : 'Expand input';
        },
        getCodeRefMap: () => this.inputHandler?.getCodeReferenceMap() || new Map<string, string>(),
        resetCodeRefMap: () => this.inputHandler?.resetCodeReferences()
      };

     const shortcutCallbacks: ShortcutHandlerCallbacks = {
        showIndicator: (text: string) => this.uiManager?.showIndicator(text),
        appendToInput: (text: string) => this.inputHandler?.appendToInput(text),
        showWidget: () => { if (this.isHidden) { this.show(); } },
        focusInput: () => this.layoutElements?.inputField?.focus()
     };

    // --- 3. Build UI Layout ---
    this.layoutElements = buildLayout({
        onNewChatClick: createNewChatCallback,
        onHistoryToggleClick: toggleHistoryCallback,
        onSettingsClick: showSettingsCallback,
        onTitleChange: updateTitleCallback,
        onAtButtonClick: showPopupMenuCallback,
        onSendMessageClick: sendMessageViaButtonCallback,
        onMarkdownToggleChange: toggleMarkdownModeCallback,
        onExpandToggleClick: toggleExpandInputCallback,
    });
    this.settingsModalContainer = createSettingsModalElement(settingsModalCallbacks);

    // --- Initialize State Managers ---
    this.chatState = new ChatState();
    this.settingsState = new SettingsState();

    // --- Initialize Core Components ---
    this.apiClient = new ApiClient();

    // --- Initialize UI Manager (needs dependencies) ---
    const uiManagerCallbacks: UIManagerCallbacks = {
        handleNewChat: this.handleNewChat,
        handleToggleHistory: this.handleToggleHistory,
        handleSendMessage: this.handleSendMessage,
        handleShowSettings: this.handleShowSettings,
        handleShowPopupMenu: this.handleShowPopupMenu,
        handleUpdateTitle: this.handleUpdateTitle
    };
    this.uiManager = new UIManager(
        this.popupMenuManager, 
        uiManagerCallbacks, 
        this.layoutElements
    );

    // --- 4. Initialize Handlers (using UI elements and core components) ---

    this.inputHandler = new InputHandler(
      this.layoutElements.inputField,
      inputHandlerCallbacks 
    );

    this.messageHandler = new MessageHandler(
      this.apiClient,
      this.chatState,
      this.uiManager, 
      messageRendererCallbacks,
      this.inputHandler
    ); 

    this.historyHandler = new HistoryHandler(
        this.chatState,
        this.uiManager,
        historyHandlerCallbacks,
        messageRendererCallbacks
    );

    this.settingsHandler = new SettingsHandler(
        this.settingsState,
        this.settingsModalContainer,
        this.uiManager
    );

    // --- 5. Final Setup (Attach event listeners, connect signals, etc.) ---

    const initialChatId = this.chatState.getCurrentChatId();
    if (initialChatId) {
        this.historyHandler.loadChat(initialChatId);
    } else {
        const newChat = this.chatState.createNewChat();
        this.historyHandler.loadChat(newChat.id);
    }

    setupShortcuts(this.inputHandler, this.popupMenuManager, shortcutCallbacks);

    this.node.appendChild(this.layoutElements.mainElement);
    this.node.appendChild(this.settingsModalContainer);
  }

  /**
   * Disposes all resources
   */
  public dispose(): void {
    if (this.isDisposed) {
      return;
    }
    removeShortcuts(); 

    this.inputHandler?.dispose();
    this.popupMenuManager?.dispose();

    super.dispose();
  }

} // End of SimpleSidebarWidget class