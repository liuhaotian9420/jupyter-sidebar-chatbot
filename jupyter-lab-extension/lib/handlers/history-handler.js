"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoryHandler = void 0;
const message_renderer_1 = require("../ui/message-renderer"); // Assuming renderers are needed
/**
 * Manages the display and interaction logic for the chat history view.
 */
class HistoryHandler {
    constructor(chatState, uiManager, callbacks, rendererCallbacks) {
        this.isHistoryViewActive = false;
        this.chatState = chatState;
        this.uiManager = uiManager;
        this.callbacks = callbacks;
        this.rendererCallbacks = rendererCallbacks;
        // Get the history container element from UIManager
        this.historyContainer = this.uiManager.getUIElements().historyContainer;
    }
    /**
     * Toggles between the main chat view and the history view.
     */
    toggleHistoryView() {
        this.isHistoryViewActive = !this.isHistoryViewActive;
        if (this.isHistoryViewActive) {
            // Use UIManager to hide chat, show history
            this.uiManager.showHistoryView();
            this.renderChatHistory(); // Populate the history view
        }
        else {
            // Use UIManager to show chat, hide history
            this.uiManager.showChatView();
            // Ensure the correct title is displayed when switching back
            const currentChat = this.chatState.getCurrentChat();
            if (currentChat) {
                this.callbacks.updateTitleInput(currentChat.title);
            }
        }
    }
    /**
     * Renders the list of past chats in the history container.
     */
    renderChatHistory() {
        this.historyContainer.innerHTML = ''; // Clear previous list
        const history = this.chatState.getChatHistory();
        const currentChatId = this.chatState.getCurrentChatId();
        // Create header with back button
        const header = document.createElement('div');
        header.className = 'jp-llm-ext-history-header';
        // Create back button
        const backButton = document.createElement('button');
        backButton.className = 'jp-Button jp-llm-ext-back-button';
        backButton.innerHTML = '<span class="jp-icon3 jp-icon-selectable" role="presentation"><svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg></span>';
        backButton.title = 'Back to chat';
        backButton.addEventListener('click', () => this.hideHistoryView());
        const title = document.createElement('h2');
        title.textContent = 'Chat History';
        header.appendChild(backButton);
        header.appendChild(title);
        this.historyContainer.appendChild(header);
        if (history.length === 0) {
            this.historyContainer.innerHTML += '<div class="jp-llm-ext-history-empty">No chat history yet.</div>';
            return;
        }
        const list = document.createElement('ul');
        list.className = 'jp-llm-ext-history-list';
        history.forEach(chat => {
            const listItem = document.createElement('li');
            listItem.className = 'jp-llm-ext-history-item';
            if (chat.id === currentChatId) {
                listItem.classList.add('jp-llm-ext-active');
            }
            // Simple representation: Title
            // TODO: Add preview, timestamp, delete button etc.
            const titleDiv = document.createElement('div');
            titleDiv.className = 'jp-llm-ext-history-item-title';
            titleDiv.textContent = chat.title || 'Untitled Chat';
            listItem.appendChild(titleDiv);
            // Add click event to load the chat
            listItem.addEventListener('click', () => this.loadChat(chat.id));
            list.appendChild(listItem);
        });
        this.historyContainer.appendChild(list);
    }
    /**
     * Loads a specific chat session from history into the main view.
     */
    loadChat(chatId) {
        const chat = this.chatState.getChatById(chatId);
        if (!chat) {
            console.error(`Chat with ID ${chatId} not found.`);
            return;
        }
        // Set this chat as the active one in the state
        this.chatState.setCurrentChatId(chatId);
        // Log thread_id if available for debugging
        if (chat.thread_id) {
            console.log(`Loaded chat with thread_id: ${chat.thread_id}`);
        }
        else {
            console.log('Loaded chat does not have a thread_id');
        }
        // Update the main UI title input
        this.callbacks.updateTitleInput(chat.title);
        // Clear the current message display
        this.callbacks.clearMessageContainer();
        // Re-populate the message container with messages from the loaded chat
        // Use the renderer functions via callbacks
        chat.messages.forEach((msg) => {
            let messageElement;
            // Get message content, supporting both old (text) and new (content) message formats
            const messageContent = msg.content || msg.text || '';
            if (msg.sender === 'user') {
                messageElement = (0, message_renderer_1.renderUserMessage)(messageContent, { isMarkdown: msg.isMarkdown }, this.rendererCallbacks);
            }
            else { // 'bot'
                messageElement = (0, message_renderer_1.renderBotMessage)(messageContent, { isMarkdown: msg.isMarkdown }, this.rendererCallbacks);
            }
            // Add the rendered element to the message container via callback
            this.callbacks.addRenderedMessage(messageElement);
        });
        // Switch back to the chat view if we were in the history view
        if (this.isHistoryViewActive) {
            this.toggleHistoryView(); // This will call uiManager.showChatView()
        }
        else {
            // If already in chat view, ensure scrolling is correct
            this.uiManager.scrollToBottom();
        }
        // Optional: Re-render history list to update the active item indicator
        // Only really needed if not switching views
        // if (!this.isHistoryViewActive) { this.renderChatHistory(); }
    }
    /**
     * Hides the history view and shows the chat view.
     */
    hideHistoryView() {
        this.isHistoryViewActive = false;
        this.uiManager.showChatView();
        // Ensure the correct title is displayed when switching back
        const currentChat = this.chatState.getCurrentChat();
        if (currentChat) {
            this.callbacks.updateTitleInput(currentChat.title);
        }
    }
}
exports.HistoryHandler = HistoryHandler;
