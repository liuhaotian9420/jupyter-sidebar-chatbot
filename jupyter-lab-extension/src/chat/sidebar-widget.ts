/**
 * Main sidebar widget for the AI chat interface in JupyterLab
 */

import { Widget } from '@lumino/widgets';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { extensionIcon } from '../icons';
import { globals } from '../globals';

// Import modular components
import { ChatHistoryManager } from './chat-history-manager';
import { FileBrowserManager } from './file-browser-manager';
import { PopupMenuManager } from './popup-menu-manager';
import { MessageRenderer } from './message-renderer';
import { SettingsManager } from './settings-manager';
import { InputHandler } from './input-handler';

/**
 * Main sidebar widget for the AI chat interface in JupyterLab.
 * This widget provides a comprehensive chat-based interface for interacting with AI assistants,
 * supporting text input, Markdown rendering, file and directory browsing through a multi-level
 * pop-up menu, and chat history management. It integrates with JupyterLab's APIs to interact
 * with notebooks and manage document contexts.
 */
export class SimpleSidebarWidget extends Widget {
  // UI Components
  private messageContainer: HTMLDivElement;
  private inputField: HTMLTextAreaElement;
  private inputContainer: HTMLDivElement;
  private titleInput: HTMLInputElement;
  private historyContainer: HTMLDivElement;
  private keyboardShortcutIndicator: HTMLDivElement;
  private isHistoryViewActive = false;
  
  // Core dependencies
  private docManager: IDocumentManager;
  
  // Modular components
  private chatHistoryManager!: ChatHistoryManager; // Using definite assignment assertion
  private fileBrowserManager!: FileBrowserManager;
  private popupMenuManager!: PopupMenuManager;
  private messageRenderer!: MessageRenderer;
  private settingsManager!: SettingsManager;
  private inputHandler!: InputHandler;

  /**
   * Constructor for the SimpleSidebarWidget class.
   * Initializes the widget with the provided document manager and sets up the basic UI components.
   * @param docManager The document manager instance for interacting with JupyterLab documents.
   */
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

    // Create keyboard shortcut indicator for user feedback
    this.keyboardShortcutIndicator = document.createElement('div');
    this.keyboardShortcutIndicator.className = 'keyboard-shortcut-indicator';
    document.body.appendChild(this.keyboardShortcutIndicator);

    // Initialize modular components
    this.initializeModularComponents();
    
    // Create a new chat on start
    this.chatHistoryManager.createNewChat();
    this.updateCurrentChatTitle();

    // Create and add the main layout
    this.node.appendChild(this.createLayout());
    
    // Add keyboard shortcut listener for improved UX
    document.addEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Initializes all modular components
   */
  private initializeModularComponents(): void {
    // Initialize chat history manager
    this.chatHistoryManager = new ChatHistoryManager();
    
    // Initialize file browser manager
    this.fileBrowserManager = new FileBrowserManager(this.docManager);
    
    // Initialize message renderer
    this.messageRenderer = new MessageRenderer(
      this.messageContainer,
      this.copyMessageToClipboard.bind(this),
      this.addMessageToCell.bind(this)
    );
    
    // Initialize input handler
    this.inputHandler = new InputHandler(
      this.inputField,
      this.inputContainer,
      this.handleSendMessage.bind(this)
    );
    
    // Initialize popup menu manager
    this.popupMenuManager = new PopupMenuManager(
      this.fileBrowserManager,
      this.appendToInput.bind(this)
    );
    
    // Initialize settings manager
    this.settingsManager = new SettingsManager();
  }

  /**
   * Shows a visual indicator for keyboard shortcuts.
   * @param text The text to display in the indicator.
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
   * Handles keyboard shortcuts for improved user experience.
   * Currently supports Ctrl+L for inserting selected code or cell content.
   * @param event The keyboard event triggered by the user.
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    // Check for Ctrl+L (for selected code)
    if (event.ctrlKey && event.key === 'l') {
      event.preventDefault();
      this.handleCodeCommand();
      this.showKeyboardShortcutIndicator('Selected code inserted');
    }
  };

  /**
   * Disposes all resources when the widget is closed.
   */
  public dispose(): void {
    // Remove keyboard shortcut listener
    document.removeEventListener('keydown', this.handleKeyDown);
    
    // Remove keyboard shortcut indicator
    if (this.keyboardShortcutIndicator.parentNode) {
      this.keyboardShortcutIndicator.parentNode.removeChild(this.keyboardShortcutIndicator);
    }
    
    // Dispose modular components
    this.popupMenuManager.dispose();
    this.settingsManager.dispose();
    
    super.dispose();
  }

