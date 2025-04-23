"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageHandler = void 0;
const message_renderer_1 = require("../ui/message-renderer");
const notebook_integration_1 = require("../utils/notebook-integration");
const globals_1 = require("../core/globals"); // Import globals for notebook tracker
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
    handleSendMessage(message) {
        if (!message.trim())
            return;
        console.log(`[MessageHandler] Handling send: "${message}"`);
        // Add user message to UI FIRST
        // Assume user messages aren't markdown unless specific toggle is used elsewhere
        this.addMessage(message, 'user');
        // Clear input via InputHandler (which uses UIManager)
        // REMOVED: this.inputHandler.clearInput(); // Input clearing is now handled by UIManager after the callback
        // Send message to backend API and handle streaming response
        this.streamAndRenderResponse(message);
    }
    /**
     * Sends an automatic message (e.g., 'confirmed', 'rejected')
     * to the backend and handles the streaming response.
     * Also adds the user's confirmation/rejection action and a separator to the UI.
     */
    handleSendAutoMessage(message) {
        if (!message.trim())
            return;
        // Add the user's action ('Confirmed' or 'Rejected') to the UI immediately
        const userDisplayMessage = message.charAt(0).toUpperCase() + message.slice(1);
        // Explicitly false for isMarkdown, true for isAuto
        this.addMessage(userDisplayMessage, 'user', false, true);
        // Create and add the separator element
        console.log('[MessageHandler] Creating action separator element...'); // Debug log
        const separatorDiv = document.createElement('div');
        separatorDiv.className = 'jp-llm-ext-action-separator'; // Add a class for potential styling
        separatorDiv.style.textAlign = 'center'; // Basic styling
        separatorDiv.style.margin = '10px 0'; // Add some vertical space
        separatorDiv.style.fontSize = '0.9em';
        separatorDiv.style.color = 'var(--jp-ui-font-color2, grey)'; // Use JupyterLab theme variable
        if (message === 'confirmed') {
            separatorDiv.textContent = '--------✅ Confirmed--------';
        }
        else if (message === 'rejected') {
            separatorDiv.textContent = '--------❌ Rejected--------';
        }
        else {
            // Optional: Handle unexpected messages? Or just don't add a separator.
            separatorDiv.textContent = `--------${userDisplayMessage}--------`;
        }
        // Add the separator directly to the UI Manager's container
        console.log('[MessageHandler] Attempting to add separator element:', separatorDiv); // Debug log
        this.uiManager.addChatMessageElement(separatorDiv);
        console.log('[MessageHandler] Separator element should be added.'); // Debug log
        // Send the technical message ('confirmed' or 'rejected') to the backend
        // and handle the streaming response from the backend.
        this.streamAndRenderResponse(message);
    }
    /**
     * Adds a message to the UI via UIManager and saves to ChatState.
     */
    addMessage(text, sender, isMarkdown = false, // Default false, overridden below
    isAuto = false // Flag for auto messages like confirm/reject
    ) {
        console.log(`[MessageHandler] Adding message: Sender=${sender}, Markdown=${isMarkdown}, Auto=${isAuto}`);
        let messageElement;
        // Prepare extended callbacks for the renderer
        const extendedCallbacks = Object.assign(Object.assign({}, this.rendererCallbacks), { getCodeRefData: (refId) => {
                return this.inputHandler.getCodeReferenceMap().get(refId);
            }, getCurrentNotebookContext: () => {
                var _a, _b;
                const currentNotebook = (_a = globals_1.globals.notebookTracker) === null || _a === void 0 ? void 0 : _a.currentWidget;
                if (currentNotebook === null || currentNotebook === void 0 ? void 0 : currentNotebook.context) {
                    const path = currentNotebook.context.path;
                    const name = ((_b = path.split('/').pop()) === null || _b === void 0 ? void 0 : _b.split('.')[0]) || 'notebook';
                    return { name, path };
                }
                return undefined;
            } });
        if (sender === 'user') {
            // Pass the isMarkdown option and extended callbacks to the renderer
            messageElement = (0, message_renderer_1.renderUserMessage)(text, { isMarkdown }, extendedCallbacks);
        }
        else {
            // Bot messages usually are markdown unless specified otherwise
            // Handle auto messages specifically if they shouldn't be parsed as markdown
            const botIsMarkdown = !isAuto; // Assume auto messages aren't markdown
            // Pass extended callbacks to bot message renderer too, in case it needs them later
            messageElement = (0, message_renderer_1.renderBotMessage)(text, { isMarkdown: botIsMarkdown }, extendedCallbacks);
        }
        this.uiManager.addChatMessageElement(messageElement);
        // Don't save internal 'confirmed'/'rejected' messages to history
        if (!isAuto) {
            // Add isMarkdown back to the saved message state
            const chatMessage = { sender, text, isMarkdown };
            this.chatState.addMessageToCurrentChat(chatMessage);
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
