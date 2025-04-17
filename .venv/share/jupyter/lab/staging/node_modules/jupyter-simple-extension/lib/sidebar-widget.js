"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleSidebarWidget = void 0;
const widgets_1 = require("@lumino/widgets");
const notebook_1 = require("@jupyterlab/notebook");
const marked_1 = require("marked");
const dompurify_1 = __importDefault(require("dompurify"));
const icons_1 = require("./icons");
const globals_1 = require("./globals");
const api_client_1 = require("./api-client");
const markdown_config_1 = require("./markdown-config");
// import { ICellContext } from './types';
// Configure marked with our settings
(0, markdown_config_1.configureMarked)();
/**
 * Main sidebar widget for the AI chat interface
 */
class SimpleSidebarWidget extends widgets_1.Widget {
    constructor(docManager) {
        super();
        this.isMarkdownMode = false;
        this.isInputExpanded = false;
        this.chatHistory = [];
        this.currentChatId = '';
        this.isHistoryViewActive = false;
        /**
         * Handles clicks outside the command menu
         */
        this.handleClickOutside = (event) => {
            if (!this.commandMenuContainer.contains(event.target)) {
                this.hideCommandMenu();
            }
        };
        this.docManager = docManager;
        this.id = 'simple-sidebar';
        this.title.label = '';
        this.title.caption = 'AI Chat Interface';
        this.title.icon = icons_1.extensionIcon;
        this.title.closable = true;
        // Initialize API client
        this.apiClient = new api_client_1.ApiClient();
        // Initialize container elements before creating layout
        this.messageContainer = document.createElement('div');
        this.inputContainer = document.createElement('div');
        this.inputField = document.createElement('textarea');
        this.titleInput = document.createElement('input');
        this.historyContainer = document.createElement('div');
        this.commandMenuContainer = document.createElement('div');
        this.commandMenuContainer.className = 'command-menu-container';
        this.commandMenuContainer.style.display = 'none';
        // Create a new chat on start
        this.createNewChat();
        this.node.appendChild(this.createLayout());
        this.node.appendChild(this.commandMenuContainer);
    }
    /**
     * Creates the main layout for the sidebar
     */
    createLayout() {
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
    createNewChat() {
        // Generate a unique ID for the chat
        const chatId = `chat-${Date.now()}`;
        // Create a new chat item
        const newChat = {
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
    toggleHistoryView() {
        this.isHistoryViewActive = !this.isHistoryViewActive;
        if (this.isHistoryViewActive) {
            // Show history view, hide message view
            this.messageContainer.style.display = 'none';
            this.historyContainer.style.display = 'block';
            this.inputContainer.style.display = 'none';
            this.titleInput.style.display = 'none';
            // Populate history
            this.renderChatHistory();
        }
        else {
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
    renderChatHistory() {
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
    loadChat(chatId) {
        const chat = this.chatHistory.find(c => c.id === chatId);
        if (!chat)
            return;
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
    updateCurrentChatTitle() {
        const chat = this.chatHistory.find(c => c.id === this.currentChatId);
        if (chat) {
            chat.title = this.titleInput.value;
        }
    }
    /**
     * Creates the controls container with toggles and action buttons
     */
    createControlsContainer() {
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
            const target = e.target;
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
                action: (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    const rect = event.currentTarget.getBoundingClientRect();
                    this.showCommandMenu(rect.left, rect.bottom);
                }
            },
            { text: '📎', title: 'Upload file', action: () => { } },
            { text: '🔍', title: 'Browse files', action: () => { } },
            {
                text: '⤢',
                title: 'Expand input',
                action: () => this.toggleInputExpansion(actionButtonsContainer.children[3])
            },
            { text: '⚙️', title: 'Settings', action: () => { } },
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
    toggleInputExpansion(button) {
        this.isInputExpanded = !this.isInputExpanded;
        if (this.isInputExpanded) {
            this.inputField.style.height = '100px';
            this.inputField.style.resize = 'vertical';
            button.textContent = '⤡';
            button.title = 'Collapse input';
        }
        else {
            this.inputField.style.height = 'auto';
            this.inputField.style.resize = 'none';
            button.textContent = '⤢';
            button.title = 'Expand input';
        }
    }
    /**
     * Helper function to create a button with given text and tooltip
     */
    createButton(text, tooltip) {
        const button = document.createElement('button');
        button.textContent = text;
        button.title = tooltip;
        button.className = 'jp-Button action-button';
        return button;
    }
    /**
     * Handles sending a message from the input field
     */
    handleSendMessage() {
        const message = this.inputField.value.trim();
        if (message) {
            // Add user message to UI
            this.addMessage(message, 'user', this.isMarkdownMode);
            this.inputField.value = '';
            // Reset expanded state if needed after sending
            if (this.isInputExpanded) {
                this.inputField.style.height = '100px';
            }
            else {
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
            const cellContext = globals_1.globals.cellContextTracker ?
                globals_1.globals.cellContextTracker.getCurrentCellContext() : null;
            // Stream response from API
            this.apiClient.streamChat(message, { cellContext }, 
            // On each chunk received
            (chunk) => {
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
                    const processedMarkdown = (0, markdown_config_1.preprocessMarkdown)(completeResponse);
                    // Parse and sanitize
                    const rawHtml = marked_1.marked.parse(processedMarkdown);
                    const sanitizedHtml = dompurify_1.default.sanitize(rawHtml);
                    // Apply the HTML with proper code block styling
                    contentDiv.innerHTML = sanitizedHtml;
                    // Add syntax highlighting classes to code blocks
                    const codeBlocks = contentDiv.querySelectorAll('pre code');
                    codeBlocks.forEach(block => {
                        var _a;
                        block.classList.add('jp-RenderedText');
                        (_a = block.parentElement) === null || _a === void 0 ? void 0 : _a.classList.add('jp-RenderedHTMLCommon');
                    });
                }
                catch (error) {
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
            (error) => {
                streamingDiv.style.display = 'none';
                contentDiv.style.display = 'block';
                contentDiv.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
                console.error('API Error:', error);
            });
        }
    }
    /**
     * Adds a message to the chat interface
     */
    addMessage(text, sender, isMarkdown = false, saveToHistory = true) {
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
                const processedText = (0, markdown_config_1.preprocessMarkdown)(text);
                // Parse and render markdown
                const rawHtml = marked_1.marked.parse(processedText);
                const sanitizedHtml = dompurify_1.default.sanitize(rawHtml);
                contentDiv.innerHTML = sanitizedHtml;
                // Add syntax highlighting classes to code blocks
                const codeBlocks = contentDiv.querySelectorAll('pre code');
                codeBlocks.forEach(block => {
                    var _a;
                    block.classList.add('jp-RenderedText');
                    (_a = block.parentElement) === null || _a === void 0 ? void 0 : _a.classList.add('jp-RenderedHTMLCommon');
                });
            }
            catch (error) {
                contentDiv.textContent = text;
                console.error('Failed to render markdown:', error);
            }
            messageDiv.appendChild(contentDiv);
        }
        else {
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
    async listCurrentDirectoryContents() {
        let dirPath = null;
        let source = null;
        // Try to get directory path from current widget
        const app = globals_1.globals.app;
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
        if (dirPath === null && globals_1.globals.notebookTracker) {
            const currentNotebookPanel = globals_1.globals.notebookTracker.currentWidget;
            if (currentNotebookPanel instanceof notebook_1.NotebookPanel) {
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
                    const messageContent = `Directory contents (${source}):\n${contents.content.map((item) => `- ${item.name} (${item.type})`).join('\n')}`;
                    this.addMessage(messageContent, 'bot', true);
                }
                else {
                    this.addMessage(`Directory "${dirPath || '/'}" is empty.`, 'bot', true);
                }
            }
            catch (error) {
                this.addMessage(`Error listing directory contents for "${dirPath}": ${error}`, 'bot', true);
            }
        }
        else {
            this.addMessage('Could not determine current directory context.', 'bot', true);
        }
    }
    /**
     * Shows the command menu at the specified position
     */
    showCommandMenu(x, y) {
        const commands = [
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
    hideCommandMenu() {
        this.commandMenuContainer.style.display = 'none';
        document.removeEventListener('click', this.handleClickOutside);
    }
    /**
     * Handles the code command - inserts selected code
     */
    handleCodeCommand() {
        var _a;
        const selectedText = this.getSelectedText();
        if (selectedText) {
            this.inputField.value = `@code\n${selectedText}`;
        }
        else {
            // If no selection, get the entire cell content
            const cellContext = (_a = globals_1.globals.cellContextTracker) === null || _a === void 0 ? void 0 : _a.getCurrentCellContext();
            if (cellContext) {
                this.inputField.value = `@code\n${cellContext.text}`;
            }
        }
    }
    /**
     * Handles the cell command - inserts entire cell content
     */
    handleCellCommand() {
        var _a;
        const cellContext = (_a = globals_1.globals.cellContextTracker) === null || _a === void 0 ? void 0 : _a.getCurrentCellContext();
        if (cellContext) {
            this.inputField.value = `@cell\n${cellContext.text}`;
        }
    }
    /**
     * Gets the selected text from cell context
     */
    getSelectedText() {
        var _a;
        // Get the current active cell from the tracker
        const cell = (_a = globals_1.globals.notebookTracker) === null || _a === void 0 ? void 0 : _a.activeCell;
        if (!cell || !cell.editor) {
            return '';
        }
        // Get the CodeMirror editor instance
        const editor = cell.editor;
        const view = editor.editor;
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
exports.SimpleSidebarWidget = SimpleSidebarWidget;
