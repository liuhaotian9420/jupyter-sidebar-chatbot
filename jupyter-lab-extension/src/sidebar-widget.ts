import { Widget } from '@lumino/widgets';
import { Message } from '@lumino/messaging';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { NotebookPanel } from '@jupyterlab/notebook';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { extensionIcon } from './icons';
import { globals } from './globals';
import { ApiClient } from './api-client';
import { configureMarked, preprocessMarkdown } from './markdown-config';

// Configure marked with our settings
configureMarked();

/**
 * Chat history item interface
 */
interface ChatHistoryItem {
  id: string;
  title: string;
  messages: {
    text: string;
    sender: 'user' | 'bot';
    isMarkdown: boolean;
  }[];
}

/**
 * Main sidebar widget for the AI chat interface
 */
export class SimpleSidebarWidget extends Widget {
  private messageContainer: HTMLDivElement;
  private inputField: HTMLTextAreaElement;
  private isMarkdownMode: boolean = false;
  private inputContainer: HTMLDivElement;
  private isInputExpanded: boolean = false;
  private docManager: IDocumentManager;
  private chatHistory: ChatHistoryItem[] = [];
  private currentChatId: string = '';
  private titleInput: HTMLInputElement;
  private isHistoryViewActive: boolean = false;
  private historyContainer: HTMLDivElement;
  private apiClient: ApiClient;
  private popupMenuContainer: HTMLDivElement;
  private keyboardShortcutIndicator: HTMLDivElement;
  private settingsModalContainer: HTMLDivElement;
  private currentNotebook: NotebookPanel | null = null;

  // Menu navigation state
  private currentMenuLevel: 'top' | 'files' | 'directories' = 'top';
  private currentMenuPath: string = '';
  private menuHistory: { level: 'top' | 'files' | 'directories', path: string }[] = [];

  constructor(docManager: IDocumentManager) {
    super();
    this.docManager = docManager;
    this.id = 'simple-sidebar';
    this.title.label = '';
    this.title.caption = 'AI Chat Interface';
    this.title.icon = extensionIcon;
    this.title.closable = true;
    
    // Initialize API client
    this.apiClient = new ApiClient();

    // Track the current notebook
    if (globals.notebookTracker) {
      // Set initial notebook if one is active
      this.currentNotebook = globals.notebookTracker.currentWidget;
      
      // Update currentNotebook when the active notebook changes
      globals.notebookTracker.currentChanged.connect((_, notebook) => {
        this.currentNotebook = notebook;
      });
    }

    // Initialize container elements before creating layout
    this.messageContainer = document.createElement('div');
    this.inputContainer = document.createElement('div');
    this.inputField = document.createElement('textarea');
    this.titleInput = document.createElement('input');
    this.historyContainer = document.createElement('div');
    this.popupMenuContainer = document.createElement('div');
    this.popupMenuContainer.className = 'jp-llm-ext-popup-menu-container'; // Renamed class
    this.popupMenuContainer.style.display = 'none'; // Hidden by default

    // Create keyboard shortcut indicator
    this.keyboardShortcutIndicator = document.createElement('div');
    this.keyboardShortcutIndicator.className = 'keyboard-shortcut-indicator';
    document.body.appendChild(this.keyboardShortcutIndicator);

    // Create settings modal
    this.settingsModalContainer = this.createSettingsModal();
    this.node.appendChild(this.settingsModalContainer);

    // Create a new chat on start
    this.createNewChat();

    this.node.appendChild(this.createLayout());
    // Pop-up menu will be attached to document.body when shown

    // Add keyboard shortcut listener
    document.addEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Shows a visual indicator for keyboard shortcuts
   */
  private showKeyboardShortcutIndicator(text: string): void {
    this.keyboardShortcutIndicator.textContent = text;
    this.keyboardShortcutIndicator.classList.add('visible');
    
    // Hide after 1 second
    setTimeout(() => {
      this.keyboardShortcutIndicator.classList.remove('visible');
    }, 1000);
  }

  /**
   * Handles keyboard shortcuts
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    // Check for Ctrl+L (for selected code)
    if (event.ctrlKey && event.key.toLowerCase() === 'l') {
      // Prevent default browser behavior
      event.preventDefault();
      event.stopPropagation();
      
      // Get the current active cell
      const cell = globals.notebookTracker?.activeCell;
      if (!cell || !cell.editor) {
        return;
      }

      try {
        // Get the CodeMirror editor instance
        const editor = cell.editor;
        const view = (editor as any).editor;
        if (!view) {
          return;
        }

        // Check if there's a selection
        const state = view.state;
        const selection = state.selection;
        
        if (!selection.main.empty) {
          // If there's a selection, use @code
          const from = selection.main.from;
          const to = selection.main.to;
          const selectedText = state.doc.sliceString(from, to);
          this.appendToInput(`@code\n${selectedText}`);
          this.showKeyboardShortcutIndicator('Selected code inserted');
        } else {
          // If no selection, use @cell
          const cellContext = globals.cellContextTracker?.getCurrentCellContext();
          if (cellContext) {
            this.appendToInput(`@cell\n${cellContext.text}`);
            this.showKeyboardShortcutIndicator('Cell content inserted');
          }
        }

        // Ensure the sidebar is visible and focused
        if (this.isHidden) {
          this.show();
        }
        this.inputField.focus();
      } catch (error) {
        console.error('Error handling keyboard shortcut:', error);
      }
    }
  };

  /**
   * Disposes all resources
   */
  public dispose(): void {
    // Remove keyboard shortcut listener
    document.removeEventListener('keydown', this.handleKeyDown);
    // Remove keyboard shortcut indicator
    if (this.keyboardShortcutIndicator.parentNode) {
      this.keyboardShortcutIndicator.parentNode.removeChild(this.keyboardShortcutIndicator);
    }
    super.dispose();
  }

  /**
   * Creates the main layout for the sidebar
   */
  private createLayout(): HTMLElement {
    // Create the main container
    const content = document.createElement('div');
    content.className = 'simple-sidebar-content';

    // Create title input container
    const titleContainer = document.createElement('div');
    titleContainer.className = 'title-container';
    
    // Set up title input
    this.titleInput.className = 'chat-title-input';
    this.titleInput.type = 'text';
    this.titleInput.placeholder = 'Chat title';
    this.titleInput.value = 'New Chat';
    this.titleInput.addEventListener('change', () => this.updateCurrentChatTitle());
    
    titleContainer.appendChild(this.titleInput);

    // Configure top action buttons (New Chat & History)
    const topActionsContainer = document.createElement('div');
    topActionsContainer.className = 'top-actions-container';
    
    const newChatButton = document.createElement('button');
    newChatButton.className = 'jp-Button action-button';
    newChatButton.textContent = '+ New Chat';
    newChatButton.title = 'Start a new chat';
    newChatButton.addEventListener('click', () => this.createNewChat());
    
    const historyButton = document.createElement('button');
    historyButton.className = 'jp-Button action-button';
    historyButton.textContent = 'History';
    historyButton.title = 'View chat history';
    historyButton.addEventListener('click', () => this.toggleHistoryView());
    
    topActionsContainer.appendChild(newChatButton);
    topActionsContainer.appendChild(historyButton);

    // Configure message container
    this.messageContainer.className = 'message-container';

    // Configure history container
    this.historyContainer.className = 'history-container';
    this.historyContainer.style.display = 'none'; // Initially hidden

    // Configure input container
    this.inputContainer.className = 'input-container';

    // Create controls container
    const controlsContainer = this.createControlsContainer();

    // Configure input field
    this.inputField.placeholder = 'Ask me anything...';
    this.inputField.style.flexGrow = '1';
    this.inputField.style.padding = '5px';
    this.inputField.style.border = '1px solid #ccc';
    this.inputField.style.borderRadius = '3px';
    this.inputField.style.resize = 'none';
    this.inputField.rows = 1;
    this.inputField.style.overflowY = 'auto';

    // Add keypress listener to input field
    this.inputField.addEventListener('keypress', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        this.handleSendMessage();
      }
    });

