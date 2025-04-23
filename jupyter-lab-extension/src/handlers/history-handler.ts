import { ChatState, ChatHistoryItem, ChatMessage } from '../state/chat-state';
import { UIManager } from '../ui/ui-manager';
import { MessageRendererCallbacks, renderUserMessage, renderBotMessage } from '../ui/message-renderer'; // Assuming renderers are needed

// Callbacks needed by HistoryHandler from the main widget or orchestrator
export interface HistoryHandlerCallbacks {
    updateTitleInput: (title: string) => void;
    clearMessageContainer: () => void;
    addRenderedMessage: (messageElement: HTMLElement) => void;
}

/**
 * Manages the display and interaction logic for the chat history view.
 */
export class HistoryHandler {
    private chatState: ChatState;
    private uiManager: UIManager;
    private callbacks: HistoryHandlerCallbacks;
    private rendererCallbacks: MessageRendererCallbacks; // Keep renderer callbacks separate

    private isHistoryViewActive: boolean = false;
    private historyContainer: HTMLDivElement; // Get from UIManager

    constructor(
        chatState: ChatState,
        uiManager: UIManager,
        callbacks: HistoryHandlerCallbacks,
        rendererCallbacks: MessageRendererCallbacks
    ) {
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
    public toggleHistoryView(): void {
        this.isHistoryViewActive = !this.isHistoryViewActive;

        if (this.isHistoryViewActive) {
            // Use UIManager to hide chat, show history
            this.uiManager.showHistoryView();
            this.renderChatHistory(); // Populate the history view
        } else {
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
    private renderChatHistory(): void {
        this.historyContainer.innerHTML = ''; // Clear previous list
        const history: ChatHistoryItem[] = this.chatState.getChatHistory();
        const currentChatId: string | null = this.chatState.getCurrentChatId();

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
    public loadChat(chatId: string): void {
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
        chat.messages.forEach((msg: ChatMessage) => {
            let messageElement: HTMLElement;
            if (msg.sender === 'user') {
                messageElement = renderUserMessage(msg.text, { isMarkdown: msg.isMarkdown }, this.rendererCallbacks);
            } else { // 'bot'
                messageElement = renderBotMessage(msg.text, { isMarkdown: msg.isMarkdown }, this.rendererCallbacks);
            }
            // Add the rendered element to the message container via callback
            this.callbacks.addRenderedMessage(messageElement); 
        });

        // Switch back to the chat view if we were in the history view
        if (this.isHistoryViewActive) {
            this.toggleHistoryView(); // This will call uiManager.showChatView()
        } else {
            // If already in chat view, ensure scrolling is correct
             this.uiManager.scrollToBottom();
        }
        
        // Optional: Re-render history list to update the active item indicator
        // Only really needed if not switching views
        // if (!this.isHistoryViewActive) { this.renderChatHistory(); }
    }
} 