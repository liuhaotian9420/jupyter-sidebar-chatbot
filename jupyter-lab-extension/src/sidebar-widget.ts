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
import { SettingsManager } from './state/settings-state';
import { InputHandler, InputHandlerCallbacks, CodeRefData } from './handlers/input-handler';
import { MessageHandler } from './handlers/message-handler';
import { HistoryHandler, HistoryHandlerCallbacks } from './handlers/history-handler';
import { SettingsHandler } from './handlers/settings-handler';
import { UIManager, UIManagerCallbacks } from './ui/ui-manager';
import { LabIcon } from '@jupyterlab/ui-components';
import { globals } from './core/globals';
import { NoteState } from './state/note-state';
import { NoteHandler, NoteHandlerCallbacks } from './handlers/note-handler';

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
 * Main sidebar widget for the chatbot interface - Acts as an orchestrator for the sidebar chatbot.
 */
export class ChatbotSidebarWidget extends Widget {
  // --- NEW Properties: Handlers, State Managers, UI Elements ---
  private apiClient: ApiClient;
  private chatState: ChatState;
  private settingsState: SettingsManager;
  private noteState: NoteState;
  private popupMenuManager: PopupMenuManager;
  private inputHandler!: InputHandler;
  private messageHandler!: MessageHandler;
  private historyHandler!: HistoryHandler;
  private noteHandler!: NoteHandler;
  private settingsHandler!: SettingsHandler;
  private layoutElements!: LayoutElements;
  private settingsModalContainer!: HTMLDivElement;
  private uiManager!: UIManager;

  // Dependencies (JupyterLab services)
  private docManager: IDocumentManager;

  // Placeholder for handler methods used in UIManager callbacks
  private handleNewChat = async () => { 
      console.log('Handle New Chat clicked');
      try {
          // First, check if the API is healthy
          const isHealthy = await this.apiClient.healthCheck();
          console.log(`API health check result for new chat: ${isHealthy}`);
          
          let thread_id: string;
          // Try to create a backend thread if the API is healthy
          if (isHealthy) {
              try {
                  thread_id = await this.apiClient.createThread();
                  console.log('Created new thread with ID:', thread_id);
              } catch (threadError) {
                  console.error('Error creating thread despite healthy API:', threadError);
                  // Generate a local thread ID as fallback
                  thread_id = `local-${Math.random().toString(36).substring(2, 15)}`;
                  console.log('Using local thread ID instead:', thread_id);
                  // Notify user in UI
                  this.uiManager.showNotification('Could not create thread on the backend. Using local thread instead.', 'info');
              }
          } else {
              // API is not healthy, use local thread ID
              thread_id = `local-${Math.random().toString(36).substring(2, 15)}`;
              console.log('API is not healthy, using local thread ID:', thread_id);
              // Notify user in UI
              this.uiManager.showNotification('Backend API is unavailable. Using local thread instead.', 'info');
          }
          
          // Create the chat with either the backend or local thread_id
          const newChat = this.chatState.createNewChat('New Chat', thread_id);
          this.historyHandler?.loadChat(newChat.id);
      } catch (error) {
          console.error('Error in handleNewChat:', error);
          // Final fallback: create chat with a generated thread_id
          const fallbackThreadId = `local-${Math.random().toString(36).substring(2, 15)}`;
          console.log('Critical error in chat creation, using emergency fallback thread ID:', fallbackThreadId);
          const newChat = this.chatState.createNewChat('New Chat', fallbackThreadId);
          this.historyHandler?.loadChat(newChat.id);
          
          // Show error notification
          this.uiManager.showNotification('Could not connect to backend service. Using local chat only.', 'error');
      }
  };
  private handleToggleHistory = () => { 
      console.log('Handle Toggle History clicked');
      this.historyHandler.toggleHistoryView(); 
  };
  private handleToggleNotes = () => {
      console.log('Handle Toggle Notes clicked');
      this.noteHandler.toggleNotesView();
  };
  private handleSendMessage = (message: string, isMarkdown: boolean = false) => {
    // 1. Get the current text from the input field via UIManager or LayoutElements
    // const text = this.layoutElements.inputField.value; // No longer needed, text is passed in
    if (!message.trim()) return; // Don't send empty messages (check the passed message)

    console.log(`[Widget] handleSendMessage: Text='${message}', Markdown=${isMarkdown}`); // Debug log using passed message

    // 3. Call the MessageHandler's send method with text and state
    this.messageHandler.handleSendMessage(message, isMarkdown); // Pass the received message and markdown state

    // NOTE: Input clearing is now handled by UIManager after this callback returns.
    // Do NOT clear input here or in MessageHandler.
  };
  private handleShowSettings = (event: MouseEvent) => { 
      console.log('Handle Show Settings clicked');
      this.settingsHandler.showModal(); 
  };
  private handleShowPopupMenu = (event: MouseEvent, targetButton: HTMLElement) => { 
      console.log('Handle Show Popup Menu clicked');
      const rect = targetButton.getBoundingClientRect();
      this.popupMenuManager.showPopupMenu({x: rect.left, y: rect.bottom + 5});
  };
  private handleUpdateTitle = () => {
      const newTitle = this.layoutElements.titleInput?.value || 'Chat';
      console.log('Handle Update Title called:', newTitle);
      this.chatState.updateCurrentChatTitle(newTitle);
  };

