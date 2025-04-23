"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageHandler = void 0;
const message_renderer_1 = require("../ui/message-renderer");
const notebook_integration_1 = require("../utils/notebook-integration");
/**
 * Handles sending messages, interacting with the API,
 * managing streaming responses, and updating the UI and state.
 */
class MessageHandler {
    constructor(apiClient, chatState, uiManager, rendererCallbacks, inputHandler) {
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
    handleSendMessage(message) {
        if (!message)
            return;
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
     * and handles the streaming response.
     */
    handleSendAutoMessage(message) {
        if (!message.trim())
            return;
        // Auto messages are typically not saved as user messages, 
        // but the response *is* saved.
        this.streamAndRenderResponse(message);
    }
    /**
     * Adds a message to the UI via UIManager and saves to ChatState.
     * (Helper method, potentially could live in UIManager or be part of its callback)
     */
    addMessage(text, sender, isMarkdown, saveToHistory) {
        // Note: This duplicates the logic from the old SimpleSidebarWidget.addMessage
        // It might be better to have UIManager expose a method to add a rendered message
        // and ChatState handle saving directly.
        // For now, keep it here for clarity of message flow.
        // TODO: Call actual render functions from message-renderer.ts when available
        // Instead of just adding a div directly.
        let messageElement;
        if (sender === 'user') {
            // Replace with renderUserMessage call
            messageElement = document.createElement('div');
            messageElement.className = 'jp-llm-ext-user-message'; // Example class
            messageElement.textContent = text; // Basic rendering for now
        }
        else {
            // renderBotMessage is used after streaming, this part might be redundant
            // or only needed if we add non-streaming bot messages.
            messageElement = document.createElement('div');
            messageElement.className = 'jp-llm-ext-bot-message'; // Example class
            messageElement.textContent = text; // Basic rendering for now
        }
        this.uiManager.addChatMessageElement(messageElement);
        if (saveToHistory) {
            const messageData = { text, sender, isMarkdown };
            this.chatState.addMessageToCurrentChat(messageData);
        }
    }
    /**
     * Core logic for sending a message to the API, handling the stream,
     * rendering the response, and saving the final bot message.
     */
    streamAndRenderResponse(messageToSend) {
        // --- Prepare streaming UI elements (managed by UIManager) ---
        // UIManager should provide a method to create/get these elements
        const { streamingDiv, contentDiv } = this.uiManager.createBotMessageContainer();
        let completeResponse = '';
        const cellContext = (0, notebook_integration_1.getCurrentCellContent)(); // Use utility
        // Stream response from API
        this.apiClient.streamChat(messageToSend, { cellContext }, 
        // On chunk received
        (chunk) => {
            completeResponse += chunk;
            // Update the temporary streaming div
            streamingDiv.textContent = completeResponse;
            this.uiManager.scrollToBottom();
        }, 
        // On complete
        () => {
            var _a;
            // Hide streaming div, show final content div
            streamingDiv.style.display = 'none';
            contentDiv.style.display = 'block';
            // Render the complete response using the renderer function
            const renderedContent = (0, message_renderer_1.renderBotMessage)(completeResponse, { isMarkdown: true }, this.rendererCallbacks);
            contentDiv.innerHTML = ''; // Clear placeholder/previous content
            // Append rendered nodes, skipping any potential wrapper/indicator added by renderBotMessage itself
            while (renderedContent.firstChild) {
                // Check if the node is the specific markdown indicator we might add/remove
                // Or just append everything if renderBotMessage returns the pure content
                if (!((_a = renderedContent.firstChild.classList) === null || _a === void 0 ? void 0 : _a.contains('markdown-indicator'))) {
                    contentDiv.appendChild(renderedContent.firstChild);
                }
                else {
                    // Remove the indicator if it was part of the returned fragment
                    renderedContent.removeChild(renderedContent.firstChild);
                }
            }
            // Save final bot response to history via ChatState
            const isImage = completeResponse.trim().startsWith('/images/'); // Simple check
            const botMessageData = {
                text: completeResponse,
                sender: 'bot',
                isMarkdown: !isImage // Save as markdown unless it's an image URL
            };
            this.chatState.addMessageToCurrentChat(botMessageData);
            this.uiManager.scrollToBottom();
        }, 
        // On error
        (error) => {
            // Hide streaming div, show final content div with error
            streamingDiv.style.display = 'none';
            contentDiv.style.display = 'block';
            // Use a dedicated error rendering style/component if available
            contentDiv.innerHTML = `<div class="jp-llm-ext-error-message">Error: ${error.message}</div>`;
            console.error('API Error:', error);
            this.uiManager.scrollToBottom();
        });
    }
}
exports.MessageHandler = MessageHandler;
