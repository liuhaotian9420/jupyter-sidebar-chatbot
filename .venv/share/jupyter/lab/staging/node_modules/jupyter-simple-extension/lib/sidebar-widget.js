"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleSidebarWidget = void 0;
const widgets_1 = require("@lumino/widgets");
const marked_1 = require("marked");
const dompurify_1 = __importDefault(require("dompurify"));
const icons_1 = require("./icons");
const globals_1 = require("./globals");
const api_client_1 = require("./api-client");
const markdown_config_1 = require("./markdown-config");
const popup_menu_manager_1 = require("./popup-menu-manager");
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
         * Handles keyboard shortcuts
         */
        this.handleKeyDown = (event) => {
            var _a, _b;
            // Check for @ key (for context menu) - changed from Ctrl+@
            if (event.key === '@') {
                // Prevent default browser behavior
                event.preventDefault();
                event.stopPropagation();
                // Only show menu if input field is focused
                if (document.activeElement === this.inputField) {
                    // Get cursor position in input field
                    const cursorPosition = this.inputField.selectionStart || 0;
                    const textBeforeCursor = this.inputField.value.substring(0, cursorPosition);
                    // Calculate position to show menu
                    const inputRect = this.inputField.getBoundingClientRect();
                    const lineHeight = parseInt(window.getComputedStyle(this.inputField).lineHeight) || 20;
                    // Count newlines before cursor to determine vertical position
                    const linesBeforeCursor = (textBeforeCursor.match(/\n/g) || []).length;
                    // Calculate cursor position within current line
                    const lastNewline = textBeforeCursor.lastIndexOf('\n');
                    const charsInCurrentLine = lastNewline === -1 ? cursorPosition : cursorPosition - lastNewline - 1;
                    // Estimate horizontal position (using average character width)
                    const charWidth = 8; // Approximate width of a character in pixels
                    const horizontalOffset = charsInCurrentLine * charWidth;
                    // Calculate positions
                    const left = inputRect.left + horizontalOffset;
                    // Calculate the cursor's vertical position
                    const cursorTop = inputRect.top + (linesBeforeCursor * lineHeight);
                    console.log(`Showing popup at cursor position: (${left}, ${cursorTop})`);
                    // Insert @ symbol at cursor position
                    const newValue = this.inputField.value.substring(0, cursorPosition) +
                        '@' +
                        this.inputField.value.substring(cursorPosition);
                    this.inputField.value = newValue;
                    // Move cursor after the @ symbol
                    this.inputField.selectionStart = cursorPosition + 1;
                    this.inputField.selectionEnd = cursorPosition + 1;
                    // Show the popup menu above the cursor position
                    this.popupMenuManager.showPopupMenu(left + 60, cursorTop - 20);
                    this.showKeyboardShortcutIndicator('Context menu opened');
                }
            }
            // Check for Ctrl+L (for selected code)
            else if (event.ctrlKey && event.key.toLowerCase() === 'l') {
                // Prevent default browser behavior
                event.preventDefault();
                event.stopPropagation();
                // Get the current active cell
                const cell = (_a = globals_1.globals.notebookTracker) === null || _a === void 0 ? void 0 : _a.activeCell;
                if (!cell || !cell.editor) {
                    return;
                }
                try {
                    // Get the CodeMirror editor instance
                    const editor = cell.editor;
                    const view = editor.editor;
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
                        this.appendToInput(`@code ${selectedText}`);
                        this.showKeyboardShortcutIndicator('Selected code inserted');
                    }
                    else {
                        // If no selection, use @cell
                        const cellContext = (_b = globals_1.globals.cellContextTracker) === null || _b === void 0 ? void 0 : _b.getCurrentCellContext();
                        if (cellContext) {
                            this.appendToInput(`@cell ${cellContext.text}`);
                            this.showKeyboardShortcutIndicator('Cell content inserted');
                        }
                    }
                    // Ensure the sidebar is visible and focused
                    if (this.isHidden) {
                        this.show();
                    }
                    this.inputField.focus();
                }
                catch (error) {
                    console.error('Error handling keyboard shortcut:', error);
                }
            }
        };
        this.docManager = docManager;
        this.id = 'simple-sidebar';
        this.title.label = '';
        this.title.caption = 'AI Chat Interface';
        this.title.icon = icons_1.extensionIcon;
        this.title.closable = true;
        // Add the main CSS class for styling
        this.addClass('jp-llm-ext-sidebar');
        // Initialize API client
        this.apiClient = new api_client_1.ApiClient();
        // Initialize container elements before creating layout
        this.messageContainer = document.createElement('div');
        this.inputField = document.createElement('textarea');
        this.titleInput = document.createElement('input');
        this.historyContainer = document.createElement('div');
        this.keyboardShortcutIndicator = document.createElement('div');
        this.keyboardShortcutIndicator.className = 'jp-llm-ext-keyboard-shortcut-indicator';
        this.node.appendChild(this.keyboardShortcutIndicator);
        // Create settings modal
        this.settingsModalContainer = this.createSettingsModal();
        this.node.appendChild(this.settingsModalContainer);
        // Instantiate the PopupMenuManager with callbacks
        this.popupMenuManager = new popup_menu_manager_1.PopupMenuManager(this.docManager, this.node, {
            insertCode: (code) => this.appendToInput(`code ${code}`),
            insertCell: (content) => this.appendToInput(`cell ${content}`),
            insertFilePath: (path) => this.appendToInput(`file ${path}`),
            insertDirectoryPath: (path) => this.appendToInput(`directory ${path}`), // If needed
            getSelectedText: () => this.getSelectedText(),
            getCurrentCellContent: () => this.getCurrentCellContent(),
        });
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
    showKeyboardShortcutIndicator(text) {
        this.keyboardShortcutIndicator.textContent = text;
        this.keyboardShortcutIndicator.classList.add('visible');
        // Hide after 1 second
        setTimeout(() => {
            this.keyboardShortcutIndicator.classList.remove('visible');
        }, 1000);
    }
    /**
     * Disposes all resources
     */
    dispose() {
        // Remove keyboard shortcut listener
        document.removeEventListener('keydown', this.handleKeyDown);
        // Remove keyboard shortcut indicator
        if (this.keyboardShortcutIndicator.parentNode) {
            this.keyboardShortcutIndicator.parentNode.removeChild(this.keyboardShortcutIndicator);
        }
        // Dispose the popup menu manager
        if (this.popupMenuManager) {
            this.popupMenuManager.dispose();
        }
        super.dispose();
    }
    /**
     * Creates the main layout for the sidebar
     */
    createLayout() {
        // Create the main container
        const mainContent = document.createElement('div');
        // The main class 'jp-llm-ext-sidebar' is added to this.node in the constructor
        // This container can have its own class if needed for further nesting/styling
        mainContent.className = 'jp-llm-ext-content-wrapper';
        // Create title input container
        const titleContainer = document.createElement('div');
        titleContainer.className = 'jp-llm-ext-title-container';
        // Set up title input
        this.titleInput.className = 'chat-title-input'; // Assuming this is styled correctly in CSS
        this.titleInput.type = 'text';
        this.titleInput.placeholder = 'Chat title';
        this.titleInput.value = 'New Chat';
        this.titleInput.addEventListener('change', () => this.updateCurrentChatTitle());
        titleContainer.appendChild(this.titleInput);
        // Create New Chat & History buttons
        const newChatButton = document.createElement('button');
        newChatButton.className = 'jp-Button jp-llm-ext-action-button';
        newChatButton.textContent = '+ New Chat';
        newChatButton.title = 'Start a new chat';
        newChatButton.addEventListener('click', () => this.createNewChat());
        const historyButton = document.createElement('button');
        historyButton.className = 'jp-Button jp-llm-ext-action-button';
        historyButton.textContent = 'History';
        historyButton.title = 'View chat history';
        historyButton.addEventListener('click', () => this.toggleHistoryView());
        // Configure message container
        this.messageContainer.className = 'jp-llm-ext-message-container';
        // Configure history container
        this.historyContainer.className = 'jp-llm-ext-history-container';
        this.historyContainer.style.display = 'none';
        // Configure input field (directly used later)
        this.inputField.placeholder = 'Ask me anything...';
        this.inputField.rows = 1;
        this.inputField.className = 'jp-llm-ext-input-field'; // Add class for styling
        // Add keypress listener to input field
        this.inputField.addEventListener('keypress', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                this.handleSendMessage();
            }
        });
        // Create send button container (directly used later)
        const inputActionsContainer = document.createElement('div');
        inputActionsContainer.className = 'jp-llm-ext-input-actions-container';
        // Create send button
        const sendButton = document.createElement('button');
        sendButton.className = 'jp-Button jp-llm-ext-send-button';
        sendButton.textContent = 'Send';
        sendButton.addEventListener('click', () => this.handleSendMessage());
        inputActionsContainer.appendChild(sendButton);
        // Create controls container (Markdown toggle, @, etc.) (directly used later)
        const controlsContainer = this.createControlsContainer();
        // Create the new bottom bar container with three rows
        const bottomBarContainer = document.createElement('div');
        bottomBarContainer.className = 'jp-llm-ext-bottom-bar-container';
        this.bottomBarContainer = bottomBarContainer;
        // First row: Controls (Markdown toggle and action buttons)
        const topRow = document.createElement('div');
        topRow.className = 'jp-llm-ext-bottom-bar-row jp-llm-ext-controls-row';
        topRow.appendChild(controlsContainer);
        // Second row: Input field
        const middleRow = document.createElement('div');
        middleRow.className = 'jp-llm-ext-bottom-bar-row jp-llm-ext-input-row';
        middleRow.appendChild(this.inputField);
        // Third row: Action buttons (Send, New Chat, History)
        const bottomRow = document.createElement('div');
        bottomRow.className = 'jp-llm-ext-bottom-bar-row jp-llm-ext-buttons-row';
        // Add all buttons to bottom row
        bottomRow.appendChild(sendButton);
        bottomRow.appendChild(newChatButton);
        bottomRow.appendChild(historyButton);
        // Add all rows to the bottom bar container
        bottomBarContainer.appendChild(topRow);
        bottomBarContainer.appendChild(middleRow);
        bottomBarContainer.appendChild(bottomRow);
        // Assemble all main components
        mainContent.appendChild(titleContainer);
        mainContent.appendChild(this.messageContainer);
        mainContent.appendChild(this.historyContainer);
        mainContent.appendChild(bottomBarContainer);
        return mainContent;
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
            // Show history view, hide message view and bottom bar
            this.messageContainer.style.display = 'none';
            this.historyContainer.style.display = 'block';
            this.bottomBarContainer.style.display = 'none'; // Use class property directly
            this.titleInput.style.display = 'none';
            // Populate history
            this.renderChatHistory();
        }
        else {
            // Show message view and bottom bar, hide history view
            this.messageContainer.style.display = 'block';
            this.historyContainer.style.display = 'none';
            this.bottomBarContainer.style.display = 'flex'; // Use class property directly
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
            emptyMessage.className = 'jp-llm-ext-empty-history-message';
            emptyMessage.textContent = 'No chat history yet';
            this.historyContainer.appendChild(emptyMessage);
            return;
        }
        // Create a list of chat history items
        this.chatHistory.forEach(chat => {
            const historyItem = document.createElement('div');
            historyItem.className = 'jp-llm-ext-history-item';
            if (chat.id === this.currentChatId) {
                historyItem.classList.add('jp-llm-ext-active');
            }
            // Add title
            const title = document.createElement('div');
            title.className = 'jp-llm-ext-history-title';
            title.textContent = chat.title;
            // Add message preview
            const preview = document.createElement('div');
            preview.className = 'jp-llm-ext-history-preview';
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
        controlsContainer.className = 'jp-llm-ext-controls-container';
        // Create markdown toggle container
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'jp-llm-ext-toggle-container';
        // Create markdown toggle
        const markdownToggle = document.createElement('input');
        markdownToggle.type = 'checkbox';
        markdownToggle.id = 'markdown-toggle';
        // markdownToggle.style.marginRight = '5px'; // Style via CSS
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
        // toggleLabel.style.fontSize = '12px'; // Style via CSS
        // Add toggle elements to container
        toggleContainer.appendChild(markdownToggle);
        toggleContainer.appendChild(toggleLabel);
        // Create action buttons container (@, expand, settings)
        const actionButtonsContainer = document.createElement('div');
        actionButtonsContainer.className = 'jp-llm-ext-action-buttons-container';
        // Create all action buttons
        const buttons = [
            {
                text: '@',
                title: 'Insert context (@)',
                action: (event) => {
                    // Get the button's position
                    const targetButton = event.currentTarget;
                    const rect = targetButton.getBoundingClientRect();
                    // Show the popup menu above the button's top edge
                    this.popupMenuManager.showPopupMenu(rect.left + 60, rect.top - 20);
                    event.preventDefault();
                    event.stopPropagation();
                }
            },
            { text: '⤢', title: 'Expand input', action: () => this.toggleInputExpansion(actionButtonsContainer.children[3]) },
            { text: '⚙️', title: 'Settings', action: (event) => { event.preventDefault(); event.stopPropagation(); this.showSettingsModal(); } },
        ];
        // Add all buttons to the container
        buttons.forEach(button => {
            const btn = this.createButton(button.text, button.title);
            btn.addEventListener('click', (e) => button.action(e));
            actionButtonsContainer.appendChild(btn);
        });
        // Add toggle and action buttons to the controls container
        // controlsContainer is now just for these inline controls, above the input field
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
            // Adjust height based on a class or CSS variable instead of fixed pixels if possible
            this.inputField.style.height = '200px';
            this.inputField.style.resize = 'vertical';
            button.textContent = '⤡';
            button.title = 'Collapse input';
        }
        else {
            this.inputField.style.height = ''; // Reset height
            this.inputField.style.resize = 'none';
            this.inputField.rows = 1; // Ensure it collapses back to 1 row height
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
        button.className = 'jp-Button jp-llm-ext-action-button';
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
            this.inputField.rows = 1; // Reset rows after sending
            this.inputField.style.height = ''; // Reset height after sending
            // Reset expanded state if needed after sending
            if (this.isInputExpanded) {
                // Find the expand button to reset its state if needed (this might need adjustment based on final structure)
                const expandButton = this.node.querySelector('.jp-llm-ext-action-buttons-container button[title*="Collapse"]');
                if (expandButton) {
                    this.toggleInputExpansion(expandButton); // Collapse after sending
                }
                else {
                    this.inputField.style.height = ''; // Fallback reset
                    this.inputField.rows = 1;
                }
            }
            // Create a temporary message container for the bot's streaming response
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'jp-llm-ext-bot-message';
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
                    // Add action buttons to the bot message
                    console.log('Adding action buttons to streamed bot message');
                    const actionsDiv = document.createElement('div');
                    actionsDiv.className = 'jp-llm-ext-message-actions';
                    actionsDiv.style.display = 'flex'; // Ensure display is set
                    // Copy button with icon
                    const copyButton = document.createElement('button');
                    copyButton.className = 'jp-llm-ext-message-action-button';
                    copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
                    copyButton.title = 'Copy message to clipboard';
                    copyButton.addEventListener('click', (event) => {
                        event.stopPropagation();
                        this.copyMessageToClipboard(completeResponse);
                    });
                    actionsDiv.appendChild(copyButton);
                    // Add to button with icon
                    const addToButton = document.createElement('button');
                    addToButton.className = 'jp-llm-ext-message-action-button';
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
        console.log('Adding message:', { sender, isMarkdown }); // Debug log
        const messageDiv = document.createElement('div');
        messageDiv.className = sender === 'user' ? 'jp-llm-ext-user-message' : 'jp-llm-ext-bot-message';
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
            // Add action buttons for bot messages
            if (sender === 'bot') {
                console.log('Adding action buttons to bot message'); // Debug log
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'jp-llm-ext-message-actions';
                // Copy button with icon
                const copyButton = document.createElement('button');
                copyButton.className = 'jp-llm-ext-message-action-button';
                copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
                copyButton.title = 'Copy message to clipboard';
                copyButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    this.copyMessageToClipboard(text);
                });
                actionsDiv.appendChild(copyButton);
                // Add to button with icon
                const addToButton = document.createElement('button');
                addToButton.className = 'jp-llm-ext-message-action-button';
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
     * Copies message content to clipboard
     */
    copyMessageToClipboard(text) {
        try {
            navigator.clipboard.writeText(text).then(() => {
                console.log('Content copied to clipboard');
                // Find the button element that was clicked
                const buttons = document.querySelectorAll('.jp-llm-ext-message-action-button');
                let clickedButton = null;
                for (let i = 0; i < buttons.length; i++) {
                    const button = buttons[i];
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
                        clickedButton.innerHTML = originalHTML;
                    }, 2000);
                }
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        }
        catch (error) {
            console.error('Error copying to clipboard:', error);
        }
    }
    /**
     * Adds message content to the current cell
     */
    addMessageToCell(text) {
        var _a;
        const cell = (_a = globals_1.globals.notebookTracker) === null || _a === void 0 ? void 0 : _a.activeCell;
        if (!cell || !cell.editor) {
            return;
        }
        try {
            const editor = cell.editor;
            const view = editor.editor;
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
        }
        catch (error) {
            console.error('Error adding message to cell:', error);
        }
    }
    /**
     * Gets the currently selected text from the active notebook cell.
     * (Helper for PopupMenuManager callback)
     */
    getSelectedText() {
        var _a, _b, _c;
        const cell = (_a = globals_1.globals.notebookTracker) === null || _a === void 0 ? void 0 : _a.activeCell;
        if (cell === null || cell === void 0 ? void 0 : cell.editor) {
            const editor = cell.editor; // IEditor
            // Access CodeMirror editor instance if possible
            const cmEditor = editor.editor;
            if (cmEditor && cmEditor.state) {
                const state = cmEditor.state;
                const selection = state.selection.main; // Get the main selection
                if (selection.empty) {
                    return null; // No text selected
                }
                return state.doc.sliceString(selection.from, selection.to);
            }
            console.warn("Could not access CodeMirror state to get selection.");
            // Avoid using getRange as it's confirmed not to exist on IEditor
            return null;
        }
        else {
            // Attempt to get selection from document if no notebook active (e.g., text editor)
            const activeWidget = (_c = (_b = globals_1.globals.app) === null || _b === void 0 ? void 0 : _b.shell) === null || _c === void 0 ? void 0 : _c.currentWidget;
            if (activeWidget && 'content' in activeWidget && activeWidget.content.editor) {
                const editor = activeWidget.content.editor;
                const cmEditor = editor.editor;
                if (cmEditor && cmEditor.state) {
                    const state = cmEditor.state;
                    const selection = state.selection.main;
                    if (selection.empty) {
                        return null;
                    }
                    return state.doc.sliceString(selection.from, selection.to);
                }
                console.warn("Could not access CodeMirror state for non-notebook editor selection.");
                return null; // Avoid getRange
            }
        }
        return null;
    }
    /**
     * Gets the content of the currently active notebook cell.
     * (Helper for PopupMenuManager callback)
     */
    getCurrentCellContent() {
        var _a, _b, _c;
        const activeCell = (_a = globals_1.globals.notebookTracker) === null || _a === void 0 ? void 0 : _a.activeCell;
        if (activeCell === null || activeCell === void 0 ? void 0 : activeCell.model) {
            // Try using sharedModel first (more robust)
            if (activeCell.model.sharedModel && typeof activeCell.model.sharedModel.getSource === 'function') {
                return activeCell.model.sharedModel.getSource();
            }
            // Fallback: Try using toJSON().source
            const cellJson = activeCell.model.toJSON();
            if (typeof (cellJson === null || cellJson === void 0 ? void 0 : cellJson.source) === 'string') {
                return cellJson.source;
            }
            else if (Array.isArray(cellJson === null || cellJson === void 0 ? void 0 : cellJson.source)) {
                // If source is an array of strings, join them
                return cellJson.source.join('\n');
            }
            console.warn("Could not get cell content via model.value.text or toJSON().source");
            return null;
        }
        // Fallback for non-notebook editors if needed
        const activeWidget = (_c = (_b = globals_1.globals.app) === null || _b === void 0 ? void 0 : _b.shell) === null || _c === void 0 ? void 0 : _c.currentWidget;
        if (activeWidget && 'content' in activeWidget && activeWidget.content.model) {
            return activeWidget.content.model.value.text;
        }
        return null;
    }
    /**
     * Appends text to the input field with proper spacing
     */
    appendToInput(text) {
        try {
            const currentValue = this.inputField.value;
            if (currentValue) {
                // add a space between the current value and the new text
                this.inputField.value = `${currentValue}${text}`;
            }
            else {
                this.inputField.value = text;
            }
            // Focus the input field and move cursor to end
            this.inputField.focus();
            this.inputField.setSelectionRange(this.inputField.value.length, this.inputField.value.length);
        }
        catch (error) {
            console.error('Error appending to input:', error);
        }
    }
    // Settings modal methods
    createSettingsModal() {
        const modal = document.createElement('div');
        modal.className = 'jp-llm-ext-settings-modal';
        modal.style.display = 'none'; // Keep this inline style for toggling visibility
        const content = document.createElement('div');
        content.className = 'jp-llm-ext-settings-content';
        const title = document.createElement('h2');
        title.className = 'jp-llm-ext-settings-title';
        title.textContent = 'Settings';
        content.appendChild(title);
        const form = document.createElement('form');
        form.className = 'jp-llm-ext-settings-form';
        // Provider selection
        const providerLabel = document.createElement('label');
        providerLabel.className = 'jp-llm-ext-settings-label';
        providerLabel.textContent = 'API Provider:';
        form.appendChild(providerLabel);
        const providerSelect = document.createElement('select');
        providerSelect.className = 'jp-llm-ext-settings-select';
        providerSelect.id = 'settings-provider';
        ['OpenAI', 'HuggingFace', 'Local'].forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt;
            providerSelect.appendChild(option);
        });
        form.appendChild(providerSelect);
        // API Key input
        const apiKeyLabel = document.createElement('label');
        apiKeyLabel.className = 'jp-llm-ext-settings-label';
        apiKeyLabel.textContent = 'API Key:';
        form.appendChild(apiKeyLabel);
        const apiKeyInput = document.createElement('input');
        apiKeyInput.className = 'jp-llm-ext-settings-input';
        apiKeyInput.type = 'password';
        apiKeyInput.id = 'settings-api-key';
        form.appendChild(apiKeyInput);
        // API URL input
        const apiUrlLabel = document.createElement('label');
        apiUrlLabel.className = 'jp-llm-ext-settings-label';
        apiUrlLabel.textContent = 'API URL (optional):';
        form.appendChild(apiUrlLabel);
        const apiUrlInput = document.createElement('input');
        apiUrlInput.className = 'jp-llm-ext-settings-input';
        apiUrlInput.type = 'text';
        apiUrlInput.id = 'settings-api-url';
        form.appendChild(apiUrlInput);
        // Rules input
        const rulesLabel = document.createElement('label');
        rulesLabel.className = 'jp-llm-ext-settings-label';
        rulesLabel.textContent = 'Custom Rules (optional):';
        form.appendChild(rulesLabel);
        const rulesInput = document.createElement('textarea');
        rulesInput.className = 'jp-llm-ext-settings-textarea';
        rulesInput.id = 'settings-rules';
        form.appendChild(rulesInput);
        // Buttons container
        const btnContainer = document.createElement('div');
        btnContainer.className = 'jp-llm-ext-settings-buttons';
        const saveBtn = document.createElement('button');
        saveBtn.className = 'jp-llm-ext-settings-button jp-llm-ext-settings-save-button';
        saveBtn.textContent = 'Save';
        saveBtn.addEventListener('click', (event) => {
            event.preventDefault(); // Add this line
            const provider = document.getElementById('settings-provider').value;
            const key = document.getElementById('settings-api-key').value;
            const url = document.getElementById('settings-api-url').value;
            const rules = document.getElementById('settings-rules').value;
            console.log('Settings saved:', { provider, key, url, rules });
            this.hideSettingsModal();
            this.popSaveSuccess();
        });
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'jp-llm-ext-settings-button jp-llm-ext-settings-cancel-button';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', (event) => {
            event.preventDefault(); // Add this line
            this.hideSettingsModal();
        });
        btnContainer.appendChild(saveBtn);
        btnContainer.appendChild(cancelBtn);
        form.appendChild(btnContainer);
        content.appendChild(form);
        modal.appendChild(content);
        return modal;
    }
    showSettingsModal() {
        this.settingsModalContainer.style.display = 'flex';
    }
    hideSettingsModal() {
        this.settingsModalContainer.style.display = 'none';
    }
    popSaveSuccess() {
        const successMessage = document.createElement('div');
        successMessage.className = 'jp-llm-ext-settings-success-message';
        successMessage.textContent = 'Settings saved successfully';
        this.settingsModalContainer.appendChild(successMessage);
        setTimeout(() => {
            successMessage.remove();
        }, 3000);
    }
}
exports.SimpleSidebarWidget = SimpleSidebarWidget;