  /**
   * Helper function to replace a text range with a non-editable widget span.
   */
  private createWidgetSpan(range: Range, refText: string): void {
    if (!range) return;

    // Extract a display-friendly version (e.g., filename from path)
    let displayLabel = refText;
    if (refText.startsWith('@file ') || refText.startsWith('@dir ')) {
        const parts = refText.split(' ');
        if (parts.length > 1) {
            const pathParts = parts[1].split(/[\\/]/);
            displayLabel = pathParts[pathParts.length - 1] || parts[1]; // Use last part of path or full path
        }
    } else if (refText.startsWith('@Cell ')) {
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

  constructor(docManager: IDocumentManager) {
    super();
    this.docManager = docManager;
    this.id = 'jupyter-sidebar-chatbot';
    this.title.label = 'Chatbot';
    this.title.caption = 'AI Chat Interface';
    this.title.icon = extensionIcon;
    this.title.closable = true;
    this.addClass('jp-llm-ext-sidebar');
{{ ... }}

    // --- 1. Initialize Core Components & State ---
    this.apiClient = new ApiClient();
    this.settingsState = SettingsManager.getInstance(this.apiClient);
    const initialSettings = this.settingsState.getSettings();
    
    // Update the API client with the correct URL from settings
    if (initialSettings?.apiUrl) {
      console.log(`Using API URL from settings: ${initialSettings.apiUrl}`);
      this.apiClient = new ApiClient(initialSettings.apiUrl);
      // Re-initialize settings manager with updated API client
      this.settingsState = SettingsManager.getInstance(this.apiClient);
    } else {
      console.log(`Using default API URL: http://localhost:8000`);
    }
    
    // Check API health on startup
    this.apiClient.healthCheck().then(isHealthy => {
      console.log(`API health check on initialization: ${isHealthy ? 'healthy' : 'not healthy'}`);
    }).catch(error => {
      console.error('Error during initial API health check:', error);
    });
    
    this.chatState = new ChatState(this.apiClient);
    this.noteState = new NoteState();
    this.popupMenuManager = new PopupMenuManager(this.docManager, this.node, {
        insertCode: (code: string) => {
            if (!this.inputHandler || !globals.notebookTracker) return;

            const currentNotebookPanel = globals.notebookTracker.currentWidget;
            if (!currentNotebookPanel || !currentNotebookPanel.context || !currentNotebookPanel.content) {
                console.warn('Could not get notebook context for code reference, inserting raw code as fallback.');
                this.inputHandler?.appendToInput(code); 
                return;
            }

            const notebookPath = currentNotebookPanel.context.path;
            const notebookName = notebookPath.split('/').pop()?.split('.')[0] || 'notebook';
            const currentCell = currentNotebookPanel.content.activeCell;
            if (!currentCell) {
                console.warn('Could not get active cell for code reference, inserting raw code as fallback.');
                this.inputHandler?.appendToInput(code); 
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
                const cmEditor = (editor as any).editor; // Access CodeMirror editor instance (EditorView)
                if (cmEditor && cmEditor.state) {
                    const state = cmEditor.state;
                    const selection = state.selection.main;
                    if (!selection.empty) {
                      lineNumber = state.doc.lineAt(selection.from).number; // 1-based start line
                      lineEndNumber = state.doc.lineAt(selection.to).number; // 1-based end line
                    } else {
                      // Fallback for cursor position if no selection
                      const cursor = editor.getCursorPosition();
                      if (cursor) {
                          lineNumber = cursor.line + 1; // 1-based line number
                          lineEndNumber = lineNumber; // Start and end are the same for cursor
                      }
                    }
                } else {
                    // Fallback if cmEditor or state is not available (should not happen often)
                    console.warn('Could not access CodeMirror state for line numbers.');
                    const cursor = editor.getCursorPosition();
                    if (cursor) {
                        lineNumber = cursor.line + 1; 
                        lineEndNumber = lineNumber; 
                    }
                }
            } else {
                 console.warn('Could not access cell editor for line numbers.');
                 // Keep default line numbers 1, 1 if editor is not available
            }
            
            // --- DEBUG LOG --- 
            console.log(`[ChatbotSidebarWidget.insertCode] Determined lines: Start=${lineNumber}, End=${lineEndNumber}`);
            // --- END DEBUG LOG ---

            // Pass both start and end line numbers
            const refId = this.inputHandler.addCodeReference(code, notebookName, cellIndex, lineNumber, lineEndNumber);
            const placeholder = `@code[${refId}]`;
            this.inputHandler.appendToInput(placeholder);
        },
        insertCell: (content: string) => this.inputHandler?.appendToInput(`@cell ${content}`),
        handleInsertFileWidget: (path: string) => this.inputHandler?.handleInsertFileWidget(path),
        handleInsertDirWidget: (path: string) => this.inputHandler?.handleInsertDirWidget(path),
        getSelectedText: getSelectedText,
        getCurrentCellContent: getCurrentCellContent,
        insertCellByIndex: (index: number) => { 
            this.inputHandler?.handleInsertCellWidgetFromPopup(index); 
        },
        // TODO: insertCollapsedCodeRef should later be merged with insertCode
        // as we only expect one kind of behavior from the input handler.
        // this change will also involve ui changes
        insertCollapsedCodeRef: (code: string, cellIndex: number, lineNumber: number, notebookName: string) => {
            if (!this.inputHandler) return;
            this.inputHandler.handleInsertCodeWidgetFromPopup(code, notebookName, cellIndex, lineNumber);
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
    const toggleNotesCallback = () => {
        this.noteHandler.toggleNotesView();
    };
    const showSettingsCallback = () => {
        this.settingsHandler?.showModal();
    };
    const showPopupMenuCallback = (event: MouseEvent) => {
         const rect = (event.target as HTMLElement).getBoundingClientRect();
         this.popupMenuManager.showPopupMenu({x: rect.left + 60, y: rect.top - 20});
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

     const noteHandlerCallbacks: NoteHandlerCallbacks = {
        updateTitleInput: (title: string) => this.uiManager.updateTitleInput(title)
     };

     const inputHandlerCallbacks: InputHandlerCallbacks = {
        handleSendMessage: (message: string, isMarkdown?: boolean) => {
          if (this.messageHandler) {
            this.messageHandler.handleSendMessage(message, isMarkdown);
          } else {
            console.error('MessageHandler not initialized when trying to send message from InputHandler');
          }
        },
        showPopupMenu: (left: number, top: number) => this.popupMenuManager.showPopupMenu({x: left, y: top}),
        hidePopupMenu: () => this.popupMenuManager.hidePopupMenu(),
        updatePlaceholder: (isMarkdown: boolean) => {
            // Use dataset for data-placeholder attribute
            this.layoutElements.inputField.dataset.placeholder = isMarkdown ? 'Enter markdown...' : 'Ask anything...';
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
        onNotesClick: toggleNotesCallback,
        onSettingsClick: showSettingsCallback,
        onTitleChange: this.handleUpdateTitle,
        onAtButtonClick: showPopupMenuCallback,
        onSendMessageClick: sendMessageViaButtonCallback,
        onMarkdownToggleChange: toggleMarkdownModeCallback,
        onExpandToggleClick: toggleExpandInputCallback,
    });
    this.settingsModalContainer = createSettingsModalElement(settingsModalCallbacks);

    // --- Initialize UI Manager (needs dependencies) ---
    const uiManagerCallbacks: UIManagerCallbacks = {
        handleNewChat: this.handleNewChat,
        handleToggleHistory: this.handleToggleHistory,
        handleToggleNotes: this.handleToggleNotes,
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

    this.noteHandler = new NoteHandler(
        this.noteState,
        this.uiManager,
        noteHandlerCallbacks,
        this.node
    );

    // Replace the layout's notes container with the one from NoteHandler
    const noteContainer = this.noteHandler.getContainer();
    const layoutNoteContainer = this.layoutElements.notesContainer;
    const parent = layoutNoteContainer.parentNode;
    if (parent) {
        parent.replaceChild(noteContainer, layoutNoteContainer);
        // Update the reference in layoutElements
        this.layoutElements.notesContainer = noteContainer;
    }

    this.settingsHandler = new SettingsHandler(
        this.settingsState,
        this.settingsModalContainer,
        this.uiManager,
        this.apiClient
    );

    // --- 5. Final Setup (Attach event listeners, connect signals, etc.) ---

    const initialChatId = this.chatState.getCurrentChatId();
    if (initialChatId) {
        this.historyHandler.loadChat(initialChatId);
    } else {
        const newChat = this.chatState.createNewChat();
        this.historyHandler.loadChat(newChat.id);
    }

    // Setup global keyboard shortcuts with the UIManager for proper @ key handling
    setupShortcuts(this.inputHandler, this.popupMenuManager, shortcutCallbacks);

    // Listen for API client updates
    window.addEventListener('api-client-updated', ((event: CustomEvent) => {
      // Update the API client reference in this widget
      const newApiClient = event.detail.apiClient;
      if (newApiClient) {
        this.apiClient = newApiClient;
        
        // Update references in components that use the API client
        this.messageHandler = new MessageHandler(
          this.apiClient,
          this.chatState,
          this.uiManager, 
          messageRendererCallbacks,
          this.inputHandler
        );
        
        // Recreate the ChatState with the new API client to ensure thread_id creation works
        // Only if there are no existing chats
        if (this.chatState.getChatHistory().length === 0) {
          this.chatState = new ChatState(this.apiClient);
        }
        
        console.log('ChatbotSidebarWidget: API client updated');
      }
    }) as EventListener);

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

} // End of ChatbotSidebarWidget class