import { Widget } from '@lumino/widgets';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { NotebookPanel } from '@jupyterlab/notebook';
import { Contents } from '@jupyterlab/services';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { extensionIcon } from './icons';
import { globals } from './globals';

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

  constructor(docManager: IDocumentManager) {
    super();
    this.docManager = docManager;
    this.id = 'simple-sidebar';
    this.title.label = '';
    this.title.caption = 'AI Chat Interface';
    this.title.icon = extensionIcon;
    this.title.closable = true;

    // Initialize container elements before creating layout
    this.messageContainer = document.createElement('div');
    this.inputContainer = document.createElement('div');
    this.inputField = document.createElement('textarea');
    this.titleInput = document.createElement('input');
    this.historyContainer = document.createElement('div');

    // Create a new chat on start
    this.createNewChat();

    this.node.appendChild(this.createLayout());
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
      { text: '@', title: 'Command list', action: () => {} },
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
      btn.addEventListener('click', button.action);
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
      // Add to UI
      this.addMessage(message, 'user', this.isMarkdownMode);
      this.inputField.value = '';
      
      // Reset expanded state if needed after sending
      if (this.isInputExpanded) {
        this.inputField.style.height = '100px';
      } else {
        this.inputField.style.height = 'auto';
        this.inputField.rows = 1;
      }

      // In the future, this will call the backend sidecar service
      setTimeout(() => {
        this.addMessage(`Echo: ${message}`, 'bot', true);
      }, 500);
    }
  }

  /**
   * Adds a message to the chat interface
   */
  private addMessage(text: string, sender: 'user' | 'bot', isMarkdown: boolean = false, saveToHistory: boolean = true): void {
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
        const rawHtml = marked.parse(text) as string;
        const sanitizedHtml = DOMPurify.sanitize(rawHtml);
        contentDiv.innerHTML = sanitizedHtml;
      } catch (error) {
        contentDiv.textContent = text;
        console.error('Failed to render markdown:', error);
      }
      
      messageDiv.appendChild(contentDiv);
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
} 