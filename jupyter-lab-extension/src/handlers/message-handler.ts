import { ApiClient } from '../core/api-client';
import { ChatState, ChatMessage } from '../state/chat-state';
import { UIManager } from '../ui/ui-manager';
import { renderBotMessage, MessageRendererCallbacks } from '../ui/message-renderer';
import { getCurrentCellContent } from '../utils/notebook-integration';
import { InputHandler } from './input-handler'; // Assuming InputHandler is in the same directory

/**
 * Handles sending messages, interacting with the API, 
 * managing streaming responses, and updating the UI and state.
 */
export class MessageHandler {
    private apiClient: ApiClient;
    private chatState: ChatState;
    private uiManager: UIManager;
    private rendererCallbacks: MessageRendererCallbacks;
    private inputHandler: InputHandler;

    constructor(
        apiClient: ApiClient,
        chatState: ChatState,
        uiManager: UIManager,
        rendererCallbacks: MessageRendererCallbacks,
        inputHandler: InputHandler
    ) {
        this.apiClient = apiClient;
        this.chatState = chatState;
        this.uiManager = uiManager;
        this.rendererCallbacks = rendererCallbacks;
        this.inputHandler = inputHandler;
    }

    /**
     * Processes and sends a user-initiated message.
     * Also handles adding the user message to the UI and clearing the input.
     */
    public handleSendMessage(message: string): void {
        if (!message) return;

        // 1. Add user message to UI and state
        // TODO: Process message for code refs (e.g., replace placeholders)
        const processedMessage = message; // Placeholder for now
        const hasCodeRefs = false; // TODO: Determine this based on processing
        this.addMessage(processedMessage, 'user', hasCodeRefs, true);

        // 2. Clear the input field (using InputHandler)
        this.inputHandler.clearInput(); 

        // 3. Send message to backend and handle streaming response
        this.streamAndRenderResponse(processedMessage);
    }

    /**
     * Sends an automatic message (e.g., 'confirmed', 'rejected')
     * to the backend and handles the streaming response.
     * Also adds the user's confirmation/rejection action to the UI.
     */
    public handleSendAutoMessage(message: string): void {
        if (!message.trim()) return;

        // Add the user's action ('Confirmed' or 'Rejected') to the UI immediately
        // Use a slightly more descriptive, capitalized text for the UI display.
        const userDisplayMessage = message.charAt(0).toUpperCase() + message.slice(1);
        this.addMessage(userDisplayMessage, 'user', true, true); // Add the user message to UI and state

        // Send the technical message ('confirmed' or 'rejected') to the backend
        // and handle the streaming response from the backend.
        this.streamAndRenderResponse(message);
    }

    /**
     * Adds a message to the UI via UIManager and saves to ChatState.
     * (Helper method, potentially could live in UIManager or be part of its callback)
     */
    private addMessage(text: string, sender: 'user' | 'bot', isMarkdown: boolean, saveToHistory: boolean): void {
        // Note: This duplicates the logic from the old SimpleSidebarWidget.addMessage
        // It might be better to have UIManager expose a method to add a rendered message
        // and ChatState handle saving directly.
        // For now, keep it here for clarity of message flow.

        // TODO: Call actual render functions from message-renderer.ts when available
        // Instead of just adding a div directly.
        let messageElement: HTMLElement;
        if (sender === 'user') {
            // Replace with renderUserMessage call
            messageElement = document.createElement('div');
            messageElement.className = 'jp-llm-ext-user-message'; // Example class
            messageElement.textContent = text; // Basic rendering for now
        } else {
             // renderBotMessage is used after streaming, this part might be redundant
             // or only needed if we add non-streaming bot messages.
             messageElement = document.createElement('div');
             messageElement.className = 'jp-llm-ext-bot-message'; // Example class
             messageElement.textContent = text; // Basic rendering for now
        }

        this.uiManager.addChatMessageElement(messageElement);

        if (saveToHistory) {
            const messageData: ChatMessage = { text, sender, isMarkdown };
            this.chatState.addMessageToCurrentChat(messageData);
        }
    }

    /**
     * Core logic for sending a message to the API, handling the stream,
     * rendering the response, and saving the final bot message.
     */
    private streamAndRenderResponse(messageToSend: string): void {
        // --- Prepare streaming UI elements (managed by UIManager) ---
        // UIManager should provide a method to create/get these elements
        const { streamingDiv, contentDiv } = this.uiManager.createBotMessageContainer();

        let completeResponse = '';
        const cellContext = getCurrentCellContent(); // Use utility

        // Stream response from API
        this.apiClient.streamChat(
            messageToSend,
            { cellContext },
            // On chunk received
            (chunk: string) => {
                completeResponse += chunk;
                // Update the temporary streaming div
                streamingDiv.textContent = completeResponse;
                this.uiManager.scrollToBottom();
            },
            // On complete
            () => {
                // Hide streaming div, show final content div
                streamingDiv.style.display = 'none';
                contentDiv.style.display = 'block';

                // Render the complete response using the renderer function
                const renderedContent = renderBotMessage(completeResponse, { isMarkdown: true }, this.rendererCallbacks);
                contentDiv.innerHTML = ''; // Clear placeholder/previous content
                
                // Append rendered nodes, skipping any potential wrapper/indicator added by renderBotMessage itself
                 while (renderedContent.firstChild) {
                    // Check if the node is the specific markdown indicator we might add/remove
                    // Or just append everything if renderBotMessage returns the pure content
                    if (!(renderedContent.firstChild as HTMLElement).classList?.contains('markdown-indicator')) {
                       contentDiv.appendChild(renderedContent.firstChild);
                    } else {
                       // Remove the indicator if it was part of the returned fragment
                       renderedContent.removeChild(renderedContent.firstChild);
                    }
                 }

                // Save final bot response to history via ChatState
                const isImage = completeResponse.trim().startsWith('/images/'); // Simple check
                const botMessageData: ChatMessage = {
                    text: completeResponse,
                    sender: 'bot',
                    isMarkdown: !isImage // Save as markdown unless it's an image URL
                };
                this.chatState.addMessageToCurrentChat(botMessageData);

                this.uiManager.scrollToBottom();
            },
            // On error
            (error: Error) => {
                // Hide streaming div, show final content div with error
                streamingDiv.style.display = 'none';
                contentDiv.style.display = 'block';
                // Use a dedicated error rendering style/component if available
                contentDiv.innerHTML = `<div class="jp-llm-ext-error-message">Error: ${error.message}</div>`;
                console.error('API Error:', error);
                this.uiManager.scrollToBottom();
            }
        );
    }
} 