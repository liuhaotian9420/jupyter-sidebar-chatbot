import { Widget } from '@lumino/widgets';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { NotebookPanel } from '@jupyterlab/notebook';
import { Contents } from '@jupyterlab/services';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { extensionIcon } from './icons';
import { globals } from './globals';
import { ApiClient } from './api-client';
import { configureMarked, preprocessMarkdown } from './markdown-config';
// import { ICellContext } from './types';
// import { ICellContext } from './types';

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

// Add new interface for command menu items
interface CommandMenuItem {
  label: string;
  description: string;
  action: () => void;
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
  private commandMenuContainer: HTMLDivElement;
  private keyboardShortcutIndicator: HTMLDivElement;

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

    // Initialize container elements before creating layout
    this.messageContainer = document.createElement('div');
    this.inputContainer = document.createElement('div');
    this.inputField = document.createElement('textarea');
    this.titleInput = document.createElement('input');
    this.historyContainer = document.createElement('div');
    this.commandMenuContainer = document.createElement('div');
    this.commandMenuContainer.className = 'command-menu-container';
    this.commandMenuContainer.style.display = 'none';

    // Create keyboard shortcut indicator
    this.keyboardShortcutIndicator = document.createElement('div');
    this.keyboardShortcutIndicator.className = 'keyboard-shortcut-indicator';
    document.body.appendChild(this.keyboardShortcutIndicator);

    // Create a new chat on start
    this.createNewChat();

    this.node.appendChild(this.createLayout());
    this.node.appendChild(this.commandMenuContainer);

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
          this.showCommandMenu(rect.left, rect.bottom);
        }
      },
      { text: '📎', title: 'Upload file', action: () => {} },
      { text: '🔍', title: 'Browse files', action: () => {} },
      { 
        text: '⤢', 
        title: 'Expand input', 
        action: () => this.toggleInputExpansion(actionButtonsContainer.children[3] as HTMLButtonElement)
      },
      { text: '⚙️', title: 'Settings', action: () => {} },
      { text: '📁', title: 'List Directory Contents', action: () => this.listCurrentDirectoryContents() }
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
   */
  private async listCurrentDirectoryContents(): Promise<void> {
    let dirPath: string | null = null;
    let source: string | null = null;

    // Try to get directory path from current widget
    const app = globals.app;
    if (!app) {
      this.addMessage('Error: Application reference not available', 'bot', false);
      return;
    }

    const currentShellWidget = app.shell.currentWidget;
    if (currentShellWidget) {
      const widgetContext = this.docManager.contextForWidget(currentShellWidget);
      if (widgetContext) {
        const path = widgetContext.path;
        const lastSlash = path.lastIndexOf('/');
        dirPath = lastSlash === -1 ? '' : path.substring(0, lastSlash);
        source = 'widget context';
      }
    }

    // Fallback to notebook tracker if no context from widget
    if (dirPath === null && globals.notebookTracker) {
      const currentNotebookPanel = globals.notebookTracker.currentWidget;
      if (currentNotebookPanel instanceof NotebookPanel) {
          const nbPath = currentNotebookPanel.context.path;
          const lastSlash = nbPath.lastIndexOf('/');
          dirPath = lastSlash === -1 ? '' : nbPath.substring(0, lastSlash);
          source = 'active notebook';
      }
    }

    // List contents if path was found
    if (dirPath !== null) {
      try {
        const contents = await this.docManager.services.contents.get(dirPath);
        if (contents.content && contents.content.length > 0) {
          const messageContent = `Directory contents (${source}):\n${
            contents.content.map((item: Contents.IModel) => `- ${item.name} (${item.type})`).join('\n')
          }`;
          this.addMessage(messageContent, 'bot', true);
        } else {
          this.addMessage(`Directory "${dirPath || '/'}" is empty.`, 'bot', true);
        }
      } catch (error) {
        this.addMessage(`Error listing directory contents for "${dirPath}": ${error}`, 'bot', true);
      }
    } else {
      this.addMessage('Could not determine current directory context.', 'bot', true);
    }
  }

  /**
   * Shows the command menu at the specified position
   */
  private showCommandMenu(x: number, y: number): void {
    const commands: CommandMenuItem[] = [
      {
        label: 'code',
        description: 'Insert selected code',
        action: () => this.handleCodeCommand()
      },
      {
        label: 'cell',
        description: 'Insert entire cell content',
        action: () => this.handleCellCommand()
      }
    ];

    // Clear existing content
    this.commandMenuContainer.innerHTML = '';
    
    // Create menu items
    commands.forEach(cmd => {
      const item = document.createElement('div');
      item.className = 'command-menu-item';
      
      const label = document.createElement('div');
      label.className = 'command-label';
      label.textContent = cmd.label;
      
      const desc = document.createElement('div');
      desc.className = 'command-description';
      desc.textContent = cmd.description;
      
      item.appendChild(label);
      item.appendChild(desc);
      
      item.addEventListener('click', () => {
        cmd.action();
        this.hideCommandMenu();
      });
      
      this.commandMenuContainer.appendChild(item);
    });

    // Position and show menu
    this.commandMenuContainer.style.position = 'absolute';
    this.commandMenuContainer.style.left = `${x}px`;
    this.commandMenuContainer.style.top = `${y}px`;
    this.commandMenuContainer.style.display = 'block';

    // Add click outside listener
    document.addEventListener('click', this.handleClickOutside);
  }

  /**
   * Hides the command menu
   */
  private hideCommandMenu(): void {
    this.commandMenuContainer.style.display = 'none';
    document.removeEventListener('click', this.handleClickOutside);
  }

  /**
   * Handles clicks outside the command menu
   */
  private handleClickOutside = (event: MouseEvent) => {
    if (!this.commandMenuContainer.contains(event.target as Node)) {
      this.hideCommandMenu();
    }
  };

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
} 