  /**
   * Creates the main layout for the sidebar widget.
   * Includes the title input, message container, history container, input field, and controls.
   * @returns The main content element of the widget.
   */
  private createLayout(): HTMLElement {
    // Create the main container
    const container = document.createElement('div');
    container.className = 'jp-llm-ext-container';
    
    // Create title input container
    const titleContainer = document.createElement('div');
    titleContainer.className = 'jp-llm-ext-title-container';
    
    this.titleInput.className = 'jp-llm-ext-title-input';
    this.titleInput.placeholder = 'Chat Title';
    this.titleInput.addEventListener('change', () => {
      this.chatHistoryManager.updateCurrentChatTitle(this.titleInput.value);
    });
    
    titleContainer.appendChild(this.titleInput);
    container.appendChild(titleContainer);
    
    // Configure message container
    this.messageContainer.className = 'jp-llm-ext-message-container';
    container.appendChild(this.messageContainer);
    
    // Configure history container
    this.historyContainer.className = 'jp-llm-ext-history-container';
    this.historyContainer.style.display = 'none'; // Initially hidden
    container.appendChild(this.historyContainer);
    
    // Create input area
    const inputArea = document.createElement('div');
    inputArea.className = 'jp-llm-ext-input-area';
    
    // Configure input container and field
    this.inputContainer.className = 'jp-llm-ext-input-container';
    this.inputField.className = 'jp-llm-ext-input-field';
    this.inputField.placeholder = 'Type your message here...';
    this.inputContainer.appendChild(this.inputField);
    
    inputArea.appendChild(this.inputContainer);
    
    // Add controls container
    inputArea.appendChild(this.createControlsContainer());
    
    container.appendChild(inputArea);
    
    return container;
  }

  /**
   * Creates the controls container with toggles and action buttons.
   * Includes the Markdown toggle, expand input button, settings button, and popup menu button.
   * @returns The controls container element.
   */
  private createControlsContainer(): HTMLElement {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'jp-llm-ext-controls-container';
    
    // Create toggle buttons container
    const togglesContainer = document.createElement('div');
    togglesContainer.className = 'jp-llm-ext-toggles-container';
    
    // Add Markdown toggle button
    const markdownToggle = this.createButton('MD', 'Toggle Markdown mode');
    markdownToggle.addEventListener('click', () => {
      this.inputHandler.toggleMarkdownMode(markdownToggle);
    });
    togglesContainer.appendChild(markdownToggle);
    
    // Add expand input button
    const expandButton = this.createButton('\u25b2', 'Expand input field');
    expandButton.addEventListener('click', () => {
      this.inputHandler.toggleInputExpansion(expandButton);
    });
    togglesContainer.appendChild(expandButton);
    
    controlsContainer.appendChild(togglesContainer);
    
    // Create action buttons container
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'jp-llm-ext-actions-container';
    
    // Add history toggle button
    const historyButton = this.createButton('\ud83d\udcc3', 'Toggle chat history');
    historyButton.addEventListener('click', () => {
      this.toggleHistoryView();
    });
    actionsContainer.appendChild(historyButton);
    
    // Add settings button
    const settingsButton = this.createButton('\u2699\ufe0f', 'Settings');
    settingsButton.addEventListener('click', () => {
      this.settingsManager.showSettingsModal();
    });
    actionsContainer.appendChild(settingsButton);
    
    // Add send button
    const sendButton = this.createButton('\u27a4', 'Send message');
    sendButton.addEventListener('click', this.handleSendMessage.bind(this));
    actionsContainer.appendChild(sendButton);
    
    // Add popup menu button ("@" button)
    const popupMenuButton = this.createButton('@', 'Insert context');
    popupMenuButton.addEventListener('click', (event: MouseEvent) => {
      // Get button position
      const rect = popupMenuButton.getBoundingClientRect();
      // Show popup menu at button position
      this.popupMenuManager.showPopupMenu(rect.left, rect.bottom);
    });
    actionsContainer.appendChild(popupMenuButton);
    
    controlsContainer.appendChild(actionsContainer);
    
    return controlsContainer;
  }

