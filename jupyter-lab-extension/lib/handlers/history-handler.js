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
        if (history.length === 0) {
            this.historyContainer.innerHTML = '<div class="jp-llm-ext-history-empty">No chat history yet.</div>';
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
        // Update the main UI title input
        this.callbacks.updateTitleInput(chat.title);
        // Clear the current message display
        this.callbacks.clearMessageContainer();
        // Re-populate the message container with messages from the loaded chat
        // Use the renderer functions via callbacks
        chat.messages.forEach((msg) => {
            let messageElement;
            if (msg.sender === 'user') {
                messageElement = (0, message_renderer_1.renderUserMessage)(msg.text, { isMarkdown: msg.isMarkdown }, this.rendererCallbacks);
            }
            else { // 'bot'
                messageElement = (0, message_renderer_1.renderBotMessage)(msg.text, { isMarkdown: msg.isMarkdown }, this.rendererCallbacks);
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
}
exports.HistoryHandler = HistoryHandler;
