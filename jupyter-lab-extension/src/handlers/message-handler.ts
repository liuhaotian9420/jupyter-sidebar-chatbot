import { ApiClient } from '../core/api-client';
import { ChatState, ChatMessage } from '../state/chat-state';
import { UIManager } from '../ui/ui-manager';
import { renderBotMessage, MessageRendererCallbacks, renderUserMessage } from '../ui/message-renderer';
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
     * Accepts the message text and whether it was entered in Markdown mode.
     */
    public handleSendMessage(message: string, isMarkdown: boolean): void {
        if (!message.trim()) return;

        console.log(`[MessageHandler] Handling send: "${message}", Markdown: ${isMarkdown}`);

        // Add user message to UI FIRST, using the isMarkdown flag
        this.addMessage(message, 'user', isMarkdown); // Pass isMarkdown here

        // Clear input via InputHandler (which uses UIManager)
        this.inputHandler.clearInput(); // Corrected method name

        // Send message to backend API and handle streaming response
        this.streamAndRenderResponse(message); 
    }

    /**
     * Sends an automatic message (e.g., 'confirmed', 'rejected')
     * to the backend and handles the streaming response.
     * Also adds the user's confirmation/rejection action and a separator to the UI.
     */
    public handleSendAutoMessage(message: string): void {
        if (!message.trim()) return;

        // Add the user's action ('Confirmed' or 'Rejected') to the UI immediately
        const userDisplayMessage = message.charAt(0).toUpperCase() + message.slice(1);
        // Explicitly false for isMarkdown, true for isAuto
        this.addMessage(userDisplayMessage, 'user', false, true); 

        // Create and add the separator element
        console.log('[MessageHandler] Creating action separator element...'); // Debug log
        const separatorDiv = document.createElement('div');
        separatorDiv.className = 'jp-llm-ext-action-separator'; // Add a class for potential styling
        separatorDiv.style.textAlign = 'center'; // Basic styling
        separatorDiv.style.margin = '10px 0';   // Add some vertical space
        separatorDiv.style.fontSize = '0.9em';
        separatorDiv.style.color = 'var(--jp-ui-font-color2, grey)'; // Use JupyterLab theme variable

        if (message === 'confirmed') {
            separatorDiv.textContent = '--------✅ Confirmed--------';
        } else if (message === 'rejected') {
            separatorDiv.textContent = '--------❌ Rejected--------';
        } else {
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
    private addMessage(
        text: string, 
        sender: 'user' | 'bot', 
        isMarkdown: boolean = false, // Default false, overridden below
        isAuto: boolean = false // Flag for auto messages like confirm/reject
    ): void {
        console.log(`[MessageHandler] Adding message: Sender=${sender}, Markdown=${isMarkdown}, Auto=${isAuto}`);
        
        let messageElement: HTMLElement;
        if (sender === 'user') {
             // Pass the isMarkdown option to the renderer
            messageElement = renderUserMessage(text, { isMarkdown }, this.rendererCallbacks);
        } else {
            // Bot messages usually are markdown unless specified otherwise
            // Handle auto messages specifically if they shouldn't be parsed as markdown
            const botIsMarkdown = !isAuto; // Assume auto messages aren't markdown
            messageElement = renderBotMessage(text, { isMarkdown: botIsMarkdown }, this.rendererCallbacks);
        }

        this.uiManager.addChatMessageElement(messageElement);

        // Don't save internal 'confirmed'/'rejected' messages to history
        if (!isAuto) {
            // Add isMarkdown back to the saved message state
            const chatMessage: ChatMessage = { sender, text, isMarkdown }; 
            this.chatState.addMessageToCurrentChat(chatMessage);
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