    // Create send button container
    const inputActionsContainer = document.createElement('div');
    inputActionsContainer.className = 'input-actions-container';

    // Create send button
    const sendButton = document.createElement('button');
    sendButton.className = 'jp-Button send-button';
    sendButton.textContent = 'Send';
    sendButton.addEventListener('click', () => this.handleSendMessage());

    // Add button to actions container
    inputActionsContainer.appendChild(sendButton);

    // Assemble the input components
    this.inputContainer.appendChild(controlsContainer);
    this.inputContainer.appendChild(this.inputField);
    this.inputContainer.appendChild(inputActionsContainer);

    // Assemble all components
    content.appendChild(topActionsContainer);
    content.appendChild(titleContainer);
    content.appendChild(this.messageContainer);
    content.appendChild(this.historyContainer);
    content.appendChild(this.inputContainer);
    
    return content;
  }

  /**
   * Creates a new chat session
   */
  private createNewChat(): void {
    // Generate a unique ID for the chat
    const chatId = `chat-${Date.now()}`;
    
    // Create a new chat item
    const newChat: ChatHistoryItem = {
      id: chatId,
      title: 'New Chat',
      messages: []
    };
    
    // Add to history
    this.chatHistory.push(newChat);
    
    // Set as current chat
    this.currentChatId = chatId;
    
    // Update title input
    this.titleInput.value = newChat.title;
    
    // Clear message container
    if (this.messageContainer) {
      this.messageContainer.innerHTML = '';
    }
    
    // Hide history if it's visible
    if (this.isHistoryViewActive) {
      this.toggleHistoryView();
    }
  }

  /**
   * Toggles between chat view and history view
   */
  private toggleHistoryView(): void {
    this.isHistoryViewActive = !this.isHistoryViewActive;
    
    if (this.isHistoryViewActive) {
      // Show history view, hide message view
      this.messageContainer.style.display = 'none';
      this.historyContainer.style.display = 'block';
      this.inputContainer.style.display = 'none';
      this.titleInput.style.display = 'none';
      
      // Populate history
      this.renderChatHistory();
    } else {
      // Show message view, hide history view
      this.messageContainer.style.display = 'block';
      this.historyContainer.style.display = 'none';
      this.inputContainer.style.display = 'flex';
      this.titleInput.style.display = 'block';
    }
  }

  /**
   * Renders the chat history in the history container
   */
  private renderChatHistory(): void {
    this.historyContainer.innerHTML = '';
    
    if (this.chatHistory.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'empty-history-message';
      emptyMessage.textContent = 'No chat history yet';
      this.historyContainer.appendChild(emptyMessage);
      return;
    }
    
    // Create a list of chat history items
    this.chatHistory.forEach(chat => {
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      if (chat.id === this.currentChatId) {
        historyItem.classList.add('active');
      }
      
      // Add title
      const title = document.createElement('div');
      title.className = 'history-title';
      title.textContent = chat.title;
      
      // Add message preview
      const preview = document.createElement('div');
      preview.className = 'history-preview';
      const lastMessage = chat.messages[chat.messages.length - 1];
      preview.textContent = lastMessage 
        ? `${lastMessage.text.substring(0, 40)}${lastMessage.text.length > 40 ? '...' : ''}`
        : 'Empty chat';
      
      // Add click event
      historyItem.addEventListener('click', () => this.loadChat(chat.id));
      
      historyItem.appendChild(title);
      historyItem.appendChild(preview);
      this.historyContainer.appendChild(historyItem);
    });
  }

  /**
   * Loads a chat from history
   */
  private loadChat(chatId: string): void {
    const chat = this.chatHistory.find(c => c.id === chatId);
    if (!chat) return;
    
    // Set as current chat
    this.currentChatId = chatId;
    
    // Update title
    this.titleInput.value = chat.title;
    
    // Clear and re-populate message container
    this.messageContainer.innerHTML = '';
    chat.messages.forEach(msg => {
      this.addMessage(msg.text, msg.sender, msg.isMarkdown, false);
    });
    
    // Switch back to chat view
    if (this.isHistoryViewActive) {
      this.toggleHistoryView();
    }
  }

  /**
   * Updates the title of the current chat
   */
  private updateCurrentChatTitle(): void {
    const chat = this.chatHistory.find(c => c.id === this.currentChatId);
    if (chat) {
      chat.title = this.titleInput.value;
    }
  }

  /**
   * Creates the controls container with toggles and action buttons
   */
  private createControlsContainer(): HTMLElement {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'controls-container';

    // Create markdown toggle container
    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'toggle-container';

    // Create markdown toggle
    const markdownToggle = document.createElement('input');
    markdownToggle.type = 'checkbox';
    markdownToggle.id = 'markdown-toggle';
    markdownToggle.style.marginRight = '5px';
    markdownToggle.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      this.isMarkdownMode = target.checked;
      this.inputField.placeholder = this.isMarkdownMode ? 
        'Write markdown here...\n\n# Example heading\n- List item\n\n```code block```' :
        'Ask me anything...';
    });

    // Create toggle label
    const toggleLabel = document.createElement('label');
    toggleLabel.htmlFor = 'markdown-toggle';
    toggleLabel.textContent = 'Markdown mode';
    toggleLabel.style.fontSize = '12px';

    // Add toggle elements to container
    toggleContainer.appendChild(markdownToggle);
    toggleContainer.appendChild(toggleLabel);

    // Create action buttons container
    const actionButtonsContainer = document.createElement('div');
    actionButtonsContainer.className = 'action-buttons-container';

    // Create all action buttons
    const buttons = [
      { 
        text: '@', 
        title: 'Command list', 
        action: (event: MouseEvent) => {
          event.preventDefault();
          event.stopPropagation();
          const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
          this.showPopupMenu(rect.left, rect.bottom);
        }
      },
      { text: '⤢', title: 'Expand input', action: () => this.toggleInputExpansion(actionButtonsContainer.children[3] as HTMLButtonElement) },
      { text: '⚙️', title: 'Settings', action: (event: MouseEvent) => { event.preventDefault(); event.stopPropagation(); this.showSettingsModal(); } },
    ];

    // Add all buttons to the container
    buttons.forEach(button => {
      const btn = this.createButton(button.text, button.title);
      btn.addEventListener('click', (e) => button.action(e));
      actionButtonsContainer.appendChild(btn);
    });

    // Add toggle and action buttons to the controls container
    controlsContainer.appendChild(toggleContainer);
    controlsContainer.appendChild(actionButtonsContainer);

    return controlsContainer;
  }

  /**
   * Toggles the expansion state of the input field
   */
  private toggleInputExpansion(button: HTMLButtonElement): void {
    this.isInputExpanded = !this.isInputExpanded;
    if (this.isInputExpanded) {
      this.inputField.style.height = '100px';
      this.inputField.style.resize = 'vertical';
      button.textContent = '⤡';
      button.title = 'Collapse input';
    } else {
      this.inputField.style.height = 'auto';
      this.inputField.style.resize = 'none';
      button.textContent = '⤢';
      button.title = 'Expand input';
    }
  }

  /**
   * Helper function to create a button with given text and tooltip
   */
  private createButton(text: string, tooltip: string): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = text;
    button.title = tooltip;
    button.className = 'jp-Button action-button';
    return button;
  }

  /**
   * Handles sending a message from the input field
   */
  private handleSendMessage(): void {
    const message = this.inputField.value.trim();
    if (message) {
      // Add user message to UI
      this.addMessage(message, 'user', this.isMarkdownMode);
      this.inputField.value = '';
      
      // Reset expanded state if needed after sending
      if (this.isInputExpanded) {
        this.inputField.style.height = '100px';
      } else {
        this.inputField.style.height = 'auto';
        this.inputField.rows = 1;
      }

      // Create a temporary message container for the bot's streaming response
      const botMessageDiv = document.createElement('div');
      botMessageDiv.className = 'bot-message';
      
      const markdownIndicator = document.createElement('div');
      markdownIndicator.textContent = "MD";
      markdownIndicator.className = 'markdown-indicator';
      botMessageDiv.appendChild(markdownIndicator);
      
      // Create separate divs for streaming text and final markdown
      const streamingDiv = document.createElement('div');
      streamingDiv.className = 'streaming-content';
      streamingDiv.style.whiteSpace = 'pre-wrap';
      streamingDiv.style.fontFamily = 'monospace';
      streamingDiv.style.fontSize = '0.9em';
      botMessageDiv.appendChild(streamingDiv);
      
      const contentDiv = document.createElement('div');
      contentDiv.className = 'markdown-content';
      contentDiv.style.display = 'none'; // Initially hidden
      botMessageDiv.appendChild(contentDiv);
      
      this.messageContainer.appendChild(botMessageDiv);
      
      // Variable to collect the complete response
      let completeResponse = '';
      
      // Get cell context if available
      const cellContext = globals.cellContextTracker ? 
        globals.cellContextTracker.getCurrentCellContext() : null;
      
      // Stream response from API
      this.apiClient.streamChat(
        message,
        { cellContext },
        // On each chunk received
        (chunk: string) => {
          completeResponse += chunk;
          streamingDiv.textContent = completeResponse;
          this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
        },
        // On complete
        () => {
          // Hide streaming div, show markdown div
          streamingDiv.style.display = 'none';
          contentDiv.style.display = 'block';
          
          // Pre-process and render markdown
          try {
            // Pre-process the markdown to fix any issues with code blocks
            const processedMarkdown = preprocessMarkdown(completeResponse);
            
            // Parse and sanitize
            const rawHtml = marked.parse(processedMarkdown) as string;
            const sanitizedHtml = DOMPurify.sanitize(rawHtml);
            
            // Apply the HTML with proper code block styling
            contentDiv.innerHTML = sanitizedHtml;
            
            // Add syntax highlighting classes to code blocks
            const codeBlocks = contentDiv.querySelectorAll('pre code');
            codeBlocks.forEach(block => {
              block.classList.add('jp-RenderedText');
              block.parentElement?.classList.add('jp-RenderedHTMLCommon');
            });

            // Add action buttons to the bot message
            console.log('Adding action buttons to streamed bot message');
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'message-actions';
            actionsDiv.style.display = 'flex'; // Ensure display is set

            // Copy button with icon
            const copyButton = document.createElement('button');
            copyButton.className = 'message-action-button';
            copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
            copyButton.title = 'Copy message to clipboard';
            copyButton.addEventListener('click', (event) => {
              event.stopPropagation();
              this.copyMessageToClipboard(completeResponse);
            });
            actionsDiv.appendChild(copyButton);

            // Add to button with icon
            const addToButton = document.createElement('button');
            addToButton.className = 'message-action-button';
            addToButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M12 11v6"></path><path d="M9 14h6"></path></svg>';
            addToButton.title = 'Add message to current cell';
            addToButton.addEventListener('click', (event) => {
              event.stopPropagation();
              this.addMessageToCell(completeResponse);
            });
            actionsDiv.appendChild(addToButton);

            // Add buttons to message
            botMessageDiv.appendChild(actionsDiv);
            console.log('Action buttons added to bot message:', actionsDiv);

          } catch (error) {
            contentDiv.textContent = completeResponse;
            console.error('Failed to render markdown:', error);
          }
          
          // Save to chat history
          const chat = this.chatHistory.find(c => c.id === this.currentChatId);
          if (chat) {
            chat.messages.push({ 
              text: completeResponse, 
              sender: 'bot', 
              isMarkdown: true
            });
          }
          
          this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
        },
        // On error
        (error: Error) => {
          streamingDiv.style.display = 'none';
          contentDiv.style.display = 'block';
          contentDiv.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
          console.error('API Error:', error);
        }
      );
    }
  }

  /**
   * Adds a message to the chat interface
   */
  private addMessage(text: string, sender: 'user' | 'bot', isMarkdown: boolean = false, saveToHistory: boolean = true): void {
    console.log('Adding message:', { sender, isMarkdown }); // Debug log

    const messageDiv = document.createElement('div');
    messageDiv.className = sender === 'user' ? 'user-message' : 'bot-message';

    // Add message content
    if (isMarkdown || sender === 'bot') {
      // Bot messages are always rendered as markdown
      const markdownIndicator = document.createElement('div');
      markdownIndicator.textContent = "MD";
      markdownIndicator.className = 'markdown-indicator';
      messageDiv.appendChild(markdownIndicator);
      
      // Create a container for the rendered markdown
      const contentDiv = document.createElement('div');
      contentDiv.className = 'markdown-content';
      
      try {
        // Pre-process the markdown text
        const processedText = preprocessMarkdown(text);
        
        // Parse and render markdown
        const rawHtml = marked.parse(processedText) as string;
        const sanitizedHtml = DOMPurify.sanitize(rawHtml);
        contentDiv.innerHTML = sanitizedHtml;
        
        // Add syntax highlighting classes to code blocks
        const codeBlocks = contentDiv.querySelectorAll('pre code');
        codeBlocks.forEach(block => {
          block.classList.add('jp-RenderedText');
          block.parentElement?.classList.add('jp-RenderedHTMLCommon');
        });
      } catch (error) {
        contentDiv.textContent = text;
        console.error('Failed to render markdown:', error);
      }
      
      messageDiv.appendChild(contentDiv);

      // Add action buttons for bot messages
      if (sender === 'bot') {
        console.log('Adding action buttons to bot message'); // Debug log
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'message-actions';
        
        // Copy button with icon
        const copyButton = document.createElement('button');
        copyButton.className = 'message-action-button';
        copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
        copyButton.title = 'Copy message to clipboard';
        copyButton.addEventListener('click', (event) => {
          event.stopPropagation();
          this.copyMessageToClipboard(text);
        });
        actionsDiv.appendChild(copyButton);

        // Add to button with icon
        const addToButton = document.createElement('button');
        addToButton.className = 'message-action-button';
        addToButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M12 11v6"></path><path d="M9 14h6"></path></svg>';
        addToButton.title = 'Add message to current cell';
        addToButton.addEventListener('click', (event) => {
          event.stopPropagation();
          this.addMessageToCell(text);
        });
        actionsDiv.appendChild(addToButton);

        // Add buttons to message
        messageDiv.appendChild(actionsDiv);
        console.log('Action buttons added to message:', actionsDiv); // Debug log
      }
    } else {
      messageDiv.textContent = text;
    }

    this.messageContainer.appendChild(messageDiv);
    this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    
    // Save to chat history
    if (saveToHistory) {
      const chat = this.chatHistory.find(c => c.id === this.currentChatId);
      if (chat) {
        chat.messages.push({ 
          text, 
          sender, 
          isMarkdown: isMarkdown || sender === 'bot' 
        });
      }
    }
  }

  /**
   * Copies message content to clipboard
   */
  private copyMessageToClipboard(text: string): void {
    try {
      navigator.clipboard.writeText(text).then(() => {
        console.log('Content copied to clipboard');
        
        // Find the button element that was clicked
        const buttons = document.querySelectorAll('.message-action-button');
        let clickedButton: HTMLButtonElement | null = null;
        
        for (let i = 0; i < buttons.length; i++) {
          const button = buttons[i] as HTMLButtonElement;
          if (button.title === 'Copy message to clipboard' && button === document.activeElement) {
            clickedButton = button;
            break;
          }
        }
        
        // Show visual feedback if we found the button
        if (clickedButton) {
          const originalHTML = clickedButton.innerHTML;
          clickedButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>';
          setTimeout(() => {
            clickedButton!.innerHTML = originalHTML;
          }, 2000);
        }
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  }

  /**
   * Adds message content to the current cell
   */
  private addMessageToCell(text: string): void {
    const cell = globals.notebookTracker?.activeCell;
    if (!cell || !cell.editor) {
      return;
    }

    try {
      const editor = cell.editor;
      const view = (editor as any).editor;
      if (!view) {
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
        selection: { anchor: cursorPos + text.length + 1 }
      });

      view.dispatch(transaction);
    } catch (error) {
      console.error('Error adding message to cell:', error);
    }
  }

  /**
   * Lists the contents of the current directory
   * @param filterType Optional parameter to filter results by type ('all', 'file', or 'directory')
   */
  async listCurrentDirectoryContents(filterType: 'all' | 'file' | 'directory' = 'all'): Promise<string[] | null> {
    console.log('LIST DIR: Starting directory listing process...', { filterType });
    let dirPath: string | null = null;
    let source = 'unknown';

    const app = globals.app;
    if (!app) {
      console.error('LIST DIR: Application reference not available');
      this.addMessage('Error: Application reference not available', 'bot', false);
      return null;
    }

    console.log('LIST DIR: App reference found:', app);
    console.log('LIST DIR: Current shell widget:', app.shell.currentWidget);

    const currentShellWidget = app.shell.currentWidget;
    if (currentShellWidget) {
      console.log('LIST DIR: Current shell widget type:', currentShellWidget.constructor.name);
      const widgetContext = this.docManager.contextForWidget(currentShellWidget);
      console.log('LIST DIR: Widget context:', widgetContext);
      if (widgetContext) {
        const path = widgetContext.path;
        console.log('LIST DIR: Widget path:', path);
        const lastSlash = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
        dirPath = lastSlash === -1 ? '' : path.substring(0, lastSlash);
        source = 'widget context';
        console.log(`LIST DIR: Path from widget context: ${dirPath}`);
      } else {
        console.log('LIST DIR: Widget context is undefined.');
      }
    }

    // Fallback 1: Active Notebook Path
    if (dirPath === null && this.currentNotebook && this.currentNotebook.context) {
      console.log('LIST DIR: Trying notebook fallback');
      const notebookPath = this.currentNotebook.context.path;
      console.log(`LIST DIR: Raw notebook path: ${notebookPath}`);
      if (typeof notebookPath === 'string') {
        // Handle both forward and backslash path separators
        const lastSlash = Math.max(notebookPath.lastIndexOf('/'), notebookPath.lastIndexOf('\\'));
        dirPath = lastSlash === -1 ? '' : notebookPath.substring(0, lastSlash);
        source = 'notebook';
        console.log(`LIST DIR: Path from notebook context: ${dirPath}`);
      } else {
        console.log('LIST DIR: Notebook context path is not a string.');
      }
    }

    // Fallback 2: File Browser Current Path
    if (dirPath === null) {
      console.log('LIST DIR: Trying file browser fallback');
      const leftWidgets = Array.from(app.shell.widgets('left'));
      const fileBrowserWidget = leftWidgets.find(widget => widget.id === 'filebrowser');
      const fileBrowserModel = (fileBrowserWidget as any)?.model;
      // Check if the model and path exist
      if (fileBrowserModel && typeof fileBrowserModel.path === 'string') {
          const fileBrowserPath = fileBrowserModel.path;
          dirPath = fileBrowserPath;
          source = 'file browser';
          console.log(`LIST DIR: Path from file browser model: ${dirPath}`);
      } else {
          console.log('LIST DIR: File browser path not found or model inaccessible.');
      }
    }

    // Fallback 3: Server Root
    if (dirPath === null) {
      console.log('LIST DIR: Trying server root fallback');
      // Assuming ContentsManager root is desired. Adjust if needed.
      dirPath = ''; // Use empty string for server root with ContentsManager
      source = 'server root';
    }

    // Final Check and Logging
    if (dirPath === null) {
      // This case should ideally not be reached with the server root fallback
      console.error('LIST DIR: Critical Error - Could not determine directory path after all fallbacks.');
      // Indicate failure
      return null;
    }

    console.log(`LIST DIR: Final directory path: \"${dirPath}\" (Source: ${source})`);

    let normalizedPath = ''; // Declare outside try block
    try {
      console.log('LIST DIR: Attempting to list contents for path:', dirPath);
      normalizedPath = dirPath.replace(/\\/g, '/');
      console.log('LIST DIR: Normalized path for content manager:', normalizedPath);
      
      console.log('LIST DIR: Calling content manager get() with path:', normalizedPath);
      
      const contents = await this.docManager.services.contents.get(normalizedPath);
      console.log('LIST DIR: Contents result:', contents);
      if (contents.content && Array.isArray(contents.content)) {
        if (contents.content.length > 0) {
          const itemNames: string[] = [];
          contents.content.forEach(item => {
            // Apply filter based on type
            if (filterType === 'all' || 
               (filterType === 'file' && item.type !== 'directory') ||
               (filterType === 'directory' && item.type === 'directory')) {
              const icon = item.type === 'directory' ? '📁' : '📄'; // Use icons
              itemNames.push(`${icon} ${item.name}`); // Collect names with icons
            }
          });
          console.log(`LIST DIR: Successfully listed ${itemNames.length} items (filtered by: ${filterType})`);
          return itemNames; // Return the list of names
        } else {
          console.log('LIST DIR: Directory is empty or not accessible');
          this.addMessage(`Directory "${normalizedPath || '/'}" is empty or not accessible.`, 'bot', false);
          return null;
        }
      } else {
        // Handle case where contents.content is not as expected
        console.warn('LIST DIR: Contents received, but content format is unexpected or missing.');
        this.addMessage(`Could not list contents for "${normalizedPath || '/'}". Unexpected format.`, 'bot', false);
        return null;
      }
    } catch (error) {
      console.error('LIST DIR: Error listing directory contents:', error);
      console.error('LIST DIR: Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      this.addMessage(`Error listing directory contents for "${normalizedPath || '/'}": ${error}`, 'bot', false);
      return null;
    }
  }

  /**
   * Handles clicks outside the popup menu to close it.
   */
  private handleClickOutside = (event: MouseEvent): void => {
    // Check if the click is outside the popup menu container
    if (this.popupMenuContainer.style.display !== 'none' && !this.popupMenuContainer.contains(event.target as Node)) {
      console.log('POPUP: Click detected outside popup menu.');
      this.hidePopupMenu();
      document.removeEventListener('click', this.handleClickOutside);
    }
  };

  /**
   * Shows the popup menu at the specified position
   */
  private showPopupMenu(x: number, y: number): void {
    // Clear previous menu items
    this.popupMenuContainer.innerHTML = '';

    // Ensure menu is not already attached
    if (this.popupMenuContainer.parentElement) {
      this.popupMenuContainer.parentElement.removeChild(this.popupMenuContainer);
    }

    console.log('POPUP: Showing popup menu at:', x, y, { level: this.currentMenuLevel, path: this.currentMenuPath });

    // Handle different menu levels
    if (this.currentMenuLevel === 'top') {
      // Define top-level menu items
      const topLevelCommands: { label: string; description: string; action: () => void }[] = [
        {
          label: 'Code',
          description: 'Insert selected code',
          action: () => {
            console.log('POPUP: Code action triggered');
            this.handleCodeCommand();
            this.hidePopupMenu();
          }
        },
        {
          label: 'Cell',
          description: 'Insert entire cell content',
          action: () => {
            console.log('POPUP: Cell action triggered');
            this.handleCellCommand();
            this.hidePopupMenu();
          }
        },
        {
          label: 'File',
          description: 'Browse and select a file',
          action: async () => {
            console.log('POPUP: File action triggered');
            // Set menu state for file browsing
            this.menuHistory.push({ level: this.currentMenuLevel, path: this.currentMenuPath });
            this.currentMenuLevel = 'files';
            
            // Try to determine the current path
            await this.setCurrentDirectoryPath();
            
            // Refresh the menu with the new level
            this.showPopupMenu(x, y);
          }
        },
        {
          label: 'Directory',
          description: 'Browse and select a directory',
          action: async () => {
            console.log('POPUP: Directory action triggered');
            // Set menu state for directory browsing
            this.menuHistory.push({ level: this.currentMenuLevel, path: this.currentMenuPath });
            this.currentMenuLevel = 'directories';
            
            // Try to determine the current path
            await this.setCurrentDirectoryPath();
            
            // Refresh the menu with the new level
            this.showPopupMenu(x, y);
          }
        }
      ];

      // Create and append menu items
      this.createMenuItems(topLevelCommands);
    } else if (this.currentMenuLevel === 'files' || this.currentMenuLevel === 'directories') {
      // Add back button if we're not at the top level
      const backButton = document.createElement('div');
      backButton.className = 'jp-llm-ext-popup-menu-item';
      backButton.innerHTML = '<span style="font-weight: bold">← Back</span>';
      backButton.onclick = (e) => {
        e.stopPropagation();
        // Pop the previous state from history
        if (this.menuHistory.length > 0) {
          const prevState = this.menuHistory.pop()!;
          this.currentMenuLevel = prevState.level;
          this.currentMenuPath = prevState.path;
          this.showPopupMenu(x, y);
        } else {
          // If no history, go back to top level
          this.currentMenuLevel = 'top';
          this.currentMenuPath = '';
          this.showPopupMenu(x, y);
        }
      };
      this.popupMenuContainer.appendChild(backButton);

      // Add current path indicator
      const pathIndicator = document.createElement('div');
      pathIndicator.className = 'jp-llm-ext-popup-menu-path';
      pathIndicator.textContent = `Path: ${this.currentMenuPath || '/'}`;
      this.popupMenuContainer.appendChild(pathIndicator);

      // Load and display directory contents based on the current level
      this.loadDirectoryContents(x, y);
    }

    // Append to body and set position
    document.body.appendChild(this.popupMenuContainer);
    this.popupMenuContainer.style.position = 'absolute'; // Position relative to document body
    this.popupMenuContainer.style.left = `${x}px`;
    this.popupMenuContainer.style.top = `${y}px`;
    this.popupMenuContainer.style.display = 'block';
    console.log('POPUP: Menu container displayed and attached to body');

    // Add click outside listener (ensure it's not added multiple times)
    document.removeEventListener('click', this.handleClickOutside);
    document.addEventListener('click', this.handleClickOutside);
  }

  /**
   * Creates menu items from commands and appends them to the popup menu container
   */
  private createMenuItems(commands: { label: string; description: string; action: () => void }[]): void {
    commands.forEach(command => {
      const item = document.createElement('div');
      item.className = 'jp-llm-ext-popup-menu-item';

      const labelSpan = document.createElement('span');
      labelSpan.textContent = command.label;
      labelSpan.style.fontWeight = 'bold';

      const descSpan = document.createElement('span');
      descSpan.textContent = command.description;
      descSpan.style.fontSize = '0.8em'; // Smaller font for description
      descSpan.style.color = 'var(--jp-ui-font-color2)'; // Dimmer color

      item.appendChild(labelSpan);
      item.appendChild(descSpan);

      item.onclick = (e) => {
        e.stopPropagation(); // Prevent click outside listener
        command.action();
      };

      this.popupMenuContainer.appendChild(item);
    });
  }

  /**
   * Loads and displays directory contents in the popup menu
   */
  private async loadDirectoryContents(x: number, y: number): Promise<void> {
    // Show loading indicator
    const loadingItem = document.createElement('div');
    loadingItem.className = 'jp-llm-ext-popup-menu-item';
    loadingItem.textContent = 'Loading...';
    this.popupMenuContainer.appendChild(loadingItem);

    try {
      // Get directory contents with appropriate filter
      const filterType = this.currentMenuLevel === 'files' ? 'file' : 'directory';
      const contents = await this.listCurrentDirectoryContents(filterType);

      // Remove loading indicator
      this.popupMenuContainer.removeChild(loadingItem);

      if (contents && contents.length > 0) {
        // Create items for each content item
        contents.forEach(item => {
          const contentItem = document.createElement('div');
          contentItem.className = 'jp-llm-ext-popup-menu-item';
          contentItem.textContent = item;

          contentItem.onclick = async (e) => {
            e.stopPropagation();
            
            // Extract the name without the icon
            const name = item.substring(2).trim();
            
            if (this.currentMenuLevel === 'directories') {
              // Handle directory navigation
              console.log(`POPUP: Selected directory: ${name}`);
              
              // Save current state to history
              this.menuHistory.push({ level: this.currentMenuLevel, path: this.currentMenuPath });
              
              // Update path (handle both empty path and paths with trailing slash)
              if (!this.currentMenuPath || this.currentMenuPath === '/') {
                this.currentMenuPath = name;
              } else {
                this.currentMenuPath = `${this.currentMenuPath}/${name}`;
              }
              
              // Switch to files view to show files in the selected directory
              this.currentMenuLevel = 'files';
              
              // Refresh the menu
              this.showPopupMenu(x, y);
            } else if (this.currentMenuLevel === 'files') {
              // Handle file selection
              console.log(`POPUP: Selected file: ${name}`);
              
              // Construct full path
              let fullPath;
              if (!this.currentMenuPath || this.currentMenuPath === '/') {
                fullPath = name;
              } else {
                fullPath = `${this.currentMenuPath}/${name}`;
              }
              
              // Insert the file path into the input
              this.appendToInput(`@file\n${fullPath}`);
              
              // Close the menu
              this.hidePopupMenu();
            }
          };
          
          this.popupMenuContainer.appendChild(contentItem);
        });
      } else {
        // Show empty message
        const emptyItem = document.createElement('div');
        emptyItem.className = 'jp-llm-ext-popup-menu-item';
        emptyItem.textContent = `No ${this.currentMenuLevel} found in this directory`;
        this.popupMenuContainer.appendChild(emptyItem);
      }
    } catch (error) {
      // Remove loading indicator
      if (loadingItem.parentNode === this.popupMenuContainer) {
        this.popupMenuContainer.removeChild(loadingItem);
      }
      
      // Show error message
      const errorItem = document.createElement('div');
      errorItem.className = 'jp-llm-ext-popup-menu-item';
      errorItem.textContent = `Error loading contents: ${error}`;
      this.popupMenuContainer.appendChild(errorItem);
      
      console.error('Error loading directory contents:', error);
    }
  }

  /**
   * Sets the current directory path based on context
   */
  private async setCurrentDirectoryPath(): Promise<void> {
    // If we already have a path, keep using it
    if (this.currentMenuPath) {
      return;
    }
    
    // Try to determine the current path using the same logic as in listCurrentDirectoryContents
    let dirPath: string | null = null;
    const app = globals.app;
    
    if (!app) {
      console.error('POPUP: Application reference not available');
      return;
    }
    
    // Try to get path from current widget
    const currentShellWidget = app.shell.currentWidget;
    if (currentShellWidget) {
      const widgetContext = this.docManager.contextForWidget(currentShellWidget);
      if (widgetContext) {
        const path = widgetContext.path;
        const lastSlash = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
        dirPath = lastSlash === -1 ? '' : path.substring(0, lastSlash);
      }
    }
    
    // Fallback 1: Active Notebook Path
    if (dirPath === null && this.currentNotebook && this.currentNotebook.context) {
      const notebookPath = this.currentNotebook.context.path;
      console.log(`POPUP: Raw notebook path: ${notebookPath}`);
      if (typeof notebookPath === 'string') {
        const lastSlash = Math.max(notebookPath.lastIndexOf('/'), notebookPath.lastIndexOf('\\'));
        dirPath = lastSlash === -1 ? '' : notebookPath.substring(0, lastSlash);
      }
    }
    
    // Fallback 2: File Browser Current Path
    if (dirPath === null) {
      const leftWidgets = Array.from(app.shell.widgets('left'));
      const fileBrowserWidget = leftWidgets.find(widget => widget.id === 'filebrowser');
      const fileBrowserModel = (fileBrowserWidget as any)?.model;
      if (fileBrowserModel && typeof fileBrowserModel.path === 'string') {
        dirPath = fileBrowserModel.path;
      }
    }
    
    // Fallback 3: Server Root
    if (dirPath === null) {
      dirPath = ''; // Use empty string for server root
    }
    
    // Set the current menu path
    this.currentMenuPath = dirPath;
    console.log(`POPUP: Set current menu path to: ${this.currentMenuPath}`);
  }

  /**
   * Hides the popup menu
   */
  private hidePopupMenu(): void {
    // Only act if the menu is currently displayed
    if (this.popupMenuContainer.style.display !== 'none') {
      console.log('POPUP: Hiding popup menu.');
      this.popupMenuContainer.style.display = 'none';
      // Remove from body if it's attached
      if (this.popupMenuContainer.parentElement === document.body) {
        document.body.removeChild(this.popupMenuContainer);
        console.log('POPUP: Menu container removed from body');
      }
      // Remove listener when menu is hidden
      document.removeEventListener('click', this.handleClickOutside);
      
      // Reset menu state to top level when hiding
      this.currentMenuLevel = 'top';
      this.currentMenuPath = '';
      this.menuHistory = [];
    }
  }

  /**
   * Handle widget detachment.
   */
  protected onBeforeDetach(msg: Message): void {
    // Ensure the popup menu is hidden and removed from the body if the widget is detached
    this.hidePopupMenu();
    super.onBeforeDetach(msg);
  }

  /**
   * Handles the code command - inserts selected code
   */
  private handleCodeCommand(): void {
    const selectedText = this.getSelectedText();
    if (selectedText) {
      this.appendToInput(`@code\n${selectedText}`);
    } else {
      // If no selection, get the entire cell content
      const cellContext = globals.cellContextTracker?.getCurrentCellContext();
      if (cellContext) {
        this.appendToInput(`@code\n${cellContext.text}`);
      }
    }
  }

  /**
   * Handles the cell command - inserts entire cell content
   */
  private handleCellCommand(): void {
    const cellContext = globals.cellContextTracker?.getCurrentCellContext();
    if (cellContext) {
      this.appendToInput(`@cell\n${cellContext.text}`);
    }
  }

  /**
   * Appends text to the input field with proper spacing
   */
  private appendToInput(text: string): void {
    try {
      const currentValue = this.inputField.value;
      if (currentValue) {
        // If there's existing content, add a newline before appending
        this.inputField.value = `${currentValue}\n\n${text}`;
      } else {
        this.inputField.value = text;
      }
      
      // Focus the input field and move cursor to end
      this.inputField.focus();
      this.inputField.setSelectionRange(
        this.inputField.value.length,
        this.inputField.value.length
      );
    } catch (error) {
      console.error('Error appending to input:', error);
    }
  }

  /**
   * Gets the selected text from cell context
   */
  private getSelectedText(): string {
    // Get the current active cell from the tracker
    const cell = globals.notebookTracker?.activeCell;
    if (!cell || !cell.editor) {
      return '';
    }

    // Get the CodeMirror editor instance
    const editor = cell.editor;
    const view = (editor as any).editor;
    if (!view) {
      return '';
    }

    // Get the selection from CodeMirror
    const state = view.state;
    const selection = state.selection;
    
    // If there's no selection, return empty string
    if (selection.main.empty) {
      return '';
    }

    // Get the selected text
    const from = selection.main.from;
    const to = selection.main.to;
    return state.doc.sliceString(from, to);
  }

  // Settings modal methods
  private createSettingsModal(): HTMLDivElement {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.display = 'none';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';

    const content = document.createElement('div');
    content.style.backgroundColor = '#fff';
    content.style.padding = '20px';
    content.style.borderRadius = '5px';
    content.style.width = '400px';

    const title = document.createElement('h3');
    title.textContent = 'Settings';
    content.appendChild(title);

    const providerLabel = document.createElement('label');
    providerLabel.htmlFor = 'settings-provider';
    providerLabel.textContent = 'LLM Provider:';
    content.appendChild(providerLabel);

    const providerSelect = document.createElement('select');
    providerSelect.id = 'settings-provider';
    ['OpenAI', 'HuggingFace', 'Local'].forEach(opt => {
      const option = document.createElement('option');
      option.value = opt;
      option.textContent = opt;
      providerSelect.appendChild(option);
    });
    content.appendChild(providerSelect);
    content.appendChild(document.createElement('br'));

    const keyLabel = document.createElement('label');
    keyLabel.htmlFor = 'settings-api-key';
    keyLabel.textContent = 'API Key:';
    content.appendChild(keyLabel);

    const keyInput = document.createElement('input');
    keyInput.id = 'settings-api-key';
    keyInput.type = 'text';
    keyInput.style.width = '100%';
    content.appendChild(keyInput);
    content.appendChild(document.createElement('br'));

    const urlLabel = document.createElement('label');
    urlLabel.htmlFor = 'settings-api-base-url';
    urlLabel.textContent = 'API Base URL (optional):';
    content.appendChild(urlLabel);

    const urlInput = document.createElement('input');
    urlInput.id = 'settings-api-base-url';
    urlInput.type = 'text';
    urlInput.style.width = '100%';
    content.appendChild(urlInput);
    content.appendChild(document.createElement('br'));

    const rulesLabel = document.createElement('label');
    rulesLabel.htmlFor = 'settings-rules';
    rulesLabel.textContent = 'Rules:';
    content.appendChild(rulesLabel);

    const rulesTextarea = document.createElement('textarea');
    rulesTextarea.id = 'settings-rules';
    rulesTextarea.style.width = '100%';
    rulesTextarea.style.height = '100px';
    content.appendChild(rulesTextarea);
    content.appendChild(document.createElement('br'));

    const btnContainer = document.createElement('div');
    btnContainer.style.textAlign = 'right';
    btnContainer.style.marginTop = '10px';

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', () => {
      const provider = (document.getElementById('settings-provider') as HTMLSelectElement).value;
      const key = (document.getElementById('settings-api-key') as HTMLInputElement).value;
      const url = (document.getElementById('settings-api-base-url') as HTMLInputElement).value;
      const rules = (document.getElementById('settings-rules') as HTMLTextAreaElement).value;
      console.log('Settings saved:', { provider, key, url, rules });
      this.hideSettingsModal();
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.marginLeft = '10px';
    cancelBtn.addEventListener('click', () => this.hideSettingsModal());

    btnContainer.appendChild(saveBtn);
    btnContainer.appendChild(cancelBtn);
    content.appendChild(btnContainer);

    modal.appendChild(content);
    return modal;
  }

  private showSettingsModal(): void {
    this.settingsModalContainer.style.display = 'flex';
  }

  private hideSettingsModal(): void {
    this.settingsModalContainer.style.display = 'none';
  }
}