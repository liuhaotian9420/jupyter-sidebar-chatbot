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
     * Accepts the message text.
     */
    handleSendMessage(message, isMarkdown = false) {
        if (message.trim() === '') {
            console.log('Ignoring empty message');
            return;
        }
        // Add user message to UI
        this.addMessage({
            sender: 'user',
            content: message,
            timestamp: Date.now(),
            isMarkdown
        });
        // Clear input field
        this.inputHandler.clearInput();
        // Stream the response and handle the bot message
        this.streamAndRenderResponse(message);
    }
    /**
     * Sends an automatic message (e.g., 'confirmed', 'rejected')
     * to the backend and handles the streaming response.
     * Also adds the user's confirmation/rejection action and a separator to the UI.
     */
    handleSendAutoMessage(message) {
        if (!message || !['confirmed', 'rejected'].includes(message.toLowerCase())) {
            console.warn(`Invalid auto message: "${message}"`);
            return;
        }
        // Add user action notification (not as a regular message)
        const actionMessage = document.createElement('div');
        actionMessage.className = 'jp-llm-ext-status-message';
        actionMessage.textContent = message === 'confirmed' ?
            'You confirmed the interrupt' : 'You rejected the interrupt';
        this.uiManager.addChatMessageElement(actionMessage);
        // Add separator
        const separator = document.createElement('hr');
        separator.className = 'jp-llm-ext-chat-separator';
        this.uiManager.addChatMessageElement(separator);
        // Send auto message to API and stream the response
        this.streamAndRenderResponse(message);
    }
    /**
     * Adds a message to the UI via UIManager and saves to ChatState.
     */
    addMessage(message) {
        // Add to UI via UIManager
        const messageElement = message.sender === 'user'
            ? (0, message_renderer_1.renderUserMessage)(message.content, { isMarkdown: message.isMarkdown }, this.rendererCallbacks)
            : (0, message_renderer_1.renderBotMessage)(message.content, { isMarkdown: !!message.isMarkdown }, this.rendererCallbacks);
        // Add to the message container
        this.uiManager.addChatMessageElement(messageElement);
        this.uiManager.scrollToBottom();
        // Add to chat state
        this.chatState.addMessageToCurrentChat(message);
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
        // Get the thread_id from the current chat
        const thread_id = this.chatState.getCurrentChatThreadId();
        // Debug info
        console.log('MessageHandler.streamAndRenderResponse - Thread ID:', thread_id);
        console.log('MessageHandler.streamAndRenderResponse - Context:', { cellContext, thread_id });
        // Stream response from API
        this.apiClient.streamChat(messageToSend, { cellContext, thread_id }, 
        // On chunk received
        (chunk) => {
            completeResponse += chunk;
            // Update the temporary streaming div
            streamingDiv.textContent = completeResponse;
            this.uiManager.scrollToBottom();
        }, 
        // On complete
        () => {
            // For image responses, the contentDiv is updated directly by the renderer
            // For text/markdown, we compile and save the complete response
            // Hide streaming div, show final content div
            streamingDiv.style.display = 'none';
            contentDiv.style.display = 'block';
            // Render the complete response using the renderer function
            const renderedContent = (0, message_renderer_1.renderBotMessage)(completeResponse, { isMarkdown: true }, this.rendererCallbacks);
            contentDiv.innerHTML = ''; // Clear placeholder/previous content
            // Append rendered content
            while (renderedContent.firstChild) {
                contentDiv.appendChild(renderedContent.firstChild);
            }
            this.uiManager.scrollToBottom();
            // Save the bot message in chat state
            this.chatState.addMessageToCurrentChat({
                sender: 'bot',
                content: completeResponse,
                timestamp: Date.now(),
                isMarkdown: true // Bot responses are rendered as Markdown by default
            });
            console.log(`[MessageHandler] Response completed (${completeResponse.length} chars)`);
        }, 
        // On error
        (error) => {
            console.error('Error streaming chat response:', error);
            // We should render an error message to the user here
            contentDiv.textContent = `Error: ${error.message}`;
            streamingDiv.style.display = 'none';
            contentDiv.style.display = 'block';
            contentDiv.style.color = 'red';
        });
    }
}
exports.MessageHandler = MessageHandler;