  /**
   * Helper function to create a button with given text and tooltip.
   * @param text The text to display on the button.
   * @param tooltip The tooltip text to display on hover.
   * @returns The created button element.
   */
  private createButton(text: string, tooltip: string): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = text;
    button.title = tooltip;
    return button;
  }

  /**
   * Toggles between chat view and history view.
   * Updates the UI to show either the chat messages or the chat history list.
   */
  private toggleHistoryView(): void {
    this.isHistoryViewActive = !this.isHistoryViewActive;
    
    if (this.isHistoryViewActive) {
      // Show history view
      this.messageContainer.style.display = 'none';
      this.historyContainer.style.display = 'block';
      this.renderChatHistory();
    } else {
      // Show chat view
      this.messageContainer.style.display = 'block';
      this.historyContainer.style.display = 'none';
    }
  }

  /**
   * Renders the chat history in the history container.
   * Creates a list of chat history items and populates the history container.
   */
  private renderChatHistory(): void {
    this.historyContainer.innerHTML = '';
    
    const chats = this.chatHistoryManager.getAllChats();
    
    // Create new chat button
    const newChatButton = document.createElement('div');
    newChatButton.className = 'jp-llm-ext-history-item jp-llm-ext-new-chat';
    newChatButton.textContent = '+ New Chat';
    newChatButton.addEventListener('click', () => {
      this.createNewChat();
      this.toggleHistoryView(); // Switch back to chat view
    });
    this.historyContainer.appendChild(newChatButton);
    
    if (chats.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'jp-llm-ext-history-empty';
      emptyMessage.textContent = 'No chat history yet';
      this.historyContainer.appendChild(emptyMessage);
      return;
    }
    
    // Create a list item for each chat
    chats.forEach(chat => {
      const chatItem = document.createElement('div');
      chatItem.className = 'jp-llm-ext-history-item';
      if (chat.id === this.chatHistoryManager.getCurrentChatId()) {
        chatItem.classList.add('jp-llm-ext-history-item-active');
      }
      
      const chatTitle = document.createElement('div');
      chatTitle.className = 'jp-llm-ext-history-item-title';
      chatTitle.textContent = chat.title;
      chatItem.appendChild(chatTitle);
      
      const chatInfo = document.createElement('div');
      chatInfo.className = 'jp-llm-ext-history-item-info';
      chatInfo.textContent = `${chat.messages.length} messages`;
      chatItem.appendChild(chatInfo);
      
      chatItem.addEventListener('click', () => {
        this.loadChat(chat.id);
        this.toggleHistoryView(); // Switch back to chat view
      });
      
      this.historyContainer.appendChild(chatItem);
    });
  }

  /**
   * Creates a new chat session.
   * Generates a unique ID, creates a new chat item, adds it to history, and updates the UI.
   */
  private createNewChat(): void {
    // Create new chat using the manager
    this.chatHistoryManager.createNewChat();
    
    // Update UI
    this.updateCurrentChatTitle();
    this.messageRenderer.clearMessages();
    
    // Add welcome message
    this.addMessage(
      'Welcome to the AI Chat Interface. How can I help you today?',
      'bot',
      true,
      false // Don't save welcome message to history
    );
  }

  /**
   * Loads a chat from history.
   * Updates the UI to show the selected chat's messages and title.
   * @param chatId The ID of the chat to load.
   */
  private loadChat(chatId: string): void {
    const chat = this.chatHistoryManager.loadChat(chatId);
    if (chat) {
      // Update UI
      this.updateCurrentChatTitle();
      this.messageRenderer.renderMessages(chat.messages);
    }
  }

  /**
   * Updates the title of the current chat.
   * Updates the title input field with the new title.
   */
  private updateCurrentChatTitle(): void {
    const chat = this.chatHistoryManager.getCurrentChat();
    if (chat) {
      this.titleInput.value = chat.title;
    }
  }

  /**
   * Handles sending a message from the input field.
   * Sends the message to the API, updates the UI with the response, and saves the message to chat history.
   */
  private handleSendMessage(): void {
    const message = this.inputHandler.getInputText().trim();
    if (!message) return;
    
    // Add user message to UI
    this.addMessage(message, 'user', false);
    
    // Clear input field
    this.inputHandler.clearInput();
    
    // Add temporary "thinking" message
    const thinkingMessage = this.addMessage('Thinking...', 'bot', false, false);
    
    // Send message to API (mock implementation for now)
    this.mockSendMessage(message)
      .then((response: string) => {
        // Remove thinking message
        if (thinkingMessage && thinkingMessage.parentNode) {
          thinkingMessage.parentNode.removeChild(thinkingMessage);
        }
        
        // Add bot response
        this.addMessage(response, 'bot', true);
      })
      .catch((error: Error) => {
        console.error('Error sending message:', error);
        
        // Remove thinking message
        if (thinkingMessage && thinkingMessage.parentNode) {
          thinkingMessage.parentNode.removeChild(thinkingMessage);
        }
        
        // Add error message
        this.addMessage(
          'Sorry, there was an error processing your request. Please try again.',
          'bot',
          false
        );
      });
  }

  /**
   * Mock implementation of sending a message to the API
   * @param message The message to send
   * @returns A promise that resolves to the response
   */
  private mockSendMessage(message: string): Promise<string> {
    return new Promise((resolve) => {
      // Simulate a delay
      setTimeout(() => {
        resolve(`I received your message: "${message}". This is a mock response.`);
      }, 1000);
    });
  }

  /**
   * Adds a message to the chat interface.
   * Creates a new message element and appends it to the message container.
   * @param text The text content of the message.
   * @param sender The sender of the message ('user' or 'bot').
   * @param isMarkdown Whether the message is in Markdown format.
   * @param saveToHistory Whether to save the message to chat history.
   * @returns The created message element.
   */
  private addMessage(
    text: string, 
    sender: 'user' | 'bot', 
    isMarkdown = false, 
    saveToHistory = true
  ): HTMLDivElement {
    // Save to chat history if needed
    if (saveToHistory) {
      this.chatHistoryManager.addMessage(text, sender, isMarkdown);
    }
    
    // Render the message
    return this.messageRenderer.renderMessage(text, sender, isMarkdown);
  }

  /**
   * Copies message content to clipboard.
   * @param text The text content to copy.
   */
  private copyMessageToClipboard(text: string): void {
    try {
      navigator.clipboard.writeText(text)
        .then(() => {
          console.log('Text copied to clipboard');
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
          this.fallbackCopyToClipboard(text);
        });
    } catch (error) {
      console.error('Copy to clipboard error:', error);
      this.fallbackCopyToClipboard(text);
    }
  }

  /**
   * Fallback method for copying to clipboard using a temporary textarea element.
   * @param text The text to copy.
   */
  private fallbackCopyToClipboard(text: string): void {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      console.log('Fallback: Text copied to clipboard');
    } catch (error) {
      console.error('Fallback: Could not copy text: ', error);
    }
  }

  /**
   * Adds message content to the current cell.
   * @param text The text content to add.
   */
  private addMessageToCell(text: string): void {
    const cell = globals.notebookTracker?.activeCell;
    
    if (!cell) {
      console.error('No active cell found');
      return;
    }
    
    try {
      // Get current content and cursor position
      const editor = cell.editor;
      if (!editor) {
        console.error('No editor found in cell');
        return;
      }
      
      const position = editor.getCursorPosition();
      const currentText = editor.model.sharedModel.getSource();
      
      // Insert text at cursor position
      const beforeCursor = currentText.substring(0, position.column);
      const afterCursor = currentText.substring(position.column);
      
      // Determine if we need to add newlines
      const needsLeadingNewline = beforeCursor.length > 0 && !beforeCursor.endsWith('\n');
      const needsTrailingNewline = afterCursor.length > 0 && !afterCursor.startsWith('\n');
      
      let insertText = '';
      if (needsLeadingNewline) insertText += '\n';
      insertText += text;
      if (needsTrailingNewline) insertText += '\n';
      
      // Set the new text
      editor.model.sharedModel.setSource(beforeCursor + insertText + afterCursor);
    } catch (error) {
      console.error('Error adding text to cell:', error);
    }
  }

  /**
   * Appends text to the input field with proper spacing.
   * @param text The text to append.
   */
  private appendToInput(text: string): void {
    this.inputHandler.appendToInput(text);
  }

  /**
   * Gets the selected text from cell context.
   * @returns The selected text or an empty string if no selection.
   */
  private getSelectedText(): string {
    // Get the current active cell from the tracker
    const cell = globals.notebookTracker?.activeCell;
    if (!cell) return '';
    
    // Get the selected text from the editor
    const editor = cell.editor;
    if (!editor) return '';
    
    const selection = editor.getSelection();
    if (!selection) return '';
    
    // Extract the selected text
    const { start, end } = selection;
    const text = editor.model.sharedModel.getSource();
    const lines = text.split('\n');
    
    // If selection is within a single line
    if (start.line === end.line) {
      return lines[start.line].substring(start.column, end.column);
    }
    
    // If selection spans multiple lines
    let selectedText = lines[start.line].substring(start.column) + '\n';
    
    for (let i = start.line + 1; i < end.line; i++) {
      selectedText += lines[i] + '\n';
    }
    
    selectedText += lines[end.line].substring(0, end.column);
    
    return selectedText;
  }

  /**
   * Handles the code command - inserts selected code.
   */
  private handleCodeCommand(): void {
    const selectedText = this.getSelectedText();
    if (selectedText) {
      this.appendToInput(selectedText);
    } else {
      console.log('No code selected');
    }
  }
}
